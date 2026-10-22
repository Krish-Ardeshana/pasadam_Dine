import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersService } from './orders.service.js';
import { OrderStatus, OrderPaymentStatus, OrderType, RestaurantApprovalStatus, Role } from '../../common/enums/index.js';

describe('OrdersService & Tenant Isolation', () => {
  let ordersService: OrdersService;
  let mockOrderModel: any;
  let mockRestaurantModel: any;
  let mockDishModel: any;
  let mockAuditService: any;
  let mockOrderEventsService: any;

  const restaurantAId = new Types.ObjectId();
  const restaurantBId = new Types.ObjectId();

  const userRestaurantA = {
    userId: new Types.ObjectId().toString(),
    email: 'managerA@prasadam.com',
    role: Role.RESTAURANT_MANAGER,
    restaurantAssignments: [restaurantAId.toString()],
    permissions: [],
  };

  const userRestaurantB = {
    userId: new Types.ObjectId().toString(),
    email: 'managerB@prasadam.com',
    role: Role.RESTAURANT_MANAGER,
    restaurantAssignments: [restaurantBId.toString()],
    permissions: [],
  };

  const activeRestaurantA = {
    _id: restaurantAId,
    name: 'Govinda Dining',
    slug: 'govinda-dining',
    isActive: true,
    approvalStatus: RestaurantApprovalStatus.APPROVED,
    settings: { currency: 'INR', orderAcceptance: true },
  };

  const dishA1 = {
    _id: new Types.ObjectId(),
    restaurantId: restaurantAId,
    name: 'Sattvic Thali',
    price: 250,
    currency: 'INR',
    isPublished: true,
    isAvailable: true,
  };

  const dishB1 = {
    _id: new Types.ObjectId(),
    restaurantId: restaurantBId,
    name: 'Bhakti Kheer',
    price: 120,
    currency: 'INR',
    isPublished: true,
    isAvailable: true,
  };

  beforeEach(() => {
    mockOrderModel = {
      create: vi.fn((data) => ({
        ...data,
        _id: new Types.ObjectId(),
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ ...data }),
      })),
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
        lean: vi.fn().mockResolvedValue(null),
      }),
      findById: vi.fn(),
      find: vi.fn(),
      countDocuments: vi.fn(),
    };

    mockRestaurantModel = {
      findOne: vi.fn((query) => ({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(
            query.slug === 'govinda-dining' ? activeRestaurantA : null,
          ),
        }),
        exec: vi.fn().mockResolvedValue(
          query.slug === 'govinda-dining' ? activeRestaurantA : null,
        ),
      })),
      findById: vi.fn((id: string) => ({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(
            id.toString() === restaurantAId.toString()
              ? { _id: restaurantAId, ownerId: new Types.ObjectId(userRestaurantA.userId) }
              : { _id: restaurantBId, ownerId: new Types.ObjectId(userRestaurantB.userId) },
          ),
        }),
      })),
    };

    mockDishModel = {
      find: vi.fn().mockReturnValue({
        exec: vi.fn().mockImplementation(() => {
          return [dishA1, dishB1];
        }),
      }),
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue({}),
    };

    mockOrderEventsService = {
      emit: vi.fn(),
    };

    ordersService = new OrdersService(
      mockOrderModel,
      mockRestaurantModel,
      mockDishModel,
      mockAuditService,
      mockOrderEventsService,
    );
  });

  describe('createPublicOrder (Server Pricing & Validation)', () => {
    it('should calculate server-side price snapshot accurately and ignore manipulated frontend prices', async () => {
      mockDishModel.find.mockReturnValue({
        exec: vi.fn().mockResolvedValue([dishA1]),
      });

      const orderDto = {
        orderType: OrderType.DINE_IN,
        tableNumber: 'Table 7',
        customerName: 'Radha Raman',
        customerPhone: '+919876543210',
        items: [
          {
            dishId: dishA1._id.toString(),
            quantity: 3,
            instructions: 'Less spice',
          },
        ],
      };

      await ordersService.createPublicOrder('govinda-dining', orderDto as any);

      expect(mockOrderModel.create).toHaveBeenCalled();
      const createdPayload = mockOrderModel.create.mock.calls[0][0];

      // Unit price is strictly from DB dish ($250), quantity = 3 => subtotal = 750
      expect(createdPayload.pricing.subtotal).toBe(750);
      expect(createdPayload.pricing.total).toBe(750);
      expect(createdPayload.pricing.currency).toBe('INR');
      expect(createdPayload.status).toBe(OrderStatus.PENDING);
      expect(createdPayload.paymentStatus).toBe(OrderPaymentStatus.UNPAID);
      expect(createdPayload.tableNumber).toBe('Table 7');
      expect(mockOrderEventsService.emit).toHaveBeenCalledWith(
        restaurantAId.toString(),
        'ORDER_CREATED',
        expect.anything(),
      );
    });

    it('should strictly reject orders containing dishes belonging to another restaurant (Cross-Tenant Attack)', async () => {
      // Dish B belongs to Restaurant B, but customer is submitting to Restaurant A
      mockDishModel.find.mockReturnValue({
        exec: vi.fn().mockResolvedValue([dishB1]),
      });

      const attackDto = {
        orderType: OrderType.DINE_IN,
        tableNumber: 'Table 1',
        items: [
          {
            dishId: dishB1._id.toString(),
            quantity: 1,
          },
        ],
      };

      await expect(
        ordersService.createPublicOrder('govinda-dining', attackDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject orders when dish is out of stock (isAvailable: false)', async () => {
      const soldOutDish = { ...dishA1, isAvailable: false };
      mockDishModel.find.mockReturnValue({
        exec: vi.fn().mockResolvedValue([soldOutDish]),
      });

      const orderDto = {
        items: [{ dishId: soldOutDish._id.toString(), quantity: 1 }],
      };

      await expect(
        ordersService.createPublicOrder('govinda-dining', orderDto as any),
      ).rejects.toThrow(/out of stock/i);
    });

    it('should reject orders when dish is unpublished (isPublished: false)', async () => {
      const unpublishedDish = { ...dishA1, isPublished: false };
      mockDishModel.find.mockReturnValue({
        exec: vi.fn().mockResolvedValue([unpublishedDish]),
      });

      const orderDto = {
        items: [{ dishId: unpublishedDish._id.toString(), quantity: 1 }],
      };

      await expect(
        ordersService.createPublicOrder('govinda-dining', orderDto as any),
      ).rejects.toThrow(/unpublished/i);
    });
  });

  describe('updateStatus (State Machine & RBAC Tenant Validation)', () => {
    it('should permit valid forward lifecycle transitions: PENDING -> ACCEPTED -> PREPARING -> READY -> SERVED', async () => {
      const existingOrder: any = {
        _id: new Types.ObjectId(),
        restaurantId: restaurantAId,
        orderNumber: 'ORD-20261022-A101',
        status: OrderStatus.PENDING,
        statusHistory: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockOrderModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(existingOrder),
      });

      // 1. PENDING -> ACCEPTED
      await ordersService.updateStatus(
        userRestaurantA as any,
        restaurantAId.toString(),
        existingOrder._id.toString(),
        { status: OrderStatus.ACCEPTED, reason: 'Kitchen confirmed' },
      );

      expect(existingOrder.status).toBe(OrderStatus.ACCEPTED);
      expect(mockOrderEventsService.emit).toHaveBeenCalledWith(
        restaurantAId.toString(),
        'ORDER_STATUS_CHANGED',
        existingOrder,
      );

      // 2. ACCEPTED -> PREPARING
      await ordersService.updateStatus(
        userRestaurantA as any,
        restaurantAId.toString(),
        existingOrder._id.toString(),
        { status: OrderStatus.PREPARING },
      );
      expect(existingOrder.status).toBe(OrderStatus.PREPARING);

      // 3. PREPARING -> READY
      await ordersService.updateStatus(
        userRestaurantA as any,
        restaurantAId.toString(),
        existingOrder._id.toString(),
        { status: OrderStatus.READY },
      );
      expect(existingOrder.status).toBe(OrderStatus.READY);

      // 4. READY -> SERVED
      await ordersService.updateStatus(
        userRestaurantA as any,
        restaurantAId.toString(),
        existingOrder._id.toString(),
        { status: OrderStatus.SERVED },
      );
      expect(existingOrder.status).toBe(OrderStatus.SERVED);
    });

    it('should reject invalid status skips (e.g., PENDING directly to SERVED)', async () => {
      const existingOrder: any = {
        _id: new Types.ObjectId(),
        restaurantId: restaurantAId,
        status: OrderStatus.PENDING,
        statusHistory: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockOrderModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(existingOrder),
      });

      await expect(
        ordersService.updateStatus(
          userRestaurantA as any,
          restaurantAId.toString(),
          existingOrder._id.toString(),
          { status: OrderStatus.SERVED },
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject status changes on terminal SERVED orders', async () => {
      const servedOrder: any = {
        _id: new Types.ObjectId(),
        restaurantId: restaurantAId,
        status: OrderStatus.SERVED,
        statusHistory: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockOrderModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(servedOrder),
      });

      await expect(
        ordersService.updateStatus(
          userRestaurantA as any,
          restaurantAId.toString(),
          servedOrder._id.toString(),
          { status: OrderStatus.PENDING },
        ),
      ).rejects.toThrow(/already SERVED/i);
    });

    it('should prevent cross-restaurant managers from modifying orders of another tenant', async () => {
      // userRestaurantB attempting to modify restaurantA's order
      await expect(
        ordersService.updateStatus(
          userRestaurantB as any,
          restaurantAId.toString(),
          new Types.ObjectId().toString(),
          { status: OrderStatus.ACCEPTED },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should prevent access if order does not belong to requested restaurant parameter (Anti-IDOR)', async () => {
      const foreignOrder: any = {
        _id: new Types.ObjectId(),
        restaurantId: restaurantBId, // Order belongs to B
        status: OrderStatus.PENDING,
      };

      mockOrderModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(foreignOrder),
      });

      // User A requests it through Restaurant A's route
      await expect(
        ordersService.findOne(
          userRestaurantA as any,
          restaurantAId.toString(),
          foreignOrder._id.toString(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPublicOrderStatus & Public Information Sanitization', () => {
    it('should return order and minimal restaurant metadata when order exists for the requested restaurant', async () => {
      const publicOrder = {
        _id: new Types.ObjectId(),
        restaurantId: restaurantAId,
        orderNumber: 'ORD-20261022-X999',
        status: OrderStatus.PREPARING,
        items: [{ name: 'Sattvic Thali', quantity: 2, subtotal: 500 }],
        pricing: { total: 500, currency: 'INR' },
      };

      mockOrderModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue(publicOrder),
      });

      const result = await ordersService.getPublicOrderStatus('govinda-dining', 'ORD-20261022-X999');

      expect(result.order.orderNumber).toBe('ORD-20261022-X999');
      expect(result.restaurant.name).toBe('Govinda Dining');
      expect(result.restaurant.slug).toBe('govinda-dining');
    });

    it('should reject lookup with NotFoundException if order does not exist or belongs to another restaurant', async () => {
      mockOrderModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(
        ordersService.getPublicOrderStatus('govinda-dining', 'ORD-UNKNOWN-0000'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});


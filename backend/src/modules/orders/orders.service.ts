import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderDocument,
  Restaurant,
  RestaurantDocument,
  Dish,
  DishDocument,
} from '../../database/schemas/index.js';
import {
  OrderStatus,
  OrderPaymentStatus,
  OrderPaymentMethod,
  OrderType,
  RestaurantApprovalStatus,
} from '../../common/enums/index.js';
import { TenantValidator } from '../../common/utils/tenant.util.js';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService } from '../audit/audit.service.js';
import { OrderEventsService } from './order-events.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { OrderQueryDto } from './dto/order-query.dto.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Dish.name)
    private readonly dishModel: Model<DishDocument>,
    private readonly auditService: AuditService,
    private readonly orderEventsService: OrderEventsService,
  ) {}

  /**
   * Helper to generate a human-readable unique order number: ORD-YYYYMMDD-XXXX
   */
  private async generateUniqueOrderNumber(): Promise<string> {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    for (let attempts = 0; attempts < 10; attempts++) {
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const candidate = `ORD-${dateStr}-${randomSuffix}`;
      const existing = await this.orderModel.findOne({ orderNumber: candidate }).exec();
      if (!existing) {
        return candidate;
      }
    }
    // Fallback using timestamp high-res
    return `ORD-${dateStr}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Public Order Placement:
   * Validates restaurant, items, inventory status, calculates pricing server-side,
   * creates order record, logs audit event, and broadcasts real-time event.
   */
  async createPublicOrder(
    restaurantSlug: string,
    dto: CreateOrderDto,
    meta?: { ip?: string; userAgent?: string },
  ) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const restaurant = await this.restaurantModel
      .findOne({ slug: restaurantSlug.toLowerCase().trim() })
      .exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant '${restaurantSlug}' not found`);
    }

    if (!restaurant.isActive || restaurant.approvalStatus !== RestaurantApprovalStatus.APPROVED) {
      throw new BadRequestException('This restaurant is currently not accepting dining orders');
    }

    // Deduplicate and validate dish IDs
    const dishIds = dto.items.map((i) => {
      try {
        return new Types.ObjectId(i.dishId);
      } catch {
        throw new BadRequestException(`Invalid dish identifier: ${i.dishId}`);
      }
    });

    const dishes = await this.dishModel.find({ _id: { $in: dishIds } }).exec();
    const dishMap = new Map<string, DishDocument>();
    for (const d of dishes) {
      dishMap.set(d._id.toString(), d);
    }

    // Verify all dishes exist, belong to this restaurant, and are available
    let calculatedSubtotal = 0;
    const orderItems: Array<{
      dishId: Types.ObjectId;
      name: string;
      price: number;
      quantity: number;
      subtotal: number;
      instructions: string;
    }> = [];

    for (const itemDto of dto.items) {
      const dish = dishMap.get(itemDto.dishId);
      if (!dish) {
        throw new NotFoundException(`Dish with ID ${itemDto.dishId} was not found`);
      }

      // Cross-tenant verification: Dish MUST belong to this restaurant
      if (dish.restaurantId.toString() !== restaurant._id.toString()) {
        this.logger.warn(
          `Cross-tenant order attempt blocked: Dish ${dish._id.toString()} belongs to ${dish.restaurantId.toString()}, requested in restaurant ${restaurant._id.toString()}`,
        );
        throw new BadRequestException('Selected dish does not belong to this restaurant');
      }

      if (!dish.isPublished) {
        throw new BadRequestException(`Dish '${dish.name}' is currently unpublished`);
      }

      if (!dish.isAvailable) {
        throw new BadRequestException(`Dish '${dish.name}' is currently out of stock`);
      }

      const unitPrice = dish.price;
      const quantity = itemDto.quantity;
      const itemSubtotal = Number((unitPrice * quantity).toFixed(2));
      calculatedSubtotal = Number((calculatedSubtotal + itemSubtotal).toFixed(2));

      orderItems.push({
        dishId: dish._id as Types.ObjectId,
        name: dish.name,
        price: unitPrice,
        quantity,
        subtotal: itemSubtotal,
        instructions: (itemDto.instructions || '').trim(),
      });
    }

    const orderNumber = await this.generateUniqueOrderNumber();
    const currency = restaurant.settings?.currency || dishes[0]?.currency || 'USD';
    const total = calculatedSubtotal; // Fees/taxes can be expanded here

    const initialHistory = [
      {
        status: OrderStatus.PENDING,
        changedAt: new Date(),
        changedBy: 'CUSTOMER',
        reason: 'Order submitted by customer via digital menu',
      },
    ];

    const order = await this.orderModel.create({
      restaurantId: restaurant._id,
      orderNumber,
      orderType: dto.orderType || OrderType.DINE_IN,
      tableNumber: (dto.tableNumber || '').trim(),
      customerName: (dto.customerName || '').trim(),
      customerPhone: (dto.customerPhone || '').trim(),
      specialInstructions: (dto.specialInstructions || '').trim(),
      items: orderItems,
      pricing: {
        subtotal: calculatedSubtotal,
        tax: 0,
        serviceFee: 0,
        total,
        currency,
      },
      status: OrderStatus.PENDING,
      paymentStatus: OrderPaymentStatus.UNPAID,
      paymentMethod: dto.paymentMethod || OrderPaymentMethod.PAY_AT_TABLE,
      statusHistory: initialHistory,
    });

    // Record audit event
    await this.auditService.log({
      actorId: new Types.ObjectId(),
      restaurantId: restaurant._id,
      action: 'ORDER_PLACED',
      entityType: 'Order',
      entityId: order._id.toString(),
      safeMetadata: {
        orderNumber: order.orderNumber,
        total,
        itemCount: orderItems.length,
        tableNumber: order.tableNumber,
      },
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });

    // Publish to real-time stream for restaurant / KDS
    this.orderEventsService.emit(restaurant._id.toString(), 'ORDER_CREATED', order);

    return order;
  }

  /**
   * Public Order Lookup by Order Number:
   * Enables customers to poll or view their live order status safely.
   */
  async getPublicOrderStatus(restaurantSlug: string, orderNumber: string) {
    const restaurant = await this.restaurantModel
      .findOne({ slug: restaurantSlug.toLowerCase().trim() })
      .select('_id name slug settings')
      .exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant '${restaurantSlug}' not found`);
    }

    const order = await this.orderModel
      .findOne({
        restaurantId: restaurant._id,
        orderNumber: orderNumber.toUpperCase().trim(),
      })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order '${orderNumber}' not found for this restaurant`);
    }

    return {
      order,
      restaurant: {
        name: restaurant.name,
        slug: restaurant.slug,
      },
    };
  }

  /**
   * Restaurant Scoped: Find all orders with pagination and filtering
   */
  async findAll(user: AuthenticatedUser, restaurantId: string, query: OrderQueryDto) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const filter: Record<string, any> = {
      restaurantId: new Types.ObjectId(restaurantId),
    };

    if (query.status) {
      filter.status = query.status;
    } else if (query.activeOnly) {
      filter.status = {
        $in: [
          OrderStatus.PENDING,
          OrderStatus.ACCEPTED,
          OrderStatus.PREPARING,
          OrderStatus.READY,
        ],
      };
    }

    if (query.orderType) {
      filter.orderType = query.orderType;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { orderNumber: searchRegex },
        { customerName: searchRegex },
        { tableNumber: searchRegex },
      ];
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Restaurant Scoped: Get specific order detail with anti-IDOR verification
   */
  async findOne(user: AuthenticatedUser, restaurantId: string, orderId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID '${orderId}' not found`);
    }

    if (order.restaurantId.toString() !== restaurantId.toString()) {
      throw new NotFoundException(`Order not found in restaurant ${restaurantId}`);
    }

    return order;
  }

  /**
   * Validated Status Transition:
   * Enforces strict state machine rules and records audit trails.
   */
  async updateStatus(
    user: AuthenticatedUser,
    restaurantId: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID '${orderId}' not found`);
    }

    if (order.restaurantId.toString() !== restaurantId.toString()) {
      throw new NotFoundException(`Order not found in restaurant ${restaurantId}`);
    }

    const currentStatus = order.status;
    const targetStatus = dto.status;

    // Idempotent return if already in target status
    if (currentStatus === targetStatus) {
      return order;
    }

    // Terminal state protection
    if (currentStatus === OrderStatus.SERVED || currentStatus === OrderStatus.CANCELLED) {
      throw new BadRequestException(
        `Cannot change status of an order that is already ${currentStatus}`,
      );
    }

    // Lifecycle validation state machine
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
      [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.SERVED, OrderStatus.CANCELLED],
      [OrderStatus.SERVED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const validTargets = allowedTransitions[currentStatus] || [];
    if (!validTargets.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed: ${validTargets.join(', ') || 'none'}`,
      );
    }

    order.status = targetStatus;
    order.statusHistory.push({
      status: targetStatus,
      changedAt: new Date(),
      changedBy: user.email || user.userId.toString(),
      reason: (dto.reason || '').trim(),
    });

    await order.save();

    // Audit log
    await this.auditService.log({
      actorId: user.userId,
      restaurantId: order.restaurantId,
      action: 'ORDER_STATUS_UPDATED',
      entityType: 'Order',
      entityId: order._id.toString(),
      safeMetadata: {
        orderNumber: order.orderNumber,
        previousStatus: currentStatus,
        newStatus: targetStatus,
        reason: dto.reason,
      },
    });

    // Real-time event for KDS and dashboards
    this.orderEventsService.emit(
      order.restaurantId.toString(),
      'ORDER_STATUS_CHANGED',
      order,
    );

    return order;
  }
}

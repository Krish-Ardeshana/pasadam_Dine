import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DishesService } from './dishes.service.js';
import { Role } from '../../common/enums/index.js';

describe('DishesService & Tenant Isolation', () => {
  let dishesService: DishesService;
  let mockDishModel: any;
  let mockCategoryModel: any;
  let mockRestaurantModel: any;
  let mockAuditService: any;

  const restaurantAId = new Types.ObjectId().toString();
  const restaurantBId = new Types.ObjectId().toString();

  const userRestaurantA = {
    userId: new Types.ObjectId().toString(),
    email: 'chefA@restaurant.com',
    role: Role.RESTAURANT_MANAGER,
    restaurantAssignments: [restaurantAId],
    permissions: [],
  };

  const userRestaurantB = {
    userId: new Types.ObjectId().toString(),
    email: 'chefB@restaurant.com',
    role: Role.RESTAURANT_MANAGER,
    restaurantAssignments: [restaurantBId],
    permissions: [],
  };

  beforeEach(() => {
    mockDishModel = {
      create: vi.fn(),
      findOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
      find: vi.fn(),
      countDocuments: vi.fn(),
    };

    mockCategoryModel = {
      findOne: vi.fn(),
    };

    mockRestaurantModel = {
      findById: vi.fn((id: string) => {
        const isRestA = id.toString() === restaurantAId;
        return {
          select: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue({
              _id: new Types.ObjectId(id),
              ownerId: isRestA
                ? new Types.ObjectId(userRestaurantA.userId)
                : new Types.ObjectId(userRestaurantB.userId),
            }),
          }),
        };
      }),
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue({}),
    };

    dishesService = new DishesService(
      mockDishModel,
      mockCategoryModel,
      mockRestaurantModel,
      mockAuditService,
    );
  });

  describe('create and category relationship verification', () => {
    it('should create dish when category belongs to the same restaurant', async () => {
      const categoryId = new Types.ObjectId().toString();

      // Category belongs to restaurantA
      mockCategoryModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(categoryId),
          restaurantId: new Types.ObjectId(restaurantAId),
          name: 'Main Courses',
        }),
      });

      mockDishModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });
      mockDishModel.create.mockImplementation((doc: any) =>
        Promise.resolve({ _id: new Types.ObjectId(), ...doc }),
      );

      const result = await dishesService.create(userRestaurantA, restaurantAId, {
        name: 'Govinda Dal',
        categoryId,
        price: 12.5,
        currency: 'USD',
        dietaryFlags: ['VEG', 'GLUTEN_FREE'],
      });

      expect(result.name).toBe('Govinda Dal');
      expect(result.price).toBe(12.5);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE_DISH' }),
      );
    });

    it('should reject dish creation if category does NOT belong to the restaurant', async () => {
      const foreignCategoryId = new Types.ObjectId().toString();

      // Category belongs to foreign restaurant, not restaurantA
      mockCategoryModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(
        dishesService.create(userRestaurantA, restaurantAId, {
          name: 'Unauthorized Cross-Tenant Dish',
          categoryId: foreignCategoryId,
          price: 15.0,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Tenant Isolation Defense (IDOR Prevention)', () => {
    it('should deny Restaurant A manager from modifying Restaurant B dish (ForbiddenException)', async () => {
      const dishBId = new Types.ObjectId().toString();

      await expect(
        dishesService.updatePrice(userRestaurantA, restaurantBId, dishBId, { price: 5.0 }),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        dishesService.remove(userRestaurantA, restaurantBId, dishBId),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        dishesService.publish(userRestaurantA, restaurantBId, dishBId, { isPublished: true }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow authorized restaurant manager to update price and log audit', async () => {
      const dishAId = new Types.ObjectId().toString();

      mockDishModel.findOneAndUpdate.mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(dishAId),
          restaurantId: new Types.ObjectId(restaurantAId),
          price: 18.0,
        }),
      });

      const updated = await dishesService.updatePrice(userRestaurantA, restaurantAId, dishAId, {
        price: 18.0,
      });

      expect(updated.price).toBe(18.0);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE_DISH_PRICE',
          safeMetadata: { newPrice: 18.0 },
        }),
      );
    });

    it('should allow authorized restaurant manager to update availability', async () => {
      const dishAId = new Types.ObjectId().toString();

      mockDishModel.findOneAndUpdate.mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(dishAId),
          restaurantId: new Types.ObjectId(restaurantAId),
          isAvailable: false,
        }),
      });

      const updated = await dishesService.updateAvailability(
        userRestaurantA,
        restaurantAId,
        dishAId,
        { isAvailable: false },
      );

      expect(updated.isAvailable).toBe(false);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE_DISH_AVAILABILITY',
          safeMetadata: { isAvailable: false },
        }),
      );
    });
  });
});

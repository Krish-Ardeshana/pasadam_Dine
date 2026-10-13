import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DishesService } from '../modules/dishes/dishes.service.js';
import { CategoriesService } from '../modules/categories/categories.service.js';
import { Role, CategoryStatus } from '../common/enums/index.js';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator.js';

describe('Multi-Restaurant Tenant Isolation & Anti-IDOR Integration Tests', () => {
  const restaurantAId = new Types.ObjectId().toString();
  const restaurantBId = new Types.ObjectId().toString();

  const userRestaurantA: AuthenticatedUser = {
    userId: new Types.ObjectId().toString(),
    email: 'manager@restaurant-a.com',
    role: Role.RESTAURANT_MANAGER,
    restaurantAssignments: [restaurantAId],
    permissions: [],
  };

  const userRestaurantB: AuthenticatedUser = {
    userId: new Types.ObjectId().toString(),
    email: 'manager@restaurant-b.com',
    role: Role.RESTAURANT_MANAGER,
    restaurantAssignments: [restaurantBId],
    permissions: [],
  };

  const superAdminUser: AuthenticatedUser = {
    userId: new Types.ObjectId().toString(),
    email: 'admin@prasadamdine.com',
    role: Role.SUPER_ADMIN,
    restaurantAssignments: [],
    permissions: ['*'],
  };

  let dishesService: DishesService;
  let categoriesService: CategoriesService;

  let mockDishModel: any;
  let mockCategoryModel: any;
  let mockRestaurantModel: any;
  let mockAuditService: any;

  beforeEach(() => {
    mockDishModel = {
      findOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
      create: vi.fn(),
      countDocuments: vi.fn(),
    };

    mockCategoryModel = {
      findOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
      create: vi.fn(),
    };

    mockRestaurantModel = {
      findById: vi.fn((id: string) => ({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue({
            _id: new Types.ObjectId(id),
            ownerId:
              id.toString() === restaurantAId
                ? new Types.ObjectId(userRestaurantA.userId)
                : new Types.ObjectId(userRestaurantB.userId),
            isActive: true,
          }),
        }),
      })),
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

    categoriesService = new CategoriesService(
      mockCategoryModel,
      mockDishModel,
      mockRestaurantModel,
      mockAuditService,
    );
  });

  describe('Cross-Tenant Category Attacks', () => {
    it('Scenario 1: Manager A tries to create category inside Restaurant B -> Denied', async () => {
      await expect(
        categoriesService.create(userRestaurantA, restaurantBId, {
          name: 'Intrusion Category',
          status: CategoryStatus.ACTIVE,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Scenario 2: Manager A tries to update Restaurant B category -> Denied', async () => {
      const categoryBId = new Types.ObjectId().toString();

      await expect(
        categoriesService.update(userRestaurantA, restaurantBId, categoryBId, {
          name: 'Malicious Name',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Scenario 3: Manager A tries to delete Restaurant B category -> Denied', async () => {
      const categoryBId = new Types.ObjectId().toString();

      await expect(
        categoriesService.remove(userRestaurantA, restaurantBId, categoryBId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Cross-Tenant Dish Attacks & IDOR Defense', () => {
    it('Scenario 4: Manager A attempts to associate Restaurant A dish with Restaurant B category -> Rejected', async () => {
      const categoryBId = new Types.ObjectId().toString();

      // Category belongs to Restaurant B, so search scoped to Restaurant A returns null
      mockCategoryModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(
        dishesService.create(userRestaurantA, restaurantAId, {
          name: 'Cross Linked Dish',
          categoryId: categoryBId,
          price: 20.0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Scenario 5: Manager A attempts to change price of Restaurant B dish -> Denied with ForbiddenException', async () => {
      const dishBId = new Types.ObjectId().toString();

      await expect(
        dishesService.updatePrice(userRestaurantA, restaurantBId, dishBId, { price: 0.01 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Scenario 6: Manager B attempts to unpublish Restaurant A dish -> Denied with ForbiddenException', async () => {
      const dishAId = new Types.ObjectId().toString();

      await expect(
        dishesService.publish(userRestaurantB, restaurantAId, dishAId, { isPublished: false }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Scenario 7: Super Admin has platform-wide authority over both Restaurant A and Restaurant B', async () => {
      const dishAId = new Types.ObjectId().toString();
      mockDishModel.findOneAndUpdate.mockReturnValue({
        exec: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(dishAId),
          restaurantId: new Types.ObjectId(restaurantAId),
          price: 25.0,
        }),
      });

      const updated = await dishesService.updatePrice(superAdminUser, restaurantAId, dishAId, {
        price: 25.0,
      });

      expect(updated.price).toBe(25.0);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CategoriesService } from './categories.service.js';
import { CategoryStatus, Role } from '../../common/enums/index.js';

describe('CategoriesService', () => {
  let categoriesService: CategoriesService;
  let mockCategoryModel: any;
  let mockDishModel: any;
  let mockRestaurantModel: any;
  let mockAuditService: any;

  const mockRestaurantId = new Types.ObjectId().toString();
  const mockCategoryId = new Types.ObjectId().toString();

  const mockUser = {
    userId: new Types.ObjectId().toString(),
    email: 'manager@restaurant.com',
    role: Role.RESTAURANT_MANAGER,
    restaurantAssignments: [mockRestaurantId],
    permissions: [],
  };

  beforeEach(() => {
    mockCategoryModel = {
      findOne: vi.fn(),
      create: vi.fn(),
      find: vi.fn(),
      findOneAndUpdate: vi.fn(),
      findOneAndDelete: vi.fn(),
      bulkWrite: vi.fn(),
    };

    mockDishModel = {
      countDocuments: vi.fn(),
    };

    mockRestaurantModel = {
      findById: vi.fn(),
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue({}),
    };

    categoriesService = new CategoriesService(
      mockCategoryModel,
      mockDishModel,
      mockRestaurantModel,
      mockAuditService,
    );
  });

  describe('create', () => {
    it('should create category successfully', async () => {
      mockCategoryModel.findOne.mockReturnValue({ exec: vi.fn().mockResolvedValue(null) });
      mockCategoryModel.create.mockImplementation((doc: any) =>
        Promise.resolve({ _id: mockCategoryId, ...doc }),
      );

      const result = await categoriesService.create(mockUser, mockRestaurantId, {
        name: 'Beverages',
        description: 'Herbal teas and fresh juices',
        displayOrder: 1,
        status: CategoryStatus.ACTIVE,
      });

      expect(result.name).toBe('Beverages');
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE_CATEGORY' }),
      );
    });

    it('should reject category creation with duplicate name in the same restaurant', async () => {
      mockCategoryModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue({ name: 'Beverages' }),
      });

      await expect(
        categoriesService.create(mockUser, mockRestaurantId, {
          name: 'Beverages',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should prevent deletion if dishes are associated with the category', async () => {
      mockDishModel.countDocuments.mockReturnValue({
        exec: vi.fn().mockResolvedValue(3), // 3 dishes exist
      });

      await expect(
        categoriesService.remove(mockUser, mockRestaurantId, mockCategoryId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should delete safely if no dishes are associated', async () => {
      mockDishModel.countDocuments.mockReturnValue({
        exec: vi.fn().mockResolvedValue(0), // 0 dishes
      });

      mockCategoryModel.findOneAndDelete.mockReturnValue({
        exec: vi.fn().mockResolvedValue({ _id: mockCategoryId, name: 'Beverages' }),
      });

      const result = await categoriesService.remove(mockUser, mockRestaurantId, mockCategoryId);
      expect(result.success).toBe(true);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE_CATEGORY' }),
      );
    });
  });
});

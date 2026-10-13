import { describe, it, expect } from 'vitest';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TenantValidator } from './tenant.util.js';
import { Role } from '../enums/index.js';
import { AuthenticatedUser } from '../decorators/current-user.decorator.js';

describe('TenantValidator', () => {
  const restaurantAId = new Types.ObjectId().toString();
  const restaurantBId = new Types.ObjectId().toString();

  const superAdminUser: AuthenticatedUser = {
    userId: new Types.ObjectId().toString(),
    email: 'admin@prasadam.com',
    role: Role.SUPER_ADMIN,
    restaurantAssignments: [],
    permissions: ['*'],
  };

  const restaurantAOwner: AuthenticatedUser = {
    userId: new Types.ObjectId().toString(),
    email: 'owner-a@prasadam.com',
    role: Role.RESTAURANT_OWNER,
    restaurantAssignments: [restaurantAId],
    permissions: [],
  };

  const restaurantBManager: AuthenticatedUser = {
    userId: new Types.ObjectId().toString(),
    email: 'manager-b@prasadam.com',
    role: Role.RESTAURANT_MANAGER,
    restaurantAssignments: [restaurantBId],
    permissions: [],
  };

  describe('assertRestaurantAccess', () => {
    it('should grant access to SUPER_ADMIN for any restaurant', async () => {
      await expect(
        TenantValidator.assertRestaurantAccess(superAdminUser, restaurantAId),
      ).resolves.not.toThrow();

      await expect(
        TenantValidator.assertRestaurantAccess(superAdminUser, restaurantBId),
      ).resolves.not.toThrow();
    });

    it('should grant access when restaurantId matches user assignments', async () => {
      await expect(
        TenantValidator.assertRestaurantAccess(restaurantAOwner, restaurantAId),
      ).resolves.not.toThrow();

      await expect(
        TenantValidator.assertRestaurantAccess(restaurantBManager, restaurantBId),
      ).resolves.not.toThrow();
    });

    it('should reject access (ForbiddenException) when user from Restaurant A attempts accessing Restaurant B', async () => {
      await expect(
        TenantValidator.assertRestaurantAccess(restaurantAOwner, restaurantBId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject access when Restaurant B manager attempts accessing Restaurant A', async () => {
      await expect(
        TenantValidator.assertRestaurantAccess(restaurantBManager, restaurantAId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assertCategoryBelongsToRestaurant', () => {
    it('should succeed when category restaurant matches target restaurant', () => {
      expect(() =>
        TenantValidator.assertCategoryBelongsToRestaurant(restaurantAId, restaurantAId),
      ).not.toThrow();
    });

    it('should throw BadRequestException when category belongs to another restaurant', () => {
      expect(() =>
        TenantValidator.assertCategoryBelongsToRestaurant(restaurantAId, restaurantBId),
      ).toThrow(BadRequestException);
    });
  });

  describe('assertMediaBelongsToRestaurant', () => {
    it('should succeed when media restaurant matches target restaurant', () => {
      expect(() =>
        TenantValidator.assertMediaBelongsToRestaurant(restaurantAId, restaurantAId),
      ).not.toThrow();
    });

    it('should throw BadRequestException when attaching another restaurant media', () => {
      expect(() =>
        TenantValidator.assertMediaBelongsToRestaurant(restaurantAId, restaurantBId),
      ).toThrow(BadRequestException);
    });
  });
});

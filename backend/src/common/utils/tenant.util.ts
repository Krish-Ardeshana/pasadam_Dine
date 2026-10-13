import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Role } from '../enums/index.js';
import { AuthenticatedUser } from '../decorators/current-user.decorator.js';
import { RestaurantDocument } from '../../database/schemas/index.js';

export class TenantValidator {
  /**
   * Asserts that the authenticated user has access to the specified restaurant.
   * If restaurantModel is provided and user is not super admin or in assignments,
   * verifies if user is the restaurant owner in the DB.
   */
  static async assertRestaurantAccess(
    user: AuthenticatedUser,
    restaurantId: string | Types.ObjectId,
    restaurantModel?: Model<RestaurantDocument>,
  ): Promise<void> {
    if (user.role === Role.SUPER_ADMIN) {
      return;
    }

    const rIdStr = restaurantId.toString();
    const assignedIds = (user.restaurantAssignments || []).map((id) => id.toString());

    if (assignedIds.includes(rIdStr)) {
      return;
    }

    // Check ownership directly against database if restaurantModel is provided
    if (restaurantModel) {
      const restaurant = await restaurantModel.findById(restaurantId).select('ownerId isActive approvalStatus').exec();
      if (!restaurant) {
        throw new NotFoundException(`Restaurant not found: ${rIdStr}`);
      }
      if (restaurant.ownerId && restaurant.ownerId.toString() === user.userId.toString()) {
        return;
      }
    }

    throw new ForbiddenException(`Access denied to restaurant ${rIdStr}`);
  }

  /**
   * Asserts that a category belongs to the expected restaurant.
   */
  static assertCategoryBelongsToRestaurant(
    categoryRestaurantId: string | Types.ObjectId,
    targetRestaurantId: string | Types.ObjectId,
  ): void {
    if (categoryRestaurantId.toString() !== targetRestaurantId.toString()) {
      throw new BadRequestException('Category does not belong to the specified restaurant');
    }
  }

  /**
   * Asserts that a media asset belongs to the expected restaurant.
   */
  static assertMediaBelongsToRestaurant(
    mediaRestaurantId: string | Types.ObjectId,
    targetRestaurantId: string | Types.ObjectId,
  ): void {
    if (mediaRestaurantId.toString() !== targetRestaurantId.toString()) {
      throw new BadRequestException('Media asset does not belong to the specified restaurant');
    }
  }
}

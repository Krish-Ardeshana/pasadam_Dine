import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Category,
  CategoryDocument,
  Dish,
  DishDocument,
  Restaurant,
  RestaurantDocument,
} from '../../database/schemas/index.js';
import { CreateCategoryDto, ReorderCategoriesDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { TenantValidator } from '../../common/utils/tenant.util.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Dish.name)
    private readonly dishModel: Model<DishDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    private readonly auditService: AuditService,
  ) {}

  async create(user: AuthenticatedUser, restaurantId: string, dto: CreateCategoryDto) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const rObjectId = new Types.ObjectId(restaurantId);
    const existing = await this.categoryModel.findOne({
      restaurantId: rObjectId,
      name: { $regex: new RegExp(`^${dto.name.trim()}$`, 'i') },
    }).exec();

    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists for this restaurant`);
    }

    const category = await this.categoryModel.create({
      restaurantId: rObjectId,
      name: dto.name.trim(),
      description: dto.description || '',
      displayOrder: dto.displayOrder || 0,
      status: dto.status,
    });

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'CREATE_CATEGORY',
      entityType: 'Category',
      entityId: category._id.toString(),
      safeMetadata: { name: category.name },
    });

    return category;
  }

  async findAllByRestaurant(user: AuthenticatedUser, restaurantId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    return this.categoryModel
      .find({ restaurantId: new Types.ObjectId(restaurantId) })
      .sort({ displayOrder: 1, name: 1 })
      .exec();
  }

  async findById(user: AuthenticatedUser, restaurantId: string, categoryId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const category = await this.categoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
      restaurantId: new Types.ObjectId(restaurantId),
    }).exec();

    if (!category) {
      throw new NotFoundException(`Category not found for this restaurant`);
    }

    return category;
  }

  async update(
    user: AuthenticatedUser,
    restaurantId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    if (dto.name) {
      const existing = await this.categoryModel.findOne({
        restaurantId: new Types.ObjectId(restaurantId),
        _id: { $ne: new Types.ObjectId(categoryId) },
        name: { $regex: new RegExp(`^${dto.name.trim()}$`, 'i') },
      }).exec();

      if (existing) {
        throw new ConflictException(`Another category with name "${dto.name}" already exists`);
      }
    }

    const category = await this.categoryModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(categoryId),
        restaurantId: new Types.ObjectId(restaurantId),
      },
      { $set: dto },
      { new: true },
    ).exec();

    if (!category) {
      throw new NotFoundException(`Category not found for this restaurant`);
    }

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'UPDATE_CATEGORY',
      entityType: 'Category',
      entityId: categoryId,
      safeMetadata: dto,
    });

    return category;
  }

  async reorder(user: AuthenticatedUser, restaurantId: string, dto: ReorderCategoriesDto) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const rObjectId = new Types.ObjectId(restaurantId);
    const operations = dto.orders.map((item) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(item.id), restaurantId: rObjectId },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    if (operations.length > 0) {
      await this.categoryModel.bulkWrite(operations);
    }

    return { success: true, message: 'Categories reordered successfully' };
  }

  async remove(user: AuthenticatedUser, restaurantId: string, categoryId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const rObjectId = new Types.ObjectId(restaurantId);
    const cObjectId = new Types.ObjectId(categoryId);

    // Prevent deletion if associated dishes exist
    const associatedDishesCount = await this.dishModel
      .countDocuments({ restaurantId: rObjectId, categoryId: cObjectId })
      .exec();

    if (associatedDishesCount > 0) {
      throw new BadRequestException(
        `Cannot delete category. There are ${associatedDishesCount} dishes associated with it. Please reassign or delete them first.`,
      );
    }

    const deleted = await this.categoryModel.findOneAndDelete({
      _id: cObjectId,
      restaurantId: rObjectId,
    }).exec();

    if (!deleted) {
      throw new NotFoundException(`Category not found for this restaurant`);
    }

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'DELETE_CATEGORY',
      entityType: 'Category',
      entityId: categoryId,
      safeMetadata: { name: deleted.name },
    });

    return { success: true, message: 'Category removed safely' };
  }
}

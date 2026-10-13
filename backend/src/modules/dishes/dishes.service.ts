import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Dish,
  DishDocument,
  Category,
  CategoryDocument,
  Restaurant,
  RestaurantDocument,
} from '../../database/schemas/index.js';
import { CreateDishDto } from './dto/create-dish.dto.js';
import {
  UpdateDishDto,
  UpdateDishPriceDto,
  UpdateDishAvailabilityDto,
  PublishDishDto,
  DishFilterDto,
} from './dto/update-dish.dto.js';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { TenantValidator } from '../../common/utils/tenant.util.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class DishesService {
  constructor(
    @InjectModel(Dish.name)
    private readonly dishModel: Model<DishDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    private readonly auditService: AuditService,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(user: AuthenticatedUser, restaurantId: string, dto: CreateDishDto) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const rObjectId = new Types.ObjectId(restaurantId);
    const cObjectId = new Types.ObjectId(dto.categoryId);

    // Verify category exists and belongs to this restaurant
    const category = await this.categoryModel.findOne({
      _id: cObjectId,
      restaurantId: rObjectId,
    }).exec();

    if (!category) {
      throw new BadRequestException(
        `Category ${dto.categoryId} does not exist or does not belong to this restaurant`,
      );
    }

    let slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
    const existing = await this.dishModel.findOne({
      restaurantId: rObjectId,
      slug,
    }).exec();

    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const dish = await this.dishModel.create({
      restaurantId: rObjectId,
      categoryId: cObjectId,
      name: dto.name.trim(),
      slug,
      description: dto.description || '',
      price: dto.price,
      currency: dto.currency || 'USD',
      imageUrls: dto.imageUrls || [],
      model3dUrl: dto.model3dUrl || '',
      isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
      isPublished: dto.isPublished !== undefined ? dto.isPublished : false,
      dietaryFlags: dto.dietaryFlags || [],
      displayOrder: dto.displayOrder || 0,
    });

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'CREATE_DISH',
      entityType: 'Dish',
      entityId: dish._id.toString(),
      safeMetadata: { name: dish.name, price: dish.price, categoryId: dto.categoryId },
    });

    return dish;
  }

  async findAll(user: AuthenticatedUser, restaurantId: string, filterDto: DishFilterDto) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const { page = 1, limit = 20, search, categoryId, isAvailable, isPublished, dietary } =
      filterDto;
    const filter: Record<string, any> = {
      restaurantId: new Types.ObjectId(restaurantId),
    };

    if (categoryId) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable;
    }

    if (isPublished !== undefined) {
      filter.isPublished = isPublished;
    }

    if (dietary) {
      filter.dietaryFlags = dietary;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.dishModel
        .find(filter)
        .populate('categoryId', 'name displayOrder')
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.dishModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(user: AuthenticatedUser, restaurantId: string, dishId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const dish = await this.dishModel
      .findOne({
        _id: new Types.ObjectId(dishId),
        restaurantId: new Types.ObjectId(restaurantId),
      })
      .populate('categoryId', 'name')
      .exec();

    if (!dish) {
      throw new NotFoundException(`Dish not found for this restaurant`);
    }

    return dish;
  }

  async update(
    user: AuthenticatedUser,
    restaurantId: string,
    dishId: string,
    dto: UpdateDishDto,
  ) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const rObjectId = new Types.ObjectId(restaurantId);
    const dObjectId = new Types.ObjectId(dishId);

    // If categoryId updated, verify it belongs to this restaurant
    if (dto.categoryId) {
      const category = await this.categoryModel.findOne({
        _id: new Types.ObjectId(dto.categoryId),
        restaurantId: rObjectId,
      }).exec();

      if (!category) {
        throw new BadRequestException(
          'Target category does not exist or does not belong to this restaurant',
        );
      }
    }

    // Slug update uniqueness check
    if (dto.slug) {
      const slug = this.slugify(dto.slug);
      const existing = await this.dishModel.findOne({
        restaurantId: rObjectId,
        slug,
        _id: { $ne: dObjectId },
      }).exec();

      if (existing) {
        throw new ConflictException('Another dish with this slug already exists in this restaurant');
      }
      dto.slug = slug;
    }

    const updated = await this.dishModel.findOneAndUpdate(
      { _id: dObjectId, restaurantId: rObjectId },
      { $set: dto },
      { new: true },
    ).exec();

    if (!updated) {
      throw new NotFoundException(`Dish not found for this restaurant`);
    }

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'UPDATE_DISH',
      entityType: 'Dish',
      entityId: dishId,
      safeMetadata: dto,
    });

    return updated;
  }

  async updatePrice(
    user: AuthenticatedUser,
    restaurantId: string,
    dishId: string,
    dto: UpdateDishPriceDto,
  ) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const dish = await this.dishModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(dishId),
        restaurantId: new Types.ObjectId(restaurantId),
      },
      { $set: { price: dto.price } },
      { new: true },
    ).exec();

    if (!dish) {
      throw new NotFoundException(`Dish not found for this restaurant`);
    }

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'UPDATE_DISH_PRICE',
      entityType: 'Dish',
      entityId: dishId,
      safeMetadata: { newPrice: dto.price },
    });

    return dish;
  }

  async updateAvailability(
    user: AuthenticatedUser,
    restaurantId: string,
    dishId: string,
    dto: UpdateDishAvailabilityDto,
  ) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const dish = await this.dishModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(dishId),
        restaurantId: new Types.ObjectId(restaurantId),
      },
      { $set: { isAvailable: dto.isAvailable } },
      { new: true },
    ).exec();

    if (!dish) {
      throw new NotFoundException(`Dish not found for this restaurant`);
    }

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'UPDATE_DISH_AVAILABILITY',
      entityType: 'Dish',
      entityId: dishId,
      safeMetadata: { isAvailable: dto.isAvailable },
    });

    return dish;
  }

  async publish(
    user: AuthenticatedUser,
    restaurantId: string,
    dishId: string,
    dto: PublishDishDto,
  ) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    // Validate dish has minimum required fields before publishing
    const existing = await this.dishModel.findOne({
      _id: new Types.ObjectId(dishId),
      restaurantId: new Types.ObjectId(restaurantId),
    }).exec();

    if (!existing) {
      throw new NotFoundException(`Dish not found for this restaurant`);
    }

    if (dto.isPublished && (existing.price < 0 || !existing.name)) {
      throw new BadRequestException('Cannot publish dish without valid name and price');
    }

    existing.isPublished = dto.isPublished;
    await existing.save();

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: dto.isPublished ? 'PUBLISH_DISH' : 'UNPUBLISH_DISH',
      entityType: 'Dish',
      entityId: dishId,
      safeMetadata: { isPublished: dto.isPublished },
    });

    return existing;
  }

  async remove(user: AuthenticatedUser, restaurantId: string, dishId: string) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const deleted = await this.dishModel.findOneAndDelete({
      _id: new Types.ObjectId(dishId),
      restaurantId: new Types.ObjectId(restaurantId),
    }).exec();

    if (!deleted) {
      throw new NotFoundException(`Dish not found for this restaurant`);
    }

    await this.auditService.log({
      actorId: user.userId,
      restaurantId,
      action: 'DELETE_DISH',
      entityType: 'Dish',
      entityId: dishId,
      safeMetadata: { name: deleted.name },
    });

    return { success: true, message: 'Dish removed successfully' };
  }
}

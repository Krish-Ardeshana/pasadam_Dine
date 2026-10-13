import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Restaurant,
  RestaurantDocument,
  Category,
  CategoryDocument,
  Dish,
  DishDocument,
} from '../../database/schemas/index.js';
import { RestaurantApprovalStatus, CategoryStatus } from '../../common/enums/index.js';

@Injectable()
export class PublicMenuService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Dish.name)
    private readonly dishModel: Model<DishDocument>,
  ) {}

  private async getActiveApprovedRestaurant(slug: string): Promise<RestaurantDocument> {
    const restaurant = await this.restaurantModel
      .findOne({
        slug: slug.toLowerCase().trim(),
        approvalStatus: RestaurantApprovalStatus.APPROVED,
        isActive: true,
      })
      .select('-__v')
      .exec();

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant "${slug}" not found or currently unavailable for dining`,
      );
    }

    return restaurant;
  }

  async getRestaurantProfile(slug: string) {
    const restaurant = await this.getActiveApprovedRestaurant(slug);
    return {
      id: restaurant._id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      logoUrl: restaurant.logoUrl,
      address: restaurant.address,
      contactDetails: restaurant.contactDetails,
      settings: {
        currency: restaurant.settings?.currency || 'USD',
        orderAcceptance: restaurant.settings?.orderAcceptance ?? true,
      },
    };
  }

  async getCategories(slug: string) {
    const restaurant = await this.getActiveApprovedRestaurant(slug);

    return this.categoryModel
      .find({
        restaurantId: restaurant._id,
        status: CategoryStatus.ACTIVE,
      })
      .select('name description displayOrder')
      .sort({ displayOrder: 1, name: 1 })
      .exec();
  }

  async getPublishedDishes(slug: string, categoryId?: string, dietary?: string) {
    const restaurant = await this.getActiveApprovedRestaurant(slug);

    const filter: Record<string, any> = {
      restaurantId: restaurant._id,
      isPublished: true,
      isAvailable: true,
    };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (dietary) {
      filter.dietaryFlags = dietary;
    }

    return this.dishModel
      .find(filter)
      .select('name slug description price currency imageUrls model3dUrl dietaryFlags displayOrder categoryId')
      .sort({ displayOrder: 1, name: 1 })
      .populate('categoryId', 'name')
      .exec();
  }

  async getDishBySlug(restaurantSlug: string, dishSlug: string) {
    const restaurant = await this.getActiveApprovedRestaurant(restaurantSlug);

    const dish = await this.dishModel
      .findOne({
        restaurantId: restaurant._id,
        slug: dishSlug.toLowerCase().trim(),
        isPublished: true,
      })
      .select('name slug description price currency imageUrls model3dUrl isAvailable dietaryFlags categoryId')
      .populate('categoryId', 'name')
      .exec();

    if (!dish) {
      throw new NotFoundException(`Dish "${dishSlug}" not found or unavailable`);
    }

    return {
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
      dish,
    };
  }

  async getFullMenu(slug: string) {
    const restaurant = await this.getActiveApprovedRestaurant(slug);

    const [categories, dishes] = await Promise.all([
      this.categoryModel
        .find({
          restaurantId: restaurant._id,
          status: CategoryStatus.ACTIVE,
        })
        .select('name description displayOrder')
        .sort({ displayOrder: 1, name: 1 })
        .exec(),
      this.dishModel
        .find({
          restaurantId: restaurant._id,
          isPublished: true,
        })
        .select('name slug description price currency imageUrls model3dUrl isAvailable dietaryFlags displayOrder categoryId')
        .sort({ displayOrder: 1, name: 1 })
        .exec(),
    ]);

    // Group dishes under categories
    const menu = categories.map((cat) => {
      const categoryDishes = dishes.filter(
        (d) => d.categoryId && d.categoryId.toString() === cat._id.toString(),
      );
      return {
        id: cat._id,
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder,
        dishes: categoryDishes,
      };
    });

    return {
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
        description: restaurant.description,
        logoUrl: restaurant.logoUrl,
        address: restaurant.address,
        contactDetails: restaurant.contactDetails,
        settings: restaurant.settings,
      },
      categories: menu,
    };
  }
}

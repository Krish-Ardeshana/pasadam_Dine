import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  User,
  UserDocument,
  Restaurant,
  RestaurantDocument,
  Category,
  CategoryDocument,
  Dish,
  DishDocument,
} from '../../database/schemas/index.js';
import { Role, UserStatus, RestaurantApprovalStatus, CategoryStatus } from '../../common/enums/index.js';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Dish.name)
    private readonly dishModel: Model<DishDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.provisionSuperAdmin();
    await this.provisionDemoRestaurantAndOwner();
  }

  async provisionSuperAdmin() {
    try {
      const email = this.configService.get<string>('superAdmin.email');
      const password = this.configService.get<string>('superAdmin.password');
      const name = this.configService.get<string>('superAdmin.name');

      if (!email || !password) {
        this.logger.warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set. Skipping bootstrap.');
        return;
      }

      const existingAdmin = await this.userModel.findOne({ email }).exec();
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await this.userModel.create({
          name: name || 'Platform Administrator',
          email,
          passwordHash,
          role: Role.SUPER_ADMIN,
          restaurantAssignments: [],
          permissions: ['*'],
          accountStatus: UserStatus.ACTIVE,
        });

        this.logger.log(`Super Admin user initialized successfully: ${email}`);
      } else {
        if (existingAdmin.role !== Role.SUPER_ADMIN || existingAdmin.accountStatus !== UserStatus.ACTIVE) {
          existingAdmin.role = Role.SUPER_ADMIN;
          existingAdmin.accountStatus = UserStatus.ACTIVE;
          await existingAdmin.save();
          this.logger.log(`Super Admin role/status refreshed for: ${email}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error bootstrapping Super Admin: ${(error as any).message}`);
    }
  }

  async provisionDemoRestaurantAndOwner() {
    try {
      const ownerEmail = 'owner@restaurant.com';
      let owner = await this.userModel.findOne({ email: ownerEmail }).exec();

      if (!owner) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Password123!', salt);

        owner = await this.userModel.create({
          name: 'Demo Restaurant Owner',
          email: ownerEmail,
          passwordHash,
          role: Role.RESTAURANT_OWNER,
          restaurantAssignments: [],
          permissions: ['restaurant:manage', 'menu:edit'],
          accountStatus: UserStatus.ACTIVE,
        });
        this.logger.log(`Demo Restaurant Owner initialized: ${ownerEmail}`);
      }

      // Check for demo restaurant
      let restaurant = await this.restaurantModel.findOne({ slug: 'prasadam-divine' }).exec();
      if (!restaurant) {
        restaurant = await this.restaurantModel.create({
          name: 'Prasadam Divine Heritage',
          slug: 'prasadam-divine',
          description: 'Authentic pure vegetarian culinary offerings prepared with devotion and ancient recipes.',
          ownerId: owner._id,
          approvalStatus: RestaurantApprovalStatus.APPROVED,
          isActive: true,
          contactDetails: {
            phone: '+1 (555) 234-5678',
            email: 'contact@prasadamdivine.com',
            website: 'https://prasadamdivine.com',
          },
          address: {
            street: '108 Temple View Road',
            city: 'San Jose',
            country: 'USA',
          },
          settings: {
            currency: 'USD',
            orderAcceptance: true,
          },
        });
        this.logger.log(`Demo Restaurant created: ${restaurant.name} (/r/${restaurant.slug})`);
      }

      // Ensure owner is assigned to this restaurant
      const restaurantIdStr = restaurant._id.toString();
      const currentAssignments = (owner.restaurantAssignments || []).map((id) => id.toString());
      if (!currentAssignments.includes(restaurantIdStr)) {
        owner.restaurantAssignments.push(restaurant._id as any);
        await owner.save();
        this.logger.log(`Assigned restaurant ${restaurant.name} to owner ${ownerEmail}`);
      }

      // Seed sample category if none exist
      let category = await this.categoryModel.findOne({ restaurantId: restaurant._id }).exec();
      if (!category) {
        category = await this.categoryModel.create({
          name: 'Traditional Thalis & Curries',
          description: 'Authentic Indian regional specialties prepared with traditional spices',
          restaurantId: restaurant._id,
          displayOrder: 1,
          status: CategoryStatus.ACTIVE,
        });
        this.logger.log(`Demo Category created: ${category.name}`);
      }

      // Seed sample dishes if none exist
      const dishCount = await this.dishModel.countDocuments({ restaurantId: restaurant._id }).exec();
      if (dishCount === 0) {
        await this.dishModel.create([
          {
            name: 'Maharaja Devotional Thali',
            slug: 'maharaja-devotional-thali',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 18.99,
            currency: 'USD',
            description: 'Grand devotional platter featuring paneer butter masala, yellow dal tadka, jeera rice, butter naan, gulab jamun, and spiced buttermilk.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Pure Vegetarian', 'Satvik', 'Contains Dairy'],
            imageUrls: [],
            displayOrder: 1,
          },
          {
            name: 'Royal Saffron Badam Halwa',
            slug: 'royal-saffron-badam-halwa',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 7.99,
            currency: 'USD',
            description: 'Rich almond dessert slow-cooked in pure A2 ghee, infused with Kashmiri saffron strands and garnished with roasted pistachios.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Pure Vegetarian', 'Gluten-Free', 'Contains Nuts'],
            imageUrls: [],
            displayOrder: 2,
          },
        ]);
        this.logger.log('Demo Dishes created with complete pricing and dietary specs');
      }
    } catch (error) {
      this.logger.error(`Error provisioning demo restaurant: ${(error as any).message}`);
    }
  }
}

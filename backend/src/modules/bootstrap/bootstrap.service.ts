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

      // Seed sample categories if none exist
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
            description: 'Grand devotional platter featuring yellow dal tadka, shahi paneer, jeera rice, butter naan, gulab jamun, and spiced buttermilk.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Pure Vegetarian', 'Satvik', 'Contains Dairy'],
            imageUrls: ['/images/hero_thali.jpg'],
            model3dUrl: '/models/dal_curry.glb',
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
            imageUrls: ['/images/hero_thali.jpg'],
            model3dUrl: '/models/halwa_dessert.glb',
            displayOrder: 2,
          },
          {
            name: 'Artisan Margherita Pizza',
            slug: 'artisan-margherita-pizza',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 14.50,
            currency: 'USD',
            description: 'Crisp wood-fired pizza with bubbling mozzarella, rich san marzano tomato marinara, and fresh garden basil leaves.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Vegetarian', 'Contains Dairy'],
            imageUrls: ['/images/hero_thali.jpg'],
            model3dUrl: '/models/pizza.glb',
            displayOrder: 3,
          },
          {
            name: 'Gourmet Sesame Veggie Burger',
            slug: 'gourmet-sesame-veggie-burger',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 11.99,
            currency: 'USD',
            description: 'Artisan toasted sesame bun layered with melted aged cheddar, crisp lettuce, farm-fresh tomatoes, and savory roasted vegetable patty.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Vegetarian', 'Contains Dairy'],
            imageUrls: ['/images/hero_thali.jpg'],
            model3dUrl: '/models/burger.glb',
            displayOrder: 4,
          },
          {
            name: 'Hyderabadi Shahi Dum Biryani',
            slug: 'hyderabadi-shahi-dum-biryani',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 15.99,
            currency: 'USD',
            description: 'Aromatic long-grain basmati rice slow-cooked in a sealed clay pot with fragrant saffron, caramelized onions, and whole spices.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Pure Vegetarian', 'Gluten-Free'],
            imageUrls: ['/images/biryani_ar.jpg'],
            model3dUrl: '/models/biryani_rice.glb',
            displayOrder: 5,
          },
          {
            name: 'Spiced Paneer Tikka Platter',
            slug: 'spiced-paneer-tikka-platter',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 12.99,
            currency: 'USD',
            description: 'Tandoor-charred cottage cheese cubes marinated in Kashmiri chili and crushed coriander, served with mint chutney and pickled onions.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Pure Vegetarian', 'Contains Dairy'],
            imageUrls: ['/images/paneer_butter_masala.jpg'],
            model3dUrl: '/models/paneer_tikka_platter.glb',
            displayOrder: 6,
          },
          {
            name: 'Fresh Garden Kachumber Salad',
            slug: 'fresh-garden-kachumber-salad',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 6.50,
            currency: 'USD',
            description: 'Crisp diced English cucumbers, vine-ripened tomatoes, and red onions tossed with fresh cilantro, roasted cumin, and cold-pressed lemon.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Vegan', 'Gluten-Free', 'Satvik'],
            imageUrls: ['/images/hero_thali.jpg'],
            model3dUrl: '/models/salad_bowl.glb',
            displayOrder: 7,
          },
          {
            name: 'Cardamom Spiced Masala Chai',
            slug: 'cardamom-spiced-masala-chai',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 3.99,
            currency: 'USD',
            description: 'Steaming hot Assam tea brewed with crushed green cardamom, fresh ginger, cloves, and whole organic milk.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Vegetarian', 'Contains Dairy'],
            imageUrls: ['/images/hero_thali.jpg'],
            model3dUrl: '/models/masala_chai.glb',
            displayOrder: 8,
          },
          {
            name: 'Belgian Chocolate Truffle Mousse',
            slug: 'belgian-chocolate-truffle-mousse',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 8.50,
            currency: 'USD',
            description: 'Silky 70% dark Belgian chocolate mousse layered with delicate chocolate sponge and finished with cocoa dusting.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Vegetarian', 'Contains Dairy'],
            imageUrls: ['/images/hero_thali.jpg'],
            model3dUrl: '/models/chocolate_cake.glb',
            displayOrder: 9,
          },
          {
            name: 'Pure Himalayan Spring Water',
            slug: 'pure-himalayan-spring-water',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 2.50,
            currency: 'USD',
            description: 'Naturally filtered artisan spring water sourced directly from high-altitude Himalayan aquifers.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Vegan', 'Gluten-Free'],
            imageUrls: ['/images/hero_thali.jpg'],
            model3dUrl: '/models/water_bottle.glb',
            displayOrder: 10,
          },
        ]);
        this.logger.log('Demo Dishes created with verified food-specific 3D AR models');
      } else {
        // Safe migration: attach verified realistic 3D models to existing demo dishes if model3dUrl is empty
        await this.dishModel.updateOne(
          { restaurantId: restaurant._id, slug: 'maharaja-devotional-thali', $or: [{ model3dUrl: '' }, { model3dUrl: null }] },
          { $set: { model3dUrl: '/models/dal_curry.glb' } }
        ).exec();
        await this.dishModel.updateOne(
          { restaurantId: restaurant._id, slug: 'royal-saffron-badam-halwa', $or: [{ model3dUrl: '' }, { model3dUrl: null }] },
          { $set: { model3dUrl: '/models/halwa_dessert.glb' } }
        ).exec();

        // Ensure Special Gujarati Thali is provisioned with 3D AR model
        const gujaratiThali = await this.dishModel.findOne({ restaurantId: restaurant._id, slug: 'special-gujarati-thali' }).exec();
        if (!gujaratiThali) {
          await this.dishModel.create({
            name: 'Special Gujarati Thali',
            slug: 'special-gujarati-thali',
            restaurantId: restaurant._id,
            categoryId: category._id,
            price: 16.99,
            currency: 'USD',
            description: 'Authentic Kathiyawadi Gujarati Thali feast featuring Ringna No Oro, Gujarati Dal, Kadhi, Phulka Roti, Bajra No Rotlo, Khaman Dhokla, Shrikhand, and Chhas.',
            isAvailable: true,
            isPublished: true,
            dietaryFlags: ['Pure Vegetarian', 'Satvik', 'Gujarati Special'],
            imageUrls: ['/images/gujarati_thali.jpg', '/images/hero_thali.jpg'],
            model3dUrl: '/models/gujarati_thali.glb',
            displayOrder: 0,
          });
          this.logger.log('Special Gujarati Thali created with 3D model');
        } else {
          await this.dishModel.updateOne(
            { _id: gujaratiThali._id },
            {
              $set: {
                model3dUrl: '/models/gujarati_thali.glb',
                imageUrls: ['/images/gujarati_thali.jpg', '/images/hero_thali.jpg'],
                isAvailable: true,
                isPublished: true,
              },
            }
          ).exec();
        }
      }
    } catch (error) {
      this.logger.error(`Error provisioning demo restaurant: ${(error as any).message}`);
    }
  }
}

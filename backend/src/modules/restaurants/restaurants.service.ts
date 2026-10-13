import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant, RestaurantDocument, User, UserDocument } from '../../database/schemas/index.js';
import { Role, RestaurantApprovalStatus } from '../../common/enums/index.js';
import { CreateRestaurantDto } from './dto/create-restaurant.dto.js';
import { UpdateRestaurantDto, UpdateApprovalStatusDto, TransferOwnershipDto } from './dto/update-restaurant.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { TenantValidator } from '../../common/utils/tenant.util.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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

  async create(creator: AuthenticatedUser, dto: CreateRestaurantDto) {
    let slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
    
    // Check slug collision
    const existingSlug = await this.restaurantModel.findOne({ slug }).exec();
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const isSuperAdmin = creator.role === Role.SUPER_ADMIN;

    const restaurant = await this.restaurantModel.create({
      name: dto.name.trim(),
      slug,
      description: dto.description || '',
      logoUrl: dto.logoUrl || '',
      address: dto.address || {},
      contactDetails: dto.contactDetails || {},
      ownerId: new Types.ObjectId(creator.userId),
      approvalStatus: isSuperAdmin
        ? RestaurantApprovalStatus.APPROVED
        : RestaurantApprovalStatus.PENDING,
      isActive: true,
      settings: dto.settings || { currency: 'USD', defaultTaxRate: 0, orderAcceptance: true },
    });

    // Add restaurant to user's assigned restaurants
    await this.userModel.findByIdAndUpdate(creator.userId, {
      $addToSet: { restaurantAssignments: restaurant._id },
    }).exec();

    await this.auditService.log({
      actorId: creator.userId,
      restaurantId: restaurant._id,
      action: 'CREATE_RESTAURANT',
      entityType: 'Restaurant',
      entityId: restaurant._id.toString(),
      safeMetadata: { name: restaurant.name, slug: restaurant.slug },
    });

    return restaurant;
  }

  async findAll(user: AuthenticatedUser, paginationDto: PaginationDto) {
    const { page = 1, limit = 20, search } = paginationDto;
    const filter: Record<string, any> = {};

    // Tenant isolation: if not super admin, only view assigned or owned restaurants
    if (user.role !== Role.SUPER_ADMIN) {
      const assignedObjectIds = (user.restaurantAssignments || []).map(
        (id) => new Types.ObjectId(id),
      );
      filter.$or = [
        { _id: { $in: assignedObjectIds } },
        { ownerId: new Types.ObjectId(user.userId) },
      ];
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.restaurantModel
        .find(filter)
        .populate('ownerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.restaurantModel.countDocuments(filter).exec(),
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

  async findById(user: AuthenticatedUser, id: string) {
    await TenantValidator.assertRestaurantAccess(user, id, this.restaurantModel);

    const restaurant = await this.restaurantModel
      .findById(id)
      .populate('ownerId', 'name email')
      .exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    return restaurant;
  }

  async update(user: AuthenticatedUser, id: string, dto: UpdateRestaurantDto) {
    await TenantValidator.assertRestaurantAccess(user, id, this.restaurantModel);

    // Filter out mass-assignment protected fields
    const safeUpdate: any = Object.assign({}, dto);
    delete safeUpdate.ownerId;
    delete safeUpdate.approvalStatus;
    delete safeUpdate.isActive;

    if (safeUpdate.slug) {
      safeUpdate.slug = this.slugify(safeUpdate.slug);
      const existing = await this.restaurantModel
        .findOne({ slug: safeUpdate.slug, _id: { $ne: new Types.ObjectId(id) } })
        .exec();
      if (existing) {
        throw new ConflictException('A restaurant with this slug already exists');
      }
    }

    const updated = await this.restaurantModel
      .findByIdAndUpdate(id, { $set: safeUpdate }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    await this.auditService.log({
      actorId: user.userId,
      restaurantId: id,
      action: 'UPDATE_RESTAURANT',
      entityType: 'Restaurant',
      entityId: id,
      safeMetadata: safeUpdate,
    });

    return updated;
  }

  async updateApprovalStatus(admin: AuthenticatedUser, id: string, dto: UpdateApprovalStatusDto) {
    if (admin.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admin can change restaurant approval status');
    }

    const updateDoc: any = { approvalStatus: dto.approvalStatus };
    if (dto.isActive !== undefined) {
      updateDoc.isActive = dto.isActive;
    }

    const restaurant = await this.restaurantModel
      .findByIdAndUpdate(id, { $set: updateDoc }, { new: true })
      .exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }

    await this.auditService.log({
      actorId: admin.userId,
      restaurantId: id,
      action: 'UPDATE_RESTAURANT_STATUS',
      entityType: 'Restaurant',
      entityId: id,
      safeMetadata: updateDoc,
    });

    return restaurant;
  }

  async transferOwnership(admin: AuthenticatedUser, id: string, dto: TransferOwnershipDto) {
    if (admin.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admin can transfer restaurant ownership');
    }

    const newOwner = await this.userModel.findById(dto.newOwnerId).exec();
    if (!newOwner) {
      throw new NotFoundException(`Target owner with ID ${dto.newOwnerId} not found`);
    }

    const restaurant = await this.restaurantModel
      .findByIdAndUpdate(id, { ownerId: new Types.ObjectId(dto.newOwnerId) }, { new: true })
      .exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant not found`);
    }

    // Assign restaurant to new owner
    await this.userModel.findByIdAndUpdate(dto.newOwnerId, {
      $addToSet: { restaurantAssignments: restaurant._id },
    }).exec();

    await this.auditService.log({
      actorId: admin.userId,
      restaurantId: id,
      action: 'TRANSFER_RESTAURANT_OWNERSHIP',
      entityType: 'Restaurant',
      entityId: id,
      safeMetadata: { newOwnerId: dto.newOwnerId },
    });

    return restaurant;
  }
}

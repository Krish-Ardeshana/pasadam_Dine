import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserDocument, Restaurant, RestaurantDocument } from '../../database/schemas/index.js';
import { UserStatus } from '../../common/enums/index.js';
import { CreateStaffDto, AssignRestaurantDto } from './dto/create-staff.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { TenantValidator } from '../../common/utils/tenant.util.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 20, search } = paginationDto;
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-passwordHash -refreshTokenHash')
        .populate('restaurantAssignments', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter).exec(),
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

  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-passwordHash -refreshTokenHash')
      .populate('restaurantAssignments', 'name slug logoUrl approvalStatus')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async createStaff(creator: AuthenticatedUser, dto: CreateStaffDto) {
    // Assert creator has access to this restaurant
    await TenantValidator.assertRestaurantAccess(creator, dto.restaurantId, this.restaurantModel);

    const email = dto.email.toLowerCase().trim();
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const newUser = await this.userModel.create({
      name: dto.name.trim(),
      email,
      passwordHash,
      role: dto.role,
      restaurantAssignments: [new Types.ObjectId(dto.restaurantId)],
      permissions: [],
      accountStatus: UserStatus.ACTIVE,
    });

    await this.auditService.log({
      actorId: creator.userId,
      restaurantId: dto.restaurantId,
      action: 'CREATE_STAFF',
      entityType: 'User',
      entityId: newUser._id.toString(),
      safeMetadata: { email: newUser.email, role: newUser.role },
    });

    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      restaurantAssignments: newUser.restaurantAssignments,
      accountStatus: newUser.accountStatus,
    };
  }

  async assignRestaurant(actor: AuthenticatedUser, dto: AssignRestaurantDto) {
    await TenantValidator.assertRestaurantAccess(actor, dto.restaurantId, this.restaurantModel);

    const targetUser = await this.userModel.findById(dto.userId).exec();
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    const rObjectId = new Types.ObjectId(dto.restaurantId);
    const alreadyAssigned = targetUser.restaurantAssignments.some((id) => id.equals(rObjectId));

    if (!alreadyAssigned) {
      targetUser.restaurantAssignments.push(rObjectId);
      await targetUser.save();
    }

    await this.auditService.log({
      actorId: actor.userId,
      restaurantId: dto.restaurantId,
      action: 'ASSIGN_RESTAURANT',
      entityType: 'User',
      entityId: targetUser._id.toString(),
      safeMetadata: { restaurantId: dto.restaurantId },
    });

    return { success: true, message: 'Restaurant assigned successfully' };
  }

  async removeRestaurantAssignment(actor: AuthenticatedUser, userId: string, restaurantId: string) {
    await TenantValidator.assertRestaurantAccess(actor, restaurantId, this.restaurantModel);

    const targetUser = await this.userModel.findById(userId).exec();
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    targetUser.restaurantAssignments = targetUser.restaurantAssignments.filter(
      (id) => id.toString() !== restaurantId,
    );
    await targetUser.save();

    await this.auditService.log({
      actorId: actor.userId,
      restaurantId,
      action: 'REMOVE_RESTAURANT_ASSIGNMENT',
      entityType: 'User',
      entityId: targetUser._id.toString(),
      safeMetadata: { restaurantId },
    });

    return { success: true, message: 'Restaurant assignment removed' };
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .select('-passwordHash -refreshTokenHash')
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}

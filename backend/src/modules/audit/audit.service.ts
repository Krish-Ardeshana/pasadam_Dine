import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../database/schemas/index.js';

export interface CreateAuditLogParams {
  actorId: string | Types.ObjectId;
  restaurantId?: string | Types.ObjectId;
  action: string;
  entityType: string;
  entityId: string;
  safeMetadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(params: CreateAuditLogParams): Promise<AuditLogDocument | null> {
    try {
      return await this.auditLogModel.create({
        actorId: new Types.ObjectId(params.actorId.toString()),
        restaurantId: params.restaurantId
          ? new Types.ObjectId(params.restaurantId.toString())
          : undefined,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        safeMetadata: params.safeMetadata || {},
        ipAddress: params.ipAddress || '',
        userAgent: params.userAgent || '',
      });
    } catch (error) {
      this.logger.error(`Failed to record audit log: ${(error as any).message}`);
      return null;
    }
  }

  async findByRestaurant(restaurantId: string, limit = 50) {
    return this.auditLogModel
      .find({ restaurantId: new Types.ObjectId(restaurantId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actorId', 'name email role')
      .exec();
  }
}

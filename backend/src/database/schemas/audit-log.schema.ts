import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  actorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', index: true })
  restaurantId?: Types.ObjectId;

  @Prop({ required: true, index: true })
  action: string;

  @Prop({ required: true, index: true })
  entityType: string;

  @Prop({ required: true, index: true })
  entityId: string;

  @Prop({ type: Object, default: {} })
  safeMetadata: Record<string, any>;

  @Prop({ default: '' })
  ipAddress?: string;

  @Prop({ default: '' })
  userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ restaurantId: 1, createdAt: -1 });
AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

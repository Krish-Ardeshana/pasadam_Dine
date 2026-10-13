import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QrStatus, QrType } from '../../common/enums/index.js';

export type QrCodeDocument = QrCode & Document;

@Schema({ timestamps: true, collection: 'qr_codes' })
export class QrCode {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Dish', index: true })
  dishId?: Types.ObjectId;

  @Prop({ type: String, required: true, enum: Object.values(QrType) })
  qrType: QrType;

  @Prop({ required: true })
  targetUrl: string;

  @Prop({ required: true })
  imageData: string;

  @Prop({ type: String, enum: Object.values(QrStatus), default: QrStatus.ACTIVE, index: true })
  status: QrStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const QrCodeSchema = SchemaFactory.createForClass(QrCode);

QrCodeSchema.index({ restaurantId: 1, qrType: 1, dishId: 1 });
QrCodeSchema.index({ restaurantId: 1, status: 1 });
QrCodeSchema.index({ targetUrl: 1 });

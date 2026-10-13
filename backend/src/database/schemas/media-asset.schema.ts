import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MediaType, StorageProvider } from '../../common/enums/index.js';

export type MediaAssetDocument = MediaAsset & Document;

@Schema({ timestamps: true, collection: 'media_assets' })
export class MediaAsset {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Dish' })
  dishId?: Types.ObjectId;

  @Prop({ type: String, required: true, enum: Object.values(MediaType), default: MediaType.IMAGE })
  mediaType: MediaType;

  @Prop({ type: String, required: true, enum: Object.values(StorageProvider), default: StorageProvider.LOCAL })
  storageProvider: StorageProvider;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ default: '' })
  publicId?: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ default: '' })
  originalFilename?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploadedBy?: Types.ObjectId;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);

MediaAssetSchema.index({ restaurantId: 1, mediaType: 1 });
MediaAssetSchema.index({ dishId: 1 });
MediaAssetSchema.index({ restaurantId: 1, createdAt: -1 });

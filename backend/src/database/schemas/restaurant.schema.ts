import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RestaurantApprovalStatus } from '../../common/enums/index.js';

export type RestaurantDocument = Restaurant & Document;

@Schema({ _id: false })
export class RestaurantAddress {
  @Prop({ default: '' })
  street?: string;

  @Prop({ default: '' })
  city?: string;

  @Prop({ default: '' })
  state?: string;

  @Prop({ default: '' })
  postalCode?: string;

  @Prop({ default: '' })
  country?: string;
}

@Schema({ _id: false })
export class RestaurantContact {
  @Prop({ default: '' })
  phone?: string;

  @Prop({ default: '' })
  email?: string;

  @Prop({ default: '' })
  website?: string;
}

@Schema({ _id: false })
export class RestaurantSettings {
  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ default: 0 })
  defaultTaxRate?: number;

  @Prop({ default: 'UTC' })
  timezone?: string;

  @Prop({ default: true })
  orderAcceptance?: boolean;

  @Prop({ default: 20 })
  tableCount?: number;
}

@Schema({ timestamps: true, collection: 'restaurants' })
export class Restaurant {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ type: RestaurantAddress, default: () => ({}) })
  address: RestaurantAddress;

  @Prop({ type: RestaurantContact, default: () => ({}) })
  contactDetails: RestaurantContact;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(RestaurantApprovalStatus),
    default: RestaurantApprovalStatus.PENDING,
    index: true,
  })
  approvalStatus: RestaurantApprovalStatus;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ type: RestaurantSettings, default: () => ({}) })
  settings: RestaurantSettings;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

RestaurantSchema.index({ slug: 1 }, { unique: true });
RestaurantSchema.index({ ownerId: 1 });
RestaurantSchema.index({ approvalStatus: 1, isActive: 1 });
RestaurantSchema.index({ name: 'text', description: 'text' });

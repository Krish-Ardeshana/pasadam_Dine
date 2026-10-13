import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DishDocument = Dish & Document;

@Schema({ timestamps: true, collection: 'dishes' })
export class Dish {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true, index: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ type: [String], default: [] })
  imageUrls: string[];

  @Prop({ default: '' })
  model3dUrl: string;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ type: [String], default: [] })
  dietaryFlags: string[];

  @Prop({ default: 0 })
  displayOrder: number;
}

export const DishSchema = SchemaFactory.createForClass(Dish);

DishSchema.index({ restaurantId: 1, slug: 1 }, { unique: true });
DishSchema.index({ restaurantId: 1, categoryId: 1 });
DishSchema.index({ restaurantId: 1, isPublished: 1, isAvailable: 1 });
DishSchema.index({ name: 'text', description: 'text' });

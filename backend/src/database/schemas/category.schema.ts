import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CategoryStatus } from '../../common/enums/index.js';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 0 })
  displayOrder: number;

  @Prop({ type: String, enum: Object.values(CategoryStatus), default: CategoryStatus.ACTIVE, index: true })
  status: CategoryStatus;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ restaurantId: 1, displayOrder: 1 });
CategorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });
CategorySchema.index({ restaurantId: 1, status: 1 });

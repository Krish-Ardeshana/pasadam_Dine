import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  OrderStatus,
  OrderPaymentStatus,
  OrderType,
  OrderPaymentMethod,
} from '../../common/enums/index.js';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Dish', required: true })
  dishId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: '', trim: true })
  instructions: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class OrderPricing {
  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0, min: 0 })
  tax: number;

  @Prop({ default: 0, min: 0 })
  serviceFee: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ default: 'USD', uppercase: true, trim: true })
  currency: string;
}

export const OrderPricingSchema = SchemaFactory.createForClass(OrderPricing);

@Schema({ _id: false })
export class OrderStatusHistoryItem {
  @Prop({ type: String, required: true, enum: Object.values(OrderStatus) })
  status: OrderStatus;

  @Prop({ default: Date.now })
  changedAt: Date;

  @Prop({ default: 'SYSTEM' })
  changedBy: string;

  @Prop({ default: '' })
  reason: string;
}

export const OrderStatusHistoryItemSchema = SchemaFactory.createForClass(OrderStatusHistoryItem);

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true, uppercase: true, trim: true })
  orderNumber: string;

  @Prop({ type: String, required: true, enum: Object.values(OrderType), default: OrderType.DINE_IN })
  orderType: OrderType;

  @Prop({ default: '', trim: true })
  tableNumber: string;

  @Prop({ default: '', trim: true })
  customerName: string;

  @Prop({ default: '', trim: true })
  customerPhone: string;

  @Prop({ default: '', trim: true })
  specialInstructions: string;

  @Prop({ type: [OrderItemSchema], required: true, default: [] })
  items: OrderItem[];

  @Prop({ type: OrderPricingSchema, required: true })
  pricing: OrderPricing;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
    index: true,
  })
  status: OrderStatus;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OrderPaymentStatus),
    default: OrderPaymentStatus.UNPAID,
    index: true,
  })
  paymentStatus: OrderPaymentStatus;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OrderPaymentMethod),
    default: OrderPaymentMethod.PAY_AT_TABLE,
  })
  paymentMethod: OrderPaymentMethod;

  @Prop({ type: [OrderStatusHistoryItemSchema], default: [] })
  statusHistory: OrderStatusHistoryItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });

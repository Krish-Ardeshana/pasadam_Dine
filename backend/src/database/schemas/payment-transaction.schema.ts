import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderPaymentStatus } from '../../common/enums/index.js';

export type PaymentTransactionDocument = PaymentTransaction & Document;

@Schema({ timestamps: true, collection: 'payment_transactions' })
export class PaymentTransaction {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true, index: true })
  restaurantId: Types.ObjectId;

  @Prop({ required: true, index: true, uppercase: true, trim: true })
  orderNumber: string;

  @Prop({ required: true, default: 'RAZORPAY', uppercase: true })
  gateway: string;

  @Prop({ required: true, index: true, trim: true })
  gatewayOrderId: string;

  @Prop({ default: '', index: true, trim: true })
  gatewayPaymentId: string;

  @Prop({ default: '', trim: true })
  gatewaySignature: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, min: 0 })
  amountInSubunits: number;

  @Prop({ required: true, uppercase: true, default: 'INR' })
  currency: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OrderPaymentStatus),
    default: OrderPaymentStatus.PENDING,
    index: true,
  })
  status: OrderPaymentStatus;

  @Prop({ default: false })
  signatureVerified: boolean;

  @Prop({ default: '' })
  failureReason: string;

  @Prop({ type: Object, default: {} })
  rawGatewayResponse: Record<string, any>;
}

export const PaymentTransactionSchema = SchemaFactory.createForClass(PaymentTransaction);

PaymentTransactionSchema.index({ restaurantId: 1, createdAt: -1 });
PaymentTransactionSchema.index({ gatewayOrderId: 1, gatewayPaymentId: 1 });

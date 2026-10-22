import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProcessedWebhookDocument = ProcessedWebhook & Document;

@Schema({ timestamps: true, collection: 'processed_webhooks' })
export class ProcessedWebhook {
  @Prop({ required: true, unique: true, index: true, trim: true })
  eventId: string;

  @Prop({ required: true, trim: true })
  eventType: string;

  @Prop({ required: true, default: 'RAZORPAY', uppercase: true })
  gateway: string;

  @Prop({ default: Date.now })
  processedAt: Date;
}

export const ProcessedWebhookSchema = SchemaFactory.createForClass(ProcessedWebhook);

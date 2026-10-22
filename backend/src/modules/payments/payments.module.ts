import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { PublicPaymentsController } from './public-payments.controller.js';
import { PaymentsWebhookController } from './payments-webhook.controller.js';
import { AuditModule } from '../audit/audit.module.js';
import { OrdersModule } from '../orders/orders.module.js';

@Module({
  imports: [AuditModule, OrdersModule],
  controllers: [
    PaymentsController,
    PublicPaymentsController,
    PaymentsWebhookController,
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

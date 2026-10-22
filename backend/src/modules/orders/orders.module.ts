import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { PublicOrdersController } from './public-orders.controller.js';
import { OrdersService } from './orders.service.js';
import { OrderEventsService } from './order-events.service.js';
import { AuditModule } from '../audit/audit.module.js';

@Module({
  imports: [AuditModule],
  controllers: [OrdersController, PublicOrdersController],
  providers: [OrdersService, OrderEventsService],
  exports: [OrdersService, OrderEventsService],
})
export class OrdersModule {}

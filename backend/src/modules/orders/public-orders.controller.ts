import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@ApiTags('Public Online & Dine-in Ordering')
@Public()
@Controller('public/restaurants/:restaurantSlug/orders')
export class PublicOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a new customer dining order (Dine-in / Takeaway)' })
  @ApiResponse({ status: 201, description: 'Order created with pending status' })
  @ApiResponse({ status: 400, description: 'Invalid dish, quantity, or cross-tenant dish' })
  @ApiResponse({ status: 404, description: 'Restaurant or dish not found' })
  async createOrder(
    @Param('restaurantSlug') restaurantSlug: string,
    @Body() dto: CreateOrderDto,
    @Req() req: Request,
  ) {
    const meta = {
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] as string,
    };
    return this.ordersService.createPublicOrder(restaurantSlug, dto, meta);
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Look up live status of an order using its order number' })
  @ApiResponse({ status: 200, description: 'Order status and details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderStatus(
    @Param('restaurantSlug') restaurantSlug: string,
    @Param('orderNumber') orderNumber: string,
  ) {
    return this.ordersService.getPublicOrderStatus(restaurantSlug, orderNumber);
  }
}

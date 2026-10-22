import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Sse,
  UseGuards,
  type MessageEvent,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Observable } from 'rxjs';
import { OrdersService } from './orders.service.js';
import { OrderEventsService } from './order-events.service.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { OrderQueryDto } from './dto/order-query.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { Role } from '../../common/enums/index.js';

@ApiTags('Orders (Restaurant Management & KDS)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurants/:restaurantId/orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly orderEventsService: OrderEventsService,
  ) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'List and filter orders for a restaurant' })
  @ApiResponse({ status: 200, description: 'Paginated order list' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.findAll(user, restaurantId, query);
  }

  @Get('stream')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @Sse()
  @ApiOperation({ summary: 'Real-time Server-Sent Events stream for Kitchen Display System (KDS)' })
  stream(
    @Param('restaurantId') restaurantId: string,
  ): Observable<MessageEvent> {
    return this.orderEventsService.subscribeToRestaurant(restaurantId) as unknown as Observable<MessageEvent>;
  }

  @Get(':orderId')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'Get full details of a specific order' })
  @ApiResponse({ status: 200, description: 'Order detail' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.findOne(user, restaurantId, orderId);
  }

  @Patch(':orderId/status')
  @Roles(Role.SUPER_ADMIN, Role.RESTAURANT_OWNER, Role.RESTAURANT_MANAGER, Role.RESTAURANT_STAFF)
  @ApiOperation({ summary: 'Update order lifecycle status (Accept, Prepare, Ready, Serve, Cancel)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(user, restaurantId, orderId, dto);
  }
}

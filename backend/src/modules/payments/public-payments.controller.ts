import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator.js';
import { PaymentsService } from './payments.service.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';

@ApiTags('Public Online Payments (Razorpay)')
@Public()
@Controller('public/restaurants/:restaurantSlug/payments')
export class PublicPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get safe public payment configuration (Razorpay Key ID and Mode)' })
  getPublicConfig() {
    return this.paymentsService.getPublicConfig();
  }

  @Post('orders/:orderNumber/create')
  @ApiOperation({ summary: 'Initiate a Razorpay payment order for an existing dining order' })
  @ApiResponse({ status: 201, description: 'Razorpay order created with trusted server amount' })
  @ApiResponse({ status: 400, description: 'Order already paid or cancelled' })
  @ApiResponse({ status: 404, description: 'Order or restaurant not found' })
  async createPaymentOrder(
    @Param('restaurantSlug') restaurantSlug: string,
    @Param('orderNumber') orderNumber: string,
  ) {
    return this.paymentsService.createPaymentOrder(restaurantSlug, orderNumber);
  }

  @Post('orders/:orderNumber/verify')
  @ApiOperation({ summary: 'Verify checkout HMAC-SHA256 signature and mark order PAID' })
  @ApiResponse({ status: 200, description: 'Signature verified and payment captured' })
  @ApiResponse({ status: 400, description: 'Signature verification failure' })
  async verifyPayment(
    @Param('restaurantSlug') restaurantSlug: string,
    @Param('orderNumber') orderNumber: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentsService.verifyPayment(restaurantSlug, orderNumber, dto);
  }
}

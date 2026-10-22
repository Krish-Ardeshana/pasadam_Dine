import { Controller, Headers, Post, Req, type RawBodyRequest } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator.js';
import { PaymentsService } from './payments.service.js';

@ApiTags('Payment Webhooks')
@Public()
@Controller('payments/webhook')
export class PaymentsWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Authoritative Razorpay Webhook endpoint for payment and refund events' })
  @ApiResponse({ status: 200, description: 'Webhook processed or idempotently acknowledged' })
  @ApiResponse({ status: 400, description: 'Invalid signature or malformed payload' })
  async handleWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    return this.paymentsService.handleWebhook(rawBody, signature);
  }
}

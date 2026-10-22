import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import {
  Order,
  OrderDocument,
  Restaurant,
  RestaurantDocument,
  PaymentTransaction,
  PaymentTransactionDocument,
  ProcessedWebhook,
  ProcessedWebhookDocument,
} from '../../database/schemas/index.js';
import {
  OrderPaymentStatus,
  OrderPaymentMethod,
  OrderStatus,
  RestaurantApprovalStatus,
} from '../../common/enums/index.js';
import { TenantValidator } from '../../common/utils/tenant.util.js';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator.js';
import { AuditService } from '../audit/audit.service.js';
import { OrderEventsService } from '../orders/order-events.service.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';
import { RefundPaymentDto } from './dto/refund-payment.dto.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpayClient: any;
  private readonly keyId: string;
  private readonly keySecret: string;
  private readonly webhookSecret: string;
  private readonly mode: 'test' | 'live';

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(PaymentTransaction.name)
    private readonly transactionModel: Model<PaymentTransactionDocument>,
    @InjectModel(ProcessedWebhook.name)
    private readonly webhookModel: Model<ProcessedWebhookDocument>,
    private readonly auditService: AuditService,
    private readonly orderEventsService: OrderEventsService,
  ) {
    this.keyId = this.configService.get<string>('razorpay.keyId') || '';
    this.keySecret = this.configService.get<string>('razorpay.keySecret') || '';
    this.webhookSecret = this.configService.get<string>('razorpay.webhookSecret') || '';
    this.mode = this.configService.get<'test' | 'live'>('razorpay.mode') || 'test';

    // In production or when credentials exist, initialize official Razorpay client
    if (this.keyId && this.keySecret) {
      this.razorpayClient = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret,
      });
      this.logger.log(`Razorpay client initialized in [${this.mode.toUpperCase()}] mode`);
    } else {
      this.logger.warn(
        'Razorpay credentials not fully configured; running in test stub mode. Real transactions require RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET.',
      );
    }
  }

  /**
   * Public Customer Flow:
   * Initiates an online Razorpay payment order for an existing eligible dining order.
   * Calculates the exact amount strictly from the trusted database order record.
   */
  async createPaymentOrder(restaurantSlug: string, orderNumber: string) {
    const restaurant = await this.restaurantModel
      .findOne({ slug: restaurantSlug.toLowerCase().trim() })
      .exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant '${restaurantSlug}' not found`);
    }

    if (!restaurant.isActive || restaurant.approvalStatus !== RestaurantApprovalStatus.APPROVED) {
      throw new BadRequestException('Restaurant is currently inactive');
    }

    const order = await this.orderModel
      .findOne({
        restaurantId: restaurant._id,
        orderNumber: orderNumber.toUpperCase().trim(),
      })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order '${orderNumber}' not found for this restaurant`);
    }

    if (order.paymentStatus === OrderPaymentStatus.PAID) {
      throw new BadRequestException('This order has already been paid');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot initiate payment for a cancelled order');
    }

    // Convert decimal currency to smallest subunit (e.g. INR/USD cents = amount * 100)
    const amountInSubunits = Math.round(order.pricing.total * 100);
    if (amountInSubunits <= 0) {
      throw new BadRequestException('Order amount must be greater than zero to process payment');
    }

    const currency = (order.pricing.currency || 'INR').toUpperCase();
    let rzpOrderId: string;

    // Use live client if configured, otherwise generate standard test order reference
    if (this.razorpayClient?.orders?.create) {
      try {
        const rzpOrder = await this.razorpayClient.orders.create({
          amount: amountInSubunits,
          currency,
          receipt: order.orderNumber,
          notes: {
            orderId: order._id.toString(),
            restaurantId: restaurant._id.toString(),
            orderNumber: order.orderNumber,
          },
        });
        rzpOrderId = rzpOrder.id;
      } catch (err: any) {
        this.logger.error(`Razorpay order creation failed: ${err.message}`);
        throw new BadRequestException(`Payment gateway error: ${err.message || 'Unable to create order'}`);
      }
    } else {
      rzpOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // Persist payment attempt details on order
    order.razorpayOrderId = rzpOrderId;
    order.paymentStatus = OrderPaymentStatus.PENDING;
    order.paymentMethod = OrderPaymentMethod.ONLINE_PENDING;
    await order.save();

    // Record payment transaction audit record
    await this.transactionModel.create({
      orderId: order._id,
      restaurantId: restaurant._id,
      orderNumber: order.orderNumber,
      gateway: 'RAZORPAY',
      gatewayOrderId: rzpOrderId,
      amount: order.pricing.total,
      amountInSubunits,
      currency,
      status: OrderPaymentStatus.PENDING,
      signatureVerified: false,
    });

    await this.auditService.log({
      actorId: new Types.ObjectId(),
      restaurantId: restaurant._id,
      action: 'PAYMENT_INITIATED',
      entityType: 'Order',
      entityId: order._id.toString(),
      safeMetadata: {
        orderNumber: order.orderNumber,
        gatewayOrderId: rzpOrderId,
        amount: order.pricing.total,
        currency,
      },
    });

    return {
      orderId: rzpOrderId,
      amount: amountInSubunits,
      currency,
      keyId: this.keyId || 'rzp_test_placeholder',
      orderNumber: order.orderNumber,
      restaurantName: restaurant.name,
    };
  }

  /**
   * Customer Flow:
   * Verifies Razorpay checkout HMAC-SHA256 signature using constant-time comparison.
   * Idempotently marks order as PAID upon successful verification.
   */
  async verifyPayment(restaurantSlug: string, orderNumber: string, dto: VerifyPaymentDto) {
    const restaurant = await this.restaurantModel
      .findOne({ slug: restaurantSlug.toLowerCase().trim() })
      .select('_id name slug')
      .exec();

    if (!restaurant) {
      throw new NotFoundException(`Restaurant '${restaurantSlug}' not found`);
    }

    const order = await this.orderModel
      .findOne({
        restaurantId: restaurant._id,
        orderNumber: orderNumber.toUpperCase().trim(),
      })
      .exec();

    if (!order) {
      throw new NotFoundException(`Order '${orderNumber}' not found`);
    }

    // Verify gateway order ID matches our stored attempt or a recorded transaction for this order
    const isDirectMatch = !order.razorpayOrderId || order.razorpayOrderId === dto.razorpayOrderId;
    if (!isDirectMatch) {
      const priorTx = await this.transactionModel.findOne({
        orderId: order._id,
        gatewayOrderId: dto.razorpayOrderId,
      }).exec();

      if (!priorTx) {
        throw new BadRequestException('Mismatched gateway order ID for this order record');
      }
    }

    // Idempotent return if already marked PAID
    if (
      order.paymentStatus === OrderPaymentStatus.PAID &&
      order.razorpayPaymentId === dto.razorpayPaymentId
    ) {
      return {
        verified: true,
        paymentStatus: OrderPaymentStatus.PAID,
        orderNumber: order.orderNumber,
      };
    }

    // Cryptographic signature verification using constant-time comparison
    const secret = this.keySecret || 'test_secret';
    const payload = `${dto.razorpayOrderId}|${dto.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const providedBuf = Buffer.from(dto.razorpaySignature, 'utf-8');

    let isValid = false;
    if (expectedBuf.length === providedBuf.length) {
      isValid = crypto.timingSafeEqual(expectedBuf, providedBuf);
    }

    if (!isValid) {
      this.logger.warn(`Invalid payment signature attempt for order #${order.orderNumber}`);
      await this.transactionModel.findOneAndUpdate(
        { gatewayOrderId: dto.razorpayOrderId },
        {
          gatewayPaymentId: dto.razorpayPaymentId,
          gatewaySignature: dto.razorpaySignature,
          status: OrderPaymentStatus.FAILED,
          failureReason: 'Cryptographic signature mismatch',
        },
      );
      throw new BadRequestException('Cryptographic payment signature verification failed');
    }

    // Update order with verified payment
    order.paymentStatus = OrderPaymentStatus.PAID;
    order.razorpayPaymentId = dto.razorpayPaymentId;
    order.paymentDetails = {
      gateway: 'RAZORPAY',
      orderId: dto.razorpayOrderId,
      paymentId: dto.razorpayPaymentId,
      signature: dto.razorpaySignature,
      paidAt: new Date(),
      amount: order.pricing.total,
      currency: order.pricing.currency,
    };
    await order.save();

    // Update transaction audit record
    await this.transactionModel.findOneAndUpdate(
      { gatewayOrderId: dto.razorpayOrderId },
      {
        gatewayPaymentId: dto.razorpayPaymentId,
        gatewaySignature: dto.razorpaySignature,
        status: OrderPaymentStatus.PAID,
        signatureVerified: true,
      },
      { upsert: true },
    );

    await this.auditService.log({
      actorId: new Types.ObjectId(),
      restaurantId: restaurant._id,
      action: 'PAYMENT_VERIFIED',
      entityType: 'Order',
      entityId: order._id.toString(),
      safeMetadata: {
        orderNumber: order.orderNumber,
        paymentId: dto.razorpayPaymentId,
        amount: order.pricing.total,
      },
    });

    // Notify KDS in real-time
    this.orderEventsService.emit(
      restaurant._id.toString(),
      'ORDER_STATUS_CHANGED',
      order,
    );

    return {
      verified: true,
      paymentStatus: OrderPaymentStatus.PAID,
      orderNumber: order.orderNumber,
    };
  }

  /**
   * Razorpay Webhook Handler:
   * Verifies X-Razorpay-Signature with raw body, performs idempotency check,
   * and updates payment status accordingly.
   */
  async handleWebhook(rawBody: Buffer | string, signature: string) {
    if (!signature) {
      throw new BadRequestException('Missing X-Razorpay-Signature header');
    }

    const secret = this.webhookSecret || this.keySecret || 'test_webhook_secret';
    const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf-8') : rawBody;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyStr)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const providedBuf = Buffer.from(signature, 'utf-8');

    let isValid = false;
    if (expectedBuf.length === providedBuf.length) {
      isValid = crypto.timingSafeEqual(expectedBuf, providedBuf);
    }

    if (!isValid) {
      this.logger.warn('Webhook signature verification failed');
      throw new BadRequestException('Invalid webhook signature');
    }

    let event: any;
    try {
      event = JSON.parse(bodyStr);
    } catch {
      throw new BadRequestException('Malformed webhook JSON payload');
    }

    const eventId = event.id || `evt_${Date.now()}`;
    const eventType = event.event;

    // Idempotency check: Reject duplicate webhooks gracefully
    const alreadyProcessed = await this.webhookModel.findOne({ eventId }).exec();
    if (alreadyProcessed) {
      this.logger.log(`Webhook event ${eventId} already processed (idempotent ignore)`);
      return { status: 'already_processed', eventId };
    }

    // Process payment events
    if (eventType === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      if (payment) {
        const rzpOrderId = payment.order_id;
        const order = await this.orderModel.findOne({ razorpayOrderId: rzpOrderId }).exec();
        if (order && order.paymentStatus !== OrderPaymentStatus.PAID) {
          order.paymentStatus = OrderPaymentStatus.PAID;
          order.razorpayPaymentId = payment.id;
          order.paymentDetails = {
            gateway: 'RAZORPAY',
            orderId: rzpOrderId,
            paymentId: payment.id,
            paidAt: new Date(),
            method: payment.method,
            amount: Number((payment.amount / 100).toFixed(2)),
          };
          await order.save();

          await this.transactionModel.findOneAndUpdate(
            { gatewayOrderId: rzpOrderId },
            {
              gatewayPaymentId: payment.id,
              status: OrderPaymentStatus.PAID,
              signatureVerified: true,
            },
          );

          this.orderEventsService.emit(
            order.restaurantId.toString(),
            'ORDER_STATUS_CHANGED',
            order,
          );
        }
      }
    } else if (eventType === 'payment.failed') {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        await this.transactionModel.findOneAndUpdate(
          { gatewayOrderId: payment.order_id },
          {
            status: OrderPaymentStatus.FAILED,
            failureReason: payment.error_description || 'Payment failed at gateway',
          },
        );
      }
    }

    // Record processed webhook event ID for idempotency
    await this.webhookModel.create({
      eventId,
      eventType,
      gateway: 'RAZORPAY',
      processedAt: new Date(),
    });

    return { status: 'ok', eventId };
  }

  /**
   * Restaurant Scoped: Authorized Refund Initiation
   */
  async processRefund(
    user: AuthenticatedUser,
    restaurantId: string,
    orderId: string,
    dto: RefundPaymentDto,
  ) {
    await TenantValidator.assertRestaurantAccess(user, restaurantId, this.restaurantModel);

    const order = await this.orderModel.findById(orderId).exec();
    if (!order) {
      throw new NotFoundException(`Order with ID '${orderId}' not found`);
    }

    if (order.restaurantId.toString() !== restaurantId.toString()) {
      throw new NotFoundException(`Order not found in restaurant ${restaurantId}`);
    }

    if (order.paymentStatus !== OrderPaymentStatus.PAID) {
      throw new BadRequestException('Cannot refund an order that is not in PAID state');
    }

    if (!order.razorpayPaymentId) {
      throw new BadRequestException('No payment transaction identifier available for refund');
    }

    const alreadyRefunded = (order.refundDetails || []).reduce(
      (sum, r) => sum + (r.amount || 0),
      0,
    );
    const maxRefundable = Number((order.pricing.total - alreadyRefunded).toFixed(2));
    if (maxRefundable <= 0) {
      throw new BadRequestException('Order has already been fully refunded');
    }

    const refundAmount = dto.amount ? Number(dto.amount.toFixed(2)) : maxRefundable;
    if (refundAmount <= 0) {
      throw new BadRequestException('Refund amount must be greater than zero');
    }

    if (refundAmount > maxRefundable) {
      throw new BadRequestException(
        `Refund amount ${refundAmount} exceeds max refundable balance of ${maxRefundable}`,
      );
    }

    const refundAmountSubunits = Math.round(refundAmount * 100);

    let refundId = `rfnd_test_${Date.now()}`;
    if (this.razorpayClient?.payments?.refund) {
      try {
        const rzpRefund = await this.razorpayClient.payments.refund(order.razorpayPaymentId, {
          amount: refundAmountSubunits,
          notes: {
            reason: dto.reason || 'Staff initiated refund',
            orderNumber: order.orderNumber,
          },
        });
        refundId = rzpRefund.id;
      } catch (err: any) {
        throw new BadRequestException(`Refund gateway failure: ${err.message}`);
      }
    }

    const refundEntry = {
      refundId,
      amount: refundAmount,
      currency: order.pricing.currency,
      status: 'PROCESSED',
      reason: dto.reason || 'Customer refund',
      initiatedBy: user.email || user.userId.toString(),
      createdAt: new Date(),
    };

    order.refundDetails = order.refundDetails || [];
    order.refundDetails.push(refundEntry);

    // If cumulative refunded amount matches or exceeds total, mark as REFUNDED
    const totalRefunded = alreadyRefunded + refundAmount;
    if (totalRefunded >= order.pricing.total - 0.001) {
      order.paymentStatus = OrderPaymentStatus.REFUNDED;
    }

    await order.save();

    await this.auditService.log({
      actorId: user.userId,
      restaurantId: order.restaurantId,
      action: 'PAYMENT_REFUNDED',
      entityType: 'Order',
      entityId: order._id.toString(),
      safeMetadata: {
        orderNumber: order.orderNumber,
        refundId,
        refundAmount,
        reason: dto.reason,
      },
    });

    this.orderEventsService.emit(
      order.restaurantId.toString(),
      'ORDER_STATUS_CHANGED',
      order,
    );

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      refundId,
      amount: refundAmount,
      paymentStatus: order.paymentStatus,
    };
  }

  /**
   * Public configuration:
   * Returns only safe public parameters (Key ID, mode) for client checkout script.
   */
  getPublicConfig() {
    return {
      keyId: this.keyId,
      gateway: 'razorpay',
      mode: this.mode,
    };
  }
}

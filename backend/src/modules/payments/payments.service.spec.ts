import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import crypto from 'crypto';
import { PaymentsService } from './payments.service.js';
import {
  OrderPaymentStatus,
  OrderPaymentMethod,
  OrderStatus,
  RestaurantApprovalStatus,
  Role,
} from '../../common/enums/index.js';

describe('PaymentsService — Secure Razorpay Test Mode & Idempotency', () => {
  let paymentsService: PaymentsService;
  let mockConfigService: any;
  let mockOrderModel: any;
  let mockRestaurantModel: any;
  let mockTransactionModel: any;
  let mockWebhookModel: any;
  let mockAuditService: any;
  let mockOrderEventsService: any;

  const testKeyId = 'rzp_test_testkey12345';
  const testKeySecret = 'testsecret_secret987654321';
  const testWebhookSecret = 'webhook_secret_test_xyz';

  const restaurantId = new Types.ObjectId();
  const foreignRestaurantId = new Types.ObjectId();

  const userOwner = {
    userId: new Types.ObjectId().toString(),
    email: 'owner@prasadam.com',
    role: Role.RESTAURANT_OWNER,
    restaurantAssignments: [restaurantId.toString()],
    permissions: [],
  };

  const userForeignStaff = {
    userId: new Types.ObjectId().toString(),
    email: 'staff@other.com',
    role: Role.RESTAURANT_STAFF,
    restaurantAssignments: [foreignRestaurantId.toString()],
    permissions: [],
  };

  const sampleRestaurant = {
    _id: restaurantId,
    name: 'Sattvic Bhojan',
    slug: 'sattvic-bhojan',
    isActive: true,
    approvalStatus: RestaurantApprovalStatus.APPROVED,
    ownerId: new Types.ObjectId(userOwner.userId),
  };

  let sampleOrder: any;

  beforeEach(() => {
    sampleOrder = {
      _id: new Types.ObjectId(),
      restaurantId,
      orderNumber: 'ORD-20261022-P001',
      status: OrderStatus.PREPARING,
      paymentStatus: OrderPaymentStatus.UNPAID,
      paymentMethod: OrderPaymentMethod.PAY_AT_TABLE,
      pricing: {
        subtotal: 450.0,
        tax: 0,
        serviceFee: 0,
        total: 450.0,
        currency: 'INR',
      },
      razorpayOrderId: '',
      razorpayPaymentId: '',
      refundDetails: [],
      save: vi.fn().mockResolvedValue(true),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'razorpay.keyId') return testKeyId;
        if (key === 'razorpay.keySecret') return testKeySecret;
        if (key === 'razorpay.webhookSecret') return testWebhookSecret;
        if (key === 'razorpay.mode') return 'test';
        return null;
      }),
    };

    mockOrderModel = {
      findOne: vi.fn().mockImplementation(() => ({
        exec: vi.fn().mockResolvedValue(sampleOrder),
      })),
      findById: vi.fn().mockImplementation(() => ({
        exec: vi.fn().mockResolvedValue(sampleOrder),
      })),
    };

    mockRestaurantModel = {
      findOne: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(sampleRestaurant),
        }),
        exec: vi.fn().mockResolvedValue(sampleRestaurant),
      }),
      findById: vi.fn((id: string) => ({
        select: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(
            id.toString() === restaurantId.toString()
              ? sampleRestaurant
              : { _id: foreignRestaurantId, ownerId: new Types.ObjectId(userForeignStaff.userId) },
          ),
        }),
      })),
    };

    mockTransactionModel = {
      create: vi.fn().mockResolvedValue({}),
      findOneAndUpdate: vi.fn().mockResolvedValue({}),
    };

    mockWebhookModel = {
      findOne: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      }),
      create: vi.fn().mockResolvedValue({}),
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue({}),
    };

    mockOrderEventsService = {
      emit: vi.fn(),
    };

    paymentsService = new PaymentsService(
      mockConfigService,
      mockOrderModel,
      mockRestaurantModel,
      mockTransactionModel,
      mockWebhookModel,
      mockAuditService,
      mockOrderEventsService,
    );

    // Mock Razorpay SDK methods to avoid network calls during unit tests
    paymentsService['razorpayClient'] = {
      orders: {
        create: vi.fn().mockImplementation(async (params) => ({
          id: `order_mock_${Date.now()}`,
          amount: params.amount,
          currency: params.currency,
          receipt: params.receipt,
        })),
      },
      payments: {
        refund: vi.fn().mockImplementation(async (paymentId, params) => ({
          id: `rfnd_mock_${Date.now()}`,
          payment_id: paymentId,
          amount: params.amount,
          status: 'processed',
        })),
      },
    };
  });

  describe('createPaymentOrder (Trusted Server Pricing & Lifecycle)', () => {
    it('should create payment order with trusted server amount in subunits (paise) and preserve fulfillment status', async () => {
      const result = await paymentsService.createPaymentOrder('sattvic-bhojan', 'ORD-20261022-P001');

      // Amount must be 450.00 * 100 = 45000 paise
      expect(result.amount).toBe(45000);
      expect(result.currency).toBe('INR');
      expect(result.orderNumber).toBe('ORD-20261022-P001');
      expect(result.keyId).toBe(testKeyId);

      // Verify order state update
      expect(sampleOrder.paymentStatus).toBe(OrderPaymentStatus.PENDING);
      expect(sampleOrder.paymentMethod).toBe(OrderPaymentMethod.ONLINE_PENDING);
      // Fulfillment status must NOT be altered
      expect(sampleOrder.status).toBe(OrderStatus.PREPARING);

      expect(mockTransactionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 450.0,
          amountInSubunits: 45000,
          currency: 'INR',
          status: OrderPaymentStatus.PENDING,
        }),
      );
    });

    it('should reject payment creation for already PAID orders', async () => {
      const paidOrder = { ...sampleOrder, paymentStatus: OrderPaymentStatus.PAID };
      mockOrderModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue(paidOrder),
      });

      await expect(
        paymentsService.createPaymentOrder('sattvic-bhojan', 'ORD-20261022-P001'),
      ).rejects.toThrow(/already been paid/i);
    });

    it('should reject payment creation for CANCELLED orders', async () => {
      const cancelledOrder = { ...sampleOrder, status: OrderStatus.CANCELLED };
      mockOrderModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue(cancelledOrder),
      });

      await expect(
        paymentsService.createPaymentOrder('sattvic-bhojan', 'ORD-20261022-P001'),
      ).rejects.toThrow(/cancelled order/i);
    });
  });

  describe('verifyPayment (HMAC Signature & Constant-Time Verification)', () => {
    it('should verify genuine checkout HMAC signature, update paymentStatus to PAID, and notify KDS', async () => {
      const rzpOrderId = 'order_test_987654';
      const rzpPaymentId = 'pay_test_123456';
      sampleOrder.razorpayOrderId = rzpOrderId;
      sampleOrder.paymentStatus = OrderPaymentStatus.PENDING;

      // Generate legitimate HMAC SHA-256 signature using testKeySecret
      const validSignature = crypto
        .createHmac('sha256', testKeySecret)
        .update(`${rzpOrderId}|${rzpPaymentId}`)
        .digest('hex');

      const verificationDto = {
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: rzpPaymentId,
        razorpaySignature: validSignature,
      };

      const result = await paymentsService.verifyPayment(
        'sattvic-bhojan',
        'ORD-20261022-P001',
        verificationDto,
      );

      expect(result.verified).toBe(true);
      expect(result.paymentStatus).toBe(OrderPaymentStatus.PAID);
      expect(sampleOrder.paymentStatus).toBe(OrderPaymentStatus.PAID);
      expect(sampleOrder.razorpayPaymentId).toBe(rzpPaymentId);

      // Fulfillment status remains PREPARING (unconflated lifecycle)
      expect(sampleOrder.status).toBe(OrderStatus.PREPARING);

      // KDS real-time notification
      expect(mockOrderEventsService.emit).toHaveBeenCalledWith(
        restaurantId.toString(),
        'ORDER_STATUS_CHANGED',
        sampleOrder,
      );
    });

    it('should reject invalid or forged payment signatures with BadRequestException', async () => {
      const rzpOrderId = 'order_test_987654';
      sampleOrder.razorpayOrderId = rzpOrderId;

      const forgedSignature = 'forged_fake_signature_hash_0000000000000000000000000000000000000000000000000000000000000000';

      const verificationDto = {
        razorpayOrderId: rzpOrderId,
        razorpayPaymentId: 'pay_test_123456',
        razorpaySignature: forgedSignature,
      };

      await expect(
        paymentsService.verifyPayment('sattvic-bhojan', 'ORD-20261022-P001', verificationDto),
      ).rejects.toThrow(/signature verification failed/i);
    });

    it('should reject verification if gateway order ID does not match local order record', async () => {
      sampleOrder.razorpayOrderId = 'order_test_CORRECT';

      const verificationDto = {
        razorpayOrderId: 'order_test_WRONG',
        razorpayPaymentId: 'pay_test_123456',
        razorpaySignature: 'any_sig',
      };

      await expect(
        paymentsService.verifyPayment('sattvic-bhojan', 'ORD-20261022-P001', verificationDto),
      ).rejects.toThrow(/mismatched gateway order id/i);
    });
  });

  describe('handleWebhook (Cryptographic Webhook Signature & Idempotency)', () => {
    it('should verify raw payload signature, capture payment, and idempotently ignore duplicate deliveries', async () => {
      const rzpOrderId = 'order_test_webhook_123';
      sampleOrder.razorpayOrderId = rzpOrderId;
      sampleOrder.paymentStatus = OrderPaymentStatus.PENDING;

      const webhookPayload = {
        entity: 'event',
        account_id: 'acc_test_123',
        event: 'payment.captured',
        id: 'evt_unique_123456',
        payload: {
          payment: {
            entity: {
              id: 'pay_test_webhook_999',
              order_id: rzpOrderId,
              amount: 45000,
              currency: 'INR',
              status: 'captured',
              method: 'upi',
            },
          },
        },
      };

      const rawBody = JSON.stringify(webhookPayload);
      const validWebhookSignature = crypto
        .createHmac('sha256', testWebhookSecret)
        .update(rawBody)
        .digest('hex');

      // 1. First delivery
      const firstResult = await paymentsService.handleWebhook(rawBody, validWebhookSignature);
      expect(firstResult.status).toBe('ok');
      expect(sampleOrder.paymentStatus).toBe(OrderPaymentStatus.PAID);
      expect(mockWebhookModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ eventId: 'evt_unique_123456', eventType: 'payment.captured' }),
      );

      // 2. Duplicate webhook delivery (simulate webhook retry from gateway)
      mockWebhookModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue({ eventId: 'evt_unique_123456' }),
      });

      const duplicateResult = await paymentsService.handleWebhook(rawBody, validWebhookSignature);
      expect(duplicateResult.status).toBe('already_processed');
    });

    it('should reject webhooks with invalid X-Razorpay-Signature', async () => {
      const rawBody = JSON.stringify({ event: 'payment.captured' });
      const invalidSignature = 'invalid_webhook_sig';

      await expect(
        paymentsService.handleWebhook(rawBody, invalidSignature),
      ).rejects.toThrow(/invalid webhook signature/i);
    });
  });

  describe('processRefund (Tenant Authorization & Lifecycle)', () => {
    it('should allow authorized restaurant owner to process full refund and mark paymentStatus as REFUNDED', async () => {
      sampleOrder.paymentStatus = OrderPaymentStatus.PAID;
      sampleOrder.razorpayPaymentId = 'pay_test_capture_123';
      sampleOrder.pricing.total = 450.0;
      sampleOrder.refundDetails = [];

      const result = await paymentsService.processRefund(
        userOwner as any,
        restaurantId.toString(),
        sampleOrder._id.toString(),
        { reason: 'Customer requested cancellation' },
      );

      expect(result.amount).toBe(450.0);
      expect(result.paymentStatus).toBe(OrderPaymentStatus.REFUNDED);
      expect(sampleOrder.paymentStatus).toBe(OrderPaymentStatus.REFUNDED);
      expect(sampleOrder.refundDetails).toHaveLength(1);
      expect(mockOrderEventsService.emit).toHaveBeenCalledWith(
        restaurantId.toString(),
        'ORDER_STATUS_CHANGED',
        sampleOrder,
      );
    });

    it('should reject refund if order is unpaid', async () => {
      sampleOrder.paymentStatus = OrderPaymentStatus.UNPAID;

      await expect(
        paymentsService.processRefund(
          userOwner as any,
          restaurantId.toString(),
          sampleOrder._id.toString(),
          {},
        ),
      ).rejects.toThrow(/not in PAID state/i);
    });

    it('should prevent cross-restaurant staff from refunding another restaurant order', async () => {
      await expect(
        paymentsService.processRefund(
          userForeignStaff as any,
          restaurantId.toString(),
          sampleOrder._id.toString(),
          {},
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

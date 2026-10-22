import { api } from './api';
import { Order, OrderPaymentStatus } from './types';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Loads the official Razorpay Checkout SDK dynamically in browser.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface LaunchCheckoutOptions {
  restaurantSlug: string;
  orderNumber: string;
  restaurantName?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess: (updatedOrder: Order) => void;
  onDismiss?: () => void;
  onError: (errorMessage: string) => void;
}

/**
 * Securely launches Razorpay checkout for a given order:
 * 1. Calls trusted backend to create/retrieve Razorpay order ID and key ID.
 * 2. Launches the Razorpay checkout modal with luxury brand styling.
 * 3. On success, sends HMAC signature to backend for cryptographic verification.
 * 4. Calls onSuccess with the verified order marked PAID.
 */
export async function launchRazorpayCheckout({
  restaurantSlug,
  orderNumber,
  restaurantName = 'Prasadam Dine',
  customerName = '',
  customerPhone = '',
  customerEmail = '',
  onSuccess,
  onDismiss,
  onError,
}: LaunchCheckoutOptions): Promise<void> {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      onError('Unable to load payment gateway. Please check your internet connection and try again.');
      return;
    }

    // Server-side initialization of Razorpay order with trusted pricing
    const paymentOrder = await api.payments.createPaymentOrder(restaurantSlug, orderNumber);

    const options = {
      key: paymentOrder.keyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency || 'INR',
      name: restaurantName,
      description: `Payment for Order #${orderNumber}`,
      order_id: paymentOrder.razorpayOrderId,
      prefill: {
        name: customerName || paymentOrder.customer?.name || '',
        contact: customerPhone || paymentOrder.customer?.contact || '',
        email: customerEmail || '',
      },
      theme: {
        color: '#5E0B15', // Prasadam Brand Burgundy
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const verifyResult = await api.payments.verifyPayment(restaurantSlug, orderNumber, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          onSuccess(verifyResult.order);
        } catch (err: any) {
          onError(err.message || 'Payment signature verification failed. Please contact restaurant staff.');
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (failResponse: any) => {
      const desc = failResponse?.error?.description || 'Payment was unsuccessful or declined by your bank.';
      onError(desc);
    });

    rzp.open();
  } catch (err: any) {
    onError(err.message || 'Failed to initiate payment session. Please try again.');
  }
}

'use client';

import React, { useEffect, useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  ChefHat,
  BellRing,
  Check,
  AlertTriangle,
  RefreshCw,
  UtensilsCrossed,
  CreditCard,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { api } from '@/lib/api';
import { Order, OrderStatus, OrderPaymentStatus } from '@/lib/types';
import { launchRazorpayCheckout } from '@/lib/razorpay';

interface OrderStatusModalProps {
  restaurantSlug: string;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ restaurantSlug }) => {
  const { activeOrder, setActiveOrder, clearActiveOrder } = useCart();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(activeOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentOrder(activeOrder);
    if (activeOrder) {
      setIsDismissed(false);
    }
  }, [activeOrder]);

  // Live polling every 5 seconds to track kitchen progress
  useEffect(() => {
    if (!currentOrder || isDismissed) return;

    // Terminal statuses do not require aggressive polling
    if (
      currentOrder.status === OrderStatus.SERVED ||
      currentOrder.status === OrderStatus.CANCELLED
    ) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const res = await api.orders.getPublicOrderStatus(
          restaurantSlug,
          currentOrder.orderNumber,
        );
        if (res?.order) {
          setCurrentOrder(res.order);
          setActiveOrder(res.order);
        }
      } catch {
        // Silent polling error handling
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [currentOrder, restaurantSlug, isDismissed, setActiveOrder]);

  const handleManualRefresh = async () => {
    if (!currentOrder) return;
    setIsRefreshing(true);
    try {
      const res = await api.orders.getPublicOrderStatus(
        restaurantSlug,
        currentOrder.orderNumber,
      );
      if (res?.order) {
        setCurrentOrder(res.order);
        setActiveOrder(res.order);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePayNow = async () => {
    if (!currentOrder) return;
    setIsPaying(true);
    setPayError(null);

    await launchRazorpayCheckout({
      restaurantSlug,
      orderNumber: currentOrder.orderNumber,
      customerName: currentOrder.customerName || '',
      customerPhone: currentOrder.customerPhone || '',
      onSuccess: (updatedOrder) => {
        setCurrentOrder(updatedOrder);
        setActiveOrder(updatedOrder);
        setIsPaying(false);
      },
      onError: (errMsg) => {
        setPayError(errMsg);
        setIsPaying(false);
      },
    });
  };

  if (!currentOrder || isDismissed) return null;

  const steps = [
    { key: OrderStatus.PENDING, label: 'Received', icon: Clock },
    { key: OrderStatus.ACCEPTED, label: 'Kitchen Confirmed', icon: CheckCircle2 },
    { key: OrderStatus.PREPARING, label: 'Preparing Fresh', icon: ChefHat },
    { key: OrderStatus.READY, label: 'Ready for Service', icon: BellRing },
    { key: OrderStatus.SERVED, label: 'Served', icon: Check },
  ];

  const statusOrderIndex: Record<string, number> = {
    [OrderStatus.PENDING]: 0,
    [OrderStatus.ACCEPTED]: 1,
    [OrderStatus.PREPARING]: 2,
    [OrderStatus.READY]: 3,
    [OrderStatus.SERVED]: 4,
  };

  const isCancelled = currentOrder.status === OrderStatus.CANCELLED;
  const currentStepIndex = statusOrderIndex[currentOrder.status] ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsDismissed(true)}
      />

      <div className="relative w-full max-w-lg bg-white border-2 border-[#5E0B15] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#EDE1CF] border-b border-[#DCD5C9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#5E0B15] text-white flex items-center justify-center font-mono font-bold">
              #
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#5E0B15] tracking-wider uppercase font-luxury">
                  {currentOrder.orderNumber}
                </h3>
                {currentOrder.tableNumber && (
                  <span className="text-[10px] font-bold bg-white border border-[#DCD5C9] text-[#594B42] px-1.5 py-0.5 uppercase">
                    {currentOrder.tableNumber}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#594B42]">Live Kitchen Status Tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-1.5 text-[#594B42] hover:text-[#5E0B15] hover:bg-[#DCD5C9] transition-colors cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#5E0B15]' : ''}`}
              />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-[#594B42] hover:text-[#5E0B15] hover:bg-[#DCD5C9] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Status Stepper */}
          {isCancelled ? (
            <div className="p-4 bg-[#FDF0F1] border border-[#F6C6CC] text-[#90323D] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-1">
                  Order Cancelled
                </h4>
                <p className="text-xs leading-relaxed">
                  {currentOrder.statusHistory?.slice(-1)[0]?.reason ||
                    'This order was cancelled by the kitchen staff. Please consult your server.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF7F2] border border-[#DCD5C9] p-4">
              <div className="relative flex justify-between items-center">
                {/* Connecting track */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#DCD5C9] z-0" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-[#1E562A] z-0 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (currentStepIndex / (steps.length - 1)) * 100)}%`,
                  }}
                />

                {steps.map((s, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;
                  const Icon = s.icon;

                  return (
                    <div
                      key={s.key}
                      className="relative z-10 flex flex-col items-center gap-1.5"
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#1E562A] text-white'
                            : 'bg-white border-2 border-[#DCD5C9] text-[#594B42]'
                        } ${isCurrent ? 'ring-2 ring-[#5E0B15]' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase text-center max-w-[65px] leading-tight ${
                          isCurrent
                            ? 'text-[#5E0B15]'
                            : isDone
                              ? 'text-[#1C120C]'
                              : 'text-[#594B42]'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Itemized Order Details */}
          <div className="bg-white border border-[#DCD5C9] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCD5C9] pb-2 text-xs font-black uppercase text-[#5E0B15]">
              <span>Items Ordered</span>
              <span className="font-mono">
                {currentOrder.pricing.currency} {currentOrder.pricing.total.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs border-b border-[#FAF7F2] pb-1">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#5E0B15]">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-[#1C120C] uppercase tracking-wide">
                        {item.name}
                      </span>
                    </div>
                    {item.instructions && (
                      <p className="text-[10px] text-[#90323D] italic ml-5">
                        Note: {item.instructions}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-[#594B42]">
                    {currentOrder.pricing.currency} {item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2.5 border-t border-[#DCD5C9] flex justify-between items-center text-xs">
              <span className="text-[#594B42] font-medium">Payment Status:</span>
              <div className="flex items-center gap-1.5">
                {currentOrder.paymentStatus === OrderPaymentStatus.PAID ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#EBF7EE] text-[#1E562A] border border-[#BCE1C7] uppercase">
                    <ShieldCheck className="w-3 h-3 text-[#1E562A]" />
                    PAID ({currentOrder.paymentMethod.replace(/_/g, ' ')})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#FEF7EC] text-[#9A6216] border border-[#F6DEBA] uppercase">
                    UNPAID ({currentOrder.paymentMethod.replace(/_/g, ' ')})
                  </span>
                )}
              </div>
            </div>

            {/* Pay Now Button for Unpaid Orders */}
            {currentOrder.paymentStatus !== OrderPaymentStatus.PAID &&
              currentOrder.status !== OrderStatus.CANCELLED && (
                <div className="pt-3 border-t border-[#DCD5C9]">
                  {payError && (
                    <div className="mb-2 p-2 bg-[#FDF0F1] border border-[#F6C6CC] text-[#90323D] text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{payError}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={isPaying}
                    className="w-full py-2.5 bg-[#5E0B15] hover:bg-[#450810] text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Opening Razorpay Checkout...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-white" />
                        <span>
                          Pay Now via Razorpay ({currentOrder.pricing.currency}{' '}
                          {currentOrder.pricing.total.toFixed(2)})
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-[#594B42] mt-1.5 uppercase font-bold">
                    Test Mode Active • Instant Kitchen Confirmation
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#EDE1CF] border-t border-[#DCD5C9] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              clearActiveOrder();
              setIsDismissed(true);
            }}
            className="text-xs text-[#594B42] hover:text-[#90323D] font-bold uppercase underline cursor-pointer"
          >
            Start New Order
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="px-5 py-2 bg-[#5E0B15] hover:bg-[#450810] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Keep Browsing Menu
          </button>
        </div>
      </div>
    </div>
  );
};

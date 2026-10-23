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

      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E8DEC9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#FFFDF9] border-b border-[#E8DEC9] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] flex items-center justify-center font-mono font-bold shadow-xs">
              #
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#7A0C1E] tracking-wider uppercase font-luxury">
                  {currentOrder.orderNumber}
                </h3>
                {currentOrder.tableNumber && (
                  <span className="text-[10px] font-bold bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#92400E] px-2 py-0.5 rounded-full uppercase">
                    {currentOrder.tableNumber}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#6E5D53]">Live Kitchen Status Tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl text-[#6E5D53] hover:text-[#7A0C1E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              title="Refresh status"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#7A0C1E]' : ''}`}
              />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 rounded-xl text-[#6E5D53] hover:text-[#7A0C1E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 bg-[#FAF7F2]">
          {/* Status Stepper */}
          {isCancelled ? (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-red-800 flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
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
            <div className="bg-white rounded-2xl border border-[#E8DEC9] p-5 shadow-sm">
              <div className="relative flex justify-between items-center">
                {/* Connecting track */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#E8DEC9] z-0" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-gradient-to-r from-[#F59E0B] to-[#1E562A] z-0 transition-all duration-500"
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#1E562A] text-white shadow-xs'
                            : 'bg-white border-2 border-[#E8DEC9] text-[#8C7A6F]'
                        } ${isCurrent ? 'ring-4 ring-[#FEF3C7] bg-[#7A0C1E] text-white' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase text-center max-w-[65px] leading-tight ${
                          isCurrent
                            ? 'text-[#7A0C1E]'
                            : isDone
                              ? 'text-[#1C120C]'
                              : 'text-[#8C7A6F]'
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
          <div className="bg-white rounded-2xl border border-[#E8DEC9] p-5 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-2 text-xs font-black uppercase text-[#7A0C1E]">
              <span>Items Ordered</span>
              <span className="font-mono text-sm">
                {currentOrder.pricing.currency} {currentOrder.pricing.total.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs border-b border-[#FAF7F2] pb-1.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#7A0C1E]">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-[#1C120C] uppercase tracking-wide">
                        {item.name}
                      </span>
                    </div>
                    {item.instructions && (
                      <p className="text-[10px] text-[#B45309] italic ml-5">
                        Note: {item.instructions}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-[#6E5D53]">
                    {currentOrder.pricing.currency} {item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2.5 border-t border-[#E8DEC9] flex justify-between items-center text-xs">
              <span className="text-[#6E5D53] font-medium">Payment Status:</span>
              <div className="flex items-center gap-1.5">
                {currentOrder.paymentStatus === OrderPaymentStatus.PAID ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-[#EBF7EE] text-[#1E562A] border border-[#BCE1C7] rounded-full uppercase">
                    <ShieldCheck className="w-3 h-3 text-[#1E562A]" />
                    PAID ({currentOrder.paymentMethod.replace(/_/g, ' ')})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 rounded-full uppercase">
                    UNPAID ({currentOrder.paymentMethod.replace(/_/g, ' ')})
                  </span>
                )}
              </div>
            </div>

            {/* Pay Now Button for Unpaid Orders */}
            {currentOrder.paymentStatus !== OrderPaymentStatus.PAID &&
              currentOrder.status !== OrderStatus.CANCELLED && (
                <div className="pt-3 border-t border-[#E8DEC9]">
                  {payError && (
                    <div className="mb-2 p-2 bg-red-50 rounded-xl border border-red-200 text-red-800 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                      <span>{payError}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handlePayNow}
                    disabled={isPaying}
                    className="w-full py-3 bg-gradient-to-r from-[#8B1226] to-[#680514] hover:from-[#9E152D] hover:to-[#7A0C1E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isPaying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FDE68A]" />
                        <span>Opening Razorpay Checkout...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-[#FDE68A]" />
                        <span>
                          Pay Now via Razorpay ({currentOrder.pricing.currency}{' '}
                          {currentOrder.pricing.total.toFixed(2)})
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-[#8C7A6F] mt-1.5 uppercase font-semibold">
                    Test Mode Active • Instant Kitchen Confirmation
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#FFFDF9] border-t border-[#E8DEC9] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              clearActiveOrder();
              setIsDismissed(true);
            }}
            className="text-xs text-[#8C7A6F] hover:text-[#7A0C1E] font-bold uppercase underline cursor-pointer"
          >
            Start New Order
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#8B1226] to-[#680514] hover:from-[#9E152D] hover:to-[#7A0C1E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Keep Browsing Menu
          </button>
        </div>
      </div>
    </div>
  );
};

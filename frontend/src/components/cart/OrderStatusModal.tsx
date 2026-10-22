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
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { api } from '@/lib/api';
import { Order, OrderStatus } from '@/lib/types';

interface OrderStatusModalProps {
  restaurantSlug: string;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({ restaurantSlug }) => {
  const { activeOrder, setActiveOrder, clearActiveOrder } = useCart();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(activeOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

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

      <div className="relative w-full max-w-lg bg-[#FAF7F2] rounded-2xl border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E8E2D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#5E0B15] text-white flex items-center justify-center font-mono font-bold shadow-xs">
              #
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#5E0B15] tracking-wider uppercase">
                  {currentOrder.orderNumber}
                </h3>
                {currentOrder.tableNumber && (
                  <span className="text-[10px] font-bold bg-[#FAF7F2] border border-[#E8E2D9] text-[#594B42] px-2 py-0.5 rounded-full uppercase">
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
              className="p-1.5 text-[#594B42] hover:text-[#1C120C] hover:bg-[#FAF7F2] rounded-lg transition-colors"
              title="Refresh status"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#5E0B15]' : ''}`}
              />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 text-[#594B42] hover:text-[#1C120C] hover:bg-[#FAF7F2] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Status Stepper */}
          {isCancelled ? (
            <div className="p-4 rounded-xl bg-[#FDF0F1] border border-[#F6C6CC] text-[#90323D] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-1">
                  Order Cancelled
                </h4>
                <p className="text-xs leading-relaxed">
                  {currentOrder.statusHistory?.slice(-1)[0]?.reason ||
                    'This order was cancelled by the kitchen staff. Please consult your server.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 shadow-xs">
              <div className="relative flex justify-between items-center">
                {/* Connecting track */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#EFE9DF] z-0" />
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
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#1E562A] text-white shadow-xs'
                            : 'bg-white border-2 border-[#E8E2D9] text-[#9C8B7E]'
                        } ${isCurrent ? 'ring-4 ring-[#1E562A]/20 scale-110' : ''}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase text-center max-w-[65px] leading-tight ${
                          isCurrent
                            ? 'text-[#1E562A]'
                            : isDone
                              ? 'text-[#1C120C]'
                              : 'text-[#9C8B7E]'
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
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-2 text-xs font-bold uppercase text-[#594B42]">
              <span>Items Ordered</span>
              <span>
                {currentOrder.pricing.currency} {currentOrder.pricing.total.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {currentOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs">
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
                      <p className="text-[10px] text-[#594B42] italic ml-5">
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

            <div className="pt-2 border-t border-[#F5EFE6] flex justify-between items-center text-xs text-[#594B42]">
              <span>Payment Status:</span>
              <span className="font-bold uppercase text-[#5E0B15]">
                {currentOrder.paymentStatus} ({currentOrder.paymentMethod.replace(/_/g, ' ')})
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-[#E8E2D9] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              clearActiveOrder();
              setIsDismissed(true);
            }}
            className="text-xs text-[#594B42] hover:text-[#90323D] font-bold uppercase underline"
          >
            Start New Order
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="px-5 py-2.5 bg-[#5E0B15] hover:bg-[#450810] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs"
          >
            Keep Browsing Menu
          </button>
        </div>
      </div>
    </div>
  );
};

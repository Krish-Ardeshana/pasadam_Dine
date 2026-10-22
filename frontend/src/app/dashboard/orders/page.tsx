'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  BellRing,
  Check,
  XCircle,
  RefreshCw,
  Search,
  AlertCircle,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  Radio,
  FileText,
  ShieldCheck,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Badge } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Table';
import { useAuth } from '@/context/auth-context';
import { api, BACKEND_ORIGIN } from '@/lib/api';
import { Order, OrderStatus, OrderPaymentStatus } from '@/lib/types';

export default function RestaurantOrdersPage() {
  const { currentRestaurant } = useAuth();
  const restaurantId = currentRestaurant?._id;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING' | 'PREPARING' | 'READY' | 'ALL'>('ACTIVE');
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isConnectedSse, setIsConnectedSse] = useState(false);

  // Cancellation modal state
  const [declineOrderId, setDeclineOrderId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  // Detail modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundFeedback, setRefundFeedback] = useState<string | null>(null);

  const prevPendingCountRef = useRef(0);

  const playChime = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext policy fallback
    }
  }, [soundEnabled]);

  const loadOrders = useCallback(async (isBackground = false) => {
    if (!restaurantId) return;
    if (!isBackground) setIsLoading(true);
    setError(null);

    try {
      const res = await api.orders.listRestaurantOrders(restaurantId, {
        limit: 100,
        activeOnly: activeTab === 'ACTIVE',
        status:
          activeTab === 'PENDING'
            ? OrderStatus.PENDING
            : activeTab === 'PREPARING'
              ? OrderStatus.PREPARING
              : activeTab === 'READY'
                ? OrderStatus.READY
                : undefined,
      });

      const fetched = res.data || [];
      const pendingCount = fetched.filter((o) => o.status === OrderStatus.PENDING).length;
      if (pendingCount > prevPendingCountRef.current) {
        playChime();
      }
      prevPendingCountRef.current = pendingCount;

      setOrders(fetched);
    } catch (err: any) {
      if (!isBackground) {
        setError(err.message || 'Failed to fetch restaurant orders');
      }
    } finally {
      if (!isBackground) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [restaurantId, activeTab, playChime]);

  // Initial load
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Background fallback polling every 6 seconds
  useEffect(() => {
    if (!restaurantId) return;
    const interval = setInterval(() => {
      loadOrders(true);
    }, 6000);
    return () => clearInterval(interval);
  }, [restaurantId, loadOrders]);

  // Real-Time Server-Sent Events (SSE) Stream
  useEffect(() => {
    if (!restaurantId || typeof window === 'undefined') return;

    const streamUrl = `${BACKEND_ORIGIN}/api/v1/restaurants/${restaurantId}/orders/stream`;
    const token = localStorage.getItem('prasadam_access_token');
    
    // Note: Standard EventSource does not support custom headers, but SSE stream can be listened to
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(streamUrl);
      eventSource.onopen = () => {
        setIsConnectedSse(true);
      };
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload?.order) {
            setOrders((prev) => {
              const existingIdx = prev.findIndex((o) => o._id === payload.order._id);
              if (existingIdx > -1) {
                const next = [...prev];
                next[existingIdx] = payload.order;
                return next;
              } else {
                playChime();
                return [payload.order, ...prev];
              }
            });
          }
        } catch {
          // Parse error
        }
      };
      eventSource.onerror = () => {
        setIsConnectedSse(false);
        // Will fallback to periodic 6s polling seamlessly
      };
    } catch {
      setIsConnectedSse(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [restaurantId, playChime]);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus, reason?: string) => {
    if (!restaurantId) return;
    try {
      const updated = await api.orders.updateOrderStatus(restaurantId, orderId, {
        status,
        reason,
      });

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o)),
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Could not update order status');
    }
  };

  const handleConfirmDecline = async () => {
    if (!declineOrderId) return;
    setIsDeclining(true);
    try {
      await handleUpdateStatus(
        declineOrderId,
        OrderStatus.CANCELLED,
        declineReason || 'Declined by restaurant kitchen',
      );
      setDeclineOrderId(null);
      setDeclineReason('');
    } finally {
      setIsDeclining(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!restaurantId || !selectedOrder) return;
    setIsRefunding(true);
    setRefundFeedback(null);
    try {
      const res = await api.payments.refundOrder(restaurantId, selectedOrder._id, {
        reason: refundReason.trim() || 'Refund initiated by restaurant manager',
      });
      setRefundFeedback('Refund processed successfully through Razorpay.');
      // Update local state
      if (res?.order) {
        setSelectedOrder(res.order);
        setOrders((prev) => prev.map((o) => (o._id === res.order._id ? res.order : o)));
      }
      setRefundReason('');
    } catch (err: any) {
      setRefundFeedback(err.message || 'Refund failed to process. Check transaction state.');
    } finally {
      setIsRefunding(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(s) ||
      (o.customerName || '').toLowerCase().includes(s) ||
      (o.tableNumber || '').toLowerCase().includes(s)
    );
  });

  const pendingCount = orders.filter((o) => o.status === OrderStatus.PENDING).length;
  const preparingCount = orders.filter((o) => o.status === OrderStatus.PREPARING).length;
  const readyCount = orders.filter((o) => o.status === OrderStatus.READY).length;

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'warning';
      case OrderStatus.ACCEPTED:
        return 'info';
      case OrderStatus.PREPARING:
        return 'primary';
      case OrderStatus.READY:
        return 'success';
      case OrderStatus.SERVED:
        return 'default';
      case OrderStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#BCD0BD]/40">
          <div>
            <h1 className="text-xl font-extrabold text-[#23201C] uppercase tracking-wide">
              Kitchen & Live Orders
            </h1>
            <p className="text-xs text-[#594B42]">
              Manage real-time dining requests for {currentRestaurant?.name || 'Restaurant'}
            </p>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#BCD0BD]/60 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                activeTab === 'ACTIVE'
                  ? 'bg-[#829582] text-white shadow-xs'
                  : 'bg-white text-[#23201C] hover:bg-[#EFE9DF]'
              }`}
            >
              Active Stream ({orders.filter((o) => o.status !== OrderStatus.SERVED && o.status !== OrderStatus.CANCELLED).length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                activeTab === 'PENDING'
                  ? 'bg-[#DE6C3A] text-white shadow-xs'
                  : 'bg-white text-[#23201C] hover:bg-[#EFE9DF]'
              }`}
            >
              <span>Pending New</span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#DE6C3A] font-black text-[10px] flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('PREPARING')}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                activeTab === 'PREPARING'
                  ? 'bg-[#829582] text-white shadow-xs'
                  : 'bg-white text-[#23201C] hover:bg-[#EFE9DF]'
              }`}
            >
              Cooking ({preparingCount})
            </button>
            <button
              onClick={() => setActiveTab('READY')}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                activeTab === 'READY'
                  ? 'bg-[#2D5A27] text-white shadow-xs'
                  : 'bg-white text-[#23201C] hover:bg-[#EFE9DF]'
              }`}
            >
              Ready to Serve ({readyCount})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all ${
                activeTab === 'ALL'
                  ? 'bg-[#829582] text-white shadow-xs'
                  : 'bg-white text-[#23201C] hover:bg-[#EFE9DF]'
              }`}
            >
              All / History
            </button>
          </div>

          {/* Quick Actions & Live Badge */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Real-time Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#BCD0BD]/60 text-[11px] font-bold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnectedSse ? 'bg-[#2D5A27] animate-ping' : 'bg-[#DE6C3A]'
                }`}
              />
              <span className="text-[#594B42] uppercase">
                {isConnectedSse ? 'Live Stream Active' : 'Polling Sync (6s)'}
              </span>
            </div>

            {/* Audio chime toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                  : 'bg-white text-[#594B42] border-[#BCD0BD]/60 hover:bg-[#EFE9DF]'
              }`}
              title={soundEnabled ? 'Kitchen alerts sound on' : 'Kitchen alerts sound off'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Manual refresh */}
            <button
              onClick={() => {
                setIsRefreshing(true);
                loadOrders();
              }}
              disabled={isRefreshing}
              className="p-2 bg-white text-[#594B42] hover:text-[#23201C] border border-[#BCD0BD]/60 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#9C8B7E] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="FILTER ORDERS BY ORDER #, TABLE, OR CUSTOMER..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white rounded-xl border border-[#BCD0BD]/60 focus:outline-none focus:ring-2 focus:ring-[#829582]/30 uppercase placeholder-[#9C8B7E]"
          />
        </div>

        {/* Orders Feed */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-[#FDF0F1] border border-[#F6C6CC] text-[#90323D] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-1">Error Loading Orders</h4>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#BCD0BD]/60 p-12 text-center shadow-xs">
            <UtensilsCrossed className="w-10 h-10 text-[#BCD0BD] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#23201C] uppercase tracking-wider mb-1">
              No orders found
            </h3>
            <p className="text-xs text-[#594B42] max-w-sm mx-auto">
              New dining and online orders placed via QR codes or digital menu will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOrders.map((order) => {
              const isPending = order.status === OrderStatus.PENDING;
              const isAccepted = order.status === OrderStatus.ACCEPTED;
              const isPreparing = order.status === OrderStatus.PREPARING;
              const isReady = order.status === OrderStatus.READY;
              const isServed = order.status === OrderStatus.SERVED;
              const isCancelled = order.status === OrderStatus.CANCELLED;

              const timeStr = new Date(order.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isPending
                      ? 'border-[#DE6C3A] ring-2 ring-[#DE6C3A]/20 bg-[#FAF7F2]'
                      : isReady
                        ? 'border-[#2D5A27] ring-1 ring-[#2D5A27]/20'
                        : 'border-[#BCD0BD]/80'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Order Card Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#EFE9DF] pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black font-mono text-[#23201C] tracking-wide">
                            {order.orderNumber}
                          </h4>
                          <Badge variant={getStatusBadgeVariant(order.status) as any} className="text-[10px]">
                            {order.status}
                          </Badge>
                          {order.paymentStatus === OrderPaymentStatus.PAID ? (
                            <span className="text-[10px] font-extrabold text-[#1E562A] bg-[#EBF7EE] border border-[#C3E6CB] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-[#1E562A]" /> PAID
                            </span>
                          ) : order.paymentStatus === OrderPaymentStatus.REFUNDED ? (
                            <span className="text-[10px] font-extrabold text-[#5B21B6] bg-[#F3E8FF] border border-[#DDD6FE] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <RotateCcw className="w-3 h-3 text-[#5B21B6]" /> REFUNDED
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-[#8C6D1F] bg-[#FFF9E6] border border-[#F3DE9C] px-2 py-0.5 rounded-full">
                              UNPAID
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#594B42] font-semibold mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>{timeStr}</span>
                          {order.tableNumber && (
                            <span className="font-bold text-[#DE6C3A] bg-white px-2 py-0.5 rounded-md border border-[#EFE9DF]">
                              {order.tableNumber}
                            </span>
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-[#594B42] hover:text-[#23201C] p-1 rounded-lg hover:bg-[#EFE9DF] transition-colors"
                        title="View Full Order Details"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Customer Info if available */}
                    {(order.customerName || order.customerPhone) && (
                      <div className="text-[11px] bg-[#FAF7F2] p-2 rounded-lg border border-[#EFE9DF] text-[#594B42] flex justify-between">
                        <span>Customer: <strong>{order.customerName || 'Dine-In Guest'}</strong></span>
                        {order.customerPhone && <span>{order.customerPhone}</span>}
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-[#594B42] uppercase tracking-wider flex justify-between">
                        <span>Items ({order.items.length})</span>
                        <span className="font-mono">
                          {order.pricing.currency} {order.pricing.total.toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#DE6C3A] bg-[#FAF7F2] px-1.5 py-0.5 rounded-sm text-[11px]">
                                  {item.quantity}x
                                </span>
                                <span className="font-bold text-[#23201C] uppercase">
                                  {item.name}
                                </span>
                              </div>
                              {item.instructions && (
                                <p className="text-[10px] text-[#DE6C3A] italic ml-6">
                                  {item.instructions}
                                </p>
                              )}
                            </div>
                            <span className="font-mono text-[11px] text-[#594B42]">
                              {order.pricing.currency} {item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Special order note */}
                    {order.specialInstructions && (
                      <div className="text-[11px] p-2 bg-[#FDF0F1] border border-[#F6C6CC] rounded-lg text-[#90323D]">
                        <strong>Order Note:</strong> {order.specialInstructions}
                      </div>
                    )}
                  </div>

                  {/* Lifecycle Action Buttons */}
                  <div className="pt-4 border-t border-[#EFE9DF] mt-4">
                    {isPending && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeclineOrderId(order._id)}
                          className="py-2 px-3 text-xs font-bold uppercase rounded-xl border border-[#F6C6CC] bg-white text-[#90323D] hover:bg-[#FDF0F1] transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order._id, OrderStatus.ACCEPTED)}
                          className="py-2 px-3 text-xs font-bold uppercase rounded-xl bg-[#DE6C3A] hover:bg-[#C95B2A] text-white shadow-xs transition-colors cursor-pointer"
                        >
                          Accept Order
                        </button>
                      </div>
                    )}

                    {isAccepted && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order._id, OrderStatus.PREPARING)}
                        className="w-full py-2.5 px-3 text-xs font-bold uppercase rounded-xl bg-[#829582] hover:bg-[#6C806C] text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order._id, OrderStatus.READY)}
                        className="w-full py-2.5 px-3 text-xs font-bold uppercase rounded-xl bg-[#2D5A27] hover:bg-[#23471E] text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <BellRing className="w-4 h-4" />
                        <span>Mark Ready for Pickup/Serve</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(order._id, OrderStatus.SERVED)}
                        className="w-full py-2.5 px-3 text-xs font-bold uppercase rounded-xl bg-[#23201C] hover:bg-black text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Mark as Served</span>
                      </button>
                    )}

                    {isServed && (
                      <div className="text-center text-xs text-[#2D5A27] font-bold uppercase py-1">
                        ✓ Order Completed & Served
                      </div>
                    )}

                    {isCancelled && (
                      <div className="text-center text-xs text-[#90323D] font-bold uppercase py-1">
                        ✕ Order Cancelled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decline / Cancellation Reason Modal */}
      {declineOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setDeclineOrderId(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#BCD0BD] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#90323D] uppercase tracking-wider">
              Decline Dining Order
            </h3>
            <p className="text-xs text-[#594B42]">
              Please state why this order cannot be fulfilled (e.g. ingredient out of stock, kitchen overloaded). The customer will be notified immediately.
            </p>
            <textarea
              rows={3}
              placeholder="Reason for declining order..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full p-3 text-xs bg-[#FAF7F2] rounded-xl border border-[#BCD0BD] focus:outline-none focus:ring-2 focus:ring-[#90323D]/30 resize-none"
            />
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeclineOrderId(null)}
                className="px-4 py-2 text-xs font-bold uppercase rounded-xl border border-[#BCD0BD] text-[#594B42] hover:bg-[#FAF7F2] transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={isDeclining}
                className="px-4 py-2 text-xs font-bold uppercase rounded-xl bg-[#90323D] text-white hover:bg-[#722730] transition-colors disabled:opacity-50"
              >
                {isDeclining ? 'Cancelling...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail & Timeline Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#BCD0BD] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EFE9DF] pb-3">
              <div>
                <h3 className="text-sm font-black font-mono text-[#23201C]">
                  {selectedOrder.orderNumber}
                </h3>
                <p className="text-[11px] text-[#594B42]">
                  Placed at {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge variant={getStatusBadgeVariant(selectedOrder.status) as any}>
                {selectedOrder.status}
              </Badge>
            </div>

            {/* Item Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-[#594B42] tracking-wider">
                Item Breakdown
              </h4>
              <div className="space-y-2 bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE9DF]">
                {selectedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#23201C]">{i.quantity}x {i.name}</span>
                      {i.instructions && (
                        <p className="text-[10px] text-[#DE6C3A] italic">Note: {i.instructions}</p>
                      )}
                    </div>
                    <span className="font-mono text-[#594B42]">
                      {selectedOrder.pricing.currency} {i.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-[#594B42] tracking-wider">
                Audit Timeline
              </h4>
              <div className="space-y-2 text-xs bg-[#FAF7F2] p-3 rounded-xl border border-[#EFE9DF]">
                {selectedOrder.statusHistory?.map((h, idx) => (
                  <div key={idx} className="flex items-start justify-between text-[11px] border-b border-white last:border-0 pb-1.5 last:pb-0">
                    <div>
                      <span className="font-bold uppercase text-[#23201C]">{h.status}</span>
                      {h.reason && <p className="text-[#594B42] italic">{h.reason}</p>}
                      <p className="text-[10px] text-[#9C8B7E]">By: {h.changedBy}</p>
                    </div>
                    <span className="text-[10px] text-[#9C8B7E]">
                      {new Date(h.changedAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Refund Controls */}
            <div className="space-y-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EFE9DF]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#594B42] uppercase tracking-wider">Payment Status</span>
                <span className="font-extrabold uppercase text-[#23201C] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#594B42]" />
                  {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod.replace(/_/g, ' ')})
                </span>
              </div>

              {selectedOrder.paymentStatus === OrderPaymentStatus.PAID && (
                <div className="pt-3 border-t border-[#E8E2D9] space-y-2">
                  <p className="text-[11px] text-[#594B42]">
                    Customer payment has been settled. If needed, you may issue a secure refund via Razorpay:
                  </p>
                  <input
                    type="text"
                    placeholder="Reason for refund (optional)..."
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-[#BCD0BD] focus:outline-none focus:ring-1 focus:ring-[#90323D]"
                  />
                  {refundFeedback && (
                    <p className="text-[11px] font-semibold text-[#90323D]">
                      {refundFeedback}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleProcessRefund}
                    disabled={isRefunding}
                    className="w-full py-2 bg-[#90323D] hover:bg-[#722730] text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isRefunding ? 'Processing Refund...' : 'Issue Razorpay Refund'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 text-xs font-bold uppercase rounded-xl bg-[#829582] text-white hover:bg-[#6C806C] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

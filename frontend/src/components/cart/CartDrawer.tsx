'use client';

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { api } from '@/lib/api';
import { OrderPaymentMethod, OrderType } from '@/lib/types';

interface CartDrawerProps {
  restaurantSlug: string;
  currency?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  restaurantSlug,
  currency = 'USD',
}) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    updateInstructions,
    removeItem,
    clearCart,
    subtotal,
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    specialInstructions,
    setSpecialInstructions,
    setActiveOrder,
  } = useCart();

  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        orderType,
        tableNumber: tableNumber.trim(),
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        specialInstructions: specialInstructions.trim() || undefined,
        paymentMethod: OrderPaymentMethod.PAY_AT_TABLE,
        items: items.map((i) => ({
          dishId: i.dish._id,
          quantity: i.quantity,
          instructions: i.instructions.trim() || undefined,
        })),
      };

      const placedOrder = await api.orders.createPublicOrder(restaurantSlug, payload);
      clearCart();
      setIsCartOpen(false);
      setActiveOrder(placedOrder);
    } catch (err: any) {
      setError(err.message || 'Failed to submit order. Please try again or notify staff.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#E8E2D9] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 bg-white border-b border-[#E8E2D9] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#5E0B15] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#5E0B15] uppercase tracking-wider">
                  Dining Cart
                </h2>
                <p className="text-[11px] text-[#594B42]">
                  {items.length} {items.length === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-[#594B42] hover:text-[#1C120C] hover:bg-[#FAF7F2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#FDF0F1] border border-[#F6C6CC] text-[#90323D] flex items-start gap-2.5 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#EFE9DF] text-[#9C8B7E] flex items-center justify-center mx-auto">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-[#5E0B15] uppercase tracking-wider">
                  Your cart is empty
                </h3>
                <p className="text-xs text-[#594B42] max-w-xs mx-auto">
                  Browse the menu and select delicious offerings to begin your dining experience.
                </p>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#594B42] uppercase tracking-wider">
                    <span>Order Items</span>
                    <button
                      onClick={clearCart}
                      className="text-[#90323D] hover:underline text-[11px]"
                    >
                      Clear All
                    </button>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.dish._id}
                      className="bg-white rounded-xl border border-[#E8E2D9] p-3.5 space-y-2 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-[#1C120C] uppercase tracking-wide">
                            {item.dish.name}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-[#5E0B15]">
                            {item.dish.currency} {item.dish.price.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.dish._id)}
                          className="text-[#9C8B7E] hover:text-[#90323D] transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-[#E8E2D9] rounded-lg bg-[#FAF7F2] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.dish._id, item.quantity - 1)}
                            className="p-1.5 hover:bg-[#EFE9DF] text-[#594B42] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.dish._id, item.quantity + 1)}
                            className="p-1.5 hover:bg-[#EFE9DF] text-[#594B42] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-black font-mono text-[#5E0B15]">
                          {item.dish.currency} {(item.dish.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Item instructions */}
                      <input
                        type="text"
                        placeholder="Add note (e.g. less spicy, no cilantro)"
                        value={item.instructions}
                        onChange={(e) => updateInstructions(item.dish._id, e.target.value)}
                        className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] bg-[#FAF7F2] text-[#594B42] placeholder-[#9C8B7E] focus:outline-none focus:ring-1 focus:ring-[#90323D]/30"
                      />
                    </div>
                  ))}
                </div>

                {/* Dining Details Form */}
                <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-[#5E0B15] uppercase tracking-wider border-b border-[#F5EFE6] pb-2">
                    Dining Context
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType(OrderType.DINE_IN)}
                      className={`py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                        orderType === OrderType.DINE_IN
                          ? 'bg-[#5E0B15] text-white border-[#5E0B15]'
                          : 'bg-[#FAF7F2] text-[#594B42] border-[#E8E2D9]'
                      }`}
                    >
                      Dine In
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType(OrderType.TAKEAWAY)}
                      className={`py-2 text-xs font-bold uppercase rounded-lg border transition-all ${
                        orderType === OrderType.TAKEAWAY
                          ? 'bg-[#5E0B15] text-white border-[#5E0B15]'
                          : 'bg-[#FAF7F2] text-[#594B42] border-[#E8E2D9]'
                      }`}
                    >
                      Takeaway
                    </button>
                  </div>

                  {orderType === OrderType.DINE_IN && (
                    <div>
                      <label className="text-[11px] font-bold text-[#594B42] uppercase block mb-1">
                        Table Number / Identifier
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Table 4 or Patio 2"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-lg border border-[#E8E2D9] focus:outline-none focus:ring-1 focus:ring-[#90323D]"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#594B42] uppercase block mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-lg border border-[#E8E2D9] focus:outline-none focus:ring-1 focus:ring-[#90323D]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#594B42] uppercase block mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-lg border border-[#E8E2D9] focus:outline-none focus:ring-1 focus:ring-[#90323D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#594B42] uppercase block mb-1">
                      Kitchen Special Instructions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any allergy requests, preparation instructions, etc."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-lg border border-[#E8E2D9] focus:outline-none focus:ring-1 focus:ring-[#90323D] resize-none"
                    />
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 space-y-2 shadow-xs text-xs">
                  <div className="flex justify-between text-[#594B42]">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-bold">
                      {currency} {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#594B42]">
                    <span>Taxes & Fees</span>
                    <span className="font-mono">{currency} 0.00</span>
                  </div>
                  <div className="flex justify-between text-[#594B42]">
                    <span>Payment Method</span>
                    <span className="font-semibold uppercase text-[11px]">Pay at Table / Counter</span>
                  </div>
                  <div className="pt-2 border-t border-[#E8E2D9] flex justify-between items-center text-sm font-black text-[#5E0B15]">
                    <span>Total Amount</span>
                    <span className="font-mono text-base">
                      {currency} {subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Submit */}
          {items.length > 0 && (
            <div className="p-4 bg-white border-t border-[#E8E2D9]">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#5E0B15] hover:bg-[#450810] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Kitchen...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Send to Kitchen ({currency} {subtotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

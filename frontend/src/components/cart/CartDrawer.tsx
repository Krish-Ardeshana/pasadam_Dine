'use client';

import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
  AlertCircle,
  Loader2,
  ArrowRight,
  CreditCard,
  Banknote,
  ShieldCheck,
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
  const [paymentMethod, setPaymentMethod] = useState<OrderPaymentMethod>(OrderPaymentMethod.PAY_AT_TABLE);
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
        paymentMethod,
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

      // If user selected online payment, launch Razorpay checkout immediately
      if (paymentMethod === OrderPaymentMethod.ONLINE_PENDING) {
        const { launchRazorpayCheckout } = await import('@/lib/razorpay');
        await launchRazorpayCheckout({
          restaurantSlug,
          orderNumber: placedOrder.orderNumber,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          onSuccess: (updatedOrder) => {
            setActiveOrder(updatedOrder);
          },
          onError: (errMsg) => {
            setError(errMsg);
          },
        });
      }
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
        <div className="w-screen max-w-md bg-[#FAF7F2] border-l border-[#E8DEC9] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 bg-[#FFFDF9] border-b border-[#E8DEC9] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#7A0C1E] uppercase tracking-wider font-luxury">
                  Dining Cart
                </h2>
                <p className="text-[11px] text-[#6E5D53]">
                  {items.length} {items.length === 1 ? 'item' : 'items'} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-[#6E5D53] hover:text-[#7A0C1E] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-red-800 flex items-start gap-2.5 text-xs shadow-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#B45309] flex items-center justify-center mx-auto shadow-2xs">
                  <UtensilsCrossed className="w-7 h-7" />
                </div>
                <h3 className="text-xs font-black text-[#7A0C1E] uppercase tracking-wider font-luxury">
                  Your cart is empty
                </h3>
                <p className="text-xs text-[#6E5D53] max-w-xs mx-auto">
                  Browse the menu and select delicious offerings to begin your dining experience.
                </p>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
                    <span>Order Items</span>
                    <button
                      onClick={clearCart}
                      className="text-[#B45309] hover:underline text-[11px] cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.dish._id}
                      className="bg-white rounded-2xl border border-[#E8DEC9] p-4 space-y-2.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-[#1C120C] uppercase tracking-wide">
                            {item.dish.name}
                          </h4>
                          <span className="text-[11px] font-mono font-bold text-[#7A0C1E]">
                            {item.dish.currency} {item.dish.price.toFixed(2)}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.dish._id)}
                          className="text-[#8C7A6F] hover:text-[#7A0C1E] transition-colors p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center border border-[#E8DEC9] bg-[#FAF7F2] rounded-xl overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.dish._id, item.quantity - 1)}
                            className="p-1.5 hover:bg-[#7A0C1E] hover:text-white text-[#7A0C1E] transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold font-mono text-[#7A0C1E]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.dish._id, item.quantity + 1)}
                            className="p-1.5 hover:bg-[#7A0C1E] hover:text-white text-[#7A0C1E] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-black font-mono text-[#7A0C1E]">
                          {item.dish.currency} {(item.dish.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Item instructions */}
                      <input
                        type="text"
                        placeholder="Add note (e.g. less spicy, no cilantro)"
                        value={item.instructions}
                        onChange={(e) => updateInstructions(item.dish._id, e.target.value)}
                        className="w-full text-[11px] px-3 py-1.5 rounded-xl border border-[#E8DEC9] bg-[#FAF7F2] text-[#1C120C] placeholder-[#8C7A6F] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>
                  ))}
                </div>

                {/* Dining Details Form */}
                <div className="bg-white rounded-2xl border border-[#E8DEC9] p-4 space-y-3.5 shadow-sm">
                  <h4 className="text-xs font-black text-[#7A0C1E] uppercase tracking-wider border-b border-[#E8DEC9] pb-2 font-luxury">
                    Dining Context
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType(OrderType.DINE_IN)}
                      className={`py-2 text-xs font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                        orderType === OrderType.DINE_IN
                          ? 'bg-gradient-to-r from-[#8B1226] to-[#680514] text-white border-transparent shadow-xs'
                          : 'bg-[#FAF7F2] text-[#6E5D53] border-[#E8DEC9] hover:bg-[#FEF3C7]'
                      }`}
                    >
                      Dine In
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType(OrderType.TAKEAWAY)}
                      className={`py-2 text-xs font-bold uppercase rounded-xl border transition-all cursor-pointer ${
                        orderType === OrderType.TAKEAWAY
                          ? 'bg-gradient-to-r from-[#8B1226] to-[#680514] text-white border-transparent shadow-xs'
                          : 'bg-[#FAF7F2] text-[#6E5D53] border-[#E8DEC9] hover:bg-[#FEF3C7]'
                      }`}
                    >
                      Takeaway
                    </button>
                  </div>

                  {orderType === OrderType.DINE_IN && (
                    <div>
                      <label className="text-[11px] font-bold text-[#6E5D53] uppercase block mb-1">
                        Table Number / Identifier
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Table 4 or Patio 2"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-xl border border-[#E8DEC9] focus:outline-none focus:border-[#F59E0B] text-[#1C120C]"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#6E5D53] uppercase block mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-xl border border-[#E8DEC9] focus:outline-none focus:border-[#F59E0B] text-[#1C120C]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#6E5D53] uppercase block mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-xl border border-[#E8DEC9] focus:outline-none focus:border-[#F59E0B] text-[#1C120C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#6E5D53] uppercase block mb-1">
                      Kitchen Special Instructions
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Any allergy requests, preparation instructions, etc."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] rounded-xl border border-[#E8DEC9] focus:outline-none focus:border-[#F59E0B] resize-none text-[#1C120C]"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#6E5D53] uppercase block">
                    Choose Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod(OrderPaymentMethod.PAY_AT_TABLE)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === OrderPaymentMethod.PAY_AT_TABLE
                          ? 'border-[#F59E0B] bg-[#FEF3C7]/60 shadow-xs'
                          : 'border-[#E8DEC9] bg-white hover:border-[#F59E0B]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Banknote className={`w-4 h-4 ${paymentMethod === OrderPaymentMethod.PAY_AT_TABLE ? 'text-[#7A0C1E]' : 'text-[#6E5D53]'}`} />
                        <span className={`w-2.5 h-2.5 rounded-full ${paymentMethod === OrderPaymentMethod.PAY_AT_TABLE ? 'bg-[#7A0C1E]' : 'bg-transparent'}`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1C120C] uppercase">Pay at Counter</p>
                        <p className="text-[10px] text-[#6E5D53]">Cash / Card after meal</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod(OrderPaymentMethod.ONLINE_PENDING)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === OrderPaymentMethod.ONLINE_PENDING
                          ? 'border-[#F59E0B] bg-[#FEF3C7]/60 shadow-xs'
                          : 'border-[#E8DEC9] bg-white hover:border-[#F59E0B]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <CreditCard className={`w-4 h-4 ${paymentMethod === OrderPaymentMethod.ONLINE_PENDING ? 'text-[#7A0C1E]' : 'text-[#6E5D53]'}`} />
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#8B1226] to-[#680514] text-[#FDE68A]">
                          RAZORPAY
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1C120C] uppercase">Pay Online Now</p>
                        <p className="text-[10px] text-[#6E5D53]">UPI / Cards / NetBanking</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-2xl border border-[#E8DEC9] p-4 space-y-2 text-xs shadow-sm">
                  <div className="flex justify-between text-[#6E5D53]">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-bold text-[#1C120C]">
                      {currency} {subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#6E5D53]">
                    <span>Taxes & Fees</span>
                    <span className="font-mono">{currency} 0.00</span>
                  </div>
                  <div className="flex justify-between text-[#6E5D53]">
                    <span>Payment Selection</span>
                    <span className="font-bold uppercase text-[11px] text-[#7A0C1E]">
                      {paymentMethod === OrderPaymentMethod.ONLINE_PENDING
                        ? 'Razorpay Checkout'
                        : 'Pay at Counter / Table'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[#E8DEC9] flex justify-between items-center text-sm font-black text-[#7A0C1E]">
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
            <div className="p-4 bg-[#FFFDF9] border-t border-[#E8DEC9]">
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#8B1226] to-[#680514] hover:from-[#9E152D] hover:to-[#7A0C1E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#FDE68A]" />
                    <span>Processing Order...</span>
                  </>
                ) : paymentMethod === OrderPaymentMethod.ONLINE_PENDING ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#FDE68A]" />
                    <span>Pay with Razorpay ({currency} {subtotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4 text-[#FDE68A]" />
                  </>
                ) : (
                  <>
                    <span>Confirm & Send to Kitchen ({currency} {subtotal.toFixed(2)})</span>
                    <ArrowRight className="w-4 h-4 text-[#FDE68A]" />
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

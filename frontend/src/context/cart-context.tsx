'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Dish, Order } from '@/lib/types';

export interface CartItem {
  dish: Dish;
  quantity: number;
  instructions: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (dish: Dish, quantity?: number, instructions?: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  updateInstructions: (dishId: string, instructions: string) => void;
  removeItem: (dishId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  specialInstructions: string;
  setSpecialInstructions: (notes: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  clearActiveOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode; restaurantSlug?: string }> = ({
  children,
  restaurantSlug,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrderState] = useState<Order | null>(null);

  // Restore active order from localStorage if available
  useEffect(() => {
    if (!restaurantSlug || typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(`prasadam_active_order_${restaurantSlug}`);
      if (stored) {
        setActiveOrderState(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, [restaurantSlug]);

  const setActiveOrder = (order: Order | null) => {
    setActiveOrderState(order);
    if (!restaurantSlug || typeof window === 'undefined') return;
    if (order) {
      localStorage.setItem(`prasadam_active_order_${restaurantSlug}`, JSON.stringify(order));
    } else {
      localStorage.removeItem(`prasadam_active_order_${restaurantSlug}`);
    }
  };

  const clearActiveOrder = () => {
    setActiveOrder(null);
  };

  const addItem = (dish: Dish, quantity = 1, instructions = '') => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.dish._id === dish._id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          instructions: instructions || next[existingIndex].instructions,
        };
        return next;
      }
      return [...prev, { dish, quantity, instructions }];
    });
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.dish._id === dishId ? { ...item, quantity } : item)),
    );
  };

  const updateInstructions = (dishId: string, instructions: string) => {
    setItems((prev) =>
      prev.map((item) => (item.dish._id === dishId ? { ...item, instructions } : item)),
    );
  };

  const removeItem = (dishId: string) => {
    setItems((prev) => prev.filter((item) => item.dish._id !== dishId));
  };

  const clearCart = () => {
    setItems([]);
    setSpecialInstructions('');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0).toFixed(2),
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        updateInstructions,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        specialInstructions,
        setSpecialInstructions,
        isCartOpen,
        setIsCartOpen,
        activeOrder,
        setActiveOrder,
        clearActiveOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

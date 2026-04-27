/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  basePrice: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity' | 'basePrice'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalSubtotal: number;
  itemCount: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('evocarelab_cart');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('evocarelab_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Omit<CartItem, 'quantity' | 'basePrice'>, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      
      const newTotalQuantity = (existing?.quantity || 0) + quantity;
      
      const basePrice = product.price;
      let unitPrice = basePrice;
      if (newTotalQuantity === 2) unitPrice = basePrice * 0.95;
      if (newTotalQuantity >= 3) unitPrice = basePrice * 0.90;

      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: newTotalQuantity, price: unitPrice } : i);
      }
      return [...prev, { ...product, basePrice, quantity, price: unitPrice }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => {
      return prev.map(i => {
        if (i.id === id) {
          const newQty = Math.max(1, i.quantity + delta);
          
          let newPrice = i.basePrice;
          if (newQty === 2) newPrice = i.basePrice * 0.95;
          if (newQty >= 3) newPrice = i.basePrice * 0.90;
          
          return { ...i, quantity: newQty, price: newPrice };
        }
        return i;
      });
    });
  };

  const clearCart = React.useCallback(() => setItems([]), []);

  const totalSubtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, updateQuantity, 
      isCartOpen, setIsCartOpen, totalSubtotal, itemCount, clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

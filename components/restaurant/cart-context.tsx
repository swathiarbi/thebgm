'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { items, menuPhoto } from '@/lib/menu';
import type { CartLine, MenuCategory, MenuItem } from '@/lib/types';

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (item: MenuItem, category?: MenuCategory) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = 'the-bgm-cart';

const orderable = new Map(items.filter(item => item.is_available).map(item => [item.id, item]));

function cartLine(item: MenuItem, quantity: number): CartLine {
  return {
    item: { id: item.id, name: item.name, price: item.price, image_url: menuPhoto(item) },
    categoryName: item.category?.name ?? 'THE BGM',
    quantity,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) {
        const previous = JSON.parse(saved);
        if (Array.isArray(previous)) {
          setLines(previous.flatMap(line => {
            const item = orderable.get(line?.item?.id);
            return item && Number.isSafeInteger(line.quantity) && line.quantity > 0
              ? [cartLine(item, line.quantity)] : [];
          }));
        }
      }
    } catch {
      setLines([]);
    } finally {
      setRestored(true);
    }
  }, []);

  useEffect(() => {
    if (restored) window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, restored]);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0),
    addItem: (item) => setLines((current) => {
      const existing = current.find((line) => line.item.id === item.id);
      if (existing) {
        return current.map((line) => line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...current, cartLine(item, 1)];
    }),
    updateQuantity: (itemId, quantity) => setLines((current) => quantity <= 0 ? current.filter((line) => line.item.id !== itemId) : current.map((line) => line.item.id === itemId ? { ...line, quantity } : line)),
    removeItem: (itemId) => setLines((current) => current.filter((line) => line.item.id !== itemId)),
    clearCart: () => setLines([]),
  }), [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

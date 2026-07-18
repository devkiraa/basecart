"use client";

import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  variant?: string;
  quantity: number;
}

export interface CartStore {
  tenantId: string;
  items: CartItem[];
  updatedAt: number;
}

function getCartKey(tenantId: string) {
  return `basecart_cart_${tenantId}`;
}

export function useCart(tenantId: string) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(getCartKey(tenantId));
      if (raw) {
        const store: CartStore = JSON.parse(raw);
        setItems(store.items || []);
      }
    } catch {}
    setLoaded(true);
  }, [tenantId]);

  const persist = useCallback(
    (next: CartItem[]) => {
      setItems(next);
      const store: CartStore = { tenantId, items: next, updatedAt: Date.now() };
      localStorage.setItem(getCartKey(tenantId), JSON.stringify(store));
    },
    [tenantId]
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, qty = 1) => {
      setItems((prev) => {
        const idx = prev.findIndex(
          (i) => i.productId === item.productId && i.variant === item.variant
        );
        let next: CartItem[];
        if (idx >= 0) {
          next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        } else {
          next = [...prev, { ...item, quantity: qty }];
        }
        const store: CartStore = { tenantId, items: next, updatedAt: Date.now() };
        localStorage.setItem(getCartKey(tenantId), JSON.stringify(store));
        return next;
      });
    },
    [tenantId]
  );

  const removeItem = useCallback(
    (productId: string, variant?: string) => {
      setItems((prev) => {
        const next = prev.filter(
          (i) => !(i.productId === productId && i.variant === variant)
        );
        const store: CartStore = { tenantId, items: next, updatedAt: Date.now() };
        localStorage.setItem(getCartKey(tenantId), JSON.stringify(store));
        return next;
      });
    },
    [tenantId]
  );

  const updateQuantity = useCallback(
    (productId: string, variant: string | undefined, quantity: number) => {
      if (quantity < 1) return removeItem(productId, variant);
      setItems((prev) => {
        const next = prev.map((i) =>
          i.productId === productId && i.variant === variant ? { ...i, quantity } : i
        );
        const store: CartStore = { tenantId, items: next, updatedAt: Date.now() };
        localStorage.setItem(getCartKey(tenantId), JSON.stringify(store));
        return next;
      });
    },
    [tenantId, removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(getCartKey(tenantId));
  }, [tenantId]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, loaded, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal };
}

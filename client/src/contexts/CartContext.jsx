import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { shippingCost } from '../api/client';

const CartContext = createContext(null);

const STORAGE_KEY = 'sb_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // storage lleno o no disponible
    }
  }, [cart]);

  // Total de ítems (para el badge)
  const totalItems = useMemo(() => cart.reduce((sum, it) => sum + it.qty, 0), [cart]);

  // Subtotal
  const subtotal = useMemo(() => cart.reduce((sum, it) => sum + it.subtotal, 0), [cart]);

  const addItem = (item) => {
    setCart((prev) => {
      const existing = prev.find(
        (p) =>
          p.productId === item.productId &&
          p.size === item.size &&
          p.grind === item.grind
      );
      if (existing) {
        return prev.map((p) =>
          p.productId === item.productId && p.size === item.size && p.grind === item.grind
            ? { ...p, qty: p.qty + item.qty, subtotal: (p.qty + item.qty) * p.price }
            : p
        );
      }
      return [...prev, item];
    });
  };

  const updateQty = (index, qty) => {
    setCart((prev) => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index].qty = Math.max(1, qty);
      next[index].subtotal = next[index].qty * next[index].price;
      return next;
    });
  };

  const removeItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const value = {
    cart,
    addItem,
    updateQty,
    removeItem,
    clearCart,
    totalItems,
    subtotal,
    shippingCost
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}


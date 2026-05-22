import { useState, useEffect, createContext, useContext } from "react";

// ─── CART CONTEXT (global, persisted in localStorage) ────────────────────────
export const CartContext = createContext({ items: [], addItem: () => {}, removeItem: () => {}, clearCart: () => {}, count: 0 });
export function useCart() { return useContext(CartContext); }

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ybm_cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("ybm_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setItems([]);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return <CartContext.Provider value={{ items, addItem, removeItem, clearCart, count }}>{children}</CartContext.Provider>;
}

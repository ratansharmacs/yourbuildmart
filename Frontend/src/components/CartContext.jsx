import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { cartApi, resolveImageUrl } from "../services/api";
import { getToken } from "../services/api";

// ─── CART CONTEXT ─────────────────────────────────────────────────────────────
// When user is logged in: syncs with backend /cart API (cart is stored per-user in DB)
// When guest: stores in localStorage under a guest key
export const CartContext = createContext({
  items: [], addItem: () => {}, removeItem: () => {}, updateQty: () => {},
  clearCart: () => {}, count: 0, total: 0, loading: false, syncFromBackend: () => {},
});
export function useCart() { return useContext(CartContext); }

// Helper: get user-keyed storage key so carts are never shared between users
function getCartKey() {
  try {
    const u = JSON.parse(localStorage.getItem("ybm_user"));
    return u?.userId ? `ybm_cart_${u.userId}` : "ybm_cart_guest";
  } catch { return "ybm_cart_guest"; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(getCartKey()) || "[]"); } catch { return []; }
  });
  const [loading, setLoading] = useState(false);

  // Persist guest cart under user-specific key
  useEffect(() => {
    if (!getToken()) {
      localStorage.setItem(getCartKey(), JSON.stringify(items));
    }
  }, [items]);

  // Sync backend cart → local state
  const syncFromBackend = useCallback(async () => {
    if (!getToken()) return;
    console.log("[CART-CTX] ▶ syncFromBackend()");
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      const mapped = (data?.items || []).map(i => ({
        id: i.productId,
        cartItemId: i.cartItemId ?? i.id,
        name: i.productName,
        img: resolveImageUrl(i.imageUrl || i.productImage),
        price: i.unitPrice ?? i.price,
        qty: i.quantity,
      }));
      setItems(mapped);
      console.log("[CART-CTX] ✅ syncFromBackend — items:", mapped.length);
    } catch (err) {
      console.error("[CART-CTX] ✖ syncFromBackend failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // After login, sync cart
  useEffect(() => {
    if (getToken()) syncFromBackend();
  }, [syncFromBackend]);

  const addItem = useCallback(async (product) => {
    console.log("[CART-CTX] ▶ addItem() — productId:", product.id, product.name);
    if (getToken()) {
      try {
        setLoading(true);
        await cartApi.addItem(product.id, 1);
        await syncFromBackend();
        console.log("[CART-CTX] ✅ addItem synced from backend — productId:", product.id);
      } catch (err) {
        console.warn("[CART-CTX] ⚠ addItem API failed, falling back to local state:", err.message);
        setItems(prev => {
          const exists = prev.find(i => i.id === product.id);
          if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
          return [...prev, { ...product, qty: 1 }];
        });
      } finally { setLoading(false); }
    } else {
      console.log("[CART-CTX]   addItem local (no token) — productId:", product.id);
      setItems(prev => {
        const exists = prev.find(i => i.id === product.id);
        if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
        return [...prev, { ...product, qty: 1 }];
      });
    }
  }, [syncFromBackend]);

  const updateQty = useCallback(async (id, qty) => {
    if (getToken()) {
      try {
        setLoading(true);
        const item = items.find(i => i.id === id);
        if (item?.cartItemId) {
          await cartApi.updateItem(item.cartItemId, qty);
          await syncFromBackend();
        }
      } catch (_) {
        setItems(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty } : i));
      } finally { setLoading(false); }
    } else {
      setItems(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, qty } : i));
    }
  }, [items, syncFromBackend]);

  const removeItem = useCallback(async (id) => {
    if (getToken()) {
      try {
        setLoading(true);
        const item = items.find(i => i.id === id);
        if (item?.cartItemId) {
          await cartApi.removeItem(item.cartItemId);
          await syncFromBackend();
        } else {
          setItems(prev => prev.filter(i => i.id !== id));
        }
      } catch (_) {
        setItems(prev => prev.filter(i => i.id !== id));
      } finally { setLoading(false); }
    } else {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  }, [items, syncFromBackend]);

  const clearCart = useCallback(async () => {
    if (getToken()) {
      try { await cartApi.clearCart(); } catch (_) {}
    }
    setItems([]);
    localStorage.removeItem(getCartKey());
    localStorage.removeItem("ybm_cart"); // clean up old key if present
  }, []);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);

  // Global helper so any component can open the cart drawer
  const openCart = () => window.dispatchEvent(new CustomEvent("ybm:open-cart"));

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, count, total, loading, syncFromBackend, openCart }}>
      {children}
    </CartContext.Provider>
  );
}

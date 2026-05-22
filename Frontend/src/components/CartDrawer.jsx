import { useTheme } from "./ThemeContext";
import { useCart } from "./CartContext";

// ─── CART DRAWER ─────────────────────────────────────────────────────────────
export default function CartDrawer({ open, onClose }) {
  const { dark } = useTheme();
  const { items, removeItem, clearCart, count } = useCart();
  const bg = dark ? "#111" : "#fff";
  const text = dark ? "#eee" : "#111";
  const border = dark ? "#222" : "#eee";
  const muted = dark ? "#888" : "#777";

  if (!open) return null;
  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 9998,
        backdropFilter: "blur(2px)", animation: "fadeIn 0.2s ease",
      }} />
      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100%", width: "min(400px, 95vw)",
        background: bg, zIndex: 9999, boxShadow: "-8px 0 40px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "column", animation: "slideInRight 0.28s cubic-bezier(.22,.68,0,1.2)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e62e04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span style={{ fontWeight: 800, fontSize: 18, color: text }}>Cart</span>
            {count > 0 && <span style={{ background: "#e62e04", color: "#fff", borderRadius: 20, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{count}</span>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: muted, lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: muted }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="1.2" style={{ opacity: 0.5, marginBottom: 16 }}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <p style={{ fontSize: 16, fontWeight: 600, margin: "0 0 6px" }}>Your cart is empty</p>
              <p style={{ fontSize: 13, margin: 0 }}>Add products to get started</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{
                display: "flex", gap: 14, padding: "14px 0", borderBottom: `1px solid ${border}`,
                alignItems: "center", animation: "fadeIn 0.2s ease",
              }}>
                {item.img && <img src={item.img} alt={item.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: `1px solid ${border}` }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: text, margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: muted, margin: "0 0 4px" }}>{item.category}</p>
                  <span style={{ fontSize: 12, background: dark ? "#1e1e1e" : "#fef0ed", color: "#e62e04", borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>Qty: {item.qty}</span>
                </div>
                <button onClick={() => removeItem(item.id)} style={{
                  background: "none", border: "none", cursor: "pointer", color: muted, fontSize: 18,
                  padding: 4, transition: "color 0.2s", flexShrink: 0,
                }}
                  onMouseEnter={e => e.currentTarget.style.color = "#e62e04"}
                  onMouseLeave={e => e.currentTarget.style.color = muted}
                >✕</button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: muted }}>Total items</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: text }}>{count}</span>
            </div>
            <a href="/contact" target="_blank" rel="noopener noreferrer" style={{
              display: "block", width: "100%", background: "#e62e04", color: "#fff",
              padding: "14px", borderRadius: 8, fontWeight: 700, fontSize: 14,
              textDecoration: "none", textAlign: "center", transition: "background 0.2s", marginBottom: 10,
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#c42500"}
              onMouseLeave={e => e.currentTarget.style.background = "#e62e04"}
            >Enquire About Cart</a>
            <button onClick={clearCart} style={{
              width: "100%", background: "none", border: `1.5px solid ${border}`, color: muted,
              padding: "10px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#e62e04"; e.currentTarget.style.color = "#e62e04"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted; }}
            >Clear Cart</button>
          </div>
        )}
      </div>
    </>
  );
}

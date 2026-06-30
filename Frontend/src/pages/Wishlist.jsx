import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, SharedHeader, Footer, useAuth, useCart } from "../components";
import { wishlistApi, resolveImageUrl } from "../services/api";

const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='240'%3E%3Crect width='300' height='240' fill='%23f0f0f0'/%3E%3Ctext x='150' y='120' font-size='14' fill='%23aaa' text-anchor='middle' dominant-baseline='middle' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E`;

export default function Wishlist() {
  const { dark } = useTheme();
  const { isLoggedIn } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [removing, setRemoving] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());

  /* ── Theme ───────────────────────────────────────────────────────────── */
  const bg        = dark ? "#0f0f0f" : "#f5f5f7";
  const cardBg    = dark ? "#1a1a1a" : "#ffffff";
  const border    = dark ? "#2a2a2a" : "#e8e8e8";
  const textColor = dark ? "#e8e8e8" : "#1a1a1a";
  const mutedColor= dark ? "#777"    : "#888";
  const RED       = "#e62e04";

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login", { state: { from: "/wishlist" } }); return; }
    fetchWishlist();
  }, [isLoggedIn]);

  const fetchWishlist = async () => {
    try {
      setLoading(true); setError("");
      const data = await wishlistApi.getWishlist();
      // data is PageResponse — content holds the array
      const list = data?.content || (Array.isArray(data) ? data : []);
      setItems(list);
    } catch (err) {
      setError(err.message || "Failed to load wishlist");
    } finally { setLoading(false); }
  };

  const handleRemove = async (productId) => {
    setRemoving(productId);
    try {
      await wishlistApi.toggle(productId);
      setItems(prev => prev.filter(i => i.productId !== productId));
    } catch (err) {
      alert(err.message || "Could not remove item");
    } finally { setRemoving(null); }
  };

  const handleAddToCart = (item) => {
    addItem({
      id:       item.productId,
      name:     item.productName,
      // Backend field is imageUrl, not productImage
      img:      resolveImageUrl(item.imageUrl) || PLACEHOLDER,
      price:    item.price ?? 0,
      category: "",
    });
    setAddedIds(prev => new Set([...prev, item.productId]));
    setTimeout(() => {
      setAddedIds(prev => { const n = new Set(prev); n.delete(item.productId); return n; });
    }, 2000);
  };

  if (!isLoggedIn) return null;

  return (
    <div style={{ background: bg, minHeight: "100vh", color: textColor, transition: "background 0.4s" }}>
      <SharedHeader activePage="/wishlist" />

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "40px clamp(16px,4vw,32px) 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 6px", color: textColor }}>My Wishlist</h1>
            <p style={{ color: mutedColor, fontSize: 14, margin: 0 }}>
              {loading ? "Loading…" : `${items.length} saved ${items.length === 1 ? "item" : "items"}`}
            </p>
          </div>
          <Link to="/profile" style={{
            color: RED, textDecoration: "none", fontWeight: 700, fontSize: 14,
            padding: "8px 18px", borderRadius: 8, border: `1px solid ${RED}`,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = RED; }}
          >← Back to Profile</Link>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 20 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: cardBg, border: `1px solid ${border}` }}>
                <div style={{ aspectRatio: "4/3", background: dark ? "#222" : "#f0f0f0", animation: "pulse 1.5s infinite" }} />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 14, borderRadius: 6, background: dark ? "#222" : "#f0f0f0", marginBottom: 8 }} />
                  <div style={{ height: 14, borderRadius: 6, background: dark ? "#222" : "#f0f0f0", width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ padding: "16px 20px", background: "#fee", color: "#c00", borderRadius: 12, border: "1px solid #fcc", fontWeight: 600 }}>
            ⚠ {error}
            <button onClick={fetchWishlist} style={{ marginLeft: 16, color: RED, background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Retry</button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: mutedColor }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🤍</div>
            <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: textColor }}>Your wishlist is empty</p>
            <p style={{ fontSize: 14, marginBottom: 28 }}>Save products you love to find them easily later</p>
            <Link to="/products" style={{
              padding: "12px 32px", background: RED, color: "#fff",
              borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 15,
            }}>Browse Products</Link>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && items.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
            {items.map(item => {
              const imgSrc = resolveImageUrl(item.imageUrl) || PLACEHOLDER;
              const isAdded = addedIds.has(item.productId);
              const isRemoving = removing === item.productId;

              return (
                <div key={item.id || item.productId} style={{
                  background: cardBg, border: `1px solid ${border}`,
                  borderRadius: 16, overflow: "hidden",
                  boxShadow: dark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  display: "flex", flexDirection: "column",
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px rgba(230,46,4,0.15)`; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = dark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {/* Image area */}
                  <div style={{ position: "relative", aspectRatio: "4/3", background: dark ? "#111" : "#f5f5f5", overflow: "hidden" }}>
                    <img
                      src={imgSrc}
                      alt={item.productName}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                      onError={e => { e.target.src = PLACEHOLDER; }}
                      onMouseEnter={e => { e.target.style.transform = "scale(1.05)"; }}
                      onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
                    />
                    {/* Remove (heart) button */}
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={isRemoving}
                      title="Remove from wishlist"
                      style={{
                        position: "absolute", top: 10, right: 10,
                        width: 34, height: 34, borderRadius: "50%",
                        background: dark ? "rgba(30,30,30,0.85)" : "rgba(255,255,255,0.92)",
                        border: `1px solid ${border}`, cursor: isRemoving ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 17, boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        transition: "all 0.2s", opacity: isRemoving ? 0.5 : 1,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.borderColor = RED; }}
                      onMouseLeave={e => { e.currentTarget.style.background = dark ? "rgba(30,30,30,0.85)" : "rgba(255,255,255,0.92)"; e.currentTarget.style.borderColor = border; }}
                    >
                      {isRemoving ? "…" : "❤️"}
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{
                      fontWeight: 700, fontSize: 13.5, lineHeight: 1.45, color: textColor,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                      margin: 0,
                    }}>{item.productName}</p>

                    {item.price != null && (
                      <p style={{ color: RED, fontWeight: 800, fontSize: 16, margin: 0 }}>
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </p>
                    )}

                    {/* CTA buttons */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                      {/* View Product */}
                      <Link
                        to={`/productDetail?id=${item.productId}`}
                        style={{
                          display: "block", textAlign: "center", padding: "9px",
                          borderRadius: 8, fontSize: 13, fontWeight: 700,
                          background: "transparent", color: RED,
                          border: `2px solid ${RED}`, textDecoration: "none",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = RED; e.currentTarget.style.color = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = RED; }}
                      >
                        👁 View Product
                      </Link>

                      {/* Add to Cart */}
                      <button
                        onClick={() => handleAddToCart(item)}
                        style={{
                          width: "100%", padding: "9px", borderRadius: 8,
                          background: isAdded ? "#16a34a" : RED,
                          color: "#fff", border: "none", fontWeight: 700,
                          fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                        }}
                        onMouseEnter={e => { if (!isAdded) e.currentTarget.style.background = "#c92600"; }}
                        onMouseLeave={e => { if (!isAdded) e.currentTarget.style.background = RED; }}
                      >
                        {isAdded ? "✓ Added to Cart!" : "🛒 Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @media (max-width:480px) {
          .wishlist-grid { grid-template-columns: repeat(2,1fr) !important; gap:12px !important; }
        }
      `}</style>
    </div>
  );
}

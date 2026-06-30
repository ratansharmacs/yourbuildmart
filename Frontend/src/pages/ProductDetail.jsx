import { useState, useEffect } from "react";
import { SharedHeader, useTheme, useCart, Footer, EnquiryModal } from "../components";
import { RELATED_PRODUCTS, TOP_SELLING, DETAIL_BLOGS } from "../data/productDetailData";
import { Link, useSearchParams } from "react-router-dom";
import { productsApi, wishlistApi, brochureApi, BASE_URL } from "../services/api";
import { useAuth } from "../components";

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes shimmer  { 0%,100%{opacity:1} 50%{opacity:0.45} }
  @keyframes pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(230,46,4,0.4)} 50%{box-shadow:0 0 0 8px rgba(230,46,4,0)} }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { transition:background 0.4s ease, color 0.4s ease; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-thumb { background:#e62e04; border-radius:4px; }
  .tab-content-area ul { padding-left:20px; }
  .tab-content-area li { margin-bottom:6px; line-height:1.7; }
  .tab-content-area p  { margin-bottom:10px; line-height:1.7; }
  .tab-content-area strong, .tab-content-area b { color:inherit; font-weight:700; }
  .detail-hero-grid   { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
  .detail-tabs-row    { display:flex; gap:28px; align-items:flex-start; }
  .detail-trust-grid  { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
  .top-selling-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  @media(max-width:900px){
    .detail-hero-grid  { grid-template-columns:1fr; }
    .detail-tabs-row   { flex-direction:column; }
    .detail-trust-grid { grid-template-columns:repeat(2,1fr); }
    .top-selling-grid  { grid-template-columns:repeat(2,1fr); }
    .detail-right-sidebar { width:100%!important; position:static!important; }
  }
  @media(max-width:540px){
    .top-selling-grid { grid-template-columns:1fr 1fr; }
  }
`;

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const PLACEHOLDER = "https://yourbuildmart.com/public/assets/img/placeholder.jpg";

function imgUrl(path) {
  if (!path) return PLACEHOLDER;
  return path.startsWith("http") ? path : `${BASE_URL}${path}`;
}

// ─── SKELETON LOADER ───────────────────────────────────────────────────────────
function SkeletonBlock({ w = "100%", h = 20, r = 8, mb = 0 }) {
  const { dark } = useTheme();
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: dark ? "#222" : "#eee",
      marginBottom: mb,
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

function DetailSkeleton({ dark }) {
  const bg = dark ? "#0d0d0d" : "#f4f5f7";
  const card = dark ? "#111" : "#fff";
  const border = dark ? "#1e1e1e" : "#e8e8e8";
  return (
    <div style={{ background: bg, minHeight: "100vh", padding: "36px clamp(16px,4vw,48px) 72px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="detail-hero-grid">
          {/* Gallery skeleton */}
          <div>
            <div style={{ borderRadius: 16, background: card, border: `1px solid ${border}`, aspectRatio: "4/3", animation: "shimmer 1.4s infinite" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              {[1, 2, 3].map(i => <div key={i} style={{ flex: 1, aspectRatio: "1", borderRadius: 10, background: card, border: `1px solid ${border}`, animation: "shimmer 1.4s infinite" }} />)}
            </div>
          </div>
          {/* Info skeleton */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SkeletonBlock h={14} w="35%" r={20} mb={8} />
            <SkeletonBlock h={36} w="90%" r={8} mb={4} />
            <SkeletonBlock h={18} w="70%" r={8} mb={16} />
            {[1,2,3,4,5].map(i => <SkeletonBlock key={i} h={14} w={`${55+i*5}%`} r={6} mb={6} />)}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <SkeletonBlock h={48} r={10} />
              <SkeletonBlock h={48} r={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BREADCRUMB ────────────────────────────────────────────────────────────────
function Breadcrumb({ product }) {
  const { dark } = useTheme();
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    product?.category?.name
      ? { label: product.category.name, href: `/products?category=${encodeURIComponent(product.category.name)}` }
      : null,
    { label: product?.name || "Product Detail", active: true },
  ].filter(Boolean);

  return (
    <section style={{ background: dark ? "#0d0d0d" : "#f9f9f9", borderBottom: dark ? "1px solid #1a1a1a" : "1px solid #ebebeb", position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#e62e04,#ff6b3d,#e62e04)" }} />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "18px clamp(16px,4vw,48px)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {crumbs.map((crumb, i) => (
          <span key={crumb.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {crumb.active ? (
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e62e04", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{crumb.label}</span>
            ) : (
              <Link to={crumb.href} style={{ fontSize: 13, color: dark ? "#666" : "#999", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#e62e04"}
                onMouseLeave={e => e.target.style.color = dark ? "#666" : "#999"}>
                {crumb.label}
              </Link>
            )}
            {i < crumbs.length - 1 && (
              <svg width="5" height="9" viewBox="0 0 5 9" fill="none"><path d="M1 1l3 3.5L1 8" stroke={dark ? "#444" : "#ccc"} strokeWidth="1.5" strokeLinecap="round" /></svg>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}

// ─── IMAGE GALLERY ──────────────────────────────────────────────────────────────
function ImageGallery({ images, name, dark, featured }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  // reset active when images change
  useEffect(() => setActive(0), [images]);

  const validImages = images?.length ? images : [PLACEHOLDER];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Main image */}
      <div onClick={() => setZoomed(z => !z)}
        style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: dark ? "#181818" : "#f7f7f7", border: `1px solid ${dark ? "#222" : "#e8e8e8"}`, cursor: "zoom-in", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {featured && (
          <div style={{ position: "absolute", top: 16, left: 16, background: "#e62e04", color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, letterSpacing: "0.8px", zIndex: 2 }}>
            Featured
          </div>
        )}
        <img key={active} src={imgUrl(validImages[active])} alt={name}
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16, transition: "transform 0.3s", transform: zoomed ? "scale(1.14)" : "scale(1)", animation: "fadeIn 0.3s ease" }}
          onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
        />
        <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
          {zoomed ? "Click to zoom out" : "Click to zoom in"}
        </div>
        {validImages.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + validImages.length) % validImages.length); }}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#e62e04"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}>‹</button>
            <button onClick={e => { e.stopPropagation(); setActive(a => (a + 1) % validImages.length); }}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#e62e04"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}>›</button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div style={{ display: "flex", gap: 10 }}>
          {validImages.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{ flex: 1, aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: `2px solid ${active === i ? "#e62e04" : (dark ? "#222" : "#e0e0e0")}`, background: dark ? "#181818" : "#f5f5f5", cursor: "pointer", padding: 6, transition: "border-color 0.2s, transform 0.2s", transform: active === i ? "scale(1.06)" : "scale(1)" }}>
              <img src={imgUrl(img)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }} />
            </button>
          ))}
        </div>
      )}

      {/* Dot indicators */}
      {validImages.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {validImages.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{ width: active === i ? 20 : 8, height: 8, borderRadius: 4, border: "none", background: active === i ? "#e62e04" : (dark ? "#333" : "#ddd"), cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PRODUCT INFO PANEL ────────────────────────────────────────────────────────
function ProductInfo({ product, dark }) {
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [brochureLoading, setBrochureLoading] = useState(false);
  const [brochureMsg, setBrochureMsg] = useState("");
  const { addItem } = useCart();
  const { isLoggedIn } = useAuth();

  // Check wishlist status on mount
  useEffect(() => {
    if (!isLoggedIn || !product?.id) return;
    wishlistApi.check(product.id)
      .then(data => setWishlisted(data?.wishlisted ?? data?.inWishlist ?? false))
      .catch(() => {});
  }, [product?.id, isLoggedIn]);

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      setBrochureMsg("Please log in to save to wishlist.");
      setTimeout(() => setBrochureMsg(""), 3000);
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await wishlistApi.toggle(product.id);
      setWishlisted(res?.wishlisted ?? res?.inWishlist ?? !wishlisted);
    } catch {
      setBrochureMsg("Failed to update wishlist. Please try again.");
      setTimeout(() => setBrochureMsg(""), 3000);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleDownloadBrochure = async () => {
    if (!product?.brochureUrl) {
      setBrochureMsg("no_brochure");
      setTimeout(() => setBrochureMsg(""), 4000);
      return;
    }
    setBrochureLoading(true);
    try {
      const BASE = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";
      const url = product.brochureUrl.startsWith("http")
        ? product.brochureUrl
        : `${BASE}${product.brochureUrl}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${product.name || "product"}-brochure.pdf`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      setBrochureMsg("Download failed. Please try again.");
      setTimeout(() => setBrochureMsg(""), 3000);
    } finally {
      setBrochureLoading(false);
    }
  };

  const cardBg = dark ? "#111" : "#fff";
  const cardBorder = dark ? "#1e1e1e" : "#e8e8e8";
  const textMuted = dark ? "#888" : "#666";
  const textMain = dark ? "#fff" : "#111";

  const trust = [
    { icon: "✅", label: "ISO Certified" },
    { icon: "🌍", label: "Global Delivery" },
    { icon: "🎧", label: "24/7 Support" },
    { icon: "💰", label: "Best Price" },
  ];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      category: product.category?.name || "",
      img: imgUrl(product.imageUrl || product.additionalImages?.[0]),
      price: product.price,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // Build specs from DB fields
  const specs = [
    product.brand    && { label: "Brand",    value: product.brand },
    product.sku      && { label: "SKU",      value: product.sku },
    product.unit     && { label: "Unit",     value: product.unit },
    product.stock != null && { label: "In Stock", value: product.stock > 0 ? `${product.stock} units` : "Out of Stock" },
    product.category?.name && { label: "Category", value: product.category.name },
    product.cashOnDelivery != null && { label: "Cash on Delivery", value: product.cashOnDelivery ? "Available" : "Not Available" },
  ].filter(Boolean);

  const hasPrice = product.price && Number(product.price) > 0;

  return (
    <>
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Title block */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          {product.category?.name && (
            <Link to={`/products?category=${encodeURIComponent(product.category.name)}`}
              style={{ fontSize: 12, fontWeight: 700, color: "#e62e04", textDecoration: "none", background: "rgba(230,46,4,0.1)", padding: "4px 12px", borderRadius: 20, letterSpacing: "0.5px" }}>
              {product.category.name}
            </Link>
          )}
          {product.sku && <span style={{ fontSize: 12, color: textMuted }}>SKU: {product.sku}</span>}
        </div>
        <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, color: textMain, letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 12 }}>
          {product.name}
        </h1>
        {product.description && (
          <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6, background: dark ? "#1a1a1a" : "#f8f8f8", padding: "10px 14px", borderRadius: 8, borderLeft: "3px solid #e62e04" }}>
            {product.description}
          </p>
        )}
      </div>

      {/* Price */}
      {hasPrice && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: "#e62e04" }}>
            ₹{Number(product.price).toLocaleString("en-IN")}
          </span>
          {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
            <>
              <span style={{ fontSize: 16, color: textMuted, textDecoration: "line-through" }}>
                ₹{Number(product.originalPrice).toLocaleString("en-IN")}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.1)", padding: "3px 10px", borderRadius: 20 }}>
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            </>
          )}
          {product.unit && <span style={{ fontSize: 13, color: textMuted }}>/ {product.unit}</span>}
        </div>
      )}

      {/* Trust badges */}
      <div className="detail-trust-grid" style={{ gap: 8 }}>
        {trust.map(t => (
          <div key={t.label} style={{ textAlign: "center", padding: "12px 8px", background: dark ? "#1a1a1a" : "#f8f8f8", borderRadius: 10, border: `1px solid ${cardBorder}` }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: textMuted }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Specs */}
      {specs.length > 0 && (
        <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, overflow: "hidden" }}>
          <div style={{ background: "#e62e04", padding: "12px 20px" }}>
            <h3 style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Quick Specifications</h3>
          </div>
          <div style={{ padding: "4px 0" }}>
            {specs.map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "flex-start", padding: "10px 20px", background: i % 2 === 0 ? "transparent" : (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"), borderBottom: i < specs.length - 1 ? `1px solid ${dark ? "#1a1a1a" : "#f0f0f0"}` : "none" }}>
                <span style={{ fontSize: 13, color: textMuted, width: 140, flexShrink: 0, fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: textMain }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quantity + CTA */}
      <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, padding: "20px" }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: textMuted, display: "block", marginBottom: 8 }}>Quantity</label>
          <div style={{ display: "flex", alignItems: "center", gap: 0, width: "fit-content", border: `1px solid ${dark ? "#333" : "#ddd"}`, borderRadius: 10, overflow: "hidden" }}>
            <button onClick={() => setQty(q => Math.max(1, q - 1))}
              style={{ width: 44, height: 44, border: "none", background: dark ? "#1a1a1a" : "#f5f5f5", color: dark ? "#fff" : "#333", fontSize: 18, cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#e62e04"}
              onMouseLeave={e => e.currentTarget.style.background = dark ? "#1a1a1a" : "#f5f5f5"}>−</button>
            <input type="number" value={qty} min={1}
              onChange={e => setQty(Math.max(1, Number(e.target.value)))}
              style={{ width: 72, height: 44, border: "none", textAlign: "center", fontSize: 16, fontWeight: 700, background: "transparent", color: textMain, outline: "none" }} />
            <button onClick={() => setQty(q => q + 1)}
              style={{ width: 44, height: 44, border: "none", background: dark ? "#1a1a1a" : "#f5f5f5", color: dark ? "#fff" : "#333", fontSize: 18, cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#e62e04"}
              onMouseLeave={e => e.currentTarget.style.background = dark ? "#1a1a1a" : "#f5f5f5"}>+</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => setEnquiryOpen(true)}
            style={{ flex: 1, minWidth: 140, background: "#e62e04", color: "#fff", padding: "14px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", textAlign: "center", letterSpacing: "0.3px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#c92600"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(230,46,4,0.35)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            ✉ Enquire Now
          </button>
          {/* Add to Cart */}
          <button onClick={handleAddToCart}
            style={{ flex: 1, minWidth: 140, background: addedToCart ? "#16a34a" : "transparent", color: addedToCart ? "#fff" : "#e62e04", padding: "14px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, border: `2px solid ${addedToCart ? "#16a34a" : "#e62e04"}`, cursor: "pointer", letterSpacing: "0.3px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            onMouseEnter={e => { if (!addedToCart) { e.currentTarget.style.background = "rgba(230,46,4,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
            onMouseLeave={e => { if (!addedToCart) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}}>
            {addedToCart ? "✓ Added to Cart!" : "🛒 Add to Cart"}
          </button>
        </div>

        {/* Second row: Brochure + Wishlist */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {/* Download Brochure */}
          <button onClick={handleDownloadBrochure} disabled={brochureLoading}
            style={{ flex: 1, minWidth: 140, background: "transparent", color: dark ? "#ccc" : "#333", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, border: `2px solid ${dark ? "#444" : "#ccc"}`, cursor: "pointer", letterSpacing: "0.3px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: brochureLoading ? 0.7 : 1 }}
            onMouseEnter={e => { if (!brochureLoading) { e.currentTarget.style.borderColor = "#e62e04"; e.currentTarget.style.color = "#e62e04"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "#444" : "#ccc"; e.currentTarget.style.color = dark ? "#ccc" : "#333"; e.currentTarget.style.transform = "translateY(0)"; }}>
            {brochureLoading ? "⏳ Downloading…" : "📄 Download Brochure"}
          </button>
          {/* Wishlist toggle */}
          <button onClick={handleWishlistToggle} disabled={wishlistLoading}
            title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 10, background: wishlisted ? "rgba(230,46,4,0.1)" : "transparent", border: `2px solid ${wishlisted ? "#e62e04" : (dark ? "#444" : "#ccc")}`, cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", opacity: wishlistLoading ? 0.6 : 1 }}
            onMouseEnter={e => { if (!wishlistLoading) { e.currentTarget.style.borderColor = "#e62e04"; e.currentTarget.style.background = "rgba(230,46,4,0.1)"; e.currentTarget.style.transform = "scale(1.1)"; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = wishlisted ? "#e62e04" : (dark ? "#444" : "#ccc"); e.currentTarget.style.background = wishlisted ? "rgba(230,46,4,0.1)" : "transparent"; e.currentTarget.style.transform = "scale(1)"; }}>
            {wishlisted ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Brochure / wishlist message */}
        {brochureMsg && (
          <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: brochureMsg === "no_brochure" ? (dark ? "#1a1200" : "#fffbea") : (dark ? "#1a0a0a" : "#fff0f0"),
            border: `1px solid ${brochureMsg === "no_brochure" ? "#f5a623" : "#fcc"}`,
            color: brochureMsg === "no_brochure" ? "#b8860b" : "#c00",
            display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{brochureMsg === "no_brochure" ? "📋" : "⚠️"}</span>
            <span>{brochureMsg === "no_brochure"
              ? "No brochure available for this product. It will be available soon."
              : brochureMsg === "Please log in to save to wishlist."
                ? <span>Please <a href="/login" style={{ color: "inherit", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 2 }}>log in</a> to save to wishlist.</span>
                : brochureMsg}</span>
          </div>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[{ icon: "📦", text: "Quick Dispatch" }, { icon: "🚚", text: "Global Shipping" }, { icon: "🔒", text: "Secure Order" }].map(item => (
            <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: textMuted }}>
              <span>{item.icon}</span><span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: textMuted }}>Share:</span>
        {[
          { label: "WhatsApp", color: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(product.name + " - " + window.location.href)}` },
          { label: "Email", color: "#e62e04", href: `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(window.location.href)}` },
        ].map(s => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, fontWeight: 600, color: s.color, textDecoration: "none", padding: "6px 14px", borderRadius: 20, border: `1px solid ${s.color}`, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = s.color; }}>
            {s.label}
          </a>
        ))}
        <button onClick={() => navigator.clipboard?.writeText(window.location.href)}
          style={{ fontSize: 12, fontWeight: 600, color: textMuted, background: "transparent", border: `1px solid ${dark ? "#333" : "#ddd"}`, padding: "6px 14px", borderRadius: 20, cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#e62e04"; e.currentTarget.style.color = "#e62e04"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "#333" : "#ddd"; e.currentTarget.style.color = textMuted; }}>
          Copy Link
        </button>
      </div>
    </div>

    {enquiryOpen && (
      <EnquiryModal
        product={product}
        qty={qty}
        onClose={() => setEnquiryOpen(false)}
      />
    )}
    </>
  );
}

// ─── CONTENT TABS ──────────────────────────────────────────────────────────────
function ContentTabs({ product, dark }) {
  const [activeTab, setActiveTab] = useState("description");
  const cardBg = dark ? "#111" : "#fff";
  const cardBorder = dark ? "#1e1e1e" : "#e8e8e8";
  const textMain = dark ? "#e8e8e8" : "#333";
  const textMuted = dark ? "#888" : "#666";

  // Build tabs dynamically from DB data
  const tabs = [
    {
      id: "description",
      label: "Description",
      content: product.description
        ? `<p>${product.description.replace(/\n/g, "</p><p>")}</p>`
        : "<p>No description available for this product.</p>",
    },
    {
      id: "specs",
      label: "Specifications",
      content: (() => {
        const rows = [
          product.brand && `<tr><td style="padding:9px 16px;font-weight:600;width:160px;color:${textMuted}">Brand</td><td style="padding:9px 16px;font-weight:600">${product.brand}</td></tr>`,
          product.sku && `<tr><td style="padding:9px 16px;font-weight:600;width:160px;color:${textMuted}">SKU</td><td style="padding:9px 16px;font-weight:600">${product.sku}</td></tr>`,
          product.unit && `<tr><td style="padding:9px 16px;font-weight:600;width:160px;color:${textMuted}">Unit</td><td style="padding:9px 16px;font-weight:600">${product.unit}</td></tr>`,
          product.stock != null && `<tr><td style="padding:9px 16px;font-weight:600;width:160px;color:${textMuted}">Stock</td><td style="padding:9px 16px;font-weight:600">${product.stock > 0 ? product.stock + " units available" : "Out of Stock"}</td></tr>`,
          product.category?.name && `<tr><td style="padding:9px 16px;font-weight:600;width:160px;color:${textMuted}">Category</td><td style="padding:9px 16px;font-weight:600">${product.category.name}</td></tr>`,
        ].filter(Boolean);
        const rowDivider = dark ? "#1a1a1a" : "#f0f0f0";
        const styledRows = rows.map((r, i) => {
          const bg = i % 2 === 0 ? "transparent" : (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)");
          return r.replace("<tr>", '<tr style="background:' + bg + ';border-bottom:1px solid ' + rowDivider + '">');
        });
        return rows.length
          ? `<table style="width:100%;border-collapse:collapse">${styledRows.join("")}</table>`
          : "<p>No specifications available.</p>";
      })(),
    },
    {
      id: "why",
      label: "Why Choose Us",
      content: `<ul>
        <li><strong>Quality Assured</strong> — Every product is quality-checked before dispatch.</li>
        <li><strong>Global Delivery</strong> — We ship across Africa, Europe, Middle East, and beyond.</li>
        <li><strong>Expert Support</strong> — 24/7 assistance for your project needs.</li>
        <li><strong>Best Pricing</strong> — Competitive prices for bulk and retail orders.</li>
        <li><strong>Secure Transactions</strong> — Safe and transparent order processing.</li>
      </ul>`,
    },
    {
      id: "contact",
      label: "Contact Us",
      content: `<p>Get in touch with YourBuildMart for premium building materials and professional support.</p>
        <p><strong>📍 UAE:</strong> Unit 13 &amp; 14, Princess Cars Building, Dubai</p>
        <p><strong>📱 UAE:</strong> +971 58 676 6102</p>
        <p><strong>✉ Email:</strong> contact@yourbuildmart.com</p>`,
    },
  ];

  const tab = tabs.find(t => t.id === activeTab);

  return (
    <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${cardBorder}`, overflow: "hidden", boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${dark ? "#1e1e1e" : "#eee"}`, background: dark ? "#0d0d0d" : "#fafafa" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: "15px 22px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", color: activeTab === t.id ? "#e62e04" : textMuted, borderBottom: `3px solid ${activeTab === t.id ? "#e62e04" : "transparent"}`, transition: "all 0.2s", letterSpacing: "0.2px" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div key={activeTab} className="tab-content-area"
        style={{ padding: "32px", fontSize: 14, lineHeight: 1.8, color: textMain, animation: "fadeUp 0.3s ease" }}
        dangerouslySetInnerHTML={{ __html: tab?.content || "" }}
      />
    </div>
  );
}

// ─── RIGHT SIDEBAR ─────────────────────────────────────────────────────────────
function RightSidebar({ dark }) {
  const cardBg = dark ? "#111" : "#fff";
  const cardBorder = dark ? "#1e1e1e" : "#e8e8e8";
  const textMain = dark ? "#e8e8e8" : "#222";

  const SideSection = ({ title, children }) => (
    <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, overflow: "hidden", marginBottom: 20, boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.25)" : "0 4px 20px rgba(0,0,0,0.05)" }}>
      <div style={{ background: "#e62e04", padding: "13px 18px" }}>
        <h3 style={{ color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );

  return (
    <aside className="detail-right-sidebar" style={{ width: 260, flexShrink: 0, position: "sticky", top: 90, alignSelf: "flex-start" }}>

      {/* Related Products */}
      <SideSection title="Related Products">
        {RELATED_PRODUCTS.map(p => (
          <Link key={p.name} to={p.href}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", textDecoration: "none", borderBottom: `1px solid ${dark ? "#1a1a1a" : "#f0f0f0"}`, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = dark ? "#1a1a1a" : "#fef0ed"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden", background: dark ? "#181818" : "#f5f5f5", flexShrink: 0, border: `1px solid ${dark ? "#222" : "#eee"}` }}>
              <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: textMain, lineHeight: 1.4 }}>{p.name}</span>
          </Link>
        ))}
      </SideSection>

      {/* Blog Posts */}
      <SideSection title="Latest Blogs">
        {DETAIL_BLOGS.map(b => (
          <Link key={b.title} to="/blog"
            style={{ display: "block", padding: "12px 16px", textDecoration: "none", borderBottom: `1px solid ${dark ? "#1a1a1a" : "#f0f0f0"}`, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = dark ? "#1a1a1a" : "#fef0ed"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ width: "100%", height: 90, borderRadius: 8, overflow: "hidden", marginBottom: 8, background: dark ? "#181818" : "#f5f5f5" }}>
              <img src={b.img} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={e => { e.target.onerror = null; e.target.style.display = "none"; }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#e62e04", letterSpacing: "0.8px", textTransform: "uppercase" }}>{b.category}</span>
            <p style={{ fontSize: 12, color: textMain, marginTop: 4, lineHeight: 1.5, fontWeight: 500 }}>{b.title}</p>
          </Link>
        ))}
      </SideSection>

      {/* Quote CTA */}
      <div style={{ background: "linear-gradient(135deg,#e62e04,#c92600)", borderRadius: 14, padding: "24px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -25, left: -15, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
        <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Need a Quote?</p>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>Get competitive pricing for bulk orders today</p>
        <Link to="/contact"
          style={{ display: "block", background: "#fff", color: "#e62e04", padding: "10px 0", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          Request Quote →
        </Link>
      </div>
    </aside>
  );
}

// ─── TOP SELLING ───────────────────────────────────────────────────────────────
function TopSelling({ dark }) {
  const [hovered, setHovered] = useState(null);
  const cardBg = dark ? "#111" : "#fff";
  const cardBorder = dark ? "#1e1e1e" : "#e8e8e8";
  const textMain = dark ? "#e8e8e8" : "#222";
  const textMuted = dark ? "#888" : "#666";

  return (
    <div style={{ marginTop: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: textMain, letterSpacing: "-0.5px" }}>Top Selling Products</h2>
        <div style={{ flex: 1, height: 1, background: dark ? "#1e1e1e" : "#eee" }} />
        <Link to="/products" style={{ fontSize: 13, fontWeight: 700, color: "#e62e04", textDecoration: "none" }}>View All →</Link>
      </div>
      <div className="top-selling-grid">
        {TOP_SELLING.map((p, i) => (
          <Link key={p.name} to={p.href}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{ textDecoration: "none", display: "block", background: cardBg, borderRadius: 14, border: `1px solid ${hovered === i ? "#e62e04" : cardBorder}`, overflow: "hidden", transition: "all 0.25s", transform: hovered === i ? "translateY(-4px)" : "translateY(0)", boxShadow: hovered === i ? (dark ? "0 12px 32px rgba(230,46,4,0.2)" : "0 12px 32px rgba(230,46,4,0.12)") : "none", animation: `fadeUp 0.4s ease ${i * 60}ms both` }}>
            <div style={{ aspectRatio: "1", background: dark ? "#181818" : "#f7f7f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflow: "hidden" }}>
              <img src={p.img} alt={p.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transition: "transform 0.3s", transform: hovered === i ? "scale(1.08)" : "scale(1)" }}
                onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER; }} />
            </div>
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${hovered === i ? "#e62e04" : (dark ? "#1e1e1e" : "#eee")}`, transition: "border-color 0.25s" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: hovered === i ? "#e62e04" : textMain, lineHeight: 1.4, transition: "color 0.2s" }}>{p.name}</p>
              <p style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>View Product →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── ERROR STATE ───────────────────────────────────────────────────────────────
function ErrorState({ message, dark }) {
  const textMain = dark ? "#e8e8e8" : "#222";
  const textMuted = dark ? "#888" : "#666";
  return (
    <div style={{ textAlign: "center", padding: "100px 20px" }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>😔</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: textMain, marginBottom: 12 }}>Product Not Found</h2>
      <p style={{ fontSize: 14, color: textMuted, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>{message || "The product you're looking for doesn't exist or has been removed."}</p>
      <Link to="/products"
        style={{ display: "inline-block", background: "#e62e04", color: "#fff", padding: "14px 32px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
        ← Back to Products
      </Link>
    </div>
  );
}

// ─── PAGE LAYOUT ───────────────────────────────────────────────────────────────
function ProductDetailContent() {
  const { dark } = useTheme();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) { setError("No product ID provided."); setLoading(false); return; }
    setLoading(true);
    setError(null);
    productsApi.getById(productId)
      .then(data => {
        // api.js returns data.data or data — normalize
        setProduct(data?.id ? data : data?.data ?? data);
      })
      .catch(err => setError(err.message || "Failed to load product."))
      .finally(() => setLoading(false));
  }, [productId]);

  const pageBg = dark ? "#0d0d0d" : "#f4f5f7";
  const textMain = dark ? "#e8e8e8" : "#222";

  if (loading) return (
    <div style={{ background: pageBg }}>
      <div style={{ height: 3, background: "linear-gradient(90deg,#e62e04,#ff6b3d,#e62e04)" }} />
      <DetailSkeleton dark={dark} />
    </div>
  );

  if (error || !product) return (
    <div style={{ background: pageBg, minHeight: "100vh" }}>
      <ErrorState message={error} dark={dark} />
    </div>
  );

  // Build full image list: primary + additional
  const allImages = [
    product.imageUrl,
    ...(product.additionalImages || []),
  ].filter(Boolean);

  return (
    <div style={{ background: pageBg, minHeight: "100vh" }}>
      <Breadcrumb product={product} />

      {/* Page title bar */}
      <div style={{ background: "transparent", borderBottom: dark ? "1px solid #1a1a1a" : "1px solid #eee" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px clamp(16px,4vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: textMain, letterSpacing: "-0.5px" }}>{product.name}</h2>
          {product.stock != null && (
            <span style={{ fontSize: 13, fontWeight: 700, padding: "5px 14px", borderRadius: 20, background: product.stock > 0 ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)", color: product.stock > 0 ? "#16a34a" : "#dc2626" }}>
              {product.stock > 0 ? `✓ In Stock (${product.stock})` : "✗ Out of Stock"}
            </span>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px clamp(16px,4vw,48px) 72px" }}>
        {/* Hero: Gallery + Info */}
        <div className="detail-hero-grid" style={{ marginBottom: 36, animation: "fadeUp 0.5s ease" }}>
          <ImageGallery images={allImages} name={product.name} dark={dark} featured={product.featured} />
          <ProductInfo product={product} dark={dark} />
        </div>

        {/* Tabs + Sidebar */}
        <div className="detail-tabs-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <ContentTabs product={product} dark={dark} />
            <TopSelling dark={dark} />
          </div>
          <RightSidebar dark={dark} />
        </div>
      </div>
    </div>
  );
}

// ─── DEFAULT EXPORT ────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const { dark } = useTheme();

  useEffect(() => {
    document.body.style.background = dark ? "#0d0d0d" : "#fff";
    document.body.style.transition = "background 0.4s ease";
  }, [dark]);

  return (
    <div style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", transition: "background 0.4s ease" }}>
      <style>{GLOBAL_STYLES}</style>
      <SharedHeader activePage="/productDetail" />
      <ProductDetailContent />
      <Footer />
    </div>
  );
}

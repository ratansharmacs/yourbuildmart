import { useState, useEffect, useRef } from "react";
import { SharedHeader, useTheme, ThemeContext, useCart, Footer } from "../components";
import { Link, useSearchParams } from "react-router-dom";


// ─── PRODUCT DATA (from product.html) ────────────────────────────────────────
const ALL_PRODUCTS = [
  {
    id: 54, name: "Steel Sheet",
    img: "https://yourbuildmart.com/public/uploads/all/ht8ZZADqglloTYRX26oSKQL3YFoFOyUnR4t2bqWx.jpg",
    // href: "https://yourbuildmart.com/steel-sections-and-accessories-products/steel-sheet-h55xs",
    href: "/productDetail",
    category: "Steel Sections",
    tag: "ISO Certified",
  },
  {
    id: 52, name: "Butterfly Valves",
    img: "https://yourbuildmart.com/public/uploads/all/l3JEgHz9repFAiFyLU2p5CHjbcUPdmo0VEMec3kJ.png",
    // href: "/products?category=Industrial+Valves",
    href: "/productDetail",
    category: "Industrial Valves",
    tag: "Global Delivery",
  },
  {
    id: 51, name: "Gate, Globe & Check Valves – Bolted Bonnet",
    img: "https://yourbuildmart.com/public/uploads/all/GrLvcocreimeiNs13iOYvNZ2dMA9pLXlyrmaXvpQ.png",
    // href: "/products?category=Industrial+Valves",
    href: "/productDetail",
    category: "Industrial Valves",
    tag: "ISI Marked",
  },
  {
    id: 50, name: "Fire Protection Valves",
    img: "https://yourbuildmart.com/public/uploads/all/xT99T3DRGI7u1N22erKyEnM54VtzGhQkFOVsRrsS.jpg",
    // href: "/products?category=Fire+Fighting",
    href: "/productDetail",
    category: "Fire Fighting",
    tag: "Best Price",
  },
  {
    id: 48, name: "Fire Fighting Grooved Pipe Fittings & Coupling",
    img: "https://yourbuildmart.com/public/uploads/all/xe3TEue39X9QojFUhzC2JCbzgF3TjtBOkEWspgJx.jpg",
    // href: "/products?category=Fire+Fighting",
    href: "/productDetail",
    category: "Fire Fighting",
    tag: "ISO Certified",
  },
  {
    id: 47, name: "TMT Steel Bars",
    img: "https://yourbuildmart.com/public/uploads/all/0ER95UzZVBeagJpEPWXZm5M9SSWaZnj2CP0auTBs.gif",
    // href: "/products?category=TMT+Steel",
    href: "/productDetail",
    category: "TMT Steel",
    tag: "ISO Certified",
  },
  {
    id: 42, name: "Galvanized Iron (GI) Roofing Sheets",
    img: "https://yourbuildmart.com/public/uploads/all/skxYNbjMfCpEfEYAINnuiKLyXGnwTNIHUvjjyZHJ.jpg",
    // href: "https://yourbuildmart.com/steel-sections-and-accessories-products/gi-corrugated-sheets",
    href: "/productDetail",
    category: "Steel Sections",
    tag: "Global Delivery",
  },
  {
    id: 41, name: "PEB – Pre Engineered Building",
    img: "https://yourbuildmart.com/public/uploads/all/vVdQYPPzaBTGdJxh4jAC6EpsPXWQNgx4WPhEXWoU.jpg",
    // href: "/products?category=PEB+Structure",
    href: "/productDetail",
    category: "PEB Structure",
    tag: "Global Delivery",
  },
  {
    id: 35, name: "Aluminium C-Channel",
    img: "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png",
    // href: "/products?category=Aluminium+Products",
    href: "/productDetail",
    category: "Aluminium Products",
    tag: "ISI Marked",
  },
  {
    id: 36, name: "Electrical Conduit Pipes",
    img: "https://yourbuildmart.com/public/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg",
    // href: "/products?category=Electrical+Products",
    href: "/productDetail",
    category: "Electrical Products",
    tag: "ISI Marked",
  },
  {
    id: 37, name: "False Ceiling Grid System",
    img: "https://yourbuildmart.com/public/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg",
    // href: "/products?category=False+Ceiling",
    href: "/productDetail",
    category: "False Ceiling",
    tag: "Best Price",
  },
  {
    id: 38, name: "Industrial Ball Valves",
    img: "https://yourbuildmart.com/public/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg",
    // href: "/products?category=Industrial+Valves",
    href: "/productDetail",
    category: "Industrial Valves",
    tag: "ISO Certified",
  },
];

const CATEGORIES_SIDEBAR = [
  { name: "All Products", img: null, href: "#", count: 12 },
  { name: "Aluminium Products", img: "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png", href: "/products?category=Aluminium+Products", count: 5 },
  { name: "Electrical Products", img: "https://yourbuildmart.com/public/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg", href: "/products?category=Electrical+Products", count: 8 },
  { name: "False Ceiling", img: "https://yourbuildmart.com/public/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg", href: "/products?category=False+Ceiling", count: 6 },
  { name: "Fire Fighting", img: "https://yourbuildmart.com/public/uploads/all/G98hSbCqpgGs4u7l116dQRNkdnVowdyYliKEVerr.jpg", href: "/products?category=Fire+Fighting", count: 7 },
  { name: "Industrial Valves", img: "https://yourbuildmart.com/public/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg", href: "/products?category=Industrial+Valves", count: 9 },
  { name: "PEB Structure", img: "https://yourbuildmart.com/public/uploads/all/blJXzfApTXVc3364qVExp6aNwVo9dCs80CaEqfXG.jpg", href: "/products?category=PEB+Structure", count: 4 },
  { name: "TMT Steel", img: "https://yourbuildmart.com/public/assets/img/steel__bars.jpg", href: "/products?category=TMT+Steel", count: 6 },
  { name: "Steel Sections", img: "https://yourbuildmart.com/public/uploads/all/ht8ZZADqglloTYRX26oSKQL3YFoFOyUnR4t2bqWx.jpg", href: "https://yourbuildmart.com/steel-sections-and-accessories-products", count: 10 },
];

const TAG_COLORS = {
  "ISO Certified": { bg: "#e8f5e9", color: "#2e7d32" },
  "ISI Marked": { bg: "#e3f2fd", color: "#1565c0" },
  "Global Delivery": { bg: "#fce4ec", color: "#c62828" },
  "Best Price": { bg: "#fff8e1", color: "#f57f17" },
};

// ─── THEME TOGGLE (exact copy from App.jsx) ───────────────────────────────────


// ─── HEADER (exact mirror of App.jsx Header) ─────────────────────────────────


// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
function Breadcrumb() {
  const { dark } = useTheme();
  const sep = dark ? "#444" : "#ddd";
  const textMuted = dark ? "#888" : "#999";
  const textActive = dark ? "#e8e8e8" : "#222";

  return (
    <div style={{
      background: dark ? "#111" : "#f8f8f8",
      borderBottom: `1px solid ${dark ? "#222" : "#eee"}`,
      padding: "14px 0",
      transition: "background 0.4s, border-color 0.4s",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,32px)", display: "flex", alignItems: "center", gap: 8 }}>
        <Link to="/" style={{ color: textMuted, fontSize: 13, textDecoration: "none", fontWeight: 500 }}
          onMouseEnter={e => e.target.style.color = "#e62e04"}
          onMouseLeave={e => e.target.style.color = textMuted}
        >Home</Link>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M4 2l4 4-4 4" stroke={sep} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span style={{ color: textActive, fontSize: 13, fontWeight: 600 }}>All Products</span>
      </div>
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductCard({ product, dark, index }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const handleAdd = (e) => {
    e.preventDefault();
    addItem({ id: product.id, name: product.name, category: product.category, img: product.img });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };
  const [imgError, setImgError] = useState(false);
  const tag = TAG_COLORS[product.tag] || TAG_COLORS["ISO Certified"];
  const cardBg = dark ? "#1a1a1a" : "#fff";
  const border = dark ? "#2a2a2a" : "#f0f0f0";
  const nameColor = dark ? "#f0f0f0" : "#1a1a1a";
  const catColor = dark ? "#888" : "#999";

  return (
    <div className="prod-card" style={{
      background: cardBg,
      border: `1px solid ${border}`,
      borderRadius: 16,
      overflow: "hidden",
      cursor: "pointer",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      boxShadow: dark ? "0 2px 16px rgba(0,0,0,0.3)" : "0 2px 16px rgba(0,0,0,0.06)",
      animation: `slideUp 0.5s ease both`,
      animationDelay: `${index * 0.07}s`,
    }}>
      {/* Image container */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3", background: dark ? "#111" : "#f9f9f9" }}>
        <img
          src={imgError ? "https://yourbuildmart.com/public/assets/img/placeholder.jpg" : product.img}
          alt={product.name}
          onError={() => setImgError(true)}
          className="prod-img"
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease", display: "block" }}
        />
        {/* Overlay on hover */}
        <div className="prod-overlay" style={{
          position: "absolute", inset: 0, background: "rgba(230,46,4,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: 0, transition: "opacity 0.3s ease",
        }}>
          <a href={product.href} target="_blank" rel="noopener noreferrer" style={{
            background: "#fff", color: "#e62e04", padding: "10px 24px", borderRadius: 8,
            fontWeight: 700, fontSize: 14, textDecoration: "none", letterSpacing: "0.3px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}>View Product →</a>
        </div>
        {/* Tag badge */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: tag.bg, color: tag.color,
          fontSize: 11, fontWeight: 700, padding: "4px 10px",
          borderRadius: 20, letterSpacing: "0.3px",
        }}>{product.tag}</div>
      </div>

      {/* Card body */}
      <div style={{ padding: "16px 18px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#e62e04", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
          {product.category}
        </div>
        <h3 style={{
          fontSize: 15, fontWeight: 700, color: nameColor, marginBottom: 14,
          lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
          transition: "color 0.4s",
        }}>{product.name}</h3>
        <Link
          to="/productDetail"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "1.5px solid #e62e04",
            color: "#e62e04",
            padding: "7px 16px",
            borderRadius: 7,
            fontWeight: 700,
            fontSize: 12,
            textDecoration: "none",
            transition: "all 0.2s",
            letterSpacing: "0.2px",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#e62e04";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#e62e04";
          }}
        >
          View Details
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6h8M6 2l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </Link>
        <button onClick={handleAdd} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: added ? "#1a6b3c" : "#e62e04", color: "#fff",
          border: "none", padding: "7px 14px", borderRadius: 7,
          fontWeight: 700, fontSize: 12, cursor: "pointer",
          transition: "all 0.25s", marginLeft: 8, letterSpacing: "0.2px",
        }}
          onMouseEnter={e => { if (!added) e.currentTarget.style.background = "#c42500"; }}
          onMouseLeave={e => { if (!added) e.currentTarget.style.background = "#e62e04"; }}
        >
          {added ? "✓ Added" : "🛒 Add"}
        </button>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ dark, activeCategory, onSelectCategory }) {
  const bg = dark ? "#111" : "#fff";
  const border = dark ? "#222" : "#f0f0f0";
  const headingColor = dark ? "#f0f0f0" : "#1a1a1a";
  const textColor = dark ? "#ccc" : "#555";
  const hoverBg = dark ? "#1e1e1e" : "#fef0ed";

  return (
    <aside style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 16,
      overflow: "hidden", position: "sticky", top: 88,
      transition: "background 0.4s, border-color 0.4s",
      boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
    }}>
      {/* Header */}
      <div style={{ padding: "18px 20px", background: "#e62e04", display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "0.5px", textTransform: "uppercase" }}>Categories</span>
      </div>

      {/* Category list */}
      <ul style={{ listStyle: "none", padding: "8px 0" }}>
        {CATEGORIES_SIDEBAR.map((cat) => (
          <li key={cat.name}>
            <button
              onClick={() => onSelectCategory(cat.name)}
              className={`sidebar-cat${activeCategory === cat.name ? " active-cat" : ""}`}
              style={{
                width: "100%", textAlign: "left", padding: "11px 20px",
                background: activeCategory === cat.name ? "#e62e04" : "transparent",
                border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                transition: "background 0.2s, color 0.2s", borderBottom: `1px solid ${border}`,
              }}
            >
              {cat.img && (
                <img src={cat.img} alt={cat.name} style={{ width: 20, height: 20, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
              )}
              {!cat.img && (
                <span style={{ width: 20, height: 20, background: "#e62e04", borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                </span>
              )}
              <span style={{
                fontSize: 13, fontWeight: 600, flex: 1,
                color: activeCategory === cat.name ? "#fff" : textColor,
                transition: "color 0.2s",
              }}>{cat.name}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                background: activeCategory === cat.name ? "rgba(255,255,255,0.2)" : (dark ? "#222" : "#f5f5f5"),
                color: activeCategory === cat.name ? "#fff" : textColor,
                transition: "all 0.2s",
              }}>{cat.count}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* CTA Banner */}
      <div style={{
        margin: 16, borderRadius: 12, padding: "20px 18px",
        background: "linear-gradient(135deg, #e62e04 0%, #c42500 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>
          Need bulk pricing?
        </p>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
          Get special quotes for large orders
        </p>
        <Link to="/contact" style={{
          background: "#fff", color: "#e62e04", padding: "8px 16px",
          borderRadius: 7, fontWeight: 700, fontSize: 12, textDecoration: "none",
          display: "inline-block", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f5f5f5"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
        >Contact Sales →</Link>
      </div>
    </aside>
  );
}

// ─── PAGE HERO BANNER ─────────────────────────────────────────────────────────
function ProductHero({ dark }) {
  const bg = dark ? "#0d0d0d" : "#fff";
  const border = dark ? "#222" : "#f0f0f0";

  return (
    <div style={{
      background: dark ? "linear-gradient(135deg, #0d0d0d 0%, #1a0a05 100%)" : "linear-gradient(135deg, #fff 0%, #fff5f3 100%)",
      borderBottom: `1px solid ${border}`,
      padding: "48px 0 40px",
      transition: "background 0.4s",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,32px)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{
                background: "#e62e04", color: "#fff", fontSize: 11, fontWeight: 800,
                padding: "4px 12px", borderRadius: 20, letterSpacing: "1px", textTransform: "uppercase",
              }}>ISO Certified</span>
              <span style={{ color: dark ? "#888" : "#999", fontSize: 13 }}>400+ Products Available</span>
            </div>
            <h1 style={{
              fontSize: 36, fontWeight: 900, color: dark ? "#f0f0f0" : "#111",
              letterSpacing: "-1px", marginBottom: 10, lineHeight: 1.1,
              transition: "color 0.4s",
            }}>
              All <span style={{ color: "#e62e04" }}>Products</span>
            </h1>
            <p style={{ fontSize: 15, color: dark ? "#888" : "#666", maxWidth: 480, lineHeight: 1.6, transition: "color 0.4s" }}>
              Premium construction & building materials — ISO and ISI certified, shipped worldwide.
            </p>
          </div>
          {/* Stats strip */}
          <div style={{ display: "flex", gap: 32 }}>
            {[
              { val: "400+", label: "Products" },
              { val: "80+", label: "Brands" },
              { val: "500+", label: "Customers" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#e62e04", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: dark ? "#888" : "#999", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SORT / FILTER BAR ────────────────────────────────────────────────────────
function FilterBar({ dark, sortBy, onSortChange, totalCount, searchQuery, onSearchChange }) {
  const bg = dark ? "#111" : "#fff";
  const border = dark ? "#222" : "#f0f0f0";
  const textColor = dark ? "#e8e8e8" : "#333";
  const inputBg = dark ? "#1e1e1e" : "#f5f5f5";

  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 12,
      padding: "16px 20px", marginBottom: 24, display: "flex",
      alignItems: "center", gap: 16, flexWrap: "wrap",
      transition: "background 0.4s, border-color 0.4s",
      boxShadow: dark ? "0 2px 12px rgba(0,0,0,0.2)" : "0 2px 12px rgba(0,0,0,0.04)",
    }}>
      {/* Search */}
      <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 10, background: inputBg, borderRadius: 8, padding: "8px 14px", transition: "background 0.4s" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={dark ? "#666" : "#aaa"} strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search products…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: textColor, width: "100%", transition: "color 0.4s" }}
        />
      </div>

      {/* Results count */}
      <span style={{ fontSize: 13, color: dark ? "#888" : "#999", whiteSpace: "nowrap" }}>
        <b style={{ color: textColor }}>{totalCount}</b> results
      </span>

      {/* Sort */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: dark ? "#888" : "#999", whiteSpace: "nowrap" }}>Sort by</span>
        <select
          value={sortBy}
          onChange={e => onSortChange(e.target.value)}
          style={{
            border: `1px solid ${border}`, borderRadius: 8, padding: "8px 12px",
            fontSize: 13, fontWeight: 600, color: textColor, background: bg,
            cursor: "pointer", outline: "none", transition: "all 0.3s",
          }}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
        </select>
      </div>
    </div>
  );
}


// ─── PAGINATION ───────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange, dark }) {
  const bg = dark ? "#111" : "#fff";
  const border = dark ? "#333" : "#eee";
  const textColor = dark ? "#ccc" : "#555";

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 40 }}>
      {currentPage > 1 && (
        <button onClick={() => onPageChange(currentPage - 1)} style={{
          padding: "9px 16px", background: bg, border: `1px solid ${border}`, borderRadius: 8,
          cursor: "pointer", color: textColor, fontWeight: 600, fontSize: 13, transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#e62e04"; e.currentTarget.style.color = "#e62e04"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textColor; }}
        >← Prev</button>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPageChange(p)} style={{
          padding: "9px 15px", background: p === currentPage ? "#e62e04" : bg,
          border: `1px solid ${p === currentPage ? "#e62e04" : border}`,
          borderRadius: 8, cursor: "pointer",
          color: p === currentPage ? "#fff" : textColor,
          fontWeight: 700, fontSize: 13, transition: "all 0.2s",
          minWidth: 40,
        }}
          onMouseEnter={e => { if (p !== currentPage) { e.currentTarget.style.borderColor = "#e62e04"; e.currentTarget.style.color = "#e62e04"; } }}
          onMouseLeave={e => { if (p !== currentPage) { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textColor; } }}
        >{p}</button>
      ))}
      {currentPage < totalPages && (
        <button onClick={() => onPageChange(currentPage + 1)} style={{
          padding: "9px 16px", background: bg, border: `1px solid ${border}`, borderRadius: 8,
          cursor: "pointer", color: textColor, fontWeight: 600, fontSize: 13, transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#e62e04"; e.currentTarget.style.color = "#e62e04"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textColor; }}
        >Next →</button>
      )}
    </div>
  );
}

// ─── MAIN PRODUCTS PAGE ───────────────────────────────────────────────────────
function ProductsPage() {
  const { dark } = useTheme();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");

  const [activeCategory, setActiveCategory] = useState(
    urlCategory ? decodeURIComponent(urlCategory) : "All Products"
  );
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Sync sidebar when URL ?category= changes (e.g. nav dropdown click)
  useEffect(() => {
    if (urlCategory) {
      setActiveCategory(decodeURIComponent(urlCategory));
      setCurrentPage(1);
    } else {
      setActiveCategory("All Products");
    }
  }, [urlCategory]);

  const bg = dark ? "#0d0d0d" : "#f4f5f7";

  // Filter + sort
  const filtered = ALL_PRODUCTS.filter(p => {
    const matchCat = activeCategory === "All Products" || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);
    if (sortBy === "oldest") return a.id - b.id;
    return b.id - a.id; // newest
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  return (
    <main style={{ background: bg, minHeight: "100vh", transition: "background 0.4s" }}>
      <ProductHero dark={dark} />
      <Breadcrumb />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 32px 60px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 28, alignItems: "start" }}>
        {/* Sidebar */}
        <Sidebar dark={dark} activeCategory={activeCategory} onSelectCategory={handleCategoryChange} />

        {/* Main content */}
        <div>
          <FilterBar
            dark={dark}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalCount={sorted.length}
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
          />

          {/* Empty state */}
          {paginated.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ color: dark ? "#ccc" : "#555", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No products found</h3>
              <p style={{ color: dark ? "#666" : "#999", fontSize: 14 }}>Try adjusting your search or category filter</p>
            </div>
          )}

          {/* Product grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}>
            {paginated.map((product, idx) => (
              <ProductCard key={product.id} product={product} dark={dark} index={idx} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} dark={dark} />
          )}
        </div>
      </div>
    </main>
  );
}

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────
export default function Products() {
  const [dark, setDark] = useState(false);
  const toggle = () => setDark(d => !d);

  useEffect(() => {
    document.body.style.background = dark ? "#0d0d0d" : "#f4f5f7";
    document.body.style.transition = "background 0.4s ease";
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", background: dark ? "#0d0d0d" : "#f4f5f7", transition: "background 0.4s ease" }}>
        <SharedHeader activePage="/products" />
        <ProductsPage />
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}

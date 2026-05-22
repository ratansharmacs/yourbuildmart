import { useState, useEffect, useRef } from "react";
import { SharedHeader, useTheme, ThemeContext, Footer } from "../components";
import { Link } from "react-router-dom";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const BRAND_LIST = [
  { name: "ABB", href: "https://yourbuildmart.com/brand/abb", img: "https://yourbuildmart.com/public/uploads/all/U3vHSo6epE3ARS5X8EwltXTJWEQgeJGIwiOAxoRS.png" },
  { name: "China Hongqiao Group Limited", href: "https://yourbuildmart.com/brand/china-hongqiao-group-limited", img: "https://yourbuildmart.com/public/uploads/all/mfahTdlfjR8vvyGolhF8aaUKshBqVzPCkXo8sz77.png" },
  { name: "Foshan Shenghai Aluminium", href: "https://yourbuildmart.com/brand/foshan-shenghai-aluminium", img: "https://yourbuildmart.com/public/uploads/all/H1vp8BGwbjz8O6LrBhGM7Xj71sFtvQyMxghdS54p.jpg" },
  { name: "Gyproc", href: "https://yourbuildmart.com/brand/Gyproc-12MLZ", img: "https://yourbuildmart.com/public/uploads/all/7u4hCVub6qswOZ6LmYOtLyLOe65p1QPhNzucDBxY.png" },
  { name: "Havells", href: "https://yourbuildmart.com/brand/Havells-MeYuo", img: "https://yourbuildmart.com/public/uploads/all/pqPKFk4BNaQpi9vLGzkWjnOc3Qw1QY8hTjV28E79.png" },
  { name: "Hindalco", href: "https://yourbuildmart.com/brand/Hindalco-1PNCD", img: "https://yourbuildmart.com/public/assets/img/hindalco.png" },
  { name: "Jindal Aluminum", href: "https://yourbuildmart.com/brand/Jindal-Aluminum-OQBw1", img: "https://yourbuildmart.com/public/assets/img/jindal.png" },
  { name: "Jindal Steel", href: "https://yourbuildmart.com/brand/Jindal-Steel-07ec0", img: "https://yourbuildmart.com/public/assets/img/jindal.png" },
  { name: "JSW Steel", href: "https://yourbuildmart.com/brand/JSW-Steel-jdlOa", img: "https://yourbuildmart.com/public/assets/img/jsw.png" },
  { name: "Larsen & Toubro", href: "https://yourbuildmart.com/brand/Larsen--Toubro-zjoxT", img: "https://yourbuildmart.com/public/uploads/all/LwXhCzBLJCdXvipjCeSfoE0i9iL7jNK2Y0KkDd3l.png" },
  { name: "Lesso", href: "https://yourbuildmart.com/brand/Lesso-g3Nvo", img: "https://yourbuildmart.com/public/uploads/all/hIlwDoF53qyzUkYzrF9QjbcFcmJ5yzkDCtSWFNpP.jpg" },
  { name: "Octal Corporation", href: "https://yourbuildmart.com/brand/Octal-Corporation-L12c5", img: "https://yourbuildmart.com/public/uploads/all/hIlwDoF53qyzUkYzrF9QjbcFcmJ5yzkDCtSWFNpP.jpg" },
  { name: "Shanghai Metal Corporation (SMC)", href: "https://yourbuildmart.com/brand/Shanghai-Metal-Corporation-SMC-LHeRH", img: "https://yourbuildmart.com/public/uploads/all/LwXhCzBLJCdXvipjCeSfoE0i9iL7jNK2Y0KkDd3l.png" },
  { name: "Steel Authority of India (SAIL)", href: "https://yourbuildmart.com/brand/steel-authortiy-of-india", img: "https://yourbuildmart.com/public/uploads/all/9fPVZFXDHJKh2whj7wG7wYLCBxXvtr7aSPxejY1u.png" },
  { name: "Supreme PVC and Steel Pipe Corp", href: "https://yourbuildmart.com/brand/Supreme-PVC-and-Steel-Pipe-Corp-a8LdZ", img: "https://yourbuildmart.com/public/assets/img/supreme.png" },
  { name: "TPMC Steel", href: "https://yourbuildmart.com/brand/TPMC-Steel-zVSI1", img: "https://yourbuildmart.com/public/uploads/all/AGLZdUVO1cQuLcDCCkSh1sFbfnkwcAeLFXR58rrh.jpg" },
];

const CATEGORIES = [
  { name: "Aluminium Products", href: "/products?category=Aluminium+Products", img: "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png" },
  { name: "Electrical Products", href: "/products?category=Electrical+Products", img: "https://yourbuildmart.com/public/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg" },
  { name: "False Ceiling", href: "/products?category=False+Ceiling", img: "https://yourbuildmart.com/public/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg" },
  { name: "Fire Fighting", href: "/products?category=Fire+Fighting", img: "https://yourbuildmart.com/public/uploads/all/G98hSbCqpgGs4u7l116dQRNkdnVowdyYliKEVerr.jpg" },
  { name: "Industrial Valves", href: "/products?category=Industrial+Valves", img: "https://yourbuildmart.com/public/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg" },
  { name: "PEB Structure", href: "/products?category=PEB+Structure", img: "https://yourbuildmart.com/public/uploads/all/blJXzfApTXVc3364qVExp6aNwVo9dCs80CaEqfXG.jpg" },
  { name: "Steel Sections & Accessories", href: "https://yourbuildmart.com/steel-sections-and-accessories-products", img: "https://yourbuildmart.com/public/uploads/all/DLcjTi8wNsrumAc5poqrwuxCx9UmRHhJnZwlPFdI.jpg" },
  { name: "TMT Steel", href: "/products?category=TMT+Steel", img: "https://yourbuildmart.com/public/assets/img/steel__bars.jpg" },
  { name: "Plumbing Products", href: "https://yourbuildmart.com/plumbing-products", img: "https://yourbuildmart.com/public/uploads/all/oH3uf21AfjDe8KZjlk0eFmOBrJO56azYpWizh7nd.jpg" },
];

const TOP_PRODUCTS = [
  { name: "Aluminium C-Channel", href: "/products?category=Aluminium+Products" },
  { name: "Aluminium T Section", href: "/products?category=Aluminium+Products" },
  { name: "Electrical Transformer", href: "/products?category=Electrical+Products" },
  { name: "PVC Insulated Electrical Wires", href: "/products?category=Electrical+Products" },
  { name: "Metal False Ceiling Channel", href: "/products?category=False+Ceiling" },
  { name: "False Ceiling Joint Tape", href: "/products?category=False+Ceiling" },
];

// ─── SHARED ANIMATIONS ────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
  @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 16px rgba(230,46,4,0.3); } 50% { box-shadow: 0 0 32px rgba(230,46,4,0.65); } }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { transition: background 0.4s ease, color 0.4s ease; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #e62e04; border-radius: 4px; }
`;

// ─── HEADER (same as App.jsx) ─────────────────────────────────────────────────


// ─── BREADCRUMB HERO ──────────────────────────────────────────────────────────
function BrandsHero() {
  const { dark } = useTheme();

  return (
    <section style={{ position: "relative", background: dark ? "#0d0d0d" : "#f9f9f9", borderBottom: dark ? "1px solid #1a1a1a" : "1px solid #ebebeb", overflow: "hidden" }}>
      {/* Decorative accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #e62e04, #ff6b3d, #e62e04)" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 48px 40px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Link to="/" style={{ fontSize: 13, color: dark ? "#666" : "#999", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = "#e62e04"} onMouseLeave={e => e.target.style.color = dark ? "#666" : "#999"}>Home</Link>
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none"><path d="M1 1l4 4-4 4" stroke={dark ? "#444" : "#ccc"} strokeWidth="1.5" /></svg>
            <span style={{ fontSize: 13, color: "#e62e04", fontWeight: 600 }}>All Brands</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 900, color: dark ? "#fff" : "#111", letterSpacing: "-1px", lineHeight: 1.1 }}>
            Our Partner <span style={{ color: "#e62e04" }}>Brands</span>
          </h1>
          <p style={{ marginTop: 12, fontSize: 15, color: dark ? "#888" : "#666", maxWidth: 480, lineHeight: 1.6 }}>
            Trusted global manufacturers behind every certified product we deliver worldwide.
          </p>
        </div>

        {/* Brand count badge */}
        <div style={{ display: "flex", gap: 20 }}>
          {[{ n: "80+", l: "Partner Brands" }, { n: "400+", l: "Products" }, { n: "500+", l: "Happy Clients" }].map(item => (
            <div key={item.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#e62e04", letterSpacing: "-1px" }}>{item.n}</div>
              <div style={{ fontSize: 12, color: dark ? "#666" : "#999", fontWeight: 500, marginTop: 2 }}>{item.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ dark, activeBrand, setActiveBrand }) {
  const cardBg     = dark ? "#111" : "#fff";
  const cardBorder = dark ? "#1e1e1e" : "#ebebeb";
  const headingBg  = "#e62e04";
  const textMuted  = dark ? "#888" : "#666";
  const hoverBg    = dark ? "#1a1a1a" : "#fef0ed";

  const SideCard = ({ title, children }) => (
    <div style={{ background: cardBg, borderRadius: 12, border: `1px solid ${cardBorder}`, overflow: "hidden", marginBottom: 20, boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)" }}>
      <div style={{ background: headingBg, padding: "14px 20px" }}>
        <h3 style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" }}>{title}</h3>
      </div>
      <div style={{ padding: "8px 0" }}>{children}</div>
    </div>
  );

  const SideLink = ({ href, children, active, onClick }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <a href={href} onClick={onClick}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 20px", fontSize: 14, color: active ? "#e62e04" : (hovered ? "#e62e04" : (dark ? "#ccc" : "#444")), textDecoration: "none", background: active ? (dark ? "#1a1a1a" : "#fef0ed") : (hovered ? hoverBg : "transparent"), transition: "all 0.15s", borderLeft: active ? "3px solid #e62e04" : "3px solid transparent" }}>
        {children}
        <svg width="5" height="9" viewBox="0 0 5 9" fill="none"><path d="M1 1l3 3.5L1 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
      </a>
    );
  };

  return (
    <aside style={{ width: 260, flexShrink: 0 }}>
      {/* Explore by Brand */}
      <SideCard title="Explore by Brand">
        {BRAND_LIST.map((b) => (
          <SideLink key={b.name} href={b.href} active={activeBrand === b.name} onClick={e => { e.preventDefault(); setActiveBrand(b.name === activeBrand ? null : b.name); }}>
            {b.name}
          </SideLink>
        ))}
      </SideCard>

      {/* Categories */}
      <SideCard title="Product Categories">
        {CATEGORIES.map((c) => (
          <SideLink key={c.name} href={c.href}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src={c.img} alt={c.name} style={{ width: 20, height: 20, objectFit: "contain", borderRadius: 3, background: dark ? "#222" : "#f5f5f5" }} onError={e => e.target.style.display = "none"} />
              {c.name}
            </span>
          </SideLink>
        ))}
      </SideCard>

      {/* Top Selling */}
      <SideCard title="Top Selling Products">
        {TOP_PRODUCTS.map((p) => (
          <SideLink key={p.name} href={p.href}>{p.name}</SideLink>
        ))}
      </SideCard>

      {/* CTA Banner */}
      <div style={{ background: "linear-gradient(135deg, #e62e04, #c92600)", borderRadius: 12, padding: "24px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -10, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ fontSize: 28, marginBottom: 8 }}>🏗️</div>
        <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>Need Help Choosing?</p>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>Our experts are ready to assist you 24/7</p>
        <Link to="/contact"
          style={{ display: "block", background: "#fff", color: "#e62e04", padding: "10px 0", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "transform 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
          Contact Us
        </Link>
      </div>
    </aside>
  );
}

// ─── BRAND CARD ───────────────────────────────────────────────────────────────
function BrandCard({ brand, dark, highlighted }) {
  const [hovered, setHovered] = useState(false);
  const cardBg     = dark ? "#111" : "#fff";
  const cardBorder = dark ? "#1e1e1e" : "#e8e8e8";
  const nameBg     = dark ? "#0d0d0d" : "#f7f7f7";
  const nameColor  = dark ? "#e8e8e8" : "#1a1a1a";

  return (
    <a href={brand.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{
        background: cardBg,
        border: `1px solid ${highlighted ? "#e62e04" : (hovered ? "#e62e04" : cardBorder)}`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "all 0.25s cubic-bezier(0.34,1.2,0.64,1)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered
          ? (dark ? "0 12px 40px rgba(230,46,4,0.2), 0 4px 16px rgba(0,0,0,0.4)" : "0 12px 40px rgba(230,46,4,0.15), 0 4px 16px rgba(0,0,0,0.08)")
          : (dark ? "0 2px 12px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.05)"),
        animation: highlighted ? "pulseGlow 2s infinite" : "none",
      }}>
        {/* Image area */}
        <div style={{ position: "relative", aspectRatio: "4/3", background: dark ? "#181818" : "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflow: "hidden" }}>
          {/* Subtle grid pattern */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <img src={brand.img} alt={brand.name}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transition: "transform 0.3s", transform: hovered ? "scale(1.06)" : "scale(1)", position: "relative" }}
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
          {/* Fallback */}
          <div style={{ display: "none", position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", fontSize: 36, color: dark ? "#333" : "#ddd" }}>🏭</div>

          {/* Hover overlay */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(230,46,4,0.08)", opacity: hovered ? 1 : 0, transition: "opacity 0.25s" }} />

          {/* View badge on hover */}
          <div style={{ position: "absolute", top: 12, right: 12, background: "#e62e04", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(-6px)", transition: "all 0.25s", letterSpacing: "0.5px" }}>
            VIEW →
          </div>
        </div>

        {/* Info area */}
        <div style={{ background: nameBg, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${hovered ? "#e62e04" : (dark ? "#1e1e1e" : "#ebebeb")}`, transition: "border-color 0.25s" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: hovered ? "#e62e04" : nameColor, transition: "color 0.2s", letterSpacing: "-0.2px", lineHeight: 1.3 }}>{brand.name}</h3>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: hovered ? 1 : 0.3, transition: "opacity 0.2s", color: "#e62e04", flexShrink: 0 }}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </a>
  );
}

// ─── MAIN BRANDS SECTION ──────────────────────────────────────────────────────
function BrandsGrid() {
  const { dark } = useTheme();
  const [activeBrand, setActiveBrand] = useState(null);
  const [search, setSearch] = useState("");
  const [sortAZ, setSortAZ] = useState(false);

  const filtered = BRAND_LIST
    .filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortAZ ? a.name.localeCompare(b.name) : 0);

  const textPrimary = dark ? "#fff" : "#111";
  const subText     = dark ? "#888" : "#777";
  const inputBg     = dark ? "#111" : "#f5f5f5";
  const inputBorder = dark ? "#222" : "#e0e0e0";

  return (
    <section style={{ background: dark ? "#0d0d0d" : "#f4f5f7", minHeight: "70vh", padding: "48px 0 80px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>

          {/* ── Sidebar ── */}
          <Sidebar dark={dark} activeBrand={activeBrand} setActiveBrand={setActiveBrand} />

          {/* ── Main Content ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: dark ? "#555" : "#bbb" }}>
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brands…"
                  style={{ width: "100%", padding: "11px 14px 11px 42px", background: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 10, fontSize: 14, color: dark ? "#e8e8e8" : "#333", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#e62e04"} onBlur={e => e.target.style.borderColor = inputBorder} />
              </div>

              <button onClick={() => setSortAZ(s => !s)}
                style={{ padding: "11px 18px", borderRadius: 10, border: `1px solid ${sortAZ ? "#e62e04" : inputBorder}`, background: sortAZ ? "#e62e04" : inputBg, color: sortAZ ? "#fff" : (dark ? "#aaa" : "#555"), fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                A → Z
              </button>

              {activeBrand && (
                <button onClick={() => setActiveBrand(null)}
                  style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid #e62e04", background: "transparent", color: "#e62e04", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                  ✕ Clear Filter
                </button>
              )}

              <div style={{ marginLeft: "auto", fontSize: 13, color: subText, whiteSpace: "nowrap" }}>
                <span style={{ fontWeight: 700, color: textPrimary }}>{filtered.length}</span> brands found
              </div>
            </div>

            {/* Active filter pill */}
            {activeBrand && (
              <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, color: subText }}>Filtering:</span>
                <span style={{ background: "#e62e04", color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{activeBrand}</span>
              </div>
            )}

            {/* Grid */}
            {filtered.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
                {filtered.map((brand, i) => (
                  <div key={brand.name} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${Math.min(i * 40, 400)}ms` }}>
                    <BrandCard brand={brand} dark={dark} highlighted={activeBrand === brand.name} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "80px 20px", color: subText }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p style={{ fontSize: 18, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>No brands found</p>
                <p style={{ fontSize: 14 }}>Try adjusting your search term.</p>
              </div>
            )}

            {/* Partner CTA strip */}
            <div style={{ marginTop: 56, background: dark ? "#111" : "#fff", borderRadius: 16, padding: "36px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", border: `1px solid ${dark ? "#1e1e1e" : "#e8e8e8"}`, boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
              <div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: dark ? "#fff" : "#111", marginBottom: 8, letterSpacing: "-0.5px" }}>
                  Don't see your brand? <span style={{ color: "#e62e04" }}>Let's talk.</span>
                </h3>
                <p style={{ fontSize: 14, color: dark ? "#888" : "#666", lineHeight: 1.6, maxWidth: 480 }}>
                  We work with 80+ global manufacturers. If you're looking for a specific brand or want to partner with us, our team is ready to help.
                </p>
              </div>
              <Link to="/contact"
                style={{ background: "#e62e04", color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", letterSpacing: "0.2px", transition: "all 0.2s", flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = "#c92600"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(230,46,4,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                Contact Our Team →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


// ─── PAGE EXPORT ──────────────────────────────────────────────────────────────
export default function BrandsPage() {
  const [dark, setDark] = useState(false);
  const toggle = () => setDark(d => !d);

  useEffect(() => {
    document.body.style.background = dark ? "#0d0d0d" : "#fff";
    document.body.style.transition = "background 0.4s ease";
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ overflowX: "hidden", fontFamily: "Segoe UI", background: dark ? "#0d0d0d" : "#fff", transition: "background 0.4s ease" }}>
        <SharedHeader activePage="/brands" />
        <BrandsHero />
        <BrandsGrid />
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}

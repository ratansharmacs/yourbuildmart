import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useSiteImage } from "./SiteImagesContext";
import ThemeToggle from "./ThemeToggle";
import CartDrawer from "./CartDrawer";
import { BASE_URL, getToken, resolveImageUrl } from "../services/api";

// Inline SVG fallback — guaranteed to render even fully offline (no external request)
const PRODUCT_FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#f0f0f0"/><path d="M9 21l4.5-6 3.5 4 2.5-3 4 5H9z" fill="#ccc"/><circle cx="12" cy="11" r="2" fill="#ccc"/></svg>`
);

function logHeaderSearch(query) {
  if (!query || query.trim().length < 2) return;
  fetch(`${BASE_URL}/analytics/search-log`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
    body: JSON.stringify({ query: query.trim(), source: "header" }),
  }).catch(() => {});
}

const STATIC_NAV = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about", sub: [{ label: "YourBuild Mart", href: "/about" }, { label: "Quality Assurance", href: "/quality-assurance" }] },
  { label: "Products", href: "/products", isDynamic: true, sub: [] },
  { label: "View By Brands", href: "/brands" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

export default function SharedHeader({ activePage = "" }) {
  const { dark } = useTheme();
  const logoUrl = useSiteImage("header", "logo", "https://yourbuildmart.com/public/uploads/all/DYfx9g2ssosQQWwE1ubmTZYOWxNQXynFAw6slr3a.png");
  const { count } = useCart();
  const { user, logout, isLoggedIn, isAdmin } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate("/"); };
  const [scrolled, setScrolled] = useState(false);
  const [headerSearchVal, setHeaderSearchVal] = useState("");
  const [suggestions, setSuggestions] = useState({ products: [], categories: [], brands: [] });
  const [suggLoading, setSuggLoading] = useState(false);
  const [activeSugg, setActiveSugg] = useState(-1);
  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  const [cartBounce, setCartBounce] = useState(false);
  const [navLinks, setNavLinks] = useState(STATIC_NAV);

  // Allow any page (e.g. Profile) to open the cart drawer via custom event
  useEffect(() => {
    const handler = () => setCartOpen(true);
    window.addEventListener("ybm:open-cart", handler);
    return () => window.removeEventListener("ybm:open-cart", handler);
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/categories`)
      .then(r => r.json())
      .then(data => {
        const list = data?.data ?? data?.content ?? data ?? [];
        const cats = Array.isArray(list) ? list : [];
        if (!cats.length) return;
        setNavLinks(prev => prev.map(link =>
          link.isDynamic ? { ...link, sub: cats.map(c => ({ label: c.name, href: `/products?category=${encodeURIComponent(c.name)}` })) } : link
        ));
      })
      .catch(() => {
        setNavLinks(prev => prev.map(link => link.isDynamic ? { ...link, sub: [
          { label: "Aluminium Products", href: "/products?category=Aluminium+Products" },
          { label: "Electrical Products", href: "/products?category=Electrical+Products" },
          { label: "False Ceiling Products", href: "/products?category=False+Ceiling+Products" },
          { label: "Fire Fighting Products", href: "/products?category=Fire+Fighting+Products" },
          { label: "Industrial Valves", href: "/products?category=Industrial+Valves" },
          { label: "PEB Structure Products", href: "/products?category=PEB+Structure+Products" },
          { label: "Plumbing Products", href: "/products?category=Plumbing+Products" },
          { label: "Steel Sections & Accessories", href: "/products?category=Steel+Sections+%26+Accessories+Products" },
          { label: "TMT Steels Products", href: "/products?category=TMT+Steels+Products" },
        ] } : link));
      });
  }, []);

  useEffect(() => { const fn = () => setScrolled(window.scrollY > 30); window.addEventListener("scroll", fn); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { if (count > prevCount) { setCartBounce(true); setTimeout(() => setCartBounce(false), 500); } setPrevCount(count); }, [count]);
  useEffect(() => { const fn = () => { if (window.innerWidth > 900) setMenuOpen(false); }; window.addEventListener("resize", fn); return () => window.removeEventListener("resize", fn); }, []);

  const bg     = dark ? (scrolled ? "rgba(10,10,12,0.97)" : "#0d0d0f") : (scrolled ? "rgba(255,255,255,0.97)" : "#ffffff");
  const border = dark ? (scrolled ? "rgba(255,255,255,0.06)" : "#1c1c1c") : (scrolled ? "rgba(0,0,0,0.06)" : "#f0f0f0");
  const shadow = scrolled ? (dark ? "0 4px 32px rgba(0,0,0,0.6)" : "0 4px 32px rgba(0,0,0,0.08)") : "none";
  const textColor = dark ? "#e0e0e0" : "#222";
  const subBg = dark ? "#111113" : "#ffffff";
  const subBorder = dark ? "#222" : "#f0f0f0";
  const subText = dark ? "#b0b0b0" : "#444";

  return (
    <>
      <style>{`
        @keyframes fadeSlideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes cartBounce { 0%,100% { transform:scale(1); } 30% { transform:scale(1.28); } 60% { transform:scale(0.9); } }
        @keyframes slideInDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes marquee { 0% { transform:translateX(0); } 100% { transform:translateX(-33.33%); } }

        .ybm-nav-item:hover .ybm-nav-dropdown { opacity:1 !important; visibility:visible !important; transform:translateX(-50%) translateY(0) !important; pointer-events:auto !important; }
        .ybm-nav-item:hover .ybm-nav-dropdown > div { transform:translateY(0) !important; }
        .ybm-nav-item:hover .ybm-nav-link { color:#e62e04 !important; }
        .ybm-nav-item:hover .ybm-nav-chevron { transform:rotate(180deg) !important; }

        .ybm-nav-link {
          padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600;
          display:flex; align-items:center; gap:5px; white-space:nowrap;
          text-decoration:none; transition: color 0.18s ease;
          position: relative;
        }
        .ybm-nav-link.active-link { color: #e62e04 !important; }
        .ybm-nav-link.active-link::after {
          content: ""; position: absolute; bottom: -2px; left: 14px; right: 14px;
          height: 2px; background: #e62e04; border-radius: 2px;
        }

        .nav-cat-item { display:block; padding:9px 18px; font-size:13px; text-decoration:none; transition:background 0.15s, color 0.15s; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .nav-cat-item:hover { background:#fef0ed !important; color:#e62e04 !important; }

        .products-dropdown-panel { min-width:260px; max-height:400px; overflow-y:auto; scrollbar-width:thin; scrollbar-color:#e62e04 transparent; }
        .products-dropdown-panel::-webkit-scrollbar { width:3px; }
        .products-dropdown-panel::-webkit-scrollbar-thumb { background:#e62e04; border-radius:3px; }

        .hdr-icon-btn {
          background: ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"};
          border: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"};
          border-radius: 8px; width: 36px; height: 36px;
          display:flex; align-items:center; justify-content:center; cursor:pointer;
          transition: background 0.18s ease, border-color 0.18s ease;
        }
        .hdr-icon-btn:hover { background: rgba(230,46,4,0.10) !important; border-color: rgba(230,46,4,0.25) !important; }

        @media (max-width:900px) { .desktop-nav { display:none !important; } .desktop-actions { display:none !important; } .mobile-toggle { display:flex !important; } }
        @media (min-width:901px) { .mobile-toggle { display:none !important; } .mobile-actions-bar { display:none !important; } }
      `}</style>

      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: bg, backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${border}`,
        boxShadow: shadow,
        overflow: "visible",
        transition: "background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,32px)", height: 64, display: "flex", alignItems: "center", gap: 16 }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <img
              src={logoUrl}
              alt="YourBuildMart"
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "https://yourbuildmart.com/public/uploads/all/DYfx9g2ssosQQWwE1ubmTZYOWxNQXynFAw6slr3a.png"; }}
              style={{ height: 32, objectFit: "contain", filter: dark ? "invert(1) brightness(0.85)" : "none", transition: "filter 0.3s" }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav" style={{ flex: 1, display: "flex", alignItems: "center", gap: 0, justifyContent: "center", overflow: "visible" }}>
            {navLinks.map((link) => {
              const hasSub = link.isDynamic || (link.sub && link.sub.length > 0);
              const isActive = activePage === link.href;
              return (
                <div key={link.label} className="ybm-nav-item" style={{ position: "relative" }}>
                  <Link to={link.href} className={`ybm-nav-link${isActive ? " active-link" : ""}`} style={{ color: isActive ? "#e62e04" : textColor }}>
                    {link.label}
                    {hasSub && (
                      <svg className="ybm-nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0, transition: "transform 0.2s" }}>
                        <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </Link>
                  {hasSub && (
                    <div className={`ybm-nav-dropdown`} style={{
                      position: "absolute", top: "calc(100% + 4px)", left: "50%",
                      transform: "translateX(-50%) translateY(-8px)",
                      zIndex: 1001,
                      opacity: 0, visibility: "hidden",
                      transition: "opacity 0.2s ease, transform 0.2s ease, visibility 0.2s",
                      pointerEvents: "none",
                    }}>
                      <div className={link.isDynamic ? "products-dropdown-panel" : ""} style={{
                        background: subBg, borderRadius: 10, padding: "6px 0",
                        boxShadow: dark ? "0 12px 40px rgba(0,0,0,0.6)" : "0 12px 40px rgba(0,0,0,0.14)",
                        minWidth: link.isDynamic ? 260 : 200,
                        border: `1px solid ${subBorder}`,
                        transform: "translateY(8px)",
                      }}>
                      {link.sub && link.sub.length === 0 && link.isDynamic
                        ? <div style={{ padding: "12px 18px", fontSize: 13, color: subText, opacity: 0.5 }}>Loading…</div>
                        : (link.sub || []).map(s => <Link key={s.label} to={s.href} className="nav-cat-item" style={{ color: subText }}>{s.label}</Link>)
                      }
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="desktop-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <ThemeToggle />

            {/* Inline Search Bar — Amazon/Flipkart style */}
            <div style={{ position: "relative", flex: "1", maxWidth: 420, minWidth: 180, margin: "0 8px" }}>
              <div style={{
                display: "flex", alignItems: "center",
                background: dark ? "#1a1a1a" : "#f5f5f5",
                border: `1.5px solid ${searchFocused ? "#e62e04" : (dark ? "#2a2a2a" : "#e0e0e0")}`,
                borderRadius: 8,
                overflow: "hidden",
                transition: "border-color 0.2s",
                height: 38,
              }}>
                <input
                  type="text"
                  placeholder="Search products, brands, categories…"
                  value={headerSearchVal}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  onChange={async e => {
                    const val = e.target.value;
                    setHeaderSearchVal(val);
                    setActiveSugg(-1);
                    if (val.trim().length < 2) { setSuggestions({ products: [], categories: [], brands: [] }); return; }
                    setSuggLoading(true);
                    try {
                      const { productsApi, categoriesApi, brandsApi } = await import("../services/api");
                      const q = val.trim().toLowerCase();
                      const [productRes, catRes, brandRes] = await Promise.allSettled([
                        productsApi.search(val.trim(), { page: 0, size: 5 }),
                        categoriesApi.getAll(),
                        brandsApi.getAll(),
                      ]);
                      const products = productRes.status === "fulfilled"
                        ? (productRes.value?.content || productRes.value?.items || (Array.isArray(productRes.value) ? productRes.value : [])).slice(0, 5)
                        : [];
                      if (process.env.NODE_ENV !== "production") {
                        products.forEach(p => { if (!p.imageUrl && !p.additionalImages?.[0]) console.warn("[Search Suggestion] Product has no image at all (DB):", p.id, p.name); });
                      }
                      const allCats = catRes.status === "fulfilled"
                        ? (catRes.value?.data ?? catRes.value?.content ?? catRes.value ?? [])
                        : [];
                      const allBrands = brandRes.status === "fulfilled"
                        ? (brandRes.value?.data ?? brandRes.value?.content ?? brandRes.value ?? [])
                        : [];
                      const categories = Array.isArray(allCats) ? allCats.filter(c => c.name?.toLowerCase().includes(q)).slice(0, 3) : [];
                      const brands = Array.isArray(allBrands) ? allBrands.filter(b => b.name?.toLowerCase().includes(q)).slice(0, 3) : [];
                      setSuggestions({ products, categories, brands });
                    } catch { setSuggestions({ products: [], categories: [], brands: [] }); }
                    finally { setSuggLoading(false); }
                  }}
                  onKeyDown={e => {
                    const flatItems = [
                      ...(suggestions.categories || []).map(c => ({ _type: "category", ...c })),
                      ...(suggestions.brands || []).map(b => ({ _type: "brand", ...b })),
                      ...(suggestions.products || []).map(p => ({ _type: "product", ...p })),
                    ];
                    if (e.key === "ArrowDown") { setActiveSugg(i => Math.min(i + 1, flatItems.length - 1)); return; }
                    if (e.key === "ArrowUp") { setActiveSugg(i => Math.max(i - 1, -1)); return; }
                    if (e.key === "Enter") {
                      if (activeSugg >= 0 && flatItems[activeSugg]) {
                        const item = flatItems[activeSugg];
                        setSuggestions({ products: [], categories: [], brands: [] }); setHeaderSearchVal("");
                        if (item._type === "product") navigate(`/productDetail?id=${item.id}`);
                        else if (item._type === "category") navigate(`/products?category=${encodeURIComponent(item.name)}`);
                        else if (item._type === "brand") navigate(`/products?brand=${encodeURIComponent(item.name)}`);
                        return;
                      }
                      if (headerSearchVal.trim()) {
                        logHeaderSearch(headerSearchVal.trim());
                        setSuggestions({ products: [], categories: [], brands: [] });
                        navigate(`/products?search=${encodeURIComponent(headerSearchVal.trim())}`);
                        setHeaderSearchVal("");
                      }
                    }
                    if (e.key === "Escape") { setSuggestions({ products: [], categories: [], brands: [] }); setHeaderSearchVal(""); }
                  }}
                  style={{
                    flex: 1, border: "none", outline: "none",
                    background: "transparent",
                    fontSize: 13, color: dark ? "#eee" : "#222",
                    padding: "0 10px",
                    height: "100%",
                  }}
                />
                {headerSearchVal && (
                  <button onClick={() => { setHeaderSearchVal(""); setSuggestions({ products: [], categories: [], brands: [] }); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 14, padding: "0 6px", lineHeight: 1, flexShrink: 0 }}>✕</button>
                )}
                <button
                  onClick={() => {
                    if (headerSearchVal.trim()) {
                      logHeaderSearch(headerSearchVal.trim());
                      setSuggestions({ products: [], categories: [], brands: [] });
                      navigate(`/products?search=${encodeURIComponent(headerSearchVal.trim())}`);
                      setHeaderSearchVal("");
                    }
                  }}
                  style={{
                    background: "#e62e04", border: "none", cursor: "pointer",
                    width: 40, height: "100%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "0 6px 6px 0",
                    transition: "background 0.18s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#c42500"}
                  onMouseLeave={e => e.currentTarget.style.background = "#e62e04"}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </button>
              </div>

              {/* Suggestions dropdown — grouped: Categories · Brands · Products */}
              {(() => {
                const hasResults = suggestions.products?.length > 0 || suggestions.categories?.length > 0 || suggestions.brands?.length > 0;
                if (!searchFocused || (!suggLoading && !hasResults)) return null;
                const flatItems = [
                  ...(suggestions.categories || []).map(c => ({ _type: "category", ...c })),
                  ...(suggestions.brands || []).map(b => ({ _type: "brand", ...b })),
                  ...(suggestions.products || []).map(p => ({ _type: "product", ...p })),
                ];
                let flatIdx = -1;
                const SectionLabel = ({ icon, label }) => (
                  <div style={{ padding: "8px 14px 4px", fontSize: 10, fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase", color: dark ? "#555" : "#bbb", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{icon}</span>{label}
                  </div>
                );
                const hoverBg = dark ? "#252525" : "#f7f7f7";
                return (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                    background: dark ? "#1a1a1a" : "#fff",
                    border: `1px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`,
                    borderRadius: 10, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                    overflow: "hidden", zIndex: 9999,
                    animation: "fadeSlideDown 0.15s ease",
                  }}>
                    {suggLoading && (
                      <div style={{ padding: "14px 16px", color: "#999", fontSize: 13, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid #e62e04", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        Searching…
                      </div>
                    )}
                    {!suggLoading && hasResults && (
                      <>
                        {/* ── Categories ── */}
                        {suggestions.categories?.length > 0 && (
                          <div>
                            <SectionLabel icon="🗂️" label="Categories" />
                            {suggestions.categories.map(c => {
                              flatIdx++;
                              const myIdx = flatIdx;
                              return (
                                <div key={`cat-${c.id}`}
                                  onMouseDown={() => { setSuggestions({ products: [], categories: [], brands: [] }); setHeaderSearchVal(""); navigate(`/products?category=${encodeURIComponent(c.name)}`); }}
                                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", background: myIdx === activeSugg ? (dark ? "#252525" : "#f5f5f5") : "transparent", transition: "background 0.1s" }}
                                  onMouseEnter={e => { setActiveSugg(myIdx); e.currentTarget.style.background = hoverBg; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = myIdx === activeSugg ? (dark ? "#252525" : "#f5f5f5") : "transparent"; }}
                                >
                                  <div style={{ width: 30, height: 30, borderRadius: 7, background: dark ? "#2a2a2a" : "#fef0ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e62e04" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: dark ? "#eee" : "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                                    <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>Category</div>
                                  </div>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* ── Brands ── */}
                        {suggestions.brands?.length > 0 && (
                          <div style={{ borderTop: suggestions.categories?.length > 0 ? `1px solid ${dark ? "#222" : "#f0f0f0"}` : "none" }}>
                            <SectionLabel icon="🏷️" label="Brands" />
                            {suggestions.brands.map(b => {
                              flatIdx++;
                              const myIdx = flatIdx;
                              return (
                                <div key={`brand-${b.id}`}
                                  onMouseDown={() => { setSuggestions({ products: [], categories: [], brands: [] }); setHeaderSearchVal(""); navigate(`/products?brand=${encodeURIComponent(b.name)}`); }}
                                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", background: myIdx === activeSugg ? (dark ? "#252525" : "#f5f5f5") : "transparent", transition: "background 0.1s" }}
                                  onMouseEnter={e => { setActiveSugg(myIdx); e.currentTarget.style.background = hoverBg; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = myIdx === activeSugg ? (dark ? "#252525" : "#f5f5f5") : "transparent"; }}
                                >
                                  {b.logoUrl ? (
                                    <img src={resolveImageUrl(b.logoUrl)} alt={b.name} onError={e => { e.target.style.display = "none"; }} style={{ width: 30, height: 30, borderRadius: 7, objectFit: "contain", border: `1px solid ${dark ? "#2a2a2a" : "#eee"}`, flexShrink: 0, background: dark ? "#222" : "#fafafa" }} />
                                  ) : (
                                    <div style={{ width: 30, height: 30, borderRadius: 7, background: dark ? "#2a2a2a" : "#fff3f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${dark ? "#333" : "#fde0da"}` }}>
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e62e04" strokeWidth="2.2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                                    </div>
                                  )}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: dark ? "#eee" : "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</div>
                                    <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>Brand</div>
                                  </div>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* ── Products ── */}
                        {suggestions.products?.length > 0 && (
                          <div style={{ borderTop: (suggestions.categories?.length > 0 || suggestions.brands?.length > 0) ? `1px solid ${dark ? "#222" : "#f0f0f0"}` : "none" }}>
                            <SectionLabel icon="📦" label="Products" />
                            {suggestions.products.map(p => {
                              flatIdx++;
                              const myIdx = flatIdx;
                              return (
                                <div key={`prod-${p.id}`}
                                  onMouseDown={() => { setSuggestions({ products: [], categories: [], brands: [] }); setHeaderSearchVal(""); navigate(`/productDetail?id=${p.id}`); }}
                                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", background: myIdx === activeSugg ? (dark ? "#252525" : "#f5f5f5") : "transparent", transition: "background 0.1s" }}
                                  onMouseEnter={e => { setActiveSugg(myIdx); e.currentTarget.style.background = hoverBg; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = myIdx === activeSugg ? (dark ? "#252525" : "#f5f5f5") : "transparent"; }}
                                >
                                  <img
                                    src={resolveImageUrl(p.imageUrl) || resolveImageUrl(p.additionalImages?.[0]) || PRODUCT_FALLBACK_IMG}
                                    onError={e => { e.target.onerror = null; e.target.src = PRODUCT_FALLBACK_IMG; }}
                                    alt={p.name}
                                    style={{ width: 32, height: 32, borderRadius: 7, objectFit: "cover", border: `1px solid ${dark ? "#2a2a2a" : "#eee"}`, flexShrink: 0, background: dark ? "#222" : "#fafafa" }}
                                  />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: dark ? "#eee" : "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                                    {p.categoryName && <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>{p.categoryName}</div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* ── See all ── */}
                        <div
                          onMouseDown={() => { logHeaderSearch(headerSearchVal.trim()); setSuggestions({ products: [], categories: [], brands: [] }); navigate(`/products?search=${encodeURIComponent(headerSearchVal.trim())}`); setHeaderSearchVal(""); }}
                          style={{ padding: "10px 14px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#e62e04", cursor: "pointer", borderTop: `1px solid ${dark ? "#222" : "#f0f0f0"}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                          onMouseEnter={e => e.currentTarget.style.background = dark ? "#222" : "#f9f9f9"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e62e04" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
                          See all results for "{headerSearchVal}" →
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>

            {isLoggedIn ? (
              <div style={{ position: "relative" }} onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                <button style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: dark ? "rgba(230,46,4,0.12)" : "rgba(230,46,4,0.08)",
                  border: "1px solid rgba(230,46,4,0.25)", borderRadius: 8,
                  padding: "5px 12px 5px 5px", cursor: "pointer", transition: "all 0.2s",
                }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#e62e04,#c42500)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                    {(user?.fullName || user?.email || "U")[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#e62e04", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user?.fullName?.split(" ")[0] || "Account"}
                  </span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e62e04" strokeWidth="2.5" style={{ transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                {/* Bridge div to prevent gap between button and dropdown */}
                {userMenuOpen && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, height: 12 }} />}
                {userMenuOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 200, background: dark ? "rgba(14,14,16,0.98)" : "rgba(255,255,255,0.98)", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, borderRadius: 12, overflow: "hidden", boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.7)" : "0 20px 60px rgba(0,0,0,0.12)", backdropFilter: "blur(20px)", animation: "fadeSlideDown 0.18s ease", zIndex: 999 }}>
                    <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: dark ? "#f0f0f0" : "#111", marginBottom: 2 }}>{user?.fullName || "User"}</div>
                      <div style={{ fontSize: 11.5, color: dark ? "#555" : "#999" }}>{user?.email || ""}</div>
                      {isAdmin && <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(230,46,4,0.10)", border: "1px solid rgba(230,46,4,0.22)", borderRadius: 20, padding: "2px 8px" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#e62e04", display: "inline-block" }} /><span style={{ fontSize: 10, color: "#e62e04", fontWeight: 700, letterSpacing: "0.5px" }}>ADMINISTRATOR</span></div>}
                    </div>
                    <div style={{ padding: "6px 0" }}>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", textDecoration: "none", background: "rgba(230,46,4,0.06)", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(230,46,4,0.12)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(230,46,4,0.06)"}>
                          <span style={{ fontSize: 15 }}>🛠️</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#e62e04" }}>Admin Panel</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e62e04" strokeWidth="2.5" style={{ marginLeft: "auto" }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </Link>
                      )}
                      {[{ to: "/profile", icon: "👤", label: "My Profile" }, { to: "/orders", icon: "📋", label: "My Enquiries" }, { to: "/wishlist", icon: "❤️", label: "Wishlist" }].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", textDecoration: "none", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <span style={{ fontSize: 14 }}>{item.icon}</span>
                          <span style={{ fontSize: 13, color: dark ? "#bbb" : "#333", fontWeight: 500 }}>{item.label}</span>
                        </Link>
                      ))}
                      <div style={{ margin: "4px 0", borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }} />
                      <button onClick={() => { setUserMenuOpen(false); handleLogout(); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "none", border: "none", cursor: "pointer", transition: "background 0.15s", fontFamily: "inherit" }} onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(248,113,113,0.08)" : "rgba(220,38,38,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <span style={{ fontSize: 14 }}>🚪</span>
                        <span style={{ fontSize: 13, color: "#f87171", fontWeight: 600 }}>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" style={{ background: "none", border: "1.5px solid rgba(230,46,4,0.5)", color: "#e62e04", padding: "6px 16px", borderRadius: 7, fontWeight: 700, fontSize: 13, textDecoration: "none", transition: "all 0.18s" }} onMouseEnter={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#e62e04"; }}>Login</Link>
                <Link to="/register" style={{ background: "#e62e04", color: "#fff", padding: "6px 16px", borderRadius: 7, fontWeight: 700, fontSize: 13, textDecoration: "none", transition: "background 0.18s" }} onMouseEnter={e => e.currentTarget.style.background = "#c42500"} onMouseLeave={e => e.currentTarget.style.background = "#e62e04"}>Register</Link>
              </>
            )}

            <button className="hdr-icon-btn" onClick={() => setCartOpen(true)} style={{ position: "relative", animation: cartBounce ? "cartBounce 0.5s ease" : "none" }} title="Cart">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={count > 0 ? "#e62e04" : (dark ? "#bbb" : "#555")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {count > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#e62e04", color: "#fff", borderRadius: "50%", width: 17, height: 17, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${bg}` }}>{count > 99 ? "99+" : count}</span>}
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="mobile-toggle" style={{ display: "none", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <ThemeToggle />
            <button className="hdr-icon-btn" onClick={() => setCartOpen(true)} style={{ position: "relative", animation: cartBounce ? "cartBounce 0.5s ease" : "none" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={count > 0 ? "#e62e04" : (dark ? "#bbb" : "#555")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {count > 0 && <span style={{ position: "absolute", top: -6, right: -6, background: "#e62e04", color: "#fff", borderRadius: "50%", width: 17, height: 17, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${bg}` }}>{count > 99 ? "99+" : count}</span>}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`, borderRadius: 8, width: 36, height: 36, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4.5, cursor: "pointer" }}>
              <span style={{ display: "block", width: 16, height: 1.5, background: dark ? "#ddd" : "#333", borderRadius: 2, transition: "all 0.25s", transform: menuOpen ? "rotate(45deg) translate(4px,4px)" : "none" }} />
              <span style={{ display: "block", width: 16, height: 1.5, background: dark ? "#ddd" : "#333", borderRadius: 2, transition: "all 0.25s", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 16, height: 1.5, background: dark ? "#ddd" : "#333", borderRadius: 2, transition: "all 0.25s", transform: menuOpen ? "rotate(-45deg) translate(4px,-4px)" : "none" }} />
            </button>
          </div>
        </div>


        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: dark ? "#0d0d0f" : "#fff", borderTop: `1px solid ${dark ? "#1e1e1e" : "#f0f0f0"}`, boxShadow: dark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 16px 40px rgba(0,0,0,0.10)", maxHeight: "80vh", overflowY: "auto", animation: "slideInDown 0.22s ease" }}>
            {navLinks.map(link => (
              <div key={link.label}>
                <Link to={link.href} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px clamp(16px,4vw,24px)", fontSize: 14, fontWeight: 600, color: activePage === link.href ? "#e62e04" : textColor, textDecoration: "none", borderBottom: `1px solid ${dark ? "#1a1a1a" : "#f5f5f5"}` }}>
                  {link.label}
                  {link.sub?.length > 0 && <span style={{ fontSize: 11, opacity: 0.4 }}>▾</span>}
                </Link>
                {link.sub?.length > 0 && (
                  <div style={{ background: dark ? "#0a0a0c" : "#fafafa" }}>
                    {link.sub.map(s => (
                      <Link key={s.label} to={s.href} onClick={() => setMenuOpen(false)} style={{ display: "block", padding: "10px clamp(28px,6vw,40px)", fontSize: 13, color: dark ? "#888" : "#666", textDecoration: "none", borderBottom: `1px solid ${dark ? "#161616" : "#efefef"}` }} onMouseEnter={e => { e.currentTarget.style.color = "#e62e04"; }} onMouseLeave={e => { e.currentTarget.style.color = dark ? "#888" : "#666"; }}>{s.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div style={{ padding: "16px clamp(16px,4vw,24px)", borderTop: `1px solid ${dark ? "#1a1a1a" : "#f0f0f0"}` }}>
              {isLoggedIn ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "10px 14px", background: dark ? "rgba(230,46,4,0.07)" : "rgba(230,46,4,0.05)", borderRadius: 10, border: "1px solid rgba(230,46,4,0.15)" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#e62e04,#c42500)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{(user?.fullName || user?.email || "U")[0].toUpperCase()}</div>
                    <div><div style={{ fontSize: 13, fontWeight: 700, color: dark ? "#f0f0f0" : "#111" }}>{user?.fullName || "User"}</div>{isAdmin && <div style={{ fontSize: 10, color: "#e62e04", fontWeight: 700, letterSpacing: "0.5px" }}>ADMINISTRATOR</div>}</div>
                  </div>
                  {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 9, background: "rgba(230,46,4,0.08)", border: "1px solid rgba(230,46,4,0.20)", textDecoration: "none", marginBottom: 4 }}><span style={{ fontSize: 15 }}>🛠️</span><span style={{ fontSize: 13, fontWeight: 700, color: "#e62e04" }}>Admin Panel</span></Link>}
                  {[{ to: "/profile", icon: "👤", label: "My Profile" }, { to: "/orders", icon: "📋", label: "My Enquiries" }, { to: "/wishlist", icon: "❤️", label: "Wishlist" }].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 9, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)", textDecoration: "none" }}><span style={{ fontSize: 14 }}>{item.icon}</span><span style={{ fontSize: 13, color: dark ? "#bbb" : "#333", fontWeight: 500 }}>{item.label}</span></Link>
                  ))}
                  <button onClick={() => { setMenuOpen(false); handleLogout(); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 9, background: dark ? "rgba(248,113,113,0.07)" : "rgba(220,38,38,0.05)", border: "none", cursor: "pointer", fontFamily: "inherit", marginTop: 4, width: "100%" }}><span style={{ fontSize: 14 }}>🚪</span><span style={{ fontSize: 13, color: "#f87171", fontWeight: 700 }}>Logout</span></button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <Link to="/login" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: "center", padding: "11px", borderRadius: 8, border: "1.5px solid rgba(230,46,4,0.5)", color: "#e62e04", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} style={{ flex: 1, textAlign: "center", padding: "11px", borderRadius: 8, background: "#e62e04", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 14 }}>Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer — pushes page content below the fixed header */}
      <div style={{ height: 64 }} />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

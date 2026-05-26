import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useCart } from "./CartContext";
import ThemeToggle from "./ThemeToggle";
import CartDrawer from "./CartDrawer";

// ─── NAV LINKS ────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "/" },
  {
    label: "About Us", href: "/about",
    sub: [
      { label: "YourBuild Mart", href: "/about" },
      { label: "Quality Assurance", href: "/about" },
    ],
  },
  {
    label: "Products", href: "/products",
    sub: [
      { label: "Aluminium Products", href: "/products?category=Aluminium+Products" },
      { label: "Electrical Products", href: "/products?category=Electrical+Products" },
      { label: "False Ceiling", href: "/products?category=False+Ceiling" },
      { label: "Fire Fighting", href: "/products?category=Fire+Fighting" },
      { label: "Industrial Valves", href: "/products?category=Industrial+Valves" },
      { label: "PEB Structure", href: "/products?category=PEB+Structure" },
      { label: "TMT Steel", href: "/products?category=TMT+Steel" },
    ],
  },
  { label: "View By Brands", href: "/brands" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

// ─── SHARED HEADER ────────────────────────────────────────────────────────────
export default function SharedHeader({ activePage = "" }) {
  const { dark } = useTheme();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [prevCount, setPrevCount] = useState(count);
  const [cartBounce, setCartBounce] = useState(false);

  const bg = dark ? (scrolled ? "rgba(10,10,10,0.98)" : "#0d0d0d") : (scrolled ? "rgba(255,255,255,0.98)" : "#fff");
  const shadow = scrolled ? (dark ? "0 2px 24px rgba(0,0,0,0.5)" : "0 2px 24px rgba(0,0,0,0.1)") : (dark ? "0 1px 0 #222" : "0 1px 0 #eee");
  const textColor = dark ? "#e8e8e8" : "#333";
  const subBg = dark ? "#111" : "#fff";
  const subBorder = dark ? "#222" : "#f0f0f0";
  const subText = dark ? "#ccc" : "#444";
  const subHoverBg = dark ? "#1e1e1e" : "#fef0ed";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count > prevCount) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 500);
    }
    setPrevCount(count);
  }, [count]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 900) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isInternal = (href) => href.startsWith("/");

  return (
    <>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }
        @keyframes floatBlob { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(30px,-40px) scale(1.08); } }
        @keyframes pulseGlow { 0%,100% { box-shadow:0 0 16px rgba(230,46,4,0.4); } 50% { box-shadow:0 0 32px rgba(230,46,4,0.75); } }
        @keyframes cartBounce { 0%,100% { transform:scale(1); } 30% { transform:scale(1.25); } 60% { transform:scale(0.92); } }
        @keyframes fadeSlideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes slideInRight { from { transform:translateX(100%); } to { transform:translateX(0); } }
        @keyframes slideInDown { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { transition:background 0.4s ease, color 0.4s ease; }
        .cat-track::-webkit-scrollbar { display:none; }
        .cat-track { -ms-overflow-style:none; scrollbar-width:none; }
        .prod-card:hover .prod-img { transform:scale(1.06); }
        .prod-card:hover .prod-overlay { opacity:1; }
        .prod-card:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,0.15) !important; }
        .sidebar-cat:hover { background:#fef0ed; color:#e62e04; }
        .sidebar-cat.active-cat { background:#e62e04 !important; color:#fff !important; }
        .sidebar-cat.active-cat span { color:#fff !important; }
        .nav-link-item { transition:color 0.2s, background 0.2s; }
        .mobile-menu-overlay { animation: fadeIn 0.2s ease; }
        .mobile-menu-panel { animation: slideInDown 0.25s cubic-bezier(.22,.68,0,1.2); }
        @media (max-width:900px) {
          .desktop-nav { display:none !important; }
          .desktop-actions { display:none !important; }
          .mobile-toggle { display:flex !important; }
        }
        @media (min-width:901px) {
          .mobile-toggle { display:none !important; }
          .mobile-actions-bar { display:none !important; }
        }
        @media (max-width: 1024px) {
          .hero-content { padding: 0 clamp(16px,5vw,60px) !important; }
        }
        @media (max-width: 768px) {
          .why-grid { grid-template-columns: 1fr 1fr !important; }
          .cat-grid  { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .blog-grid  { grid-template-columns: 1fr !important; }
          .brand-grid { grid-template-columns: repeat(3,1fr) !important; }
          .agent-split { flex-direction: column !important; }
          .test-grid  { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-btns { flex-direction: column !important; align-items: flex-start !important; }
          .prod-grid  { grid-template-columns: 1fr 1fr !important; }
          .sidebar-layout { flex-direction: column !important; }
          .detail-layout { flex-direction: column !important; }
        }
        @media (max-width: 480px) {
          .why-grid { grid-template-columns: 1fr !important; }
          .cat-grid  { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .brand-grid { grid-template-columns: repeat(2,1fr) !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .prod-grid  { grid-template-columns: 1fr !important; }
        }
        img { max-width: 100%; }
        a, button { transition: all 0.2s ease; }

        /* ── Additional responsive rules ──────────────────────────────── */
        /* Two-col grids → single col on mobile */
        @media (max-width: 768px) {
          [class="about-grid"], [class="sustain-grid"] {
            grid-template-columns: 1fr !important;
          }
          /* Hero section */
          .hs-layout { flex-direction: column !important; padding: 40px 20px !important; min-height: auto !important; }
          .hs-cards { display: none !important; }
          .hs-text { flex: unset !important; width: 100% !important; }
          /* Vision/Mission grid */
          .vision-grid { grid-template-columns: 1fr !important; }
          /* Cert grid */
          .cert-grid { grid-template-columns: 1fr 1fr !important; }
          /* Product offer grid */
          .offer-grid { grid-template-columns: 1fr 1fr !important; }
          /* Agent split */
          .agent-grid { grid-template-columns: 1fr !important; }
          /* Contact grid */
          .contact-grid { grid-template-columns: 1fr !important; }
          /* Brands featured grid */
          .brands-feat { grid-template-columns: 1fr !important; }
          /* Stats */
          .stats-row { grid-template-columns: 1fr 1fr !important; }
          /* Blog grid */
          .blog-posts-grid { grid-template-columns: 1fr !important; }
          /* Testimonials grid */
          .test-grid-inner { grid-template-columns: 1fr !important; }
          /* Why us grid */
          .why-us-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .cert-grid, .offer-grid, .why-us-grid, .stats-row { grid-template-columns: 1fr !important; }
          .footer-inner-grid { grid-template-columns: 1fr !important; }
        }
        /* Hero stats row responsive */
        @media (max-width: 480px) {
          .hero-stats-row { gap: 8px !important; }
          .hero-stat-item { padding-left: 12px !important; }
        }
        /* Fix hero section overflow on small screens */
        @media (max-width: 900px) {
          .hero-outer section { min-height: auto !important; }
        }
        /* Ensure cards stack on mobile */
        @media (max-width: 640px) {
          .hero-right-cards { display: none !important; }
        }
      `}</style>

      <header style={{
        position: "sticky", top: 0, zIndex: 1000,
        background: bg, backdropFilter: "blur(12px)",
        boxShadow: shadow, transition: "background 0.3s, box-shadow 0.3s",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)", height: 72, display: "flex", alignItems: "center", gap: 16 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", flexShrink: 0 }}>
            <img
              src="https://yourbuildmart.com/public/uploads/all/DYfx9g2ssosQQWwE1ubmTZYOWxNQXynFAw6slr3a.png"
              alt="YourBuildMart"
              style={{ height: 36, objectFit: "contain", filter: dark ? "invert(1) brightness(0.9)" : "none", transition: "filter 0.3s" }}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="desktop-nav" style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, justifyContent: "center", flexWrap: "nowrap", overflow: "hidden" }}>
            {NAV_LINKS.map((link) => (
              <div key={link.label} style={{ position: "relative" }}
                onMouseEnter={() => link.sub && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {isInternal(link.href) ? (
                  <Link to={link.href} className="nav-link-item" style={{
                    padding: "8px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                    color: activePage === link.href ? "#e62e04" : textColor,
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                    background: activeDropdown === link.label ? (dark ? "#1e1e1e" : "#fef0ed") : "transparent",
                    whiteSpace: "nowrap",
                  }}
                    onMouseEnter={e => { if (!link.sub) e.currentTarget.style.color = "#e62e04"; }}
                    onMouseLeave={e => { if (!link.sub) e.currentTarget.style.color = activePage === link.href ? "#e62e04" : textColor; }}
                  >
                    {link.label}
                    {link.sub && <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l4 4 4-4" /></svg>}
                  </Link>
                ) : (
                  <a href={link.href} rel="noopener noreferrer" className="nav-link-item" style={{
                    padding: "8px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                    color: textColor, textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                    background: activeDropdown === link.label ? (dark ? "#1e1e1e" : "#fef0ed") : "transparent",
                    whiteSpace: "nowrap",
                  }}
                    onMouseEnter={e => { if (!link.sub) e.currentTarget.style.color = "#e62e04"; }}
                    onMouseLeave={e => { if (!link.sub) e.currentTarget.style.color = textColor; }}
                  >
                    {link.label}
                    {link.sub && <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l4 4 4-4" /></svg>}
                  </a>
                )}

                {link.sub && activeDropdown === link.label && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0,
                    background: subBg, borderRadius: 10, padding: "8px 0",
                    boxShadow: dark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.14)",
                    minWidth: 210, border: `1px solid ${subBorder}`, zIndex: 999,
                    animation: "fadeSlideDown 0.18s ease",
                  }}>
                    {link.sub.map((s) =>
                      isInternal(s.href) ? (
                        <Link key={s.label} to={s.href} style={{
                          display: "block", padding: "9px 18px", fontSize: 13, color: subText,
                          textDecoration: "none", transition: "background 0.15s, color 0.15s",
                        }}
                          onMouseEnter={e => { e.target.style.background = subHoverBg; e.target.style.color = "#e62e04"; }}
                          onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = subText; }}
                        >{s.label}</Link>
                      ) : (
                        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                          display: "block", padding: "9px 18px", fontSize: 13, color: subText,
                          textDecoration: "none", transition: "background 0.15s, color 0.15s",
                        }}
                          onMouseEnter={e => { e.target.style.background = subHoverBg; e.target.style.color = "#e62e04"; }}
                          onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = subText; }}
                        >{s.label}</a>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="desktop-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <ThemeToggle />
            <button onClick={() => setSearchOpen(!searchOpen)} style={{
              background: dark ? "#1e1e1e" : "#f5f5f5", border: "none", borderRadius: 6,
              width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={dark ? "#aaa" : "#555"} strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <a href="https://yourbuildmart.com/users/login" target="_blank" rel="noopener noreferrer" style={{
              background: "none", border: "1.5px solid #e62e04", color: "#e62e04",
              padding: "7px 16px", borderRadius: 6, fontWeight: 700, fontSize: 13,
              textDecoration: "none", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#e62e04"; }}
            >Login</a>
            <a href="https://yourbuildmart.com/users/registration" target="_blank" rel="noopener noreferrer" style={{
              background: "#e62e04", color: "#fff", padding: "7px 16px",
              borderRadius: 6, fontWeight: 700, fontSize: 13, textDecoration: "none",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#c42500"}
              onMouseLeave={e => e.currentTarget.style.background = "#e62e04"}
            >Register</a>
            <button onClick={() => setCartOpen(true)} style={{
              position: "relative", background: dark ? "#1e1e1e" : "#f5f5f5", border: "none",
              borderRadius: 6, width: 38, height: 38, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", transition: "background 0.2s",
              animation: cartBounce ? "cartBounce 0.5s ease" : "none",
            }}
              onMouseEnter={e => e.currentTarget.style.background = dark ? "#2a2a2a" : "#fef0ed"}
              onMouseLeave={e => e.currentTarget.style.background = dark ? "#1e1e1e" : "#f5f5f5"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={count > 0 ? "#e62e04" : (dark ? "#aaa" : "#555")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {count > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -5, background: "#e62e04", color: "#fff",
                  borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${bg}`, lineHeight: 1,
                }}>{count > 99 ? "99+" : count}</span>
              )}
            </button>
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="mobile-toggle" style={{ display: "none", alignItems: "center", gap: 10, marginLeft: "auto" }}>
            <ThemeToggle />
            <button onClick={() => setCartOpen(true)} style={{
              position: "relative", background: dark ? "#1e1e1e" : "#f5f5f5", border: "none",
              borderRadius: 6, width: 38, height: 38, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
              animation: cartBounce ? "cartBounce 0.5s ease" : "none",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={count > 0 ? "#e62e04" : (dark ? "#aaa" : "#555")} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {count > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -5, background: "#e62e04", color: "#fff",
                  borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${bg}`,
                }}>{count > 99 ? "99+" : count}</span>
              )}
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: dark ? "#1e1e1e" : "#f5f5f5", border: "none", borderRadius: 6,
              width: 38, height: 38, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer",
            }}>
              <span style={{ display: "block", width: 18, height: 2, background: dark ? "#eee" : "#333", borderRadius: 2, transition: "all 0.25s", transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }} />
              <span style={{ display: "block", width: 18, height: 2, background: dark ? "#eee" : "#333", borderRadius: 2, transition: "all 0.25s", opacity: menuOpen ? 0 : 1 }} />
              <span style={{ display: "block", width: 18, height: 2, background: dark ? "#eee" : "#333", borderRadius: 2, transition: "all 0.25s", transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{
            borderTop: `1px solid ${dark ? "#222" : "#eee"}`, padding: "14px clamp(16px,4vw,32px)",
            background: dark ? "#111" : "#fff", display: "flex", alignItems: "center", gap: 12,
            animation: "fadeSlideDown 0.2s ease",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search for products, brands, or categories..."
              autoFocus
              style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: dark ? "#eee" : "#333", background: "transparent" }} />
            <button onClick={() => setSearchOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}>✕</button>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu-panel" style={{
            background: dark ? "#111" : "#fff",
            borderTop: `1px solid ${dark ? "#222" : "#eee"}`,
            boxShadow: dark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 16px 40px rgba(0,0,0,0.12)",
            maxHeight: "80vh", overflowY: "auto",
          }}>
            {NAV_LINKS.map((link) => (
              <div key={link.label}>
                {isInternal(link.href) ? (
                  <Link to={link.href} onClick={() => setMenuOpen(false)} style={{
                    display: "block", padding: "14px clamp(16px,4vw,24px)",
                    fontSize: 15, fontWeight: 600, color: activePage === link.href ? "#e62e04" : textColor,
                    textDecoration: "none", borderBottom: `1px solid ${dark ? "#1e1e1e" : "#f5f5f5"}`,
                    transition: "color 0.2s",
                  }}>{link.label}</Link>
                ) : (
                  <a href={link.href} onClick={() => setMenuOpen(false)} style={{
                    display: "block", padding: "14px clamp(16px,4vw,24px)",
                    fontSize: 15, fontWeight: 600, color: textColor,
                    textDecoration: "none", borderBottom: `1px solid ${dark ? "#1e1e1e" : "#f5f5f5"}`,
                  }}>{link.label}</a>
                )}
                {link.sub && (
                  <div style={{ background: dark ? "#0d0d0d" : "#fafafa" }}>
                    {link.sub.map(s =>
                      isInternal(s.href) ? (
                        <Link key={s.label} to={s.href} onClick={() => setMenuOpen(false)} style={{
                          display: "block", padding: "10px clamp(24px,6vw,40px)",
                          fontSize: 13, color: subText, textDecoration: "none",
                          borderBottom: `1px solid ${dark ? "#1e1e1e" : "#eee"}`,
                        }}>{s.label}</Link>
                      ) : (
                        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} style={{
                          display: "block", padding: "10px clamp(24px,6vw,40px)",
                          fontSize: 13, color: subText, textDecoration: "none",
                          borderBottom: `1px solid ${dark ? "#1e1e1e" : "#eee"}`,
                        }}>{s.label}</a>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
            <div style={{ padding: "16px clamp(16px,4vw,24px)", display: "flex", gap: 12 }}>
              <a href="https://yourbuildmart.com/users/login" target="_blank" rel="noopener noreferrer" style={{
                flex: 1, textAlign: "center", background: "none", border: "1.5px solid #e62e04",
                color: "#e62e04", padding: "10px", borderRadius: 6, fontWeight: 700, fontSize: 14,
                textDecoration: "none",
              }}>Login</a>
              <a href="https://yourbuildmart.com/users/registration" target="_blank" rel="noopener noreferrer" style={{
                flex: 1, textAlign: "center", background: "#e62e04", color: "#fff",
                padding: "10px", borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: "none",
              }}>Register</a>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

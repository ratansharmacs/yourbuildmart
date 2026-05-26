import { useState, useEffect, useRef } from "react";
import { SharedHeader, useTheme, useCart, Footer } from "../components";
import { PRODUCT, RELATED_PRODUCTS, TOP_SELLING, DETAIL_BLOGS } from "../data/productDetailData";
import { Link } from "react-router-dom";

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(230,46,4,0.4)} 50%{box-shadow:0 0 0 8px rgba(230,46,4,0)} }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { transition:background 0.4s ease, color 0.4s ease; }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-thumb { background:#e62e04; border-radius:4px; }
  .tab-content-area ul { padding-left:20px; }
  .tab-content-area li { margin-bottom:6px; line-height:1.7; }
  .tab-content-area p  { margin-bottom:10px; line-height:1.7; }
  .tab-content-area strong, .tab-content-area b { color:inherit; font-weight:700; }
`;

// ─── DATA ──────────────────────────────────────────────────────────────────────





// ─── HEADER ────────────────────────────────────────────────────────────────────


// ─── BREADCRUMB ────────────────────────────────────────────────────────────────
function Breadcrumb() {
    const { dark } = useTheme();
    return (
        <section style={{ background: dark ? "#0d0d0d" : "#f9f9f9", borderBottom: dark ? "1px solid #1a1a1a" : "1px solid #ebebeb", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#e62e04,#ff6b3d,#e62e04)" }} />
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "18px clamp(16px,4vw,48px)", display: "flex", alignItems: "center", gap: 8 }}>
                {[
                    { label: "Home", href: "/" },
                    { label: "Products", href: "/products" },
                    { label: "Aluminium Products", href: PRODUCT.categoryHref },
                    { label: PRODUCT.name, active: true },
                ].map((crumb, i, arr) => (
                    <span key={crumb.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {crumb.active ? (
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#e62e04" }}>{crumb.label}</span>
                        ) : (
                            <a href={crumb.href} style={{ fontSize: 13, color: dark ? "#666" : "#999", textDecoration: "none", transition: "color 0.2s" }}
                                onMouseEnter={e => e.target.style.color = "#e62e04"} onMouseLeave={e => e.target.style.color = dark ? "#666" : "#999"}>
                                {crumb.label}
                            </a>
                        )}
                        {i < arr.length - 1 && (
                            <svg width="5" height="9" viewBox="0 0 5 9" fill="none"><path d="M1 1l3 3.5L1 8" stroke={dark ? "#444" : "#ccc"} strokeWidth="1.5" strokeLinecap="round" /></svg>
                        )}
                    </span>
                ))}
            </div>
        </section>
    );
}

// ─── IMAGE GALLERY ──────────────────────────────────────────────────────────────
function ImageGallery({ images, dark }) {
    const [active, setActive] = useState(0);
    const [zoomed, setZoomed] = useState(false);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Main image */}
            <div
                onClick={() => setZoomed(z => !z)}
                style={{ position: "relative", borderRadius: 16, overflow: "hidden", background: dark ? "#181818" : "#f7f7f7", border: `1px solid ${dark ? "#222" : "#e8e8e8"}`, cursor: "zoom-in", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {/* Badge */}
                <div style={{ position: "absolute", top: 16, left: 16, background: "#e62e04", color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, letterSpacing: "0.8px", zIndex: 2 }}>
                    {PRODUCT.badge}
                </div>
                <img
                    key={active}
                    src={images[active]}
                    alt={PRODUCT.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16, transition: "transform 0.3s", transform: zoomed ? "scale(1.12)" : "scale(1)", animation: "fadeIn 0.3s ease" }}
                    onError={e => e.target.src = "https://yourbuildmart.com/public/assets/img/placeholder.jpg"}
                />
                {/* Zoom hint */}
                <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 20, backdropFilter: "blur(4px)" }}>
                    {zoomed ? "Click to zoom out" : "Click to zoom in"}
                </div>
                {/* Nav arrows */}
                {images.length > 1 && (
                    <>
                        <button onClick={e => { e.stopPropagation(); setActive(a => (a - 1 + images.length) % images.length); }}
                            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.45)", border: "none", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#e62e04"} onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}>‹</button>
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                setActive(a => (a + 1) % images.length);
                            }}
                            style={{
                                position: "absolute",
                                right: 12,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "rgba(0,0,0,0.45)",
                                border: "none",
                                color: "#fff",
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                cursor: "pointer",
                                fontSize: 16,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.2s"
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = "#e62e04")}
                            onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.45)")}
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            <div style={{ display: "flex", gap: 10 }}>
                {images.map((img, i) => (
                    <button key={i} onClick={() => setActive(i)}
                        style={{ flex: 1, aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: `2px solid ${active === i ? "#e62e04" : (dark ? "#222" : "#e0e0e0")}`, background: dark ? "#181818" : "#f5f5f5", cursor: "pointer", padding: 6, transition: "border-color 0.2s, transform 0.2s", transform: active === i ? "scale(1.06)" : "scale(1)" }}>
                        <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            onError={e => e.target.src = "https://yourbuildmart.com/public/assets/img/placeholder.jpg"} />
                    </button>
                ))}
            </div>

            {/* Dot indicators */}
            <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                {images.map((_, i) => (
                    <button key={i} onClick={() => setActive(i)}
                        style={{ width: active === i ? 20 : 8, height: 8, borderRadius: 4, border: "none", background: active === i ? "#e62e04" : (dark ? "#333" : "#ddd"), cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
                ))}
            </div>
        </div>
    );
}

// ─── PRODUCT INFO PANEL ────────────────────────────────────────────────────────
function ProductInfo({ dark }) {
    const [qty, setQty] = useState(10);
    const [enquirySent, setEnquirySent] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    const { addItem } = useCart();

    const handleAddToCart = () => {
        addItem({
            id: 1,
            name: "Aluminium C-Channel",
            category: "Aluminium Products",
            img: "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png",
        });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
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

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Title block */}
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <a href={PRODUCT.categoryHref} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 12, fontWeight: 700, color: "#e62e04", textDecoration: "none", background: "rgba(230,46,4,0.1)", padding: "4px 12px", borderRadius: 20, letterSpacing: "0.5px" }}>
                        {PRODUCT.category}
                    </a>
                    <span style={{ fontSize: 12, color: textMuted }}>SKU: YBM-AL-CC-001</span>
                </div>
                <h1 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, color: textMain, letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 12 }}>
                    {PRODUCT.name}
                </h1>
                <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6, background: dark ? "#1a1a1a" : "#f8f8f8", padding: "10px 14px", borderRadius: 8, borderLeft: "3px solid #e62e04" }}>
                    {PRODUCT.tagline}
                </p>
            </div>

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
            <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, overflow: "hidden" }}>
                <div style={{ background: "#e62e04", padding: "12px 20px" }}>
                    <h3 style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>Quick Specifications</h3>
                </div>
                <div style={{ padding: "4px 0" }}>
                    {PRODUCT.specs.map((s, i) => (
                        <div key={s.label} style={{ display: "flex", alignItems: "flex-start", padding: "10px 20px", background: i % 2 === 0 ? "transparent" : (dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"), borderBottom: i < PRODUCT.specs.length - 1 ? `1px solid ${dark ? "#1a1a1a" : "#f0f0f0"}` : "none" }}>
                            <span style={{ fontSize: 13, color: textMuted, width: 130, flexShrink: 0, fontWeight: 500 }}>{s.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: textMain }}>{s.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quantity + CTA */}
            <div style={{ background: cardBg, borderRadius: 14, border: `1px solid ${cardBorder}`, padding: "20px" }}>
                <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: textMuted, display: "block", marginBottom: 8 }}>Quantity (Min. 10)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 0, width: "fit-content", border: `1px solid ${dark ? "#333" : "#ddd"}`, borderRadius: 10, overflow: "hidden" }}>
                        <button onClick={() => setQty(q => Math.max(10, q - 1))}
                            style={{ width: 44, height: 44, border: "none", background: "transparent", color: dark ? "#fff" : "#333", fontSize: 18, cursor: "pointer", transition: "background 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#e62e04"} onMouseLeave={e => e.currentTarget.style.background = dark ? "#1a1a1a" : "#f5f5f5"}>−</button>
                        <input type="number" value={qty} min={10}
                            onChange={e => setQty(Math.max(10, Number(e.target.value)))}
                            style={{ width: 72, height: 44, border: "none", textAlign: "center", fontSize: 16, fontWeight: 700, background: "transparent", color: textMain, outline: "none" }} />
                        <button onClick={() => setQty(q => q + 1)}
                            style={{ width: 44, height: 44, border: "none", background: "transparent", color: dark ? "#fff" : "#333", fontSize: 18, cursor: "pointer", transition: "background 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#e62e04"} onMouseLeave={e => e.currentTarget.style.background = dark ? "#1a1a1a" : "#f5f5f5"}>+</button>
                    </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link to="/contact"
                        style={{ flex: 1, minWidth: 140, background: "#e62e04", color: "#fff", padding: "14px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none", textAlign: "center", letterSpacing: "0.3px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#c92600"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(230,46,4,0.35)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                        ✉ Enquire Now
                    </Link>
                    <button onClick={handleAddToCart}
                        style={{ flex: 1, minWidth: 140, background: "transparent", color: "#e62e04", padding: "14px 24px", borderRadius: 10, fontSize: 15, fontWeight: 700, border: "2px solid #e62e04", cursor: "pointer", letterSpacing: "0.3px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(230,46,4,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}>
                        {addedToCart ? "✓ Added to Cart!" : "🛒 Add to Cart"}
                    </button>
                </div>

                {/* Delivery info */}
                <div style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {[{ icon: "📦", text: "Lead Time: 21 Days" }, { icon: "🚚", text: "Global Shipping" }, { icon: "🔒", text: "Secure Order" }].map(item => (
                        <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: textMuted }}>
                            <span>{item.icon}</span><span>{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Share / contact row */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: textMuted }}>Share:</span>
                {[
                    { label: "WhatsApp", color: "#25D366", href: "https://wa.me/?text=Check+out+Aluminium+C-Channel+on+YourBuildMart" },
                    { label: "Email", color: "#e62e04", href: "mailto:info@yourbuildmart.com" },
                    { label: "Copy Link", color: dark ? "#444" : "#ddd", onClick: () => navigator.clipboard?.writeText(window.location.href) },
                ].map(s => (
                    s.href ? (
                        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 12, fontWeight: 600, color: s.color === "#25D366" ? s.color : "#e62e04", textDecoration: "none", padding: "6px 14px", borderRadius: 20, border: `1px solid ${s.color}`, transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.color = "#fff"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = s.color === "#25D366" ? s.color : "#e62e04"; }}>
                            {s.label}
                        </a>
                    ) : (
                        <button key={s.label} onClick={s.onClick}
                            style={{ fontSize: 12, fontWeight: 600, color: textMuted, background: "transparent", border: `1px solid ${dark ? "#333" : "#ddd"}`, padding: "6px 14px", borderRadius: 20, cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#e62e04"; e.currentTarget.style.color = "#e62e04"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "#333" : "#ddd"; e.currentTarget.style.color = textMuted; }}>
                            {s.label}
                        </button>
                    )
                ))}
            </div>
        </div>
    );
}

// ─── CONTENT TABS ──────────────────────────────────────────────────────────────
function ContentTabs({ dark }) {
    const [activeTab, setActiveTab] = useState("overview");
    const cardBg = dark ? "#111" : "#fff";
    const cardBorder = dark ? "#1e1e1e" : "#e8e8e8";
    const textMain = dark ? "#e8e8e8" : "#333";
    const textMuted = dark ? "#888" : "#666";

    const tab = PRODUCT.tabs.find(t => t.id === activeTab);

    return (
        <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${cardBorder}`, overflow: "hidden", boxShadow: dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)" }}>
            {/* Tab bar */}
            <div style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${dark ? "#1e1e1e" : "#eee"}`, background: dark ? "#0d0d0d" : "#fafafa" }}>
                {PRODUCT.tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)}
                        style={{ padding: "15px 22px", border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", color: activeTab === t.id ? "#e62e04" : textMuted, borderBottom: `3px solid ${activeTab === t.id ? "#e62e04" : "transparent"}`, transition: "all 0.2s", letterSpacing: "0.2px" }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
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
    const textMuted = dark ? "#888" : "#666";

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
                    <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", textDecoration: "none", borderBottom: `1px solid ${dark ? "#1a1a1a" : "#f0f0f0"}`, transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = dark ? "#1a1a1a" : "#fef0ed"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden", background: dark ? "#181818" : "#f5f5f5", flexShrink: 0, border: `1px solid ${dark ? "#222" : "#eee"}` }}>
                            <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }}
                                onError={e => e.target.style.display = "none"} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: textMain, lineHeight: 1.4 }}>{p.name}</span>
                    </a>
                ))}
            </SideSection>

            {/* Blog Posts */}
            <SideSection title="Latest Blogs">
                {DETAIL_BLOGS.map(b => (
                    <a key={b.title} href={b.href} target="_blank" rel="noopener noreferrer"
                        style={{ display: "block", padding: "12px 16px", textDecoration: "none", borderBottom: `1px solid ${dark ? "#1a1a1a" : "#f0f0f0"}`, transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = dark ? "#1a1a1a" : "#fef0ed"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ width: "100%", height: 100, borderRadius: 8, overflow: "hidden", marginBottom: 10, background: dark ? "#181818" : "#f5f5f5" }}>
                            <img src={b.img} alt={b.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={e => e.target.style.display = "none"} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#e62e04", letterSpacing: "0.8px", textTransform: "uppercase" }}>{b.category}</span>
                        <p style={{ fontSize: 12, color: textMain, marginTop: 4, lineHeight: 1.5, fontWeight: 500 }}>{b.title}</p>
                    </a>
                ))}
            </SideSection>

            {/* Quick Enquiry CTA */}
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

// ─── TOP SELLING PRODUCTS ──────────────────────────────────────────────────────
function TopSelling({ dark }) {
    const cardBg = dark ? "#111" : "#fff";
    const cardBorder = dark ? "#1e1e1e" : "#e8e8e8";
    const textMain = dark ? "#e8e8e8" : "#222";
    const textMuted = dark ? "#888" : "#666";

    return (
        <div style={{ marginTop: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: textMain, letterSpacing: "-0.5px" }}>Top Selling Products</h2>
                <div style={{ flex: 1, height: 1, background: dark ? "#1e1e1e" : "#eee" }} />
                <Link to="/products"
                    style={{ fontSize: 13, fontWeight: 700, color: "#e62e04", textDecoration: "none" }}>View All →</Link>
            </div>
            <div className="top-selling-grid" style={{ gap: 16 }}>
                {TOP_SELLING.map((p, i) => {
                    const [hovered, setHovered] = useState(false);
                    return (
                        <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer"
                            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                            style={{ textDecoration: "none", display: "block", background: cardBg, borderRadius: 14, border: `1px solid ${hovered ? "#e62e04" : cardBorder}`, overflow: "hidden", transition: "all 0.25s", transform: hovered ? "translateY(-4px)" : "translateY(0)", boxShadow: hovered ? (dark ? "0 12px 32px rgba(230,46,4,0.2)" : "0 12px 32px rgba(230,46,4,0.12)") : "none", animation: `fadeUp 0.4s ease ${i * 60}ms both` }}>
                            <div style={{ aspectRatio: "1", background: dark ? "#181818" : "#f7f7f7", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflow: "hidden" }}>
                                <img src={p.img} alt={p.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transition: "transform 0.3s", transform: hovered ? "scale(1.08)" : "scale(1)" }}
                                    onError={e => e.target.src = "https://yourbuildmart.com/public/assets/img/placeholder.jpg"} />
                            </div>
                            <div style={{ padding: "12px 14px", borderTop: `1px solid ${hovered ? "#e62e04" : (dark ? "#1e1e1e" : "#eee")}`, transition: "border-color 0.25s" }}>
                                <p style={{ fontSize: 13, fontWeight: 700, color: hovered ? "#e62e04" : textMain, lineHeight: 1.4, transition: "color 0.2s" }}>{p.name}</p>
                                <p style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>View Product →</p>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}


// ─── PAGE LAYOUT ───────────────────────────────────────────────────────────────
function ProductDetailContent() {
    const { dark } = useTheme();
    const pageBg = dark ? "#0d0d0d" : "#f4f5f7";
    const textMain = dark ? "#e8e8e8" : "#222";

    return (
        <div style={{ background: pageBg, minHeight: "100vh" }}>
            <Breadcrumb />

            {/* Page title bar */}
            <div style={{ background: "transparent", borderBottom: dark ? "1px solid #1a1a1a" : "1px solid #eee" }}>
                <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px clamp(16px,4vw,48px)" }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: textMain, letterSpacing: "-0.5px" }}>{PRODUCT.name}</h2>
                </div>
            </div>

            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "36px clamp(16px,4vw,48px) 72px" }}>

                {/* ── HERO ROW: Gallery + Info ── */}
                <div className="detail-hero-grid" style={{ marginBottom: 36, animation: "fadeUp 0.5s ease" }}>
                    <ImageGallery images={PRODUCT.images} dark={dark} />
                    <ProductInfo dark={dark} />
                </div>

                {/* ── TABS + SIDEBAR ROW ── */}
                <div className="detail-tabs-row" style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <ContentTabs dark={dark} />
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
    const [dark, setDark] = useState(false);
    const toggle = () => setDark(d => !d);

    useEffect(() => {
        document.body.style.background = dark ? "#0d0d0d" : "#fff";
        document.body.style.transition = "background 0.4s ease";
    }, [dark]);

    return (
        <ThemeContext.Provider value={{ dark, toggle }}>
                  <div style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif", transition: "background 0.4s ease" }}>
                <SharedHeader activePage="/productDetail" />
                <ProductDetailContent />
                <Footer />
            </div>
        </ThemeContext.Provider>
    );
}

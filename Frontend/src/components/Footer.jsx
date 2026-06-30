import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { useSiteImage } from "./SiteImagesContext";
import { categoriesApi } from "../services/api";

// Fallback links used only if the categories API call fails (e.g. offline) —
// kept as a safety net so the footer never renders empty.
const FALLBACK_PRODUCT_LINKS = [
  { label: "Aluminium Products", to: "/products?category=Aluminium+Products" },
  { label: "Electrical Products", to: "/products?category=Electrical+Products" },
  { label: "False Ceiling", to: "/products?category=False+Ceiling" },
  { label: "Industrial Valves", to: "/products?category=Industrial+Valves" },
  { label: "PEB Structure", to: "/products?category=PEB+Structure" },
  { label: "TMT Steel Products", to: "/products?category=TMT+Steel+Products" },
];
const COMPANY_LINKS = [
  { label: "About Us", to: "/about" },
  { label: "Quality Assurance", to: "/quality-assurance" },
  { label: "View By Brands", to: "/brands" },
  { label: "Blog", to: "/blog" },
  { label: "Contact Us", to: "/contact" },
];
const SOCIALS = [
  { letter: "f", href: "https://www.facebook.com/people/Yourbuildmart/100083448582131/", label: "Facebook" },
  { letter: "in", href: "https://www.instagram.com/yourbuildmart/", label: "Instagram" },
  { letter: "x", href: "https://yourbuildmart.com", label: "Twitter" },
  { letter: "yt", href: "https://yourbuildmart.com", label: "YouTube" },
];

export default function Footer() {
  const { dark } = useTheme();
  const logoUrl = useSiteImage("footer", "logo", "https://yourbuildmart.com/public/uploads/all/DYfx9g2ssosQQWwE1ubmTZYOWxNQXynFAw6slr3a.png");
  const linkColor = dark ? "#666" : "#666";
  const headingColor = "#fff";
  const borderColor = dark ? "#1c1c1e" : "#1c1c1e";

  // Pull real categories from the DB so footer links always match what
  // Product.jsx expects (exact name match) — avoids stale/hardcoded names
  // silently failing to filter when a category is renamed in the admin panel.
  const [productLinks, setProductLinks] = useState(FALLBACK_PRODUCT_LINKS);
  useEffect(() => {
    categoriesApi.getAll()
      .then(data => {
        const cats = Array.isArray(data) ? data : [];
        if (cats.length > 0) {
          setProductLinks(
            cats.slice(0, 6).map(c => ({
              label: c.name,
              to: `/products?category=${encodeURIComponent(c.name)}`,
            }))
          );
        }
      })
      .catch(() => {}); // keep fallback links on failure
  }, []);

  return (
    <footer style={{ background: "#0d0d0f", color: "#ccc", transition: "background 0.4s" }}>
      {/* Red top accent */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #e62e04, #ff5a2c, #e62e04)" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(48px,6vw,80px) clamp(16px,4vw,48px) clamp(28px,3vw,44px)" }}>

        {/* Main grid */}
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.5fr", gap: "clamp(24px,4vw,60px)", marginBottom: 48 }}>

          {/* Brand column */}
          <div className="footer-brand">
            <div style={{ marginBottom: 16 }}>
              <img src={logoUrl}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "https://yourbuildmart.com/public/uploads/all/DYfx9g2ssosQQWwE1ubmTZYOWxNQXynFAw6slr3a.png"; }}
                alt="YourBuildMart" style={{ height: 30, objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.9 }} />
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#555", marginBottom: 24, maxWidth: 280 }}>
              Your one-stop platform for premium construction and building materials — serving builders across Africa, Europe, and beyond with ISO-certified quality.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {SOCIALS.map(item => (
                <a key={item.letter} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}
                  style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontSize: 10, fontWeight: 700, textDecoration: "none", transition: "border-color 0.2s, color 0.2s, background 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#e62e04"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#555"; e.currentTarget.style.borderColor = "#2a2a2a"; }}>{item.letter}</a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <p style={{ color: headingColor, fontSize: 11, fontWeight: 700, marginBottom: 20, textTransform: "uppercase", letterSpacing: "2px" }}>Products</p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {productLinks.map(item => (
                <li key={item.label}>
                  <Link to={item.to} style={{ color: linkColor, textDecoration: "none", fontSize: 13, transition: "color 0.18s" }}
                    onMouseEnter={e => e.target.style.color = "#e62e04"} onMouseLeave={e => e.target.style.color = linkColor}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p style={{ color: headingColor, fontSize: 11, fontWeight: 700, marginBottom: 20, textTransform: "uppercase", letterSpacing: "2px" }}>Company</p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {COMPANY_LINKS.map(item => (
                <li key={item.label}>
                  <Link to={item.to} style={{ color: linkColor, textDecoration: "none", fontSize: 13, transition: "color 0.18s" }}
                    onMouseEnter={e => e.target.style.color = "#e62e04"} onMouseLeave={e => e.target.style.color = linkColor}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div className="footer-contact">
            <p style={{ color: headingColor, fontSize: 11, fontWeight: 700, marginBottom: 20, textTransform: "uppercase", letterSpacing: "2px" }}>Get In Touch</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {[{ icon: "📍", text: "New Delhi, India" }, { icon: "📧", text: "info@yourbuildmart.com" }, { icon: "🌐", text: "yourbuildmart.com" }].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 13, flexShrink: 0 }}>{c.icon}</span>
                  <span style={{ color: "#555", fontSize: 13 }}>{c.text}</span>
                </div>
              ))}
            </div>
            <p style={{ color: "#888", fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: "1.5px" }}>Newsletter</p>
            <div style={{ display: "flex", borderRadius: 7, overflow: "hidden", border: "1px solid #222" }}>
              <input type="email" placeholder="Your email address" style={{ flex: 1, padding: "9px 12px", border: "none", fontSize: 12, background: "#161618", color: "#ccc", outline: "none", minWidth: 0 }} />
              <button style={{ background: "#e62e04", color: "#fff", border: "none", padding: "9px 16px", fontWeight: 700, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.18s" }} onMouseEnter={e => e.target.style.background = "#c42500"} onMouseLeave={e => e.target.style.background = "#e62e04"}>Subscribe</button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom" style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "#3a3a3a", margin: 0 }}>© 2026 YourBuildMart. All rights reserved.</p>
          <div className="footer-bottom-links" style={{ display: "flex", gap: 20 }}>
            {[{ label: "Privacy Policy", to: "/privacy-policy" }, { label: "Terms of Service", to: "/terms-and-conditions" }, { label: "Sitemap", to: "/sitemap.xml" }].map(l => (
              <Link key={l.label} to={l.to} style={{ color: "#3a3a3a", fontSize: 12, textDecoration: "none", transition: "color 0.18s" }} onMouseEnter={e => e.target.style.color = "#e62e04"} onMouseLeave={e => e.target.style.color = "#3a3a3a"}>{l.label}</Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-brand { grid-column: 1 / -1 !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
          .footer-brand { grid-column: 1 / -1 !important; }
          .footer-contact { grid-column: 1 / -1 !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .footer-bottom-links { flex-wrap: wrap !important; gap: 12px !important; }
        }
      `}</style>
    </footer>
  );
}

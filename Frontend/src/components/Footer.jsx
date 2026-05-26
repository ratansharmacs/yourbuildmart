import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export default function Footer() {
  const { dark } = useTheme();
  const bg = dark ? "#060606" : "#111";
  return (
    <footer style={{ background: bg, color: "#ccc", transition: "background 0.4s" }}>
      <style>{`
        @media (max-width: 640px) {
          .footer-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
          }
          .footer-brand  { grid-column: 1 / -1 !important; }
          .footer-contact { grid-column: 1 / -1 !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .footer-bottom-links { flex-wrap: wrap !important; gap: 12px !important; }
        }
        @media (max-width: 380px) {
          /* still keep 2-col for Products & Company even on tiny phones */
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(40px,5vw,72px) clamp(16px,4vw,48px) clamp(24px,3vw,40px)" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "clamp(20px,3vw,48px)", marginBottom: 40 }}>
          <div className="footer-brand">
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 900, marginBottom: 12, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#e62e04" }}>Your</span>BuildMart
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: "#888", marginBottom: 18, maxWidth: 260 }}>Your one-stop online shop for construction and building materials. Serving Africa, Europe, and beyond with ISO-certified quality.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[{ s: "f", href: "https://www.facebook.com/people/Yourbuildmart/100083448582131/" }, { s: "in", href: "https://www.instagram.com/yourbuildmart/" }, { s: "tw", href: "https://yourbuildmart.com" }, { s: "yt", href: "https://yourbuildmart.com" }].map(item => (
                <a key={item.s} href={item.href} target="_blank" rel="noopener noreferrer"
                  style={{ width: 34, height: 34, borderRadius: 6, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 11, fontWeight: 700, textDecoration: "none", transition: "background 0.2s, color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#222"; e.currentTarget.style.color = "#999"; }}>{item.s}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>Products</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { label: "Aluminium Products", to: "/products?category=Aluminium+Products" },
                { label: "Electrical Products", to: "/products?category=Electrical+Products" },
                { label: "False Ceiling", to: "/products?category=False+Ceiling" },
                { label: "Industrial Valves", to: "/products?category=Industrial+Valves" },
                { label: "PEB Structure", to: "/products?category=PEB+Structure" },
                { label: "TMT Steel", to: "/products?category=TMT+Steel" },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} style={{ color: "#888", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#e62e04"} onMouseLeave={e => e.target.style.color = "#888"}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>Company</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { label: "About Us", to: "/about" },
                { label: "Quality Assurance", to: "/about" },
                { label: "View By Brands", to: "/brands" },
                { label: "Blog", to: "/blog" },
                { label: "Contact Us", to: "/contact" },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} style={{ color: "#888", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#e62e04"} onMouseLeave={e => e.target.style.color = "#888"}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-contact">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[{ icon: "📍", text: "New Delhi, India" }, { icon: "📧", text: "info@yourbuildmart.com" }, { icon: "🌐", text: "yourbuildmart.com" }].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 14 }}>{c.icon}</span>
                  <span style={{ color: "#888", fontSize: 13 }}>{c.text}</span>
                </div>
              ))}
              <div style={{ marginTop: 6 }}>
                <p style={{ color: "#fff", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Newsletter</p>
                <div style={{ display: "flex", borderRadius: 6, overflow: "hidden" }}>
                  <input type="email" placeholder="Your email" style={{ flex: 1, padding: "9px 12px", border: "none", fontSize: 12, background: "#222", color: "#fff", outline: "none", minWidth: 0 }} />
                  <button style={{ background: "#e62e04", color: "#fff", border: "none", padding: "9px 14px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Go</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={{ borderTop: "1px solid #222", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 12, color: "#666", margin: 0 }}>© 2025 YourBuildMart. All rights reserved.</p>
          <div className="footer-bottom-links" style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {[{ label: "Privacy Policy", href: "https://yourbuildmart.com/privacy-policy" }, { label: "Terms of Service", href: "https://yourbuildmart.com/terms-and-conditions" }, { label: "Sitemap", href: "https://yourbuildmart.com/sitemap.xml" }].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ color: "#666", fontSize: 12, textDecoration: "none" }}>{l.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

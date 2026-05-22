import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";

// ─── FOOTER ───────────────────────────────────────────────────────────────────
export default function Footer() {
  const { dark } = useTheme();
  const bg = dark ? "#060606" : "#111";
  return (
    <footer style={{ background: bg, color: "#ccc", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px clamp(16px,4vw,48px) 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "clamp(24px,4vw,48px)", marginBottom: 56 }}>
          <div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 16, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#e62e04" }}>Your</span>BuildMart
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#888", marginBottom: 24, maxWidth: 280 }}>Your one-stop online shop for construction and building materials. Serving Africa, Europe, and beyond with ISO-certified quality.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[{ s: "f", href: "https://www.facebook.com/people/Yourbuildmart/100083448582131/" }, { s: "in", href: "https://www.instagram.com/yourbuildmart/" }, { s: "tw", href: "https://yourbuildmart.com" }, { s: "yt", href: "https://yourbuildmart.com" }].map(item => (
                <a key={item.s} href={item.href} target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, borderRadius: 6, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 12, fontWeight: 700, textDecoration: "none", transition: "background 0.2s, color 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#222"; e.currentTarget.style.color = "#999"; }}>{item.s}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 20, textTransform: "uppercase", letterSpacing: "1px" }}>Products</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Aluminium Products", to: "/products?category=Aluminium+Products" },
                { label: "Electrical Products", to: "/products?category=Electrical+Products" },
                { label: "False Ceiling", to: "/products?category=False+Ceiling" },
                { label: "Industrial Valves", to: "/products?category=Industrial+Valves" },
                { label: "PEB Structure", to: "/products?category=PEB+Structure" },
                { label: "TMT Steel", to: "/products?category=TMT+Steel" },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} style={{ color: "#888", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#e62e04"} onMouseLeave={e => e.target.style.color = "#888"}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 20, textTransform: "uppercase", letterSpacing: "1px" }}>Company</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "About Us", to: "/about" },
                { label: "Quality Assurance", to: "/about" },
                { label: "View By Brands", to: "/brands" },
                { label: "Blog", to: "/blog" },
                { label: "Contact Us", to: "/contact" },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} style={{ color: "#888", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                    onMouseEnter={e => e.target.style.color = "#e62e04"} onMouseLeave={e => e.target.style.color = "#888"}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 20, textTransform: "uppercase", letterSpacing: "1px" }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[{ icon: "📍", text: "New Delhi, India" }, { icon: "📧", text: "info@yourbuildmart.com" }, { icon: "🌐", text: "yourbuildmart.com" }].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16 }}>{c.icon}</span>
                  <span style={{ color: "#888", fontSize: 14 }}>{c.text}</span>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Newsletter</p>
                <div style={{ display: "flex", borderRadius: 6, overflow: "hidden" }}>
                  <input type="email" placeholder="Your email" style={{ flex: 1, padding: "10px 14px", border: "none", fontSize: 13, background: "#222", color: "#fff", outline: "none" }} />
                  <button style={{ background: "#e62e04", color: "#fff", border: "none", padding: "10px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Go</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid #222", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>© 2025 YourBuildMart. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[{ label: "Privacy Policy", href: "https://yourbuildmart.com/privacy-policy" }, { label: "Terms of Service", href: "https://yourbuildmart.com/terms-and-conditions" }, { label: "Sitemap", href: "https://yourbuildmart.com/sitemap.xml" }].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ color: "#666", fontSize: 13, textDecoration: "none" }}>{l.label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

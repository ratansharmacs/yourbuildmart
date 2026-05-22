import { useState, useEffect, useRef } from "react";
import { SharedHeader, useTheme, ThemeContext, Footer } from "../components";
import { Link } from "react-router-dom";

// ─── DATA ────────────────────────────────────────────────────────────────────


const PRODUCTS = [
  { name: "Aluminium Products", href: "/products?category=Aluminium+Products", img: "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png" },
  { name: "Electrical Products", href: "/products?category=Electrical+Products", img: "https://yourbuildmart.com/public/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg" },
  { name: "False Ceiling", href: "/products?category=False+Ceiling", img: "https://yourbuildmart.com/public/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg" },
  { name: "Fire Fighting", href: "/products?category=Fire+Fighting", img: "https://yourbuildmart.com/public/uploads/all/G98hSbCqpgGs4u7l116dQRNkdnVowdyYliKEVerr.jpg" },
  { name: "Industrial Valves", href: "/products?category=Industrial+Valves", img: "https://yourbuildmart.com/public/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg" },
  { name: "PEB Structure", href: "/products?category=PEB+Structure", img: "https://yourbuildmart.com/public/uploads/all/blJXzfApTXVc3364qVExp6aNwVo9dCs80CaEqfXG.jpg" },
];

const CLIENT_LOGOS = [
  "https://yourbuildmart.com/public/assets/img/BPL.png",
  "https://yourbuildmart.com/public/assets/img/AAI.png",
  "https://yourbuildmart.com/public/assets/img/irites.png",
  "https://yourbuildmart.com/public/assets/img/DP_world.png",
  "https://yourbuildmart.com/public/assets/img/CFCL.png",
  "https://yourbuildmart.com/public/assets/img/IOL.png",
  "https://yourbuildmart.com/public/assets/img/DLF.png",
  "https://yourbuildmart.com/public/assets/img/NHA.png",
];

const CERTS = [
  "Apollo CI Plumbing Pipe Product Certificate",
  "ISO 9001:2015 Quality Management Certificate",
  "ISI Mark Certificate – TMT Steel Bars",
  "Fire Safety Compliance Certificate",
  "PEB Structure Quality Assurance Certificate",
  "Electrical Products ISI Certification",
  "Aluminium Products Standards Certificate",
  "Environmental Compliance Certificate",
];

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────


// ─── HEADER ───────────────────────────────────────────────────────────────────


// ─── PAGE HERO ────────────────────────────────────────────────────────────────
function PageHero({ title, breadcrumb }) {
  const { dark } = useTheme();
  return (
    <section style={{ background: dark ? "#111" : "#f7f7f7", borderBottom: `1px solid ${dark ? "#222" : "#eee"}`, padding: "40px 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: dark ? "#fff" : "#111", marginBottom: 10, letterSpacing: "-0.5px" }}>{title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: dark ? "#888" : "#666" }}>
          <Link to="/" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>Home</Link>
          <span>›</span>
          {breadcrumb.map((b, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {i > 0 && <span>›</span>}
              <span style={{ color: i === breadcrumb.length - 1 ? (dark ? "#ccc" : "#444") : "#e62e04" }}>{b}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHO WE ARE ───────────────────────────────────────────────────────────────
function WhoWeAre() {
  const { dark } = useTheme();
  const bg = dark ? "#0d0d0d" : "#fff";
  const textColor = dark ? "#ccc" : "#444";
  const headingColor = dark ? "#fff" : "#111";
  const visionBg = dark ? "#181818" : "#f7f7f7";

  return (
    <section style={{ background: bg, padding: "clamp(40px,6vw,80px) 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", marginBottom: 64 }}>
          <div>
            <span style={{ display: "inline-block", background: "#fef0ed", color: "#e62e04", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: "5px 12px", borderRadius: 4, marginBottom: 20 }}>Our Story</span>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: headingColor, lineHeight: 1.2, marginBottom: 20, letterSpacing: "-0.5px" }}>Who We Are</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: textColor }}>
              YourBuildMart is a global leader in providing top-quality building materials across Africa, Europe, and beyond. With over five decades of expertise in the construction industry, we are committed to delivering high-performance products that meet the diverse needs of our clients. Our mission is to drive innovation in the construction sector by offering reliable, sustainable, and affordable building materials for projects of all sizes.
            </p>
          </div>
          <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.12)", height: 360 }}>
            <img src="https://yourbuildmart.com/public/assets/img/about-ybm.jpg" alt="About YourBuildMart" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        {/* Vision & Mission */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 80 }}>
          {[
            { label: "Vision", icon: "🔭", text: "To revolutionize the building materials industry by setting new standards for innovation, quality, and sustainability, ensuring our customers have access to the most advanced solutions available." },
            { label: "Mission", icon: "🎯", text: "We aim to be the most trusted partner for construction companies worldwide by providing a comprehensive range of products, timely delivery, and unmatched customer service." },
          ].map(item => (
            <div key={item.label} style={{ background: visionBg, borderRadius: 16, padding: 36, borderLeft: "4px solid #e62e04", transition: "background 0.4s" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: headingColor, marginBottom: 12 }}>{item.label}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: textColor, margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* What We Offer */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", background: "#fef0ed", color: "#e62e04", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: "5px 12px", borderRadius: 4, marginBottom: 16 }}>Our Range</span>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: headingColor, marginBottom: 12, letterSpacing: "-0.5px" }}>What We Offer</h2>
          <p style={{ fontSize: 16, color: textColor, maxWidth: 600, margin: "0 auto" }}>At YourBuildMart, we provide an extensive selection of construction materials for various industries.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {PRODUCTS.map(p => (
            <a key={p.name} href={p.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ borderRadius: 12, overflow: "hidden", background: dark ? "#181818" : "#fff", boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.25s, box-shadow 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = dark ? "0 12px 40px rgba(230,46,4,0.25)" : "0 12px 40px rgba(0,0,0,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.08)"; }}>
                <div style={{ height: 180, overflow: "hidden" }}>
                  <img src={p.img} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                    onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                    onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                </div>
                <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: dark ? "#eee" : "#111" }}>{p.name}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e62e04" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── OUR VALUES ───────────────────────────────────────────────────────────────
function OurValues() {
  const { dark } = useTheme();
  return (
    <section style={{ position: "relative", overflow: "hidden", minHeight: 400 }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <img src="https://yourbuildmart.com/public/assets/img/join-the-team.jpg" alt="Our Values" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: "clamp(40px,6vw,80px) clamp(16px,4vw,48px)", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ maxWidth: 560, background: "rgba(230,46,4,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(230,46,4,0.3)", borderRadius: 20, padding: 48 }}>
          <span style={{ display: "inline-block", background: "#e62e04", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: "5px 12px", borderRadius: 4, marginBottom: 20 }}>Core Values</span>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", marginBottom: 20, letterSpacing: "-0.5px" }}>Our Values</h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.85)", marginBottom: 28 }}>
            Integrity, innovation, and a commitment to sustainability are the core values that guide everything we do. We believe in delivering excellence in every product and service, driven by our passion for innovation and customer success.
          </p>
          <Link to="/contact"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e62e04", color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none", transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#c42500"}
            onMouseLeave={e => e.currentTarget.style.background = "#e62e04"}>
            Connect With Us
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── SUSTAINABILITY + CUSTOMER ─────────────────────────────────────────────────
function SustainabilitySection() {
  const { dark } = useTheme();
  const bg = dark ? "#111" : "#f7f7f7";
  const textColor = dark ? "#ccc" : "#444";
  const headingColor = dark ? "#fff" : "#111";
  const cardBg = dark ? "#0d0d0d" : "#fff";

  const sections = [
    {
      title: "Sustainability and Quality Assurance",
      text: "At YourBuildMart, sustainability is at the core of our operations. We are committed to minimizing our environmental impact by implementing green manufacturing processes and ensuring responsible sourcing of materials. Our quality assurance program ensures that every product we manufacture meets or exceeds industry standards.",
      img: "https://yourbuildmart.com/public/assets/img/sustainable.jpg",
      imgRight: true,
    },
    {
      title: "Customer-Centric Approach",
      text: "We believe in building lasting relationships with our customers by offering end-to-end support. Whether it's helping you choose the right product, offering expert installation advice, or providing after-sales service, we are here to assist at every stage of your project.",
      img: "https://yourbuildmart.com/public/assets/img/costomer.jpg",
      imgRight: false,
    },
  ];

  return (
    <section style={{ background: bg, padding: "clamp(40px,6vw,80px) 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)", display: "flex", flexDirection: "column", gap: 80 }}>
        {sections.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", direction: s.imgRight ? "ltr" : "rtl" }}>
            <div style={{ direction: "ltr" }}>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: headingColor, marginBottom: 20, letterSpacing: "-0.5px" }}>{s.title}</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: textColor }}>{s.text}</p>
            </div>
            <div style={{ borderRadius: 16, overflow: "hidden", height: 320, boxShadow: dark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 16px 48px rgba(0,0,0,0.1)", direction: "ltr" }}>
              <img src={s.img} alt={s.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CERTIFICATIONS ───────────────────────────────────────────────────────────
function Certifications() {
  const { dark } = useTheme();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? CERTS : CERTS.slice(0, 4);
  const bg = dark ? "#0d0d0d" : "#fff";
  const cardBg = dark ? "#181818" : "#f7f7f7";
  const headingColor = dark ? "#fff" : "#111";
  const textColor = dark ? "#aaa" : "#555";

  return (
    <section style={{ background: bg, padding: "clamp(40px,6vw,80px) 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ display: "inline-block", background: "#fef0ed", color: "#e62e04", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: "5px 12px", borderRadius: 4, marginBottom: 16 }}>Standards</span>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: headingColor, marginBottom: 12, letterSpacing: "-0.5px" }}>Certifications</h2>
          <p style={{ fontSize: 16, color: textColor, maxWidth: 640, margin: "0 auto" }}>
            We are proud to be certified by international quality standards, including ISO certifications. Our commitment to compliance ensures customers receive only the best products.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
          {visible.map((cert, i) => (
            <div key={i} style={{ background: cardBg, borderRadius: 12, padding: 28, border: `1px solid ${dark ? "#222" : "#eee"}`, position: "relative", minHeight: 160, display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "transform 0.2s, box-shadow 0.2s, background 0.4s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(230,46,4,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>🏅</div>
              <p style={{ fontSize: 14, color: textColor, lineHeight: 1.6, flex: 1 }}>{cert}</p>
              <button style={{ background: "#111", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 16, alignSelf: "flex-start", transition: "background 0.2s" }}
                onMouseEnter={e => e.target.style.background = "#e62e04"}
                onMouseLeave={e => e.target.style.background = "#111"}>View More</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <button onClick={() => setShowAll(v => !v)}
            style={{ background: showAll ? "#333" : "#e62e04", color: "#fff", border: "none", padding: "12px 32px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={e => e.target.style.background = "#c42500"}
            onMouseLeave={e => e.target.style.background = showAll ? "#333" : "#e62e04"}>
            {showAll ? "Show Less" : "View All Certificates"}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── CLIENT MARQUEE ───────────────────────────────────────────────────────────
function ClientMarquee() {
  const { dark } = useTheme();
  const bg = dark ? "#111" : "#f7f7f7";
  const headingColor = dark ? "#fff" : "#111";
  const doubled = [...CLIENT_LOGOS, ...CLIENT_LOGOS];

  return (
    <section style={{ background: bg, padding: "72px 0", overflow: "hidden", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 48px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: headingColor, letterSpacing: "-0.5px" }}>Our Esteemed Clients</h2>
        </div>
      </div>
      <style>{`@keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
      <div style={{ overflow: "hidden", position: "relative" }}>
        <div style={{ display: "flex", gap: 48, animation: "marqueeScroll 18s linear infinite", width: "max-content", alignItems: "center" }}>
          {doubled.map((logo, i) => (
            <div key={i} style={{ flexShrink: 0, background: dark ? "#1e1e1e" : "#fff", borderRadius: 10, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <img src={logo} alt="client" style={{ height: 44, objectFit: "contain", filter: dark ? "brightness(1.4) grayscale(0.3)" : "grayscale(0.2)", maxWidth: 120 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ─── APP ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const [dark, setDark] = useState(false);
  const toggle = () => setDark(d => !d);

  useEffect(() => {
    document.body.style.background = dark ? "#0d0d0d" : "#fff";
    document.body.style.transition = "background 0.4s ease";
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div style={{ overflowX: "hidden", fontFamily: "Segoe UI", background: dark ? "#0d0d0d" : "#fff", transition: "background 0.4s ease" }}>
        <SharedHeader activePage="/about" />
        <PageHero title="About Us" breadcrumb={["About Us"]} />
        <WhoWeAre />
        <OurValues />
        <SustainabilitySection />
        <Certifications />
        <ClientMarquee />
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}
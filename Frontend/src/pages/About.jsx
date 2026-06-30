import { useState } from "react";
import { Link } from "react-router-dom";
import { SharedHeader, useTheme, Footer, useSiteImage, useSiteImages } from "../components";
import { ABOUT_PRODUCTS, CLIENT_LOGOS, CERTIFICATIONS, SUSTAINABILITY_SECTIONS, VISION_MISSION } from "../data/aboutData";

function PageHero() {
  const { dark } = useTheme();
  return (
    <section className="page-hero" style={{ background: "transparent", borderBottom: `1px solid ${dark ? "#1e1e1e" : "#efefef"}`, padding: "clamp(28px,4vw,48px) 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: dark ? "#555" : "#aaa", marginBottom: 12, fontWeight: 500 }}>
          <Link to="/" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600, fontSize: 12 }}>Home</Link>
          <span style={{ opacity: 0.4 }}>›</span>
          <span>About Us</span>
        </div>
        <h1 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: dark ? "#f0f0f0" : "#111", letterSpacing: "-0.5px", lineHeight: 1.15 }}>About Us</h1>
      </div>
    </section>
  );
}

function WhoWeAre() {
  const { dark } = useTheme();
  const { images } = useSiteImages();
  const heroImg = useSiteImage("about", "hero_image", "https://yourbuildmart.com/public/assets/img/about-ybm.jpg");
  const resolveTile = (p) => images?.about?.[p.slotKey] || p.img;
  const textColor = dark ? "#ccc" : "#444";
  const headingColor = dark ? "#fff" : "#111";
  const visionBg = dark ? "#181818" : "#f7f7f7";
  return (
    <section style={{ background: "transparent", padding: "clamp(40px,6vw,80px) 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        {/* Who we are split */}
        <div className="about-who-grid">
          <div>
            <span className="eyebrow">Our Story</span>
            <h2 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 800, color: headingColor, lineHeight: 1.2, marginBottom: 20, letterSpacing: "-0.5px" }}>Who We Are</h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: textColor }}>YourBuildMart is a global leader in providing top-quality building materials across Africa, Europe, and beyond. With over five decades of expertise in the construction industry, we are committed to delivering high-performance products that meet the diverse needs of our clients.</p>
          </div>
          <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: dark ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.12)", height: "clamp(240px,40vw,360px)" }}>
            <img src={heroImg} alt="About YourBuildMart" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="about-vision-grid">
          {VISION_MISSION.map(item => (
            <div key={item.label} className="about-vision-card ray-card" style={{ background: visionBg, boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.06)", transition: "background 0.4s" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: headingColor, marginBottom: 12 }}>{item.label}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: textColor, margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* What We Offer */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="eyebrow" style={{ justifyContent: "center" }}>Our Range</span>
          <h2 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 800, color: headingColor, marginBottom: 12, letterSpacing: "-0.5px" }}>What We Offer</h2>
        </div>
        <div className="about-offer-grid">
          {ABOUT_PRODUCTS.map(p => (
            <Link key={p.name} to={p.href} style={{ textDecoration: "none" }}>
              <div className="ray-card" style={{ borderRadius: 12, overflow: "hidden", background: dark ? "#181818" : "#fff", boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.08)", transition: "transform 0.25s, box-shadow 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.08)"; }}>
                <div style={{ height: 180, overflow: "hidden" }}>
                  <img src={resolveTile(p)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                    onMouseEnter={e => e.target.style.transform = "scale(1.06)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                </div>
                <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: dark ? "#eee" : "#111" }}>{p.name}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e62e04" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurValues() {
  const { dark } = useTheme();
  const valuesImg = useSiteImage("about", "values_image", "https://yourbuildmart.com/public/assets/img/join-the-team.jpg");
  return (
    <section style={{ position: "relative", overflow: "hidden", minHeight: 400 }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <img src={valuesImg} alt="Our Values" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: "clamp(40px,6vw,80px) clamp(16px,4vw,48px)", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ maxWidth: "min(560px, 100%)", background: "rgba(230,46,4,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(230,46,4,0.3)", borderRadius: 20, padding: "clamp(24px,4vw,48px)" }}>
          <h2 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 800, color: "#fff", marginBottom: 20, letterSpacing: "-0.5px" }}>Our Values</h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.85)", marginBottom: 28 }}>Integrity, innovation, and a commitment to sustainability are the core values that guide everything we do.</p>
          <Link to="/contact" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e62e04", color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.background = "#c42500"} onMouseLeave={e => e.currentTarget.style.background = "#e62e04"}>
            Connect With Us <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

function SustainabilitySection() {
  const { dark } = useTheme();
  const { images } = useSiteImages();
  const textColor = dark ? "#ccc" : "#444";
  const headingColor = dark ? "#fff" : "#111";
  return (
    <section style={{ background: "transparent", padding: "clamp(40px,6vw,80px) 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)", display: "flex", flexDirection: "column", gap: "clamp(40px,6vw,80px)" }}>
        {SUSTAINABILITY_SECTIONS.map((s, i) => (
          <div key={i} className="about-sustain-grid" style={{ direction: s.imgRight ? "ltr" : "rtl" }}>
            <div style={{ direction: "ltr" }}>
              <h2 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 800, color: headingColor, marginBottom: 20 }}>{s.title}</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: textColor }}>{s.text}</p>
            </div>
            <div style={{ borderRadius: 16, overflow: "hidden", height: "clamp(200px,35vw,320px)", boxShadow: dark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 16px 48px rgba(0,0,0,0.1)", direction: "ltr" }}>
              <img src={images?.about?.[s.slotKey] || s.img} alt={s.title} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = s.img; }} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Certifications() {
  const { dark } = useTheme();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? CERTIFICATIONS : CERTIFICATIONS.slice(0, 4);
  const cardBg = dark ? "#181818" : "#f7f7f7";
  const headingColor = dark ? "#fff" : "#111";
  const textColor = dark ? "#aaa" : "#555";
  return (
    <section style={{ background: "transparent", padding: "clamp(40px,6vw,80px) 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 800, color: headingColor, marginBottom: 12 }}>Certifications</h2>
        </div>
        <div className="about-cert-grid">
          {visible.map((cert, i) => (
            <div key={i} className="ray-card" style={{ background: cardBg, borderRadius: 12, padding: "clamp(16px,3vw,28px)", border: `1px solid ${dark ? "#222" : "#eee"}`, minHeight: 140, display: "flex", flexDirection: "column", justifyContent: "space-between", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(230,46,4,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>🏅</div>
              <p style={{ fontSize: 14, color: textColor, lineHeight: 1.6, flex: 1 }}>{cert}</p>
              <button style={{ background: "#111", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 16, alignSelf: "flex-start" }}>View More</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button onClick={() => setShowAll(v => !v)} style={{ background: showAll ? "#333" : "#e62e04", color: "#fff", border: "none", padding: "12px 32px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            {showAll ? "Show Less" : "View All Certificates"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ClientMarquee() {
  const { dark } = useTheme();
  const { images } = useSiteImages();
  const doubled = [...CLIENT_LOGOS, ...CLIENT_LOGOS];
  return (
    <section style={{ background: "transparent", padding: "72px 0", overflow: "hidden", transition: "background 0.4s" }}>
      <div style={{ textAlign: "center", marginBottom: 48, padding: "0 clamp(16px,4vw,48px)" }}>
        <h2 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, color: dark ? "#fff" : "#111" }}>Our Esteemed Clients</h2>
      </div>
      <div style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 48, animation: "marqueeScroll 18s linear infinite", width: "max-content", alignItems: "center" }}>
          {doubled.map((logo, i) => (
            <div key={i} style={{ flexShrink: 0, background: dark ? "#1e1e1e" : "#fff", borderRadius: 10, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <img src={images?.about?.[logo.slotKey] || logo.img} alt="client" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = logo.img; }} style={{ height: 44, objectFit: "contain", filter: dark ? "brightness(1.4) grayscale(0.3)" : "grayscale(0.2)", maxWidth: 120 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const { dark } = useTheme(); // reads from global ThemeProvider
  return (
    <div style={{ fontFamily: "'Segoe UI','Helvetica Neue',sans-serif", background: "transparent", transition: "background 0.4s ease", overflowX: "hidden" }}>
      <SharedHeader activePage="/about" />
      <PageHero />
      <WhoWeAre />
      <OurValues />
      <SustainabilitySection />
      <Certifications />
      <ClientMarquee />
      <Footer />
    </div>
  );
}

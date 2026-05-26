import { useState } from "react";
import { Link } from "react-router-dom";
import { SharedHeader, useTheme, Footer } from "../components";
import { BLOG_POSTS, BLOG_CATEGORIES, RELATED_BLOGS } from "../data/blogData";

function PageHero() {
  const { dark } = useTheme();
  return (
    <section className="page-hero" style={{ background: "transparent", borderBottom: `1px solid ${dark ? "#222" : "#eee"}`, padding: "40px 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <h1 style={{ fontSize: "clamp(26px,5vw,36px)", fontWeight: 800, color: dark ? "#fff" : "#111", marginBottom: 10 }}>Blog</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: dark ? "#888" : "#666" }}>
          <Link to="/" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>Home</Link>
          <span>›</span><span style={{ color: dark ? "#ccc" : "#444" }}>Blog</span>
        </div>
      </div>
    </section>
  );
}

function BlogGrid() {
  const { dark } = useTheme();
  const [activeCat, setActiveCat] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const cardBg      = dark ? "#181818" : "#fff";
  const cardShadow  = dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.07)";
  const headingColor= dark ? "#fff" : "#111";
  const textColor   = dark ? "#aaa" : "#555";
  const sidebarBg   = dark ? "#111" : "#f7f7f7";
  const tagBg       = dark ? "#1e1e1e" : "#fef0ed";
  const filtered    = activeCat === "All" ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === activeCat);

  return (
    <section style={{ background: "transparent", padding: "64px 0", minHeight: "60vh", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }} className="blog-layout">
        {/* Main */}
        <div>
          <div className="blog-cats">
            {BLOG_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)}
                style={{ padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: activeCat === cat ? "#e62e04" : (dark ? "#222" : "#f0f0f0"), color: activeCat === cat ? "#fff" : (dark ? "#ccc" : "#444") }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {filtered.length === 0 && <p style={{ color: textColor }}>No posts in this category yet.</p>}
            {filtered.map(post => (
              <a key={post.title} href={post.href} style={{ textDecoration: "none" }}>
                <div className="blog-card ray-card" style={{ background: cardBg, boxShadow: cardShadow, transition: "transform 0.25s, box-shadow 0.25s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = dark ? "0 12px 40px rgba(230,46,4,0.2)" : "0 12px 40px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = cardShadow; }}>
                  <div className="blog-card-img">
                    <img src={post.img} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.06)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                  </div>
                  <div className="blog-card-body">
                    <div>
                      <span style={{ display: "inline-block", background: tagBg, color: "#e62e04", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "4px 10px", borderRadius: 4, marginBottom: 14 }}>{post.category}</span>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: headingColor, lineHeight: 1.5, marginBottom: 14 }}>{post.title}</h2>
                      <p style={{ fontSize: 14, color: textColor, lineHeight: 1.7, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                    </div>
                    <span style={{ color: "#e62e04", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginTop: 20 }}>
                      View More <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="blog-sidebar">
          <div style={{ background: sidebarBg, borderRadius: 16, padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: headingColor, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${dark ? "#222" : "#e0e0e0"}` }}>Related Blogs</h3>
            {RELATED_BLOGS.map((b, i) => (
              <a key={i} href={b.href} style={{ textDecoration: "none", display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: 14, borderBottom: i < RELATED_BLOGS.length - 1 ? `1px solid ${dark ? "#222" : "#eee"}` : "none", marginBottom: 14 }}>
                <span style={{ color: "#e62e04", fontSize: 18, flexShrink: 0 }}>›</span>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: headingColor, lineHeight: 1.5 }}>{b.title}</h4>
              </a>
            ))}
          </div>
          <div style={{ background: sidebarBg, borderRadius: 16, padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: headingColor, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${dark ? "#222" : "#e0e0e0"}` }}>Categories</h3>
            {BLOG_CATEGORIES.filter(c => c !== "All").map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} style={{ width: "100%", background: activeCat === cat ? "#e62e04" : "transparent", color: activeCat === cat ? "#fff" : (dark ? "#aaa" : "#555"), border: "none", textAlign: "left", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                {cat}
                <span style={{ fontSize: 12, background: activeCat === cat ? "rgba(255,255,255,0.2)" : (dark ? "#333" : "#eee"), padding: "2px 8px", borderRadius: 10 }}>
                  {BLOG_POSTS.filter(p => p.category === cat).length}
                </span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default function BlogPage() {
  const { dark } = useTheme();
  return (
    <div style={{ fontFamily: "'Segoe UI','Helvetica Neue',sans-serif", background: "transparent", transition: "background 0.4s ease", overflowX: "hidden" }}>
      <SharedHeader activePage="/blog" />
      <PageHero />
      <BlogGrid />
      <Footer />
    </div>
  );
}

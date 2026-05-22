import { useState, useEffect, useRef } from "react";
import { SharedHeader, useTheme, ThemeContext, Footer } from "../components";
import { Link } from "react-router-dom";

// ─── DATA ────────────────────────────────────────────────────────────────────


const BLOG_POSTS = [
  {
    title: "TMT Steel Bars: The Backbone of Modern Construction",
    category: "Industry Insights",
    href: "/blog/tmt-steel-bars-the-backbone-of-modern-construction",
    img: "https://yourbuildmart.com/public/uploads/all/NyxEjph6tvdW6iBmKI2jpOFekIrYacpg52T2Ne5S.jpg",
    excerpt: "In the modern construction industry, strength and durability are paramount. The materials used in construction must not only be sturdy but also able to withstand extreme conditions over time. One such material that has revolutionized the construction sector is TMT (Thermo-Mechanically Treated) steel bars.",
  },
  {
    title: "Microbots: Small is More",
    category: "Logistic Service",
    href: "/blog/microbots-small-is-more",
    img: "https://yourbuildmart.com/public/uploads/all/JEd0f4vJST2kPYFz3PsWC6pIaufeuzxgcZQjPOJp.png",
    excerpt: "We humans are curious about how far we could go in terms of scientific accomplishments. Microbots are the next frontier in precision engineering and construction applications.",
  },
  {
    title: "Cladded Valves: What You Need to Know",
    category: "Order Protection",
    href: "/blog/cladded-valves",
    img: "https://yourbuildmart.com/public/uploads/all/ueOyzSRgkdaNabL9MoVBRGhSQcC82VdkZup4qpdb.jpg",
    excerpt: "Milton Danny, Head of Product Management presents Cladded Valves as a cost-effective alternative to solid alloy valves for corrosive environments.",
  },
  {
    title: "Affordable Construction Material for African and European Countries",
    category: "Logistics",
    href: "/blog/affordable-construction-material-for-african-and-european-countries",
    img: "https://yourbuildmart.com/public/uploads/all/oaEiFmcHGkRJizyKXL5WZMZSeqeHTu7HoNeudTJZ.jpg",
    excerpt: "Globalisation has marked a dent on various aspects of life throughout the world, which also includes a continuing change in infrastructure and architecture across continents.",
  },
];

const RELATED_BLOGS = [
  { title: "Microbots: Small is More", href: "/blog/microbots-small-is-more" },
  { title: "Cladded Valves", href: "/blog/cladded-valves" },
  { title: "Affordable Construction Material", href: "/blog/affordable-construction-material-for-african-and-european-countries" },
];

const CATEGORIES = ["All", "Industry Insights", "Logistics", "Order Protection", "Logistic Service"];
const PAGES = [1, 2, 3];

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────


// ─── HEADER ───────────────────────────────────────────────────────────────────


// ─── PAGE HERO ────────────────────────────────────────────────────────────────
function PageHero() {
  const { dark } = useTheme();
  return (
    <section style={{ background: dark ? "#111" : "#f7f7f7", borderBottom: `1px solid ${dark ? "#222" : "#eee"}`, padding: "40px 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: dark ? "#fff" : "#111", marginBottom: 10, letterSpacing: "-0.5px" }}>Blog</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: dark ? "#888" : "#666" }}>
          <Link to="/" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>Home</Link>
          <span>›</span>
          <span style={{ color: dark ? "#ccc" : "#444" }}>Blog</span>
        </div>
      </div>
    </section>
  );
}

// ─── BLOG GRID ────────────────────────────────────────────────────────────────
function BlogGrid() {
  const { dark } = useTheme();
  const [activeCat, setActiveCat] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const bg = dark ? "#0d0d0d" : "#fff";
  const cardBg = dark ? "#181818" : "#fff";
  const cardShadow = dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.07)";
  const headingColor = dark ? "#fff" : "#111";
  const textColor = dark ? "#aaa" : "#555";
  const sidebarBg = dark ? "#111" : "#f7f7f7";
  const tagBg = dark ? "#1e1e1e" : "#fef0ed";

  const filtered = activeCat === "All" ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === activeCat);

  return (
    <section style={{ background: bg, padding: "64px 0", minHeight: "60vh", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)", display: "grid", gridTemplateColumns: "1fr 300px", gap: 48 }}>

        {/* Main Blog List */}
        <div>
          {/* Category Filter */}
          <div style={{ display: "flex", gap: 10, marginBottom: 40, flexWrap: "wrap" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)}
                style={{ padding: "7px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                  background: activeCat === cat ? "#e62e04" : (dark ? "#222" : "#f0f0f0"),
                  color: activeCat === cat ? "#fff" : (dark ? "#ccc" : "#444") }}
                onMouseEnter={e => { if (activeCat !== cat) { e.currentTarget.style.background = dark ? "#333" : "#e8e8e8"; } }}
                onMouseLeave={e => { if (activeCat !== cat) { e.currentTarget.style.background = dark ? "#222" : "#f0f0f0"; } }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {filtered.length === 0 && (
              <p style={{ color: textColor, fontSize: 16 }}>No posts in this category yet.</p>
            )}
            {filtered.map((post) => (
              <a key={post.title} href={post.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ background: cardBg, borderRadius: 16, overflow: "hidden", boxShadow: cardShadow, display: "flex", transition: "transform 0.25s, box-shadow 0.25s, background 0.4s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = dark ? "0 12px 40px rgba(230,46,4,0.2)" : "0 12px 40px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = cardShadow; }}>
                  {/* Image */}
                  <div style={{ width: 240, flexShrink: 0, overflow: "hidden" }}>
                    <img src={post.img} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }}
                      onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                      onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                  </div>
                  {/* Content */}
                  <div style={{ padding: "28px 32px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ display: "inline-block", background: tagBg, color: "#e62e04", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "4px 10px", borderRadius: 4, marginBottom: 14 }}>{post.category}</span>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: headingColor, lineHeight: 1.5, marginBottom: 14 }}>{post.title}</h2>
                      <p style={{ fontSize: 14, color: textColor, lineHeight: 1.7, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.excerpt}</p>
                    </div>
                    <span style={{ color: "#e62e04", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginTop: 20 }}>
                      View More
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", gap: 8, marginTop: 48, alignItems: "center" }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{ width: 38, height: 38, borderRadius: 8, border: "none", cursor: currentPage === 1 ? "default" : "pointer", background: dark ? "#222" : "#f0f0f0", color: dark ? "#888" : "#666", fontSize: 16, opacity: currentPage === 1 ? 0.4 : 1, transition: "all 0.2s" }}>‹</button>
            {PAGES.map(p => (
              <button key={p} onClick={() => setCurrentPage(p)}
                style={{ width: 38, height: 38, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, transition: "all 0.2s",
                  background: currentPage === p ? "#e62e04" : (dark ? "#222" : "#f0f0f0"),
                  color: currentPage === p ? "#fff" : (dark ? "#ccc" : "#444") }}>{p}</button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(PAGES.length, p + 1))}
              disabled={currentPage === PAGES.length}
              style={{ width: 38, height: 38, borderRadius: 8, border: "none", cursor: currentPage === PAGES.length ? "default" : "pointer", background: dark ? "#222" : "#f0f0f0", color: dark ? "#888" : "#666", fontSize: 16, opacity: currentPage === PAGES.length ? 0.4 : 1, transition: "all 0.2s" }}>›</button>
          </div>
        </div>

        {/* Sidebar */}
        <aside>
          <div style={{ background: sidebarBg, borderRadius: 16, padding: 28, marginBottom: 24, transition: "background 0.4s" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: headingColor, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${dark ? "#222" : "#e0e0e0"}` }}>Related Blogs</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {RELATED_BLOGS.map((b, i) => (
                <a key={i} href={b.href} target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: "none", display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: 14, borderBottom: i < RELATED_BLOGS.length - 1 ? `1px solid ${dark ? "#222" : "#eee"}` : "none" }}
                  onMouseEnter={e => e.currentTarget.querySelector("h4").style.color = "#e62e04"}
                  onMouseLeave={e => e.currentTarget.querySelector("h4").style.color = headingColor}>
                  <span style={{ color: "#e62e04", fontSize: 18, flexShrink: 0, marginTop: 2 }}>›</span>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: headingColor, lineHeight: 1.5, transition: "color 0.2s" }}>{b.title}</h4>
                </a>
              ))}
            </div>
          </div>

          {/* Categories Sidebar */}
          <div style={{ background: sidebarBg, borderRadius: 16, padding: 28, transition: "background 0.4s" }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: headingColor, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${dark ? "#222" : "#e0e0e0"}` }}>Categories</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CATEGORIES.filter(c => c !== "All").map(cat => (
                <button key={cat} onClick={() => setActiveCat(cat)}
                  style={{ background: activeCat === cat ? "#e62e04" : "transparent", color: activeCat === cat ? "#fff" : (dark ? "#aaa" : "#555"), border: "none", textAlign: "left", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s" }}
                  onMouseEnter={e => { if (activeCat !== cat) e.currentTarget.style.background = dark ? "#1e1e1e" : "#fef0ed"; }}
                  onMouseLeave={e => { if (activeCat !== cat) e.currentTarget.style.background = "transparent"; }}>
                  {cat}
                  <span style={{ fontSize: 12, background: activeCat === cat ? "rgba(255,255,255,0.2)" : (dark ? "#333" : "#eee"), padding: "2px 8px", borderRadius: 10 }}>
                    {BLOG_POSTS.filter(p => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}



// ─── APP ─────────────────────────────────────────────────────────────────────
export default function BlogPage() {
  const [dark, setDark] = useState(false);
  const toggle = () => setDark(d => !d);

  useEffect(() => {
    document.body.style.background = dark ? "#0d0d0d" : "#fff";
    document.body.style.transition = "background 0.4s ease";
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div style={{ overflowX: "hidden", fontFamily: "Segoe UI", background: dark ? "#0d0d0d" : "#fff", transition: "background 0.4s ease" }}>
        <SharedHeader activePage="/blog" />
        <PageHero />
        <BlogGrid />
        <Footer />
      </div>
    </ThemeContext.Provider>
  );
}
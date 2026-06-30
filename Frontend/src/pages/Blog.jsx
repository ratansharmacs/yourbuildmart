import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SharedHeader, useTheme, Footer } from "../components";
import { blogApi, BASE_URL } from "../services/api";

const RED = "#e62e04";

function PageHero() {
  const { dark } = useTheme();
  return (
    <section style={{ borderBottom: `1px solid ${dark ? "#1e1e1e" : "#efefef"}`, padding: "clamp(28px,4vw,48px) 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: dark ? "#555" : "#aaa", marginBottom: 12, fontWeight: 500 }}>
          <Link to="/" style={{ color: RED, textDecoration: "none", fontWeight: 600, fontSize: 12 }}>Home</Link>
          <span style={{ opacity: 0.4 }}>›</span>
          <span>Blog</span>
        </div>
        <h1 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: dark ? "#f0f0f0" : "#111", letterSpacing: "-0.5px", lineHeight: 1.15 }}>Blog</h1>
      </div>
    </section>
  );
}

export default function BlogPage() {
  const { dark } = useTheme();
  const [posts, setPosts]       = useState([]);
  const [cats, setCats]         = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [p, c] = await Promise.all([blogApi.getPosts(), blogApi.getCategories()]);
        setPosts(Array.isArray(p) ? p : []);
        setCats(Array.isArray(c) ? c : []);
      } catch (e) {
        setError("Failed to load blog posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = activeCat === "All"
    ? posts
    : posts.filter(p => p.categoryName === activeCat);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const cardBg      = dark ? "#181818" : "#fff";
  const cardShadow  = dark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.07)";
  const headingColor= dark ? "#fff" : "#111";
  const textColor   = dark ? "#aaa" : "#555";
  const sidebarBg   = dark ? "#111" : "#f7f7f7";
  const tagBg       = dark ? "#1e1e1e" : "#fef0ed";
  const borderColor = dark ? "#222" : "#e0e0e0";

  return (
    <div style={{ fontFamily: "'Segoe UI','Helvetica Neue',sans-serif", background: "transparent", overflowX: "hidden" }}>
      <SharedHeader activePage="/blog" />
      <PageHero />

      <section style={{ padding: "64px 0", minHeight: "60vh" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>

          {/* ── Category filter pills ── */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32 }}>
            {["All", ...cats.map(c => c.name)].map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)}
                style={{
                  padding: "7px 18px", borderRadius: 20, border: "none",
                  cursor: "pointer", fontSize: 13, fontWeight: 600,
                  background: activeCat === cat ? RED : (dark ? "#222" : "#f0f0f0"),
                  color: activeCat === cat ? "#fff" : (dark ? "#ccc" : "#444"),
                  transition: "all 0.2s",
                }}>
                {cat}
              </button>
            ))}
          </div>

          <div className="blog-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr clamp(220px,28%,300px)", gap: 40, alignItems: "start" }}>

            {/* ── Main post list ── */}
            <div>
              {loading && (
                <div style={{ color: textColor, fontSize: 15, padding: "40px 0" }}>Loading posts…</div>
              )}
              {error && (
                <div style={{ color: RED, fontSize: 14, padding: "20px 0" }}>{error}</div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <p style={{ color: textColor }}>No posts in this category yet.</p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {filtered.map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} style={{ textDecoration: "none" }}>
                    <div
                      className="blog-list-card"
                      style={{
                        background: cardBg, borderRadius: 16, overflow: "hidden",
                        boxShadow: cardShadow, display: "flex", gap: 0,
                        transition: "transform 0.25s, box-shadow 0.25s",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = dark ? "0 12px 40px rgba(230,46,4,0.2)" : "0 12px 40px rgba(0,0,0,0.12)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = cardShadow;
                      }}
                    >
                      {/* Banner image */}
                      {post.bannerImageUrl && (
                        <div className="blog-list-card-img" style={{ width: 220, flexShrink: 0, overflow: "hidden" }}>
                          <img src={post.bannerImageUrl.startsWith("http") ? post.bannerImageUrl : `${BASE_URL}${post.bannerImageUrl}`} alt={post.title} loading="lazy"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s" }}
                            onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                            onMouseLeave={e => e.target.style.transform = "scale(1)"}
                          />
                        </div>
                      )}
                      {/* Body */}
                      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
                        <div>
                          <span style={{
                            display: "inline-block", background: tagBg, color: RED,
                            fontSize: 11, fontWeight: 700, letterSpacing: "1.5px",
                            textTransform: "uppercase", padding: "4px 10px", borderRadius: 4, marginBottom: 12,
                          }}>{post.categoryName || "General"}</span>
                          <h2 style={{ fontSize: 18, fontWeight: 700, color: headingColor, lineHeight: 1.5, marginBottom: 12 }}>{post.title}</h2>
                          <p style={{
                            fontSize: 14, color: textColor, lineHeight: 1.7,
                            display: "-webkit-box", WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical", overflow: "hidden",
                          }} dangerouslySetInnerHTML={{ __html: post.shortDescription || "" }} />
                        </div>
                        <span style={{ color: RED, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginTop: 18 }}>
                          View More
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside style={{ position: "sticky", top: 100 }}>
              {/* Related / Recent Posts */}
              <div style={{ background: sidebarBg, borderRadius: 16, padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: headingColor, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${borderColor}` }}>
                  Recent Posts
                </h3>
                {posts.slice(0, 5).map((b, i) => (
                  <Link key={b.id} to={`/blog/${b.slug}`} style={{
                    textDecoration: "none", display: "flex", alignItems: "flex-start",
                    gap: 10, paddingBottom: 14,
                    borderBottom: i < Math.min(posts.length, 5) - 1 ? `1px solid ${borderColor}` : "none",
                    marginBottom: 14,
                  }}>
                    <span style={{ color: RED, fontSize: 18, flexShrink: 0, marginTop: 1 }}>›</span>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: headingColor, lineHeight: 1.5, margin: 0 }}>{b.title}</h4>
                  </Link>
                ))}
              </div>

              {/* Categories */}
              <div style={{ background: sidebarBg, borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: headingColor, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${borderColor}` }}>
                  Categories
                </h3>
                {cats.map(cat => {
                  const count = posts.filter(p => p.categoryName === cat.name).length;
                  return (
                    <button key={cat.id} onClick={() => setActiveCat(cat.name)}
                      style={{
                        width: "100%", background: activeCat === cat.name ? RED : "transparent",
                        color: activeCat === cat.name ? "#fff" : (dark ? "#aaa" : "#555"),
                        border: "none", textAlign: "left", padding: "8px 12px",
                        borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600,
                        display: "flex", justifyContent: "space-between", marginBottom: 4,
                      }}>
                      {cat.name}
                      <span style={{ fontSize: 12, background: activeCat === cat.name ? "rgba(255,255,255,0.2)" : (dark ? "#333" : "#eee"), padding: "2px 8px", borderRadius: 10 }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .blog-main-grid {
            grid-template-columns: 1fr !important;
          }
          .blog-main-grid aside {
            display: none;
          }
        }
        @media (max-width: 600px) {
          .blog-list-card {
            flex-direction: column !important;
          }
          .blog-list-card-img {
            width: 100% !important;
            height: 200px !important;
          }
        }
      `}</style>
      <Footer />
    </div>
  );
}

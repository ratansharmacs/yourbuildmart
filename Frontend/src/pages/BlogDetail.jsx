import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { SharedHeader, useTheme, Footer } from "../components";
import { blogApi, BASE_URL } from "../services/api";

const RED = "#e62e04";

// ── Swiper-style related blogs carousel ──────────────────────────────────────
function RelatedCarousel({ posts, currentId, dark }) {
  const related = posts.filter(p => p.id !== currentId).slice(0, 8);
  const [idx, setIdx]   = useState(0);
  const autoRef          = useRef(null);

  const perView = typeof window !== "undefined" && window.innerWidth <= 768 ? 1 : 3;
  // Only loop (double) the array when there are more posts than fit in one view,
  // so we never show the same card twice when there are few related posts.
  const looped  = related.length > perView ? [...related, ...related] : related;
  const maxIdx  = related.length > perView ? related.length : Math.max(0, related.length - perView);

  useEffect(() => {
    if (related.length <= perView) return; // no auto-scroll if everything fits
    autoRef.current = setInterval(() => setIdx(p => p + 1), 3000);
    return () => clearInterval(autoRef.current);
  }, [related.length, perView]);

  useEffect(() => {
    if (related.length > perView && idx >= related.length) setTimeout(() => setIdx(0), 650);
  }, [idx, related.length, perView]);

  const resetAuto = () => {
    clearInterval(autoRef.current);
    if (related.length > perView) {
      autoRef.current = setInterval(() => setIdx(p => p + 1), 3000);
    }
  };

  if (!related.length) return null;

  return (
    <section style={{ padding: "48px 0 72px", background: "transparent" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <h2 style={{ color: RED, fontSize: 28, fontWeight: 800, marginBottom: 28, fontFamily: "'Georgia',serif" }}>
          Related Blogs
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Prev */}
          <button onClick={() => { setIdx(p => Math.max(0, p - 1)); resetAuto(); }}
            style={{ width: 36, height: 36, borderRadius: "50%", border: "none",
              background: dark ? "#222" : "#fff", cursor: "pointer", flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dark ? "#fff" : "#333"} strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          {/* Track */}
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{
              display: "flex", gap: 20,
              transition: (related.length > perView && idx >= related.length) ? "none" : "transform 0.6s cubic-bezier(.22,.61,.36,1)",
              transform: `translateX(calc(-${idx * (100 / perView)}% - ${idx * (20 / perView)}px))`,
            }}>
              {looped.map((post, i) => (
                <Link key={`${post.id}-${i}`} to={`/blog/${post.slug}`}
                  style={{ textDecoration: "none", flexShrink: 0, width: `calc(${100 / perView}% - ${(20 * (perView - 1)) / perView}px)` }}>
                  <div style={{
                    borderRadius: 14, overflow: "hidden",
                    background: dark ? "#181818" : "#fff",
                    boxShadow: dark ? "0 4px 16px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.08)",
                    transition: "transform 0.25s",
                    height: 280,
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "none"}
                  >
                    {/* Image */}
                    <div style={{ height: 170, overflow: "hidden", position: "relative" }}>
                      {post.bannerImageUrl
                        ? <img src={post.bannerImageUrl.startsWith("http") ? post.bannerImageUrl : `${BASE_URL}${post.bannerImageUrl}`} alt={post.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", background: dark ? "#2a2a2a" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>📝</div>
                      }
                    </div>
                    {/* Text */}
                    <div style={{ padding: "14px 16px" }}>
                      <p style={{
                        color: dark ? "#eee" : "#111", fontWeight: 700, fontSize: 14,
                        lineHeight: 1.4, margin: 0,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>{post.title}</p>
                      {post.categoryName && (
                        <span style={{ fontSize: 11, color: RED, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginTop: 6, display: "block" }}>
                          {post.categoryName}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Next */}
          <button onClick={() => { setIdx(p => Math.min(maxIdx, p + 1)); resetAuto(); }}
            style={{ width: 36, height: 36, borderRadius: "50%", border: "none",
              background: dark ? "#222" : "#fff", cursor: "pointer", flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dark ? "#fff" : "#333"} strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Main BlogDetail page ──────────────────────────────────────────────────────
export default function BlogDetail() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const { dark }   = useTheme();

  const [post,   setPost]   = useState(null);
  const [posts,  setPosts]  = useState([]);   // all posts for related section
  const [loading,setLoading]= useState(true);
  const [error,  setError]  = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [p, all] = await Promise.all([
          blogApi.getPostBySlug(slug),
          blogApi.getPosts(),
        ]);
        setPost(p);
        setPosts(Array.isArray(all) ? all : []);
      } catch (e) {
        setError("Blog post not found.");
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const headingColor = dark ? "#fff" : "#111";
  const textColor    = dark ? "#ccc" : "#333";
  const cardBg       = dark ? "#181818" : "#fff";
  const cardShadow   = dark ? "0 4px 24px rgba(0,0,0,0.45)" : "0 4px 24px rgba(0,0,0,0.08)";
  const mutedColor   = dark ? "#888" : "#777";
  const borderColor  = dark ? "#2a2a2a" : "#e8e8e8";

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif" }}>
      <SharedHeader activePage="/blog" />
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: mutedColor, fontSize: 16 }}>
        Loading…
      </div>
      <Footer />
    </div>
  );

  // ── Error / Not found ─────────────────────────────────────────────────────
  if (error || !post) return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif" }}>
      <SharedHeader activePage="/blog" />
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ fontSize: 48 }}>📭</div>
        <p style={{ color: headingColor, fontSize: 18, fontWeight: 600 }}>{error || "Post not found."}</p>
        <Link to="/blog" style={{ color: RED, fontWeight: 700, textDecoration: "none", border: `2px solid ${RED}`, padding: "10px 24px", borderRadius: 6 }}>
          ← Back to Blog
        </Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI','Helvetica Neue',sans-serif", background: "transparent", overflowX: "hidden" }}>
      <SharedHeader activePage="/blog" />

      {/* ── Breadcrumb strip ── */}
      <section style={{ padding: "12px 0", borderBottom: `1px solid ${borderColor}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
          <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: mutedColor }}>
            <Link to="/" style={{ color: RED, textDecoration: "none", fontWeight: 600 }}>Home</Link>
            <span>›</span>
            <Link to="/blog" style={{ color: RED, textDecoration: "none", fontWeight: 600 }}>Blog</Link>
            <span>›</span>
            <span style={{ color: headingColor }}>{post.title}</span>
          </nav>
        </div>
      </section>

      {/* ── Page title bar (matches HTML reference: .thetopssmainsaheads) ── */}
      <section style={{ padding: "32px 0 0", background: "transparent" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
          <div style={{ borderBottom: `1px solid ${borderColor}`, paddingBottom: 24 }}>
            <h2 style={{
              fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 800,
              color: headingColor, letterSpacing: "0.3px",
              fontFamily: "'Segoe UI','Helvetica Neue',sans-serif",
              margin: 0, lineHeight: 1.3,
            }}>
              {post.title}
            </h2>
          </div>
        </div>
      </section>

      {/* ── Banner image (matches HTML: .mb-4.blog-single img) ── */}
      {post.bannerImageUrl && (
        <section style={{ padding: "28px 0 0", background: "transparent" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
            <div style={{ marginBottom: 28, borderRadius: 12, overflow: "hidden", maxHeight: 500 }}>
              <img
                src={post.bannerImageUrl.startsWith("http") ? post.bannerImageUrl : `${BASE_URL}${post.bannerImageUrl}`}
                alt={post.title}
                style={{ width: "100%", maxHeight: 500, objectFit: "cover", objectPosition: "top", display: "block" }}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Main content card (matches HTML: .bg-white.rounded.shadow-sm.p-4) ── */}
      <section style={{ paddingBottom: 48, background: "transparent" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
          <div style={{
            background: cardBg, borderRadius: 14, boxShadow: cardShadow,
            padding: "clamp(20px,4vw,40px)", transition: "background 0.4s",
          }}>
            {/* Post header inside card */}
            <div style={{ borderBottom: `1px solid ${borderColor}`, marginBottom: 24, paddingBottom: 16 }}>
              <h1 style={{ fontSize: "clamp(18px,2.8vw,24px)", fontWeight: 700, color: headingColor, margin: "0 0 10px" }}>
                {post.title}
              </h1>
              {post.categoryName && (
                <div style={{ color: mutedColor, fontSize: 14, fontStyle: "italic" }}>
                  {post.categoryName}
                </div>
              )}
              {post.createdAt && (
                <div style={{ color: mutedColor, fontSize: 13, marginTop: 6 }}>
                  {new Date(post.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              )}
            </div>

            {/* Short description */}
            {post.shortDescription && (
              <p style={{ fontSize: 16, color: textColor, lineHeight: 1.8, marginBottom: 24, fontWeight: 500 }}
                dangerouslySetInnerHTML={{ __html: post.shortDescription }} />
            )}

            {/* Full description — rendered as HTML (matches the HTML reference) */}
            {post.description && (
              <div
                className="blog-content"
                style={{ color: textColor, lineHeight: 1.85, fontSize: 15 }}
                dangerouslySetInnerHTML={{ __html: post.description }}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Related Blogs (matches .blogsss section with swiper) ── */}
      <RelatedCarousel posts={posts} currentId={post.id} dark={dark} />

      {/* ── Blog content styles (mirrors the yourbuildmart.com HTML CSS) ── */}
      <style>{`
        .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4 {
          color: ${headingColor};
          font-family: 'Segoe UI', sans-serif;
          font-weight: 700;
          line-height: 1.4;
          margin: 28px 0 12px;
          transition: color 0.4s;
        }
        .blog-content h1 { font-size: clamp(22px,3vw,28px); }
        .blog-content h2 { font-size: clamp(19px,2.5vw,24px); }
        .blog-content h3 { font-size: clamp(17px,2.2vw,20px); color: ${RED}; }
        .blog-content h4 { font-size: clamp(15px,2vw,17px); }
        .blog-content p  { margin: 0 0 18px; }
        .blog-content ul, .blog-content ol {
          padding-left: 24px;
          margin: 0 0 18px;
        }
        .blog-content li { margin-bottom: 8px; }
        .blog-content a  { color: ${RED}; text-decoration: none; }
        .blog-content a:hover { text-decoration: underline; }
        .blog-content strong { color: ${headingColor}; font-weight: 700; }
        .blog-content img {
          max-width: 100%;
          border-radius: 10px;
          margin: 20px 0;
        }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        @media (max-width: 640px) {
          .blog-content table {
            display: block;
            overflow-x: auto;
            white-space: nowrap;
          }
        }
        .blog-content table td, .blog-content table th {
          border: 1px solid ${borderColor};
          padding: 10px 14px;
          font-size: 14px;
          color: ${textColor};
        }
        .blog-content table th {
          background: ${dark ? "#2a2a2a" : "#f5f5f5"};
          font-weight: 700;
          color: ${headingColor};
        }
        .blog-content blockquote {
          border-left: 4px solid ${RED};
          padding: 12px 20px;
          margin: 20px 0;
          background: ${dark ? "rgba(230,46,4,0.08)" : "rgba(230,46,4,0.05)"};
          border-radius: 0 8px 8px 0;
          font-style: italic;
          color: ${mutedColor};
        }
      `}</style>

      <Footer />
    </div>
  );
}

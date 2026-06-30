import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme, SharedHeader, Footer, useAuth } from "../components";

export default function Login() {
  const { dark } = useTheme();
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");

  const textColor = dark ? "#e8e8e8" : "#222";
  const cardBg = dark ? "rgba(18,18,18,0.92)" : "rgba(255,255,255,0.92)";
  const cardBorder = dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)";
  const inputBg = dark ? "#1a1a1a" : "#f8f8f8";
  const inputBorder = dark ? "1.5px solid #333" : "1.5px solid #ddd";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setError("");
    try {
      await login({ email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", color: textColor }}>
      <SharedHeader activePage="/login" />

      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(32px,6vw,80px) clamp(16px,4vw,40px)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative glow blobs matching homepage aesthetic */}
        <div style={{
          position: "absolute", top: "15%", left: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,46,4,0.12) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "8%",
          width: 250, height: 250, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,46,4,0.08) 0%, transparent 70%)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />

        <div style={{
          width: "100%", maxWidth: 480,
          background: cardBg,
          border: cardBorder,
          borderRadius: 20,
          padding: "clamp(28px,5vw,48px)",
          boxShadow: dark
            ? "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(230,46,4,0.06)"
            : "0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(230,46,4,0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "relative",
          animation: "fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}>
          {/* Top accent line */}
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: 3,
            background: "linear-gradient(90deg, transparent, #e62e04, transparent)",
            borderRadius: "0 0 4px 4px",
          }} />

          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <Link to="/" style={{
              fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px",
              textDecoration: "none", display: "inline-block", color: textColor,
            }}>
              <span style={{ color: "#e62e04" }}>Your</span>BuildMart
            </Link>
            <p style={{ fontSize: 13, marginTop: 4, opacity: 0.55, color: textColor }}>
              Your trusted construction materials marketplace
            </p>
          </div>

          <h1 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: 800, marginBottom: 6, color: textColor }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 13.5, opacity: 0.55, marginBottom: 28, color: textColor }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div style={{
              background: "rgba(230,46,4,0.08)", border: "1px solid rgba(230,46,4,0.2)",
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              color: "#e62e04", fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.3px", color: textColor }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 8,
                  fontSize: 14, fontFamily: "inherit", outline: "none",
                  background: inputBg, border: inputBorder, color: textColor,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor = "#e62e04"; e.target.style.boxShadow = "0 0 0 3px rgba(230,46,4,0.12)"; }}
                onBlur={e => { e.target.style.borderColor = dark ? "#333" : "#ddd"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.3px", color: textColor }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 42px 11px 14px", borderRadius: 8,
                    fontSize: 14, fontFamily: "inherit", outline: "none",
                    background: inputBg, border: inputBorder, color: textColor,
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = "#e62e04"; e.target.style.boxShadow = "0 0 0 3px rgba(230,46,4,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = dark ? "#333" : "#ddd"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: textColor, opacity: 0.5, padding: 4, display: "flex", alignItems: "center",
                  transition: "opacity 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                >
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", color: textColor }}>
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                  style={{ accentColor: "#e62e04", width: 15, height: 15, cursor: "pointer" }}
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px", borderRadius: 8,
                background: loading ? "#b52500" : "#e62e04",
                color: "#fff", border: "none", fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "background 0.2s, transform 0.1s, box-shadow 0.2s",
                marginTop: 4,
                boxShadow: "0 4px 16px rgba(230,46,4,0.35)",
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.background = "#c42500"; e.target.style.boxShadow = "0 6px 20px rgba(230,46,4,0.5)"; }}}
              onMouseLeave={e => { e.target.style.background = "#e62e04"; e.target.style.boxShadow = "0 4px 16px rgba(230,46,4,0.35)"; }}
              onMouseDown={e => { if (!loading) e.target.style.transform = "scale(0.98)"; }}
              onMouseUp={e => { e.target.style.transform = "scale(1)"; }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13.5, marginTop: 20, opacity: 0.65, color: textColor }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#e62e04", fontWeight: 700, textDecoration: "none" }}>
              Create one free →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

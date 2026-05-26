import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme, SharedHeader, Footer } from "../components";

export default function Login() {
  const { dark } = useTheme();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");

  const textColor = dark ? "#e8e8e8" : "#222";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    // TODO: connect to real auth API
    alert("Login submitted! Connect to your backend API.");
  };

  return (
    <div className="auth-page" style={{ color: textColor }}>
      <SharedHeader activePage="/login" />

      <main className="auth-main">
        <div className={`auth-card ${dark ? "auth-card--dark" : "auth-card--light"}`}>
          {/* Brand */}
          <div className="auth-brand">
            <Link to="/" className="auth-brand-name" style={{ color: textColor }}>
              <span>Your</span>BuildMart
            </Link>
            <p className="auth-tagline" style={{ color: textColor }}>
              Your trusted construction materials marketplace
            </p>
          </div>

          <h1 className="auth-heading" style={{ color: textColor }}>Welcome back</h1>
          <p className="auth-subheading" style={{ color: textColor }}>
            Sign in to your account to continue
          </p>

          {error && <p className="auth-error" style={{ marginBottom: 8 }}>{error}</p>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" style={{ color: textColor }}>Email Address</label>
              <input
                type="email"
                className={`auth-input ${dark ? "auth-input--dark" : "auth-input--light"}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" style={{ color: textColor }}>Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  className={`auth-input ${dark ? "auth-input--dark" : "auth-input--light"}`}
                  placeholder="Enter your password"
                  style={{ paddingRight: 42 }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPw(!showPw)}
                  style={{ color: textColor }}
                  aria-label={showPw ? "Hide password" : "Show password"}
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

            {/* Remember / Forgot */}
            <div className="auth-options">
              <label className="auth-remember" style={{ color: textColor }}>
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                />
                Remember me
              </label>
              <a href="#" className="auth-forgot">Forgot password?</a>
            </div>

            <button type="submit" className="auth-btn">Sign In</button>
          </form>

          {/* Divider */}
          <div className="auth-divider" style={{ color: textColor, margin: "20px 0 16px" }}>
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or continue with</span>
            <div className="auth-divider-line" />
          </div>

          {/* Social */}
          <div className="auth-social">
            <button className={`auth-social-btn ${dark ? "auth-social-btn--dark" : "auth-social-btn--light"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className={`auth-social-btn ${dark ? "auth-social-btn--dark" : "auth-social-btn--light"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={dark ? "#e8e8e8" : "#333"}>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>

          <p className="auth-switch" style={{ color: textColor }}>
            Don't have an account?{" "}
            <Link to="/register">Create one free →</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

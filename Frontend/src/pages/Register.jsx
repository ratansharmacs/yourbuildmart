import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme, SharedHeader, Footer } from "../components";

export default function Register() {
  const { dark } = useTheme();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", company: "", password: "", confirm: "", terms: false,
  });
  const [errors, setErrors] = useState({});

  const textColor = dark ? "#e8e8e8" : "#222";

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.email.trim())     e.email     = "Required";
    if (!form.password)         e.password  = "Required";
    if (form.password.length < 8) e.password = "Min 8 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    if (!form.terms) e.terms = "You must accept the terms";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    // TODO: connect to real auth API
    alert("Registration submitted! Connect to your backend API.");
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
    className: `auth-input ${dark ? "auth-input--dark" : "auth-input--light"}`,
  });

  const EyeToggle = ({ show, toggle }) => (
    <button
      type="button"
      className="auth-eye"
      onClick={toggle}
      style={{ color: textColor }}
      aria-label={show ? "Hide password" : "Show password"}
    >
      {show ? (
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
  );

  return (
    <div className="auth-page" style={{ color: textColor }}>
      <SharedHeader activePage="/register" />

      <main className="auth-main">
        <div className={`auth-card ${dark ? "auth-card--dark" : "auth-card--light"}`} style={{ maxWidth: 520 }}>
          {/* Brand */}
          <div className="auth-brand">
            <Link to="/" className="auth-brand-name" style={{ color: textColor }}>
              <span>Your</span>BuildMart
            </Link>
            <p className="auth-tagline" style={{ color: textColor }}>
              Your trusted construction materials marketplace
            </p>
          </div>

          <h1 className="auth-heading" style={{ color: textColor }}>Create your account</h1>
          <p className="auth-subheading" style={{ color: textColor }}>
            Join thousands of builders and contractors worldwide
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Name row */}
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label" style={{ color: textColor }}>First Name</label>
                <input type="text" {...field("firstName")} placeholder="John" />
                {errors.firstName && <span className="auth-error">{errors.firstName}</span>}
              </div>
              <div className="auth-field">
                <label className="auth-label" style={{ color: textColor }}>Last Name</label>
                <input type="text" {...field("lastName")} placeholder="Doe" />
                {errors.lastName && <span className="auth-error">{errors.lastName}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" style={{ color: textColor }}>Email Address</label>
              <input type="email" {...field("email")} placeholder="you@example.com" />
              {errors.email && <span className="auth-error">{errors.email}</span>}
            </div>

            {/* Phone + Company */}
            <div className="auth-row">
              <div className="auth-field">
                <label className="auth-label" style={{ color: textColor }}>Phone (optional)</label>
                <input type="tel" {...field("phone")} placeholder="+91 00000 00000" />
              </div>
              <div className="auth-field">
                <label className="auth-label" style={{ color: textColor }}>Company (optional)</label>
                <input type="text" {...field("company")} placeholder="Your Company" />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" style={{ color: textColor }}>Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  {...field("password")}
                  placeholder="Min 8 characters"
                  style={{ paddingRight: 42 }}
                />
                <EyeToggle show={showPw} toggle={() => setShowPw(!showPw)} />
              </div>
              {errors.password && <span className="auth-error">{errors.password}</span>}
            </div>

            {/* Confirm password */}
            <div className="auth-field">
              <label className="auth-label" style={{ color: textColor }}>Confirm Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  {...field("confirm")}
                  placeholder="Repeat your password"
                  style={{ paddingRight: 42 }}
                />
                <EyeToggle show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
              </div>
              {errors.confirm && <span className="auth-error">{errors.confirm}</span>}
            </div>

            {/* Terms */}
            <div className="auth-field">
              <label className="auth-remember" style={{ color: textColor, fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.checked })}
                />
                I agree to the{" "}
                <a href="#" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>
                  Privacy Policy
                </a>
              </label>
              {errors.terms && <span className="auth-error">{errors.terms}</span>}
            </div>

            <button type="submit" className="auth-btn">Create Account</button>
          </form>

          {/* Divider */}
          <div className="auth-divider" style={{ color: textColor, margin: "20px 0 16px" }}>
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or sign up with</span>
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
            Already have an account?{" "}
            <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

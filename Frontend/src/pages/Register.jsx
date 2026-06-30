import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, SharedHeader, Footer, useAuth } from "../components";
import { validatePhone } from "../services/phoneValidation";
import { BASE_URL } from "../services/api";

export default function Register() {
  const { dark } = useTheme();
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", password: "", confirm: "", terms: false,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // ── Email duplicate check state ───────────────────────────────────────────
  const [emailStatus, setEmailStatus] = useState("idle"); // idle | checking | taken | available
  const emailDebounceRef = useRef(null);

  useEffect(() => {
    const email = form.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus("idle");
      return;
    }

    // Extra: reject clearly invalid formats (TLD must be 2+ chars, no consecutive dots)
    const strictEmailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    const hasConsecutiveDots = /\.{2,}/.test(email);
    const domainPart = email.split("@")[1] || "";
    const tld = domainPart.split(".").pop() || "";

    // Common domain typos: gmail.co → gmail.com, yahoo.co → yahoo.com, etc.
    const COMMON_TYPOS = {
      "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmai.com": "gmail.com",
      "gmial.com": "gmail.com", "gamil.com": "gmail.com", "gmal.com": "gmail.com",
      "yahoo.co": "yahoo.com", "yahoo.cm": "yahoo.com", "yaho.com": "yahoo.com",
      "hotmail.co": "hotmail.com", "hotmail.cm": "hotmail.com",
      "outlook.co": "outlook.com", "outlook.cm": "outlook.com",
      "icloud.co": "icloud.com",
    };
    const typoSuggestion = COMMON_TYPOS[domainPart.toLowerCase()] || null;

    if (!strictEmailRegex.test(email) || hasConsecutiveDots || tld.length < 2) {
      setEmailStatus("invalid");
      return;
    }
    if (typoSuggestion) {
      setEmailStatus(`typo:${typoSuggestion}`);
      return;
    }
    setEmailStatus("checking");
    clearTimeout(emailDebounceRef.current);
    emailDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        setEmailStatus(data?.data?.exists ? "taken" : "available");
      } catch {
        setEmailStatus("idle");
      }
    }, 600);
    return () => clearTimeout(emailDebounceRef.current);
  }, [form.email]);

  const textColor = dark ? "#e8e8e8" : "#222";
  const cardBg = dark ? "rgba(18,18,18,0.92)" : "rgba(255,255,255,0.92)";
  const cardBorder = dark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)";
  const inputBg = dark ? "#1a1a1a" : "#f8f8f8";
  const inputBorder = dark ? "1.5px solid #333" : "1.5px solid #ddd";

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    if (!form.email.trim())     e.email     = "Required";
    if (emailStatus === "taken")   e.email = "This email is already registered";
    if (emailStatus === "checking") e.email = "Please wait while we check your email";
    if (emailStatus === "invalid")  e.email = "Please enter a valid email address";
    if (emailStatus?.startsWith?.("typo:")) {
      const suggestion = emailStatus.split("typo:")[1];
      e.email = `Did you mean ${form.email.trim().split("@")[0]}@${suggestion}?`;
    }
    if (!form.password)         e.password  = "Required";
    if (form.password.length < 6) e.password = "Min 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    if (!form.terms) e.terms = "You must accept the terms";
    // Phone validation
    const phoneResult = validatePhone(form.phone);
    if (!phoneResult.valid) e.phone = phoneResult.error;
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError("");
    try {
      await register({
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, password: form.password,
        phone: validatePhone(form.phone).normalised,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 8,
    fontSize: 14, fontFamily: "inherit", outline: "none",
    background: inputBg, border: inputBorder, color: textColor,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const focusHandlers = {
    onFocus: e => { e.target.style.borderColor = "#e62e04"; e.target.style.boxShadow = "0 0 0 3px rgba(230,46,4,0.12)"; },
    onBlur:  e => { e.target.style.borderColor = dark ? "#333" : "#ddd"; e.target.style.boxShadow = "none"; },
  };

  const EyeToggle = ({ show, toggle }) => (
    <button type="button" onClick={toggle} style={{
      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
      background: "none", border: "none", cursor: "pointer",
      color: textColor, opacity: 0.5, padding: 4, display: "flex", alignItems: "center",
      transition: "opacity 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.opacity = 1}
      onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", color: textColor }}>
      <SharedHeader activePage="/register" />

      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(32px,6vw,80px) clamp(16px,4vw,40px)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative glow blobs */}
        <div style={{
          position: "absolute", top: "10%", right: "8%",
          width: 350, height: 350, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,46,4,0.10) 0%, transparent 70%)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", left: "5%",
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(230,46,4,0.07) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        <div style={{
          width: "100%", maxWidth: 520,
          background: cardBg, border: cardBorder,
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
            Create your account
          </h1>
          <p style={{ fontSize: 13.5, opacity: 0.55, marginBottom: 28, color: textColor }}>
            Join thousands of builders and contractors worldwide
          </p>

          {apiError && (
            <div style={{
              background: "rgba(230,46,4,0.08)", border: "1px solid rgba(230,46,4,0.2)",
              borderRadius: 8, padding: "10px 14px", marginBottom: 16,
              color: "#e62e04", fontSize: 13,
            }}>
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* First / Last Name row */}
            <div className="auth-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.3px", color: textColor }}>First Name</label>
                <input type="text" placeholder="John" value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  style={inputStyle} {...focusHandlers} />
                {errors.firstName && <span style={{ fontSize: 12.5, color: "#e62e04" }}>{errors.firstName}</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.3px", color: textColor }}>Last Name</label>
                <input type="text" placeholder="Doe" value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  style={inputStyle} {...focusHandlers} />
                {errors.lastName && <span style={{ fontSize: 12.5, color: "#e62e04" }}>{errors.lastName}</span>}
              </div>
            </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.3px", color: textColor }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                  style={{
                    ...inputStyle,
                    borderColor: (emailStatus === "taken" || emailStatus === "invalid" || emailStatus?.startsWith?.("typo:")) ? "#e62e04"
                      : emailStatus === "available" ? "#22c55e"
                      : errors.email ? "#e62e04" : undefined,
                    paddingRight: 36,
                  }} {...focusHandlers} />
                {/* Status icon */}
                {emailStatus === "checking" && (
                  <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13, opacity: 0.5 }}>⏳</span>
                )}
                {(emailStatus === "taken" || emailStatus === "invalid" || emailStatus?.startsWith?.("typo:")) && (
                  <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#e62e04" }}>✕</span>
                )}
                {emailStatus === "available" && (
                  <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#22c55e" }}>✓</span>
                )}
              </div>
              {emailStatus === "taken" && (
                <span style={{ fontSize: 12.5, color: "#e62e04" }}>
                  ⚠ This email is already registered.{" "}
                  <Link to="/login" style={{ color: "#e62e04", fontWeight: 700 }}>Sign in instead →</Link>
                </span>
              )}
              {emailStatus === "invalid" && (
                <span style={{ fontSize: 12.5, color: "#e62e04" }}>⚠ Please enter a valid email address (e.g. you@gmail.com)</span>
              )}
              {emailStatus?.startsWith?.("typo:") && (() => {
                const suggestion = emailStatus.split("typo:")[1];
                const local = form.email.trim().split("@")[0];
                return (
                  <span style={{ fontSize: 12.5, color: "#e62e04" }}>
                    ⚠ Did you mean <strong
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                      onClick={() => { setForm(f => ({ ...f, email: `${local}@${suggestion}` })); setEmailStatus("idle"); }}
                    >{local}@{suggestion}</strong>?
                  </span>
                );
              })()}
              {emailStatus === "available" && (
                <span style={{ fontSize: 12, color: "#22c55e" }}>✓ Email is available</span>
              )}
              {errors.email && !["taken","invalid"].includes(emailStatus) && !emailStatus?.startsWith?.("typo:") && (
                <span style={{ fontSize: 12.5, color: "#e62e04" }}>{errors.email}</span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.3px", color: textColor }}>
                Phone <span style={{ color: "#e62e04" }}>*</span>
              </label>
              <input type="tel" placeholder="+91 98765 43210 / +971 50 123 4567 / +1 212 555 0100" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                style={{ ...inputStyle, borderColor: errors.phone ? "#e62e04" : undefined }} {...focusHandlers} />
              {errors.phone
                ? <span style={{ fontSize: 12, color: "#e62e04" }}>⚠ {errors.phone}</span>
                : <span style={{ fontSize: 11.5, color: dark ? "#666" : "#999" }}>Include country code: +91 (India) · +971 (UAE) · +1 (USA) · +44 (UK)</span>
              }
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.3px", color: textColor }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ ...inputStyle, paddingRight: 42 }} {...focusHandlers} />
                <EyeToggle show={showPw} toggle={() => setShowPw(!showPw)} />
              </div>
              {errors.password && <span style={{ fontSize: 12.5, color: "#e62e04" }}>{errors.password}</span>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.3px", color: textColor }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input type={showConfirm ? "text" : "password"} placeholder="Repeat your password" value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  style={{ ...inputStyle, paddingRight: 42 }} {...focusHandlers} />
                <EyeToggle show={showConfirm} toggle={() => setShowConfirm(!showConfirm)} />
              </div>
              {errors.confirm && <span style={{ fontSize: 12.5, color: "#e62e04" }}>{errors.confirm}</span>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 13, color: textColor }}>
                <input type="checkbox" checked={form.terms}
                  onChange={e => setForm({ ...form, terms: e.target.checked })}
                  style={{ accentColor: "#e62e04", width: 15, height: 15, cursor: "pointer", marginTop: 1, flexShrink: 0 }} />
                I agree to the{" "}
                <a href="#" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600 }} onClick={e => e.preventDefault()}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600 }} onClick={e => e.preventDefault()}>Privacy Policy</a>
              </label>
              {errors.terms && <span style={{ fontSize: 12.5, color: "#e62e04", paddingLeft: 23 }}>{errors.terms}</span>}
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
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 13.5, marginTop: 20, opacity: 0.65, color: textColor }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#e62e04", fontWeight: 700, textDecoration: "none" }}>
              Sign in →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

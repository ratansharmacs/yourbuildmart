import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme, SharedHeader, Footer, useAuth } from "../components";
import { useCart } from "../components/CartContext";
import { ordersApi, resolveImageUrl } from "../services/api";

// ─── 3-Step Enquiry Checkout: My Cart → Enquiry Form → Confirmation ───────────
export default function Checkout({ initialStep = 1 }) {
  const { dark } = useTheme();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, count, clearCart, removeItem, updateQty } = useCart();

  const [step, setStep]       = useState(initialStep);
  const [placing, setPlacing] = useState(false);
  const [order, setOrder]     = useState(location.state?.order || null);
  const [error, setError]     = useState("");

  // URL-sync helper
  const goToStep = (n, extraState = {}) => {
    console.log(`[CHECKOUT] Step ${step} → ${n}`);
    setError("");
    setStep(n);
    if (n === 1) navigate("/cart",                     { replace: true });
    if (n === 2) navigate("/checkout/enquiry-form",    { replace: true });
    if (n === 3) navigate("/checkout/order-confirmed", { replace: true, state: extraState });
  };

  // Pre-fill with logged-in user data (or restore from navigation state on confirmation page)
  const [form, setForm] = useState({
    name:         location.state?.form?.name         || user?.name || user?.fullName || "",
    email:        location.state?.form?.email        || user?.email || "",
    organization: location.state?.form?.organization || "",
    country:      location.state?.form?.country      || "",
    phone:        location.state?.form?.phone        || "",
    dialCode:     location.state?.form?.dialCode     || "+91",
    enquiry:      location.state?.form?.enquiry      || "",
  });

  // Theme tokens
  const bg        = dark ? "#0f0f11" : "#f5f2ee";
  const cardBg    = dark ? "#1a1a1e" : "#fff";
  const border    = dark ? "#2a2a30" : "#e8e8e8";
  const textColor = dark ? "#e8e8e8" : "#1a1a1a";
  const mutedColor = dark ? "#888" : "#777";
  const accentRed  = "#e62e04";
  const inputBg   = dark ? "#111" : "#fafafa";

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login", { state: { from: "/cart" } }); return; }
    if (step === 3 && (order || location.state?.order)) return;
    if (items.length === 0 && !order) { navigate("/products"); return; }
  }, [isLoggedIn]);

  // Update form if user changes
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name:  prev.name  || user.name  || user.fullName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 8,
    border: `1.5px solid ${border}`, background: inputBg,
    color: textColor, fontSize: 14, outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box",
  };

  // ── Country ↔ phone rules ─────────────────────────────────────────────────
  // Each entry: code, label, countries[] (lowercase variants accepted),
  // digits: exact digit count(s) allowed (after stripping spaces/dashes)
  const COUNTRY_PHONE_RULES = [
    { code: "+91",  flag: "🇮🇳", name: "India",        countries: ["india"],                          digits: [10] },
    { code: "+1",   flag: "🇺🇸", name: "USA/Canada",   countries: ["usa", "us", "united states", "canada", "united states of america"], digits: [10] },
    { code: "+44",  flag: "🇬🇧", name: "UK",           countries: ["uk", "united kingdom", "england", "britain", "great britain"],       digits: [10, 11] },
    { code: "+971", flag: "🇦🇪", name: "UAE",          countries: ["uae", "united arab emirates", "dubai", "abu dhabi"],                 digits: [9] },
    { code: "+966", flag: "🇸🇦", name: "Saudi Arabia", countries: ["saudi arabia", "saudi", "ksa"],   digits: [9] },
    { code: "+974", flag: "🇶🇦", name: "Qatar",        countries: ["qatar"],                          digits: [8] },
    { code: "+965", flag: "🇰🇼", name: "Kuwait",       countries: ["kuwait"],                         digits: [8] },
    { code: "+973", flag: "🇧🇭", name: "Bahrain",      countries: ["bahrain"],                        digits: [8] },
    { code: "+968", flag: "🇴🇲", name: "Oman",         countries: ["oman"],                           digits: [8] },
    { code: "+61",  flag: "🇦🇺", name: "Australia",    countries: ["australia"],                      digits: [9] },
    { code: "+49",  flag: "🇩🇪", name: "Germany",      countries: ["germany", "deutschland"],         digits: [10, 11, 12] },
    { code: "+33",  flag: "🇫🇷", name: "France",       countries: ["france"],                         digits: [9] },
    { code: "+81",  flag: "🇯🇵", name: "Japan",        countries: ["japan"],                          digits: [10, 11] },
    { code: "+86",  flag: "🇨🇳", name: "China",        countries: ["china"],                          digits: [11] },
    { code: "+65",  flag: "🇸🇬", name: "Singapore",    countries: ["singapore"],                      digits: [8] },
    { code: "+60",  flag: "🇲🇾", name: "Malaysia",     countries: ["malaysia"],                       digits: [9, 10] },
    { code: "+92",  flag: "🇵🇰", name: "Pakistan",     countries: ["pakistan"],                       digits: [10] },
    { code: "+880", flag: "🇧🇩", name: "Bangladesh",   countries: ["bangladesh"],                     digits: [10] },
    { code: "+94",  flag: "🇱🇰", name: "Sri Lanka",    countries: ["sri lanka"],                      digits: [9] },
    { code: "+977", flag: "🇳🇵", name: "Nepal",        countries: ["nepal"],                          digits: [10] },
    { code: "+27",  flag: "🇿🇦", name: "South Africa", countries: ["south africa"],                   digits: [9] },
    { code: "+55",  flag: "🇧🇷", name: "Brazil",       countries: ["brazil", "brasil"],               digits: [10, 11] },
    { code: "+52",  flag: "🇲🇽", name: "Mexico",       countries: ["mexico"],                         digits: [10] },
    { code: "+7",   flag: "🇷🇺", name: "Russia",       countries: ["russia", "russian federation"],   digits: [10] },
    { code: "+82",  flag: "🇰🇷", name: "South Korea",  countries: ["south korea", "korea"],           digits: [9, 10] },
  ];

  // Derive flat list for dropdown
  const DIAL_CODES = COUNTRY_PHONE_RULES.map(r => ({
    code: r.code,
    label: `${r.flag} ${r.code} ${r.name}`,
  }));

  // Helper: get rule by dial code
  const getRuleByCode = (code) => COUNTRY_PHONE_RULES.find(r => r.code === code);

  // Helper: get rule by country string typed by user
  const getRuleByCountry = (countryStr) => {
    const lower = countryStr.trim().toLowerCase();
    return COUNTRY_PHONE_RULES.find(r => r.countries.some(c => lower.includes(c) || c.includes(lower)));
  };

  // ── Step indicator ─────────────────────────────────────────────────────────
  function StepBar() {
    const steps = [
      { n: 1, label: "My Cart",      icon: "🛒" },
      { n: 2, label: "Enquiry form", icon: "🗺" },
      { n: 3, label: "Confirmation", icon: "✓"  },
    ];
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
        gap: 0, marginBottom: 40, paddingBottom: 8 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center",
            flex: i < steps.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: s.n === 3 && step === 3 ? 20 : 16,
                background: step >= s.n ? (step === s.n ? accentRed : dark ? "#2a2a30" : "#e8e8e8")
                                        : (dark ? "#2a2a30" : "#e8e8e8"),
                color: step === s.n ? "#fff" : step > s.n ? accentRed : mutedColor,
                border: step > s.n ? `2px solid ${accentRed}` : "none",
                transition: "all 0.3s",
              }}>
                {step > s.n ? "✓" : s.icon}
              </div>
              <span style={{ fontSize: 11, fontWeight: step === s.n ? 700 : 500,
                color: step === s.n ? accentRed : mutedColor, whiteSpace: "nowrap" }}>
                {s.n}. {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: "0 6px", marginBottom: 24,
                background: step > s.n ? accentRed : (dark ? "#2a2a30" : "#e8e8e8"),
                transition: "background 0.3s" }} />
            )}
          </div>
        ))}
      </div>
    );
  }

  // ── Cart summary sidebar ──────────────────────────────────────────────────
  function CartSummary() {
    return (
      <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${border}`,
        padding: "24px", position: "sticky", top: 90 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 18 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: textColor, margin: 0 }}>Summary</h3>
          <span style={{ background: accentRed, color: "#fff", borderRadius: 20,
            fontSize: 11, fontWeight: 700, padding: "2px 9px" }}>
            {count} Item{count !== 1 ? "s" : ""}
          </span>
        </div>

        <div style={{ borderBottom: `1px solid ${border}`, paddingBottom: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: mutedColor, textTransform: "uppercase",
            letterSpacing: "0.5px", margin: "0 0 10px" }}>Product</p>
          {items.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: textColor, fontWeight: 600 }}>{item.name}</span>
              <span style={{ fontSize: 12, color: mutedColor }}>× {item.qty}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Handle Submit ─────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    const { name, email, organization, country, phone, dialCode, enquiry } = form;
    console.log("[CHECKOUT] ▶ handlePlaceOrder() — validating form...");

    if (!name.trim())         { setError("Name is required.");         console.warn("[CHECKOUT] ✖ Validation: name empty"); return; }
    if (!email.trim())        { setError("Email is required.");        console.warn("[CHECKOUT] ✖ Validation: email empty"); return; }
    if (!organization.trim()) { setError("Organization is required."); console.warn("[CHECKOUT] ✖ Validation: organization empty"); return; }
    if (!country.trim())      { setError("Country is required.");      console.warn("[CHECKOUT] ✖ Validation: country empty"); return; }

    // ── Phone validation ────────────────────────────────────────────────────
    if (!phone.trim()) {
      setError("Phone number is required. Enter your number in the phone field (don't include the country code again).");
      return;
    }
    const digitsOnly = phone.replace(/\D/g, "");
    const selectedRule   = getRuleByCode(dialCode);
    const countryRule    = getRuleByCountry(country);

    // 1. Country ↔ dial code mismatch
    if (countryRule && selectedRule && countryRule.code !== selectedRule.code) {
      setError(
        `Country mismatch: you selected "${country}" but chose the ${selectedRule.name} (${selectedRule.code}) code. ` +
        `For ${countryRule.name} please select ${countryRule.code}.`
      );
      console.warn("[CHECKOUT] ✖ Validation: country/dialCode mismatch");
      return;
    }

    // 2. Digit count rule
    const ruleToApply = selectedRule;
    if (ruleToApply) {
      const allowed = ruleToApply.digits;
      if (!allowed.includes(digitsOnly.length)) {
        const rangeStr = allowed.length === 1
          ? `${allowed[0]} digits`
          : `${Math.min(...allowed)}–${Math.max(...allowed)} digits`;
        setError(
          `Invalid phone number for ${ruleToApply.name}: expected ${rangeStr}, but you entered ${digitsOnly.length} digit${digitsOnly.length !== 1 ? "s" : ""}. ` +
          `Do not include the country code in the number field.`
        );
        console.warn("[CHECKOUT] ✖ Validation: phone digit count wrong");
        return;
      }
    } else if (digitsOnly.length < 5) {
      setError("Please enter a valid phone number (at least 5 digits).");
      return;
    }
    // ── End phone validation ────────────────────────────────────────────────

    if (!enquiry.trim())      { setError("Enquiry is required.");      console.warn("[CHECKOUT] ✖ Validation: enquiry empty"); return; }

    const fullPhone = `${dialCode} ${phone.trim()}`;
    console.log("[CHECKOUT]   Form valid — submitting enquiry for user:", email);
    setPlacing(true);
    setError("");
    try {
      const placed = await ordersApi.placeOrder({ name, email, organization, country, phone: fullPhone, enquiry });
      const orderData = placed?.data ?? placed;
      console.log("[CHECKOUT] ✅ Enquiry placed successfully:", orderData);
      setOrder(orderData);
      clearCart();
      goToStep(3, { order: orderData, form });
    } catch (err) {
      console.error("[CHECKOUT] ✖ placeOrder failed:", err.message, err);
      setError(err.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: bg, minHeight: "100vh", color: textColor,
      transition: "background 0.4s, color 0.4s" }}>
      <SharedHeader activePage="/checkout" />

      <div style={{ maxWidth: 1100, margin: "0 auto",
        padding: "40px clamp(16px,4vw,32px) 80px" }}>

        {/* Error banner */}
        {error && (
          <div style={{ padding: "14px 18px",
            background: dark ? "#2a1010" : "#fee2e2",
            color: "#dc2626", borderRadius: 10, marginBottom: 24,
            border: "1px solid #fca5a5", fontSize: 14, fontWeight: 600 }}>
            ⚠ {error}
          </div>
        )}

        <StepBar />

        {/* ── STEP 1: My Cart ── */}
        {step === 1 && (
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ background: cardBg, borderRadius: 16,
              border: `1px solid ${border}`, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto",
                padding: "14px 24px", borderBottom: `1px solid ${border}`,
                background: dark ? "#111" : "#fafafa" }}>
                {["Product", "Quantity", "Remove"].map(h => (
                  <span key={h} style={{ fontSize: 12, fontWeight: 700, color: mutedColor,
                    textTransform: "uppercase", letterSpacing: "0.5px",
                    textAlign: h === "Remove" ? "center" : "left" }}>{h}</span>
                ))}
              </div>

              {items.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center", color: mutedColor }}>
                  <p style={{ marginBottom: 12 }}>Your cart is empty.</p>
                  <Link to="/products" style={{ color: accentRed, fontWeight: 700 }}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} style={{ display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    alignItems: "center", padding: "16px 24px",
                    borderBottom: `1px solid ${border}`, gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <img
                        src={resolveImageUrl(item.img) || "https://placehold.co/56x56/f0f0f0/aaa?text=📦"}
                        alt={item.name}
                        style={{ width: 56, height: 56, objectFit: "cover",
                          borderRadius: 8, border: `1px solid ${border}`, flexShrink: 0 }}
                        onError={e => { e.target.src = "https://placehold.co/56x56/f0f0f0/aaa?text=📦"; }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 700, color: textColor }}>{item.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        style={{ width: 26, height: 26, borderRadius: "50%",
                          border: `1px solid ${border}`, background: "none",
                          color: textColor, fontSize: 14, fontWeight: 700,
                          cursor: item.qty <= 1 ? "not-allowed" : "pointer",
                          opacity: item.qty <= 1 ? 0.4 : 1,
                          display: "flex", alignItems: "center", justifyContent: "center" }}
                      >−</button>
                      <span style={{ fontSize: 14, fontWeight: 600, color: textColor,
                        textAlign: "center", minWidth: 24 }}>{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        style={{ width: 26, height: 26, borderRadius: "50%",
                          border: `1px solid ${border}`, background: "none",
                          color: textColor, fontSize: 14, fontWeight: 700,
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center" }}
                      >+</button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%",
                        background: accentRed, display: "flex", alignItems: "center",
                        justifyContent: "center", cursor: "pointer" }}
                        onClick={() => removeItem(item.id)}>
                        <span style={{ color: "#fff", fontSize: 12 }}>🗑</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between",
                alignItems: "center", marginTop: 24 }}>
                <Link to="/products" style={{ color: accentRed, fontWeight: 600,
                  fontSize: 14, textDecoration: "none" }}>
                  ← Return to shop
                </Link>
                <button onClick={() => goToStep(2)} style={{
                  background: dark ? "#1a1a1e" : "#111", color: "#fff",
                  border: "none", padding: "13px 32px", borderRadius: 10,
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 2: Enquiry Form ── */}
        {step === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr min(340px,36%)",
            gap: 28, alignItems: "start" }}>
            <div style={{ background: cardBg, borderRadius: 16,
              border: `1px solid ${border}`, padding: "32px" }}>

              {/* Your name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: textColor,
                  display: "block", marginBottom: 8 }}>
                  Your name <span style={{ color: accentRed }}>*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Name"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = accentRed}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>

              {/* Your Email */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: textColor,
                  display: "block", marginBottom: 8 }}>
                  Your Email <span style={{ color: accentRed }}>*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = accentRed}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>

              {/* Organization */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: textColor,
                  display: "block", marginBottom: 8 }}>
                  Organization <span style={{ color: accentRed }}>*</span>
                </label>
                <input
                  value={form.organization}
                  onChange={e => setForm({ ...form, organization: e.target.value })}
                  placeholder="Organization"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = accentRed}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>

              {/* Country */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: textColor,
                  display: "block", marginBottom: 8 }}>
                  Country <span style={{ color: accentRed }}>*</span>
                </label>
                <input
                  value={form.country}
                  onChange={e => setForm({ ...form, country: e.target.value })}
                  placeholder="Country"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = accentRed}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>

              {/* Phone Number */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: textColor,
                  display: "block", marginBottom: 8 }}>
                  Phone Number <span style={{ color: accentRed }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={form.dialCode}
                    onChange={e => setForm({ ...form, dialCode: e.target.value })}
                    style={{
                      flexShrink: 0, width: 155, padding: "11px 10px", borderRadius: 8,
                      border: `1.5px solid ${border}`, background: inputBg,
                      color: textColor, fontSize: 13, outline: "none",
                      cursor: "pointer", transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = accentRed}
                    onBlur={e => e.target.style.borderColor = border}
                  >
                    {DIAL_CODES.map(d => (
                      <option key={d.code} value={d.code}>{d.label}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^\d\s\-()]/g, "") })}
                    placeholder="Phone number"
                    style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => e.target.style.borderColor = accentRed}
                    onBlur={e => e.target.style.borderColor = border}
                  />
                </div>
                <span style={{ fontSize: 11.5, color: mutedColor, marginTop: 5, display: "block" }}>
                  {(() => {
                    const rule = getRuleByCode(form.dialCode);
                    const countryRule = form.country.trim() ? getRuleByCountry(form.country) : null;
                    const mismatch = countryRule && rule && countryRule.code !== rule.code;
                    if (mismatch) return (
                      <span style={{ color: "#e62e04" }}>
                        ⚠ Country mismatch — "{form.country}" needs {countryRule.code} ({countryRule.name}), not {rule.code}
                      </span>
                    );
                    if (rule) {
                      const rangeStr = rule.digits.length === 1
                        ? `${rule.digits[0]} digits`
                        : `${Math.min(...rule.digits)}–${Math.max(...rule.digits)} digits`;
                      const digitsEntered = form.phone.replace(/\D/g, "").length;
                      const ok = rule.digits.includes(digitsEntered);
                      return (
                        <span style={{ color: digitsEntered > 0 ? (ok ? "#22c55e" : "#e62e04") : mutedColor }}>
                          {rule.name} phone: {rangeStr} required
                          {digitsEntered > 0 && !ok && ` (you entered ${digitsEntered})`}
                          {digitsEntered > 0 && ok && " ✓"}
                        </span>
                      );
                    }
                    return "Select country code, then enter your number (without the country code)";
                  })()}
                </span>
              </div>

              {/* Enquiry */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: textColor,
                  display: "block", marginBottom: 8 }}>
                  Enquiry <span style={{ color: accentRed }}>*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.enquiry}
                  onChange={e => setForm({ ...form, enquiry: e.target.value })}
                  placeholder="Enquiry"
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = accentRed}
                  onBlur={e => e.target.style.borderColor = border}
                />
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button onClick={() => goToStep(1)} style={{
                  background: "none", border: `1.5px solid ${border}`, color: textColor,
                  padding: "11px 22px", borderRadius: 10, fontWeight: 600, fontSize: 13.5,
                  cursor: "pointer",
                }}>
                  ← Previous step
                </button>
                <Link to="/products" style={{ color: mutedColor, fontSize: 13,
                  fontWeight: 600, textDecoration: "none" }}>
                  ← Return to shop
                </Link>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  style={{
                    marginLeft: "auto",
                    background: dark ? "#1a1a1e" : "#111", color: "#fff",
                    border: "none", padding: "13px 32px", borderRadius: 10,
                    fontWeight: 700, fontSize: 14,
                    cursor: placing ? "not-allowed" : "pointer",
                    opacity: placing ? 0.7 : 1,
                    display: "flex", alignItems: "center", gap: 10,
                  }}>
                  {placing ? (
                    <>
                      <span style={{ width: 16, height: 16,
                        border: "2.5px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        display: "inline-block" }} />
                      Submitting…
                    </>
                  ) : "Complete Order"}
                </button>
              </div>
            </div>

            {/* Sidebar summary */}
            <CartSummary />
          </div>
        )}

        {/* ── STEP 3: Confirmation ── */}
        {step === 3 && order && (
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div style={{ background: cardBg, borderRadius: 16,
              border: `1px solid ${border}`, padding: "48px 40px", textAlign: "center",
              marginBottom: 24 }}>
              {/* Check icon */}
              <div style={{ width: 64, height: 64, borderRadius: "50%",
                border: `3px solid ${accentRed}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
                animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                  stroke={accentRed} strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: textColor,
                marginBottom: 8, fontFamily: "'Georgia','Times New Roman',serif" }}>
                Thank You for Your Enquiry!
              </h2>
              <p style={{ color: mutedColor, fontSize: 14, marginBottom: 0 }}>
                A copy of your Enquiry summary has been sent to{" "}
                <strong style={{ color: textColor }}>{order.enquiryEmail || form.email}</strong>
              </p>
            </div>

            {/* Enquiry Summary table */}
            <div style={{ background: cardBg, borderRadius: 16,
              border: `1px solid ${border}`, padding: "32px 40px", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: textColor,
                marginBottom: 24, textAlign: "left" }}>Enquiry Summary</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "16px 32px", marginBottom: 24 }}>
                {[
                  { label: "Enquiry date:",   val: order.createdAt
                    ? new Date(order.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit", hour12: true
                      }).replace(",", "")
                    : new Date().toLocaleString("en-IN") },
                  { label: "Enquiry status:", val: order.status || "Pending" },
                  { label: "Name:",           val: order.enquiryName || form.name },
                  { label: "Email:",          val: order.enquiryEmail || form.email },
                  { label: "Organization:",   val: order.enquiryOrganization || form.organization },
                  { label: "Country:",        val: order.enquiryCountry || form.country },
                  { label: "Phone:",          val: order.enquiryPhone || (form.dialCode && form.phone ? `${form.dialCode} ${form.phone.trim()}` : "") },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: textColor,
                      minWidth: 130, flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 13, color: mutedColor }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Enquiry text */}
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20, marginBottom: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: textColor, marginBottom: 8 }}>
                  Enquiry
                </p>
                <p style={{ fontSize: 14, color: mutedColor, margin: 0, lineHeight: 1.7 }}>
                  {order.enquiryText || form.enquiry}
                </p>
              </div>

              {/* Enquiry Code */}
              <div style={{ textAlign: "center", padding: "16px 0",
                borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`,
                marginBottom: 24 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: textColor }}>
                  Enquiry Code:{" "}
                  <span style={{ color: accentRed, fontWeight: 900, fontSize: 17 }}>
                    {order.orderNumber}
                  </span>
                </span>
              </div>

              {/* Order Details table */}
              <h4 style={{ fontSize: 16, fontWeight: 800, color: textColor,
                marginBottom: 16 }}>Order Details</h4>
              <div style={{ border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr auto",
                  padding: "10px 16px", background: dark ? "#111" : "#fafafa",
                  borderBottom: `1px solid ${border}` }}>
                  {["#", "Product", "Quantity"].map(h => (
                    <span key={h} style={{ fontSize: 12, fontWeight: 700, color: mutedColor,
                      textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</span>
                  ))}
                </div>
                {(order.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: "grid",
                    gridTemplateColumns: "60px 1fr auto",
                    alignItems: "center", padding: "12px 16px",
                    borderBottom: idx < order.items.length - 1 ? `1px solid ${border}` : "none" }}>
                    <span style={{ fontSize: 13, color: mutedColor }}>{idx + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: textColor }}>
                      {item.productName}
                    </span>
                    <span style={{ fontSize: 13, color: mutedColor, textAlign: "right" }}>
                      {item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/orders" style={{
                background: dark ? "#1a1a1e" : "#111", color: "#fff",
                textDecoration: "none", padding: "12px 28px", borderRadius: 10,
                fontWeight: 700, fontSize: 14,
              }}>View My Orders</Link>
              <Link to="/products" style={{
                background: "none", border: `1.5px solid ${border}`, color: textColor,
                textDecoration: "none", padding: "12px 24px", borderRadius: 10,
                fontWeight: 600, fontSize: 14,
              }}>Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.4); opacity: 0; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 700px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

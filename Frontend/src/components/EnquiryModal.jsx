import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { ordersApi, getToken } from "../services/api";
import useScrollLock from "./useScrollLock";

const MODAL_STYLES = `
  @keyframes eq-fade-in  { from { opacity:0 }                          to { opacity:1 } }
  @keyframes eq-slide-up { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
  @keyframes eq-spin     { to { transform: rotate(360deg); } }
  .eq-overlay  { animation: eq-fade-in  0.22s ease; }
  .eq-modal    { animation: eq-slide-up 0.28s ease; }
  .eq-input:focus { border-color: #e62e04 !important; outline: none; box-shadow: 0 0 0 3px rgba(230,46,4,0.12); }
  .eq-input::placeholder { color: #bbb; }
  .eq-btn-complete:hover  { background: #333 !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.18); }
  .eq-btn-complete:active { transform: translateY(0); }
  .eq-btn-complete:disabled { background: #aaa !important; cursor: not-allowed; transform: none; box-shadow: none; }
  .eq-btn-back:hover { color: #e62e04 !important; }
`;

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("ybm_user")); } catch { return null; }
}

function Label({ children }) {
  return (
    <label style={{ fontSize: 13, fontWeight: 600, color: "#333", display: "block", marginBottom: 6 }}>
      {children}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ fontSize: 12, color: "#e62e04", marginTop: 4, marginBottom: 0 }}>{msg}</p>;
}

export default function EnquiryModal({ product, qty = 1, onClose }) {
  const { addItem, removeItem, items } = useCart();
  const navigate = useNavigate();

  const storedUser = getStoredUser();

  const [form, setForm] = useState({
    name:         storedUser?.fullName || "",
    email:        storedUser?.email    || "",
    organization: "",
    country:      "",
    phone:        "",
    dialCode:     "+91",
    enquiry:      "",
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [apiError,   setApiError]   = useState("");
  const [addingToCart, setAddingToCart] = useState(true); // true while initial addItem runs
  const hasAdded = useRef(false); // guard against StrictMode double-mount

  useScrollLock(true);

  // ── Step 1: add to cart as soon as modal opens ───────────────────────────────
  useEffect(() => {
    if (hasAdded.current) return;
    hasAdded.current = true;
    async function addOnOpen() {
      try {
        await addItem({
          id:       product.id,
          name:     product.name,
          category: product.category?.name || "",
          img:      product.imageUrl || product.additionalImages?.[0] || "",
          price:    product.price,
          qty,
        });
      } catch (e) {
        console.warn("[EnquiryModal] addItem on open failed:", e.message);
      } finally {
        setAddingToCart(false);
      }
    }
    addOnOpen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ── block body scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── Escape key closes ────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // ── helpers ──────────────────────────────────────────────────────────────────
  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    setApiError("");
  }

  function validate() {
    const e = {};
    if (!form.name.trim())         e.name         = "Name is required";
    if (!form.email.trim())        e.email        = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                   e.email        = "Enter a valid email";
    if (!form.organization.trim()) e.organization = "Organization is required";
    if (!form.country.trim())      e.country      = "Country is required";
    if (!form.phone.trim())        e.phone        = "Phone number is required";
    else if (form.phone.replace(/\D/g, "").length < 5)
                                   e.phone        = "Enter a valid phone number";
    if (!form.enquiry.trim())      e.enquiry      = "Enquiry message is required";
    return e;
  }

  // ── Complete Order ────────────────────────────────────────────────────────────
  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    if (!getToken()) {
      setApiError("Please log in first to submit an enquiry.");
      return;
    }

    setSubmitting(true);
    setApiError("");
    try {
      // Place the order (backend reads from cart)
      const fullPhone = `${form.dialCode} ${form.phone.trim()}`;
      await ordersApi.placeOrder({
        name:         form.name.trim(),
        email:        form.email.trim(),
        organization: form.organization.trim(),
        country:      form.country.trim(),
        phone:        fullPhone,
        enquiry:      form.enquiry.trim(),
      });

      // Remove the product from cart after successful order
      await removeItem(product.id);

      onClose();
      navigate("/enquiry-success", { state: { productName: product?.name, email: form.email.trim() } });
      return;
    } catch (err) {
      setApiError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── style helpers ─────────────────────────────────────────────────────────────
  const inputStyle = (hasErr) => ({
    width: "100%",
    padding: "11px 14px",
    fontSize: 14,
    border: `1.5px solid ${hasErr ? "#e62e04" : "#ddd"}`,
    borderRadius: 8,
    background: "#fff",
    color: "#111",
    fontFamily: "inherit",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  });

  const overlayStyle = {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 99999, padding: 16,
  };

  const modalStyle = {
    background: "#fff", borderRadius: 16,
    width: "100%", maxWidth: 560,
    maxHeight: "92vh", overflowY: "auto",
    boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
    position: "relative",
  };

  // ── SUCCESS screen ────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <style>{MODAL_STYLES}</style>
        <div className="eq-overlay" style={overlayStyle} onClick={onClose}>
          <div className="eq-modal" style={{ ...modalStyle, padding: "48px 36px", textAlign: "center" }}
               onClick={e => e.stopPropagation()}>
            <button onClick={onClose}
              style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#999", lineHeight: 1 }}>
              ×
            </button>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0faf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 30 }}>
              ✅
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 10 }}>Enquiry Submitted!</h3>
            <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, marginBottom: 8 }}>
              Thank you! Our team will contact you shortly at <strong>{form.email}</strong>.
            </p>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>
              The item has been removed from your cart as your order is placed.
            </p>
            <button
              onClick={onClose}
              style={{
                background: "#e62e04", color: "#fff", border: "none",
                padding: "12px 32px", borderRadius: 8, fontSize: 15,
                fontWeight: 700, cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#c92600"}
              onMouseLeave={e => e.currentTarget.style.background = "#e62e04"}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── FORM screen ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{MODAL_STYLES}</style>
      <div className="eq-overlay" style={overlayStyle} onClick={onClose}>
        <div className="eq-modal" style={modalStyle} onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ padding: "28px 28px 0", textAlign: "center" }}>
            <button onClick={onClose}
              style={{ position: "absolute", top: 16, right: 18, background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#999", lineHeight: 1 }}>
              ×
            </button>

            {addingToCart ? (
              <>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "3px solid #eee", borderTopColor: "#e62e04", animation: "eq-spin 0.7s linear infinite", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, color: "#888", marginBottom: 0 }}>Adding to cart…</p>
              </>
            ) : (
              <>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f0faf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 26 }}>
                  ✅
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 4 }}>
                  Item added to your cart!
                </h3>
                <p style={{ fontSize: 13, color: "#777", marginBottom: 2 }}>{product?.name}</p>
                <p style={{ fontSize: 12, color: "#aaa", marginBottom: 0 }}>
                  Fill in the form below to complete your enquiry, or close to keep browsing.
                </p>
              </>
            )}
          </div>

          <div style={{ height: 1, background: "#eee", margin: "20px 0 0" }} />

          {/* Form body */}
          <div style={{ padding: "20px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

            {apiError && (
              <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", color: "#dc2626", fontSize: 13, fontWeight: 500 }}>
                ⚠ {apiError}
              </div>
            )}

            {/* Name */}
            <div>
              <Label>Your name <span style={{ color: "#e62e04" }}>*</span></Label>
              <input className="eq-input" type="text" placeholder="Name"
                value={form.name} onChange={e => set("name", e.target.value)}
                style={inputStyle(!!errors.name)} />
              <FieldError msg={errors.name} />
            </div>

            {/* Email */}
            <div>
              <Label>Your Email <span style={{ color: "#e62e04" }}>*</span></Label>
              <input className="eq-input" type="email" placeholder="Email"
                value={form.email} onChange={e => set("email", e.target.value)}
                style={inputStyle(!!errors.email)} />
              <FieldError msg={errors.email} />
            </div>

            {/* Organization */}
            <div>
              <Label>Organization <span style={{ color: "#e62e04" }}>*</span></Label>
              <input className="eq-input" type="text" placeholder="Organization"
                value={form.organization} onChange={e => set("organization", e.target.value)}
                style={inputStyle(!!errors.organization)} />
              <FieldError msg={errors.organization} />
            </div>

            {/* Country */}
            <div>
              <Label>Country <span style={{ color: "#e62e04" }}>*</span></Label>
              <input className="eq-input" type="text" placeholder="Country"
                value={form.country} onChange={e => set("country", e.target.value)}
                style={inputStyle(!!errors.country)} />
              <FieldError msg={errors.country} />
            </div>

            {/* Phone */}
            <div>
              <Label>Phone Number <span style={{ color: "#e62e04" }}>*</span></Label>
              <div style={{ display: "flex", gap: 8 }}>
                <select
                  value={form.dialCode}
                  onChange={e => set("dialCode", e.target.value)}
                  style={{
                    padding: "11px 10px", fontSize: 14, border: "1.5px solid #ddd",
                    borderRadius: 8, background: "#fff", color: "#111",
                    fontFamily: "inherit", cursor: "pointer", flexShrink: 0, width: 110,
                  }}
                >
                  {[
                    ["+91","🇮🇳 +91"],["+1","🇺🇸 +1"],["+44","🇬🇧 +44"],["+971","🇦🇪 +971"],
                    ["+27","🇿🇦 +27"],["+61","🇦🇺 +61"],["+49","🇩🇪 +49"],["+33","🇫🇷 +33"],
                    ["+86","🇨🇳 +86"],["+81","🇯🇵 +81"],["+55","🇧🇷 +55"],["+234","🇳🇬 +234"],
                    ["+254","🇰🇪 +254"],["+966","🇸🇦 +966"],["+65","🇸🇬 +65"],["+60","🇲🇾 +60"],
                    ["+92","🇵🇰 +92"],["+880","🇧🇩 +880"],["+94","🇱🇰 +94"],["+20","🇪🇬 +20"],
                  ].map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
                <input
                  className="eq-input" type="tel"
                  placeholder="Phone number (without country code)"
                  value={form.phone}
                  onChange={e => set("phone", e.target.value.replace(/[^\d\s\-()]/g, ""))}
                  style={{ ...inputStyle(!!errors.phone), flex: 1 }}
                />
              </div>
              <FieldError msg={errors.phone} />
            </div>

            {/* Enquiry */}
            <div>
              <Label>Enquiry <span style={{ color: "#e62e04" }}>*</span></Label>
              <textarea className="eq-input" placeholder="Enquiry" rows={4}
                value={form.enquiry} onChange={e => set("enquiry", e.target.value)}
                style={{ ...inputStyle(!!errors.enquiry), resize: "vertical", minHeight: 100 }} />
              <FieldError msg={errors.enquiry} />
            </div>

            {/* Info note */}
            <p style={{ fontSize: 12, color: "#999", margin: 0, lineHeight: 1.6 }}>
              💡 Your item stays in the cart if you close this form. Completing the order will remove it from the cart.
            </p>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
              <button
                className="eq-btn-back"
                onClick={onClose}
                style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer", padding: "8px 0", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
              >
                ← Return to shop
              </button>

              <button
                className="eq-btn-complete"
                onClick={handleSubmit}
                disabled={submitting || addingToCart}
                style={{
                  background: "#111", color: "#fff", border: "none",
                  padding: "13px 28px", borderRadius: 8,
                  fontSize: 14, fontWeight: 700,
                  cursor: (submitting || addingToCart) ? "not-allowed" : "pointer",
                  transition: "all 0.2s", letterSpacing: "0.3px",
                  display: "flex", alignItems: "center", gap: 8,
                  minWidth: 160, justifyContent: "center",
                }}
              >
                {submitting ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "eq-spin 0.7s linear infinite", display: "inline-block" }} />
                    Submitting…
                  </>
                ) : "Complete Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState } from "react";
import { SharedHeader, useTheme, Footer } from "../components";
import { PRODUCTS_OPTIONS, COUNTRIES, OFFICES, SOCIAL_LINKS, MAP_EMBED_URL } from "../data/contactData";
import { Link } from "react-router-dom";

// ─── DATA ────────────────────────────────────────────────────────────────────


// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────


// ─── HEADER ───────────────────────────────────────────────────────────────────


// ─── PAGE HERO ────────────────────────────────────────────────────────────────
function PageHero() {
  const { dark } = useTheme();
  return (
    <section style={{ background: "transparent", borderBottom: `1px solid ${dark ? "#222" : "#eee"}`, padding: "40px 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: dark ? "#fff" : "#111", marginBottom: 10, letterSpacing: "-0.5px" }}>Contact Us</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: dark ? "#888" : "#666" }}>
          <Link to="/" style={{ color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>Home</Link>
          <span>›</span>
          <span style={{ color: dark ? "#ccc" : "#444" }}>Contact Us</span>
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────
function ContactSection() {
  const { dark } = useTheme();

  const [form, setForm] = useState({
    product: "", quantity: "", first_name: "", last_name: "",
    email: "", phone: "", country: "", city: "", requirements: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const bg = dark ? "#0d0d0d" : "#fff";
  const inputBg = dark ? "#181818" : "#f7f7f7";
  const inputBorder = dark ? "#2a2a2a" : "#e0e0e0";
  const inputColor = dark ? "#eee" : "#111";
  const labelColor = dark ? "#aaa" : "#666";
  const headingColor = dark ? "#fff" : "#111";
  const sideBg = dark ? "#111" : "#f7f7f7";
  const textColor = dark ? "#ccc" : "#444";

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 8,
    border: `1.5px solid ${inputBorder}`, background: inputBg, color: inputColor,
    fontSize: 14, outline: "none", transition: "border-color 0.2s, background 0.4s",
    fontFamily: "'Segoe UI','Helvetica Neue',sans-serif",
  };

  const validate = () => {
    const e = {};
    if (!form.product) e.product = "Please select a product";
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
    if (!form.phone) e.phone = "Phone number is required";
    if (!form.country) e.country = "Please select a country";
    if (!form.requirements.trim()) e.requirements = "Please describe your requirements";
    return e;
  };

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    // Simulate form submission (original posted to https://yourbuildmart.com/contact/enquiry)
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setForm({ product: "", quantity: "", first_name: "", last_name: "", email: "", phone: "", country: "", city: "", requirements: "" });
    }, 1200);
  };

  return (
    <section style={{ background: bg, padding: "72px 0", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <span style={{ display: "inline-block", background: "#fef0ed", color: "#e62e04", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: "5px 12px", borderRadius: 4, marginBottom: 16 }}>Get In Touch</span>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: headingColor, marginBottom: 12, letterSpacing: "-0.5px" }}>Let's Build Together!</h2>
          <p style={{ fontSize: 16, color: textColor, maxWidth: 560, margin: "0 auto" }}>Fill out the form below and our team will get back to you within 24 hours.</p>
        </div>

        <div className="contact-grid" style={{ gap: 48 }}>
          {/* Form */}
          <div style={{ background: "transparent", borderRadius: 20, padding: 48, boxShadow: dark ? "0 4px 32px rgba(0,0,0,0.4)" : "0 4px 32px rgba(0,0,0,0.07)", transition: "background 0.4s" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: headingColor, marginBottom: 12 }}>Thank You!</h3>
                <p style={{ fontSize: 16, color: textColor, marginBottom: 28 }}>Your enquiry has been submitted. Our team will contact you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)}
                  style={{ background: "#e62e04", color: "#fff", border: "none", padding: "12px 32px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="contact-form-grid" style={{ gap: 16, marginBottom: 0 }}>

                  {/* Product Select */}
                  <div style={{ gridColumn: "1 / -1", marginBottom: 4 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: labelColor, marginBottom: 6 }}>Product *</label>
                    <select value={form.product} onChange={e => handleChange("product", e.target.value)}
                      style={{ ...inputStyle, borderColor: errors.product ? "#e62e04" : inputBorder }}>
                      <option value="" disabled>Select Product</option>
                      {PRODUCTS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.product && <span style={{ color: "#e62e04", fontSize: 12, marginTop: 4, display: "block" }}>{errors.product}</span>}
                  </div>

                  {/* Quantity */}
                  <div style={{ gridColumn: "1 / -1", marginBottom: 4 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: labelColor, marginBottom: 6 }}>Quantity</label>
                    <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => handleChange("quantity", e.target.value)}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#e62e04"}
                      onBlur={e => e.target.style.borderColor = inputBorder} />
                  </div>

                  {/* First Name */}
                  <div style={{ marginBottom: 4 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: labelColor, marginBottom: 6 }}>First Name *</label>
                    <input type="text" placeholder="First Name" value={form.first_name} onChange={e => handleChange("first_name", e.target.value)}
                      style={{ ...inputStyle, borderColor: errors.first_name ? "#e62e04" : inputBorder }}
                      onFocus={e => e.target.style.borderColor = "#e62e04"}
                      onBlur={e => e.target.style.borderColor = errors.first_name ? "#e62e04" : inputBorder} />
                    {errors.first_name && <span style={{ color: "#e62e04", fontSize: 12, marginTop: 4, display: "block" }}>{errors.first_name}</span>}
                  </div>

                  {/* Last Name */}
                  <div style={{ marginBottom: 4 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: labelColor, marginBottom: 6 }}>Last Name *</label>
                    <input type="text" placeholder="Last Name" value={form.last_name} onChange={e => handleChange("last_name", e.target.value)}
                      style={{ ...inputStyle, borderColor: errors.last_name ? "#e62e04" : inputBorder }}
                      onFocus={e => e.target.style.borderColor = "#e62e04"}
                      onBlur={e => e.target.style.borderColor = errors.last_name ? "#e62e04" : inputBorder} />
                    {errors.last_name && <span style={{ color: "#e62e04", fontSize: 12, marginTop: 4, display: "block" }}>{errors.last_name}</span>}
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: 4 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: labelColor, marginBottom: 6 }}>Email *</label>
                    <input type="email" placeholder="Email" value={form.email} onChange={e => handleChange("email", e.target.value)}
                      style={{ ...inputStyle, borderColor: errors.email ? "#e62e04" : inputBorder }}
                      onFocus={e => e.target.style.borderColor = "#e62e04"}
                      onBlur={e => e.target.style.borderColor = errors.email ? "#e62e04" : inputBorder} />
                    {errors.email && <span style={{ color: "#e62e04", fontSize: 12, marginTop: 4, display: "block" }}>{errors.email}</span>}
                  </div>

                  {/* Phone */}
                  <div style={{ marginBottom: 4 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: labelColor, marginBottom: 6 }}>Phone Number *</label>
                    <input type="number" placeholder="Phone Number" value={form.phone} onChange={e => handleChange("phone", e.target.value)}
                      style={{ ...inputStyle, borderColor: errors.phone ? "#e62e04" : inputBorder }}
                      onFocus={e => e.target.style.borderColor = "#e62e04"}
                      onBlur={e => e.target.style.borderColor = errors.phone ? "#e62e04" : inputBorder} />
                    {errors.phone && <span style={{ color: "#e62e04", fontSize: 12, marginTop: 4, display: "block" }}>{errors.phone}</span>}
                  </div>

                  {/* Country */}
                  <div style={{ marginBottom: 4 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: labelColor, marginBottom: 6 }}>Country *</label>
                    <select value={form.country} onChange={e => handleChange("country", e.target.value)}
                      style={{ ...inputStyle, borderColor: errors.country ? "#e62e04" : inputBorder }}>
                      <option value="" disabled>Select Country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.country && <span style={{ color: "#e62e04", fontSize: 12, marginTop: 4, display: "block" }}>{errors.country}</span>}
                  </div>

                  {/* City */}
                  <div style={{ marginBottom: 4 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: labelColor, marginBottom: 6 }}>City</label>
                    <input type="text" placeholder="City" value={form.city} onChange={e => handleChange("city", e.target.value)}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#e62e04"}
                      onBlur={e => e.target.style.borderColor = inputBorder} />
                  </div>

                  {/* Message */}
                  <div style={{ gridColumn: "1 / -1", marginBottom: 4 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: labelColor, marginBottom: 6 }}>Message *</label>
                    <textarea placeholder="Describe your requirements..." value={form.requirements} onChange={e => handleChange("requirements", e.target.value)} rows={4}
                      style={{ ...inputStyle, resize: "vertical", minHeight: 110, borderColor: errors.requirements ? "#e62e04" : inputBorder }}
                      onFocus={e => e.target.style.borderColor = "#e62e04"}
                      onBlur={e => e.target.style.borderColor = errors.requirements ? "#e62e04" : inputBorder} />
                    {errors.requirements && <span style={{ color: "#e62e04", fontSize: 12, marginTop: 4, display: "block" }}>{errors.requirements}</span>}
                  </div>

                  {/* Submit */}
                  <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
                    <button type="submit" disabled={submitting}
                      style={{ width: "100%", padding: "14px 32px", background: submitting ? "#aaa" : "#e62e04", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: submitting ? "default" : "pointer", transition: "background 0.2s" }}
                      onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#c42500"; }}
                      onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#e62e04"; }}>
                      {submitting ? "Submitting..." : "Submit Enquiry"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Right Side Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Dubai Office */}
            <div style={{ background: sideBg, borderRadius: 16, padding: 28, borderLeft: "4px solid #e62e04", transition: "background 0.4s" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: headingColor, marginBottom: 16 }}>Dubai Office</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>📍</span>
                  <p style={{ fontSize: 14, color: textColor, lineHeight: 1.7 }}>Unit 13,14, 1st Floor, Princess Cars Building, Next to Oasis Mall, Sheikh Zayed Road, Dubai, UAE</p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 16 }}>📞</span>
                  <a href="tel:+971586766102" style={{ fontSize: 14, color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>+971 586 766 102</a>
                </div>
              </div>
            </div>

            {/* India Office */}
            <div style={{ background: sideBg, borderRadius: 16, padding: 28, borderLeft: "4px solid #e62e04", transition: "background 0.4s" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: headingColor, marginBottom: 16 }}>India Office</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>📍</span>
                  <p style={{ fontSize: 14, color: textColor, lineHeight: 1.7 }}># 259, Block A, 201, 1st Floor, Silver Oak Road, Ghitorni New Delhi- 110030</p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 16 }}>📞</span>
                  <div>
                    <a href="tel:+918383001449" style={{ fontSize: 14, color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>+91 83830 01449</a>
                    <span style={{ color: textColor, fontSize: 14 }}> / </span>
                    <a href="tel:+918328408325" style={{ fontSize: 14, color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>+91 83284 08325</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Email & Social */}
            <div style={{ background: sideBg, borderRadius: 16, padding: 28, transition: "background 0.4s" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: headingColor, marginBottom: 16 }}>Connect With Us</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 16 }}>📧</span>
                  <a href="mailto:contact@yourbuildmart.com" style={{ fontSize: 14, color: "#e62e04", textDecoration: "none", fontWeight: 600 }}>contact@yourbuildmart.com</a>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  {[
                    { icon: "📘", label: "Facebook", href: "https://www.facebook.com/people/Yourbuildmart/100083448582131/" },
                    { icon: "📷", label: "Instagram", href: "https://www.instagram.com/yourbuildmart/" },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: dark ? "#1e1e1e" : "#fff", color: dark ? "#ccc" : "#444", textDecoration: "none", fontSize: 13, fontWeight: 600, border: `1px solid ${dark ? "#2a2a2a" : "#e0e0e0"}`, transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#e62e04"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = dark ? "#1e1e1e" : "#fff"; e.currentTarget.style.color = dark ? "#ccc" : "#444"; e.currentTarget.style.borderColor = dark ? "#2a2a2a" : "#e0e0e0"; }}>
                      <span>{s.icon}</span> {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div style={{ marginTop: 56, borderRadius: 20, overflow: "hidden", boxShadow: dark ? "0 8px 40px rgba(0,0,0,0.5)" : "0 8px 40px rgba(0,0,0,0.1)" }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3608.6916195597684!2d55.239577374843!3d25.170997370882575!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6909a59fcd11%3A0xeb1619cfe274726e!2sPrincess%20cars!5e0!3m2!1sen!2sae!4v1697278829404!5m2!1sen!2sae"
            width="100%"
            height="400"
            style={{ border: 0, display: "block" }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="YourBuildMart Office Location"
          />
        </div>
      </div>
    </section>
  );
}


// ─── APP ─────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const { dark } = useTheme();
  return (
    <div style={{ overflowX: "hidden", fontFamily: "Segoe UI", background: "transparent", transition: "background 0.4s ease" }}>
        <SharedHeader activePage="/contact" />
        <PageHero />
        <ContactSection />
        <Footer />
      </div>
  );
}
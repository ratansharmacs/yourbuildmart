import { Link, useNavigate, useLocation } from "react-router-dom";
import { SharedHeader, useTheme, Footer } from "../components";

export default function EnquirySuccess() {
  const { dark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { productName, email } = location.state || {};

  const bg     = dark ? "#0d0d0d" : "#f9f9f9";
  const card   = dark ? "#141414" : "#fff";
  const border = dark ? "#222" : "#ebebeb";
  const text   = dark ? "#fff" : "#111";
  const sub    = dark ? "#999" : "#666";

  return (
    <>
      <SharedHeader />
      <main style={{ background: bg, minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div style={{
          background: card, border: `1px solid ${border}`, borderRadius: 18,
          maxWidth: 560, width: "100%", padding: "52px 40px", textAlign: "center",
          boxShadow: dark ? "0 12px 50px rgba(0,0,0,0.45)" : "0 12px 50px rgba(0,0,0,0.08)",
        }}>
          <div style={{
            width: 76, height: 76, borderRadius: "50%",
            background: dark ? "rgba(4,180,134,0.12)" : "#f0faf4",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px", fontSize: 38,
          }}>
            ✅
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 900, color: text, marginBottom: 12, letterSpacing: "-0.5px" }}>
            Enquiry Submitted Successfully!
          </h1>

          <p style={{ fontSize: 15, color: sub, lineHeight: 1.7, marginBottom: 6 }}>
            {productName
              ? <>Thank you for your interest in <strong style={{ color: text }}>{productName}</strong>.</>
              : <>Thank you for reaching out to us.</>}
          </p>
          <p style={{ fontSize: 14, color: sub, lineHeight: 1.7, marginBottom: 32 }}>
            Our team will review your enquiry and get back to you{email ? <> at <strong style={{ color: text }}>{email}</strong></> : ""} shortly.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/products")}
              style={{
                background: "#e62e04", color: "#fff", border: "none",
                padding: "13px 30px", borderRadius: 9, fontSize: 14.5,
                fontWeight: 700, cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#c92600"}
              onMouseLeave={e => e.currentTarget.style.background = "#e62e04"}
            >
              Continue Shopping
            </button>

            <Link
              to="/orders"
              style={{
                background: "transparent", color: text, textDecoration: "none",
                border: `1.5px solid ${border}`, padding: "13px 30px", borderRadius: 9,
                fontSize: 14.5, fontWeight: 700, transition: "border-color 0.2s, color 0.2s",
                display: "inline-flex", alignItems: "center",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#e62e04"; e.currentTarget.style.color = "#e62e04"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = text; }}
            >
              My Enquiries
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SharedHeader, Footer, useTheme } from "../components";

export default function NotFound() {
  const { dark } = useTheme();
  const [lidOpen, setLidOpen] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [bounce, setBounce] = useState(false);

  const titleColor = dark ? "#eee" : "#111";
  const subColor   = dark ? "#888" : "#666";
  const boxColor   = dark ? "#2a2a2a" : "#f0f0f0";
  const boxBorder  = dark ? "#444" : "#ccc";
  const boxShadow  = dark ? "0 16px 48px rgba(0,0,0,0.5)" : "0 16px 48px rgba(0,0,0,0.12)";

  useEffect(() => {
    // Sequence: wait → open lid → show text → bounce
    const t1 = setTimeout(() => setLidOpen(true), 600);
    const t2 = setTimeout(() => setShowContent(true), 1200);
    const t3 = setTimeout(() => setBounce(true), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <>
      <SharedHeader activePage="" />

      <style>{`
        @keyframes floatBox {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes lidSwing {
          0%   { transform: rotateX(0deg); }
          100% { transform: rotateX(-110deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes questionFloat {
          0%, 100% { transform: translateY(0) rotate(-5deg); opacity: 0.7; }
          50%       { transform: translateY(-18px) rotate(5deg); opacity: 1; }
        }
        @keyframes questionFloat2 {
          0%, 100% { transform: translateY(0) rotate(8deg); opacity: 0.5; }
          50%       { transform: translateY(-14px) rotate(-4deg); opacity: 0.9; }
        }
        @keyframes questionFloat3 {
          0%, 100% { transform: translateY(0) rotate(-3deg); opacity: 0.6; }
          50%       { transform: translateY(-20px) rotate(6deg); opacity: 1; }
        }
        @keyframes shadowPulse {
          0%, 100% { transform: scaleX(1); opacity: 0.18; }
          50%       { transform: scaleX(0.82); opacity: 0.10; }
        }
        .notfound-box {
          animation: floatBox 3.2s ease-in-out infinite;
        }
        .notfound-lid {
          transform-origin: top center;
          animation: ${lidOpen ? "lidSwing 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none"};
        }
        .notfound-shadow {
          animation: shadowPulse 3.2s ease-in-out infinite;
        }
        .q1 { animation: questionFloat  2.4s ease-in-out 0.1s infinite; }
        .q2 { animation: questionFloat2 2.8s ease-in-out 0.5s infinite; }
        .q3 { animation: questionFloat3 2.2s ease-in-out 0.9s infinite; }
        .notfound-text {
          animation: ${showContent ? "fadeSlideUp 0.6s ease forwards" : "none"};
          opacity: ${showContent ? 1 : 0};
        }
      `}</style>

      <div style={{
        minHeight: "76vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
      }}>

        {/* ── Animated Box ── */}
        <div style={{ position: "relative", width: 180, height: 200, marginBottom: 12 }}>

          {/* Floating question marks coming out of box */}
          {lidOpen && (
            <>
              <span className="q1" style={{
                position: "absolute", top: -30, left: 30,
                fontSize: 28, fontWeight: 900, color: "#e62e04",
                userSelect: "none", pointerEvents: "none",
              }}>?</span>
              <span className="q2" style={{
                position: "absolute", top: -44, left: "50%",
                fontSize: 22, fontWeight: 900, color: dark ? "#aaa" : "#bbb",
                userSelect: "none", pointerEvents: "none",
              }}>?</span>
              <span className="q3" style={{
                position: "absolute", top: -26, right: 28,
                fontSize: 32, fontWeight: 900, color: "#e62e04",
                opacity: 0.6, userSelect: "none", pointerEvents: "none",
              }}>?</span>
            </>
          )}

          {/* Box wrapper — floats up and down */}
          <div className="notfound-box" style={{ position: "relative", width: "100%", height: "100%" }}>

            {/* ── Lid ── */}
            <div className="notfound-lid" style={{
              position: "absolute",
              top: 0, left: -6,
              width: 192, height: 44,
              background: "#e62e04",
              borderRadius: "6px 6px 0 0",
              zIndex: 10,
              boxShadow: "0 4px 14px rgba(230,46,4,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {/* Lid ribbon */}
              <div style={{
                width: 28, height: "100%",
                background: "rgba(0,0,0,0.15)",
                borderRadius: 3,
              }} />
            </div>

            {/* ── Box Body ── */}
            <div style={{
              position: "absolute",
              bottom: 0, left: 0,
              width: 180, height: 150,
              background: boxColor,
              border: `2px solid ${boxBorder}`,
              borderRadius: "0 0 10px 10px",
              boxShadow: boxShadow,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {/* Inside of box — empty */}
              <div style={{
                width: "85%", height: "70%",
                background: dark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)",
                borderRadius: 6,
                border: `1px dashed ${dark ? "#333" : "#ddd"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ fontSize: 11, color: dark ? "#555" : "#ccc", letterSpacing: "1.5px", fontWeight: 600 }}>EMPTY</span>
              </div>

              {/* Box side stripes */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 8,
                background: "linear-gradient(to bottom, #e62e04, #c42500)",
                opacity: 0.25,
              }} />
              <div style={{
                position: "absolute", right: 0, top: 0, bottom: 0, width: 8,
                background: "linear-gradient(to bottom, #e62e04, #c42500)",
                opacity: 0.25,
              }} />
            </div>
          </div>

          {/* Shadow on ground */}
          <div className="notfound-shadow" style={{
            position: "absolute",
            bottom: -12, left: "50%",
            transform: "translateX(-50%)",
            width: 140, height: 14,
            background: "radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(4px)",
          }} />
        </div>

        {/* ── Text & CTA ── */}
        <div className="notfound-text" style={{ marginTop: 32 }}>
          <h1 style={{
            fontSize: 80, fontWeight: 900, color: "#e62e04",
            margin: "0 0 4px", lineHeight: 1,
            fontFamily: "'Georgia', serif",
          }}>404</h1>

          <h2 style={{
            fontSize: 24, fontWeight: 700,
            color: titleColor, margin: "8px 0 12px",
          }}>
            Nothing here!
          </h2>

          <p style={{
            fontSize: 15, color: subColor,
            maxWidth: 380, margin: "0 auto 32px",
            lineHeight: 1.7,
          }}>
            The page you're looking for doesn't exist or has been moved. Like this box — we looked inside and found nothing.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/" style={{
              background: "#e62e04", color: "#fff",
              padding: "12px 28px", borderRadius: 8,
              textDecoration: "none", fontWeight: 700, fontSize: 14,
              boxShadow: "0 6px 20px rgba(230,46,4,0.35)",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#c42500"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              ← Back to Home
            </Link>

            <Link to="/products" style={{
              background: "transparent", color: "#e62e04",
              padding: "12px 28px", borderRadius: 8,
              textDecoration: "none", fontWeight: 700, fontSize: 14,
              border: "2px solid #e62e04",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e62e04"; }}
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

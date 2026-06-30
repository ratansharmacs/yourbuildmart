import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useTheme } from "./ThemeContext";

/**
 * BrandMark
 * ─────────
 * The four-block "assembling" animation used in the initial splash.
 */
function BrandMark({ dark, size = 88 }) {
  const accent = "#e62e04";
  return (
    <svg viewBox="0 0 88 88" width={size} height={size} style={{ display: "block" }}>
      {[
        { x: 6,  y: 6,  delay: 0    },
        { x: 46, y: 6,  delay: 0.08 },
        { x: 6,  y: 46, delay: 0.16 },
        { x: 46, y: 46, delay: 0.24 },
      ].map((b, i) => (
        <motion.rect
          key={i}
          x={b.x} y={b.y} width="36" height="36" rx="8"
          fill={i === 1 ? accent : "none"}
          stroke={i === 1 ? accent : (dark ? "rgba(250,250,249,0.35)" : "rgba(12,10,9,0.25)")}
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: [0, 1, 1, 0.55], scale: [0.4, 1.08, 1, 1] }}
          transition={{
            duration: 1.6, delay: b.delay,
            repeat: Infinity, repeatDelay: 0.4,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.4, 0.6, 1],
          }}
          style={{ transformOrigin: `${b.x + 18}px ${b.y + 18}px` }}
        />
      ))}
    </svg>
  );
}

/**
 * PageLoader
 * ──────────
 * INITIAL SPLASH only — shown briefly on first paint then immediately dismissed.
 * Per-navigation overlays are intentionally removed to eliminate the 300ms+
 * delay users were experiencing on every page change.
 */
export default function PageLoader() {
  const { dark } = useTheme();
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    // Dismiss splash quickly — just wait for React to finish its first render,
    // not for all network resources (images, fonts) which caused 3-4s delays.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minDuration = reduceMotion ? 100 : 600; // down from 1100ms

    const finish = () => {
      setTimeout(() => setSplashVisible(false), reduceMotion ? 0 : 200);
    };

    // Use a short fixed timeout rather than waiting for window.load
    const t = setTimeout(finish, minDuration);
    return () => clearTimeout(t);
  }, []);

  const bg        = dark ? "#09090b" : "#fdfbfa";
  const textColor = dark ? "#fafaf9" : "#0c0a09";
  const accent    = "#e62e04";

  return (
    <AnimatePresence>
      {splashVisible && (
        <motion.div
          key="page-loader-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: bg, gap: 24,
          }}
          aria-hidden="true"
        >
          <BrandMark dark={dark} size={88} />
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Georgia', serif", fontWeight: 800,
              fontSize: 20, letterSpacing: "1px", color: textColor,
            }}>
              Your<span style={{ color: accent }}>Build</span>Mart
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

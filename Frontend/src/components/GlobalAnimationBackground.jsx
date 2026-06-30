import { useEffect, useRef } from "react";
import { useTheme } from "./ThemeContext";

/**
 * GlobalAnimationBackground
 * ─────────────────────────
 * A FIXED full-screen canvas that runs the hero section's complete animation
 * (blobs, particles, grid, streams, hex ring, scan lines, brackets, dot field,
 * pulse rings) permanently behind every page and every section.
 *
 * Because it is fixed, it never scrolls — the animation is always visible
 * in the background as the user dives through the page, exactly like looking
 * through a window at a living backdrop.
 *
 * All sections must have transparent / semi-transparent backgrounds
 * (controlled in global.css) for this to show through.
 */
export default function GlobalAnimationBackground() {
  const { dark } = useTheme();
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const darkRef   = useRef(dark);

  useEffect(() => { darkRef.current = dark; }, [dark]);

  useEffect(() => {
    // Respect prefers-reduced-motion — don't run the perpetual canvas
    // animation at all for users who've asked for reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let W, H;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();

    // Debounce resize — avoids re-allocating the canvas backbuffer on every
    // pixel of a drag-resize, which is expensive and causes jank.
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    };
    window.addEventListener("resize", onResize, { passive: true });

    // ── particles — float upward continuously ─────────────────────────────
    const NPART = 32;
    const particles = Array.from({ length: NPART }, (_, i) => ({
      x:    Math.random() * window.innerWidth,
      y:    Math.random() * window.innerHeight,   // spread all over initially
      vx:   (Math.random() - 0.5) * 0.45,
      vy:   -(0.3 + Math.random() * 0.6),
      r:    1.5 + Math.random() * 3.5,
      alpha:  0.1 + Math.random() * 0.5,
      maxA:   0.35 + Math.random() * 0.45,
      red:    i % 3 === 0,
      drift:  (Math.random() - 0.5) * 0.014,
      speed:  0.3 + Math.random() * 0.55,
    }));

    // ── vertical data streams ──────────────────────────────────────────────
    const NSTREAM = 10;
    const streams = Array.from({ length: NSTREAM }, (_, i) => ({
      x:     (i / NSTREAM) * window.innerWidth + Math.random() * 80,
      y:     -60 - Math.random() * 300,
      len:   50 + Math.random() * 100,
      speed: 1.6 + Math.random() * 1.6,
      alpha: 0.45 + Math.random() * 0.45,
    }));

    // ── orbiting blobs (radial gradients) ─────────────────────────────────
    const blobs = [
      { cx: 0.76, cy: 0.28,  rW: 0.52, phase: 0,    spd: 0.00019, amp: 0.065 },
      { cx: 0.06, cy: 0.72,  rW: 0.44, phase: 2.1,  spd: 0.00013, amp: 0.055 },
      { cx: 0.44, cy: 0.52,  rW: 0.30, phase: 4.2,  spd: 0.00024, amp: 0.042 },
      { cx: 0.18, cy: 0.18,  rW: 0.26, phase: 1.1,  spd: 0.00017, amp: 0.048 },
      { cx: 0.88, cy: 0.78,  rW: 0.22, phase: 3.3,  spd: 0.00021, amp: 0.038 },
    ];
    const blobColors = [
      ["230,46,4",   "180,30,0"],    // red
      ["120,60,255", "80,30,200"],   // purple  (dark) / gold (light)
      ["230,46,4",   "200,80,0"],    // red-orange
      ["0,200,160",  "0,130,200"],   // teal / blue
      ["230,46,4",   "180,60,0"],    // red
    ];

    // ── grid ──────────────────────────────────────────────────────────────
    const NVLINES = 16;
    const vFracs  = Array.from({ length: NVLINES }, (_, i) => i / NVLINES);

    // ── pulse rings ───────────────────────────────────────────────────────
    const rings = [
      { fx: 0.72, fy: 0.44, r: 0,   maxR: 130, spd: 0.0065 },
      { fx: 0.72, fy: 0.44, r: 44,  maxR: 130, spd: 0.0065 },
      { fx: 0.72, fy: 0.44, r: 88,  maxR: 130, spd: 0.0065 },
    ];

    let scanT = 0;
    let t     = 0;

    // ── draw ──────────────────────────────────────────────────────────────
    const draw = () => {
      t++;
      scanT += 0.0038;

      const D = darkRef.current;
      W = canvas.width;
      H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Solid base — the canvas IS the page background
      ctx.fillStyle = D ? "#09090b" : "#f5f2ee";
      ctx.fillRect(0, 0, W, H);

      // ── Blobs ────────────────────────────────────────────────────────────
      blobs.forEach((b, bi) => {
        const ox = Math.sin(t * b.spd + b.phase) * b.amp * W;
        const oy = Math.cos(t * b.spd * 0.7 + b.phase) * b.amp * H;
        const cx = b.cx * W + ox;
        const cy = b.cy * H + oy;
        const rx = b.rW * W;
        const [dc, lc] = blobColors[bi];
        const col = D ? dc : lc;
        const alpha = bi === 0 ? (D ? 0.22 : 0.14)
                    : bi === 1 ? (D ? 0.16 : 0.12)
                    : bi === 2 ? (D ? 0.11 : 0.08)
                    : bi === 3 ? (D ? 0.09 : 0.07)
                    :            (D ? 0.10 : 0.07);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
        grad.addColorStop(0, `rgba(${col},${alpha})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, rx, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Vertical grid lines with scroll drift ────────────────────────────
      const scrollY   = window.scrollY || 0;
      const gridDrift = (scrollY * 0.055 + t * 0.2) % 62;

      vFracs.forEach((frac, i) => {
        const x     = frac * W;
        const alpha = (0.022 + (i % 3) * 0.009) * (D ? 1.9 : 1.1);
        const grad  = ctx.createLinearGradient(x, -gridDrift, x, H + 62);
        grad.addColorStop(0,   "rgba(230,46,4,0)");
        grad.addColorStop(0.5, `rgba(230,46,4,${alpha})`);
        grad.addColorStop(1,   "rgba(230,46,4,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(x, -gridDrift);
        ctx.lineTo(x, H + 62);
        ctx.stroke();
      });

      // ── Horizontal grid lines ─────────────────────────────────────────────
      for (let i = 0; i < 10; i++) {
        const y     = (i / 10) * H;
        const alpha = D ? 0.03 : 0.022;
        const grad  = ctx.createLinearGradient(0, y, W, y);
        grad.addColorStop(0,   "rgba(0,0,0,0)");
        grad.addColorStop(0.5, `rgba(${D ? "255,255,255" : "0,0,0"},${alpha})`);
        grad.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(W, y);
        ctx.stroke();
      }

      // ── Data streams ─────────────────────────────────────────────────────
      streams.forEach(s => {
        s.y += s.speed;
        if (s.y > H + 100) {
          s.y   = -80 - Math.random() * 220;
          s.x   = Math.random() * W;
          s.len = 50 + Math.random() * 100;
        }
        const a    = D ? s.alpha : s.alpha * 0.65;
        const grad = ctx.createLinearGradient(s.x, s.y, s.x, s.y + s.len);
        grad.addColorStop(0,   "rgba(230,46,4,0)");
        grad.addColorStop(0.5, `rgba(230,46,4,${a})`);
        grad.addColorStop(1,   "rgba(230,46,4,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.len);
        ctx.stroke();
      });

      // ── Particles ─────────────────────────────────────────────────────────
      particles.forEach(p => {
        p.x += p.vx + Math.sin(t * p.drift + p.x * 0.009) * 0.28;
        p.y -= p.speed;
        if (p.y < -20 || p.x < -20 || p.x > W + 20) {
          p.x     = Math.random() * W;
          p.y     = H + 10;
          p.vx    = (Math.random() - 0.5) * 0.45;
          p.alpha = 0;
        }
        // fade in from bottom, fade out at top
        const progress = 1 - p.y / H;
        const a = p.maxA * Math.sin(Math.max(0, Math.min(Math.PI, progress * Math.PI)));
        if (p.red) {
          ctx.shadowColor = "rgba(230,46,4,0.8)";
          ctx.shadowBlur  = 8;
          ctx.fillStyle   = `rgba(230,46,4,${D ? a : a * 0.75})`;
        } else {
          ctx.shadowBlur  = 0;
          ctx.fillStyle   = D
            ? `rgba(255,255,255,${a * 0.6})`
            : `rgba(100,60,20,${a * 0.5})`;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── Pulse rings ───────────────────────────────────────────────────────
      rings.forEach(ring => {
        ring.r += ring.spd * (W / 900) * 40;
        if (ring.r > ring.maxR * (W / 1000)) ring.r = 0;
        const cx    = ring.fx * W;
        const cy    = ring.fy * H;
        const ratio = ring.r / (ring.maxR * (W / 1000));
        const alpha = (1 - ratio) * (D ? 0.28 : 0.16);
        ctx.strokeStyle = `rgba(230,46,4,${alpha})`;
        ctx.lineWidth   = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
        ctx.stroke();
      });



      // ── Diagonal scan line ────────────────────────────────────────────────
      const sp  = scanT % 1;
      const sx  = (sp * 2.8 - 0.7) * W;
      const sy  = (sp * 2.8 - 0.7) * H;
      const g2  = ctx.createLinearGradient(sx - W * 0.26, sy + H * 0.26, sx + W * 0.26, sy - H * 0.26);
      const sA  = D ? 0.48 : 0.30;
      g2.addColorStop(0,   "rgba(230,46,4,0)");
      g2.addColorStop(0.5, `rgba(230,46,4,${sA})`);
      g2.addColorStop(1,   "rgba(230,46,4,0)");
      ctx.strokeStyle = g2;
      ctx.lineWidth   = 1.6;
      ctx.beginPath();
      ctx.moveTo(sx - W * 0.75, sy + H * 0.75);
      ctx.lineTo(sx + W * 0.75, sy - H * 0.75);
      ctx.stroke();

      // Second offset scan
      const sp2 = (scanT + 0.5) % 1;
      const sx2 = (sp2 * 2.8 - 0.7) * W;
      const sy2 = (sp2 * 2.8 - 0.7) * H;
      const g3  = ctx.createLinearGradient(sx2 - W * 0.22, sy2 + H * 0.22, sx2 + W * 0.22, sy2 - H * 0.22);
      g3.addColorStop(0,   "rgba(255,140,40,0)");
      g3.addColorStop(0.5, `rgba(255,140,40,${D ? 0.22 : 0.14})`);
      g3.addColorStop(1,   "rgba(255,140,40,0)");
      ctx.strokeStyle = g3;
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(sx2 - W * 0.7, sy2 + H * 0.7);
      ctx.lineTo(sx2 + W * 0.7, sy2 - H * 0.7);
      ctx.stroke();

      // ── Dot field (right side) ────────────────────────────────────────────
      const dp      = 0.42 + Math.sin(t * 0.028) * 0.28;
      const dCols   = 9, dRows = 15;
      const dStartX = W > 600 ? W - 215 : W - 130;
      const dStartY = 55;
      for (let r = 0; r < dRows; r++) {
        for (let c = 0; c < dCols; c++) {
          if (dStartX + c * 22 > W - 5) continue;
          ctx.fillStyle = D
            ? `rgba(230,46,4,${dp * 0.44})`
            : `rgba(230,46,4,${dp * 0.30})`;
          ctx.beginPath();
          ctx.arc(dStartX + c * 22, dStartY + r * 22, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Corner brackets ───────────────────────────────────────────────────
      const bA  = 0.42 + Math.sin(t * 0.033) * 0.33;
      const bA2 = 0.38 + Math.sin(t * 0.033 + Math.PI) * 0.24;
      const bSz = W < 480 ? 44 : 64;
      const bM  = W < 480 ? 18 : 28;
      // top-left
      ctx.strokeStyle = `rgba(230,46,4,${D ? bA : bA * 0.68})`;
      ctx.lineWidth   = 2.5;
      ctx.beginPath();
      ctx.moveTo(bM, bM + bSz); ctx.lineTo(bM, bM); ctx.lineTo(bM + bSz, bM);
      ctx.stroke();
      // bottom-right
      ctx.strokeStyle = `rgba(230,46,4,${D ? bA2 : bA2 * 0.65})`;
      ctx.beginPath();
      ctx.moveTo(W - bM, H - bM - bSz); ctx.lineTo(W - bM, H - bM); ctx.lineTo(W - bM - bSz, H - bM);
      ctx.stroke();
      // top-right (thinner)
      const bA3 = 0.3 + Math.sin(t * 0.033 + 1.5) * 0.2;
      ctx.strokeStyle = `rgba(230,46,4,${D ? bA3 : bA3 * 0.6})`;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(W - bM, bM); ctx.lineTo(W - bM, bM + bSz * 0.75); 
      ctx.moveTo(W - bM, bM); ctx.lineTo(W - bM - bSz * 0.75, bM);
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    // Pause the rAF loop when the tab is hidden — saves CPU/battery and
    // prevents a burst of catch-up frames when the tab becomes visible again.
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current);
      } else {
        animRef.current = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}

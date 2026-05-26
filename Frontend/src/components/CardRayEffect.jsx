import { useEffect, useRef } from "react";

/**
 * CardRayEffect
 * ─────────────
 * Renders a single <canvas> that is overlaid over the entire page (fixed).
 * It:
 *  1. Finds every element with the class  `ray-card`  on the page.
 *  2. Continuously animates an orange "ray" that travels along the edges of
 *     each card in sequence, then jumps to the next one.
 *  3. As the user scrolls, the target card sequence updates.
 *  4. Fully responsive — recomputes positions on resize/scroll.
 *
 * Usage: add className="ray-card"  to any card element you want to include.
 */
export default function CardRayEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let W, H, raf;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // ── ray state ────────────────────────────────────────────────────────────
    // progress = 0..1 around a single card's perimeter; cardIdx = which card
    let progress   = 0;
    let cardIdx    = 0;
    const SPEED    = 0.0022;   // fraction of perimeter per frame
    const RAY_LEN  = 0.22;     // fraction of perimeter the glow tail covers
    const JUMP_GAP = 0.45;     // seconds pause between cards
    let   gapTimer = 0;
    let   inGap    = false;
    let   lastT    = 0;

    // ── get sorted list of visible ray-cards ─────────────────────────────────
    const getCards = () => {
      const els = Array.from(document.querySelectorAll(".ray-card"));
      return els
        .map(el => {
          const r = el.getBoundingClientRect();
          return {
            el,
            top:    r.top    + window.scrollY,
            left:   r.left   + window.scrollX,
            right:  r.right  + window.scrollX,
            bottom: r.bottom + window.scrollY,
            w:      r.width,
            h:      r.height,
            border: parseInt(window.getComputedStyle(el).borderRadius) || 12,
          };
        })
        .filter(c => c.w > 20 && c.h > 20);
    };

    // ── perimeter point at fraction f (0..1) with rounded corners ────────────
    const perimPoint = (card, f) => {
      const { left, top, w, h, border: br } = card;
      const r = Math.min(br, w / 2, h / 2);
      // sides: top, right, bottom, left  (minus corner arcs)
      const straight  = 2 * (w + h) - 8 * r;
      const cornerArc = 2 * Math.PI * r;         // total arc around 4 corners
      const perim     = straight + cornerArc;

      let dist = f * perim;

      // Segments (clockwise from top-left corner):
      // 1) top-left arc  (quarter, 180→270)
      // 2) top straight
      // 3) top-right arc (quarter, 270→360)
      // 4) right straight
      // 5) bottom-right arc (quarter, 0→90)
      // 6) bottom straight
      // 7) bottom-left arc (quarter, 90→180)
      // 8) left straight

      const qa = (Math.PI / 2) * r; // quarter arc length

      const segs = [
        { len: qa,      type: "arc",  cx: left + r,   cy: top + r,     a0: Math.PI,       a1: 1.5 * Math.PI },
        { len: w - 2*r, type: "line", x0: left + r,   y0: top,         dx: 1, dy: 0 },
        { len: qa,      type: "arc",  cx: left+w - r, cy: top + r,     a0: 1.5*Math.PI,   a1: 2 * Math.PI },
        { len: h - 2*r, type: "line", x0: left + w,   y0: top + r,     dx: 0, dy: 1 },
        { len: qa,      type: "arc",  cx: left+w - r, cy: top+h - r,   a0: 0,             a1: 0.5*Math.PI },
        { len: w - 2*r, type: "line", x0: left+w - r, y0: top + h,     dx: -1, dy: 0 },
        { len: qa,      type: "arc",  cx: left + r,   cy: top+h - r,   a0: 0.5*Math.PI,   a1: Math.PI },
        { len: h - 2*r, type: "line", x0: left,       y0: top+h - r,   dx: 0, dy: -1 },
      ];

      for (const seg of segs) {
        if (dist <= seg.len + 0.001) {
          const t2 = Math.min(dist / Math.max(seg.len, 0.001), 1);
          if (seg.type === "line") {
            return {
              x: seg.x0 + seg.dx * dist,
              y: seg.y0 + seg.dy * dist,
            };
          } else {
            const angle = seg.a0 + (seg.a1 - seg.a0) * t2;
            return {
              x: seg.cx + Math.cos(angle) * r,
              y: seg.cy + Math.sin(angle) * r,
            };
          }
        }
        dist -= seg.len;
      }
      // fallback: top-left corner
      return { x: left, y: top };
    };

    // ── draw the ray glow on a card ──────────────────────────────────────────
    const drawRay = (card, prog, viewTop, viewH) => {
      const cx = card.left + card.w / 2 - window.scrollX;
      const cy = card.top  + card.h / 2 - window.scrollY;

      // Skip if card is completely off-screen
      if (cy + card.h / 2 < viewTop - 40 || cy - card.h / 2 > viewTop + viewH + 40) return;

      const STEPS = 60;
      for (let i = 0; i < STEPS; i++) {
        const frac  = prog - (i / STEPS) * RAY_LEN;
        const frac2 = ((frac % 1) + 1) % 1;
        const pt    = perimPoint(card, frac2);
        const px    = pt.x - window.scrollX;
        const py    = pt.y - window.scrollY;
        const t2    = 1 - i / STEPS;          // 1 at head, 0 at tail
        const alpha = t2 * t2 * 0.92;
        const radius = 3.5 + t2 * 3.5;

        // Outer glow
        ctx.shadowColor = `rgba(230,46,4,${alpha * 0.7})`;
        ctx.shadowBlur  = 16 + t2 * 12;
        ctx.fillStyle   = `rgba(255,${Math.floor(80 + t2 * 60)},20,${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Bright head dot
      const head    = perimPoint(card, prog);
      const hx      = head.x - window.scrollX;
      const hy      = head.y - window.scrollY;
      ctx.shadowColor = "rgba(255,120,20,1)";
      ctx.shadowBlur  = 28;
      ctx.fillStyle   = "#fff";
      ctx.beginPath();
      ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Very faint card border glow (just the outline, not fill)
      const r  = Math.min(card.border, card.w / 2, card.h / 2);
      const bx = card.left - window.scrollX;
      const by = card.top  - window.scrollY;
      ctx.strokeStyle = "rgba(230,46,4,0.18)";
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.roundRect(bx, by, card.w, card.h, r);
      ctx.stroke();
    };

    // ── animation loop ───────────────────────────────────────────────────────
    const draw = (timestamp) => {
      const dt    = Math.min((timestamp - lastT) / 1000, 0.05); // seconds, capped
      lastT = timestamp;

      ctx.clearRect(0, 0, W, H);

      const cards   = getCards();
      if (cards.length === 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      // wrap cardIdx
      if (cardIdx >= cards.length) cardIdx = 0;

      const viewTop = window.scrollY;
      const viewH   = window.innerHeight;

      if (inGap) {
        gapTimer += dt;
        if (gapTimer >= JUMP_GAP) {
          inGap   = false;
          gapTimer = 0;
          // Find next card that's at least partially visible or just below viewport
          let next = (cardIdx + 1) % cards.length;
          // Prefer visible cards if we've scrolled past
          const visibles = cards
            .map((c, i) => ({ i, cy: c.top + c.h / 2 }))
            .filter(c => c.cy > viewTop - 100 && c.cy < viewTop + viewH + 200);
          if (visibles.length > 0) {
            const currentPos = visibles.findIndex(c => c.i === cardIdx);
            const nextVis    = visibles[(currentPos + 1) % visibles.length];
            if (nextVis) next = nextVis.i;
          }
          cardIdx  = next;
          progress = 0;
        }
        // Still draw current card faintly during gap
        const card = cards[cardIdx];
        if (card) {
          const bx = card.left - window.scrollX;
          const by = card.top  - window.scrollY;
          const r  = Math.min(card.border, card.w / 2, card.h / 2);
          ctx.strokeStyle = "rgba(230,46,4,0.10)";
          ctx.lineWidth   = 1;
          ctx.beginPath();
          ctx.roundRect(bx, by, card.w, card.h, r);
          ctx.stroke();
        }
      } else {
        progress += SPEED;
        if (progress >= 1) {
          progress = 0.99;
          inGap    = true;
        }
        const card = cards[cardIdx];
        if (card) drawRay(card, progress, viewTop, viewH);
      }

      raf = requestAnimationFrame(draw);
    };

    // polyfill roundRect if not supported
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        this.beginPath();
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        this.closePath();
      };
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
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
        zIndex: 5,          // above background, below content
        pointerEvents: "none",
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}

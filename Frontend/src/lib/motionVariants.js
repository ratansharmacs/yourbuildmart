// ─── Centralized Framer Motion variants ────────────────────────────────────
// Reusable animation presets so individual pages/components don't redefine
// transitions inline. All easing/timing values are tuned for a "premium SaaS"
// feel (Apple / Linear / Stripe style): short, soft, GPU-friendly.
//
// IMPORTANT: only `transform` (x, y, scale) and `opacity` are animated to
// keep everything on the compositor thread (60fps, even on low-end devices).

export const EASE = [0.22, 1, 0.36, 1]; // "easeOutExpo"-ish, premium feel

// ── Page-level ──────────────────────────────────────────────────────────────
// Kept intentionally short so navigating between pages feels instant.
export const pageTransition = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.15, ease: EASE },
};

// ── Fade ─────────────────────────────────────────────────────────────────────
export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

// ── Slide up (scroll reveal) ───────────────────────────────────────────────
export const slideUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const slideUpSmall = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

// ── Scale in (cards, modals) ───────────────────────────────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE } },
};

// ── Stagger container — use with slideUp/scaleIn as children ──────────────
export const staggerContainer = (stagger = 0.08, delayChildren = 0.05) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

// ── Hover / press presets (spread onto motion.* elements) ─────────────────
export const hoverLift = {
  whileHover: { y: -4, scale: 1.015, transition: { duration: 0.2, ease: EASE } },
  whileTap: { scale: 0.985, transition: { duration: 0.1 } },
};

export const hoverScale = {
  whileHover: { scale: 1.03, transition: { duration: 0.2, ease: EASE } },
  whileTap: { scale: 0.97, transition: { duration: 0.1 } },
};

export const buttonPress = {
  whileHover: { scale: 1.02, transition: { duration: 0.15, ease: EASE } },
  whileTap: { scale: 0.96, transition: { duration: 0.1 } },
};

// ── Viewport defaults for scroll-triggered reveals ─────────────────────────
// `once: true` avoids re-triggering on scroll-up (cheaper, less distracting)
export const viewportOnce = { once: true, amount: 0.2 };

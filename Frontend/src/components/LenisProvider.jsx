import { useEffect, useRef, createContext, useContext } from "react";
import Lenis from "lenis";
import { useLocation } from "react-router-dom";

const LenisContext = createContext(null);
export const useLenis = () => useContext(LenisContext);

/**
 * LenisProvider
 * ─────────────
 * Initializes a single global Lenis instance for smooth, inertial scrolling
 * on the window/document. Inner scroll containers (admin panel, modals,
 * overflow:auto divs) are automatically detected and excluded so they use
 * native browser scroll — no more Lenis eating wheel events inside forms.
 */
export default function LenisProvider({ children }) {
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      syncTouch: false,
    });

    lenisRef.current = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Walk up the DOM from the wheel target. If we find a scrollable container
    // (overflow auto/scroll with actual overflow content) before reaching body,
    // stop the event so Lenis never sees it — the browser handles it natively.
    const handleWheel = (e) => {
      let el = e.target;
      while (el && el !== document.documentElement && el !== document.body) {
        // Explicit opt-out attribute
        if (el.hasAttribute && el.hasAttribute("data-lenis-prevent")) {
          e.stopPropagation();
          return;
        }
        // Auto-detect scrollable containers
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        if (
          (overflowY === "auto" || overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight + 2
        ) {
          e.stopPropagation();
          return;
        }
        el = el.parentElement;
      }
    };

    // Capture phase: intercept before Lenis's own listener
    window.addEventListener("wheel", handleWheel, { capture: true, passive: false });

    const handleVisibility = () => {
      if (document.hidden) lenis.stop();
      else lenis.start();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("wheel", handleWheel, { capture: true });
      document.removeEventListener("visibilitychange", handleVisibility);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reset scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}

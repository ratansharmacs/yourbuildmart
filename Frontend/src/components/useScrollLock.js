import { useEffect } from "react";
import { useLenis } from "./LenisProvider";

/**
 * useScrollLock
 * ─────────────
 * Locks page scrolling while a fixed-position overlay (modal, drawer, mobile
 * menu) is open. Without this, Lenis keeps smooth-scrolling the page behind
 * the overlay — which feels broken/un-premium on touch devices where the
 * background visibly scrolls under a fixed panel.
 *
 * - Pauses the shared Lenis instance (if present) via lenis.stop()/start().
 * - Also sets `overflow: hidden` on <body> as a fallback for environments
 *   where Lenis isn't initialized (e.g. prefers-reduced-motion).
 * - Restores both on unmount / when `locked` becomes false.
 */
export default function useScrollLock(locked) {
  const lenisRef = useLenis();

  useEffect(() => {
    if (!locked) return;

    const lenis = lenisRef?.current;
    lenis?.stop();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      lenis?.start();
      document.body.style.overflow = prevOverflow;
    };
  }, [locked, lenisRef]);
}

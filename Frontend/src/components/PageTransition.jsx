import { motion } from "framer-motion";
import { pageTransition } from "../lib/motionVariants";

/**
 * PageTransition
 * ───────────────
 * Wrap each route's top-level element with this so pages fade/slide in and
 * out instead of hard-cutting. Used together with <AnimatePresence mode="wait">
 * in App's route renderer (see RouterWithTransitions in main.jsx).
 *
 * Notes:
 *  - Only opacity + transform (y) are animated → GPU-friendly, no layout shift.
 *  - `position: relative` + `width: 100%` keeps the outgoing/incoming page
 *    from collapsing the layout while both are briefly in the DOM.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      style={{ width: "100%", position: "relative" }}
    >
      {children}
    </motion.div>
  );
}

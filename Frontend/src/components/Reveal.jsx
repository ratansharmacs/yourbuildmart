import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { slideUp, fadeIn, scaleIn, slideUpSmall, staggerContainer } from "../lib/motionVariants";

/**
 * Reveal
 * ──────
 * Drop-in wrapper that fades/slides its children into view as the user
 * scrolls to them. Use instead of hand-rolling `motion.div` + `whileInView`
 * everywhere.
 *
 * Robustness: if the IntersectionObserver-driven `whileInView` hasn't fired
 * within `safetyMs` (e.g. element is already in view on first paint but the
 * observer is slow to initialize during route/page-transition mount), we
 * force the "show" state via a timeout. This prevents content from ever
 * getting stuck invisible — the bug that caused the WhyUs section to render
 * blank until a manual refresh.
 *
 * Props:
 *  - as: "slideUp" | "slideUpSmall" | "fade" | "scale"   (default "slideUp")
 *  - delay: number (seconds) — stagger entrance manually if needed
 *  - safetyMs: ms before forcing visibility regardless of viewport (default 800)
 *  - className / style: passthrough
 *  - el: which element to render as ("div" by default)
 */
const VARIANTS = {
  slideUp,
  slideUpSmall,
  fade: fadeIn,
  scale: scaleIn,
};

export default function Reveal({
  as = "slideUp",
  delay = 0,
  safetyMs = 800,
  className,
  style,
  el = "div",
  children,
  ...rest
}) {
  const variant = VARIANTS[as] || slideUp;
  const Component = motion[el] || motion.div;
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForceShow(true), safetyMs);
    return () => clearTimeout(t);
  }, [safetyMs]);

  const animateProp = forceShow ? "show" : undefined;
  const whileInViewProp = forceShow ? undefined : "show";

  return (
    <Component
      className={className}
      style={style}
      initial="hidden"
      animate={animateProp}
      whileInView={whileInViewProp}
      viewport={{ once: true, amount: 0.05 }}
      variants={
        delay
          ? {
              hidden: variant.hidden,
              show: { ...variant.show, transition: { ...variant.show.transition, delay } },
            }
          : variant
      }
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * RevealGroup
 * ───────────
 * Wraps a list of items and staggers their entrance. Children should be
 * `motion`-aware (e.g. wrap each child in <RevealItem>) or plain elements
 * using the `item` variant manually.
 */
export function RevealGroup({ stagger = 0.08, delayChildren = 0.05, safetyMs = 800, className, style, el = "div", children, ...rest }) {
  const Component = motion[el] || motion.div;
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setForceShow(true), safetyMs);
    return () => clearTimeout(t);
  }, [safetyMs]);

  const animateProp = forceShow ? "show" : undefined;
  const whileInViewProp = forceShow ? undefined : "show";

  return (
    <Component
      className={className}
      style={style}
      initial="hidden"
      animate={animateProp}
      whileInView={whileInViewProp}
      viewport={{ once: true, amount: 0.05 }}
      variants={staggerContainer(stagger, delayChildren)}
      {...rest}
    >
      {children}
    </Component>
  );
}

/**
 * RevealItem
 * ──────────
 * Use inside <RevealGroup> for staggered children. Inherits "hidden"/"show"
 * from the parent's stagger orchestration — no own viewport trigger needed.
 */
export function RevealItem({ as = "slideUp", className, style, el = "div", children, ...rest }) {
  const variant = VARIANTS[as] || slideUp;
  const Component = motion[el] || motion.div;
  return (
    <Component className={className} style={style} variants={variant} {...rest}>
      {children}
    </Component>
  );
}

import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTheme, SharedHeader, Footer } from "./components";

// ─── DATA ────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about",           // ← internal route
    sub: [
      { label: "YourBuild Mart", href: "/about" },
      { label: "Quality Assurance", href: "/about" },
    ],
  },
  {
    label: "Products",
    href: "/products",          // ← internal route
    sub: [
      { label: "Aluminium Products", href: "/products" },
      { label: "Electrical Products", href: "/products" },
      { label: "False Ceiling", href: "/products" },
      { label: "Fire Fighting", href: "/products" },
      { label: "Industrial Valves", href: "/products" },
      { label: "PEB Structure", href: "/products" },
      { label: "TMT Steel", href: "/products" },
    ],
  },
  { label: "View By Brands", href: "/brands" },
  { label: "Blog", href: "/blog" },             // ← internal route
  { label: "Contact Us", href: "/contact" },    // ← internal route
];

const HERO_SLIDES = [
  {
    img: "https://yourbuildmart.com/public/assets/img/steel__bars.jpg",
    title: "TMT Steel",
    subtitle: "High-strength reinforced bars for modern construction",
    tag: "ISO Certified",
  },
  {
    img: "https://yourbuildmart.com/public/assets/img/peb-st.jpg",
    title: "PEB Structure",
    subtitle: "Pre-engineered buildings delivered worldwide",
    tag: "Global Delivery",
  },
  {
    img: "https://yourbuildmart.com/public/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg",
    title: "False Ceiling",
    subtitle: "Premium interior solutions for every project",
    tag: "Best Price",
  },
  {
    img: "https://yourbuildmart.com/public/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg",
    title: "Electrical Products",
    subtitle: "Certified components for industrial and residential use",
    tag: "ISI Marked",
  },
];

const WHY_US = [
  {
    icon: "🌍",
    img: "https://yourbuildmart.com/public/assets/img/shipping.jpg",
    title: "Worldwide Shipping",
    desc: "Whether you're across the street or across the globe, we ensure timely and reliable delivery to your doorstep.",
  },
  {
    icon: "🎧",
    img: "https://yourbuildmart.com/public/assets/img/customer.jpg",
    title: "24/7 Customer Support",
    desc: "Our expert customer service team is available round the clock to assist you with any questions or orders.",
  },
  {
    icon: "✅",
    img: "https://yourbuildmart.com/public/assets/img/iso-certifiaction.jpg",
    title: "ISO Certified Products",
    desc: "Every product meets the highest international quality standards, backed by ISO and ISI certifications.",
  },
  {
    icon: "⚡",
    img: "https://yourbuildmart.com/public/assets/img/express-delivery.jpg",
    title: "Timely Shipping",
    desc: "We understand project deadlines. That's why we prioritize fast and efficient shipping for every order.",
  },
  {
    icon: "💰",
    img: "https://yourbuildmart.com/public/assets/img/bestproduct.jpg",
    title: "Best Industry Price",
    desc: "Top-quality materials at the most competitive prices, ensuring the best value for your investment.",
  },
];

const CATEGORIES = [
  {
    name: "Aluminium Products",
    href: "/products?category=Aluminium+Products",
    img: "https://yourbuildmart.com/public/uploads/all/qvzksoytHBhKDMaxSxSwpVQtGlod5C0S4TlOvyCZ.png",
  },
  {
    name: "Electrical Products",
    href: "/products?category=Electrical+Products",
    img: "https://yourbuildmart.com/public/uploads/all/ylpqNpVuBFrDi40XUABTmoEqdVSVZHmXdxC04d9O.jpg",
  },
  {
    name: "False Ceiling",
    href: "/products?category=False+Ceiling",
    img: "https://yourbuildmart.com/public/uploads/all/Sel9jonaPtZyRXyMNJBGGzUnlOyws0lBNt78iaen.jpg",
  },
  {
    name: "Fire Fighting",
    href: "/products?category=Fire+Fighting",
    img: "https://yourbuildmart.com/public/uploads/all/G98hSbCqpgGs4u7l116dQRNkdnVowdyYliKEVerr.jpg",
  },
  {
    name: "Industrial Valves",
    href: "/products?category=Industrial+Valves",
    img: "https://yourbuildmart.com/public/uploads/all/uHmWHxUbUReKl6zaKd4xgJ3FX1MgxRpZNGULlmUP.jpg",
  },
  {
    name: "PEB Structure",
    href: "/products?category=PEB+Structure",
    img: "https://yourbuildmart.com/public/uploads/all/blJXzfApTXVc3364qVExp6aNwVo9dCs80CaEqfXG.jpg",
  },
];

// STATS: { end, label, suffix, duration (ms) }
const STATS = [
  { end: 300, label: "Timely Deliveries", suffix: "+", duration: 1800 },
  { end: 400, label: "Products", suffix: "+", duration: 2000 },
  { end: 500, label: "Happy Customers", suffix: "+", duration: 2200 },
  { end: 80, label: "Partner Brands", suffix: "+", duration: 1600 },
];

const TESTIMONIALS = [
  {
    name: "Jabulani M.",
    location: "Johannesburg",
    initials: "JM",
    color: "#e62e04",
    text: "We sourced pre-engineered buildings and TMT steel bars for a commercial project, and the quality was top-notch. The materials met all our requirements, and the customer service was very helpful.",
    stars: 5,
  },
  {
    name: "Ahmad A.",
    location: "Dubai",
    initials: "AA",
    color: "#1a6b3c",
    text: "We've been using YourBuildMart for various construction supplies, especially industrial valves and electrical components. Great value for money, and products are always delivered in good condition.",
    stars: 5,
  },
  {
    name: "Sarah L.",
    location: "Manchester",
    initials: "SL",
    color: "#1e4799",
    text: "Finding a supplier with a wide range of steel sections and aluminum products was a challenge until we discovered YourBuildMart. Their support team has been prompt and we're happy with quality.",
    stars: 4,
  },
  {
    name: "David R.",
    location: "Toronto",
    initials: "DR",
    color: "#7b3fa0",
    text: "We ordered galvanized iron sheets and electrical equipment. The materials were of exceptional quality. Customer service did help resolve our shipment tracking concerns promptly.",
    stars: 4,
  },
  {
    name: "Chris W.",
    location: "New York",
    initials: "CW",
    color: "#b8520a",
    text: "I've used YourBuildMart multiple times for large construction projects. Their fire-fighting equipment and false ceiling products are outstanding. International shipping was smooth.",
    stars: 5,
  },
];

const BLOGS = [
  {
    img: "https://yourbuildmart.com/public/uploads/all/oaEiFmcHGkRJizyKXL5WZMZSeqeHTu7HoNeudTJZ.jpg",
    title: "Affordable Construction Material for African and European Countries",
    category: "Logistics",
    href: "/blog",
    excerpt: "Globalisation has marked a dent on various aspects of life throughout the world, which also includes a continuing change in infrastructure and architecture across continents.",
  },
  {
    img: "https://yourbuildmart.com/public/uploads/all/ueOyzSRgkdaNabL9MoVBRGhSQcC82VdkZup4qpdb.jpg",
    title: "Cladded Valves: What You Need to Know",
    category: "Order Protection",
    href: "/blog",
    excerpt: "Milton Danny, Head of Product Management presents Cladded Valves as a cost-effective alternative to solid alloy valves for corrosive environments.",
  },
  {
    img: "https://yourbuildmart.com/public/uploads/all/NyxEjph6tvdW6iBmKI2jpOFekIrYacpg52T2Ne5S.jpg",
    title: "TMT Steel Bars: The Backbone of Modern Construction",
    category: "Industry Insights",
    href: "/blog",
    excerpt: "In the modern construction industry, strength and durability are paramount. TMT steel bars have revolutionized the sector with their ability to withstand extreme conditions over time.",
  },
];

const BRANDS = [
  "https://yourbuildmart.com/public/assets/img/abb.png",
  "https://yourbuildmart.com/public/assets/img/hindalco.png",
  "https://yourbuildmart.com/public/assets/img/jindal.png",
  "https://yourbuildmart.com/public/assets/img/jsw.png",
  "https://yourbuildmart.com/public/assets/img/gyproc.png",
  "https://yourbuildmart.com/public/assets/img/hevels.png",
  "https://yourbuildmart.com/public/assets/img/supreme.png",
  "https://yourbuildmart.com/public/assets/img/smc.png",
];

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useInterval(cb, delay) {
  const saved = useRef(cb);
  useEffect(() => { saved.current = cb; }, [cb]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function useInView(ref, threshold = 0.12, toggle = false) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (toggle) setInView(entry.isIntersecting);
        else if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold, toggle]);
  return inView;
}

// ─── ANIMATED COUNTER HOOK ────────────────────────────────────────────────────
// Counts from 0 → end over `duration` ms. Restarts on trigger change.
function useCounter(end, duration, trigger) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  const run = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * end));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  }, [end, duration]);

  // Run on trigger (scroll into view, hover, or initial load)
  useEffect(() => {
    if (trigger) run();
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [trigger, run]);

  return count;
}

// ─── THEME TOGGLE BUTTON ──────────────────────────────────────────────────────


// ─── STAR RATING ──────────────────────────────────────────────────────────────
function StarRating({ count }) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= count ? "#e62e04" : "#ddd"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────


// ─── LIVE COUNTER (re-triggers every time `trigger` flips true→false→true) ────
function LiveCounter({ end, suffix = "+", duration = 2200, trigger }) {
  const [display, setDisplay] = useState("0");
  const [counting, setCounting] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!trigger) {
      // Reset to 0 when hero leaves viewport so it re-counts on re-entry
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      setDisplay("0");
      setCounting(false);
      return;
    }
    setCounting(true);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const cur = Math.floor(eased * end);
      setDisplay(cur.toLocaleString());
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(end.toLocaleString());
        setCounting(false);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [trigger, end, duration]);

  return (
    <span className={counting ? "stat-cursor" : ""} style={{
      fontVariantNumeric: "tabular-nums",
      display: "inline-block",
      minWidth: "3.5ch",
      transition: "color 0.2s",
    }}>
      {display}{suffix}
    </span>
  );
}

// ─── TYPEWRITER HOOK ──────────────────────────────────────────────────────────
function useTypewriter(lines, typingSpeed = 68, pauseAfter = 1800, deleteSpeed = 38) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const current = lines[lineIdx];
    let timer;
    if (!deleting && charIdx < current.length) {
      timer = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      }, typingSpeed + Math.random() * 30);
    } else if (!deleting && charIdx === current.length) {
      timer = setTimeout(() => setDeleting(true), pauseAfter);
    } else if (deleting && charIdx > 0) {
      timer = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      }, deleteSpeed);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setLineIdx(l => (l + 1) % lines.length);
    }
    return () => clearTimeout(timer);
  }, [charIdx, deleting, lineIdx, lines, typingSpeed, pauseAfter, deleteSpeed]);

  return displayed;
}


function HeroSection() {
  const { dark } = useTheme();
  const [current, setCurrent] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);
  const [entered, setEntered] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef(null);
  const statsRef = useRef(null);
  const timeoutRef = useRef(null);

  // Continuously looping typewriter for the main headline
  const typewriterLines = ["Build Smarter.", "Source Better.", "Deliver Faster.", "Build the Future."];
  const typedHeading = useTypewriter(typewriterLines, 72, 2000, 42);

  const goTo = useCallback((idx) => {
    if (swipeDir) return;
    setSwipeDir("out");
    timeoutRef.current = setTimeout(() => {
      setCurrent(idx);
      setSwipeDir(null);
    }, 520);
  }, [swipeDir]);

  useInterval(() => goTo((current + 1) % HERO_SLIDES.length), 5500);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    // Trigger stats counter — re-fires every time hero enters/leaves viewport
    const observer = new IntersectionObserver(
      ([entry]) => { setStatsVisible(entry.isIntersecting); },
      { threshold: 0.1 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => {
      clearTimeout(t);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      observer.disconnect();
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  };

  // Theme tokens
  const heroBg = dark ? "#09090b" : "#f5f2ee";
  const headingColor = dark ? "#fafaf9" : "#0c0a09";
  const bodyColor = dark ? "rgba(250,250,249,0.5)" : "rgba(12,10,9,0.5)";
  const tagBg = dark ? "rgba(230,46,4,0.12)" : "rgba(230,46,4,0.08)";
  const tagBorder = dark ? "rgba(230,46,4,0.4)" : "rgba(230,46,4,0.28)";
  const divider = dark ? "rgba(250,250,249,0.1)" : "rgba(12,10,9,0.1)";
  const statNum = dark ? "#fafaf9" : "#0c0a09";
  const statLbl = dark ? "rgba(250,250,249,0.38)" : "rgba(12,10,9,0.36)";
  const btnGlass = dark ? "rgba(250,250,249,0.06)" : "rgba(12,10,9,0.05)";
  const btnGlassBd = dark ? "rgba(250,250,249,0.18)" : "rgba(12,10,9,0.16)";
  const btnGlassClr = dark ? "#fafaf9" : "#0c0a09";
  const scrollClr = dark ? "rgba(250,250,249,0.3)" : "rgba(12,10,9,0.3)";
  const gridClr = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)";
  const cardShell = dark ? "rgba(20,20,22,0.95)" : "rgba(255,255,255,0.95)";
  const cardBrd = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const cardTxt = dark ? "#fafaf9" : "#0c0a09";
  const cardSub = dark ? "rgba(250,250,249,0.5)" : "rgba(12,10,9,0.48)";

  // Parallax tilt on the card stack
  const tiltX = mousePos.y * -4;
  const tiltY = mousePos.x * 4;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background: "transparent",
        transition: "background 0.45s ease",
        display: "flex",
        alignItems: "center",
      }}
    >

      {/* ─── ALL KEYFRAMES ─── */}
      <style>{`
        @keyframes slideInLeft {
          from { opacity:0; transform:translateX(-60px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes cardSwipeOut {
          0%   { transform: rotate(var(--base-rot)) translate(0,0) scale(1); opacity:1; }
          100% { transform: rotate(calc(var(--base-rot) + 14deg)) translate(160px,-180px) scale(0.82); opacity:0; }
        }
        @keyframes cardSwipeIn {
          0%   { transform: rotate(calc(var(--base-rot) - 12deg)) translate(-140px, 160px) scale(0.82); opacity:0; }
          100% { transform: rotate(var(--base-rot)) translate(0,0) scale(1); opacity:1; }
        }
        @keyframes gridDrift {
          0%   { transform:translateY(0); }
          100% { transform:translateY(-60px); }
        }
        @keyframes blobOrbit {
          0%,100% { transform:translate(0,0) scale(1); }
          33%     { transform:translate(40px,-30px) scale(1.08); }
          66%     { transform:translate(-30px,20px) scale(0.93); }
        }
        @keyframes blobPulse {
          0%,100% { opacity:0.7; transform:scale(1); }
          50%     { opacity:1;   transform:scale(1.12); }
        }
        @keyframes scanLine {
          0%   { left:-30%; top:-30%; }
          100% { left:130%; top:130%; }
        }
        @keyframes dotPulse {
          0%,100% { opacity:0.4; }
          50%     { opacity:0.85; }
        }
        @keyframes badgeFloat {
          0%,100% { transform:translateY(0) rotate(-2deg); }
          50%     { transform:translateY(-8px) rotate(1deg); }
        }
        @keyframes tagIn {
          from { opacity:0; transform:translateY(10px) scale(0.9); }
          to   { opacity:1; transform:translateY(0)   scale(1);   }
        }
        @keyframes progressFill {
          from { width:0%; }
          to   { width:100%; }
        }
        @keyframes scrollBounce {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(6px); }
        }
        @keyframes counterPop {
          0%   { transform:scale(1); }
          30%  { transform:scale(1.08); color:#e62e04; }
          100% { transform:scale(1); }
        }
        @keyframes cursorBlink {
          0%,49% { opacity:1; }
          50%,100% { opacity:0; }
        }
        @keyframes typewriterCursor {
          0%,49% { border-right-color: #e62e04; }
          50%,100% { border-right-color: transparent; }
        }
        /* Particles float up */
        @keyframes particleFloat {
          0%   { transform:translateY(0) translateX(0) scale(1); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:0.6; }
          100% { transform:translateY(-120vh) translateX(var(--drift)) scale(0.4); opacity:0; }
        }
        /* Rotating hexagon ring */
        @keyframes hexSpin {
          0%   { transform:translate(-50%,-50%) rotate(0deg); }
          100% { transform:translate(-50%,-50%) rotate(360deg); }
        }
        /* Pulse ring expand */
        @keyframes ringPulse {
          0%   { transform:translate(-50%,-50%) scale(0.6); opacity:0.8; }
          100% { transform:translate(-50%,-50%) scale(2.2); opacity:0; }
        }
        /* Data stream lines */
        @keyframes streamDown {
          0%   { transform:translateY(-100%); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:0.5; }
          100% { transform:translateY(100vh); opacity:0; }
        }
        /* Corner bracket pulse */
        @keyframes bracketGlow {
          0%,100% { opacity:0.4; box-shadow:0 0 0 0 rgba(230,46,4,0); }
          50%     { opacity:1;   box-shadow:0 0 18px 4px rgba(230,46,4,0.35); }
        }
        /* Diagonal stripe sweep */
        @keyframes stripeSweep {
          0%   { background-position: 0% 0%; }
          100% { background-position: 200% 200%; }
        }
        .stat-counting { animation: counterPop 0.12s ease-out; }
        .stat-cursor::after {
          content: '|';
          display:inline-block;
          color:#e62e04;
          fontWeight:900;
          animation: cursorBlink 0.7s step-end infinite;
          marginLeft:1px;
        }
        .hs-t1 { animation: slideInLeft 0.85s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .hs-t2 { animation: slideInLeft 0.85s cubic-bezier(0.16,1,0.3,1) 0.32s both; }
        .hs-t3 { animation: slideInLeft 0.85s cubic-bezier(0.16,1,0.3,1) 0.48s both; }
        .hs-t4 { animation: slideInLeft 0.85s cubic-bezier(0.16,1,0.3,1) 0.63s both; }
        .hs-t5 { animation: slideInLeft 0.85s cubic-bezier(0.16,1,0.3,1) 0.77s both; }
        .hs-t6 { animation: slideInLeft 0.85s cubic-bezier(0.16,1,0.3,1) 0.90s both; }
        .card-leaving {
          animation: cardSwipeOut 0.52s cubic-bezier(0.4,0,0.2,1) forwards !important;
        }
        .card-entering {
          animation: cardSwipeIn  0.52s cubic-bezier(0.16,1,0.3,1) forwards !important;
        }
        .tw-cursor {
          display:inline-block;
          border-right: 3px solid #e62e04;
          animation: typewriterCursor 0.75s step-end infinite;
          margin-left: 2px;
          vertical-align: bottom;
        }
      `}</style>

      {/* ── LAYER 0: Rich animated background ── =====================================================================================================================================*/}

      {/* Large vivid blobs */}
      <div style={{
        position: "absolute", top: "-25%", right: "5%",
        width: 900, height: 900, borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(230,46,4,0.14) 0%, rgba(180,30,0,0.05) 45%, transparent 70%)"
          : "radial-gradient(circle, rgba(230,46,4,0.10) 0%, rgba(255,100,50,0.04) 45%, transparent 70%)",
        animation: "blobOrbit 18s ease-in-out infinite",
        pointerEvents: "none", zIndex: 0,
        filter: "blur(2px)",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", left: "0%",
        width: 700, height: 700, borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(120,60,255,0.11) 0%, rgba(80,30,200,0.04) 45%, transparent 68%)"
          : "radial-gradient(circle, rgba(255,180,60,0.11) 0%, rgba(230,120,20,0.04) 45%, transparent 68%)",
        animation: "blobOrbit 26s ease-in-out 4s infinite reverse",
        pointerEvents: "none", zIndex: 0,
        filter: "blur(3px)",
      }} />
      <div style={{
        position: "absolute", top: "25%", left: "35%",
        width: 500, height: 500, borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(230,46,4,0.12) 0%, transparent 60%)"
          : "radial-gradient(circle, rgba(230,46,4,0.09) 0%, transparent 60%)",
        animation: "blobOrbit 16s ease-in-out 8s infinite",
        pointerEvents: "none", zIndex: 0,
      }} />
      {/* Extra accent blob top-left */}
      <div style={{
        position: "absolute", top: "10%", left: "-5%",
        width: 420, height: 420, borderRadius: "50%",
        background: dark
          ? "radial-gradient(circle, rgba(0,200,160,0.09) 0%, transparent 60%)"
          : "radial-gradient(circle, rgba(0,160,230,0.08) 0%, transparent 60%)",
        animation: "blobPulse 12s ease-in-out 2s infinite",
        pointerEvents: "none", zIndex: 0,
        filter: "blur(4px)",
      }} />

      {/* Animated grid lines */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={`vl-${i}`} style={{
            position: "absolute", left: `${(i / 14) * 100}%`, top: 0, bottom: 0, width: 1,
            background: dark
              ? `linear-gradient(to bottom, transparent 0%, rgba(230,46,4,${0.04 + i % 3 * 0.015}) 50%, transparent 100%)`
              : `linear-gradient(to bottom, transparent 0%, rgba(230,46,4,${0.03 + i % 3 * 0.01}) 50%, transparent 100%)`,
            animation: `gridDrift ${10 + i * 0.5}s linear ${i * 0.25}s infinite`,
          }} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`hl-${i}`} style={{
            position: "absolute", top: `${(i / 10) * 100}%`, left: 0, right: 0, height: 1,
            background: dark
              ? "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)"
              : "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.04) 50%, transparent 100%)",
          }} />
        ))}
      </div>

      {/* Floating particles */}
      {Array.from({ length: 18 }).map((_, i) => {
        const size = 3 + (i % 4) * 2;
        const left = 5 + (i * 17) % 90;
        const delay = (i * 0.7) % 9;
        const dur = 9 + (i * 1.3) % 8;
        const drift = (-40 + (i * 13) % 80) + "px";
        const isRed = i % 3 === 0;
        return (
          <div key={`pt-${i}`} style={{
            position: "absolute", bottom: "-5%", left: `${left}%`,
            width: size, height: size, borderRadius: "50%",
            background: isRed
              ? `rgba(230,46,4,${0.5 + i % 3 * 0.15})`
              : dark
                ? `rgba(255,255,255,${0.12 + i % 4 * 0.05})`
                : `rgba(100,60,20,${0.12 + i % 4 * 0.05})`,
            "--drift": drift,
            animation: `particleFloat ${dur}s ease-in ${delay}s infinite`,
            pointerEvents: "none", zIndex: 1,
            boxShadow: isRed ? `0 0 8px rgba(230,46,4,0.7)` : "none",
          }} />
        );
      })}

      {/* Data stream lines — vertical glowing streaks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={`stream-${i}`} style={{
          position: "absolute",
          left: `${8 + (i * 16)}%`,
          top: 0,
          width: 1,
          height: `${60 + i * 12}px`,
          background: dark
            ? `linear-gradient(to bottom, transparent, rgba(230,46,4,${0.6 + i % 3 * 0.15}), transparent)`
            : `linear-gradient(to bottom, transparent, rgba(230,46,4,${0.4 + i % 3 * 0.12}), transparent)`,
          animation: `streamDown ${3.5 + i * 0.8}s ease-in-out ${i * 1.1}s infinite`,
          pointerEvents: "none", zIndex: 1,
          filter: "blur(0.5px)",
        }} />
      ))}

      {/* Pulse rings from center-right */}
      {[0, 1, 2].map(i => (
        <div key={`ring-${i}`} style={{
          position: "absolute", top: "45%", right: "32%",
          width: 180, height: 180, borderRadius: "50%",
          border: `1.5px solid rgba(230,46,4,${dark ? 0.35 : 0.22})`,
          animation: `ringPulse 3.6s ease-out ${i * 1.2}s infinite`,
          pointerEvents: "none", zIndex: 1,
        }} />
      ))}

      {/* Spinning hex ring */}
      <div style={{
        position: "absolute", top: "50%",
        right: "10%",
        width: "min(320px,70vw)",
        height: "min(320px,70vw)",
        border: `1px solid rgba(230,46,4,${dark ? 0.14 : 0.09})`,
        borderRadius: "50%",
        animation: "hexSpin 24s linear infinite",
        pointerEvents: "none", zIndex: 1,
        transform: "translate(-50%,-50%)",
      }}>
        {[0, 60, 120, 180, 240, 300].map(deg => (
          <div key={deg} style={{
            position: "absolute", top: "50%", left: "50%",
            width: 8, height: 8, borderRadius: "50%",
            background: `rgba(230,46,4,${dark ? 0.7 : 0.5})`,
            transform: `rotate(${deg}deg) translateX(155px) translate(-50%,-50%)`,
            boxShadow: `0 0 10px rgba(230,46,4,0.8)`,
          }} />
        ))}
      </div>

      {/* Diagonal scan lines (more vivid) */}
      <div style={{
        position: "absolute", width: "200%", height: 2,
        background: dark
          ? "linear-gradient(90deg, transparent, rgba(230,46,4,0.5), transparent)"
          : "linear-gradient(90deg, transparent, rgba(230,46,4,0.3), transparent)",
        transform: "rotate(35deg)", transformOrigin: "top left",
        animation: "scanLine 7s linear infinite",
        pointerEvents: "none", zIndex: 2,
        filter: "blur(1px)",
      }} />
      <div style={{
        position: "absolute", width: "200%", height: 1,
        background: dark
          ? "linear-gradient(90deg, transparent, rgba(255,180,60,0.25), transparent)"
          : "linear-gradient(90deg, transparent, rgba(255,140,40,0.18), transparent)",
        transform: "rotate(35deg)", transformOrigin: "top left",
        animation: "scanLine 7s linear 3.5s infinite",
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Dot fields */}
      <div style={{
        position: "absolute", right: "3%", top: "8%",
        right: "10%",
        width: "min(320px,70vw)",
        height: "min(320px,70vw)",
        backgroundImage: dark
          ? "radial-gradient(circle, rgba(230,46,4,0.5) 1.5px, transparent 1.5px)"
          : "radial-gradient(circle, rgba(230,46,4,0.35) 1.5px, transparent 1.5px)",
        backgroundSize: "22px 22px",
        animation: "dotPulse 3.5s ease-in-out infinite",
        pointerEvents: "none", zIndex: 1, opacity: 0.7,
      }} />
      <div style={{
        position: "absolute", left: "1%", bottom: "10%",
        width: "30vw",
        maxWidth: 140,
        height: 160,
        backgroundImage: dark
          ? "radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)"
          : "radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
        animation: "dotPulse 5s ease-in-out 1.5s infinite",
        pointerEvents: "none", zIndex: 1, opacity: 0.6,
      }} />

      {/* Glowing corner brackets */}
      <div style={{
        position: "absolute", top: 28, left: 28, width: 64, height: 64,
        borderTop: `2.5px solid rgba(230,46,4,${dark ? 0.8 : 0.55})`,
        borderLeft: `2.5px solid rgba(230,46,4,${dark ? 0.8 : 0.55})`,
        pointerEvents: "none", zIndex: 2,
        animation: "bracketGlow 2.8s ease-in-out infinite",
        borderRadius: "2px 0 0 0",
      }} />
      <div style={{
        position: "absolute", bottom: 28, right: 28, width: 64, height: 64,
        borderBottom: `2.5px solid rgba(230,46,4,${dark ? 0.6 : 0.4})`,
        borderRight: `2.5px solid rgba(230,46,4,${dark ? 0.6 : 0.4})`,
        pointerEvents: "none", zIndex: 2,
        animation: "bracketGlow 2.8s ease-in-out 1.4s infinite",
        borderRadius: "0 0 2px 0",
      }} />
      {/* Extra top-right bracket */}
      <div style={{
        position: "absolute", top: 28, right: 28, width: 48, height: 48,
        borderTop: `1.5px solid rgba(230,46,4,${dark ? 0.4 : 0.28})`,
        borderRight: `1.5px solid rgba(230,46,4,${dark ? 0.4 : 0.28})`,
        pointerEvents: "none", zIndex: 2,
        animation: "bracketGlow 3.5s ease-in-out 0.7s infinite",
      }} />

      {/* ── LAYER 1: Main two-column layout ── ==============================================================================*/}
      <style>{`
  @media (max-width: 768px) {

    .hero-layout{
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;

      width: 100% !important;
      max-width: 100% !important;

      padding: 76px 16px 32px !important;

      gap: 20px !important;

      text-align: center !important;

      overflow-x: hidden !important;
    }

    .hero-left{
      flex: unset !important;

      width: 100% !important;
      max-width: 100% !important;

      align-items: center !important;

      text-align: center !important;

      margin: 0 auto !important;
    }

    .hero-heading{
      font-size: clamp(30px, 8vw, 42px) !important;

      line-height: 1.15 !important;

      text-align: center !important;

      min-height: auto !important;

      width: 100% !important;
    }

    .hero-body{
      font-size: 14px !important;

      text-align: center !important;

      margin-bottom: 18px !important;

      max-width: 100% !important;

      width: 100% !important;
    }

    .hero-stats{
      gap: 0 !important;

      margin-bottom: 18px !important;

      padding: 12px 0 !important;

      width: 100% !important;
    }

    .hero-ctas{
      flex-wrap: wrap !important;

      justify-content: center !important;

      gap: 10px !important;
    }

    .hero-right{
      flex: unset !important;

      width: 100% !important;

      max-width: 100% !important;

      min-width: 0 !important;

      display: flex !important;

      justify-content: center !important;

      margin: 0 auto !important;
    }

    .hero-progress{
      display: none !important;
    }
  }

  @media (max-width: 400px){

    .hero-ctas{
      flex-direction: column !important;

      align-items: center !important;
    }

    .hero-ctas a{
      width: 100% !important;

      max-width: 260px !important;

      justify-content: center !important;
    }
  }
`}</style>
      <div className="hero-layout" style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: 1280,
        margin: "0 auto",
        padding: "clamp(88px,8vw,120px) clamp(14px,4vw,40px) clamp(32px,4vw,70px)",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        overflow: "hidden",
        gap: "clamp(20px,4vw,40px)",
        minHeight: "auto",
      }}>

        {/* ═══ LEFT: Text content ═══ */}
        <div className="hero-left" style={{ flex: "0 0 clamp(280px,42vw,420px)", minWidth: 0, display: "flex", flexDirection: "column" }}>

          {/* Tag pill */}
          <div className={entered ? "hs-t1" : ""} style={{
            opacity: entered ? undefined : 0,
            display: "inline-flex", alignItems: "center", gap: 8,
            background: tagBg, border: `1px solid ${tagBorder}`,
            borderRadius: 40, padding: "5px 16px", marginBottom: 16,
            width: "fit-content",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e62e04", display: "inline-block", boxShadow: "0 0 8px rgba(230,46,4,0.9)", animation: "dotPulse 1.8s ease-in-out infinite" }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#e62e04", letterSpacing: "2.5px", textTransform: "uppercase" }}>ISO Certified · Worldwide Delivery</span>
          </div>

          {/* Typewriter heading */}
          <div className={entered ? "hs-t2" : ""} style={{ opacity: entered ? undefined : 0, marginBottom: 22 }}>
            <h1 className="hero-heading" style={{
              fontSize: "clamp(44px,4.8vw,72px)",
              fontWeight: 900,
              lineHeight: 1.06,
              fontFamily: "'Georgia','Times New Roman',serif",
              letterSpacing: "-2.5px",
              margin: 0,
              background: "linear-gradient(120deg,#e62e04 0%,#ff6630 60%,#c42500 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              minHeight: "3.2em",
            }}>
              {typedHeading}<span className="tw-cursor" style={{ WebkitTextFillColor: "#e62e04" }} />
            </h1>
          </div>

          {/* Divider accent */}
          <div className={entered ? "hs-t3" : ""} style={{
            opacity: entered ? undefined : 0,
            width: 56, height: 3, borderRadius: 2,
            background: "linear-gradient(90deg,#e62e04,transparent)",
            marginBottom: 22,
          }} />

          <p className={`${entered ? "hs-t4" : ""} hero-body`} style={{
            opacity: entered ? undefined : 0,
            fontSize: 15.5, color: bodyColor, lineHeight: 1.85,
            marginBottom: 36, maxWidth: 360, transition: "color 0.4s",
          }}>
            One platform for all your construction materials — TMT Steel, PEB Structures, Electrical, Aluminium &amp; more. Delivered worldwide.
          </p>

          {/* Stats row — live counting every visit */}
          <div
            ref={statsRef}
            className={`${entered ? "hs-t4" : ""} hero-stats`}
            style={{
              opacity: entered ? undefined : 0,
              display: "flex", gap: 0, marginBottom: 38,
              borderTop: `1px solid ${divider}`, borderBottom: `1px solid ${divider}`,
              padding: "18px 0", transition: "border-color 0.4s",
            }}
          >
            {[
              { end: 400, suffix: "+", label: "Products", duration: 1800 },
              { end: 500, suffix: "+", label: "Customers", duration: 2200 },
              { end: 80, suffix: "+", label: "Brands", duration: 1500 },
            ].map(({ end, suffix, label, duration }, i) => (
              <div key={label} style={{
                flex: 1, paddingLeft: i > 0 ? 20 : 0,
                borderLeft: i > 0 ? `1px solid ${divider}` : "none",
              }}>
                <div style={{
                  fontSize: 28, fontWeight: 900, color: statNum,
                  letterSpacing: "-1.5px", transition: "color 0.4s",
                  fontVariantNumeric: "tabular-nums",
                  fontFamily: "'Georgia','Times New Roman',serif",
                  textShadow: dark
                    ? "0 0 20px rgba(230,46,4,0.4)"
                    : "0 2px 8px rgba(230,46,4,0.2)",
                }}>
                  <LiveCounter
                    end={end}
                    suffix={suffix}
                    duration={duration}
                    trigger={statsVisible && entered}
                    color={statNum}
                  />
                </div>
                <div style={{
                  fontSize: 9.5, color: statLbl, fontWeight: 700,
                  letterSpacing: "1.5px", textTransform: "uppercase",
                  marginTop: 4, transition: "color 0.4s",
                }}>{label}</div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className={`${entered ? "hs-t5" : ""} hero-ctas`} style={{
            opacity: entered ? undefined : 0,
            display: "flex", gap: 12,
          }}>
            <Link to="/products" style={{
              background: "#e62e04", color: "#fff", padding: "13px 26px",
              borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none",
              boxShadow: "0 8px 28px rgba(230,46,4,0.38)",
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 16px 36px rgba(230,46,4,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(230,46,4,0.38)"; }}
            >
              Explore Products
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link to="/contact" style={{
              background: btnGlass, border: `1.5px solid ${btnGlassBd}`,
              color: btnGlassClr, padding: "13px 24px",
              borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none",
              backdropFilter: "blur(12px)", transition: "background 0.2s, color 0.4s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(250,250,249,0.12)" : "rgba(12,10,9,0.09)"}
              onMouseLeave={e => e.currentTarget.style.background = btnGlass}
            >Get a Quote →</Link>
          </div>

          {/* Progress indicator */}
          <div className={`${entered ? "hs-t6" : ""} hero-progress`} style={{
            opacity: entered ? undefined : 0,
            marginTop: 36, display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ flex: 1, height: 2, borderRadius: 2, background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", overflow: "hidden" }}>
              <div key={current} style={{
                height: "100%", borderRadius: 2, background: "#e62e04",
                animation: "progressFill 5.5s linear both",
              }} />
            </div>
            <span style={{ fontSize: 11, color: statLbl, fontWeight: 600, letterSpacing: "1px", whiteSpace: "nowrap" }}>
              {String(current + 1).padStart(2, "0")} / {String(HERO_SLIDES.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* ═══ RIGHT: Horizontal Carousel ═══ */}
        <div className="hero-right" style={{
          flex: 1, minWidth: "clamp(280px,45vw,540px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          {/* Carousel viewport */}
          <div style={{
            width: "100%",
            borderRadius: 24,
            overflow: "hidden",
            position: "relative",
            boxShadow: dark
              ? "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)"
              : "0 40px 100px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05)",
            background: cardShell,
            border: `1px solid ${cardBrd}`,
            backdropFilter: "blur(20px)",
          }}>
            {/* Slides wrapper */}
            <div style={{
              display: "flex",
              transform: `translateX(-${current * 100}%)`,
              transition: swipeDir ? "none" : "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
              willChange: "transform",
            }}>
              {HERO_SLIDES.map((slide, i) => (
                <div key={i} style={{ flexShrink: 0, width: "100%" }}>
                  {/* Card image */}
                  <div style={{ position: "relative", height: "clamp(220px,28vw,360px)", overflow: "hidden" }}>
                    <img src={slide.img} alt={slide.title}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover", display: "block",
                        transform: i === current ? `scale(1.06) translate(${mousePos.x * -2}px,${mousePos.y * -2}px)` : "scale(1.06)",
                        transition: "transform 0.6s ease",
                      }}
                    />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.10) 55%, transparent 100%)",
                    }} />
                    {/* Tag badge */}
                    <div style={{
                      position: "absolute", top: 14, left: 14,
                      background: "#e62e04", color: "#fff",
                      fontSize: 9, fontWeight: 800, letterSpacing: "2px",
                      textTransform: "uppercase", padding: "5px 12px", borderRadius: 6,
                      boxShadow: "0 4px 14px rgba(230,46,4,0.6)",
                    }}>{slide.tag}</div>
                    {/* Title over image */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 20px 14px" }}>
                      <h3 style={{
                        color: "#fff", fontSize: "clamp(18px,2.2vw,24px)", fontWeight: 800,
                        fontFamily: "'Georgia',serif", marginBottom: 0, letterSpacing: "-0.5px",
                      }}>{slide.title}</h3>
                    </div>
                  </div>
                  {/* Card body */}
                  <div style={{ padding: "16px 20px 20px" }}>
                    <p style={{
                      color: cardSub, fontSize: 14, lineHeight: 1.65, marginBottom: 14,
                      transition: "color 0.4s",
                    }}>{slide.subtitle}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Link to="/products" style={{
                        background: "#e62e04", color: "#fff", padding: "8px 16px",
                        borderRadius: 8, fontWeight: 700, fontSize: 13,
                        textDecoration: "none", transition: "background 0.2s",
                        display: "flex", alignItems: "center", gap: 6,
                        boxShadow: "0 4px 14px rgba(230,46,4,0.4)",
                      }}>
                        Shop Now
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </Link>
                      {/* Dots */}
                      <div style={{ display: "flex", gap: 5 }}>
                        {HERO_SLIDES.map((_, j) => (
                          <button key={j} onClick={e => { e.stopPropagation(); goTo(j); }} style={{
                            width: j === current ? 20 : 7, height: 7, borderRadius: 4,
                            border: "none", padding: 0, cursor: "pointer",
                            background: j === current ? "#e62e04" : (dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)"),
                            transition: "all 0.3s ease",
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Left / Right nav arrows */}
            <button onClick={() => goTo((current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
              style={{
                position: "absolute", left: 10, top: "40%", transform: "translateY(-50%)",
                width: 34, height: 34, borderRadius: "50%",
                background: dark ? "rgba(30,30,32,0.85)" : "rgba(255,255,255,0.85)",
                border: `1px solid ${cardBrd}`, backdropFilter: "blur(8px)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#e62e04"}
              onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(30,30,32,0.85)" : "rgba(255,255,255,0.85)"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dark ? "#fff" : "#333"} strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button onClick={() => goTo((current + 1) % HERO_SLIDES.length)}
              style={{
                position: "absolute", right: 10, top: "40%", transform: "translateY(-50%)",
                width: 34, height: 34, borderRadius: "50%",
                background: dark ? "rgba(30,30,32,0.85)" : "rgba(255,255,255,0.85)",
                border: `1px solid ${cardBrd}`, backdropFilter: "blur(8px)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#e62e04"}
              onMouseLeave={e => e.currentTarget.style.background = dark ? "rgba(30,30,32,0.85)" : "rgba(255,255,255,0.85)"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dark ? "#fff" : "#333"} strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{
        position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
        zIndex: 30, color: scrollClr, fontSize: 11, letterSpacing: "1.5px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        pointerEvents: "none",
        opacity: entered ? 1 : 0, transition: "opacity 0.6s ease 1.2s",
        fontFamily: "'Georgia','Times New Roman',serif",
      }}>
        <span>Here's how we do it</span>
        <svg style={{ animation: "scrollBounce 1.8s ease-in-out infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
        </svg>
      </div>
    </section>
  );
}

// ─── WHY US ───────────────────────────────────────────────────────────────────
function WhyUs() {
  const { dark } = useTheme();
  const bg = dark ? "#0f0f0f" : "#f8f8f6";
  const cardBg = dark ? "#1a1a1a" : "#fff";
  const titleColor = dark ? "#eee" : "#111";
  const descColor = dark ? "#999" : "#666";
  const cardShadow = dark ? "0 2px 16px rgba(0,0,0,0.4)" : "0 2px 16px rgba(0,0,0,0.07)";
  const hoverShadow = dark ? "0 12px 32px rgba(230,46,4,0.2)" : "0 12px 32px rgba(230,46,4,0.15)";

  return (
    <section className="why-us-section" style={{ padding: "72px 0", background: "transparent", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div className="why-us-header" style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: "#e62e04", fontWeight: 700, letterSpacing: "2px", fontSize: 13, textTransform: "uppercase", marginBottom: 12 }}>Our Promise</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: titleColor, fontFamily: "'Georgia', serif", marginBottom: 16, transition: "color 0.4s" }}>Why YourBuildMart?</h2>
          <p style={{ color: descColor, fontSize: 17, maxWidth: 580, margin: "0 auto", lineHeight: 1.7, transition: "color 0.4s" }}>
            Committed to providing the best building materials and home improvement products, no matter where you are in the world.
          </p>
        </div>
        <div className="why-us-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
          {WHY_US.map((item, i) => (
            <div key={i} className="ray-card" style={{ background: cardBg, borderRadius: 12, overflow: "hidden", boxShadow: cardShadow, transition: "transform 0.25s, box-shadow 0.25s, background 0.4s", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = hoverShadow; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = cardShadow; }}
            >
              <div className="why-us-card-img" style={{ height: "clamp(100px,14vw,160px)", overflow: "hidden", position: "relative" }}>
                <img src={item.img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                <div style={{ position: "absolute", bottom: 10, left: 10, background: "#e62e04", borderRadius: 6, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{item.icon}</div>
              </div>
              <div className="why-us-card-body" style={{ padding: "14px 14px 18px" }}>
                <h3 className="why-us-card-title" style={{ fontSize: "clamp(13px,1.5vw,16px)", fontWeight: 700, color: titleColor, marginBottom: 6, transition: "color 0.4s" }}>{item.title}</h3>
                <p className="why-us-card-desc" style={{ fontSize: "clamp(12px,1.3vw,14px)", color: descColor, lineHeight: 1.6, transition: "color 0.4s" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link to="/about" style={{
            display: "inline-flex", alignItems: "center", gap: 8, color: "#e62e04", fontWeight: 700,
            fontSize: 15, textDecoration: "none", border: "2px solid #e62e04", padding: "12px 28px", borderRadius: 6, transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#e62e04"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e62e04"; }}
          >Learn More About Our Services →</Link>
        </div>
      </div>
    </section>
  );
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
function CatCard({ cat, index, isActive, onCardClick, didDragRef, dark }) {
  const [hovered, setHovered] = useState(false);
  const [mouseLocal, setMouseLocal] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMouseLocal({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleClick = (e) => {
    if (didDragRef.current) {
      e.preventDefault();
      return;
    }
    onCardClick(index);
  };

  return (
    <a
      ref={cardRef}
      href={cat.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
      draggable={false}
      style={{
        display: "block",
        flexShrink: 0,
        width: "clamp(240px, 28vw, 340px)",
        height: "clamp(300px, 38vw, 420px)",
        borderRadius: 22,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        textDecoration: "none",
        transform: isActive ? (hovered ? "scale(1.03)" : "scale(1)") : "scale(0.92)",
        opacity: isActive ? 1 : dark ? 0.55 : 0.65,
        transition: "all 0.4s ease",
        boxShadow: hovered
          ? "0 25px 60px rgba(0,0,0,0.35)"
          : "0 10px 30px rgba(0,0,0,0.18)",
      }}
    >
      {/* IMAGE */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${cat.img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: hovered ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.6s ease",
        }}
      />

      {/* OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2), transparent)",
        }}
      />

      {/* INDEX */}
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          fontSize: 11,
          fontWeight: 700,
          color: "#fff",
          opacity: isActive ? 1 : 0,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* CONTENT */}
      <div
        style={{
          position: "absolute",
          bottom: 18,
          left: 18,
          right: 18,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
          }}
        >
          {cat.name}
        </p>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: hovered ? 1 : 0.7,
            transition: "all 0.3s ease",
          }}
        >
          <span
            style={{
              fontSize: 11,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            Explore Products
          </span>

          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            style={{
              transform: hovered ? "translateX(6px)" : "translateX(0)",
              transition: "transform 0.3s ease",
            }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}

function ArrowButton({ direction, disabled, onClick, arrowBg, arrowBorder, arrowIcon, dark }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        border: `1px solid ${arrowBorder}`,
        background: hovered && !disabled ? "#e62e04" : arrowBg,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        transform: hovered && !disabled ? "scale(1.1)" : "scale(1)",
        opacity: disabled ? 0.3 : 1,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={hovered && !disabled ? "#e62e04" : arrowIcon}
        strokeWidth="2.2"
        style={{
          transform: direction === "left" ? "none" : "rotate(180deg)",
        }}
      >
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
    </button>
  );
}

function Categories() {
  const { dark } = useTheme();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const [activeIdx, setActiveIdx] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const didDrag = useRef(false);

  const scrollTo = useCallback((dir) => {
    const el = trackRef.current;
    if (!el) return;
    setActiveIdx(prev => {
      const newIdx = dir === "left"
        ? Math.max(0, prev - 1)
        : Math.min(CATEGORIES.length - 1, prev + 1);
      const card = el.children[newIdx];
      if (card) {
        el.scrollTo({
          left: card.offsetLeft - el.clientWidth / 2 + card.offsetWidth / 2,
          behavior: "smooth",
        });
      }
      return newIdx;
    });
  }, []);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const center = el.scrollLeft + el.clientWidth / 2;

    let closest = 0;
    let minDist = Infinity;

    Array.from(el.children).forEach((card, i) => {
      const dist = Math.abs(
        card.offsetLeft + card.offsetWidth / 2 - center
      );
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActiveIdx(closest);
    setCanScrollLeft(closest > 0);
    setCanScrollRight(closest < CATEGORIES.length - 1);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    el.addEventListener("scroll", onScroll);
    onScroll();

    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const scrollToCard = (idx) => {
    const el = trackRef.current;
    if (!el || !el.children[idx]) return;

    const card = el.children[idx];
    el.scrollTo({
      left: card.offsetLeft - el.clientWidth / 2 + card.offsetWidth / 2,
      behavior: "smooth",
    });

    setActiveIdx(idx);
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        padding: "110px 0 120px",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      {/* ================= ORIGINAL HEADER (UNCHANGED) ================= */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 clamp(24px, 5vw, 64px)",
          marginBottom: 60,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 40, height: 1.5, background: "linear-gradient(90deg,#e62e04,#ff7f5e)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3.5px", color: "#e62e04" }}>
                Product Range
              </span>
            </div>

            <h2 style={{ fontSize: 48, fontWeight: 900, color: dark ? "#fff" : "#111" }}>
              Shop Our Bestselling<br />
              <span style={{ color: "#e62e04" }}>Product Categories</span>
            </h2>

            <p style={{ color: dark ? "rgba(255,255,255,0.5)" : "#666" }}>
              From structural steel to precision valves — everything your project demands.
            </p>
          </div>
        </div>
      </div>

      {/* ================= TRACK ================= */}
      <div
        ref={trackRef}
        className="cat-track"
        style={{
          display: "flex",
          gap: 24,
          overflowX: "auto",
          padding: "40px 120px 6px",
          scrollSnapType: "x mandatory",
          cursor: "grab",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {CATEGORIES.map((cat, i) => (
          <div key={i} style={{ scrollSnapAlign: "center" }}>
            <CatCard
              cat={cat}
              index={i}
              isActive={i === activeIdx}
              onCardClick={scrollToCard}
              didDragRef={didDrag}
              dark={dark}
            />
          </div>
        ))}
      </div>

      {/* ================= ARROWS (NO GAP + ORANGE) ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 14,
          marginTop: 2, // 🔥 tight spacing
        }}
      >
        <ArrowButton
          direction="left"
          disabled={!canScrollLeft}
          onClick={() => scrollTo("left")}
          arrowBg={dark ? "#111" : "#eee"}
          arrowBorder="rgba(230,46,4,0.4)"
          arrowIcon="#e62e04"
          dark={dark}
        />

        <ArrowButton
          direction="right"
          disabled={!canScrollRight}
          onClick={() => scrollTo("right")}
          arrowBg={dark ? "#111" : "#eee"}
          arrowBorder="rgba(230,46,4,0.4)"
          arrowIcon="#e62e04"
          dark={dark}
        />
      </div>
    </section>
  );
}
// ─── STATS ────────────────────────────────────────────────────────────────────
// Individual animated stat card
function StatCard({ stat, dark, globalTrigger }) {
  const cardRef = useRef(null);
  const inView = useInView(cardRef, 0.3);
  const [hovered, setHovered] = useState(false);

  // Trigger counter when: inView OR hovered OR globalTrigger (page load after 800ms)
  const trigger = inView || hovered || globalTrigger;
  // Re-run on hover each time
  const [runId, setRunId] = useState(0);
  const prevHovered = useRef(false);
  useEffect(() => {
    if (hovered && !prevHovered.current) setRunId(id => id + 1);
    prevHovered.current = hovered;
  }, [hovered]);

  const count = useCounter(stat.end, stat.duration, trigger || runId > 0);

  // Theme colours
  const numberColor = dark ? "#e62e04" : "#e62e04";
  const labelColor = dark ? "rgba(255,255,255,0.65)" : "rgba(30,30,30,0.7)";
  const cardBg = dark
    ? "linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))"
    : "linear-gradient(135deg,rgba(230,46,4,0.06),rgba(230,46,4,0.02))";
  const borderColor = dark ? "rgba(255,255,255,0.08)" : "rgba(230,46,4,0.15)";
  const glowColor = dark ? "rgba(230,46,4,0.25)" : "rgba(230,46,4,0.12)";

  return (
    <div
      ref={cardRef}
      className="ray-card stat-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: "center",
        padding: "36px 24px",
        borderRadius: 16,
        background: cardBg,
        border: `1px solid ${borderColor}`,
        backdropFilter: "blur(12px)",
        boxShadow: hovered
          ? `0 20px 48px ${glowColor}, 0 0 0 1px rgba(230,46,4,0.2)`
          : `0 4px 24px ${glowColor}`,
        transform: hovered ? "translateY(-6px) scale(1.03)" : "translateY(0) scale(1)",
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top accent line */}
      <div style={{
        position: "absolute", top: 0, left: "20%", right: "20%", height: 2,
        background: "linear-gradient(90deg, transparent, #e62e04, transparent)",
        borderRadius: "0 0 4px 4px",
        opacity: hovered ? 1 : 0.4,
        transition: "opacity 0.4s",
      }} />

      <div className="stat-number" style={{
        fontSize: "clamp(40px, 5vw, 60px)",
        fontWeight: 900,
        color: numberColor,
        lineHeight: 1,
        marginBottom: 10,
        fontFamily: "'Georgia', serif",
        letterSpacing: "-1px",
        animation: hovered ? "countPop 0.4s ease" : "none",
        transition: "color 0.4s",
      }}>
        {count}{stat.suffix}
      </div>

      <p className="stat-label" style={{
        color: labelColor,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        margin: 0,
        transition: "color 0.4s",
      }}>
        {stat.label}
      </p>
    </div>
  );
}

function Stats() {
  const { dark } = useTheme();
  const sectionRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // Trigger all counters on page load after a short delay
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(t);
  }, []);

  // Theme-aware section background
  const sectionBg = dark
    ? "linear-gradient(135deg, #111 0%, #1c1c1c 100%)"
    : "linear-gradient(135deg, #fff5f3 0%, #fff 40%, #fff8f6 100%)";

  const topBarBg = "linear-gradient(90deg, #e62e04, #ff6b3d, #e62e04)";
  const headingColor = dark ? "#fff" : "#111";
  const subColor = dark ? "rgba(255,255,255,0.45)" : "rgba(30,30,30,0.55)";

  return (
    <section
      ref={sectionRef}
      className="stats-section"
      style={{
        background: "transparent",
        padding: "clamp(40px,6vw,80px) 0",
        position: "relative",
        overflow: "hidden",
        transition: "background 0.4s",
      }}
    >
      {/* Top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: topBarBg }} />

      {/* Decorative background blobs */}
      {!dark && (
        <>
          <div style={{ position: "absolute", top: "-30%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(230,46,4,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-20%", left: "-5%", width: 350, height: 350, borderRadius: "50%", background: "rgba(230,46,4,0.04)", filter: "blur(60px)", pointerEvents: "none" }} />
        </>
      )}
      {dark && (
        <>
          <div style={{ position: "absolute", top: "-40%", right: "10%", width: 500, height: 500, borderRadius: "50%", background: "rgba(230,46,4,0.08)", filter: "blur(100px)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-30%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(230,46,4,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />
        </>
      )}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)", position: "relative", zIndex: 1 }}>
        {/* Section heading */}
        <div className="stats-section-header" style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: "#e62e04", fontWeight: 700, letterSpacing: "2.5px", fontSize: 12, textTransform: "uppercase", marginBottom: 10 }}>
            By The Numbers
          </p>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, color: headingColor, fontFamily: "'Georgia', serif", marginBottom: 12, transition: "color 0.4s" }}>
            YourBuildMart at a Glance
          </h2>
          <p style={{ color: subColor, fontSize: 16, maxWidth: 480, margin: "0 auto", lineHeight: 1.65, transition: "color 0.4s" }}>
            Trusted by builders and developers across Africa, Europe and beyond.
          </p>
        </div>

        {/* Stat cards grid */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
          {STATS.map((s, i) => (
            <StatCard key={i} stat={s} dark={dark} globalTrigger={loaded} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BRANDS ───────────────────────────────────────────────────────────────────
function Brands() {
  const { dark } = useTheme();
  const bg = dark ? "#0f0f0f" : "#f8f8f6";
  const titleColor = dark ? "#eee" : "#111";

  return (
    <section style={{ padding: "72px 0", background: "transparent", overflow: "hidden", transition: "background 0.4s" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)", textAlign: "center", marginBottom: 40 }}>
        <p style={{ color: "#e62e04", fontWeight: 700, letterSpacing: "2px", fontSize: 13, textTransform: "uppercase", marginBottom: 10 }}>Trusted Partners</p>
        <h2 style={{ fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 800, color: titleColor, fontFamily: "'Georgia', serif", transition: "color 0.4s" }}>Our Brand Partners</h2>
      </div>
      <div style={{ overflow: "hidden", position: "relative" }}>
        <div style={{ display: "flex", gap: 60, alignItems: "center", animation: "marquee 20s linear infinite", width: "max-content" }}>
          {[...BRANDS, ...BRANDS, ...BRANDS].map((src, i) => (
            <img key={i} src={src} alt="brand" style={{
              height: 40, objectFit: "contain",
              filter: dark ? "grayscale(100%) invert(1)" : "grayscale(100%)",
              opacity: 0.55, transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.filter = "grayscale(0%)"; e.target.style.opacity = 1; }}
              onMouseLeave={e => { e.target.style.filter = dark ? "grayscale(100%) invert(1)" : "grayscale(100%)"; e.target.style.opacity = 0.55; }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── AGENT PROGRAM ────────────────────────────────────────────────────────────
function AgentProgram() {
  const { dark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "", shop: "", address: "" });

  const bg = dark ? "#111" : "#fff";
  const titleColor = dark ? "#eee" : "#111";
  const bodyColor = dark ? "#aaa" : "#555";
  const featureColor = dark ? "#bbb" : "#444";
  const modalBg = dark ? "#1a1a1a" : "#fff";
  const inputBorder = dark ? "#333" : "#e0e0e0";
  const labelColor = dark ? "#bbb" : "#333";
  const inputBg = dark ? "#222" : "#fff";
  const inputColor = dark ? "#eee" : "#333";

  return (
    <section className="agent-section" style={{ padding: "72px 0", background: "transparent", transition: "background 0.4s" }}>
      <style>{`
        @media (max-width: 768px) {
          .agent-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .agent-img-wrap { order: 1 !important; }
          .agent-text-wrap { order: 2 !important; }
          .agent-img { height: 200px !important; }
          .agent-btn-wrap { display: flex !important; justify-content: flex-start !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(16px,4vw,48px)" }}>
        <div className="agent-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(32px,5vw,80px)", alignItems: "center" }}>
          <div className="agent-text-wrap">
            <p style={{ color: "#e62e04", fontWeight: 700, letterSpacing: "2px", fontSize: 13, textTransform: "uppercase", marginBottom: 14 }}>Join the Network</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: titleColor, fontFamily: "'Georgia', serif", marginBottom: 20, lineHeight: 1.2, transition: "color 0.4s" }}>Agent Program</h2>
            <p style={{ fontSize: 17, color: bodyColor, lineHeight: 1.8, marginBottom: 32, transition: "color 0.4s" }}>
              Register yourself as an agent and get <strong style={{ color: "#e62e04" }}>up to 3% cash back</strong> directly in your account on every order placed, plus exclusive benefits and priority support.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 36 }}>
              {["Up to 3% cashback on every order", "Priority order handling", "Dedicated account manager", "Access to exclusive bulk pricing"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#e62e04", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="10" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                  <span style={{ fontSize: 15, color: featureColor, transition: "color 0.4s" }}>{f}</span>
                </div>
              ))}
            </div>
            <div className="agent-btn-wrap">
              <button className="agent-btn" onClick={() => setShowModal(true)}
                style={{ background: "#e62e04", color: "#fff", border: "none", padding: "15px 36px", borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: "pointer", transition: "background 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={e => e.target.style.background = "#c42500"}
                onMouseLeave={e => e.target.style.background = "#e62e04"}
              >Register as Agent →</button>
            </div>
          </div>
          <div className="agent-img-wrap" style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: "100%", height: "100%", background: "linear-gradient(135deg, #e62e04 0%, #ff6b3d 100%)", borderRadius: 16, opacity: 0.1, zIndex: 0 }} />
            <img className="agent-img" src="https://yourbuildmart.com/public/assets/img/register-your.jpg" alt="Agent Program" style={{ width: "100%", borderRadius: 14, objectFit: "cover", height: 400, position: "relative", zIndex: 1, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }} />
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowModal(false)}>
          <div style={{ background: modalBg, borderRadius: 14, padding: "40px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", transition: "background 0.4s" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: titleColor, margin: 0 }}>Register as Agent</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { label: "First Name", key: "firstName", type: "text", placeholder: "John" },
                { label: "Last Name", key: "lastName", type: "text", placeholder: "Doe" },
                { label: "Email Address", key: "email", type: "email", placeholder: "john@example.com" },
                { label: "Phone Number", key: "phone", type: "tel", placeholder: "+1 234 567 8900" },
                { label: "Password", key: "password", type: "password", placeholder: "Create password" },
                { label: "Confirm Password", key: "confirmPassword", type: "password", placeholder: "Repeat password" },
              ].map((field) => (
                <div key={field.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: labelColor }}>{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder} value={formData[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    style={{ border: `1.5px solid ${inputBorder}`, borderRadius: 6, padding: "10px 12px", fontSize: 14, outline: "none", background: inputBg, color: inputColor, transition: "border-color 0.2s, background 0.4s" }}
                    onFocus={e => e.target.style.borderColor = "#e62e04"}
                    onBlur={e => e.target.style.borderColor = inputBorder}
                  />
                </div>
              ))}
              {[{ label: "Shop Name", key: "shop", placeholder: "Your Business Name" }, { label: "Address", key: "address", placeholder: "Your Address" }].map((field) => (
                <div key={field.key} style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: labelColor }}>{field.label}</label>
                  <input type="text" placeholder={field.placeholder} value={formData[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    style={{ border: `1.5px solid ${inputBorder}`, borderRadius: 6, padding: "10px 12px", fontSize: 14, outline: "none", background: inputBg, color: inputColor, transition: "border-color 0.2s, background 0.4s" }}
                    onFocus={e => e.target.style.borderColor = "#e62e04"}
                    onBlur={e => e.target.style.borderColor = inputBorder}
                  />
                </div>
              ))}
            </div>
            <button style={{ width: "100%", background: "#e62e04", color: "#fff", border: "none", padding: "14px", borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 24 }}>Register Now</button>
          </div>
        </div>
      )}
    </section>
  );
}




// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function Testimonials() {

  const { dark } = useTheme();

  // START FROM FIRST REAL CARD
  const [current, setCurrent] = useState(1);

  const [transitionEnabled, setTransitionEnabled] = useState(true);

  // DUPLICATE CARDS FOR TRUE INFINITE LOOP
  const extendedTestimonials = [
    TESTIMONIALS[TESTIMONIALS.length - 1],
    ...TESTIMONIALS,
    TESTIMONIALS[0],
  ];

  // AUTO SLIDE
  useEffect(() => {

    const interval = setInterval(() => {

      setCurrent(prev => prev + 1);

    }, 4000);

    return () => clearInterval(interval);

  }, []);

  // TRUE INFINITE LOOP LOGIC
  useEffect(() => {

    // LAST DUPLICATE REACHED
    if (current === extendedTestimonials.length - 1) {

      setTimeout(() => {

        setTransitionEnabled(false);

        setCurrent(1);

      }, 600);
    }

    // FIRST DUPLICATE REACHED
    if (current === 0) {

      setTimeout(() => {

        setTransitionEnabled(false);

        setCurrent(TESTIMONIALS.length);

      }, 600);
    }

    // RE-ENABLE TRANSITION
    else {

      const timer = setTimeout(() => {

        setTransitionEnabled(true);

      }, 50);

      return () => clearTimeout(timer);
    }

  }, [current]);

  const next = () => {
    setCurrent(prev => prev + 1);
  };

  const prev = () => {
    setCurrent(prev => prev - 1);
  };

  const cardBg = dark ? "#1a1a1a" : "#fff";

  const titleColor = dark ? "#eee" : "#111";

  const textColor = dark ? "#999" : "#555";

  const nameColor = dark ? "#ddd" : "#111";

  const locationColor = dark ? "#666" : "#999";

  const quoteColor = dark ? "#2e2e2e" : "#f5e6e3";

  const cardShadow = dark
    ? "0 2px 16px rgba(0,0,0,0.4)"
    : "0 2px 16px rgba(0,0,0,0.06)";

  return (

    <section
      className="testi-section"
      style={{
        padding: "72px 0",
        background: "transparent",
        transition: "background 0.4s",
        overflow: "hidden",
      }}
    >

      <style>{`

        .testi-wrapper{
          display:flex;
          align-items:center;
          gap:16px;
        }

        .testi-carousel{
          overflow:hidden;
          width:100%;
          min-width:0;
        }

        .testi-track{
          display:flex;
          gap:20px;
        }

        .testi-card{
          flex:0 0 calc((100% - 40px) / 3);

          border-radius:16px;

          transition:
            transform 0.3s ease,
            background 0.4s ease;

          min-width:0;
        }

        .testi-card:hover{
          transform:translateY(-6px);
        }

        .testi-btn{
          width:42px;
          height:42px;
          flex-shrink:0;

          border:none;

          border-radius:50%;

          background:#e62e04;

          color:#fff;

          font-size:28px;

          cursor:pointer;

          z-index:20;

          display:flex;
          align-items:center;
          justify-content:center;

          box-shadow:0 4px 12px rgba(0,0,0,0.2);
        }

        @media (max-width:768px){

          .testi-wrapper{
            gap:10px;
          }

          .testi-track{
            gap:0;
          }

          .testi-card{
            flex:0 0 100% !important;
          }

          .testi-btn{
            width:36px;
            height:36px;

            font-size:22px;
          }

          .testi-card p{
            font-size:13px !important;

            line-height:1.65 !important;

            margin-bottom:16px !important;

            display:-webkit-box !important;

            -webkit-line-clamp:5 !important;

            -webkit-box-orient:vertical !important;

            overflow:hidden !important;
          }
        }

      `}</style>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 clamp(16px,4vw,48px)",
        }}
      >

        {/* HEADING */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>

          <p
            style={{
              color: "#e62e04",
              fontWeight: 700,
              letterSpacing: "2px",
              fontSize: 13,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            What Clients Say
          </p>

          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 800,
              color: titleColor,
              fontFamily: "'Georgia', serif",
              transition: "color 0.4s",
            }}
          >
            Testimonials
          </h2>

        </div>

        {/* CAROUSEL */}
        <div className="testi-wrapper">

          {/* LEFT BUTTON */}
          <button
            className="testi-btn"
            onClick={prev}
          >
            ‹
          </button>

          <div className="testi-carousel">

          {/* TRACK */}
          <div
            className="testi-track"
            style={{
              transform: window.innerWidth <= 768
                ? `translateX(-${current * 100}%)`
                : `translateX(calc(-${current} * (33.333% + 6.5px)))`,

              transition: transitionEnabled
                ? "transform 0.6s ease"
                : "none",
            }}
          >

            {extendedTestimonials.map((t, i) => (

              <div
                className="testi-card"
                key={i}
                style={{
                  background: cardBg,
                  padding: "clamp(24px,4vw,40px)",
                  position: "relative",
                  boxShadow: cardShadow,
                  minHeight: 220,
                }}
              >

                {/* QUOTE */}
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 24,
                    fontSize: 56,
                    color: quoteColor,
                    lineHeight: 1,
                    fontFamily: "serif",
                    transition: "color 0.4s",
                  }}
                >
                  "
                </div>

                {/* STARS */}
                <StarRating count={t.stars} />

                {/* TEXT */}
                <p
                  style={{
                    fontSize: "clamp(14px,2vw,16px)",
                    color: textColor,
                    lineHeight: 1.8,
                    marginBottom: 28,
                    position: "relative",
                    transition: "color 0.4s",
                  }}
                >
                  {t.text}
                </p>

                {/* USER */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >

                  {/* AVATAR */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: t.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 15,
                      flexShrink: 0,
                    }}
                  >
                    {t.initials}
                  </div>

                  {/* NAME */}
                  <div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: nameColor,
                        transition: "color 0.4s",
                      }}
                    >
                      {t.name}
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: locationColor,
                        transition: "color 0.4s",
                      }}
                    >
                      {t.location}
                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

          </div>

          {/* RIGHT BUTTON */}
          <button
            className="testi-btn"
            onClick={next}
          >
            ›
          </button>

        </div>

      </div>

    </section>
  );
}





// ─── BLOG SECTION ─────────────────────────────────────────────────────────────
function BlogSection() {
  const { dark } = useTheme();

  const [current, setCurrent] = useState(0);
  const autoRef = useRef(null);

  const visibleCards = window.innerWidth <= 768 ? 1 : 2;

  // Infinite loop
  const loopBlogs = [...BLOGS, ...BLOGS];

  const cardGlass = dark
    ? "rgba(18,18,18,0.42)"
    : "rgba(255,255,255,0.14)";

  const glassBorder = dark
    ? "rgba(255,255,255,0.07)"
    : "rgba(255,255,255,0.18)";

  const titleColor = dark ? "#fff" : "#111";

  const arrowBg = dark ? "#242424" : "#fff";
  const arrowColor = dark ? "#fff" : "#111";

  const trackBg = dark
    ? "rgba(255,255,255,0.12)"
    : "rgba(0,0,0,0.08)";

  // ─── AUTOPLAY ─────────────────────
  useEffect(() => {
    autoRef.current = setInterval(() => {
      setCurrent((prev) => prev + 1);
    }, 4200);

    return () => clearInterval(autoRef.current);
  }, []);

  // Infinite reset
  useEffect(() => {
    if (current >= BLOGS.length) {
      setTimeout(() => {
        setCurrent(0);
      }, 650);
    }
  }, [current]);

  const resetAuto = () => {
    clearInterval(autoRef.current);

    autoRef.current = setInterval(() => {
      setCurrent((prev) => prev + 1);
    }, 4200);
  };

  const next = () => {
    setCurrent((prev) => prev + 1);
    resetAuto();
  };

  const prev = () => {
    setCurrent((prev) =>
      prev === 0 ? BLOGS.length - 1 : prev - 1
    );
    resetAuto();
  };

  return (
    <section
      style={{
        padding: "72px 0",
        overflow: "hidden",
      }}
    >
      <style>{`
        .blog-track{
          display:flex;
          gap:20px;
          will-change:transform;
        }

        .blog-card{
          position:relative;
          overflow:hidden;
          border-radius:20px;
          flex-shrink:0;
        }

        .blog-image{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }

        .blog-overlay{
          position:absolute;
          inset:0;
          background:linear-gradient(
            to top,
            rgba(0,0,0,.84) 0%,
            rgba(0,0,0,.34) 48%,
            rgba(0,0,0,.08) 100%
          );
        }

        .blog-glass{
          position:absolute;
          left:12px;
          right:12px;
          bottom:12px;
          backdrop-filter:blur(16px);
          -webkit-backdrop-filter:blur(16px);
        }

        @media(max-width:768px){

          .blog-card{
            width:100% !important;
          }

          .blog-main-card{
            height:320px !important;
          }

          .blog-glass{
            left:10px !important;
            right:10px !important;
            bottom:10px !important;
            padding:10px 12px !important;
            min-height:120px !important;
          }

          .blog-title{
            font-size:14px !important;
            line-height:1.35 !important;
          }

          .blog-desc{
            font-size:11px !important;
            line-height:1.5 !important;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1420,
          margin: "0 auto",
          padding: "0 clamp(16px,4vw,40px)",
        }}
      >
        {/* ─── HEADING ───────────────── */}
        <div style={{ marginBottom: 34 }}>
          <p
            style={{
              color: "#e62e04",
              fontWeight: 700,
              letterSpacing: "2px",
              fontSize: 11,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Knowledge Hub
          </p>

          <h2
            style={{
              fontSize: "clamp(28px,4vw,48px)",
              fontWeight: 900,
              lineHeight: 1.08,
              color: titleColor,
              fontFamily: "'Georgia', serif",
              margin: 0,
            }}
          >
            Latest from Our Blog
          </h2>
        </div>

        {/* ─── CAROUSEL ───────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
          }}
        >
          {/* LEFT */}
          <button
            onClick={prev}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "none",
              background: arrowBg,
              color: arrowColor,
              cursor: "pointer",
              flexShrink: 0,
              zIndex: 5,
              boxShadow: "0 5px 14px rgba(0,0,0,0.12)",
            }}
          >
            ❮
          </button>

          {/* VIEWPORT */}
          <div
            style={{
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div
              className="blog-track"
              style={{
                transition:
                  current >= BLOGS.length
                    ? "none"
                    : "transform .65s cubic-bezier(.22,.61,.36,1)",

                transform: `translateX(calc(-${
                  current * (100 / visibleCards)
                }% - ${current * 10}px))`,
              }}
            >
              {loopBlogs.map((b, i) => (
                <div
                  key={i}
                  className="blog-card blog-main-card"
                  style={{
                    width:
                      visibleCards === 1
                        ? "100%"
                        : "calc(50% - 10px)",

                    height: 360,
                    background: "#111",
                  }}
                >
                  {/* IMAGE */}
                  <img
                    src={b.img}
                    alt={b.title}
                    className="blog-image"
                  />

                  {/* OVERLAY */}
                  <div className="blog-overlay" />

                  {/* GLASS CONTENT */}
                  <div
                    className="blog-glass"
                    style={{
                      background: cardGlass,
                      border: `1px solid ${glassBorder}`,
                      borderRadius: 14,
                      padding: "10px 12px",
                      minHeight: 160,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* CATEGORY */}
                    <div
                      style={{
                        color: "#ff6b3d",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "1.2px",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {b.category}
                    </div>

                    {/* TITLE */}
                    <h3
                      className="blog-title"
                      style={{
                        color: "#fff",
                        fontSize: 15,
                        lineHeight: 1.35,
                        marginBottom: 6,
                        fontWeight: 800,
                      }}
                    >
                      {b.title}
                    </h3>

                    {/* DESC */}
                    <p
                      className="blog-desc"
                      style={{
                        color: "rgba(255,255,255,0.78)",
                        fontSize: 12,
                        lineHeight: 1.55,
                        marginBottom: 12,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {b.excerpt}
                    </p>

                    {/* BOTTOM */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        marginTop: "auto",
                      }}
                    >
                      {/* BUTTON */}
                      <a
                        href={b.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          height: 34,
                          minWidth: 104,
                          padding: "0 14px",
                          borderRadius: 9,
                          background: "#e62e04",
                          color: "#fff",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 11.5,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        View More →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <button
            onClick={next}
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: "none",
              background: arrowBg,
              color: arrowColor,
              cursor: "pointer",
              flexShrink: 0,
              zIndex: 5,
              boxShadow: "0 5px 14px rgba(0,0,0,0.12)",
            }}
          >
            ❯
          </button>
        </div>

        {/* DOTS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 22,
          }}
        >
          {BLOGS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                resetAuto();
              }}
              style={{
                width: current % BLOGS.length === i ? 22 : 7,
                height: 7,
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                background:
                  current % BLOGS.length === i
                    ? "#e62e04"
                    : trackBg,
                transition: "all .3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}



// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { dark } = useTheme();
  return (
    <div style={{ fontFamily: "'Poppins', 'Segoe UI', 'Helvetica Neue', sans-serif", background: "transparent", transition: "background 0.4s ease" }}>
      <SharedHeader activePage="/" />
      <HeroSection />
      <WhyUs />
      <Categories />
      <Stats />
      <Brands />
      <AgentProgram />
      <Testimonials />
      <BlogSection />
      <Footer />
    </div>
  );
}
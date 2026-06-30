import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CartProvider, ThemeProvider, GlobalAnimationBackground, AuthProvider, SiteImagesProvider } from "./components";
import LenisProvider from "./components/LenisProvider";
import PageTransition from "./components/PageTransition";
import PageLoader from "./components/PageLoader";
import "./index.css";

// ─── Eager (small / always-needed) pages ───────────────────────────────────
import App from "./App";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Product from "./pages/Product";
import Brands from "./pages/Brands";
import Login from "./pages/Login";
import Register from "./pages/Register";

// ─── ProductDetail is now eager too — it's a core page hit from product listings ─
import ProductDetail from "./pages/ProductDetail";

// ─── Lazy (heavy / less-frequently-visited) pages ─────────────────────────
const Blog            = lazy(() => import("./pages/Blog"));
const BlogDetail      = lazy(() => import("./pages/BlogDetail"));
const Profile         = lazy(() => import("./pages/Profile"));
const Orders          = lazy(() => import("./pages/Orders"));
const Wishlist        = lazy(() => import("./pages/Wishlist"));
const AdminDashboard  = lazy(() => import("./pages/AdminDashboard"));
const Checkout        = lazy(() => import("./pages/Checkout"));
const EnquirySuccess  = lazy(() => import("./pages/EnquirySuccess"));
const QualityAssurance = lazy(() => import("./pages/QualityAssurance"));
import NotFound from "./pages/NotFound";

/**
 * PageFallback
 * ────────────
 * Minimal, non-jarring loading state for lazily-loaded routes.
 */
function PageFallback() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 14,
      }}
      aria-hidden="true"
    >
      <div style={{
        width: 36, height: 36,
        border: "3px solid rgba(230,46,4,0.18)",
        borderTopColor: "#e62e04",
        borderRadius: "50%",
        animation: "ybm-spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes ybm-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: 13, color: "rgba(128,128,128,0.7)", fontWeight: 500, letterSpacing: "0.3px" }}>
        Loading…
      </div>
    </div>
  );
}

/**
 * AnimatedRoutes
 * ──────────────
 * Wraps <Routes> with <AnimatePresence> so route changes fade/slide instead
 * of hard-cutting. mode="sync" lets incoming page start rendering immediately
 * without waiting for the outgoing page to fully exit.
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/"         element={<PageTransition><App /></PageTransition>} />
        <Route path="/about"    element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact"  element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/products" element={<PageTransition><Product /></PageTransition>} />
        <Route path="/brands"   element={<PageTransition><Brands /></PageTransition>} />
        <Route path="/login"    element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        {/* ProductDetail is now eager — no Suspense wrapper needed */}
        <Route path="/productDetail" element={<PageTransition><ProductDetail /></PageTransition>} />

        <Route
          path="/blog"
          element={<PageTransition><Suspense fallback={<PageFallback />}><Blog /></Suspense></PageTransition>}
        />
        <Route
          path="/blog/:slug"
          element={<PageTransition><Suspense fallback={<PageFallback />}><BlogDetail /></Suspense></PageTransition>}
        />
        <Route
          path="/enquiry-success"
          element={<PageTransition><Suspense fallback={<PageFallback />}><EnquirySuccess /></Suspense></PageTransition>}
        />
        <Route
          path="/profile"
          element={<PageTransition><Suspense fallback={<PageFallback />}><Profile /></Suspense></PageTransition>}
        />
        <Route
          path="/orders"
          element={<PageTransition><Suspense fallback={<PageFallback />}><Orders /></Suspense></PageTransition>}
        />
        <Route
          path="/wishlist"
          element={<PageTransition><Suspense fallback={<PageFallback />}><Wishlist /></Suspense></PageTransition>}
        />
        <Route
          path="/admin"
          element={<PageTransition><Suspense fallback={<PageFallback />}><AdminDashboard /></Suspense></PageTransition>}
        />
        <Route
          path="/cart"
          element={<PageTransition><Suspense fallback={<PageFallback />}><Checkout initialStep={1} /></Suspense></PageTransition>}
        />
        <Route
          path="/checkout/enquiry-form"
          element={<PageTransition><Suspense fallback={<PageFallback />}><Checkout initialStep={2} /></Suspense></PageTransition>}
        />
        <Route
          path="/checkout/order-confirmed"
          element={<PageTransition><Suspense fallback={<PageFallback />}><Checkout initialStep={3} /></Suspense></PageTransition>}
        />
        <Route
          path="/checkout"
          element={<PageTransition><Suspense fallback={<PageFallback />}><Checkout initialStep={1} /></Suspense></PageTransition>}
        />
        <Route
          path="/quality-assurance"
          element={<PageTransition><Suspense fallback={<PageFallback />}><QualityAssurance /></Suspense></PageTransition>}
        />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <SiteImagesProvider>
              <PageLoader />
              <LenisProvider>
                {/* ── Persistent hero animation canvas — lives behind every page ── */}
                <GlobalAnimationBackground />
                <AnimatedRoutes />
              </LenisProvider>
            </SiteImagesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);

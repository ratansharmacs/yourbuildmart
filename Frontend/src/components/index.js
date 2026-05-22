// ─── Components barrel export ─────────────────────────────────────────────────
// Import all shared components from this single entry point:
// import { SharedHeader, Footer, StarRating, ThemeToggle, CartDrawer } from "../components";
// import { CartContext, CartProvider, useCart } from "../components";
// import { ThemeContext, useTheme } from "../components";

export { default as SharedHeader } from "./SharedHeader";
export { default as Footer } from "./Footer";
export { default as StarRating } from "./StarRating";
export { default as ThemeToggle } from "./ThemeToggle";
export { default as CartDrawer } from "./CartDrawer";

export { CartContext, CartProvider, useCart } from "./CartContext";
export { ThemeContext, useTheme } from "./ThemeContext";

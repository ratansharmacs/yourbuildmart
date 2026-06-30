// ─── Components barrel export ─────────────────────────────────────────────────
export { default as SharedHeader } from "./SharedHeader";
export { default as Footer } from "./Footer";
export { default as StarRating } from "./StarRating";
export { default as ThemeToggle } from "./ThemeToggle";
export { default as CartDrawer } from "./CartDrawer";
export { default as ThemeProvider } from "./ThemeProvider";
export { default as GlobalAnimationBackground } from "./GlobalAnimationBackground";

export { CartContext, CartProvider, useCart } from "./CartContext";
export { SiteImagesProvider, useSiteImage, useSiteImages, useSiteImagesRefresh } from "./SiteImagesContext";
export { default as EnquiryModal } from "./EnquiryModal";
export { default as RichTextEditor } from "./RichTextEditor";
export { ThemeContext, useTheme } from "./ThemeContext";
export { AuthContext, AuthProvider, useAuth } from "./AuthContext";

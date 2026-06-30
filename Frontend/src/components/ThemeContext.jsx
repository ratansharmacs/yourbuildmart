import { createContext, useContext } from "react";

// ─── THEME CONTEXT ────────────────────────────────────────────────────────────
export const ThemeContext = createContext({ dark: false, toggle: () => {} });
export function useTheme() { return useContext(ThemeContext); }

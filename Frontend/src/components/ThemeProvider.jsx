import { useState, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";

/**
 * ThemeProvider — wraps the entire app so dark/light mode persists
 * across all page navigations. Preference is saved in localStorage.
 *
 * Note: body background is intentionally left transparent so the
 * GlobalAnimationBackground canvas is always visible behind everything.
 */
export default function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("ybm_theme") === "dark"; } catch { return false; }
  });

  const toggle = () => setDark(d => !d);

  useEffect(() => {
    try { localStorage.setItem("ybm_theme", dark ? "dark" : "light"); } catch {}
    // Keep body transparent — the canvas provides the background colour
    document.body.style.background    = "transparent";
    document.body.style.transition    = "none";
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    // Add/remove dark-mode class for CSS selector targeting
    document.documentElement.classList.toggle("dark-mode", dark);
    document.body.classList.toggle("dark-mode", dark);
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

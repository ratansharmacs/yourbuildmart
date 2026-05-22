import { useTheme } from "./ThemeContext";

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} style={{
      background: dark ? "#1e1e1e" : "#f5f5f5", border: "none", borderRadius: 6,
      width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
    }}>
      {dark
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      }
    </button>
  );
}

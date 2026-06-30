import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme, useAuth, ThemeToggle, RichTextEditor, useSiteImagesRefresh } from "../components";
import { BASE_URL, getToken, resolveImageUrl, blogApi, requestsApi } from "../services/api";

// ─── Admin API ────────────────────────────────────────────────────────────────
async function adminFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return data?.data ?? data;
}

const RED = "#e62e04";
const RED_DARK = "#c42500";

// ─── THEME TOKENS (matches homepage exactly) ──────────────────────────────────
function useTokens() {
  const { dark } = useTheme();
  return {
    dark,
    bg:        dark ? "#09090b" : "#f5f2ee",
    surface:   dark ? "#111113" : "#ffffff",
    surface2:  dark ? "#1a1a1d" : "#f8f7f5",
    border:    dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)",
    text:      dark ? "#fafaf9" : "#0c0a09",
    textSub:   dark ? "rgba(250,250,249,0.5)" : "rgba(12,10,9,0.72)",
    textMuted: dark ? "rgba(250,250,249,0.3)" : "rgba(12,10,9,0.52)",
    inputBg:   dark ? "#1a1a1d" : "#fff",
    inputBdr:  dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
    redGlow:   dark ? "rgba(230,46,4,0.25)" : "rgba(230,46,4,0.12)",
    glassCard: dark ? "rgba(18,18,20,0.85)" : "rgba(255,255,255,0.85)",
    glassBdr:  dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    overlay:   dark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
  };
}

// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────
function Btn({ onClick, children, variant = "primary", size = "md", disabled = false, style: s = {}, type = "button" }) {
  const t = useTokens();
  const pad = size === "sm" ? "6px 14px" : size === "xs" ? "4px 9px" : "10px 20px";
  const fs  = size === "sm" ? 12.5 : size === "xs" ? 11.5 : 13.5;
  const base = {
    border: "none", borderRadius: 8, fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, transition: "all 0.18s", opacity: disabled ? 0.5 : 1,
    display: "inline-flex", alignItems: "center", gap: 5, padding: pad, fontSize: fs,
  };
  const variants = {
    primary:   { background: RED, color: "#fff", boxShadow: `0 2px 10px ${t.redGlow}` },
    secondary: { background: t.dark ? "rgba(230,46,4,0.12)" : "rgba(230,46,4,0.08)", color: RED, border: `1px solid rgba(230,46,4,0.28)` },
    ghost:     { background: "transparent", color: t.textSub, border: `1px solid ${t.border}` },
    danger:    { background: t.dark ? "rgba(220,38,38,0.12)" : "rgba(220,38,38,0.07)", color: "#f87171", border: "1px solid rgba(220,38,38,0.25)" },
    success:   { background: t.dark ? "rgba(4,180,134,0.12)" : "rgba(4,180,134,0.07)", color: "#34d399", border: "1px solid rgba(4,180,134,0.25)" },
    warning:   { background: t.dark ? "rgba(234,179,8,0.12)" : "rgba(234,179,8,0.07)", color: "#fbbf24", border: "1px solid rgba(234,179,8,0.25)" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...s }}
      onMouseEnter={e => { if (!disabled) { if (variant === "primary") { e.currentTarget.style.background = RED_DARK; e.currentTarget.style.boxShadow = "0 6px 20px rgba(230,46,4,0.4)"; } else { e.currentTarget.style.opacity = "0.82"; } } }}
      onMouseLeave={e => { if (variant === "primary") { e.currentTarget.style.background = RED; e.currentTarget.style.boxShadow = `0 2px 10px ${t.redGlow}`; } else { e.currentTarget.style.opacity = "1"; } }}
    >{children}</button>
  );
}

function Badge({ status }) {
  const map = {
    PENDING:        { bg: "rgba(234,179,8,0.15)",  c: "#fbbf24" },
    CONFIRMED:      { bg: "rgba(59,130,246,0.15)",  c: "#60a5fa" },
    PROCESSING:     { bg: "rgba(139,92,246,0.15)",  c: "#a78bfa" },
    SHIPPED:        { bg: "rgba(234,179,8,0.15)",  c: "#fbbf24" },
    DELIVERED:      { bg: "rgba(4,180,134,0.15)",   c: "#34d399" },
    CANCELLED:      { bg: "rgba(230,46,4,0.12)",    c: RED },
    ACTIVE:         { bg: "rgba(4,180,134,0.15)",   c: "#34d399" },
    INACTIVE:       { bg: "rgba(230,46,4,0.12)",    c: RED },
    APPROVED:       { bg: "rgba(4,180,134,0.15)",   c: "#34d399" },
    PENDING_REVIEW: { bg: "rgba(234,179,8,0.15)",  c: "#fbbf24" },
    ADMIN:          { bg: "rgba(230,46,4,0.12)",    c: RED },
    USER:           { bg: "rgba(255,255,255,0.08)", c: "#aaa" },
    SELLER:         { bg: "rgba(139,92,246,0.15)",  c: "#a78bfa" },
  };
  const st = map[(status || "").toUpperCase()] || { bg: "rgba(255,255,255,0.07)", c: "#888" };
  return <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600, background: st.bg, color: st.c, whiteSpace: "nowrap", display: "inline-block" }}>{status}</span>;
}

function Modal({ open, onClose, title, children, width = 520 }) {
  const t = useTokens();
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: t.overlay, backdropFilter: "blur(6px)" }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: width,
        background: t.glassCard, border: `1px solid ${t.glassBdr}`,
        borderRadius: 18, padding: 28, maxHeight: "90vh", overflowY: "auto",
        scrollBehavior: "smooth", overscrollBehavior: "contain",
        boxShadow: `0 32px 80px rgba(0,0,0,${t.dark ? 0.7 : 0.18}), 0 0 0 1px ${t.glassBdr}`,
        backdropFilter: "blur(24px)", zIndex: 1,
        animation: "modalPop 0.22s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: t.text, fontFamily: "'Georgia','Times New Roman',serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: "0 2px", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = RED}
            onMouseLeave={e => e.currentTarget.style.color = t.textMuted}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, error }) {
  const t = useTokens();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: t.textMuted, letterSpacing: "0.6px", textTransform: "uppercase" }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: RED }}>{error}</span>}
    </div>
  );
}

function Inp({ value, onChange, placeholder, type = "text", style: s = {}, readOnly = false }) {
  const t = useTokens();
  const base = {
    width: "100%", padding: "10px 13px", borderRadius: 9,
    background: t.inputBg, border: `1.5px solid ${t.inputBdr}`,
    color: t.text, fontSize: 13.5, fontFamily: "inherit", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box",
  };
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      style={{ ...base, ...s }}
      onFocus={e => { e.target.style.borderColor = RED; e.target.style.boxShadow = `0 0 0 3px ${t.redGlow}`; }}
      onBlur={e => { e.target.style.borderColor = t.inputBdr; e.target.style.boxShadow = "none"; }}
    />
  );
}

function Txta({ value, onChange, placeholder, rows = 3 }) {
  const t = useTokens();
  const base = {
    width: "100%", padding: "10px 13px", borderRadius: 9,
    background: t.inputBg, border: `1.5px solid ${t.inputBdr}`,
    color: t.text, fontSize: 13.5, fontFamily: "inherit", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box", resize: "vertical",
  };
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={base}
      onFocus={e => { e.target.style.borderColor = RED; e.target.style.boxShadow = `0 0 0 3px ${t.redGlow}`; }}
      onBlur={e => { e.target.style.borderColor = t.inputBdr; e.target.style.boxShadow = "none"; }}
    />
  );
}

function Sel({ value, onChange, children, style: s = {} }) {
  const t = useTokens();
  const base = {
    width: "100%", padding: "10px 13px", borderRadius: 9,
    background: t.inputBg, border: `1.5px solid ${t.inputBdr}`,
    color: t.text, fontSize: 13.5, fontFamily: "inherit", outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box", cursor: "pointer",
  };
  return (
    <select value={value} onChange={onChange} style={{ ...base, ...s }}
      onFocus={e => { e.target.style.borderColor = RED; }}
      onBlur={e => { e.target.style.borderColor = t.inputBdr; }}
    >{children}</select>
  );
}

function Pages({ page, total, onChange }) {
  const t = useTokens();
  if (total <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: t.textSub }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 0} style={{ padding: "5px 11px", borderRadius: 7, border: `1px solid ${t.border}`, background: "none", color: page === 0 ? t.textMuted : t.textSub, cursor: page === 0 ? "not-allowed" : "pointer", transition: "all 0.15s" }}>‹</button>
      <span style={{ color: t.textSub }}>{page + 1} / {total}</span>
      <button onClick={() => onChange(page + 1)} disabled={page >= total - 1} style={{ padding: "5px 11px", borderRadius: 7, border: `1px solid ${t.border}`, background: "none", color: page >= total - 1 ? t.textMuted : t.textSub, cursor: page >= total - 1 ? "not-allowed" : "pointer", transition: "all 0.15s" }}>›</button>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { if (msg) { const id = setTimeout(onClose, 3800); return () => clearTimeout(id); } }, [msg]);
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 99999,
      padding: "13px 22px", borderRadius: 12,
      background: type === "error" ? "rgba(220,38,38,0.97)" : "rgba(4,160,120,0.97)",
      color: "#fff", fontSize: 14, fontWeight: 600,
      boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "fadeUp 0.3s ease", maxWidth: 400,
      backdropFilter: "blur(12px)",
    }}>
      <span style={{ fontSize: 16 }}>{type === "error" ? "✕" : "✓"}</span>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 18, marginLeft: 4 }}>×</button>
    </div>
  );
}

function SectionHeader({ title, sub, right }) {
  const t = useTokens();
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: sub ? 4 : 0, flexWrap: "wrap", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 22, borderRadius: 2, background: `linear-gradient(to bottom, ${RED}, #ff6630)` }} />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: t.text, fontFamily: "'Georgia','Times New Roman',serif" }}>{title}</h2>
        </div>
        {right && <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>{right}</div>}
      </div>
      {sub && <p style={{ margin: "6px 0 0 13px", fontSize: 13, color: t.textSub }}>{sub}</p>}
    </div>
  );
}

function Table({ cols, rows, loading, skRows = 6 }) {
  const t = useTokens();
  return (
    <div style={{ background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 16, overflow: "hidden", backdropFilter: "blur(16px)" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: t.dark ? "rgba(230,46,4,0.09)" : "rgba(230,46,4,0.05)" }}>
              {cols.map(c => (
                <th key={c} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: RED, whiteSpace: "nowrap", borderBottom: `1px solid ${t.border}`, fontSize: 11.5, letterSpacing: "0.5px", textTransform: "uppercase" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: skRows }).map((_, i) => (
                  <tr key={i}><td colSpan={cols.length} style={{ padding: "12px 16px", borderBottom: `1px solid ${t.border}` }}>
                    <div style={{ height: 13, borderRadius: 4, background: t.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", width: `${55 + (i * 17) % 36}%` }} />
                  </td></tr>
                ))
              : rows.length === 0
                ? <tr><td colSpan={cols.length} style={{ padding: 44, textAlign: "center", color: t.textMuted, fontSize: 14 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>No records found
                  </td></tr>
                : rows.map((row, i) => (
                    <tr key={i}
                      style={{ background: "transparent", transition: "background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = t.dark ? "rgba(230,46,4,0.05)" : "rgba(230,46,4,0.03)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: "11px 16px", borderBottom: `1px solid ${t.border}`, color: t.textSub, verticalAlign: "middle", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: j === cols.length - 1 ? "normal" : "nowrap" }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Image preview helper (base64 for display only, never sent to server) ─────
function getPreviewUrl(item) {
  // item can be: a File object (pending upload), a URL string, or a base64 string
  if (!item) return "";
  if (typeof item === "string") return item;
  if (item instanceof File) return item._previewUrl || "";
  return "";
}

// Attach a preview URL to a File object so we can display it without base64 in state
function attachPreview(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = ev => { file._previewUrl = ev.target.result; resolve(file); };
    reader.readAsDataURL(file);
  });
}

// ─── Image Upload Input — stores File objects for pending uploads ─────────────
function ImageInput({ label, value, onChange, hint, multiple = false, values = [], onMultiChange }) {
  const t = useTokens();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const isMulti = multiple && onMultiChange;

  const handleFiles = async (files) => {
    setUploading(true);
    try {
      if (isMulti) {
        const fileObjs = await Promise.all(Array.from(files).map(f => attachPreview(f)));
        onMultiChange([...values, ...fileObjs]);
      } else {
        const fileObj = await attachPreview(files[0]);
        onChange(fileObj);
      }
    } finally { setUploading(false); }
  };

  const handleDrop = e => {
    e.preventDefault(); e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length) handleFiles(files);
  };

  const dropStyle = {
    border: `2px dashed ${t.inputBdr}`, borderRadius: 10, padding: "20px 14px",
    textAlign: "center", cursor: "pointer", transition: "all 0.2s",
    background: t.inputBg, color: t.textMuted, fontSize: 13,
  };

  if (isMulti) {
    return (
      <Field label={label}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={dropStyle} onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = RED; e.currentTarget.style.background = t.dark ? "rgba(230,46,4,0.07)" : "rgba(230,46,4,0.04)"; }}
            onDragLeave={e => { e.currentTarget.style.borderColor = t.inputBdr; e.currentTarget.style.background = t.inputBg; }}
            onDrop={handleDrop}
          >
            {uploading ? <span style={{ color: RED }}>⏳ Processing…</span> : <><span style={{ fontSize: 24 }}>🖼️</span><br />Drop images here or click to browse<br /><span style={{ fontSize: 11.5, opacity: 0.6 }}>Images are auto-compressed for optimal quality</span></>}
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
          </div>
          {values.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(80px,1fr))", gap: 8 }}>
              {values.map((img, i) => (
                <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: `1px solid ${t.border}`, aspectRatio: "1" }}>
                  <img src={getPreviewUrl(img)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={async () => {
                    // If this is an already-saved URL (from server), delete it from backend too
                    if (typeof img === "string" && img.startsWith("/uploads/") && window._productId) {
                      const idx0 = values.filter(v => typeof v === "string").indexOf(img);
                      const token = typeof getToken === "function" ? getToken() : localStorage.getItem("ybm_token");
                      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
                      // Determine if primary or additional
                      const allStrings = values.filter(v => typeof v === "string");
                      if (allStrings[0] === img) {
                        // It's the primary image
                        await fetch(`${BASE_URL}/products/${window._productId}/images/primary`, { method: "DELETE", headers });
                      } else {
                        // Find index in additionalImages (0-based after primary)
                        const addIdx = allStrings.indexOf(img) - 1;
                        if (addIdx >= 0) await fetch(`${BASE_URL}/products/${window._productId}/images/additional/${addIdx}`, { method: "DELETE", headers });
                      }
                    }
                    onMultiChange(values.filter((_, idx) => idx !== i));
                  }} style={{ position: "absolute", top: 3, right: 3, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none", color: "#fff", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
          {hint && <p style={{ margin: 0, fontSize: 11.5, color: t.textMuted }}>{hint}</p>}
        </div>
      </Field>
    );
  }

  return (
    <Field label={label}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Inp value={(value instanceof File) ? "(file selected)" : (value?.startsWith?.("data:") ? "(uploaded file)" : value || "")} onChange={e => onChange(e.target.value)} placeholder="Paste image URL  –or–  upload a file →" style={{ flex: 1 }} />
          <button onClick={() => fileRef.current?.click()} style={{ padding: "10px 14px", borderRadius: 9, border: `1.5px solid ${t.inputBdr}`, background: t.inputBg, color: t.textSub, cursor: "pointer", fontSize: 13, fontFamily: "inherit", whiteSpace: "nowrap", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.inputBdr; e.currentTarget.style.color = t.textSub; }}
          >{uploading ? "⏳" : "📁 Browse"}</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) handleFiles(e.target.files); }} />
        </div>
        {value && (
          <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", border: `1px solid ${t.border}`, background: t.surface2, height: 120 }}
            onDragOver={e => e.preventDefault()} onDrop={handleDrop}
          >
            <img key={value} src={getPreviewUrl(value)} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
            <div style={{ display: "none", position: "absolute", inset: 0, alignItems: "center", justifyContent: "center", fontSize: 12, color: t.textMuted, flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 28 }}>🖼️</span>Invalid image URL
            </div>
            <button onClick={() => onChange("")} style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        )}
        {hint && <p style={{ margin: 0, fontSize: 11.5, color: t.textMuted }}>{hint}</p>}
      </div>
    </Field>
  );
}

// ─── SECTIONS ─────────────────────────────────────────────────────────────────

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ slices, size = 140, thickness = 34, legend }) {
  // slices: [{label, value, color}]
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (!total) return <div style={{ height: size, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, opacity: 0.4 }}>No data</div>;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const paths = slices.map((sl, i) => {
    const pct = sl.value / total;
    const dash = pct * circ;
    const path = (
      <circle key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={sl.color}
        strokeWidth={thickness}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-offset * circ}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
    offset += pct;
    return path;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={thickness} />
        {paths}
      </svg>
      {legend && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, alignSelf: "stretch" }}>
          {slices.map(sl => (
            <div key={sl.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: sl.color, flexShrink: 0 }} />
              <span style={{ color: "inherit", opacity: 0.75 }}>{sl.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────
function BarChart({ data, color, height = 200 }) {
  // data: [{label, value}]
  if (!data || data.length === 0) return <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, opacity: 0.4 }}>No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(20, Math.min(48, Math.floor(360 / data.length) - 8));
  const gap = Math.max(4, Math.floor(40 / data.length));
  const totalW = data.length * (barW + gap);
  const chartH = height - 60; // leave room for labels

  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <svg width={Math.max(totalW + 40, 300)} height={height} style={{ display: "block", margin: "0 auto" }}>
        {/* Y-axis gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => (
          <line key={f} x1={30} y1={chartH * (1 - f) + 10} x2={totalW + 30} y2={chartH * (1 - f) + 10}
            stroke="rgba(128,128,128,0.12)" strokeWidth={1} />
        ))}
        {/* Bars */}
        {data.map((d, i) => {
          const barH = Math.max(4, (d.value / max) * chartH);
          const x = 30 + i * (barW + gap);
          const y = chartH + 10 - barH;
          const label = d.label.length > 10 ? d.label.slice(0, 8) + "…" : d.label;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} rx={4}
                fill={color} opacity={0.85} style={{ transition: "height 0.5s, y 0.5s" }} />
              {/* Rotated label */}
              <text x={x + barW / 2} y={chartH + 16} textAnchor="end"
                transform={`rotate(-45, ${x + barW / 2}, ${chartH + 16})`}
                fill="rgba(0,0,0,0.75)" fontSize={10}>{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Top Products Carousel ────────────────────────────────────────────────────
function TopProductsCarousel({ products, loading }) {
  const t = useTokens();
  const [idx, setIdx] = useState(0);
  const visible = 6;
  const max = Math.max(0, (products?.length || 0) - visible);

  if (loading) return (
    <div style={{ display: "flex", gap: 12, overflow: "hidden" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ minWidth: 160, borderRadius: 12, background: t.dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", height: 240, flexShrink: 0 }} />
      ))}
    </div>
  );

  if (!products?.length) return <div style={{ padding: 40, textAlign: "center", color: t.textMuted }}>No products yet.</div>;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 12, transition: "transform 0.35s ease", transform: `translateX(calc(-${idx * (172)}px))` }}>
          {products.map((p, i) => {
            const imgSrc = p.imageUrl ? (p.imageUrl.startsWith("http") ? p.imageUrl : `${BASE_URL}${p.imageUrl}`) : null;
            const stars = Math.round(p.averageRating || 0);
            return (
              <div key={i} style={{
                minWidth: 160, maxWidth: 160, borderRadius: 14, flexShrink: 0,
                background: t.glassCard, border: `1px solid ${t.glassBdr}`,
                backdropFilter: "blur(12px)", overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.2)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Image */}
                <div style={{ height: 130, background: t.dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {imgSrc
                    ? <img src={imgSrc} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                    : <span style={{ fontSize: 40 }}>📦</span>
                  }
                </div>
                {/* Info */}
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ color: RED, fontWeight: 800, fontSize: 13, marginBottom: 3 }}>
                    ₹{Number(p.price || 0).toLocaleString("en-IN")}.00
                  </div>
                  {/* Stars */}
                  <div style={{ color: "#f59e0b", fontSize: 11, marginBottom: 4 }}>
                    {"★".repeat(stars)}{"☆".repeat(5 - stars)}
                  </div>
                  <div style={{ fontSize: 12, color: t.text, fontWeight: 600, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {p.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Prev/Next arrows */}
      {idx > 0 && (
        <button onClick={() => setIdx(i => Math.max(0, i - 1))} style={{
          position: "absolute", left: -16, top: "50%", transform: "translateY(-50%)",
          width: 32, height: 32, borderRadius: "50%", background: t.glassCard, border: `1px solid ${t.glassBdr}`,
          color: t.text, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 2,
        }}>‹</button>
      )}
      {idx < max && (
        <button onClick={() => setIdx(i => Math.min(max, i + 1))} style={{
          position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)",
          width: 32, height: 32, borderRadius: "50%", background: t.glassCard, border: `1px solid ${t.glassBdr}`,
          color: t.text, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)", zIndex: 2,
        }}>›</button>
      )}
    </div>
  );
}

// ─── Inline Bar Chart (self-contained, used in Dashboard) ────────────────────
function InlineBarChart({ bars, barColor, loading, emptyMsg = "No data" }) {
  const t = useTokens();
  const chartH = 220;
  const labelH = 90;
  const svgH = chartH + labelH;
  const leftPad = 44;

  if (loading) return (
    <div style={{ height: svgH, display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted, fontSize: 13 }}>
      <span style={{ opacity: 0.5 }}>Loading…</span>
    </div>
  );
  if (!bars || bars.length === 0) return (
    <div style={{ height: svgH, display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted, fontSize: 13 }}>{emptyMsg}</div>
  );

  const maxVal = Math.max(...bars.map(b => b.value), 1);
  const n = bars.length;
  // Dynamic bar width — fit snugly regardless of count
  const gap = 10;
  const svgW = leftPad + n * (Math.max(24, Math.min(52, Math.floor((520 - leftPad) / n) - gap)) + gap) + 10;
  const barW = Math.max(24, Math.min(52, Math.floor((svgW - leftPad - 10) / n) - gap));

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <svg width={Math.max(svgW, 320)} height={svgH} style={{ display: "block", overflow: "visible" }}>
        {/* Horizontal grid + Y labels */}
        {yTicks.map(f => {
          const y = 8 + chartH * (1 - f);
          const val = Math.round(f * maxVal);
          const label = val >= 1_000_000 ? `${(val / 1_000_000).toFixed(1)}M`
                      : val >= 1_000    ? `${(val / 1_000).toFixed(0)}K`
                      : `${val}`;
          return (
            <g key={f}>
              <line x1={leftPad} y1={y} x2={svgW - 6} y2={y}
                stroke={t.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth={1} />
              <text x={leftPad - 6} y={y + 4} textAnchor="end" fontSize={9}
                fill={t.dark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.70)"}>{label}</text>
            </g>
          );
        })}

        {/* Bars + labels */}
        {bars.map((b, i) => {
          const barH = Math.max(3, (b.value / maxVal) * chartH);
          const x = leftPad + i * (barW + gap);
          const y = 8 + chartH - barH;
          // Truncate + wrap label
          const words = b.label.split(" ");
          const lines = [];
          let cur = "";
          words.forEach(w => {
            const test = cur ? `${cur} ${w}` : w;
            if (test.length > 13 && cur) { lines.push(cur); cur = w; }
            else cur = test;
          });
          if (cur) lines.push(cur);

          return (
            <g key={i}>
              {/* Bar */}
              <rect x={x} y={y} width={barW} height={barH} rx={4}
                fill={barColor}
                style={{ transition: "height 0.5s ease, y 0.5s ease" }}
              />
              {/* Rotated category labels */}
              <g transform={`translate(${x + barW / 2}, ${8 + chartH + 8})`}>
                <text transform="rotate(-40)" textAnchor="end" fontSize={9.5}
                  fill={t.dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.78)"}>
                  {b.label.length > 18 ? b.label.slice(0, 16) + "…" : b.label}
                </text>
              </g>
            </g>
          );
        })}

        {/* X-axis baseline */}
        <line x1={leftPad} y1={8 + chartH} x2={svgW - 6} y2={8 + chartH}
          stroke={t.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} strokeWidth={1} />
      </svg>
    </div>
  );
}

// Dashboard
function DashboardSection({ user, onNavigate }) {
  const t = useTokens();
  const [stats, setStats]   = useState(null);
  // Start false — render the layout shell immediately, data fills in async.
  // This eliminates the extra render-pass where the user sees only a spinner.
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminFetch("/admin/dashboard")
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const catStats  = stats?.categoryStats || [];
  const maxCount  = Math.max(...catStats.map(c => c.productCount), 1);
  const maxStock  = Math.max(...catStats.map(c => c.totalStock), 1);

  const saleBars  = catStats.map(c => ({ label: c.name, value: c.productCount }));
  const stockBars = catStats.map(c => ({ label: c.name, value: c.totalStock   }));

  const productDonut = [
    { label: "Total published products", value: stats?.publishedProducts || 0,  color: "#e91e8c" },
    { label: "Total sellers products",   value: stats?.sellerProducts    || 0,  color: "#4caf50" },
    { label: "Total admin products",     value: stats?.adminProducts     || 0,  color: "#3b82f6" },
  ];

  const sellersDonut = [
    { label: "Total sellers",          value: Math.max(1, stats?.totalUsers ? Math.ceil(stats.totalUsers * 0.05)  : 1), color: "#e91e8c" },
    { label: "Total approved sellers", value: Math.max(1, stats?.totalUsers ? Math.ceil(stats.totalUsers * 0.03)  : 1), color: "#4caf50" },
    { label: "Total pending sellers",  value: Math.max(1, stats?.totalUsers ? Math.ceil(stats.totalUsers * 0.015) : 1), color: "#3b82f6" },
  ];

  // ── KPI card definitions ───────────────────────────────────────────────────
  const kpiCards = [
    {
      k: "totalUsers",
      navKey: "customers",
      label: "Total\nCustomer",
      g: "linear-gradient(135deg, #9b59b6 0%, #7d3c98 50%, #6c3483 100%)",
      wave1: "rgba(255,255,255,0.18)",
      wave2: "rgba(255,255,255,0.10)",
    },
    {
      k: "totalOrders",
      navKey: "orders",
      label: "Total\nOrder",
      g: "linear-gradient(135deg, #5dade2 0%, #2e86c1 50%, #1a5276 100%)",
      wave1: "rgba(255,255,255,0.18)",
      wave2: "rgba(255,255,255,0.10)",
    },
    {
      k: "totalCategories",
      navKey: "categories",
      label: "Total\nProduct category",
      g: "linear-gradient(135deg, #f06292 0%, #e91e8c 50%, #880e4f 100%)",
      wave1: "rgba(255,255,255,0.18)",
      wave2: "rgba(255,255,255,0.10)",
    },
    {
      k: "totalBrands",
      navKey: "brands",
      label: "Total\nProduct brand",
      g: "linear-gradient(135deg, #ffb74d 0%, #ff9800 50%, #e65100 100%)",
      wave1: "rgba(255,255,255,0.18)",
      wave2: "rgba(255,255,255,0.10)",
    },
  ];

  // Shared card shell style
  const panel = {
    background: t.glassCard,
    border: `1px solid ${t.glassBdr}`,
    borderRadius: 16,
    boxShadow: t.dark
      ? "0 4px 24px rgba(0,0,0,0.35)"
      : "0 2px 16px rgba(0,0,0,0.07)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Row 1 — 4 KPI Cards (1 row, 4 columns) ──────────────────────── */}
      <div className="admin-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {kpiCards.map(c => (
          <div key={c.k} onClick={() => onNavigate && onNavigate(c.navKey)} style={{
            borderRadius: 18, background: c.g, color: "#fff",
            overflow: "hidden", position: "relative",
            boxShadow: "0 8px 28px rgba(0,0,0,0.22)",
            transition: "transform 0.22s, box-shadow 0.22s",
            cursor: "pointer", minHeight: 136,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 18px 40px rgba(0,0,0,0.32)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.22)"; }}
          >
            <div style={{ padding: "22px 22px 0" }}>
              {/* Label — split into two lines visually */}
              {c.label.split("\n").map((line, i) => (
                <div key={i} style={{ fontSize: i === 0 ? 12 : 12, opacity: 0.82, letterSpacing: "0.2px", lineHeight: 1.4 }}>{line}</div>
              ))}
              <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1, marginTop: 6 }}>
                {loading
                  ? <div style={{ width: 56, height: 44, borderRadius: 8, background: "rgba(255,255,255,0.25)", animation: "pulse 1.2s ease-in-out infinite" }} />
                  : (stats?.[c.k] ?? 0).toLocaleString()}
              </div>
            </div>
            {/* Arrow indicator */}
            <div style={{ position: "absolute", top: 16, right: 16, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>→</div>
            {/* Double-wave footer */}
            <svg viewBox="0 0 400 56" preserveAspectRatio="none"
              style={{ display: "block", width: "100%", height: 56, marginTop: 10 }}>
              <path fill={c.wave2} d="M0,38 Q80,14 160,32 T320,28 T400,22 L400,56 L0,56Z" />
              <path fill={c.wave1} d="M0,44 Q100,22 200,38 T400,32 L400,56 L0,56Z" />
            </svg>
          </div>
        ))}
      </div>

      {/* ── Row 2 — Charts (left 2 cols) + Donuts (right col) ──────────── */}
      <div className="admin-charts-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 340px", gap: 16, alignItems: "stretch" }}>

        {/* Bar chart — Category wise product sale */}
        <div style={{ ...panel, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Category wise product sale</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: t.textSub }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#93c5fd", flexShrink: 0, display: "inline-block" }} />
              Number of sale
            </div>
          </div>
          <div style={{ padding: "12px 16px 8px" }}>
            <InlineBarChart bars={saleBars} barColor="#93c5fd" loading={loading} emptyMsg="No category data yet" />
          </div>
        </div>

        {/* Bar chart — Category wise product stock */}
        <div style={{ ...panel, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Category wise product stock</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: t.textSub }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#f9a8d4", flexShrink: 0, display: "inline-block" }} />
              Number of Stock
            </div>
          </div>
          <div style={{ padding: "12px 16px 8px" }}>
            <InlineBarChart bars={stockBars} barColor="#f9a8d4" loading={loading} emptyMsg="No stock data yet" />
          </div>
        </div>

        {/* Donut column — Products + Sellers stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Products donut */}
          <div style={{ ...panel, padding: "18px 20px", flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, paddingBottom: 12, marginBottom: 16, borderBottom: `1px solid ${t.border}` }}>
              Products
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <DonutChart
                slices={loading || productDonut.every(s => s.value === 0)
                  ? [{ label: "", value: 1, color: t.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }]
                  : productDonut}
                size={110} thickness={26}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12, color: t.textSub, flex: 1 }}>
                {productDonut.map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <span style={{ lineHeight: 1.3 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sellers donut */}
          <div style={{ ...panel, padding: "18px 20px", flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.text, paddingBottom: 12, marginBottom: 16, borderBottom: `1px solid ${t.border}` }}>
              Sellers
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <DonutChart
                slices={loading
                  ? [{ label: "", value: 1, color: t.dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }]
                  : sellersDonut}
                size={110} thickness={26}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12, color: t.textSub, flex: 1 }}>
                {sellersDonut.map(s => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <span style={{ lineHeight: 1.3 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Row 3 — Top 12 Products Carousel ─────────────────────────────── */}
      <div style={{ ...panel, padding: "20px 28px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: t.text, letterSpacing: "-0.2px" }}>Top 12 Products</div>
          <div style={{ fontSize: 12, color: t.textMuted }}>Most recent active products</div>
        </div>
        <div style={{ position: "relative", paddingLeft: 24, paddingRight: 24 }}>
          <TopProductsCarousel products={stats?.topProducts || []} loading={loading} />
        </div>
      </div>

    </div>
  );
}

// Products
function ProductsSection({ setToast }) {
  const t = useTokens();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // "del" | "edit" | null
  const [sel, setSel] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback((p = 0) => {
    setLoading(true);
    adminFetch(`/admin/products?page=${p}&size=12`)
      .then(d => { setItems(d?.content || []); setTotalPages(d?.totalPages || 0); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(page); }, [page]);

  const openEdit = p => { setSel(p); setModal("edit"); window._productId = p.id; };
  const openDel  = p => { setSel(p); setModal("del"); };

  const handleSave = async () => {
    // kept for delete only now — edit handled by AddProductSection
    if (!sel) return;
    setSaving(false);
  };

  const handleDel = async () => {
    setSaving(true);
    try {
      await adminFetch(`/products/${sel.id}`, { method: "DELETE" });
      setToast({ msg: "Product deleted.", type: "success" });
      setModal(null); load(page);
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setSaving(false); }
  };

  const visible = items.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

  // Inline edit mode: show AddProductSection full-page form
  if (modal === "edit" && sel) {
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <Btn variant="ghost" size="sm" onClick={() => { setModal(null); setSel(null); }}>← Back to All Products</Btn>
        </div>
        <AddProductSection
          setToast={setToast}
          editProduct={sel}
          onSaved={() => { setModal(null); setSel(null); load(page); }}
        />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="All Products" right={
        <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ width: 200 }} />
      } />

      <Table cols={["ID", "Image", "Name", "Category", "Brand", "Price (₹)", "Stock", "Status", "Actions"]}
        loading={loading}
        rows={visible.map((p) => [
          <span style={{ color: t.textMuted, fontSize: 12 }}>{p.id}</span>,
          (() => {
            const rawPath = p.imageUrl || (Array.isArray(p.additionalImages) && p.additionalImages[0]) || null;
            const imgSrc = rawPath ? (rawPath.startsWith("http") ? rawPath : `${BASE_URL}${rawPath}`) : null;
            const fallback = <div style={{ width: 42, height: 42, borderRadius: 8, background: t.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>;
            return imgSrc
              ? <img key={imgSrc} src={imgSrc} alt="" style={{ width: 42, height: 42, objectFit: "cover", borderRadius: 8, border: `1px solid ${t.border}` }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
              : fallback;
          })(),
          <span style={{ color: t.text, fontWeight: 600 }}>{p.name}</span>,
          <span style={{ color: t.textSub }}>{p.category?.name || "—"}</span>,
          <span style={{ color: t.textSub }}>{p.brand || "—"}</span>,
          <span style={{ color: t.text, fontWeight: 700 }}>{p.price != null ? `₹${Number(p.price).toLocaleString("en-IN")}` : <span style={{ color: t.textMuted, fontWeight: 500 }}>—</span>}</span>,
          <span style={{ color: Number(p.stock) < 5 ? "#f87171" : t.textSub }}>{p.stock}</span>,
          <Badge status={p.active ? "ACTIVE" : "INACTIVE"} />,
          <div style={{ display: "flex", gap: 6 }}>
            <Btn size="sm" variant="secondary" onClick={() => openEdit(p)}>✏ Edit</Btn>
            <Btn size="sm" variant="danger" onClick={() => openDel(p)}>Delete</Btn>
          </div>,
        ])}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <Pages page={page} total={totalPages} onChange={p => { setPage(p); load(p); }} />
      </div>

      <Modal open={modal === "del"} onClose={() => setModal(null)} title="Delete Product" width={420}>
        <p style={{ color: t.textSub, fontSize: 14, marginBottom: 22, lineHeight: 1.65 }}>
          Are you sure you want to delete <strong style={{ color: t.text }}>{sel?.name}</strong>?<br />
          <span style={{ fontSize: 12.5, color: t.textMuted }}>This cannot be undone.</span>
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDel} disabled={saving}>{saving ? "Deleting…" : "Yes, Delete"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── Toggle Switch component ──────────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  const t = useTokens();
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
      <div onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 12, position: "relative", cursor: "pointer", flexShrink: 0, background: checked ? RED : (t.dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"), transition: "background 0.25s", boxShadow: checked ? `0 0 0 3px ${t.redGlow}` : "none" }}>
        <div style={{ position: "absolute", top: 3, left: checked ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
      </div>
      <span style={{ fontSize: 13.5, color: t.text, fontWeight: 500 }}>{label}</span>
    </label>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function Card({ title, children, badge }) {
  const t = useTokens();
  return (
    <div style={{ background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 16, overflow: "hidden", backdropFilter: "blur(16px)", marginBottom: 20 }}>
      {title && (
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: `linear-gradient(to bottom,${RED},#ff6630)`, flexShrink: 0 }} />
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: t.text }}>{title}</h3>
          {badge && <span style={{ marginLeft: "auto", fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "rgba(230,46,4,0.12)", color: RED, fontWeight: 600 }}>{badge}</span>}
        </div>
      )}
      <div style={{ padding: "20px 20px" }}>{children}</div>
    </div>
  );
}

// ─── Full-page Add/Edit Product Form ─────────────────────────────────────────
function AddProductSection({ setToast, editProduct = null, onSaved }) {
  const t = useTokens();
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);

  // Core fields
  const blank = {
    name: "", categoryId: "", brand: "", unit: "", minQty: "1",
    price: "", originalPrice: "", stock: "3000000", sku: "",
    tags: "", videoProvider: "youtube", videoLink: "",
    shortDescription: "", featured: false, todaysDeal: false,
    metaTitle: "", metaDescription: "", slug: "",
    // Images
    galleryImages: [], // array of File objects (pending upload) or URL strings (already saved)
    thumbnailUrl: "",
    // Brochure
    brochureFile: null,   // File object pending upload
    brochureUrl: "",      // existing saved URL
    // Structured descriptions (array of {title, description})
    descriptions: [{ title: "", description: "" }],
    // FAQs
    faqs: [{ question: "", answer: "" }],
  };

  const [form, setForm] = useState(() => {
    if (!editProduct) return blank;
    return {
      name: editProduct.name || "",
      categoryId: editProduct.category?.id || "",
      brand: editProduct.brand || "",
      unit: editProduct.unit || "",
      minQty: editProduct.minQty || "1",
      price: editProduct.price || "",
      originalPrice: editProduct.originalPrice || "",
      stock: editProduct.stock || "",
      sku: editProduct.sku || "",
      tags: Array.isArray(editProduct.tags) ? editProduct.tags.join(", ") : editProduct.tags || "",
      videoProvider: editProduct.videoProvider || "youtube",
      videoLink: editProduct.videoLink || "",
      shortDescription: editProduct.shortDescription || "",
      featured: !!editProduct.featured,
      todaysDeal: !!editProduct.todaysDeal,
      metaTitle: editProduct.metaTitle || "",
      metaDescription: editProduct.metaDescription || "",
      slug: editProduct.slug || "",
      galleryImages: (() => {
        // Merge primary + additional images from DB so saved images always show
        const primary = editProduct.imageUrl ? [editProduct.imageUrl] : [];
        const additional = Array.isArray(editProduct.additionalImages) ? editProduct.additionalImages : [];
        const merged = [...primary, ...additional].filter(Boolean);
        return merged.length > 0 ? merged : [];
      })(),
      thumbnailUrl: editProduct.thumbnailUrl || editProduct.imageUrl || "",
      brochureFile: null,
      brochureUrl: editProduct.brochureUrl || "",
      descriptions: editProduct.descriptions?.length > 0 ? editProduct.descriptions : [{ title: "", description: "" }],
      faqs: editProduct.faqs?.length > 0 ? editProduct.faqs : [{ question: "", answer: "" }],
    };
  });

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    adminFetch("/categories").then(d => setCats(Array.isArray(d) ? d : [])).catch(() => {});
    adminFetch("/brands").then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // Sync product ID globally so ImageInput can call delete endpoints
  useEffect(() => {
    if (editProduct?.id) window._productId = editProduct.id;
    return () => { if (!editProduct?.id) delete window._productId; };
  }, [editProduct]);

  // Descriptions helpers
  const addDesc = () => f("descriptions", [...form.descriptions, { title: "", description: "" }]);
  const removeDesc = i => f("descriptions", form.descriptions.filter((_, idx) => idx !== i));
  const updateDesc = (i, key, val) => f("descriptions", form.descriptions.map((d, idx) => idx === i ? { ...d, [key]: val } : d));

  // FAQ helpers
  const addFaq = () => f("faqs", [...form.faqs, { question: "", answer: "" }]);
  const removeFaq = i => f("faqs", form.faqs.filter((_, idx) => idx !== i));
  const updateFaq = (i, key, val) => f("faqs", form.faqs.map((d, idx) => idx === i ? { ...d, [key]: val } : d));

  const handleSave = async () => {
    if (!form.name.trim()) { setToast({ msg: "Product name is required.", type: "error" }); return; }
    if (!form.categoryId) { setToast({ msg: "Please select a category.", type: "error" }); return; }
    setSaving(true);
    try {
      // Separate File objects from already-stored URL strings
      const pendingGalleryFiles = form.galleryImages.filter(img => img instanceof File);
      const existingGalleryUrls = form.galleryImages.filter(img => typeof img === "string");
      const pendingThumbnailFile = form.thumbnailUrl instanceof File ? form.thumbnailUrl : null;
      const existingThumbnailUrl = typeof form.thumbnailUrl === "string" ? form.thumbnailUrl : null;

      // Build body with only URL strings (no base64, no File objects)
      const body = {
        name: form.name.trim(),
        categoryId: Number(form.categoryId),
        brand: form.brand || null,
        unit: form.unit || null,
        minQty: Number(form.minQty) || 1,
        price: form.price !== "" && form.price != null ? Number(form.price) : null,
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: Number(form.stock) || 0,
        sku: form.sku || null,
        tags: form.tags ? form.tags.split(",").map(s => s.trim()).filter(Boolean) : [],
        videoProvider: form.videoProvider || null,
        videoLink: form.videoLink || null,
        shortDescription: form.shortDescription || null,
        featured: form.featured,
        todaysDeal: form.todaysDeal,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        slug: form.slug || null,
        imageUrl: existingThumbnailUrl || existingGalleryUrls[0] || null,
        thumbnailUrl: existingThumbnailUrl || existingGalleryUrls[0] || null,
        additionalImages: existingGalleryUrls.slice(existingThumbnailUrl ? 0 : 1), // skip first if it is the primary
        descriptions: form.descriptions.filter(d => d.title || d.description),
        faqs: form.faqs.filter(d => d.question || d.answer),
      };

      // Step 1: Create or update the product (no images in body)
      let savedProduct;
      if (editProduct) {
        savedProduct = await adminFetch(`/products/${editProduct.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        savedProduct = await adminFetch("/products", { method: "POST", body: JSON.stringify(body) });
      }
      const productId = savedProduct?.id || editProduct?.id;

      // Step 2: Upload any pending File objects via multipart to the image endpoints
      if (productId) {
        const token = getToken();
        const authHeaders = token ? { "Authorization": `Bearer ${token}` } : {};

        // Upload thumbnail as primary image if it's a File
        if (pendingThumbnailFile) {
          const fd = new FormData();
          fd.append("image", pendingThumbnailFile);
          await fetch(`${BASE_URL}/products/${productId}/images/primary`, {
            method: "POST", headers: authHeaders, body: fd,
          });
        }

        // Upload gallery files as additional images (batch them)
        if (pendingGalleryFiles.length > 0) {
          const fd = new FormData();
          pendingGalleryFiles.forEach(f => fd.append("images", f));
          await fetch(`${BASE_URL}/products/${productId}/images/additional`, {
            method: "POST", headers: authHeaders, body: fd,
          });
        }

        // Upload brochure if a new file was selected
        if (form.brochureFile instanceof File) {
          const fd = new FormData();
          fd.append("brochure", form.brochureFile);
          await fetch(`${BASE_URL}/products/${productId}/images/brochure`, {
            method: "POST", headers: authHeaders, body: fd,
          });
        }
      }

      // Re-fetch the saved product to get all stored image URLs from disk
      if (productId) {
        try {
          const refreshed = await adminFetch(`/products/${productId}`);
          if (refreshed?.id) {
            const primary = refreshed.imageUrl ? [refreshed.imageUrl] : [];
            const additional = Array.isArray(refreshed.additionalImages) ? refreshed.additionalImages : [];
            const merged = [...primary, ...additional].filter(Boolean);
            setForm(prev => ({ ...prev, galleryImages: merged, thumbnailUrl: refreshed.imageUrl || "" }));
          }
        } catch (_) {}
      }
      setToast({ msg: `Product ${editProduct ? "updated" : "created"} successfully! 🎉`, type: "success" });
      if (onSaved) onSaved();
      else if (!editProduct) setForm(blank);
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setSaving(false); }
  };

  const inpStyle = {
    width: "100%", padding: "10px 13px", borderRadius: 9,
    background: t.inputBg, border: `1.5px solid ${t.inputBdr}`,
    color: t.text, fontSize: 13.5, fontFamily: "inherit", outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s", boxSizing: "border-box",
  };
  const focusBorder = e => { e.target.style.borderColor = RED; e.target.style.boxShadow = `0 0 0 3px ${t.redGlow}`; };
  const blurBorder = e => { e.target.style.borderColor = t.inputBdr; e.target.style.boxShadow = "none"; };

  return (
    <div>
      <SectionHeader title={editProduct ? "Edit Product" : "Add New Product"} sub={editProduct ? `Editing: ${editProduct.name}` : "Fill in the details to list a new product"} />
      <div className="add-product-grid">
        {/* ── Left Column ── */}
        <div>
          {/* Basic Info */}
          <Card title="Basic Information">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Field label="Product Name *">
                <input style={inpStyle} value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. Steel Sheet" onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Category *">
                <select style={inpStyle} value={form.categoryId} onChange={e => f("categoryId", e.target.value)} onFocus={focusBorder} onBlur={blurBorder}>
                  <option value="">— Select Category —</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Brand">
                {brands.length > 0 ? (
                  <select style={inpStyle} value={form.brand} onChange={e => f("brand", e.target.value)} onFocus={focusBorder} onBlur={blurBorder}>
                    <option value="">— Select Brand —</option>
                    {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                ) : (
                  <input style={inpStyle} value={form.brand} onChange={e => f("brand", e.target.value)} placeholder="e.g. TATA Steel, JSW" onFocus={focusBorder} onBlur={blurBorder} />
                )}
              </Field>
              <Field label="Unit">
                <input style={inpStyle} value={form.unit} onChange={e => f("unit", e.target.value)} placeholder="KG, Pc, MT, Meter…" onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Selling Price (₹)">
                <input style={inpStyle} type="number" value={form.price} onChange={e => f("price", e.target.value)} placeholder="Leave blank for 'Price on request'" onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="MRP / Original Price (₹)">
                <input style={inpStyle} type="number" value={form.originalPrice} onChange={e => f("originalPrice", e.target.value)} placeholder="0.00" onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Stock Quantity">
                <input style={inpStyle} type="number" value={form.stock} onChange={e => f("stock", e.target.value)} placeholder="0" onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Minimum Order Qty">
                <input style={inpStyle} type="number" value={form.minQty} onChange={e => f("minQty", e.target.value)} placeholder="1" onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="SKU" >
                <input style={inpStyle} value={form.sku} onChange={e => f("sku", e.target.value)} placeholder="e.g. STL-SHT-12MM" onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
              <Field label="Tags (comma separated)">
                <input style={inpStyle} value={form.tags} onChange={e => f("tags", e.target.value)} placeholder="steel, sheet, carbon…" onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
            </div>
          </Card>

          {/* Product Images */}
          <Card title="Product Images" badge="Auto-compressed WebP">
            <ImageInput
              label="Gallery Images (drag & drop multiple)"
              multiple
              values={form.galleryImages}
              onMultiChange={v => f("galleryImages", v)}
              hint="Images are automatically compressed using lossless WebP for fast loading while preserving visual quality."
            />
            <div style={{ marginTop: 4 }}>
              <ImageInput
                label="Thumbnail Image (290×300 recommended)"
                value={form.thumbnailUrl}
                onChange={v => f("thumbnailUrl", v)}
                hint="Used on product cards. Compressed to WebP on upload."
              />
            </div>
          </Card>

          {/* Brochure Upload */}
          <Card title="Product Brochure (PDF / DOC)">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Existing brochure */}
              {form.brochureUrl && !form.brochureFile && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  borderRadius: 9, background: t.dark ? "rgba(230,46,4,0.08)" : "rgba(230,46,4,0.05)",
                  border: "1px solid rgba(230,46,4,0.2)" }}>
                  <span style={{ fontSize: 22 }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>Brochure uploaded</p>
                    <p style={{ fontSize: 11, color: t.textMuted, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.brochureUrl}</p>
                  </div>
                  <a href={`${BASE_URL.replace("/api","")}${form.brochureUrl}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, fontWeight: 700, color: "#e62e04", textDecoration: "none", padding: "4px 10px",
                      borderRadius: 7, border: "1px solid #e62e04" }}>Preview</a>
                  <button onClick={() => f("brochureUrl", "")} style={{ fontSize: 12, fontWeight: 700, color: "#c00",
                    background: "none", border: "1px solid #fcc", borderRadius: 7, padding: "4px 10px", cursor: "pointer" }}>Remove</button>
                </div>
              )}
              {/* New file selected preview */}
              {form.brochureFile instanceof File && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                  borderRadius: 9, background: t.dark ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.06)",
                  border: "1px solid rgba(34,197,94,0.3)" }}>
                  <span style={{ fontSize: 22 }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: 0 }}>Ready to upload: {form.brochureFile.name}</p>
                    <p style={{ fontSize: 11, color: t.textMuted, margin: "2px 0 0" }}>{(form.brochureFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => f("brochureFile", null)} style={{ fontSize: 12, fontWeight: 700, color: "#c00",
                    background: "none", border: "1px solid #fcc", borderRadius: 7, padding: "4px 10px", cursor: "pointer" }}>Clear</button>
                </div>
              )}
              {/* File picker */}
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 8, padding: "24px 16px", borderRadius: 10, cursor: "pointer",
                border: `2px dashed ${t.border}`, background: t.dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#e62e04"}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                <span style={{ fontSize: 28 }}>📤</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                  {form.brochureFile ? "Replace brochure" : "Upload brochure"}
                </span>
                <span style={{ fontSize: 11, color: t.textMuted }}>PDF, DOC, DOCX · Max 20 MB</span>
                <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  style={{ display: "none" }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) { f("brochureFile", file); f("brochureUrl", ""); }
                    e.target.value = "";
                  }} />
              </label>
              <p style={{ fontSize: 11.5, color: t.textMuted, margin: 0 }}>
                💡 If no brochure is uploaded, the "Download Brochure" button on the product page will show a "coming soon" message to customers.
              </p>
            </div>
          </Card>

          {/* Product Video */}
          <Card title="Product Video">
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "0 16px" }}>
              <Field label="Video Provider">
                <select style={inpStyle} value={form.videoProvider} onChange={e => f("videoProvider", e.target.value)} onFocus={focusBorder} onBlur={blurBorder}>
                  <option value="youtube">YouTube</option>
                  <option value="dailymotion">Dailymotion</option>
                  <option value="vimeo">Vimeo</option>
                </select>
              </Field>
              <Field label="Video Link">
                <input style={inpStyle} value={form.videoLink} onChange={e => f("videoLink", e.target.value)} placeholder="https://youtube.com/watch?v=…" onFocus={focusBorder} onBlur={blurBorder} />
              </Field>
            </div>
          </Card>

          {/* Short Description */}
          <Card title="Short Description">
            <Field label="Short Description">
              <RichTextEditor value={form.shortDescription} onChange={html => f("shortDescription", html)} placeholder="Brief 1–2 sentence description shown on product cards…" minHeight={90} />
            </Field>
          </Card>

          {/* Full Descriptions */}
          <Card title="Product Description Sections">
            {form.descriptions.map((desc, i) => (
              <div key={i} style={{ background: t.dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, border: `1px solid ${t.border}`, position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Section {i + 1}</span>
                  {form.descriptions.length > 1 && (
                    <button onClick={() => removeDesc(i)} style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 7, color: "#f87171", cursor: "pointer", padding: "3px 9px", fontSize: 12, fontFamily: "inherit" }}>✕ Remove</button>
                  )}
                </div>
                <Field label="Title">
                  <input style={inpStyle} value={desc.title} onChange={e => updateDesc(i, "title", e.target.value)} placeholder="e.g. Introduction, Types, Benefits…" onFocus={focusBorder} onBlur={blurBorder} />
                </Field>
                <Field label="Description">
                  <RichTextEditor value={desc.description} onChange={html => updateDesc(i, "description", html)} placeholder="Detailed content for this section…" minHeight={140} />
                </Field>
              </div>
            ))}
            <Btn variant="secondary" size="sm" onClick={addDesc}>＋ Add Section</Btn>
          </Card>

          {/* FAQs */}
          <Card title="Frequently Asked Questions">
            {form.faqs.map((faq, i) => (
              <div key={i} style={{ background: t.dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.025)", borderRadius: 10, padding: "14px 16px", marginBottom: 12, border: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>FAQ {i + 1}</span>
                  {form.faqs.length > 1 && (
                    <button onClick={() => removeFaq(i)} style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 7, color: "#f87171", cursor: "pointer", padding: "3px 9px", fontSize: 12, fontFamily: "inherit" }}>✕ Remove</button>
                  )}
                </div>
                <Field label="Question">
                  <input style={inpStyle} value={faq.question} onChange={e => updateFaq(i, "question", e.target.value)} placeholder="e.g. What are the standard sizes?" onFocus={focusBorder} onBlur={blurBorder} />
                </Field>
                <Field label="Answer">
                  <RichTextEditor value={faq.answer} onChange={html => updateFaq(i, "answer", html)} placeholder="Write the answer…" minHeight={90} />
                </Field>
              </div>
            ))}
            <Btn variant="secondary" size="sm" onClick={addFaq}>＋ Add FAQ</Btn>
          </Card>

          {/* SEO Meta */}
          <Card title="SEO Meta Tags">
            <Field label="Meta Title">
              <input style={inpStyle} value={form.metaTitle} onChange={e => f("metaTitle", e.target.value)} placeholder="SEO page title…" onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="Meta Description">
              <textarea style={{ ...inpStyle, resize: "vertical" }} value={form.metaDescription} onChange={e => f("metaDescription", e.target.value)} placeholder="SEO meta description (150–160 chars)…" rows={3} onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
            <Field label="URL Slug">
              <input style={inpStyle} value={form.slug} onChange={e => f("slug", e.target.value)} placeholder="e.g. steel-sheet-carbon" onFocus={focusBorder} onBlur={blurBorder} />
            </Field>
          </Card>
        </div>

        {/* ── Right Column ── */}
        <div>
          {/* Featured */}
          <Card title="Featured">
            <Toggle checked={form.featured} onChange={v => f("featured", v)} label="Mark as Featured" />
          </Card>

          {/* Today's Deal */}
          <Card title="Today's Deal">
            <Toggle checked={form.todaysDeal} onChange={v => f("todaysDeal", v)} label="Add to Today's Deal" />
          </Card>

          {/* Pricing Summary */}
          <Card title="Pricing Summary">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Selling Price", val: form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "—" },
                { label: "MRP", val: form.originalPrice ? `₹${Number(form.originalPrice).toLocaleString("en-IN")}` : "—" },
                { label: "Discount", val: form.price && form.originalPrice ? `${Math.round((1 - form.price / form.originalPrice) * 100)}%` : "—" },
                { label: "Stock", val: form.stock || "—" },
                { label: "Min. Order", val: form.minQty || "1" },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}`, fontSize: 13 }}>
                  <span style={{ color: t.textSub }}>{label}</span>
                  <span style={{ color: t.text, fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Image preview count */}
          <Card title="Media Summary">
            <div style={{ fontSize: 13, color: t.textSub }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Gallery images</span>
                <span style={{ color: form.galleryImages.length > 0 ? "#34d399" : t.textMuted, fontWeight: 700 }}>{form.galleryImages.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Thumbnail</span>
                <span style={{ color: form.thumbnailUrl ? "#34d399" : t.textMuted, fontWeight: 700 }}>{form.thumbnailUrl ? "✓" : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>Description sections</span>
                <span style={{ color: t.text, fontWeight: 700 }}>{form.descriptions.filter(d => d.title || d.description).length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>FAQs</span>
                <span style={{ color: t.text, fontWeight: 700 }}>{form.faqs.filter(d => d.question).length}</span>
              </div>
            </div>
            {form.galleryImages.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 12 }}>
                {form.galleryImages.slice(0, 6).map((img, i) => (
                  <img key={i} src={getPreviewUrl(img)} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 7, border: `1px solid ${t.border}` }} />
                ))}
              </div>
            )}
          </Card>

          {/* Submit */}
          <div style={{ position: "sticky", top: 80 }}>
            <Btn onClick={handleSave} disabled={saving} style={{ width: "100%", justifyContent: "center", padding: "13px 20px", fontSize: 15 }}>
              {saving ? "⏳ Saving…" : editProduct ? "💾 Save Changes" : "🚀 Save & Publish Product"}
            </Btn>
            {!editProduct && (
              <button onClick={() => setForm(blank)} style={{ width: "100%", marginTop: 8, padding: "10px", borderRadius: 9, border: `1px solid ${t.border}`, background: "transparent", color: t.textMuted, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>↺ Reset Form</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Categories
function CategoriesSection({ setToast }) {
  const t = useTokens();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [sel, setSel] = useState(null);
  const [saving, setSaving] = useState(false);
  const blank = {
    name: "", description: "", imageUrl: "", iconUrl: "", parentId: "",
    metaTitle: "", metaDescription: "", slug: "",
    orderLevel: 0, categoryType: "Physical", featured: false, commission: 0,
  };
  const [form, setForm] = useState(blank);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = () => { setLoading(true); adminFetch("/categories").then(d => setCats(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openAdd  = () => { setForm(blank); setSel(null); setModal("form"); };
  const openEdit = c => {
    setSel(c);
    setForm({
      name: c.name || "", description: c.description || "", imageUrl: c.imageUrl || "", iconUrl: c.iconUrl || "",
      parentId: c.parentId || "",
      metaTitle: c.metaTitle || "", metaDescription: c.metaDescription || "", slug: c.slug || "",
      orderLevel: c.orderLevel ?? 0, categoryType: c.categoryType || "Physical",
      featured: !!c.featured, commission: c.commission ?? 0,
    });
    setModal("form");
  };
  const openDel  = c => { setSel(c); setModal("del"); };

  const handleSave = async () => {
    if (!form.name.trim()) { setToast({ msg: "Category name is required.", type: "error" }); return; }
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description || null,
        parentId: form.parentId ? Number(form.parentId) : null,
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        slug: form.slug || null,
        orderLevel: Number(form.orderLevel) || 0,
        categoryType: form.categoryType || "Physical",
        featured: !!form.featured,
        commission: Number(form.commission) || 0,
        ...(typeof form.imageUrl === "string" ? { imageUrl: form.imageUrl || null } : {}),
        ...(typeof form.iconUrl === "string" ? { iconUrl: form.iconUrl || null } : {}),
      };
      let saved;
      if (!sel) saved = await adminFetch("/categories", { method: "POST", body: JSON.stringify(body) });
      else      saved = await adminFetch(`/categories/${sel.id}`, { method: "PUT", body: JSON.stringify(body) });

      const catId = saved?.id || sel?.id;
      if (catId) {
        const token = getToken();
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
        if (form.imageUrl instanceof File) {
          const fd = new FormData(); fd.append("image", form.imageUrl);
          await fetch(`${BASE_URL}/categories/${catId}/image`, { method: "POST", headers: authHeaders, body: fd });
        }
        if (form.iconUrl instanceof File) {
          const fd = new FormData(); fd.append("image", form.iconUrl);
          await fetch(`${BASE_URL}/categories/${catId}/icon`, { method: "POST", headers: authHeaders, body: fd });
        }
      }

      setToast({ msg: `Category ${sel ? "updated" : "created"}!`, type: "success" });
      setModal(null); load();
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setSaving(false); }
  };

  const handleDel = async () => {
    setSaving(true);
    try {
      await adminFetch(`/categories/${sel.id}`, { method: "DELETE" });
      setToast({ msg: "Category deleted.", type: "success" });
      setModal(null); load();
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setSaving(false); }
  };

  const thumb = (url, icon) => url
    ? <img src={resolveImageUrl(url)} alt="" style={{ width: 38, height: 38, objectFit: "cover", borderRadius: 7, border: `1px solid ${t.border}` }} onError={e => e.target.style.display = "none"} />
    : <div style={{ width: 38, height: 38, borderRadius: 7, background: t.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>;

  return (
    <div>
      <SectionHeader title="All Categories" right={<Btn onClick={openAdd}>＋ Add New category</Btn>} />
      <Table cols={["#", "Name", "Parent Category", "Order Level", "Level", "Banner", "Icon", "Featured", "Commission", "Options"]} loading={loading}
        rows={cats.map((c, idx) => [
          <span style={{ color: t.textMuted, fontSize: 12 }}>{idx + 1}</span>,
          <span style={{ color: t.text, fontWeight: 600 }}>{c.name}</span>,
          <span style={{ color: t.textMuted }}>{c.parentId ? (c.parentName || cats.find(x => x.id === c.parentId)?.name || `#${c.parentId}`) : "—"}</span>,
          <span style={{ color: t.textSub }}>{c.orderLevel ?? 0}</span>,
          <span style={{ color: t.textSub }}>{c.level ?? 0}</span>,
          thumb(c.imageUrl, "🖼️"),
          thumb(c.iconUrl, "🔖"),
          <Toggle checked={!!c.featured} onChange={async (val) => {
            try {
              await adminFetch(`/categories/${c.id}`, { method: "PUT", body: JSON.stringify({
                name: c.name, description: c.description, parentId: c.parentId,
                metaTitle: c.metaTitle, metaDescription: c.metaDescription, slug: c.slug,
                orderLevel: c.orderLevel, categoryType: c.categoryType, commission: c.commission,
                featured: val,
              }) });
              load();
            } catch (e) { setToast({ msg: e.message, type: "error" }); }
          }} />,
          <span style={{ color: t.textSub }}>{c.commission ?? 0}%</span>,
          <div style={{ display: "flex", gap: 6 }}>
            <Btn size="sm" variant="secondary" onClick={() => openEdit(c)}>✎</Btn>
            <Btn size="sm" variant="danger" onClick={() => openDel(c)}>🗑</Btn>
          </div>,
        ])}
      />
      <Modal open={modal === "form"} onClose={() => setModal(null)} title={sel ? "Edit Category" : "Add Category"} width={560}>
        <Field label="Category Name *"><Inp value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. TMT Steel Products" /></Field>
        <Field label="Parent Category">
          <Sel value={form.parentId} onChange={e => f("parentId", e.target.value)}>
            <option value="">No Parent</option>
            {cats.filter(c => c.id !== sel?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Sel>
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Ordering Number">
            <Inp type="number" value={form.orderLevel} onChange={e => f("orderLevel", e.target.value)} placeholder="0" />
          </Field>
          <Field label="Type">
            <Sel value={form.categoryType} onChange={e => f("categoryType", e.target.value)}>
              <option value="Physical">Physical</option>
              <option value="Digital">Digital</option>
            </Sel>
          </Field>
        </div>
        <ImageInput label="Banner (200x200)" value={form.imageUrl} onChange={v => f("imageUrl", v)} />
        <ImageInput label="Icon (32x32)" value={form.iconUrl} onChange={v => f("iconUrl", v)} />
        <Field label="Description"><Txta value={form.description} onChange={e => f("description", e.target.value)} rows={2} placeholder="Brief description…" /></Field>
        <Field label="Meta Title"><Inp value={form.metaTitle} onChange={e => f("metaTitle", e.target.value)} placeholder="Meta Title" /></Field>
        <Field label="Meta description"><Txta value={form.metaDescription} onChange={e => f("metaDescription", e.target.value)} rows={3} placeholder="Meta description" /></Field>
        <Field label="Slug"><Inp value={form.slug} onChange={e => f("slug", e.target.value)} placeholder="auto-generated-from-name" /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
          <Field label="Commission (%)"><Inp type="number" value={form.commission} onChange={e => f("commission", e.target.value)} placeholder="0" /></Field>
          <div style={{ marginTop: 18 }}><Toggle checked={form.featured} onChange={v => f("featured", v)} label="Featured" /></div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : sel ? "Save Changes" : "Create Category"}</Btn>
        </div>
      </Modal>
      <Modal open={modal === "del"} onClose={() => setModal(null)} title="Delete Category" width={400}>
        <p style={{ color: t.textSub, fontSize: 14, marginBottom: 20 }}>Delete <strong style={{ color: t.text }}>{sel?.name}</strong>? Products in this category will be unlinked.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDel} disabled={saving}>{saving ? "Deleting…" : "Yes, Delete"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// Orders / Enquiries
function OrdersSection({ setToast }) {
  const t = useTokens();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [view, setView] = useState("list"); // "list" | "detail"
  const [sel, setSel] = useState(null);
  const [selAll, setSelAll] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [filterDelivery, setFilterDelivery] = useState("");

  // Detail form state
  const [form, setForm] = useState({ status: "", paymentStatus: "", deliveryPartner: "", trackingId: "", trackingUrl: "" });

  const DELIVERY_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
  const PAYMENT_STATUSES  = ["UN_PAID", "PAID"];

  const resolveImg = url => url ? (url.startsWith("http") ? url : `${BASE_URL}${url}`) : null;

  const load = useCallback(p => {
    setLoading(true);
    adminFetch(`/admin/orders?page=${p}&size=15`)
      .then(d => { setOrders(d?.content || []); setTotalPages(d?.totalPages || 0); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(page); }, [page]);

  const openDetail = o => {
    setSel(o);
    setForm({
      status: o.status || "PENDING",
      paymentStatus: o.paymentStatus || "UN_PAID",
      deliveryPartner: o.deliveryPartner || "",
      trackingId: o.trackingId || "",
      trackingUrl: o.trackingUrl || "",
    });
    setView("detail");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await adminFetch(`/orders/${sel.id}/admin`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setToast({ msg: "Order saved successfully!", type: "success" });
      setSel(updated);
      load(page);
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    try {
      await adminFetch(`/orders/${id}/admin`, { method: "DELETE" });
      setToast({ msg: "Order deleted.", type: "success" });
      if (view === "detail") setView("list");
      load(page);
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
  };

  const handleBulkDelete = async () => {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} order(s)?`)) return;
    try {
      await Promise.all([...selected].map(id => adminFetch(`/orders/${id}/admin`, { method: "DELETE" })));
      setToast({ msg: `${selected.size} order(s) deleted.`, type: "success" });
      setSelected(new Set()); setSelAll(false); load(page);
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
  };

  const toggleSel = id => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleAll = () => {
    if (selAll) { setSelected(new Set()); setSelAll(false); }
    else { setSelected(new Set(orders.map(o => o.id))); setSelAll(true); }
  };

  const payBadge = ps => {
    const paid = ps === "PAID";
    return (
      <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700,
        background: paid ? "rgba(4,180,134,0.15)" : "rgba(230,46,4,0.15)",
        color: paid ? "#34d399" : RED, border: `1px solid ${paid ? "rgba(4,180,134,0.3)" : "rgba(230,46,4,0.3)"}` }}>
        {paid ? "Paid" : "Un-Paid"}
      </span>
    );
  };

  const filteredOrders = orders.filter(o => {
    if (filterCode && !((o.orderNumber || "").toLowerCase().includes(filterCode.toLowerCase()))) return false;
    if (filterDate && o.createdAt && !o.createdAt.startsWith(filterDate)) return false;
    if (filterDelivery && o.status !== filterDelivery) return false;
    return true;
  });

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────
  if (view === "detail" && sel) {
    const subtotal = sel.items?.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0) || sel.totalAmount || 0;

    return (
      <div>
        <SectionHeader
          title="Order Details"
          right={<Btn variant="ghost" onClick={() => setView("list")}>← Back to Orders</Btn>}
        />
        {/* Top controls card */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Delivery Partner */}
            <div>
              <label style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>Delivery Partner</label>
              <Sel value={form.deliveryPartner} onChange={e => setForm(f => ({ ...f, deliveryPartner: e.target.value }))}>
                <option value="">Select Delivery Partner</option>
                {["Delhivery","Bluedart","DTDC","FedEx","Ekart","XpressBees","Other"].map(d =>
                  <option key={d} value={d}>{d}</option>)}
              </Sel>
            </div>
            {/* Payment Status */}
            <div>
              <label style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>Payment Status</label>
              <Sel value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}>
                {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s === "UN_PAID" ? "Un-Paid" : "Paid"}</option>)}
              </Sel>
            </div>
            {/* Delivery Status */}
            <div>
              <label style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>Delivery Status</label>
              <Sel value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
              </Sel>
            </div>
          </div>
          {/* Tracking */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>Tracking ID</label>
            <Inp value={form.trackingId} onChange={e => setForm(f => ({ ...f, trackingId: e.target.value }))} placeholder="Tracking ID" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, color: t.textMuted, fontWeight: 600, display: "block", marginBottom: 6 }}>Tracking URL</label>
            <Inp value={form.trackingUrl} onChange={e => setForm(f => ({ ...f, trackingUrl: e.target.value }))} placeholder="Tracking URL" />
          </div>
          <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
        </div>

        {/* Customer + order meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          {/* Customer */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ fontWeight: 700, color: t.text, marginBottom: 4, fontSize: 15 }}>
              {sel.enquiryName || sel.customerName || "—"}
            </div>
            <div style={{ color: t.textMuted, fontSize: 13 }}>{sel.enquiryEmail || sel.customerEmail || "—"}</div>
            {sel.enquiryOrganization && <div style={{ color: t.textMuted, fontSize: 12, marginTop: 4 }}>{sel.enquiryOrganization}</div>}
            {sel.enquiryCountry && <div style={{ color: t.textMuted, fontSize: 12 }}>{sel.enquiryCountry}</div>}
            {sel.enquiryPhone && <div style={{ color: t.textMuted, fontSize: 12 }}>📞 {sel.enquiryPhone}</div>}
          </div>
          {/* Order Meta */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: t.textMuted }}>Order #</span>
                <span style={{ color: RED, fontWeight: 700 }}>{sel.orderNumber}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: t.textMuted }}>Order status</span>
                <span style={{ padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700,
                  background: "rgba(234,179,8,0.15)", color: "#fbbf24", border: "1px solid rgba(234,179,8,0.3)" }}>
                  {sel.status?.charAt(0) + sel.status?.slice(1).toLowerCase()}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: t.textMuted }}>Order date</span>
                <span style={{ color: t.textSub }}>{sel.createdAt ? new Date(sel.createdAt).toLocaleString("en-IN") : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: t.textMuted }}>Total amount</span>
                <span style={{ color: t.text, fontWeight: 600 }}>Rs{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: t.textMuted }}>Payment method</span>
                <span style={{ color: t.textSub }}>—</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order items table */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                {["#", "Photo", "Description", "Delivery Type", "QTY", "Price", "Total"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: h === "#" || h === "QTY" ? "center" : "left",
                    fontWeight: 700, color: t.textMuted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(sel.items || []).map((item, i) => {
                const imgSrc = resolveImg(item.imageUrl);
                const price = item.price || 0;
                const total = price * (item.quantity || 1);
                return (
                  <tr key={i} style={{ borderBottom: i < sel.items.length - 1 ? `1px solid ${t.border}` : "none" }}>
                    <td style={{ padding: "14px 16px", textAlign: "center", color: t.textMuted }}>{i + 1}</td>
                    <td style={{ padding: "14px 16px" }}>
                      {imgSrc
                        ? <img src={imgSrc} alt="" style={{ width: 54, height: 54, objectFit: "cover", borderRadius: 8, border: `1px solid ${t.border}` }} onError={e => e.target.style.display = "none"} />
                        : <div style={{ width: 54, height: 54, borderRadius: 8, background: t.surface2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📦</div>
                      }
                    </td>
                    <td style={{ padding: "14px 16px", color: t.text, fontWeight: 600 }}>{item.productName || `Product #${item.productId}`}</td>
                    <td style={{ padding: "14px 16px", color: t.textMuted }}>—</td>
                    <td style={{ padding: "14px 16px", textAlign: "center", color: t.textSub }}>{item.quantity}</td>
                    <td style={{ padding: "14px 16px", color: t.textSub }}>Rs{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: "14px 16px", color: t.text, fontWeight: 600 }}>Rs{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Totals */}
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${t.border}` }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ minWidth: 260 }}>
                {[["Sub Total :", subtotal], ["Tax :", 0], ["Shipping :", 0], ["Coupon :", 0]].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0",
                    fontSize: 13, color: t.textMuted }}>
                    <span>{label}</span>
                    <span>Rs{val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderTop: `1px solid ${t.border}`, marginTop: 4, fontWeight: 700 }}>
                  <span style={{ color: t.text }}>Total :</span>
                  <span style={{ color: RED, fontSize: 18 }}>Rs{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────

  const [bulkOpen, setBulkOpen]         = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = () => { setBulkOpen(false); setDeliveryOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Delivery filter options — exactly as shown in screenshots
  const DELIVERY_FILTER_OPTIONS = [
    { value: "",           label: "Filter by Delivery…", isHeader: true },
    { value: "PENDING",    label: "Pending" },
    { value: "CONFIRMED",  label: "Confirmed" },
    { value: "PROCESSING", label: "Picked Up" },
    { value: "SHIPPED",    label: "On The Way" },
    { value: "DELIVERED",  label: "Delivered" },
    { value: "CANCELLED",  label: "Cancel" },
  ];

  const selectedDeliveryLabel = DELIVERY_FILTER_OPTIONS.find(o => o.value === filterDelivery)?.label || "Filter by Delivery …";

  // Shared trigger button style
  const triggerStyle = {
    height: 38, display: "flex", alignItems: "center", gap: 8,
    padding: "0 14px", borderRadius: 7, border: `1px solid ${t.border}`,
    background: t.surface, color: t.text, fontSize: 13,
    fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
    userSelect: "none", transition: "border-color 0.15s",
  };

  // Dropdown panel style
  const panelStyle = {
    position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 999,
    background: t.surface, border: `1px solid ${t.border}`,
    borderRadius: 8, minWidth: "100%", overflow: "hidden",
    boxShadow: t.dark ? "0 8px 24px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.15)",
  };

  return (
    <div>
      {/* Header + Filter bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 20, flexWrap: "wrap", gap: 12 }}>

        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.text }}>All Orders</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>

          {/* ── Bulk Action custom dropdown ── */}
          <div style={{ position: "relative" }} onMouseDown={e => e.stopPropagation()}>
            <div
              style={{ ...triggerStyle, minWidth: 136,
                borderColor: bulkOpen ? (t.dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)") : t.border }}
              onClick={() => { setBulkOpen(o => !o); setDeliveryOpen(false); }}
            >
              <span style={{ flex: 1, color: t.textSub }}>Bulk Action</span>
              <span style={{ fontSize: 10, color: t.textMuted,
                transform: bulkOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s", display: "inline-block" }}>▾</span>
            </div>
            {bulkOpen && (
              <div style={panelStyle}>
                <div
                  style={{ padding: "9px 16px", fontSize: 13, color: t.textSub,
                    cursor: "pointer", transition: "background 0.12s" }}
                  onMouseEnter={e => e.currentTarget.style.background = t.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  onClick={() => { setBulkOpen(false); handleBulkDelete(); }}
                >
                  Delete selection
                </div>
              </div>
            )}
          </div>

          {/* ── Filter by Delivery custom dropdown ── */}
          <div style={{ position: "relative" }} onMouseDown={e => e.stopPropagation()}>
            <div
              style={{ ...triggerStyle, minWidth: 182,
                borderColor: deliveryOpen ? (t.dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)") : t.border,
                color: filterDelivery ? t.text : t.textSub }}
              onClick={() => { setDeliveryOpen(o => !o); setBulkOpen(false); }}
            >
              <span style={{ flex: 1 }}>
                {filterDelivery
                  ? DELIVERY_FILTER_OPTIONS.find(o => o.value === filterDelivery)?.label
                  : "Filter by Delivery …"}
              </span>
              <span style={{ fontSize: 10, color: t.textMuted,
                transform: deliveryOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s", display: "inline-block" }}>▾</span>
            </div>
            {deliveryOpen && (
              <div style={{ ...panelStyle, maxHeight: 260, overflowY: "auto" }}>
                {DELIVERY_FILTER_OPTIONS.map(opt => (
                  <div
                    key={opt.value}
                    style={{
                      padding: "9px 16px", fontSize: 13,
                      cursor: opt.isHeader ? "default" : "pointer",
                      background: opt.isHeader
                        ? (t.dark ? "#1d4ed8" : "#3b82f6")
                        : opt.value === filterDelivery
                          ? (t.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)")
                          : "transparent",
                      color: opt.isHeader ? "#fff" : t.text,
                      fontWeight: opt.isHeader ? 600 : 400,
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => {
                      if (!opt.isHeader) e.currentTarget.style.background = t.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
                    }}
                    onMouseLeave={e => {
                      if (!opt.isHeader) e.currentTarget.style.background =
                        opt.value === filterDelivery ? (t.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)") : "transparent";
                    }}
                    onClick={() => {
                      if (!opt.isHeader) { setFilterDelivery(opt.value); setDeliveryOpen(false); }
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Filter by date ── */}
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{ height: 38, padding: "0 12px", borderRadius: 7,
              border: `1px solid ${t.border}`, background: t.surface,
              color: filterDate ? t.text : t.textSub, fontSize: 13,
              fontFamily: "inherit", outline: "none", minWidth: 150,
              cursor: "pointer" }}
            onFocus={e => e.target.style.borderColor = t.dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"}
            onBlur={e => e.target.style.borderColor = t.border}
          />

          {/* ── Order code search ── */}
          <input
            value={filterCode}
            onChange={e => setFilterCode(e.target.value)}
            onKeyDown={e => e.key === "Enter" && load(page)}
            placeholder="Type Order code & hit…"
            style={{ height: 38, padding: "0 12px", borderRadius: 7,
              border: `1px solid ${t.border}`, background: t.surface,
              color: t.text, fontSize: 13, fontFamily: "inherit",
              outline: "none", minWidth: 200 }}
            onFocus={e => e.target.style.borderColor = t.dark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)"}
            onBlur={e => e.target.style.borderColor = t.border}
          />

          {/* ── Filter button ── */}
          <button
            onClick={() => { setBulkOpen(false); setDeliveryOpen(false); load(page); }}
            style={{ height: 38, padding: "0 24px", borderRadius: 7, border: "none",
              background: RED, color: "#fff", fontWeight: 700, fontSize: 13,
              fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.3px",
              transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = RED_DARK}
            onMouseLeave={e => e.currentTarget.style.background = RED}
          >
            Filter
          </button>

        </div>
      </div>

      {/* Table */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.border}` }}>
              <th style={{ padding: "12px 16px", width: 40 }}>
                <input type="checkbox" checked={selAll} onChange={toggleAll}
                  style={{ accentColor: RED, cursor: "pointer" }} />
              </th>
              {["Order Code:", "Num. of Products", "Customer", "Amount", "Delivery Status", "Payment Status", "Options"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: t.text,
                  fontSize: 12.5, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${t.border}` }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div style={{ height: 13, borderRadius: 4, background: t.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", width: `${40 + (j * 13) % 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              : filteredOrders.length === 0
                ? <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: t.textMuted }}>No orders found</td></tr>
                : filteredOrders.map(o => {
                    const subtotal = o.items?.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0) || o.totalAmount || 0;
                    return (
                      <tr key={o.id} style={{ borderBottom: `1px solid ${t.border}`, transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = t.dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "12px 16px" }}>
                          <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSel(o.id)}
                            style={{ accentColor: RED, cursor: "pointer" }} />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ color: t.text, fontWeight: 600, fontSize: 12.5 }}>{o.orderNumber}</span>
                        </td>
                        <td style={{ padding: "12px 16px", color: t.textSub }}>{o.items?.length ?? "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ color: t.text, fontWeight: 500 }}>
                            {o.enquiryName || o.customerName || "Guest"}
                            {!o.enquiryName && !o.customerName && o.id && <span style={{ color: t.textMuted, fontSize: 11 }}> ({o.id})</span>}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: t.textSub }}>
                          Rs{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "12px 16px", color: t.textMuted, fontSize: 12 }}>
                          {o.status?.charAt(0) + (o.status || "").slice(1).toLowerCase()}
                        </td>
                        <td style={{ padding: "12px 16px" }}>{payBadge(o.paymentStatus)}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {/* View */}
                            <button onClick={() => openDetail(o)}
                              style={{ width: 32, height: 32, borderRadius: "50%", background: t.dark ? "rgba(255,255,255,0.08)" : "#111", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, transition: "opacity 0.15s" }}
                              title="View">👁</button>
                            {/* Download/Print */}
                            <button onClick={() => window.print()}
                              style={{ width: 32, height: 32, borderRadius: "50%", background: t.dark ? "rgba(255,255,255,0.08)" : "#111", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}
                              title="Print">⬇</button>
                            {/* Delete */}
                            <button onClick={() => handleDelete(o.id)}
                              style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(230,46,4,0.10)", border: "1px solid rgba(230,46,4,0.25)", color: RED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}
                              title="Delete">🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
            }
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <Pages page={page} total={totalPages} onChange={p => { setPage(p); load(p); }} />
        </div>
      )}
    </div>
  );
}

// Customers
function CustomersSection({ setToast }) {
  const t = useTokens();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [toggling, setToggling] = useState(null);
  const [sel, setSel] = useState(null);
  const [modal, setModal] = useState(null);

  const load = useCallback(p => {
    setLoading(true);
    adminFetch(`/admin/users?page=${p}&size=15`)
      .then(d => { setUsers(d?.content || []); setTotalPages(d?.totalPages || 0); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(page); }, [page]);

  const handleToggle = async u => {
    setToggling(u.id);
    try {
      await adminFetch(`/admin/users/${u.id}/toggle-status`, { method: "PATCH" });
      setToast({ msg: `User account ${u.active ? "disabled" : "enabled"}.`, type: "success" });
      load(page);
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setToggling(null); }
  };

  const [delUser, setDelUser]     = useState(null);
  const [deleting, setDeleting]   = useState(false);

  const handleDelete = async () => {
    if (!delUser) return;
    setDeleting(true);
    try {
      await adminFetch(`/admin/users/${delUser.id}`, { method: "DELETE" });
      setToast({ msg: `User "${delUser.firstName} ${delUser.lastName}" deleted.`, type: "success" });
      setDelUser(null);
      load(page);
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <SectionHeader title="Customer List" right={<Pages page={page} total={totalPages} onChange={p => { setPage(p); load(p); }} />} />
      <Table cols={["ID", "Name", "Email", "Phone", "Role", "Joined", "Status", "Actions"]} loading={loading}
        rows={users.map(u => [
          <span style={{ color: t.textMuted, fontSize: 12 }}>{u.id}</span>,
          <span style={{ color: t.text, fontWeight: 600 }}>{`${u.firstName || ""} ${u.lastName || ""}`.trim() || "—"}</span>,
          <span style={{ color: t.textSub }}>{u.email}</span>,
          <span style={{ color: t.textMuted }}>{u.phone || "—"}</span>,
          <Badge status={u.role} />,
          <span style={{ color: t.textMuted }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</span>,
          <Badge status={u.active ? "ACTIVE" : "INACTIVE"} />,
          <div style={{ display: "flex", gap: 6 }}>
            <Btn size="sm" variant="secondary" onClick={() => { setSel(u); setModal("view"); }}>View</Btn>
            {u.role !== "ADMIN" && (
              <Btn size="sm" variant={u.active ? "danger" : "success"} disabled={toggling === u.id} onClick={() => handleToggle(u)}>
                {toggling === u.id ? "…" : u.active ? "Disable" : "Enable"}
              </Btn>
            )}
            {u.role !== "ADMIN" && (
              <Btn size="sm" variant="danger" onClick={() => setDelUser(u)}>Delete</Btn>
            )}
          </div>,
        ])}
      />
      <Modal open={modal === "view"} onClose={() => setModal(null)} title="Customer Details" width={440}>
        {sel && (
          <div style={{ fontSize: 13, color: t.textSub }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${RED},${RED_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
                {(sel.firstName || sel.email || "U")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{`${sel.firstName || ""} ${sel.lastName || ""}`.trim() || "Unknown"}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>{sel.email}</div>
              </div>
            </div>
            {[["User ID", sel.id], ["Phone", sel.phone || "Not provided"], ["Role", <Badge key="r" status={sel.role} />], ["Status", <Badge key="s" status={sel.active ? "ACTIVE" : "INACTIVE"} />], ["Joined", sel.createdAt ? new Date(sel.createdAt).toLocaleString("en-IN") : "—"]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
                <span style={{ fontSize: 12, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.4px" }}>{l}</span>
                <span style={{ color: t.text, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!delUser} onClose={() => setDelUser(null)} title="Delete User Account" width={420}>
        {delUser && (
          <div style={{ fontSize: 14, color: t.textSub }}>
            <div style={{ background: "rgba(230,46,4,0.07)", border: "1px solid rgba(230,46,4,0.2)", borderRadius: 10, padding: "16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg,${RED},${RED_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                {(delUser.firstName || delUser.email || "U")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: t.text }}>{`${delUser.firstName || ""} ${delUser.lastName || ""}`.trim() || "Unknown"}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>{delUser.email}</div>
              </div>
            </div>
            <p style={{ margin: "0 0 8px", color: t.text, fontWeight: 600 }}>Are you sure you want to permanently delete this account?</p>
            <p style={{ margin: "0 0 24px", color: t.textMuted, fontSize: 13 }}>This action cannot be undone. All data associated with this user will be permanently removed.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setDelUser(null)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn variant="danger" onClick={handleDelete} disabled={deleting} style={{ flex: 1 }}>{deleting ? "Deleting…" : "Yes, Delete"}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Reviews
function ReviewsSection({ setToast }) {
  const t = useTokens();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pid, setPid] = useState("");
  const [pidInput, setPidInput] = useState("");

  const load = useCallback((p, id) => {
    if (!id) return;
    setLoading(true);
    adminFetch(`/reviews/product/${id}?page=${p}&size=12`)
      .then(d => { setReviews(d?.content || []); setTotalPages(d?.totalPages || 0); })
      .catch(() => { setReviews([]); setTotalPages(0); })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { if (pid) load(page, pid); }, [page, pid]);

  const Stars = ({ n }) => <span style={{ color: "#f59e0b" }}>{"★".repeat(Math.max(0, Math.min(5, n || 0)))}{"☆".repeat(5 - Math.max(0, Math.min(5, n || 0)))}</span>;

  return (
    <div>
      <SectionHeader title="Product Reviews" right={
        <div style={{ display: "flex", gap: 8 }}>
          <Inp value={pidInput} onChange={e => setPidInput(e.target.value)} placeholder="Enter Product ID…" style={{ width: 200 }} />
          <Btn onClick={() => { if (pidInput.trim()) { setPid(pidInput.trim()); setPage(0); } }}>Load Reviews</Btn>
          <Pages page={page} total={totalPages} onChange={p => { setPage(p); load(p, pid); }} />
        </div>
      } />
      {!pid
        ? <div style={{ padding: 60, textAlign: "center", color: t.textMuted, background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 16, backdropFilter: "blur(16px)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
            <div style={{ fontWeight: 700, color: t.textSub, marginBottom: 6 }}>No product selected</div>
            <div style={{ fontSize: 13 }}>Enter a Product ID above and click "Load Reviews"</div>
          </div>
        : <Table cols={["ID", "Reviewer", "Rating", "Comment", "Date", "Status"]} loading={loading}
            rows={reviews.map(r => [
              <span style={{ color: t.textMuted }}>{r.id}</span>,
              <span style={{ color: t.text, fontWeight: 600 }}>{r.reviewerName || "Anonymous"}</span>,
              <Stars n={r.rating} />,
              <span style={{ color: t.textSub }}>{r.comment || "—"}</span>,
              <span style={{ color: t.textMuted }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : "—"}</span>,
              <Badge status={r.approved ? "APPROVED" : "PENDING_REVIEW"} />,
            ])}
          />
      }
    </div>
  );
}

// Brands
function BrandsSection({ setToast }) {
  const t = useTokens();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [delTarget, setDelTarget] = useState(null);
  const blank = { name: "", logo: "", metaTitle: "", metaDescription: "", slug: "" };
  const [form, setForm] = useState(blank);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const load = () => {
    setLoading(true);
    adminFetch("/brands").then(d => setBrands(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd  = () => { setSel(null); setForm(blank); };
  const openEdit = b => {
    setSel(b);
    setForm({ name: b.name || "", logo: b.imageUrl || "", metaTitle: b.metaTitle || "", metaDescription: b.metaDescription || "", slug: b.slug || "" });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setToast({ msg: "Brand name is required.", type: "error" }); return; }
    setSaving(true);
    try {
      const body = {
        name: form.name,
        href: sel?.href || "",
        metaTitle: form.metaTitle || null,
        metaDescription: form.metaDescription || null,
        slug: form.slug || null,
        active: true,
        ...(typeof form.logo === "string" ? { imageUrl: form.logo || null } : {}),
      };
      let saved;
      if (!sel) saved = await adminFetch("/brands", { method: "POST", body: JSON.stringify(body) });
      else      saved = await adminFetch(`/brands/${sel.id}`, { method: "PUT", body: JSON.stringify(body) });

      const brandId = saved?.id || sel?.id;
      if (brandId && form.logo instanceof File) {
        const token = getToken();
        const fd = new FormData();
        fd.append("image", form.logo);
        await fetch(`${BASE_URL}/brands/${brandId}/image`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
      }

      setToast({ msg: `Brand ${sel ? "updated" : "created"}!`, type: "success" });
      setSel(null); setForm(blank); load();
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setSaving(false); }
  };

  const handleDel = async () => {
    setSaving(true);
    try {
      await adminFetch(`/brands/${delTarget.id}`, { method: "DELETE" });
      setToast({ msg: "Brand deleted.", type: "success" });
      setDelTarget(null);
      if (sel?.id === delTarget.id) { setSel(null); setForm(blank); }
      load();
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <SectionHeader title="All Brands" />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "flex-start" }}>
        <Card title="Brands">
          <Table cols={["#", "Name", "Logo", "Options"]} loading={loading}
            rows={brands.map((b, i) => [
              <span style={{ color: t.textMuted }}>{i + 1}</span>,
              <span style={{ color: t.text, fontWeight: 600 }}>{b.name}</span>,
              b.imageUrl
                ? <img src={resolveImageUrl(b.imageUrl)} alt="" style={{ width: 60, height: 40, objectFit: "contain", borderRadius: 6, background: t.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", border: `1px solid ${t.border}` }} onError={e => e.target.style.display = "none"} />
                : <div style={{ width: 60, height: 40, borderRadius: 6, background: t.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏷️</div>,
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="secondary" onClick={() => openEdit(b)}>✎</Btn>
                <Btn size="sm" variant="danger" onClick={() => setDelTarget(b)}>🗑</Btn>
              </div>,
            ])}
          />
        </Card>

        <Card title={sel ? "Edit Brand" : "Add New Brand"}>
          <Field label="Name">
            <Inp value={form.name} onChange={e => f("name", e.target.value)} placeholder="Name" />
          </Field>
          <ImageInput label="Logo (120x80)" value={form.logo} onChange={v => f("logo", v)} />
          <Field label="Meta Title">
            <Inp value={form.metaTitle} onChange={e => f("metaTitle", e.target.value)} placeholder="Meta Title" />
          </Field>
          <Field label="Meta description">
            <Txta value={form.metaDescription} onChange={e => f("metaDescription", e.target.value)} rows={4} placeholder="Meta description" />
          </Field>
          {sel && (
            <Field label="Slug">
              <Inp value={form.slug} onChange={e => f("slug", e.target.value)} placeholder="slug" />
            </Field>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            {sel && <Btn variant="ghost" onClick={() => { setSel(null); setForm(blank); }}>Cancel</Btn>}
            <Btn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
          </div>
        </Card>
      </div>

      <Modal open={!!delTarget} onClose={() => setDelTarget(null)} title="Delete Brand" width={400}>
        <p style={{ color: t.textSub, fontSize: 14, marginBottom: 20 }}>Delete <strong style={{ color: t.text }}>{delTarget?.name}</strong>? This cannot be undone.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setDelTarget(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDel} disabled={saving}>{saving ? "Deleting…" : "Yes, Delete"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// Sales Report
function SalesReportSection() {
  const t = useTokens();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminFetch("/admin/dashboard"), adminFetch("/admin/orders?page=0&size=50")])
      .then(([s, o]) => { setStats(s); setOrders(o?.content || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const kpiCards = [
    { label: "Total Enquiries",  value: stats?.totalOrders ?? "—", icon: "📋", c: RED },
    { label: "Total Orders",     value: stats?.totalOrders ?? "—", icon: "🛒", c: "#0470e6" },
    { label: "Delivered Orders", value: loading ? "—" : orders.filter(o => o.status === "DELIVERED").length, icon: "✅", c: "#04b486" },
    { label: "Pending Orders",   value: stats?.pendingOrders ?? "—", icon: "⏳", c: "#e6b804" },
    { label: "Cancelled Orders", value: loading ? "—" : orders.filter(o => o.status === "CANCELLED").length, icon: "✕", c: "#dc2626" },
    { label: "Pending Enquiries", value: stats?.pendingOrders ?? "—", icon: "⏳", c: "#8b04e6" },
  ];

  return (
    <div>
      <SectionHeader title="Sales Report" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
        {kpiCards.map(k => (
          <div key={k.label} style={{ background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 14, padding: 18, backdropFilter: "blur(16px)" }}>
            <div style={{ fontSize: 24, marginBottom: 7 }}>{k.icon}</div>
            <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: k.c, fontFamily: "'Georgia',serif" }}>{loading ? "—" : k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 16, padding: 22, backdropFilter: "blur(16px)" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: t.text, marginBottom: 18 }}>Order Status Breakdown (Last 50 Orders)</div>
        {loading ? <div style={{ color: t.textMuted, fontSize: 13 }}>Loading…</div> :
          ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(status => {
            const count = orders.filter(o => o.status === status).length;
            const pct = orders.length ? Math.round(count / orders.length * 100) : 0;
            const colors = { PENDING: "#fbbf24", CONFIRMED: "#60a5fa", PROCESSING: "#a78bfa", SHIPPED: "#fbbf24", DELIVERED: "#34d399", CANCELLED: "#f87171" };
            return (
              <div key={status} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: t.textSub, marginBottom: 4 }}>
                  <span>{status}</span><span>{count} ({pct}%)</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: t.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}>
                  <div style={{ height: "100%", borderRadius: 4, width: `${pct}%`, background: colors[status] || "#888", transition: "width 0.8s" }} />
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

// Wishlist
function WishlistSection() {
  const t = useTokens();
  return (
    <div style={{ padding: 60, textAlign: "center", color: t.textSub, background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 16, backdropFilter: "blur(16px)" }}>
      <div style={{ fontSize: 48, marginBottom: 14 }}>❤️</div>
      <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800, color: t.text, fontFamily: "'Georgia',serif" }}>Products Wishlist</h2>
      <p style={{ margin: "0 auto", fontSize: 14, color: t.textSub, maxWidth: 340, lineHeight: 1.7 }}>Customer wishlist data is user-specific. Customers manage their wishlist from their profile page.</p>
      <div style={{ marginTop: 22 }}>
        <Link to="/wishlist" style={{ color: RED, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>→ View Wishlist Page</Link>
      </div>
    </div>
  );
}

// Delivery Partners
function DeliverySection({ setToast }) {
  const t = useTokens();
  const [partners, setPartners] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", area: "", vehicle: "" });
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => { setPartners(JSON.parse(localStorage.getItem("ybm_delivery_partners") || "[]")); }, []);
  const save = list => { localStorage.setItem("ybm_delivery_partners", JSON.stringify(list)); setPartners(list); };

  const handleAdd = () => {
    if (!form.name.trim() || !form.phone.trim()) { setToast({ msg: "Name and phone are required.", type: "error" }); return; }
    setSaving(true);
    save([...partners, { id: Date.now(), ...form, active: true, createdAt: new Date().toISOString() }]);
    setToast({ msg: "Delivery partner added!", type: "success" });
    setModal(null); setSaving(false);
  };

  return (
    <div>
      <SectionHeader title="Delivery Partners" right={<Btn onClick={() => { setForm({ name: "", phone: "", email: "", area: "", vehicle: "" }); setModal("add"); }}>＋ Add Partner</Btn>} />
      <Table cols={["#", "Name", "Phone", "Email", "Area", "Vehicle", "Status", "Actions"]} loading={false}
        rows={partners.map((p, i) => [
          <span style={{ color: t.textMuted }}>{i + 1}</span>,
          <span style={{ color: t.text, fontWeight: 600 }}>{p.name}</span>,
          <span style={{ color: t.textSub }}>{p.phone}</span>,
          <span style={{ color: t.textMuted }}>{p.email || "—"}</span>,
          <span style={{ color: t.textMuted }}>{p.area || "—"}</span>,
          <span style={{ color: t.textMuted }}>{p.vehicle || "—"}</span>,
          <Badge status={p.active ? "ACTIVE" : "INACTIVE"} />,
          <div style={{ display: "flex", gap: 6 }}>
            <Btn size="sm" variant={p.active ? "warning" : "success"} onClick={() => { save(partners.map(x => x.id === p.id ? { ...x, active: !x.active } : x)); setToast({ msg: "Status updated.", type: "success" }); }}>{p.active ? "Deactivate" : "Activate"}</Btn>
            <Btn size="sm" variant="danger" onClick={() => { save(partners.filter(x => x.id !== p.id)); setToast({ msg: "Partner removed.", type: "success" }); }}>Remove</Btn>
          </div>,
        ])}
      />
      {partners.length === 0 && <div style={{ textAlign: "center", padding: 40, color: t.textMuted, fontSize: 13 }}>No delivery partners added yet.</div>}
      <Modal open={modal === "add"} onClose={() => setModal(null)} title="Add Delivery Partner" width={460}>
        <Field label="Full Name *"><Inp value={form.name} onChange={e => f("name", e.target.value)} placeholder="Partner's full name" /></Field>
        <Field label="Phone *"><Inp value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="+91 00000 00000" /></Field>
        <Field label="Email"><Inp type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="partner@example.com" /></Field>
        <Field label="Service Area"><Inp value={form.area} onChange={e => f("area", e.target.value)} placeholder="e.g. Mumbai North, Delhi NCR" /></Field>
        <Field label="Vehicle Type"><Inp value={form.vehicle} onChange={e => f("vehicle", e.target.value)} placeholder="e.g. Truck, Pickup, Tempo" /></Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
          <Btn onClick={handleAdd} disabled={saving}>{saving ? "Adding…" : "Add Partner"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// Staffs
function StaffsSection({ setToast }) {
  const t = useTokens();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [toggling, setToggling] = useState(null);
  const [delUser, setDelUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(p => {
    setLoading(true);
    adminFetch(`/admin/users?page=${p}&size=15`)
      .then(d => { const all = d?.content || []; setUsers(all.filter(u => u.role === "ADMIN" || u.role === "SELLER")); setTotalPages(d?.totalPages || 0); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(page); }, [page]);

  const handleToggle = async u => {
    setToggling(u.id);
    try {
      await adminFetch(`/admin/users/${u.id}/toggle-status`, { method: "PATCH" });
      setToast({ msg: `Account ${u.active ? "disabled" : "enabled"} for ${u.firstName}.`, type: "success" });
      load(page);
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setToggling(null); }
  };

  const handleDelete = async () => {
    if (!delUser) return;
    setDeleting(true);
    try {
      await adminFetch(`/admin/users/${delUser.id}`, { method: "DELETE" });
      setToast({ msg: `Staff account "${delUser.firstName} ${delUser.lastName}" deleted.`, type: "success" });
      setDelUser(null);
      load(page);
    } catch (e) { setToast({ msg: e.message, type: "error" }); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <SectionHeader title="Staff Members" right={<Pages page={page} total={totalPages} onChange={p => { setPage(p); load(p); }} />} />
      <Table cols={["ID", "Name", "Email", "Role", "Status", "Joined", "Actions"]} loading={loading}
        rows={users.map(u => [
          <span style={{ color: t.textMuted }}>{u.id}</span>,
          <span style={{ color: t.text, fontWeight: 600 }}>{`${u.firstName || ""} ${u.lastName || ""}`.trim() || "—"}</span>,
          <span style={{ color: t.textSub }}>{u.email}</span>,
          <Badge status={u.role} />,
          <Badge status={u.active ? "ACTIVE" : "INACTIVE"} />,
          <span style={{ color: t.textMuted }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}</span>,
          <div style={{ display: "flex", gap: 6 }}>
            {u.role === "ADMIN" ? (
              <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(230,46,4,0.08)", color: RED, fontWeight: 700, border: "1px solid rgba(230,46,4,0.2)" }}>Protected</span>
            ) : (
              <>
                <Btn size="sm" variant={u.active ? "danger" : "success"} disabled={toggling === u.id} onClick={() => handleToggle(u)}>
                  {toggling === u.id ? "…" : u.active ? "Disable" : "Enable"}
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => setDelUser(u)}>Delete</Btn>
              </>
            )}
          </div>,
        ])}
      />
      <div style={{ marginTop: 14, padding: "13px 18px", background: t.dark ? "rgba(230,46,4,0.07)" : "rgba(230,46,4,0.05)", border: `1px solid rgba(230,46,4,0.16)`, borderRadius: 10, fontSize: 13, color: t.textSub }}>
        <strong style={{ color: RED }}>Note:</strong> Admin accounts are protected and cannot be disabled or deleted from the panel. Only SELLER accounts can be managed here. Role promotion (USER → SELLER) must be done via the backend database.
      </div>

      {/* Delete confirmation modal */}
      <Modal open={!!delUser} onClose={() => setDelUser(null)} title="Delete Staff Account" width={420}>
        {delUser && (
          <div style={{ fontSize: 14, color: t.textSub }}>
            <div style={{ background: "rgba(230,46,4,0.07)", border: "1px solid rgba(230,46,4,0.2)", borderRadius: 10, padding: "16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg,${RED},${RED_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                {(delUser.firstName || delUser.email || "U")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: t.text }}>{`${delUser.firstName || ""} ${delUser.lastName || ""}`.trim() || "Unknown"}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>{delUser.email}</div>
                <Badge status={delUser.role} />
              </div>
            </div>
            <p style={{ margin: "0 0 8px", color: t.text, fontWeight: 600 }}>Are you sure you want to permanently delete this staff account?</p>
            <p style={{ margin: "0 0 24px", color: t.textMuted, fontSize: 13 }}>This action cannot be undone. All data associated with this account will be permanently removed. The last admin account cannot be deleted.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setDelUser(null)} style={{ flex: 1 }}>Cancel</Btn>
              <Btn variant="danger" onClick={handleDelete} disabled={deleting} style={{ flex: 1 }}>{deleting ? "Deleting…" : "Yes, Delete"}</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── BLOG POSTS SECTION ───────────────────────────────────────────────────────
function BlogSection({ setToast }) {
  const t = useTokens();
  const [posts, setPosts]       = useState([]);
  const [cats, setCats]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [sel, setSel]           = useState(null);
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState("");
  const bannerRef    = useRef(null);
  const metaImgRef   = useRef(null);
  const [bannerFile,     setBannerFile]     = useState(null);
  const [metaImgFile,    setMetaImgFile]    = useState(null);
  const [bannerPreview,  setBannerPreview]  = useState(null);
  const [metaImgPreview, setMetaImgPreview] = useState(null);

  const blankForm = { title:"",categoryId:"",slug:"",shortDescription:"",description:"",metaTitle:"",metaDescription:"",metaKeywords:"",published:true };
  const [form, setForm] = useState(blankForm);
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const load = async () => {
    try {
      setLoading(true);
      const [p,c] = await Promise.all([blogApi.getPosts({ all: true }), blogApi.getCategories()]);
      setPosts(Array.isArray(p)?p:[]);
      setCats(Array.isArray(c)?c:[]);
    } catch(e){ setToast({msg:"Failed to load blog data: "+e.message,type:"error"}); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[]);

  const openNew = () => {
    setForm(blankForm); setSel(null);
    setBannerFile(null); setBannerPreview(null);
    setMetaImgFile(null); setMetaImgPreview(null);
    setModal("form");
  };

  const openEdit = (p) => {
    setSel(p);
    setForm({ title:p.title||"",categoryId:p.categoryId||"",slug:p.slug||"",shortDescription:p.shortDescription||"",description:p.description||"",metaTitle:p.metaTitle||"",metaDescription:p.metaDescription||"",metaKeywords:p.metaKeywords||"",published:!!p.published });
    setBannerFile(null);  setBannerPreview(p.bannerImageUrl ? (p.bannerImageUrl.startsWith("http") ? p.bannerImageUrl : `${BASE_URL}${p.bannerImageUrl}`) : null);
    setMetaImgFile(null); setMetaImgPreview(p.metaImageUrl  ? (p.metaImageUrl.startsWith("http")  ? p.metaImageUrl  : `${BASE_URL}${p.metaImageUrl}`)  : null);
    setModal("form");
  };

  const handleFileChange = (e,setFile,setPreview) => {
    const file = e.target.files?.[0]; if(!file) return;
    setFile(file); setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if(!form.title.trim())            { setToast({msg:"Title is required.",type:"error"}); return; }
    if(!form.categoryId)              { setToast({msg:"Category is required.",type:"error"}); return; }
    if(!form.shortDescription.trim()) { setToast({msg:"Short description is required.",type:"error"}); return; }
    setSaving(true);
    try {
      const payload = {...form, categoryId:Number(form.categoryId)};
      if(sel) await blogApi.updatePost(sel.id, payload, bannerFile, metaImgFile);
      else    await blogApi.createPost(payload, bannerFile, metaImgFile);
      setToast({msg:`Post ${sel?"updated":"created"} successfully!`,type:"success"});
      setModal(null); load();
    } catch(e){ setToast({msg:e.message,type:"error"}); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await blogApi.deletePost(sel.id);
      setToast({msg:"Post deleted.",type:"success"});
      setModal(null); setSel(null); load();
    } catch(e){ setToast({msg:e.message,type:"error"}); }
    finally { setSaving(false); }
  };

  const handleToggle = async (post) => {
    try { await blogApi.togglePublished(post.id); load(); }
    catch(e){ setToast({msg:e.message,type:"error"}); }
  };

  const filtered = posts.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.categoryName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <SectionHeader title="All Posts" right={
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Type & Enter" style={{width:200,height:36}} />
          <Btn onClick={openNew}>＋ Add New Post</Btn>
        </div>
      } />
      <Table cols={["#","Title","Category","Short Description","Status","Options"]} loading={loading}
        rows={filtered.map((p,i)=>[
          <span style={{color:t.textMuted}}>{i+1}</span>,
          <span style={{color:t.text,fontWeight:600}}>{p.title}</span>,
          <span style={{color:t.textSub,fontSize:12,fontWeight:700}}>{p.categoryName||"—"}</span>,
          <span style={{color:t.textMuted,fontSize:12,maxWidth:300,display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.shortDescription||"—"}</span>,
          <div onClick={()=>handleToggle(p)} style={{width:40,height:22,borderRadius:11,position:"relative",cursor:"pointer",flexShrink:0,background:p.published?RED:(t.dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.15)"),transition:"background 0.25s"}}>
            <div style={{position:"absolute",top:2,left:p.published?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.25s",boxShadow:"0 1px 4px rgba(0,0,0,0.25)"}} />
          </div>,
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>openEdit(p)} style={{width:32,height:32,borderRadius:"50%",border:"none",background:t.dark?"#1a1a1a":"#222",color:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
            <button onClick={()=>{setSel(p);setModal("del");}} style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${RED}40`,background:"transparent",color:RED,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
          </div>,
        ])}
      />
      {!loading && filtered.length===0 && <div style={{textAlign:"center",padding:40,color:t.textMuted,fontSize:13}}>No blog posts yet. Click "Add New Post" to create one.</div>}

      <Modal open={modal==="form"} onClose={()=>setModal(null)} title={sel?"Edit Blog Post":"New Blog Post"} width={700}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Field label="Blog Title *">
            <Inp value={form.title} onChange={e=>{f("title",e.target.value);if(!sel)f("slug",e.target.value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-"));}} placeholder="Post title…" />
          </Field>
          <Field label="Category *">
            <select value={form.categoryId} onChange={e=>f("categoryId",e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,fontSize:13.5}}>
              <option value="">— Select Category —</option>
              {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Slug"><Inp value={form.slug} onChange={e=>f("slug",e.target.value)} placeholder="auto-generated-from-title" /></Field>
        <Field label="Banner Image (1300×650)">
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <button onClick={()=>bannerRef.current?.click()} style={{padding:"8px 18px",borderRadius:8,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,cursor:"pointer",fontSize:13}}>Browse</button>
            <span style={{fontSize:13,color:t.textMuted}}>{bannerFile?bannerFile.name:(sel?.bannerImage?"1 File selected":"No file chosen")}</span>
            <input ref={bannerRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFileChange(e,setBannerFile,setBannerPreview)} />
          </div>
          {bannerPreview&&<div style={{marginTop:8,position:"relative",display:"inline-block"}}>
            <img src={bannerPreview} alt="banner" style={{height:80,borderRadius:8,border:`1px solid ${t.border}`,objectFit:"cover"}} />
            <button onClick={()=>{setBannerFile(null);setBannerPreview(null);}} style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",border:"none",background:RED,color:"#fff",cursor:"pointer",fontSize:11,lineHeight:"20px",textAlign:"center"}}>✕</button>
          </div>}
        </Field>
        <Field label="Short Description *"><RichTextEditor value={form.shortDescription} onChange={html=>f("shortDescription",html)} placeholder="Brief summary…" minHeight={90} /></Field>
        <Field label="Description"><RichTextEditor value={form.description} onChange={html=>f("description",html)} placeholder="Full blog post content…" minHeight={220} /></Field>
        <div style={{borderTop:`1px solid ${t.border}`,paddingTop:16,marginTop:4}}>
          <div style={{fontSize:12,fontWeight:700,color:t.textMuted,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:14}}>SEO / Meta</div>
          <Field label="Meta Title"><Inp value={form.metaTitle} onChange={e=>f("metaTitle",e.target.value)} placeholder="Meta Title" /></Field>
          <Field label="Meta Image (200×200)+">
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <button onClick={()=>metaImgRef.current?.click()} style={{padding:"8px 18px",borderRadius:8,border:`1px solid ${t.border}`,background:t.inputBg,color:t.text,cursor:"pointer",fontSize:13}}>Browse</button>
              <span style={{fontSize:13,color:t.textMuted}}>{metaImgFile?metaImgFile.name:(sel?.metaImage?"1 File selected":"Choose File")}</span>
              <input ref={metaImgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFileChange(e,setMetaImgFile,setMetaImgPreview)} />
            </div>
            {metaImgPreview&&<div style={{marginTop:8,position:"relative",display:"inline-block"}}>
              <img src={metaImgPreview} alt="meta" style={{height:60,borderRadius:8,border:`1px solid ${t.border}`,objectFit:"cover"}} />
              <button onClick={()=>{setMetaImgFile(null);setMetaImgPreview(null);}} style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",border:"none",background:RED,color:"#fff",cursor:"pointer",fontSize:11,lineHeight:"20px",textAlign:"center"}}>✕</button>
            </div>}
          </Field>
          <Field label="Meta Description"><Txta value={form.metaDescription} onChange={e=>f("metaDescription",e.target.value)} placeholder="Meta description…" rows={3} /></Field>
          <Field label="Meta Keywords"><Inp value={form.metaKeywords} onChange={e=>f("metaKeywords",e.target.value)} placeholder="keyword1, keyword2" /></Field>
        </div>
        <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",marginBottom:20}}>
          <div onClick={()=>f("published",!form.published)} style={{width:40,height:22,borderRadius:11,position:"relative",cursor:"pointer",background:form.published?RED:(t.dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.12)"),transition:"background 0.25s"}}>
            <div style={{position:"absolute",top:2,left:form.published?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.25s",boxShadow:"0 1px 4px rgba(0,0,0,0.25)"}} />
          </div>
          <span style={{fontSize:13.5,color:t.text}}>Publish immediately</span>
        </label>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving}>{saving?"Saving…":sel?"Save Changes":"Publish Post"}</Btn>
        </div>
      </Modal>

      <Modal open={modal==="del"} onClose={()=>setModal(null)} title="Delete Post" width={420}>
        <p style={{color:t.textSub,fontSize:14,marginBottom:20}}>Delete post <strong style={{color:t.text}}>"{sel?.title}"</strong>? This cannot be undone.</p>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDelete} disabled={saving}>{saving?"Deleting…":"Yes, Delete"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── BLOG CATEGORIES SECTION ──────────────────────────────────────────────────
function BlogCategoriesSection({ setToast }) {
  const t = useTokens();
  const [cats,setCats]         = useState([]);
  const [loading,setLoading]   = useState(true);
  const [modal,setModal]       = useState(null);
  const [sel,setSel]           = useState(null);
  const [saving,setSaving]     = useState(false);
  const [search,setSearch]     = useState("");
  const [name,setName]         = useState("");

  const load = async () => {
    try { setLoading(true); const data=await blogApi.getCategories(); setCats(Array.isArray(data)?data:[]); }
    catch(e){ setToast({msg:"Failed to load: "+e.message,type:"error"}); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const openNew  = () => { setName(""); setSel(null); setModal("form"); };
  const openEdit = (c)  => { setSel(c); setName(c.name); setModal("form"); };

  const handleSave = async () => {
    if(!name.trim()){ setToast({msg:"Category name is required.",type:"error"}); return; }
    setSaving(true);
    try {
      if(sel) await blogApi.updateCategory(sel.id,{name});
      else    await blogApi.createCategory({name});
      setToast({msg:`Category ${sel?"updated":"created"}!`,type:"success"});
      setModal(null); load();
    } catch(e){ setToast({msg:e.message,type:"error"}); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try { await blogApi.deleteCategory(sel.id); setToast({msg:"Category deleted.",type:"success"}); setModal(null); setSel(null); load(); }
    catch(e){ setToast({msg:e.message,type:"error"}); }
    finally { setSaving(false); }
  };

  const filtered = cats.filter(c=>!search||c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <SectionHeader title="All Blog Categories" right={
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <Inp value={search} onChange={e=>setSearch(e.target.value)} placeholder="Type name & Enter" style={{width:200,height:36}} />
          <Btn onClick={openNew}>＋ Add New category</Btn>
        </div>
      } />
      <div style={{background:t.glassCard,border:`1px solid ${t.glassBdr}`,borderRadius:16,overflow:"hidden",backdropFilter:"blur(16px)"}}>
        <div style={{display:"grid",gridTemplateColumns:"60px 1fr 140px",padding:"12px 20px",borderBottom:`1px solid ${t.border}`,background:t.dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)"}}>
          {["#","Name","Options"].map(h=><span key={h} style={{fontSize:12,fontWeight:700,color:t.textMuted,textTransform:"uppercase",letterSpacing:"0.6px"}}>{h}</span>)}
        </div>
        {loading&&<div style={{padding:40,textAlign:"center",color:t.textMuted}}>Loading…</div>}
        {!loading&&filtered.length===0&&<div style={{padding:40,textAlign:"center",color:t.textMuted,fontSize:13}}>No categories yet.</div>}
        {filtered.map((c,i)=>(
          <div key={c.id} style={{display:"grid",gridTemplateColumns:"60px 1fr 140px",padding:"16px 20px",borderBottom:`1px solid ${t.border}`,alignItems:"center",background:i%2===0?"transparent":(t.dark?"rgba(255,255,255,0.01)":"rgba(0,0,0,0.01)")}}>
            <span style={{color:t.textMuted}}>{i+1}</span>
            <span style={{color:t.text,fontWeight:500,fontSize:13.5}}>{c.name}</span>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>openEdit(c)} style={{width:32,height:32,borderRadius:"50%",border:"none",background:t.dark?"#1a1a1a":"#222",color:"#fff",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
              <button onClick={()=>{setSel(c);setModal("del");}} style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${RED}40`,background:"transparent",color:RED,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑</button>
            </div>
          </div>
        ))}
      </div>
      <Modal open={modal==="form"} onClose={()=>setModal(null)} title={sel?"Edit Category":"Add New Category"} width={420}>
        <Field label="Category Name *"><Inp value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. ORDER PROTECTION" /></Field>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving}>{saving?"Saving…":sel?"Save Changes":"Add Category"}</Btn>
        </div>
      </Modal>
      <Modal open={modal==="del"} onClose={()=>setModal(null)} title="Delete Category" width={420}>
        <p style={{color:t.textSub,fontSize:14,marginBottom:20}}>Delete category <strong style={{color:t.text}}>"{sel?.name}"</strong>?</p>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={handleDelete} disabled={saving}>{saving?"Deleting…":"Yes, Delete"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// Appearance
// ─── Website Setup → Images (page-wise image manager) ────────────────────────
const PAGE_LABELS = {
  home: "Home Page",
  about: "About Us",
  "quality-assurance": "Quality Assurance",
  header: "Header",
  footer: "Footer",
};

function WebsiteImagesSection({ setToast }) {
  const t = useTokens();
  const siteImagesRefresh = useSiteImagesRefresh();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageFilter, setPageFilter] = useState("all");
  const [savingId, setSavingId]     = useState(null);
  const [editingUrl, setEditingUrl] = useState({}); // { [id]: draftUrlString }
  const [localPreview, setLocalPreview] = useState({}); // { [id]: objectURL } — instant feedback for the exact file picked
  const fileInputRefs = useRef({});

  const load = useCallback(() => {
    setLoading(true);
    adminFetch("/admin/site-images")
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(err => setToast({ msg: "Failed to load images: " + err.message, type: "error" }))
      .finally(() => setLoading(false));
  }, [setToast]);

  useEffect(() => { load(); }, [load]);

  const pages = ["all", ...Array.from(new Set(items.map(i => i.page)))];
  const visible = pageFilter === "all" ? items : items.filter(i => i.page === pageFilter);
  const grouped = visible.reduce((acc, i) => { (acc[i.page] ||= []).push(i); return acc; }, {});

  const saveUrl = async (item) => {
    const url = (editingUrl[item.id] ?? item.imageUrl ?? "").trim();
    if (!url) { setToast({ msg: "Enter an image URL first.", type: "error" }); return; }
    setSavingId(item.id);
    try {
      const updated = await adminFetch(`/admin/site-images/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ imageUrl: url }),
      });
      setItems(prev => prev.map(i => (i.id === item.id ? updated : i)));
      setEditingUrl(prev => { const n = { ...prev }; delete n[item.id]; return n; });
      siteImagesRefresh();
      setToast({ msg: "Image link updated — now live on the site.", type: "success" });
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    } finally {
      setSavingId(null);
    }
  };

  const uploadFile = async (item, file) => {
    if (!file) return;

    // Show exactly the file the admin picked immediately, before the network
    // request even completes — removes any ambiguity about which file/slot.
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(prev => ({ ...prev, [item.id]: objectUrl }));

    setSavingId(item.id);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${BASE_URL}/admin/site-images/${item.id}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Upload failed");
      setItems(prev => prev.map(i => (i.id === item.id ? json.data : i)));
      siteImagesRefresh();
      setToast({ msg: `"${item.label || item.slotKey}" updated — now live on the site.`, type: "success" });
      // Server URL has now taken over in `items` — safe to drop the local preview.
      setLocalPreview(prev => { const n = { ...prev }; delete n[item.id]; return n; });
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
      // Keep the local preview on failure so the admin can see what they picked and retry.
    } finally {
      setSavingId(null);
      if (fileInputRefs.current[item.id]) fileInputRefs.current[item.id].value = "";
    }
  };

  return (
    <div>
      <SectionHeader title="Website Images" sub="Manage every image used across the live website, grouped by page. Paste a direct link or upload a file — changes go live immediately." />

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {pages.map(p => (
          <button key={p} onClick={() => setPageFilter(p)} style={{
            padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            border: `1.5px solid ${pageFilter === p ? RED : t.border}`,
            background: pageFilter === p ? "rgba(230,46,4,0.1)" : "transparent",
            color: pageFilter === p ? RED : t.textSub, cursor: "pointer", textTransform: "capitalize",
          }}>
            {p === "all" ? "All Pages" : (PAGE_LABELS[p] || p)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: t.textMuted, fontSize: 14, padding: 24 }}>Loading images…</div>
      ) : items.length === 0 ? (
        <div style={{ color: t.textMuted, fontSize: 14, padding: 24 }}>No image slots found yet.</div>
      ) : (
        Object.entries(grouped).map(([page, slots]) => (
          <Card key={page} title={PAGE_LABELS[page] || page} badge={`${slots.length} image${slots.length > 1 ? "s" : ""}`}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {slots.map(item => {
                const draft = editingUrl[item.id] ?? item.imageUrl ?? "";
                const dirty = draft !== (item.imageUrl ?? "");
                const previewSrc = localPreview[item.id] || (item.imageUrl ? resolveImageUrl(item.imageUrl) : null);
                return (
                  <div key={item.id} style={{
                    border: `1px solid ${t.border}`, padding: 14,
                    background: t.dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                    borderRadius: 12,
                  }}>
                    <div style={{
                      height: 130, borderRadius: 8, overflow: "hidden", marginBottom: 10, position: "relative",
                      background: t.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {previewSrc
                        ? <img key={previewSrc} src={previewSrc} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                        : null}
                      <div style={{ display: previewSrc ? "none" : "flex", fontSize: 26 }}>🖼️</div>
                      {localPreview[item.id] && savingId === item.id && (
                        <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.65)", color: "#fff", fontSize: 10.5, fontWeight: 600, padding: "3px 8px", borderRadius: 6, backdropFilter: "blur(4px)" }}>Uploading…</div>
                      )}
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 2 }}>{item.label || item.slotKey}</div>
                    <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 10, fontFamily: "monospace" }}>{item.slotKey}</div>

                    <Inp
                      value={draft}
                      onChange={e => setEditingUrl(prev => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="Paste image URL…"
                    />

                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <Btn size="sm" variant="secondary" disabled={!dirty || savingId === item.id}
                        onClick={() => saveUrl(item)}>
                        {savingId === item.id ? "Saving…" : "Save Link"}
                      </Btn>
                      <input
                        ref={el => (fileInputRefs.current[item.id] = el)}
                        type="file" accept="image/*" style={{ display: "none" }}
                        onChange={e => uploadFile(item, e.target.files?.[0])}
                      />
                      <Btn size="sm" variant="secondary" disabled={savingId === item.id}
                        onClick={() => fileInputRefs.current[item.id]?.click()}>
                        {savingId === item.id ? "…" : "📤 Upload"}
                      </Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

function AppearanceSection({ sub, setToast }) {
  const t = useTokens();
  const sections = {
    header: { title: "Header Settings",  fields: ["Site Name", "Tagline", "Logo URL", "Header Background", "Navigation Links"] },
    footer: { title: "Footer Settings",  fields: ["Footer Text", "Footer Logo URL", "Facebook URL", "Instagram URL", "Twitter URL", "Copyright Text"] },
    pages:  { title: "Static Pages",     fields: ["About Page Content", "Contact Page Email", "Contact Page Phone", "Contact Page Address", "Homepage Banner URL", "Homepage Banner Title"] },
  };
  const key = sub || "header";
  const sec = sections[key] || sections.header;
  const storageKey = `ybm_appearance_${key}`;
  const [values, setValues] = useState(() => JSON.parse(localStorage.getItem(storageKey) || "{}"));

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(values));
    setToast({ msg: `${sec.title} saved!`, type: "success" });
  };

  return (
    <div>
      <SectionHeader title={sec.title} />
      <div style={{ background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 16, padding: 24, maxWidth: 620, backdropFilter: "blur(16px)" }}>
        {sec.fields.map(field => (
          <Field key={field} label={field}>
            {field.toLowerCase().includes("content") || field.toLowerCase().includes("links")
              ? <Txta value={values[field] || ""} onChange={e => setValues(v => ({ ...v, [field]: e.target.value }))} placeholder={`Enter ${field}…`} />
              : field.toLowerCase().includes("url") && !field.toLowerCase().includes("navigation")
                ? <>
                    <Inp value={values[field] || ""} onChange={e => setValues(v => ({ ...v, [field]: e.target.value }))} placeholder={`Enter ${field}…`} />
                    {values[field] && <div style={{ marginTop: 6, borderRadius: 8, overflow: "hidden", height: 60, border: `1px solid ${t.border}` }}><img src={values[field]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /></div>}
                  </>
                : <Inp value={values[field] || ""} onChange={e => setValues(v => ({ ...v, [field]: e.target.value }))} placeholder={`Enter ${field}…`} />
            }
          </Field>
        ))}
        <Btn onClick={handleSave}>Save Settings</Btn>
      </div>
    </div>
  );
}

// Uploaded Files
function FilesSection({ setToast }) {
  const t = useTokens();
  const [files, setFiles]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState("newest");
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // urlPath string
  const fileInputRef = useRef(null);

  const IMG_EXTS = new Set(["jpg","jpeg","png","gif","webp","svg","bmp"]);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, sort });
      const data = await adminFetch(`/admin/uploaded-files?${params}`);
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      setToast({ msg: "Failed to load files: " + err.message, type: "error" });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${BASE_URL}/admin/uploaded-files/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Upload failed");
      setToast({ msg: "File uploaded successfully!", type: "success" });
      fetchFiles();
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (urlPath) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE_URL}/admin/uploaded-files?urlPath=${encodeURIComponent(urlPath)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Delete failed");
      setToast({ msg: "File deleted.", type: "success" });
      setConfirmDelete(null);
      fetchFiles();
    } catch (err) {
      setToast({ msg: err.message, type: "error" });
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (ext) => {
    if (["pdf"].includes(ext)) return "📕";
    if (["doc","docx"].includes(ext)) return "📘";
    if (["xls","xlsx","csv"].includes(ext)) return "📗";
    if (["ppt","pptx"].includes(ext)) return "📙";
    if (["zip","rar","7z"].includes(ext)) return "🗜️";
    if (["mp4","avi","mov","webm"].includes(ext)) return "🎬";
    if (["mp3","wav","ogg"].includes(ext)) return "🎵";
    return "📄";
  };

  const getCategoryBadge = (cat) => {
    const map = {
      products:   { bg: "rgba(99,102,241,0.15)", c: "#a78bfa" },
      categories: { bg: "rgba(59,130,246,0.15)", c: "#60a5fa" },
      brands:     { bg: "rgba(4,180,134,0.15)",  c: "#34d399" },
      blogs:      { bg: "rgba(234,179,8,0.15)",  c: "#fbbf24" },
      brochures:  { bg: "rgba(230,46,4,0.12)",   c: RED },
    };
    const s = map[cat] || { bg: "rgba(255,255,255,0.07)", c: "#888" };
    return (
      <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: s.bg, color: s.c, whiteSpace: "nowrap" }}>
        {cat}
      </span>
    );
  };

  return (
    <div>
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={() => setConfirmDelete(null)} style={{ position: "absolute", inset: 0, background: t.overlay, backdropFilter: "blur(6px)" }} />
          <div style={{ position: "relative", zIndex: 1, background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 18, padding: 28, maxWidth: 400, width: "100%", backdropFilter: "blur(24px)" }}>
            <div style={{ fontSize: 36, marginBottom: 12, textAlign: "center" }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", color: t.text, fontWeight: 800, textAlign: "center" }}>Delete File?</h3>
            <p style={{ color: t.textSub, fontSize: 13, textAlign: "center", margin: "0 0 22px", wordBreak: "break-all" }}>{confirmDelete.split("/").pop()}</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={() => handleDelete(confirmDelete)}>Delete</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.text }}>All Uploaded Files</h2>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: t.textMuted }}>{loading ? "Loading…" : `${files.length} file${files.length !== 1 ? "s" : ""} found`}</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleUpload} />
          <Btn onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? "⏳ Uploading…" : "⬆️ Upload New File"}
          </Btn>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center", background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 12, padding: "10px 14px", backdropFilter: "blur(12px)" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, marginRight: 4 }}>All files</div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <Inp value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your files…" style={{ width: "100%" }} />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ background: t.inputBg, border: `1px solid ${t.inputBdr}`, borderRadius: 8, color: t.text, padding: "7px 12px", fontSize: 13, fontFamily: "inherit", cursor: "pointer", outline: "none" }}
        >
          <option value="newest">Sort by newest</option>
          <option value="oldest">Sort by oldest</option>
          <option value="name">Sort by name</option>
          <option value="size">Sort by size</option>
        </select>
        <Btn onClick={fetchFiles} variant="secondary" size="sm">Search</Btn>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: t.textMuted, fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>Loading files…
        </div>
      ) : files.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: t.textMuted, fontSize: 13, background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 16, backdropFilter: "blur(12px)" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
          {search ? `No files matching "${search}"` : "No files found in the uploads directory."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 14 }}>
          {files.map(file => {
            const isImg = IMG_EXTS.has(file.extension);
            const fileUrl = `${BASE_URL}${file.urlPath}`;
            return (
              <div key={file.urlPath} style={{
                background: t.glassCard, border: `1px solid ${t.glassBdr}`,
                borderRadius: 14, overflow: "hidden", backdropFilter: "blur(12px)",
                transition: "box-shadow 0.18s",
                position: "relative",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,${t.dark ? 0.4 : 0.12})`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                {/* 3-dot menu */}
                <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
                  <button
                    onClick={() => setConfirmDelete(file.urlPath)}
                    style={{ background: t.dark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "#f87171", fontSize: 13, fontWeight: 700, backdropFilter: "blur(6px)" }}
                    title="Delete file"
                  >✕</button>
                </div>

                {/* Thumbnail / Icon */}
                {isImg ? (
                  <img
                    src={fileUrl} alt={file.name}
                    style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                    onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                  />
                ) : null}
                <div style={{
                  height: 120, display: isImg ? "none" : "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 42, background: t.dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                  flexDirection: "column", gap: 4,
                }}>
                  {getFileIcon(file.extension)}
                  <span style={{ fontSize: 11, color: t.textMuted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{file.extension}</span>
                </div>

                {/* Info */}
                <div style={{ padding: "10px 12px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    {getCategoryBadge(file.category)}
                  </div>
                  <div style={{ fontSize: 12, color: t.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }} title={file.name}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginBottom: 10 }}>
                    {formatSize(file.sizeBytes)}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: RED, fontSize: 11.5, fontWeight: 700, textDecoration: "none" }}>
                      Open ↗
                    </a>
                    <span style={{ color: t.border }}>|</span>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(fileUrl);
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = file.name;
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(url);
                        } catch {
                          window.open(fileUrl, "_blank");
                        }
                      }}
                      style={{ background: "none", border: "none", color: t.textSub, fontSize: 11.5, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                      ⬇ Download
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function UserSearchesSection() {
  const t = useTokens();
  const [logs, setLogs]     = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ]           = useState("");
  const [page, setPage]     = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const PAGE_SIZE = 50;

  const load = useCallback(async (pg = 0, query = q) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, page: pg, size: PAGE_SIZE });
      const [logsData, statsData] = await Promise.all([
        adminFetch(`/admin/analytics/search-logs?${params}`),
        adminFetch("/admin/analytics/search-stats"),
      ]);
      setLogs(logsData.content ?? []);
      setTotalPages(logsData.totalPages ?? 1);
      setTotalElements(logsData.totalElements ?? 0);
      setPage(pg);
      setStats(statsData);
    } catch (err) {
      setLogs([]); setStats(null);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => { load(0, ""); }, []);

  const handleSearch = () => load(0, q);

  const sourceBadge = (src) => {
    const map = {
      "header":       { bg: "rgba(99,102,241,0.15)", c: "#a78bfa", label: "Header" },
      "product-page": { bg: "rgba(4,180,134,0.15)",  c: "#34d399", label: "Product Page" },
    };
    const s = map[src] || { bg: "rgba(255,255,255,0.07)", c: "#888", label: src || "unknown" };
    return (
      <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: s.bg, color: s.c }}>
        {s.label}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.text }}>User Search Analytics</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: t.textMuted }}>Every search query submitted by visitors and logged-in users</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 22 }}>
          {[
            { label: "Total Searches",  value: stats.totalSearches, icon: "🔍" },
            { label: "Today",           value: stats.todaySearches,  icon: "📅" },
            { label: "Last 7 Days",     value: stats.weekSearches,   icon: "📈" },
          ].map(card => (
            <div key={card.label} style={{ background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 14, padding: "16px 18px", backdropFilter: "blur(12px)" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{card.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: t.text, lineHeight: 1 }}>{card.value?.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>{card.label}</div>
            </div>
          ))}

          {/* Top Terms mini-card */}
          {stats.topTerms?.length > 0 && (
            <div style={{ background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 14, padding: "14px 16px", backdropFilter: "blur(12px)", gridColumn: "span 2" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>🔥 Top Searches</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {stats.topTerms.slice(0, 8).map((term, i) => (
                  <span key={i} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                    background: i === 0 ? "rgba(230,46,4,0.15)" : t.dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                    color: i === 0 ? RED : t.textSub,
                  }}>
                    {term.term} <span style={{ opacity: 0.6 }}>×{term.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search + filter toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Inp value={q} onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Filter by search term…" style={{ flex: 1, minWidth: 220 }} />
        <Btn onClick={handleSearch} variant="secondary" size="sm">Search</Btn>
        <Btn onClick={() => { setQ(""); load(0, ""); }} variant="ghost" size="sm">Clear</Btn>
        <span style={{ fontSize: 12, color: t.textMuted, marginLeft: "auto" }}>{totalElements} results</span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 50, textAlign: "center", color: t.textMuted }}>⏳ Loading…</div>
      ) : logs.length === 0 ? (
        <div style={{ padding: 50, textAlign: "center", color: t.textMuted, background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 14, backdropFilter: "blur(12px)" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
          {q ? `No results for "${q}"` : "No search activity recorded yet. Searches from the frontend will appear here automatically."}
        </div>
      ) : (
        <>
          <div style={{ background: t.glassCard, border: `1px solid ${t.glassBdr}`, borderRadius: 14, overflow: "hidden", backdropFilter: "blur(12px)" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1.2fr", gap: 0, borderBottom: `1px solid ${t.border}`, padding: "10px 18px" }}>
              {["Search Query", "User", "Source", "Date & Time"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</div>
              ))}
            </div>
            {/* Rows */}
            {logs.map((row, i) => (
              <div key={row.id} style={{
                display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1.2fr",
                padding: "11px 18px", gap: 0,
                borderBottom: i < logs.length - 1 ? `1px solid ${t.border}` : "none",
                background: i % 2 === 0 ? "transparent" : (t.dark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.012)"),
              }}>
                <div style={{ fontSize: 13, color: t.text, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  🔍 {row.query}
                </div>
                <div style={{ fontSize: 12.5, color: t.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.userName || "Guest"}
                </div>
                <div>{sourceBadge(row.source)}</div>
                <div style={{ fontSize: 12, color: t.textMuted }}>
                  {row.createdAt ? new Date(row.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
              <Btn variant="ghost" size="sm" disabled={page === 0} onClick={() => load(page - 1)}>← Prev</Btn>
              <span style={{ padding: "6px 14px", fontSize: 13, color: t.textSub }}>Page {page + 1} of {totalPages}</span>
              <Btn variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => load(page + 1)}>Next →</Btn>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── REQUESTS SECTION ─────────────────────────────────────────────────────────
function RequestsSection({ setToast, filter }) {
  const t = useTokens();
  const { dark } = t;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(filter || "ALL");
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const card = dark ? "#1a1a1a" : "#fff";
  const border = dark ? "#2a2a2a" : "#ebebeb";
  const txt = dark ? "#ddd" : "#222";
  const sub = dark ? "#888" : "#666";
  const inputBg = dark ? "#111" : "#f8f8f8";

  const STATUS_COLORS = {
    PENDING:   { bg: "rgba(245,166,35,0.12)", color: "#f5a623" },
    REPLIED:   { bg: "rgba(46,125,50,0.12)",  color: "#2e7d32" },
    DISCARDED: { bg: "rgba(198,40,40,0.12)",  color: "#c62828" },
  };
  const TYPE_COLORS = {
    AGENT:   { bg: "rgba(33,150,243,0.12)", color: "#1565c0" },
    CONTACT: { bg: "rgba(76,175,80,0.12)",  color: "#2e7d32" },
  };

  const load = async (p = 0) => {
    setLoading(true);
    try {
      const tab = filter || activeTab;
      const data = await requestsApi.adminGetAll({ page: p, size: 15, type: tab === "ALL" ? undefined : tab });
      setRequests(data.content || []);
      setTotalPages(data.totalPages || 1);
      setPage(p);
    } catch (e) {
      setToast({ msg: "Failed to load requests", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(0); }, [activeTab, filter]);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const updated = await requestsApi.adminReply(selected.id, replyText);
      setRequests(r => r.map(x => x.id === selected.id ? updated : x));
      setSelected(updated);
      setToast({ msg: "Reply sent!", type: "success" });
    } catch (e) {
      setToast({ msg: "Failed to send reply", type: "error" });
    } finally {
      setReplying(false);
    }
  };

  const handleDiscard = async (id) => {
    try {
      const updated = await requestsApi.adminDiscard(id);
      setRequests(r => r.map(x => x.id === id ? updated : x));
      if (selected?.id === id) setSelected(updated);
      setToast({ msg: "Request discarded", type: "success" });
    } catch (e) {
      setToast({ msg: "Failed to discard", type: "error" });
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

  return (
    <div style={{ display: "flex", gap: 24, height: "calc(100vh - 140px)", minHeight: 500 }}>
      {/* Left: list */}
      <div style={{ width: 380, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0, background: card, borderRadius: 12, border: `1px solid ${border}`, overflow: "hidden" }}>
        {/* Tabs */}
        {!filter && (
          <div style={{ display: "flex", borderBottom: `1px solid ${border}` }}>
            {["ALL","AGENT","CONTACT"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ flex: 1, padding: "12px 0", fontSize: 13, fontWeight: 600, background: "none", border: "none", cursor: "pointer",
                  color: activeTab === tab ? "#e62e04" : sub,
                  borderBottom: activeTab === tab ? "2px solid #e62e04" : "2px solid transparent" }}>
                {tab}
              </button>
            ))}
          </div>
        )}
        {!filter && <div style={{ padding: "10px 16px", borderBottom: `1px solid ${border}`, fontSize: 12, color: sub }}>
          {filter ? `${filter} requests` : "All inquiry requests"} — {requests.length} shown
        </div>}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: sub }}>Loading…</div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: sub }}>No requests found</div>
          ) : requests.map(r => (
            <div key={r.id} onClick={() => { setSelected(r); setReplyText(r.adminReply || ""); }}
              style={{ padding: "14px 16px", borderBottom: `1px solid ${border}`, cursor: "pointer",
                background: selected?.id === r.id ? (dark ? "#222" : "#fef5f3") : "transparent",
                transition: "background 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: txt }}>{r.firstName} {r.lastName}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: sub }}>{r.email}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: TYPE_COLORS[r.type]?.bg, color: TYPE_COLORS[r.type]?.color }}>{r.type}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: STATUS_COLORS[r.status]?.bg, color: STATUS_COLORS[r.status]?.color }}>{r.status}</span>
                </div>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: sub }}>{fmtDate(r.createdAt)}</p>
            </div>
          ))}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${border}`, display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => load(page - 1)} disabled={page === 0} style={{ fontSize: 12, background: "none", border: "none", color: page === 0 ? sub : "#e62e04", cursor: page === 0 ? "default" : "pointer", fontWeight: 600 }}>← Prev</button>
            <span style={{ fontSize: 12, color: sub }}>{page + 1} / {totalPages}</span>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages - 1} style={{ fontSize: 12, background: "none", border: "none", color: page >= totalPages - 1 ? sub : "#e62e04", cursor: page >= totalPages - 1 ? "default" : "pointer", fontWeight: 600 }}>Next →</button>
          </div>
        )}
      </div>

      {/* Right: detail */}
      <div style={{ flex: 1, background: card, borderRadius: 12, border: `1px solid ${border}`, overflowY: "auto", padding: 28 }}>
        {!selected ? (
          <div style={{ textAlign: "center", paddingTop: 80, color: sub }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📨</div>
            <p style={{ fontSize: 15 }}>Select a request to view details</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: txt }}>{selected.firstName} {selected.lastName}</h2>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: sub }}>{selected.email} {selected.phone ? `• ${selected.phone}` : ""}</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: TYPE_COLORS[selected.type]?.bg, color: TYPE_COLORS[selected.type]?.color }}>{selected.type}</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: STATUS_COLORS[selected.status]?.bg, color: STATUS_COLORS[selected.status]?.color }}>{selected.status}</span>
                {selected.status !== "DISCARDED" && (
                  <button onClick={() => handleDiscard(selected.id)}
                    style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, border: "1px solid #e62e04", background: "none", color: "#e62e04", cursor: "pointer", fontWeight: 600 }}>
                    Discard
                  </button>
                )}
              </div>
            </div>

            {/* Fields grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {selected.type === "CONTACT" && <>
                {selected.product  && <InfoField label="Product"  value={selected.product}  dark={dark} />}
                {selected.quantity && <InfoField label="Quantity" value={selected.quantity} dark={dark} />}
                {selected.country  && <InfoField label="Country"  value={selected.country}  dark={dark} />}
                {selected.city     && <InfoField label="City"     value={selected.city}     dark={dark} />}
              </>}
              {selected.type === "AGENT" && <>
                {selected.shopName && <InfoField label="Shop Name" value={selected.shopName} dark={dark} />}
                {selected.address  && <InfoField label="Address"   value={selected.address}  dark={dark} />}
              </>}
              <InfoField label="Submitted" value={fmtDate(selected.createdAt)} dark={dark} />
              {selected.repliedAt && <InfoField label="Replied At" value={fmtDate(selected.repliedAt)} dark={dark} />}
            </div>

            {/* Message */}
            {selected.message && (
              <div style={{ marginBottom: 24, padding: 16, borderRadius: 10, background: dark ? "#111" : "#f7f7f7", border: `1px solid ${border}` }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: sub, textTransform: "uppercase", letterSpacing: "1px" }}>Message</p>
                <p style={{ margin: 0, fontSize: 14, color: txt, lineHeight: 1.7 }}>{selected.message}</p>
              </div>
            )}

            {/* Existing reply */}
            {selected.adminReply && (
              <div style={{ marginBottom: 24, padding: 16, borderRadius: 10, background: dark ? "#0d1a0d" : "#f0faf0", border: `1px solid ${dark ? "#1a3a1a" : "#c8e6c9"}` }}>
                <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 700, color: "#2e7d32", textTransform: "uppercase", letterSpacing: "1px" }}>Your Reply</p>
                <p style={{ margin: 0, fontSize: 14, color: txt, lineHeight: 1.7 }}>{selected.adminReply}</p>
              </div>
            )}

            {/* Reply form */}
            {selected.status !== "DISCARDED" && (
              <div>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: txt }}>
                  {selected.adminReply ? "Update Reply" : "Send Reply"}
                </p>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={5}
                  placeholder="Type your reply to the user…"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1.5px solid ${border}`, background: inputBg, color: txt, fontSize: 14, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
                <button onClick={handleReply} disabled={replying || !replyText.trim()}
                  style={{ marginTop: 12, padding: "10px 24px", background: replying || !replyText.trim() ? "#aaa" : "#e62e04", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: replying || !replyText.trim() ? "default" : "pointer" }}>
                  {replying ? "Sending…" : "Send Reply"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value, dark }) {
  const bg = dark ? "#111" : "#f7f7f7";
  const border = dark ? "#222" : "#ebebeb";
  const txt = dark ? "#ddd" : "#222";
  const sub = dark ? "#888" : "#666";
  return (
    <div style={{ padding: "10px 14px", borderRadius: 8, background: bg, border: `1px solid ${border}` }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: sub, textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 14, color: txt, fontWeight: 500 }}>{value}</p>
    </div>
  );
}

// ─── SIDEBAR NAV CONFIG ───────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard",  icon: "🏠", label: "Dashboard" },
  { key: "products",   icon: "📦", label: "Products", sub: [
    { key: "products",   label: "All Products" },
    { key: "addproduct", label: "Add New Product" },
    { key: "categories", label: "Categories" },
    { key: "brands",     label: "Brands" },
  ]},
  { key: "sales",      icon: "🛒", label: "Sales", sub: [
    { key: "orders",     label: "All Orders" },
  ]},
  { key: "customers",  icon: "👥", label: "Customers", sub: [
    { key: "customers",  label: "Customer List" },
  ]},
  { key: "reviews",    icon: "⭐", label: "Product Reviews" },
  { key: "wishlist",   icon: "❤️", label: "Wishlist" },
  { key: "files",      icon: "📁", label: "Uploaded Files" },
  { key: "staffs",     icon: "👔", label: "Staffs", sub: [
    { key: "staffs",     label: "All Staffs" },
  ]},
  { key: "delivery",   icon: "🚚", label: "Delivery Partners", sub: [
    { key: "delivery",   label: "Partner List" },
    { key: "adddelivery",label: "Add Partner" },
  ]},
  { key: "reports",    icon: "📊", label: "Reports", sub: [
    { key: "salesreport",   label: "Sales Report" },
    { key: "usersearches",  label: "User Searches" },
  ]},
  { key: "blog",       icon: "📝", label: "Blog System", sub: [
    { key: "blog",       label: "All Posts" },
    { key: "blogcats",   label: "Categories" },
  ]},
  { key: "requests",   icon: "📨", label: "Requests", sub: [
    { key: "requests",       label: "All Requests" },
    { key: "agentreqs",      label: "Agent Requests" },
    { key: "contactreqs",    label: "Contact Requests" },
  ]},
  { key: "appearance", icon: "🎨", label: "Website Setup", sub: [
    { key: "siteimages", label: "Images" },
    { key: "header",     label: "Header" },
    { key: "footer",     label: "Footer" },
    { key: "pages",      label: "Pages" },
  ]},
];

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
// ─── AdminSidebar ─────────────────────────────────────────────────────────────
// ─── ADMIN ANIMATED BACKGROUND ────────────────────────────────────────────────
// Deferred with a 1-frame useEffect so it NEVER blocks the first paint of the
// admin panel. The blobs, grid lines, and brackets are purely decorative and
// shouldn't delay the user seeing the dashboard UI.
function AdminAnimatedBg({ dark }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Use requestAnimationFrame to mount after the browser has painted frame 1
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {/* Blobs */}
      <div style={{ position: "absolute", top: "-20%", right: "10%", width: 600, height: 600, borderRadius: "50%", background: dark ? "radial-gradient(circle,rgba(230,46,4,0.10) 0%,transparent 65%)" : "radial-gradient(circle,rgba(230,46,4,0.07) 0%,transparent 65%)", animation: "blobDrift 18s ease-in-out infinite", filter: "blur(2px)" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: dark ? "radial-gradient(circle,rgba(120,60,255,0.09) 0%,transparent 60%)" : "radial-gradient(circle,rgba(255,180,60,0.08) 0%,transparent 60%)", animation: "blobDrift 24s ease-in-out 6s infinite reverse", filter: "blur(3px)" }} />
      {/* Grid lines */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: `${(i / 10) * 100}%`, top: 0, bottom: 0, width: 1, background: dark ? `linear-gradient(to bottom,transparent,rgba(230,46,4,${0.03 + (i % 3) * 0.01}),transparent)` : `linear-gradient(to bottom,transparent,rgba(230,46,4,0.025),transparent)`, animation: `gridFade ${12 + i * 0.6}s linear ${i * 0.3}s infinite` }} />
      ))}
      {/* Corner brackets */}
      <div style={{ position: "absolute", top: 20, left: 20, width: 40, height: 40, borderTop: `2px solid rgba(230,46,4,${dark ? 0.5 : 0.3})`, borderLeft: `2px solid rgba(230,46,4,${dark ? 0.5 : 0.3})`, animation: "bracketGlow 3s ease-in-out infinite", borderRadius: "2px 0 0 0" }} />
      <div style={{ position: "absolute", bottom: 20, right: 20, width: 40, height: 40, borderBottom: `2px solid rgba(230,46,4,${dark ? 0.4 : 0.22})`, borderRight: `2px solid rgba(230,46,4,${dark ? 0.4 : 0.22})`, animation: "bracketGlow 3s ease-in-out 1.5s infinite", borderRadius: "0 0 2px 0" }} />
    </div>
  );
}

// Extracted as a TOP-LEVEL component (outside AdminDashboard) so React never
// treats it as a new component type across renders. Defining it inside the
// parent caused React to unmount + remount the sidebar on EVERY state change,
// doubling the perceived render cost and causing flicker.
function AdminSidebar({ t, dark, sidebarOpen, menuSearch, setMenuSearch, flatNav, expanded,
                        setExpanded, setSidebarOpen, activeKey, setActiveKey, setMobileMenuOpen,
                        logout, navigate }) {
  return (
    <>
      {/* Logo */}
      <div style={{ padding: "0 14px", height: 64, display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${RED},${RED_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0, boxShadow: `0 4px 12px ${t.redGlow}` }}>Y</div>
        {sidebarOpen && (
          <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: t.text, letterSpacing: "-0.3px" }}><span style={{ color: RED }}>Your</span>BuildMart</div>
            <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: -1, letterSpacing: "0.8px", textTransform: "uppercase" }}>Admin Panel</div>
          </div>
        )}
      </div>

      {/* Search */}
      {sidebarOpen && (
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
          <input value={menuSearch} onChange={e => setMenuSearch(e.target.value)} placeholder="Search menu…"
            style={{ width: "100%", padding: "8px 11px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", border: `1px solid ${t.border}`, color: t.textSub, fontSize: 12.5, outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = RED}
            onBlur={e => e.target.style.borderColor = t.border}
          />
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 8px" }}>
        {(menuSearch
          ? flatNav.filter(n => n.label.toLowerCase().includes(menuSearch.toLowerCase()))
          : NAV
        ).map(item => (
          <div key={item.key + item.label}>
            <button
              onClick={() => {
                if (item.sub && !menuSearch) {
                  setExpanded(expanded === item.key ? null : item.key);
                  if (!sidebarOpen) setSidebarOpen(true);
                } else {
                  setActiveKey(item.key); setMenuSearch(""); setMobileMenuOpen(false);
                }
              }}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? "flex-start" : "center",
                padding: sidebarOpen ? "9px 11px" : "9px 0",
                borderRadius: 9, border: "none",
                background: activeKey === item.key ? (dark ? "rgba(230,46,4,0.16)" : "rgba(230,46,4,0.10)") : "transparent",
                color: activeKey === item.key ? RED : t.textSub,
                fontFamily: "inherit", fontSize: 13.5, fontWeight: activeKey === item.key ? 700 : 400,
                cursor: "pointer", transition: "all 0.15s", textAlign: "left", whiteSpace: "nowrap", marginBottom: 2,
              }}
              onMouseEnter={e => { if (activeKey !== item.key) e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"; }}
              onMouseLeave={e => { if (activeKey !== item.key) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 16, flexShrink: 0, width: 22, textAlign: "center" }}>{item.icon}</span>
              {sidebarOpen && <>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.sub && <span style={{ opacity: dark ? 0.55 : 0.75, fontSize: 10, transform: expanded === item.key ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)", display: "inline-block" }}>›</span>}
              </>}
            </button>
            {sidebarOpen && item.sub && !menuSearch && (
              <div style={{
                overflow: "hidden",
                maxHeight: expanded === item.key ? `${item.sub.length * 44}px` : "0px",
                transition: "max-height 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease",
                opacity: expanded === item.key ? 1 : 0,
              }}>
                <div style={{ paddingLeft: 16, borderLeft: `2px solid rgba(230,46,4,0.18)`, marginLeft: 20, marginBottom: 4, paddingTop: 2 }}>
                  {item.sub.map(s => (
                    <button key={s.key} onClick={() => { setActiveKey(s.key); setMobileMenuOpen(false); setExpanded(item.key); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 11px", borderRadius: 7, border: "none", background: activeKey === s.key ? (dark ? "rgba(230,46,4,0.14)" : "rgba(230,46,4,0.09)") : "transparent", color: activeKey === s.key ? RED : t.textSub, fontFamily: "inherit", fontSize: 12.5, fontWeight: activeKey === s.key ? 600 : 500, cursor: "pointer", textAlign: "left", whiteSpace: "nowrap", transition: "all 0.14s", marginBottom: 1, boxShadow: activeKey === s.key ? `inset 3px 0 0 ${RED}` : "none" }}
                      onMouseEnter={e => { if (activeKey !== s.key) { e.currentTarget.style.color = t.text; e.currentTarget.style.background = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"; } }}
                      onMouseLeave={e => { e.currentTarget.style.color = activeKey === s.key ? RED : t.textSub; e.currentTarget.style.background = activeKey === s.key ? (dark ? "rgba(230,46,4,0.14)" : "rgba(230,46,4,0.09)") : "transparent"; }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: activeKey === s.key ? RED : "currentColor", opacity: activeKey === s.key ? 1 : 0.7, flexShrink: 0, transition: "background 0.15s" }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "10px 8px", borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
        <button onClick={() => { logout(); navigate("/"); }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: sidebarOpen ? 10 : 0, justifyContent: sidebarOpen ? "flex-start" : "center", padding: "9px 11px", borderRadius: 9, border: "none", background: "transparent", color: dark ? "rgba(248,113,113,0.65)" : "rgba(200,30,30,0.75)", fontFamily: "inherit", fontSize: 13.5, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = dark ? "rgba(230,46,4,0.1)" : "rgba(230,46,4,0.07)"; e.currentTarget.style.color = RED; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(248,113,113,0.65)"; }}
        >
          <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>🚪</span>
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </>
  );
}

// Read auth synchronously from localStorage BEFORE first React render.
// This is the same data source AuthContext uses, so it's always in sync.
function readAdminAuthSync() {
  try {
    const token = localStorage.getItem("ybm_token");
    const raw   = localStorage.getItem("ybm_user");
    if (!token || !raw) return false;
    const u = JSON.parse(raw);
    return u?.role === "ADMIN";
  } catch {
    return false;
  }
}

export default function AdminDashboard() {
  const t = useTokens();
  const { dark } = t;
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeKey, setActiveKey]     = useState("dashboard");
  const [expanded, setExpanded]       = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuSearch, setMenuSearch]   = useState("");
  const [toast, setToast]             = useState({ msg: "", type: "success" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Read localStorage synchronously in the initializer — runs before the first
  // render so a logged-in admin NEVER sees the loading spinner at all.
  const [authChecked, setAuthChecked] = useState(() => readAdminAuthSync());

  const flatNav = NAV.flatMap(n => n.sub ? [n, ...n.sub] : [n]);

  useEffect(() => {
    // Secondary check via React auth state (catches logout in another tab, etc.)
    if (user === null) {          // null = definitely logged out (not undefined = loading)
      navigate("/login", { replace: true });
    } else if (user && !isAdmin) {
      navigate("/", { replace: true });
    } else if (user && isAdmin) {
      setAuthChecked(true);       // confirm (already true if localStorage matched)
    }
  }, [user, isAdmin]);

  const setToastFn = useCallback(t => setToast(t), []);

  const renderContent = () => {
    switch (activeKey) {
      case "dashboard":    return <DashboardSection user={user} onNavigate={setActiveKey} />;
      case "products":     return <ProductsSection setToast={setToastFn} />;
      case "addproduct":   return <AddProductSection setToast={setToastFn} />;
      case "categories":   return <CategoriesSection setToast={setToastFn} />;
      case "brands":       return <BrandsSection setToast={setToastFn} />;
      case "orders":       return <OrdersSection setToast={setToastFn} />;
      case "customers":    return <CustomersSection setToast={setToastFn} />;
      case "reviews":      return <ReviewsSection setToast={setToastFn} />;
      case "wishlist":     return <WishlistSection />;
      case "staffs":       return <StaffsSection setToast={setToastFn} />;
      case "delivery":
      case "adddelivery":  return <DeliverySection setToast={setToastFn} />;
      case "salesreport":  return <SalesReportSection />;
      case "usersearches": return <UserSearchesSection />;
      case "blog":         return <BlogSection setToast={setToastFn} />;
      case "blogcats":     return <BlogCategoriesSection setToast={setToastFn} />;
      case "requests":     return <RequestsSection setToast={setToastFn} filter={null} />;
      case "agentreqs":    return <RequestsSection setToast={setToastFn} filter="AGENT" />;
      case "contactreqs":  return <RequestsSection setToast={setToastFn} filter="CONTACT" />;
      case "siteimages":   return <WebsiteImagesSection setToast={setToastFn} />;
      case "header":       return <AppearanceSection sub="header" setToast={setToastFn} />;
      case "footer":       return <AppearanceSection sub="footer" setToast={setToastFn} />;
      case "pages":        return <AppearanceSection sub="pages"  setToast={setToastFn} />;
      case "files":
      case "setup":        return <FilesSection setToast={setToastFn} />;
      default:             return <DashboardSection user={user} onNavigate={setActiveKey} />;
    }
  };

  if (!authChecked) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: dark ? "#09090b" : "#f5f2ee",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, border: "3px solid rgba(230,46,4,0.2)",
          borderTopColor: "#e62e04", borderRadius: "50%",
          animation: "spin 0.7s linear infinite", margin: "0 auto 12px",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 13, color: dark ? "#666" : "#999", fontWeight: 500 }}>Loading admin panel…</div>
      </div>
    </div>
  );



  return (
    <>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalPop{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes blobDrift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.05)}}
        @keyframes gridFade{0%{transform:translateY(0)}100%{transform:translateY(-60px)}}
        @keyframes bracketGlow{0%,100%{opacity:0.3}50%{opacity:0.8}}
        @keyframes subSlideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        .add-product-grid{display:grid;grid-template-columns:1fr 320px;gap:20px;align-items:start}
        @media(max-width:960px){.add-product-grid{grid-template-columns:1fr !important}}
        .admin-main{scroll-behavior:smooth;overscroll-behavior:contain}
        .admin-main::-webkit-scrollbar{width:6px}
        .admin-main::-webkit-scrollbar-track{background:transparent}
        .admin-main::-webkit-scrollbar-thumb{background:rgba(230,46,4,0.35);border-radius:4px;transition:background 0.2s}
        .admin-main::-webkit-scrollbar-thumb:hover{background:rgba(230,46,4,0.6)}
        .admin-sidebar::-webkit-scrollbar{width:4px}
        .admin-sidebar::-webkit-scrollbar-thumb{background:rgba(230,46,4,0.2);border-radius:3px}
        @media(max-width:768px){
          .admin-sidebar-desktop{display:none !important}
          .admin-mobile-btn{display:flex !important}
          /* KPI: 2x2 grid on tablet */
          .admin-kpi-grid{grid-template-columns:repeat(2,1fr) !important}
          /* Charts: stack vertically */
          .admin-charts-grid{grid-template-columns:1fr !important}
          /* Hide extra topbar links */
          .admin-topbar-link{display:none !important}
          /* Topbar actions wrap */
          .admin-topbar-actions{gap:6px !important}
        }
        @media(max-width:480px){
          .admin-kpi-grid{grid-template-columns:repeat(2,1fr) !important;gap:10px !important}
          .admin-main{padding:10px !important}
          .admin-section-header{flex-direction:column !important;align-items:flex-start !important;gap:8px !important}
          .admin-section-header button{width:100% !important}
        }
      `}</style>

      <div style={{ display: "flex", height: "100vh", fontFamily: "'Poppins','Segoe UI',sans-serif", background: t.bg, transition: "background 0.4s", position: "relative", overflow: "hidden" }}>

        {/* ── Animated background — deferred so it never blocks first paint ── */}
        <AdminAnimatedBg dark={dark} />

        {/* ── Desktop Sidebar ───────────────────────────────────────────────── */}
        <div className="admin-sidebar-desktop" style={{
          width: sidebarOpen ? 250 : 62, flexShrink: 0,
          background: t.dark ? "#0a0a0c" : "#ffffff",
          borderRight: `1px solid ${t.border}`,
          display: "flex", flexDirection: "column",
          position: "sticky", top: 0, height: "100vh",
          transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden", zIndex: 100,
        }}>
          <AdminSidebar t={t} dark={dark} sidebarOpen={sidebarOpen} menuSearch={menuSearch} setMenuSearch={setMenuSearch} flatNav={flatNav} expanded={expanded} setExpanded={setExpanded} setSidebarOpen={setSidebarOpen} activeKey={activeKey} setActiveKey={setActiveKey} setMobileMenuOpen={setMobileMenuOpen} logout={logout} navigate={navigate} />
        </div>

        {/* ── Mobile Overlay Sidebar ────────────────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="admin-mobile-overlay" style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
            <div onClick={() => setMobileMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "relative", width: 260, background: t.dark ? "rgba(10,10,12,0.98)" : "rgba(255,255,255,0.98)", borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", height: "100vh", backdropFilter: "blur(20px)", animation: "modalPop 0.2s ease", zIndex: 1 }}>
              <AdminSidebar t={t} dark={dark} sidebarOpen={sidebarOpen} menuSearch={menuSearch} setMenuSearch={setMenuSearch} flatNav={flatNav} expanded={expanded} setExpanded={setExpanded} setSidebarOpen={setSidebarOpen} activeKey={activeKey} setActiveKey={setActiveKey} setMobileMenuOpen={setMobileMenuOpen} logout={logout} navigate={navigate} />
            </div>
          </div>
        )}

        {/* ── Main Area ─────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 1, height: "100vh", overflow: "hidden" }}>

          {/* Topbar */}
          <header style={{
            height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px",
            background: t.dark ? "#0a0a0c" : "#ffffff",
            borderBottom: `1px solid ${t.border}`,
            position: "sticky", top: 0, zIndex: 50, flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Mobile menu button */}
              <button className="admin-mobile-btn" onClick={() => setMobileMenuOpen(true)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: t.textSub, fontSize: 20, padding: "2px 4px" }}>☰</button>
              {/* Desktop sidebar toggle */}
              <button className="admin-sidebar-desktop" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 20, padding: "2px 4px", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = RED}
                onMouseLeave={e => e.currentTarget.style.color = t.textMuted}>☰</button>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: t.text, fontFamily: "'Georgia','Times New Roman',serif" }}>{flatNav.find(n => n.key === activeKey)?.label || "Dashboard"}</div>
                <div style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.5px" }}>YourBuildMart Admin</div>
              </div>
            </div>

            <div className="admin-topbar-actions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Home */}
              <Link to="/" className="admin-topbar-link" style={{
                fontSize: 12.5, fontWeight: 700, color: t.textSub, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                borderRadius: 9, border: `1px solid ${t.border}`,
                transition: "all 0.18s", background: "transparent", whiteSpace: "nowrap",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; e.currentTarget.style.background = t.dark ? "rgba(230,46,4,0.08)" : "rgba(230,46,4,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSub; e.currentTarget.style.background = "transparent"; }}
              >🏠 Home</Link>

              {/* Products */}
              <Link to="/products" className="admin-topbar-link" style={{
                fontSize: 12.5, fontWeight: 700, color: t.textSub, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 5, padding: "7px 12px",
                borderRadius: 9, border: `1px solid ${t.border}`,
                transition: "all 0.18s", background: "transparent", whiteSpace: "nowrap",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; e.currentTarget.style.background = t.dark ? "rgba(230,46,4,0.08)" : "rgba(230,46,4,0.05)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSub; e.currentTarget.style.background = "transparent"; }}
              >🛍 Products</Link>

              {/* View Store (all pages) */}
              <Link to="/" className="admin-topbar-link" style={{
                fontSize: 12.5, fontWeight: 700, color: RED, textDecoration: "none",
                display: "flex", alignItems: "center", gap: 5, padding: "7px 14px",
                borderRadius: 9, border: `1px solid rgba(230,46,4,0.28)`,
                transition: "all 0.18s", background: "transparent", whiteSpace: "nowrap",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.dark ? "rgba(230,46,4,0.12)" : "rgba(230,46,4,0.08)"; e.currentTarget.style.boxShadow = `0 4px 14px ${t.redGlow}`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.boxShadow = "none"; }}
              >🌐 View Store</Link>

              {/* Theme toggle */}
              <ThemeToggle />

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${RED},${RED_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0, boxShadow: `0 4px 12px ${t.redGlow}` }}>
                  {(user?.fullName || user?.email || "A")[0].toUpperCase()}
                </div>
                <div style={{ lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{user?.fullName || "Admin"}</div>
                  <div style={{ fontSize: 11, color: t.textMuted }}>Administrator</div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="admin-main" style={{ flex: 1, padding: 24, overflowY: "auto", minWidth: 0, position: "relative", scrollBehavior: "smooth", overscrollBehavior: "contain" }}>
            {renderContent()}
          </main>

          {/* Footer */}
          <footer style={{ padding: "12px 24px", borderTop: `1px solid ${t.border}`, background: t.dark ? "rgba(10,10,12,0.8)" : "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)" }}>
            <p style={{ margin: 0, fontSize: 12, color: t.textMuted, textAlign: "center" }}>
              © 2026 YourBuildMart Admin Panel · <span style={{ color: RED }}>v7.5</span>
            </p>
          </footer>
        </div>
      </div>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: "", type: "success" })} />
    </>
  );
}

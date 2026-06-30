import { useRef, useEffect, useState, useCallback } from "react";
import { useTheme } from "./ThemeContext";

// ─── Rich Text Editor ──────────────────────────────────────────────────────
// A lightweight, dependency-free WYSIWYG editor (contentEditable + execCommand)
// for product / blog description fields. Supports bold, italic, underline,
// strikethrough, headings, lists, alignment, links, images, blockquote,
// text color, clear formatting, undo/redo, and a fullscreen toggle.
//
// Props:
//   value     – HTML string (controlled)
//   onChange  – (html) => void
//   placeholder – shown when empty
//   minHeight – px, default 160
const COLORS = ["#1a1a1a", "#e62e04", "#2563eb", "#16a34a", "#a855f7", "#f59e0b", "#64748b", "#ffffff"];

export default function RichTextEditor({ value, onChange, placeholder = "Write something…", minHeight = 160 }) {
  const { dark } = useTheme();
  const editorRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [focused, setFocused] = useState(false);
  const lastValueRef = useRef(value);

  const border    = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  const toolbarBg = dark ? "#1a1a1d" : "#f8f7f5";
  const editorBg  = dark ? "#111113" : "#ffffff";
  const text      = dark ? "#fafaf9" : "#0c0a09";
  const iconColor = dark ? "rgba(250,250,249,0.75)" : "rgba(12,10,9,0.75)";
  const RED       = "#e62e04";

  // Sync external value -> DOM only when it changes from outside (avoid cursor jumps)
  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      editorRef.current.innerHTML = value || "";
      lastValueRef.current = value;
    }
  }, [value]);

  const emit = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    lastValueRef.current = html;
    onChange?.(html);
  }, [onChange]);

  const exec = (cmd, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  const isEmpty = !value || value === "<br>" || value === "<p></p>" || value === "<div></div>";

  const Btn = ({ title, onClick, active, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      style={{
        width: 30, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
        border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700,
        background: active ? (dark ? "rgba(230,46,4,0.18)" : "rgba(230,46,4,0.1)") : "transparent",
        color: active ? RED : iconColor, transition: "background 0.15s",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </button>
  );

  const Sep = () => <div style={{ width: 1, height: 20, background: border, margin: "0 4px" }} />;

  return (
    <div style={{
      border: `1.5px solid ${focused ? RED : border}`, borderRadius: 10, overflow: "hidden",
      background: editorBg, transition: "border-color 0.2s",
      ...(fullscreen ? {
        position: "fixed", inset: 16, zIndex: 9999, display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      } : {}),
    }}>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2,
        padding: "6px 8px", background: toolbarBg, borderBottom: `1px solid ${border}`,
      }}>
        <Btn title="Bold (Ctrl+B)" onClick={() => exec("bold")}><span style={{ fontWeight: 900 }}>B</span></Btn>
        <Btn title="Underline" onClick={() => exec("underline")}><span style={{ textDecoration: "underline" }}>U</span></Btn>
        <Btn title="Italic" onClick={() => exec("italic")}><span style={{ fontStyle: "italic" }}>I</span></Btn>
        <Btn title="Strikethrough" onClick={() => exec("strikeThrough")}><span style={{ textDecoration: "line-through" }}>S</span></Btn>
        <Sep />
        <Btn title="Bullet list" onClick={() => exec("insertUnorderedList")}>≡</Btn>
        <Btn title="Numbered list" onClick={() => exec("insertOrderedList")}>1.</Btn>
        <Btn title="Blockquote" onClick={() => exec("formatBlock", "<blockquote>")}>" "</Btn>
        <Sep />
        <select
          title="Heading"
          onMouseDown={e => e.stopPropagation()}
          onChange={e => { exec("formatBlock", e.target.value); e.target.value = ""; }}
          defaultValue=""
          style={{
            height: 28, fontSize: 12, borderRadius: 6, border: `1px solid ${border}`,
            background: editorBg, color: text, cursor: "pointer", padding: "0 4px",
          }}
        >
          <option value="" disabled>Format</option>
          <option value="<p>">Paragraph</option>
          <option value="<h2>">Heading 2</option>
          <option value="<h3>">Heading 3</option>
          <option value="<h4>">Heading 4</option>
        </select>
        <Sep />
        <Btn title="Align left" onClick={() => exec("justifyLeft")}>⇤</Btn>
        <Btn title="Align center" onClick={() => exec("justifyCenter")}>↔</Btn>
        <Btn title="Align right" onClick={() => exec("justifyRight")}>⇥</Btn>
        <Sep />
        <div style={{ position: "relative" }}>
          <Btn title="Text color" onClick={() => setShowColors(s => !s)}>
            <span style={{ borderBottom: `2.5px solid ${RED}`, fontWeight: 900 }}>A</span>
          </Btn>
          {showColors && (
            <div style={{
              position: "absolute", top: 32, left: 0, zIndex: 20, display: "grid",
              gridTemplateColumns: "repeat(4,1fr)", gap: 5, padding: 8, borderRadius: 8,
              background: editorBg, border: `1px solid ${border}`, boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
            }}>
              {COLORS.map(c => (
                <button key={c} type="button"
                  onMouseDown={e => { e.preventDefault(); exec("foreColor", c); setShowColors(false); }}
                  style={{ width: 20, height: 20, borderRadius: "50%", border: `1px solid ${border}`, background: c, cursor: "pointer" }}
                />
              ))}
            </div>
          )}
        </div>
        <Btn title="Clear formatting" onClick={() => exec("removeFormat")}>⌫</Btn>
        <Sep />
        <Btn title="Insert link" onClick={() => {
          const url = window.prompt("Enter URL:", "https://");
          if (url) exec("createLink", url);
        }}>🔗</Btn>
        <Btn title="Insert image" onClick={() => {
          const url = window.prompt("Image URL:", "https://");
          if (url) exec("insertImage", url);
        }}>🖼</Btn>
        <Sep />
        <Btn title="Undo" onClick={() => exec("undo")}>↺</Btn>
        <Btn title="Redo" onClick={() => exec("redo")}>↻</Btn>
        <Sep />
        <Btn title={fullscreen ? "Exit fullscreen" : "Fullscreen"} onClick={() => setFullscreen(f => !f)}>
          {fullscreen ? "⤓" : "⤢"}
        </Btn>
      </div>

      {/* Editable area */}
      <div style={{ position: "relative", flex: fullscreen ? 1 : "none", overflow: "auto" }}>
        {isEmpty && !focused && (
          <div style={{
            position: "absolute", top: 12, left: 14, color: dark ? "rgba(250,250,249,0.35)" : "rgba(12,10,9,0.35)",
            fontSize: 14, pointerEvents: "none",
          }}>{placeholder}</div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setShowColors(false); }}
          style={{
            minHeight: fullscreen ? "100%" : minHeight, padding: "12px 14px",
            outline: "none", color: text, fontSize: 14, lineHeight: 1.65,
            fontFamily: "inherit",
          }}
        />
      </div>

      <style>{`
        [contenteditable] h2 { font-size: 1.5em; font-weight: 800; margin: 0.6em 0; }
        [contenteditable] h3 { font-size: 1.25em; font-weight: 700; margin: 0.5em 0; }
        [contenteditable] h4 { font-size: 1.1em; font-weight: 700; margin: 0.4em 0; }
        [contenteditable] p { margin: 0.4em 0; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 1.4em; margin: 0.4em 0; }
        [contenteditable] blockquote { border-left: 3px solid ${RED}; margin: 0.6em 0; padding: 4px 14px; opacity: 0.85; font-style: italic; }
        [contenteditable] a { color: ${RED}; text-decoration: underline; }
        [contenteditable] img { max-width: 100%; border-radius: 6px; }
      `}</style>
    </div>
  );
}

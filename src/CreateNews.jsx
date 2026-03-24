import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";

// ─── Inline SVG Icons ──────────────────────────────────────────────
const Ico = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IcoBold      = () => <Ico d={["M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z","M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"]} />;
const IcoItalic    = () => <Ico d="M19 4h-9M14 20H5M15 4 9 20" />;
const IcoUnder     = () => <Ico d="M6 4v6a6 6 0 0 0 12 0V4M4 20h16" />;
const IcoStrike    = () => <Ico d="M16 4H9a5 5 0 0 0-1 9.9M4 12h16M8 20h8" />;
const IcoH1        = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8M4 4v16M12 4v16"/><path d="M17 4v3h3M19 20v-8" strokeWidth="2.5"/></svg>;
const IcoH2        = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h8M4 4v16M12 4v16"/><path d="M15 8a2 2 0 0 1 4 0c0 2-4 4-4 6h4" /></svg>;
const IcoUL        = () => <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />;
const IcoOL        = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>;
const IcoQuote     = () => <Ico d={["M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z","M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"]} />;
const IcoLink      = () => <Ico d={["M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71","M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"]} />;
const IcoCode      = () => <Ico d="M16 18l6-6-6-6M8 6l-6 6 6 6" />;
const IcoHR        = () => <Ico d="M8 12h8M4 6v12M20 6v12" />;
const IcoAlignL    = () => <Ico d="M21 6H3M15 12H3M17 18H3" />;
const IcoAlignC    = () => <Ico d="M21 6H3M17 12H7M19 18H5" />;
const IcoAlignR    = () => <Ico d="M21 6H3M21 12H9M21 18H11" />;
const IcoUndo      = () => <Ico d={["M3 7v6h6","M3 13C4.4 9.4 7.9 7 12 7a9 9 0 0 1 9 9"]} />;
const IcoRedo      = () => <Ico d={["M21 7v6h-6","M21 13c-1.4-3.6-4.9-6-9-6a9 9 0 0 0-9 9"]} />;
const IcoImg       = () => <Ico d={["M21 15l-5-5L5 20","M14.5 4.5a2.121 2.121 0 1 1 3 3","M3 21V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14"]} />;
const IcoUpload    = () => <Ico d={["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} />;
const IcoX         = () => <Ico d="M18 6L6 18M6 6l12 12" />;
const IcoSend      = () => <Ico d="M22 2L11 13M22 2L15 22 8 13 2 9z" />;
const IcoEye       = () => <Ico d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"]} />;
const IcoEdit      = () => <Ico d={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]} />;
const IcoChev      = () => <Ico d="M9 18l6-6-6-6" size={12} />;
const IcoCheck     = () => <Ico d="M20 6L9 17l-5-5" />;
const IcoLayers    = () => <Ico d={["M12 2L2 7l10 5 10-5-10-5z","M2 17l10 5 10-5","M2 12l10 5 10-5"]} />;
const IcoNewspaper = () => <Ico d={["M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2-2z","M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2v-2","M8 6h8M8 10h8M8 14h4"]} />;
const IcoInfo      = () => <Ico d={["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 8v4M12 16h.01"]} />;

const css = {
  pageBg: "hsl(var(--muted) / 0.35)",
  cardShadow: "0 1px 2px hsl(var(--foreground) / 0.04), 0 8px 24px hsl(var(--foreground) / 0.06)",
  cardBorder: "1px solid hsl(var(--border) / 0.85)",
  radiusLg: "16px",
  radiusMd: "12px",
  radiusSm: "10px",
  fontUi: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontArticle: "ui-serif, Georgia, 'Times New Roman', 'Liberation Serif', serif",
  fontMono: "'SF Mono', ui-monospace, 'Fira Code', 'Cascadia Code', monospace",
};

// ─── Rich Text Editor ──────────────────────────────────────────────
function RichEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [mode, setMode]     = useState("write");
  const [wordCount, setWC]  = useState(0);
  const [charCount, setCC]  = useState(0);
  const [active, setActive] = useState({});

  const exec = useCallback((cmd, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    setTimeout(sync, 0);
  }, []);

  const sync = () => {
    if (!editorRef.current) return;
    const html  = editorRef.current.innerHTML;
    const text  = editorRef.current.innerText || "";
    onChange(html);
    setWC(text.trim().split(/\s+/).filter(Boolean).length);
    setCC(text.length);
    setActive({
      bold:                document.queryCommandState("bold"),
      italic:              document.queryCommandState("italic"),
      underline:           document.queryCommandState("underline"),
      strikeThrough:       document.queryCommandState("strikeThrough"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList:   document.queryCommandState("insertOrderedList"),
    });
  };

  useEffect(() => {
    if (editorRef.current && value && !editorRef.current.innerHTML)
      editorRef.current.innerHTML = value;
  }, []);

  const insertLink = () => {
    const url = prompt("Enter URL:", "https://");
    if (url) exec("createLink", url);
  };

  const insertImage = () => {
    const url = prompt("Image URL:");
    if (url) exec("insertHTML", `<img src="${url}" style="max-width:100%;border-radius:8px;margin:8px 0;display:block;" />`);
  };

  const sep = (
    <div
      aria-hidden
      style={{
        width: "1px",
        alignSelf: "stretch",
        minHeight: "24px",
        background: "hsl(var(--border))",
        margin: "0 4px",
        flexShrink: 0,
        opacity: 0.75,
      }}
    />
  );

  const Btn = ({ icon: Ic, cmd, action, title }) => {
    const isOn = cmd && active[cmd];
    return (
      <button
        type="button"
        title={title}
        onMouseDown={e => { e.preventDefault(); action ? action() : exec(cmd); }}
        className="cn-rte-btn"
        data-active={isOn ? "true" : undefined}
        style={{
          width: "32px",
          height: "30px",
          borderRadius: "8px",
          border: "none",
          background: isOn ? "hsl(var(--primary) / 0.14)" : "transparent",
          color: isOn ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
          flexShrink: 0,
          boxShadow: isOn ? "inset 0 0 0 1px hsl(var(--primary) / 0.22)" : "none",
        }}
      >
        <Ic />
      </button>
    );
  };

  const Tab = ({ id, label, Ic }) => {
    const on = mode === id;
    return (
      <button
        type="button"
        onClick={() => setMode(id)}
        className="cn-rte-tab"
        data-active={on ? "true" : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 14px",
          borderRadius: "9px",
          border: "none",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: "600",
          letterSpacing: "0.01em",
          transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease",
          background: on ? "hsl(var(--background))" : "transparent",
          color: on ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
          boxShadow: on ? "0 1px 3px hsl(var(--foreground) / 0.08)" : "none",
        }}
      >
        <Ic />{label}
      </button>
    );
  };

  const toolbarGroup = {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    padding: "3px 5px",
    borderRadius: "10px",
    background: "hsl(var(--muted) / 0.45)",
    border: "1px solid hsl(var(--border) / 0.5)",
  };

  return (
    <div
      className="cn-rich-editor"
      style={{
        border: css.cardBorder,
        borderRadius: css.radiusMd,
        overflow: "hidden",
        background: "hsl(var(--background))",
        boxShadow: "inset 0 1px 0 hsl(var(--background))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px 16px",
          padding: "10px 14px",
          borderBottom: "1px solid hsl(var(--border) / 0.7)",
          background: "linear-gradient(180deg, hsl(var(--muted) / 0.4) 0%, hsl(var(--muted) / 0.2) 100%)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            padding: "3px",
            borderRadius: "11px",
            background: "hsl(var(--muted) / 0.55)",
            border: "1px solid hsl(var(--border) / 0.45)",
          }}
        >
          <Tab id="write"   label="Compose" Ic={IcoEdit} />
          <Tab id="preview" label="Preview" Ic={IcoEye} />
          <Tab id="html"    label="Source"  Ic={IcoCode} />
        </div>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: "600", color: "hsl(var(--muted-foreground))", fontVariantNumeric: "tabular-nums" }}>
            {wordCount} words
          </span>
          <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "hsl(var(--border))" }} aria-hidden />
          <span style={{ fontSize: "11px", fontWeight: "500", color: "hsl(var(--muted-foreground))", fontVariantNumeric: "tabular-nums" }}>
            {charCount} characters
          </span>
        </span>
      </div>

      {mode === "write" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            padding: "10px 12px",
            borderBottom: "1px solid hsl(var(--border) / 0.65)",
            background: "hsl(var(--background))",
          }}
        >
          <div style={toolbarGroup}>
            <Btn icon={IcoUndo} action={() => exec("undo")} title="Undo" />
            <Btn icon={IcoRedo} action={() => exec("redo")} title="Redo" />
          </div>
          {sep}
          <div style={toolbarGroup}>
            <Btn icon={IcoBold}   cmd="bold"          title="Bold (Ctrl+B)" />
            <Btn icon={IcoItalic} cmd="italic"        title="Italic (Ctrl+I)" />
            <Btn icon={IcoUnder}  cmd="underline"     title="Underline (Ctrl+U)" />
            <Btn icon={IcoStrike} cmd="strikeThrough" title="Strikethrough" />
          </div>
          {sep}
          <div style={toolbarGroup}>
            <Btn icon={IcoH1} action={() => exec("formatBlock", "h1")} title="Heading 1" />
            <Btn icon={IcoH2} action={() => exec("formatBlock", "h2")} title="Heading 2" />
          </div>
          {sep}
          <div style={toolbarGroup}>
            <Btn icon={IcoUL}    cmd="insertUnorderedList" title="Bullet list" />
            <Btn icon={IcoOL}    cmd="insertOrderedList"   title="Numbered list" />
            <Btn icon={IcoQuote} action={() => exec("formatBlock", "blockquote")} title="Blockquote" />
          </div>
          {sep}
          <div style={toolbarGroup}>
            <Btn icon={IcoAlignL} action={() => exec("justifyLeft")}   title="Align left" />
            <Btn icon={IcoAlignC} action={() => exec("justifyCenter")} title="Align center" />
            <Btn icon={IcoAlignR} action={() => exec("justifyRight")}  title="Align right" />
          </div>
          {sep}
          <div style={toolbarGroup}>
            <Btn icon={IcoLink}  action={insertLink}                       title="Insert link" />
            <Btn icon={IcoImg}   action={insertImage}                      title="Insert image" />
            <Btn icon={IcoHR}    action={() => exec("insertHTML", "<hr style='border:none;border-top:1px solid hsl(var(--border));margin:1.5em 0;'/>")} title="Horizontal rule" />
            <Btn icon={IcoCode}  action={() => exec("formatBlock", "pre")} title="Code block" />
          </div>
        </div>
      )}

      {mode === "write" && (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          onKeyUp={sync}
          onMouseUp={sync}
          data-ph="Start writing your article here…"
          style={{
            minHeight: "360px",
            padding: "28px 28px 32px",
            fontSize: "16px",
            lineHeight: "1.75",
            color: "hsl(var(--foreground))",
            outline: "none",
            fontFamily: css.fontArticle,
            background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--muted) / 0.12) 100%)",
          }}
        />
      )}

      {mode === "preview" && (
        <div
          className="rte-preview cn-rte-preview"
          dangerouslySetInnerHTML={{
            __html: value ||
              "<p style='color:hsl(var(--muted-foreground));font-style:italic;margin:0'>Nothing to preview yet — switch to Compose to add content.</p>",
          }}
          style={{
            minHeight: "360px",
            padding: "28px 28px 32px",
            fontSize: "16px",
            lineHeight: "1.75",
            color: "hsl(var(--foreground))",
            fontFamily: css.fontArticle,
            background: "hsl(var(--background))",
          }}
        />
      )}

      {mode === "html" && (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="cn-rte-source"
          style={{
            display: "block",
            width: "100%",
            minHeight: "360px",
            padding: "22px 24px",
            border: "none",
            outline: "none",
            fontFamily: css.fontMono,
            fontSize: "13px",
            lineHeight: "1.65",
            color: "hsl(var(--foreground))",
            background: "hsl(var(--muted) / 0.35)",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      )}

      <style>{`
        .cn-rte-btn:not([data-active]):hover {
          background: hsl(var(--accent)) !important;
          color: hsl(var(--accent-foreground)) !important;
        }
        [data-ph]:empty::before {
          content: attr(data-ph);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          opacity: 0.85;
        }
        [contenteditable] h1 { font-size: 1.85em; font-weight: 800; margin: 0.45em 0 0.35em; letter-spacing: -0.02em; line-height: 1.2; }
        [contenteditable] h2 { font-size: 1.35em; font-weight: 700; margin: 0.55em 0 0.35em; letter-spacing: -0.015em; line-height: 1.25; }
        [contenteditable] blockquote {
          border-left: 3px solid hsl(var(--primary));
          margin: 1.1em 0;
          padding: 0.75em 1.25em;
          background: hsl(var(--muted) / 0.5);
          border-radius: 0 10px 10px 0;
          font-style: italic;
          color: hsl(var(--muted-foreground));
        }
        [contenteditable] pre {
          background: hsl(var(--muted));
          padding: 1em 1.1em;
          border-radius: 10px;
          font-family: ${css.fontMono};
          font-size: 0.88em;
          overflow-x: auto;
          margin: 1em 0;
          border: 1px solid hsl(var(--border) / 0.6);
        }
        [contenteditable] a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5em; margin: 0.55em 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5em; margin: 0.55em 0; }
        [contenteditable] hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 1.6em 0; }
        [contenteditable] p { margin: 0.45em 0; }
        .rte-preview h1 { font-size: 1.85em; font-weight: 800; margin: 0.45em 0 0.35em; letter-spacing: -0.02em; }
        .rte-preview h2 { font-size: 1.35em; font-weight: 700; margin: 0.55em 0 0.35em; }
        .rte-preview blockquote {
          border-left: 3px solid hsl(var(--primary));
          margin: 1.1em 0;
          padding: 0.75em 1.25em;
          background: hsl(var(--muted) / 0.5);
          border-radius: 0 10px 10px 0;
          font-style: italic;
        }
        .rte-preview pre {
          background: hsl(var(--muted));
          padding: 1em 1.1em;
          border-radius: 10px;
          font-family: ${css.fontMono};
          font-size: 0.88em;
          overflow-x: auto;
          border: 1px solid hsl(var(--border) / 0.6);
        }
        .rte-preview a { color: hsl(var(--primary)); text-underline-offset: 2px; }
        .rte-preview ul { list-style: disc; padding-left: 1.5em; margin: 0.55em 0; }
        .rte-preview ol { list-style: decimal; padding-left: 1.5em; margin: 0.55em 0; }
        .rte-preview img { max-width: 100%; border-radius: 10px; }
      `}</style>
    </div>
  );
}

// ─── Drop Zone ─────────────────────────────────────────────────────
function DropZone({ files, onFiles, maxFiles = 10, single = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const process = useCallback((incoming) => {
    const valid = Array.from(incoming).filter(f => f.type.startsWith("image/"));
    if (single) { onFiles(valid.slice(0, 1)); return; }
    onFiles([...files, ...valid].slice(0, maxFiles));
  }, [files, single, maxFiles, onFiles]);

  const remove = (i) => onFiles(files.filter((_, idx) => idx !== i));
  const thumb  = (f) => typeof f === "string" ? f : URL.createObjectURL(f);

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); process(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="cn-dropzone"
        style={{
          border: `1.5px dashed ${dragging ? "hsl(var(--primary) / 0.65)" : "hsl(var(--border))"}`,
          borderRadius: css.radiusMd,
          padding: "28px 20px",
          textAlign: "center",
          cursor: "pointer",
          background: dragging
            ? "linear-gradient(180deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.03) 100%)"
            : "hsl(var(--muted) / 0.25)",
          transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
          boxShadow: dragging ? "0 0 0 3px hsl(var(--primary) / 0.12)" : "inset 0 1px 0 hsl(var(--background) / 0.5)",
        }}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple={!single}
          style={{ display: "none" }} onChange={e => process(e.target.files)} />
        <div
          style={{
            width: "48px",
            height: "48px",
            margin: "0 auto 12px",
            borderRadius: "14px",
            background: dragging ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted) / 0.7)",
            border: "1px solid hsl(var(--border) / 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: dragging ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
            transition: "background 0.2s ease, color 0.2s ease, border-color 0.2s ease",
          }}
        >
          <IcoUpload />
        </div>
        <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: "650", color: "hsl(var(--foreground))", letterSpacing: "-0.01em" }}>
          {dragging ? "Release to add images" : "Drop files here or click to browse"}
        </p>
        <p style={{ margin: 0, fontSize: "12px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5 }}>
          PNG, JPG, or WebP
          <span style={{ opacity: 0.45, margin: "0 0.35em" }}>·</span>
          <span style={{ color: "hsl(var(--primary))", fontWeight: "600" }}>
            {single ? "One image" : `Up to ${maxFiles} images`}
          </span>
        </p>
      </div>

      {files.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: single ? "1fr" : "repeat(auto-fill, minmax(76px, 1fr))",
          gap: "10px",
          marginTop: "14px",
        }}>
          {files.map((f, i) => (
            <div key={i} className="dz-thumb" style={{
              position: "relative",
              borderRadius: "11px",
              overflow: "hidden",
              aspectRatio: single ? "16/9" : "1",
              background: "hsl(var(--muted))",
              border: "1px solid hsl(var(--border) / 0.8)",
              boxShadow: "0 2px 8px hsl(var(--foreground) / 0.06)",
            }}>
              <img src={thumb(f)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <button
                type="button"
                onClick={e => { e.stopPropagation(); remove(i); }}
                className="dz-remove"
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "6px",
                  width: "26px",
                  height: "26px",
                  borderRadius: "8px",
                  background: "hsl(var(--background) / 0.92)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid hsl(var(--border) / 0.6)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "hsl(var(--foreground))",
                  opacity: 0,
                  transition: "opacity 0.18s ease, transform 0.18s ease",
                }}
              >
                <IcoX />
              </button>
              {!single && (
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  inset: "auto 0 0",
                  background: "linear-gradient(transparent, hsl(var(--foreground) / 0.72))",
                  padding: "12px 6px 5px",
                }}>
                  <p style={{ margin: 0, fontSize: "9px", color: "hsl(var(--background))", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {typeof f === "string" ? "URL" : f.name}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .dz-thumb:hover .dz-remove { opacity: 1 !important; transform: scale(1.02); }
        .cn-dropzone:hover:not(:focus-within) {
          border-color: hsl(var(--primary) / 0.35);
          background: hsl(var(--muted) / 0.35);
        }
      `}</style>
    </div>
  );
}

// ─── UI Primitives ─────────────────────────────────────────────────
const s = {
  input: {
    width: "100%",
    border: "1px solid hsl(var(--border) / 0.9)",
    borderRadius: css.radiusSm,
    padding: "11px 14px",
    fontSize: "14px",
    color: "hsl(var(--foreground))",
    background: "hsl(var(--background))",
    outline: "none",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
    boxSizing: "border-box",
  },
};

function focusIn(e) {
  e.target.style.borderColor = "hsl(var(--ring))";
  e.target.style.boxShadow = "0 0 0 3px hsl(var(--ring) / 0.14)";
}
function focusOut(e) {
  e.target.style.borderColor = "hsl(var(--border) / 0.9)";
  e.target.style.boxShadow = "none";
}

function Panel({ children, style = {} }) {
  return (
    <div
      style={{
        background: "hsl(var(--card))",
        border: css.cardBorder,
        borderRadius: css.radiusLg,
        overflow: "hidden",
        boxShadow: css.cardShadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PHead({ icon: Ic, title, badge }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px 20px",
        borderBottom: "1px solid hsl(var(--border) / 0.65)",
        background: "linear-gradient(180deg, hsl(var(--muted) / 0.38) 0%, hsl(var(--muted) / 0.12) 100%)",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "11px",
          background: "linear-gradient(145deg, hsl(var(--primary) / 0.18) 0%, hsl(var(--primary) / 0.08) 100%)",
          border: "1px solid hsl(var(--primary) / 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "hsl(var(--primary))",
          flexShrink: 0,
        }}
      >
        <Ic />
      </div>
      <span style={{ fontWeight: "700", fontSize: "14px", color: "hsl(var(--foreground))", flex: 1, letterSpacing: "-0.02em" }}>
        {title}
      </span>
      {badge && (
        <span
          style={{
            fontSize: "10px",
            fontWeight: "700",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            background: "hsl(var(--primary) / 0.1)",
            color: "hsl(var(--primary))",
            padding: "4px 10px",
            borderRadius: "999px",
            border: "1px solid hsl(var(--primary) / 0.12)",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function FLabel({ children, required }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "11px",
        fontWeight: "650",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "hsl(var(--muted-foreground))",
        marginBottom: "7px",
      }}
    >
      {children}
      {required && <span style={{ color: "hsl(var(--destructive))", marginLeft: "4px" }} aria-hidden>*</span>}
    </label>
  );
}

function Field({ label, required, hint, children, half }) {
  return (
    <div style={{ marginBottom: half ? 0 : "20px" }}>
      <FLabel required={required}>{label}</FLabel>
      {children}
      {hint && (
        <p style={{ margin: "6px 0 0", fontSize: "11px", color: "hsl(var(--muted-foreground))", lineHeight: 1.45 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────
export default function CreateNews({ onCreated }) {
  const [loading, setLoading]   = useState(false);
  const [submitted, setDone]    = useState(false);
  const [form, setForm]         = useState({
    title: "", category: "", author: "", tags: "",
    description: "", content: "", status: "published",
    coverFiles: [], galleryFiles: [],
  });

  const AUTH_PWD  = "hello";
  const filled    = [form.title, form.description, form.content.length > 10 ? "ok" : "", form.coverFiles.length ? "ok" : ""].filter(Boolean).length;
  const canSubmit = form.title && form.content;
  const pct       = Math.round((filled / 4) * 100);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "coverFiles")   v.forEach(f => fd.append("coverImage", f));
        else if (k === "galleryFiles") v.forEach(f => fd.append("images", f));
        else fd.append(k, v);
      });
      fd.append("password", AUTH_PWD);
      await axios.post("/api/news", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setDone(true);
      setTimeout(() => onCreated?.(), 1800);
    } catch (err) {
      alert("Error: " + (err?.response?.data?.message || "Check console."));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div
      className="cn-success"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "480px",
        gap: "18px",
        fontFamily: css.fontUi,
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          background: "linear-gradient(145deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "hsl(var(--primary-foreground))",
          boxShadow: "0 12px 40px hsl(var(--primary) / 0.35)",
        }}
      >
        <IcoCheck />
      </div>
      <h2 style={{ fontWeight: "800", fontSize: "22px", color: "hsl(var(--foreground))", margin: 0, letterSpacing: "-0.03em" }}>
        Article published
      </h2>
      <p style={{ color: "hsl(var(--muted-foreground))", margin: 0, fontSize: "14px", maxWidth: "320px", textAlign: "center", lineHeight: 1.55 }}>
        Your press release is live. You will be redirected shortly.
      </p>
    </div>
  );

  return (
    <div
      className="cn-create-news"
      style={{
        minHeight: "100%",
        padding: "32px 20px 48px",
        background: css.pageBg,
        fontFamily: css.fontUi,
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "32px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div style={{ flex: "1 1 280px", minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "10px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: "700", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                CMS
              </span>
              <IcoChev />
              <span style={{ fontSize: "10px", fontWeight: "700", color: "hsl(var(--muted-foreground))", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                News
              </span>
              <IcoChev />
              <span style={{ fontSize: "10px", fontWeight: "800", color: "hsl(var(--primary))", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                New article
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.5rem, 2.5vw, 1.85rem)",
                fontWeight: "800",
                color: "hsl(var(--foreground))",
                letterSpacing: "-0.035em",
                lineHeight: 1.15,
              }}
            >
              Create press release
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: "14px", color: "hsl(var(--muted-foreground))", lineHeight: 1.5, maxWidth: "520px" }}>
              Drafting to{" "}
              <strong style={{ color: "hsl(var(--foreground))", fontWeight: "600" }}>News_Collection</strong>
              {" "}— complete the checklist before publishing.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "14px 18px",
              background: "hsl(var(--card))",
              border: css.cardBorder,
              borderRadius: css.radiusMd,
              boxShadow: css.cardShadow,
              flexShrink: 0,
            }}
          >
            <div style={{ position: "relative", width: "52px", height: "52px" }}>
              <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden style={{ transform: "rotate(-90deg)" }}>
                <circle cx="26" cy="26" r="22" fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                <circle
                  cx="26"
                  cy="26"
                  r="22"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 138.2} 138.2`}
                  style={{ transition: "stroke-dasharray 0.35s ease" }}
                />
              </svg>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "800",
                  color: "hsl(var(--foreground))",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {pct}%
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "hsl(var(--muted-foreground))", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Readiness
              </span>
              <span style={{ fontSize: "15px", fontWeight: "700", color: "hsl(var(--foreground))", fontVariantNumeric: "tabular-nums" }}>
                {filled}<span style={{ fontSize: "12px", fontWeight: "500", color: "hsl(var(--muted-foreground))" }}> / 4</span>
              </span>
              <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))" }}>
                Headline, summary, body, cover
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={submit}>
          <div className="cn-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "22px", alignItems: "start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <Panel>
                <PHead icon={IcoInfo} title="Article information" />
                <div style={{ padding: "22px 22px 8px" }}>
                  <Field label="Headline" required>
                    <input
                      style={{ ...s.input, fontSize: "17px", fontWeight: "700", letterSpacing: "-0.02em" }}
                      placeholder="Write a clear, newsworthy headline…"
                      value={form.title}
                      onChange={e => set("title", e.target.value)}
                      onFocus={focusIn}
                      onBlur={focusOut}
                      required
                    />
                  </Field>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }} className="cn-two-col">
                    <div>
                      <FLabel>Category</FLabel>
                      <select
                        style={{ ...s.input, cursor: "pointer" }}
                        value={form.category}
                        onChange={e => set("category", e.target.value)}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      >
                        <option value="">Select category…</option>
                        {["Breaking News","Business","Technology","Politics","Sports","Health","Science","Entertainment","World","Opinion"].map(c => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FLabel>Author</FLabel>
                      <input
                        style={s.input}
                        placeholder="Byline or desk name…"
                        value={form.author}
                        onChange={e => set("author", e.target.value)}
                        onFocus={focusIn}
                        onBlur={focusOut}
                      />
                    </div>
                  </div>

                  <Field label="Tags" hint="Comma-separated keywords for discovery and SEO.">
                    <input
                      style={s.input}
                      placeholder="e.g. finance, quarterly earnings, growth"
                      value={form.tags}
                      onChange={e => set("tags", e.target.value)}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    />
                  </Field>

                  <Field label="Meta description" hint={`${form.description.length} / 160 characters recommended for search snippets.`}>
                    <textarea
                      style={{ ...s.input, minHeight: "88px", resize: "vertical", lineHeight: "1.55" }}
                      placeholder="One or two sentences that summarize the story for listings and search…"
                      value={form.description}
                      onChange={e => set("description", e.target.value)}
                      onFocus={focusIn}
                      onBlur={focusOut}
                    />
                  </Field>
                </div>
              </Panel>

              <Panel>
                <PHead icon={IcoNewspaper} title="Article body" badge="Rich text" />
                <div style={{ padding: "22px" }}>
                  <RichEditor value={form.content} onChange={v => set("content", v)} />
                </div>
              </Panel>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <Panel>
                <PHead icon={IcoSend} title="Publish" />
                <div style={{ padding: "18px 20px" }}>
                  <FLabel>Status</FLabel>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "8px",
                      marginBottom: "18px",
                      padding: "4px",
                      borderRadius: "11px",
                      background: "hsl(var(--muted) / 0.4)",
                      border: "1px solid hsl(var(--border) / 0.5)",
                    }}
                  >
                    {["published", "draft", "scheduled"].map(st => {
                      const on = form.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => set("status", st)}
                          style={{
                            padding: "9px 6px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: "700",
                            textTransform: "capitalize",
                            letterSpacing: "0.02em",
                            transition: "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease",
                            background: on ? "hsl(var(--background))" : "transparent",
                            color: on ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                            boxShadow: on ? "0 1px 4px hsl(var(--foreground) / 0.08)" : "none",
                          }}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      background: "hsl(var(--muted) / 0.35)",
                      borderRadius: "11px",
                      padding: "12px 14px",
                      marginBottom: "16px",
                      border: "1px solid hsl(var(--border) / 0.45)",
                    }}
                  >
                    {[
                      ["Title", form.title || "—"],
                      ["Category", form.category || "—"],
                      ["Author", form.author || "—"],
                      ["Cover", `${form.coverFiles.length} file(s)`],
                      ["Gallery", `${form.galleryFiles.length} / 10`],
                      ["Status", form.status],
                    ].map(([k, v], idx, arr) => (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: "12px",
                          padding: "8px 0",
                          borderBottom: idx < arr.length - 1 ? "1px solid hsl(var(--border) / 0.45)" : "none",
                        }}
                      >
                        <span style={{ fontSize: "11px", color: "hsl(var(--muted-foreground))", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {k}
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "hsl(var(--foreground))",
                            fontWeight: "600",
                            maxWidth: "160px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textAlign: "right",
                          }}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !canSubmit}
                    style={{
                      width: "100%",
                      padding: "13px 16px",
                      borderRadius: "11px",
                      border: "none",
                      background: canSubmit
                        ? "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.92) 100%)"
                        : "hsl(var(--muted))",
                      color: canSubmit ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                      cursor: canSubmit && !loading ? "pointer" : "not-allowed",
                      fontWeight: "700",
                      fontSize: "14px",
                      letterSpacing: "0.01em",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      transition: "opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
                      opacity: loading ? 0.75 : 1,
                      boxShadow: canSubmit ? "0 4px 14px hsl(var(--primary) / 0.28)" : "none",
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{ display: "inline-block", animation: "cn-spin 0.9s linear infinite" }}>
                          <IcoSend />
                        </span>
                        Publishing…
                      </>
                    ) : (
                      <>
                        <IcoSend />
                        Publish article
                      </>
                    )}
                  </button>
                  {!canSubmit && (
                    <p style={{ margin: "8px 0 0", fontSize: "11px", color: "hsl(var(--muted-foreground))", textAlign: "center", lineHeight: 1.45 }}>
                      Headline and article body are required to publish.
                    </p>
                  )}
                </div>
              </Panel>

              <Panel>
                <PHead
                  icon={IcoImg}
                  title="Cover image"
                  badge={form.coverFiles.length ? "Added" : "Optional"}
                />
                <div style={{ padding: "18px 20px" }}>
                  <DropZone files={form.coverFiles} onFiles={v => set("coverFiles", v)} maxFiles={1} single />
                </div>
              </Panel>

              <Panel>
                <PHead icon={IcoLayers} title="Image gallery" badge={`${form.galleryFiles.length} / 10`} />
                <div style={{ padding: "18px 20px" }}>
                  <DropZone files={form.galleryFiles} onFiles={v => set("galleryFiles", v)} maxFiles={10} />
                </div>
              </Panel>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes cn-spin { to { transform: rotate(360deg); } }
        .cn-create-news *, .cn-create-news *::before, .cn-create-news *::after { box-sizing: border-box; }
        @media (max-width: 1024px) {
          .cn-form-grid { grid-template-columns: 1fr !important; }
          .cn-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

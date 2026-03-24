import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Send,
  ImageIcon,
  FileText,
  Type,
  Loader2,
  Layers,
  X,
  AlignLeft,
  Upload,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Heading1,
  Heading2,
  Quote,
  Minus,
  Eye,
  Edit3,
  ChevronRight,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

/* ─── Google Fonts ──────────────────────────────────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

    * { box-sizing: border-box; }

    :root {
      --ink: #0f1117;
      --ink-soft: #3a3d4a;
      --ink-muted: #7a7e8f;
      --ink-faint: #b0b4c4;
      --paper: #fafaf8;
      --paper-warm: #f4f3ee;
      --paper-card: #ffffff;
      --rule: #e4e2db;
      --rule-soft: #eeede8;
      --accent: #c8102e;
      --accent-soft: #fdf1f3;
      --accent-mid: #e8b4bc;
      --green: #1a7a4a;
      --green-soft: #edf7f2;
      --shadow-sm: 0 1px 3px rgba(15,17,23,0.06), 0 1px 2px rgba(15,17,23,0.04);
      --shadow-md: 0 4px 16px rgba(15,17,23,0.08), 0 1px 4px rgba(15,17,23,0.04);
      --shadow-lg: 0 12px 40px rgba(15,17,23,0.10), 0 2px 8px rgba(15,17,23,0.06);
      --radius: 4px;
      --radius-lg: 8px;
      --font-display: 'Playfair Display', Georgia, serif;
      --font-body: 'DM Sans', system-ui, sans-serif;
      --font-mono: 'DM Mono', monospace;
    }

    .cn-wrap {
      background: var(--paper);
      min-height: 100vh;
      font-family: var(--font-body);
      color: var(--ink);
    }

    /* ── Masthead ── */
    .cn-masthead {
      background: var(--ink);
      color: white;
      padding: 0 2.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      border-bottom: 3px solid var(--accent);
    }
    .cn-masthead-logo {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: white;
    }
    .cn-masthead-logo span { color: var(--accent); }
    .cn-masthead-meta {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      font-size: 0.6875rem;
      color: rgba(255,255,255,0.5);
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .cn-db-pill {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      padding: 0.3rem 0.75rem;
      border-radius: 100px;
      font-size: 0.625rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .cn-pulse {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #22c55e;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* ── Sub-nav ── */
    .cn-subnav {
      background: var(--paper-card);
      border-bottom: 1px solid var(--rule);
      padding: 0 2.5rem;
      height: 42px;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }
    .cn-crumb {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--ink-muted);
      letter-spacing: 0.04em;
    }
    .cn-crumb.active { color: var(--ink); font-weight: 600; }
    .cn-crumb-sep { color: var(--ink-faint); font-size: 0.625rem; }

    /* ── Page ── */
    .cn-page {
      max-width: 1140px;
      margin: 0 auto;
      padding: 2.5rem 2rem;
    }

    /* ── Page Header ── */
    .cn-page-header {
      margin-bottom: 2.5rem;
    }
    .cn-page-eyebrow {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent);
      margin-bottom: 0.625rem;
    }
    .cn-page-title {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 700;
      color: var(--ink);
      line-height: 1.15;
      margin: 0 0 0.5rem;
    }
    .cn-page-sub {
      font-size: 0.875rem;
      color: var(--ink-soft);
      margin: 0;
      font-weight: 400;
    }
    .cn-page-sub strong { color: var(--ink); font-weight: 600; }

    /* ── Grid ── */
    .cn-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 1.75rem;
      align-items: start;
    }
    @media (max-width: 900px) {
      .cn-grid { grid-template-columns: 1fr; }
    }
    .cn-left { display: flex; flex-direction: column; gap: 1.5rem; }
    .cn-right { display: flex; flex-direction: column; gap: 1.5rem; }

    /* ── Card ── */
    .cn-card {
      background: var(--paper-card);
      border: 1px solid var(--rule);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }
    .cn-card-header {
      padding: 1rem 1.25rem 0.875rem;
      border-bottom: 1px solid var(--rule-soft);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--paper-warm);
    }
    .cn-card-icon {
      width: 30px; height: 30px;
      border-radius: var(--radius);
      background: var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .cn-card-icon.accent { background: var(--accent); }
    .cn-card-icon-inner { color: white; }
    .cn-card-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--ink);
      letter-spacing: 0.01em;
      line-height: 1.2;
    }
    .cn-card-sub {
      font-size: 0.625rem;
      color: var(--ink-muted);
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-top: 0.125rem;
    }
    .cn-card-body { padding: 1.25rem; }

    /* ── Field ── */
    .cn-field { margin-bottom: 1rem; }
    .cn-field:last-child { margin-bottom: 0; }
    .cn-label {
      display: block;
      font-size: 0.625rem;
      font-weight: 700;
      color: var(--ink-muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .cn-input {
      width: 100%;
      background: var(--paper);
      border: 1.5px solid var(--rule);
      border-radius: var(--radius);
      padding: 0.625rem 0.875rem;
      font-size: 0.875rem;
      font-family: var(--font-body);
      color: var(--ink);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .cn-input::placeholder { color: var(--ink-faint); }
    .cn-input:focus {
      border-color: var(--ink);
      box-shadow: 0 0 0 3px rgba(15,17,23,0.06);
    }
    .cn-input.headline {
      font-size: 0.9375rem;
      font-weight: 600;
      font-family: var(--font-display);
    }
    .cn-input-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    /* ── Rich Text Editor ── */
    .cn-editor-wrap {
      border: 1.5px solid var(--rule);
      border-radius: var(--radius);
      overflow: hidden;
      background: var(--paper);
      transition: border-color 0.15s;
    }
    .cn-editor-wrap:focus-within { border-color: var(--ink); }
    .cn-toolbar {
      display: flex;
      align-items: center;
      gap: 1px;
      padding: 0.5rem 0.75rem;
      background: var(--paper-warm);
      border-bottom: 1px solid var(--rule-soft);
      flex-wrap: wrap;
    }
    .cn-tool-btn {
      width: 26px; height: 26px;
      border-radius: 3px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ink-muted);
      transition: background 0.1s, color 0.1s;
      flex-shrink: 0;
    }
    .cn-tool-btn:hover { background: var(--rule); color: var(--ink); }
    .cn-tool-sep {
      width: 1px; height: 16px;
      background: var(--rule);
      margin: 0 0.25rem;
      flex-shrink: 0;
    }
    .cn-view-toggle {
      margin-left: auto;
      display: flex;
      background: var(--rule-soft);
      border-radius: 4px;
      padding: 2px;
      gap: 2px;
    }
    .cn-view-btn {
      padding: 0.2rem 0.625rem;
      border-radius: 3px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 0.6875rem;
      font-weight: 600;
      font-family: var(--font-body);
      color: var(--ink-muted);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: background 0.1s, color 0.1s;
    }
    .cn-view-btn.active {
      background: var(--paper-card);
      color: var(--ink);
      box-shadow: var(--shadow-sm);
    }
    .cn-editable {
      min-height: 18rem;
      padding: 1rem 1.125rem;
      font-size: 0.875rem;
      font-family: var(--font-body);
      color: var(--ink);
      outline: none;
      line-height: 1.75;
    }
    .cn-editable:empty::before {
      content: attr(data-placeholder);
      color: var(--ink-faint);
      pointer-events: none;
    }
    .cn-preview {
      min-height: 18rem;
      padding: 1rem 1.125rem;
      font-size: 0.875rem;
      color: var(--ink);
      line-height: 1.75;
    }
    .cn-preview h1 { font-family: var(--font-display); font-size: 1.375rem; margin: 0.75em 0 0.4em; }
    .cn-preview h2 { font-family: var(--font-display); font-size: 1.125rem; margin: 0.75em 0 0.4em; }
    .cn-preview blockquote {
      border-left: 3px solid var(--accent);
      padding-left: 1rem;
      color: var(--ink-soft);
      margin: 0.75em 0;
      font-style: italic;
    }
    .cn-preview ul, .cn-preview ol { padding-left: 1.5rem; margin: 0.5em 0; }
    .cn-preview hr { border: none; border-top: 1px solid var(--rule); margin: 1em 0; }
    .cn-preview a { color: var(--accent); text-decoration: underline; }
    .cn-word-count {
      padding: 0.375rem 1.125rem;
      border-top: 1px solid var(--rule-soft);
      font-size: 0.625rem;
      color: var(--ink-faint);
      font-family: var(--font-mono);
      font-weight: 500;
      letter-spacing: 0.04em;
      background: var(--paper-warm);
      display: flex;
      justify-content: flex-end;
    }

    /* ── File Upload ── */
    .cn-dropzone {
      border: 1.5px dashed var(--rule);
      border-radius: var(--radius);
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .cn-dropzone:hover, .cn-dropzone.dragging {
      border-color: var(--ink);
      background: var(--paper-warm);
    }
    .cn-dropzone-text {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--ink-muted);
      margin-top: 0.5rem;
    }
    .cn-dropzone-text span { color: var(--ink); text-decoration: underline; }
    .cn-dropzone-hint {
      font-size: 0.625rem;
      color: var(--ink-faint);
      margin-top: 0.25rem;
      font-family: var(--font-mono);
    }
    .cn-previews-single { margin-top: 0.75rem; }
    .cn-previews-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .cn-preview-thumb {
      position: relative;
      border-radius: var(--radius);
      overflow: hidden;
      border: 1px solid var(--rule);
      background: var(--paper-warm);
    }
    .cn-preview-thumb.aspect-video { aspect-ratio: 16/9; }
    .cn-preview-thumb.aspect-square { aspect-ratio: 1; }
    .cn-preview-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .cn-preview-remove {
      position: absolute;
      top: 4px; right: 4px;
      width: 18px; height: 18px;
      border-radius: 50%;
      background: var(--accent);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s;
    }
    .cn-preview-thumb:hover .cn-preview-remove { opacity: 1; }
    .cn-thumb-label {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      background: rgba(15,17,23,0.7);
      color: white;
      font-size: 0.5625rem;
      font-weight: 600;
      padding: 2px 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Summary ── */
    .cn-summary {
      background: var(--paper-warm);
      border: 1px solid var(--rule);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .cn-summary-header {
      padding: 0.75rem 1.125rem;
      border-bottom: 1px solid var(--rule);
      font-size: 0.625rem;
      font-weight: 700;
      color: var(--ink-muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: var(--paper-card);
    }
    .cn-summary-body { padding: 0.875rem 1.125rem; }
    .cn-summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.375rem 0;
      border-bottom: 1px solid var(--rule-soft);
    }
    .cn-summary-row:last-child { border-bottom: none; }
    .cn-summary-key {
      font-size: 0.6875rem;
      color: var(--ink-muted);
      font-weight: 500;
    }
    .cn-summary-val {
      font-size: 0.6875rem;
      color: var(--ink);
      font-weight: 600;
      font-family: var(--font-mono);
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: right;
    }
    .cn-summary-val.empty { color: var(--ink-faint); font-style: italic; font-family: var(--font-body); }

    /* ── Status Banner ── */
    .cn-status {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.75rem 1rem;
      border-radius: var(--radius);
      font-size: 0.8125rem;
      font-weight: 500;
      margin-bottom: 0.75rem;
    }
    .cn-status.success {
      background: var(--green-soft);
      color: var(--green);
      border: 1px solid #a7dfbf;
    }
    .cn-status.error {
      background: var(--accent-soft);
      color: var(--accent);
      border: 1px solid var(--accent-mid);
    }

    /* ── Submit Button ── */
    .cn-submit {
      width: 100%;
      background: var(--ink);
      color: white;
      border: none;
      border-radius: var(--radius);
      padding: 0.875rem 1.5rem;
      font-size: 0.875rem;
      font-weight: 700;
      font-family: var(--font-body);
      letter-spacing: 0.03em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      transition: transform 0.1s, box-shadow 0.15s, background 0.15s;
      box-shadow: 0 2px 8px rgba(15,17,23,0.25);
    }
    .cn-submit:hover:not(:disabled) {
      background: var(--accent);
      box-shadow: 0 4px 16px rgba(200,16,46,0.35);
    }
    .cn-submit:active:not(:disabled) { transform: scale(0.99); }
    .cn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    /* ── Progress Strip ── */
    .cn-progress-wrap {
      height: 2px;
      background: var(--rule);
      border-radius: 1px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }
    .cn-progress-bar {
      height: 100%;
      background: var(--accent);
      border-radius: 1px;
      transition: width 0.4s ease;
    }
  `}</style>
);

/* ─── Helpers ───────────────────────────────────────────────────────── */
function stripHtmlToText(html) {
  if (!html) return "";
  if (typeof window !== "undefined") {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || "").trim();
  }
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function countWordsFromHtml(html) {
  const text = stripHtmlToText(html);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

/* ─── Rich Text Editor ──────────────────────────────────────────────── */
function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setWordCount(countWordsFromHtml(value));
  }, [value]);

  useEffect(() => {
    if (!preview && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, preview]);

  const syncContent = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    onChange(html);
  }, [onChange]);

  const exec = useCallback(
    (cmd, val = null) => {
      editorRef.current?.focus();
      document.execCommand(cmd, false, val);
      syncContent();
    },
    [syncContent],
  );

  const insertLink = useCallback(() => {
    const urlInput = window.prompt("Enter URL (https://...)");
    if (!urlInput) return;
    const normalizedUrl = /^https?:\/\//i.test(urlInput)
      ? urlInput
      : `https://${urlInput}`;
    exec("createLink", normalizedUrl);
  }, [exec]);

  const tools = [
    { icon: Bold, cmd: "bold", title: "Bold" },
    { icon: Italic, cmd: "italic", title: "Italic" },
    { icon: Underline, cmd: "underline", title: "Underline" },
    null,
    { icon: Heading1, cmd: "formatBlock", val: "H1", title: "Heading 1" },
    { icon: Heading2, cmd: "formatBlock", val: "H2", title: "Heading 2" },
    null,
    { icon: List, cmd: "insertUnorderedList", title: "Bullet List" },
    { icon: ListOrdered, cmd: "insertOrderedList", title: "Numbered List" },
    { icon: Quote, cmd: "formatBlock", val: "BLOCKQUOTE", title: "Quote" },
    { icon: Minus, cmd: "insertHorizontalRule", title: "Divider" },
    null,
    { icon: Link, action: insertLink, title: "Insert Link" },
  ];

  return (
    <div className="cn-editor-wrap">
      <div className="cn-toolbar">
        {tools.map((tool, i) =>
          tool === null ? (
            <div key={i} className="cn-tool-sep" />
          ) : (
            <button
              key={i}
              type="button"
              title={tool.title}
              className="cn-tool-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                if (tool.action) {
                  tool.action();
                } else {
                  exec(tool.cmd, tool.val);
                }
              }}
            >
              <tool.icon size={13} />
            </button>
          ),
        )}
        <div className="cn-view-toggle">
          <button
            type="button"
            className={`cn-view-btn ${!preview ? "active" : ""}`}
            onClick={() => setPreview(false)}
          >
            <Edit3 size={10} /> Edit
          </button>
          <button
            type="button"
            className={`cn-view-btn ${preview ? "active" : ""}`}
            onClick={() => setPreview(true)}
          >
            <Eye size={10} /> Preview
          </button>
        </div>
      </div>
      {preview ? (
        <div
          className="cn-preview"
          dangerouslySetInnerHTML={{
            __html:
              value ||
              `<p style="color:var(--ink-faint);font-style:italic">Nothing to preview yet.</p>`,
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncContent}
          onBlur={syncContent}
          className="cn-editable"
          data-placeholder="Write full article body content here…"
        />
      )}
      <div className="cn-word-count">{wordCount} words</div>
    </div>
  );
}

/* ─── File Upload Zone ──────────────────────────────────────────────── */
function FileUploadZone({ files, onFiles, maxFiles = 10, single = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = useCallback(
    (newFiles) => {
      const valid = Array.from(newFiles || []).filter((f) =>
        f.type.startsWith("image/"),
      );

      if (single) {
        onFiles(valid.slice(0, 1));
        return;
      }

      const existingKeys = new Set(
        files.map((f) =>
          typeof f === "string" ? f : `${f.name}-${f.size}-${f.lastModified}`,
        ),
      );
      const dedupedIncoming = valid.filter((f) => {
        const key = `${f.name}-${f.size}-${f.lastModified}`;
        return !existingKeys.has(key);
      });
      const combined = [...files, ...dedupedIncoming].slice(0, maxFiles);
      onFiles(combined);
    },
    [files, maxFiles, onFiles, single],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles],
  );

  const removeFile = (idx) => onFiles(files.filter((_, i) => i !== idx));

  const previewUrls = useMemo(
    () => files.map((file) => (typeof file === "string" ? file : URL.createObjectURL(file))),
    [files],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  return (
    <div>
      <div
        className={`cn-dropzone ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload
          size={18}
          style={{
            margin: "0 auto",
            display: "block",
            color: "var(--ink-muted)",
          }}
        />
        <p className="cn-dropzone-text">
          Drag & drop or <span>browse files</span>
        </p>
        <p className="cn-dropzone-hint">
          PNG · JPG · WEBP &nbsp;·&nbsp;{" "}
          {single ? "1 file max" : `Up to ${maxFiles} files`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={!single}
          style={{ display: "none" }}
          onChange={(e) => {
            processFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div className={single ? "cn-previews-single" : "cn-previews-grid"}>
          {files.map((file, idx) => (
            <div
              key={idx}
              className={`cn-preview-thumb ${single ? "aspect-video" : "aspect-square"}`}
            >
              <img src={previewUrls[idx]} alt={`preview-${idx}`} />
              <button
                type="button"
                className="cn-preview-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
              >
                <X size={9} />
              </button>
              {!single && (
                <div className="cn-thumb-label">
                  {typeof file === "string" ? "URL" : file.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Progress calculation ──────────────────────────────────────────── */
function getProgress(form) {
  let score = 0;
  if (form.title.trim()) score += 25;
  if (form.author.trim()) score += 20;
  if (form.description.trim()) score += 15;
  if (stripHtmlToText(form.content)) score += 25;
  if (form.coverFiles.length) score += 15;
  return score;
}

/* ─── Main Component ────────────────────────────────────────────────── */
export default function CreateNews({ onCreated }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg }
  const [form, setForm] = useState({
    title: "",
    author: "",
    authorTitle: "",
    description: "",
    content: "",
    coverFiles: [],
    galleryFiles: [],
  });

  const AUTH_PWD = "hello";
  const progress = getProgress(form);

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!stripHtmlToText(form.content)) {
      setStatus({
        type: "error",
        msg: "Article content is required before publishing.",
      });
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("author", form.author.trim());
      data.append("authorTitle", form.authorTitle.trim());
      data.append("description", form.description.trim());
      data.append("content", form.content);
      data.append("password", AUTH_PWD);

      form.coverFiles.forEach((f) => data.append("coverImage", f));
      form.galleryFiles.forEach((f) => data.append("images", f));

      const payloadForConsole = {
        title: form.title.trim(),
        author: form.author.trim(),
        authorTitle: form.authorTitle.trim(),
        description: form.description.trim(),
        contentHtml: form.content,
        contentText: stripHtmlToText(form.content),
        coverFiles: form.coverFiles.map((f) => (typeof f === "string" ? f : f.name)),
        galleryFiles: form.galleryFiles.map((f) => (typeof f === "string" ? f : f.name)),
      };

      const formDataEntries = [];
      for (const [key, value] of data.entries()) {
        if (value instanceof File) {
          formDataEntries.push({
            key,
            fileName: value.name,
            fileType: value.type,
            fileSize: value.size,
          });
        } else {
          formDataEntries.push({ key, value });
        }
      }

      console.log("[CreateNews] Publish payload:", payloadForConsole);
      console.log("[CreateNews] FormData entries:", formDataEntries);

      const response = await axios.post("/api/news", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("[CreateNews] Publish success response:", response.data);

      setStatus({
        type: "success",
        msg: "Press release published successfully.",
      });
      onCreated?.(response.data);
    } catch (err) {
      console.error("[CreateNews] Publish error:", err?.response?.data || err);
      setStatus({
        type: "error",
        msg: "Publish failed. Please check network logs.",
      });
    } finally {
      setLoading(false);
    }
  };

  const summaryRows = [
    { key: "Title", val: form.title },
    { key: "Author", val: form.author },
    { key: "Description", val: form.description },
    {
      key: "Cover Image",
      val: form.coverFiles.length ? `${form.coverFiles.length} file` : null,
    },
    {
      key: "Gallery",
      val: form.galleryFiles.length
        ? `${form.galleryFiles.length} file(s)`
        : null,
    },
  ];

  return (
    <>
      <FontLoader />
      <div className="cn-wrap">
        {/* Masthead */}
        <header className="cn-masthead">
          <div className="cn-masthead-logo">
            Press<span>Room</span>
          </div>
          <div className="cn-masthead-meta">
            <span>Content Management System</span>
            <div className="cn-db-pill">
              <div className="cn-pulse" />
              Connected
            </div>
          </div>
        </header>

        {/* Sub-nav */}
        <div className="cn-subnav">
          <span className="cn-crumb">Content Management</span>
          <ChevronRight size={10} className="cn-crumb-sep" />
          <span className="cn-crumb">Press Releases</span>
          <ChevronRight size={10} className="cn-crumb-sep" />
          <span className="cn-crumb active">New Article</span>
        </div>

        {/* Page */}
        <div className="cn-page">
          {/* Page Header */}
          <div className="cn-page-header">
            <p className="cn-page-eyebrow">New Press Release</p>
            <h1 className="cn-page-title">Create & Publish Article</h1>
            <p className="cn-page-sub">
              Publishing to <strong>News_Collection</strong> · Complete all
              required fields before submitting
            </p>
          </div>

          <form onSubmit={handleCreate}>
            <div className="cn-grid">
              {/* LEFT */}
              <div className="cn-left">
                {/* Headline */}
                <div className="cn-card">
                  <div className="cn-card-header">
                    <div className="cn-card-icon accent">
                      <Type size={13} className="cn-card-icon-inner" />
                    </div>
                    <div>
                      <div className="cn-card-title">Headline</div>
                      <div className="cn-card-sub">Article Title</div>
                    </div>
                  </div>
                  <div className="cn-card-body">
                    <div className="cn-field">
                      <label className="cn-label">Title *</label>
                      <input
                        className="cn-input headline"
                        placeholder="Enter article headline…"
                        value={form.title}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, title: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Author */}
                <div className="cn-card">
                  <div className="cn-card-header">
                    <div className="cn-card-icon">
                      <User size={13} className="cn-card-icon-inner" />
                    </div>
                    <div>
                      <div className="cn-card-title">Author</div>
                      <div className="cn-card-sub">Byline Information</div>
                    </div>
                  </div>
                  <div className="cn-card-body">
                    <div className="cn-input-row">
                      <div className="cn-field">
                        <label className="cn-label">Full Name *</label>
                        <input
                          className="cn-input"
                          placeholder="e.g. Sarah Johnson"
                          value={form.author}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, author: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="cn-field">
                        <label className="cn-label">Title / Role</label>
                        <input
                          className="cn-input"
                          placeholder="e.g. Senior Correspondent"
                          value={form.authorTitle}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              authorTitle: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta Description */}
                <div className="cn-card">
                  <div className="cn-card-header">
                    <div className="cn-card-icon">
                      <AlignLeft size={13} className="cn-card-icon-inner" />
                    </div>
                    <div>
                      <div className="cn-card-title">Meta Description</div>
                      <div className="cn-card-sub">SEO Summary</div>
                    </div>
                  </div>
                  <div className="cn-card-body">
                    <div className="cn-field">
                      <label className="cn-label">Short Description</label>
                      <input
                        className="cn-input"
                        placeholder="Brief summary for SEO and article listings…"
                        value={form.description}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Article Body */}
                <div className="cn-card">
                  <div className="cn-card-header">
                    <div className="cn-card-icon">
                      <FileText size={13} className="cn-card-icon-inner" />
                    </div>
                    <div>
                      <div className="cn-card-title">Article Body</div>
                      <div className="cn-card-sub">Full Content</div>
                    </div>
                  </div>
                  <div className="cn-card-body">
                    <label className="cn-label">Content *</label>
                    <RichTextEditor
                      value={form.content}
                      onChange={(val) =>
                        setForm((prev) => ({ ...prev, content: val }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="cn-right">
                {/* Completion Progress */}
                <div className="cn-card">
                  <div className="cn-card-header">
                    <div className="cn-card-icon">
                      <CheckCircle2 size={13} className="cn-card-icon-inner" />
                    </div>
                    <div>
                      <div className="cn-card-title">Completion</div>
                      <div className="cn-card-sub">{progress}% Ready</div>
                    </div>
                  </div>
                  <div className="cn-card-body">
                    <div className="cn-progress-wrap">
                      <div
                        className="cn-progress-bar"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--ink-muted)",
                        margin: 0,
                      }}
                    >
                      {progress < 60
                        ? "Fill in required fields to publish."
                        : progress < 100
                          ? "Almost ready — add remaining details."
                          : "All fields complete. Ready to publish!"}
                    </p>
                  </div>
                </div>

                {/* Cover Image */}
                <div className="cn-card">
                  <div className="cn-card-header">
                    <div className="cn-card-icon accent">
                      <ImageIcon size={13} className="cn-card-icon-inner" />
                    </div>
                    <div>
                      <div className="cn-card-title">Cover Image</div>
                      <div className="cn-card-sub">Primary Visual Asset</div>
                    </div>
                  </div>
                  <div className="cn-card-body">
                    <FileUploadZone
                      files={form.coverFiles}
                      onFiles={(files) =>
                        setForm((prev) => ({ ...prev, coverFiles: files }))
                      }
                      maxFiles={1}
                      single
                    />
                  </div>
                </div>

                {/* Gallery */}
                <div className="cn-card">
                  <div className="cn-card-header">
                    <div className="cn-card-icon">
                      <Layers size={13} className="cn-card-icon-inner" />
                    </div>
                    <div>
                      <div className="cn-card-title">Asset Gallery</div>
                      <div className="cn-card-sub">
                        {form.galleryFiles.length} / 10 uploaded
                      </div>
                    </div>
                  </div>
                  <div className="cn-card-body">
                    <FileUploadZone
                      files={form.galleryFiles}
                      onFiles={(files) =>
                        setForm((prev) => ({ ...prev, galleryFiles: files }))
                      }
                      maxFiles={10}
                    />
                  </div>
                </div>

                {/* Submission Summary */}
                <div className="cn-summary">
                  <div className="cn-summary-header">Submission Summary</div>
                  <div className="cn-summary-body">
                    {summaryRows.map((row) => (
                      <div key={row.key} className="cn-summary-row">
                        <span className="cn-summary-key">{row.key}</span>
                        <span
                          className={`cn-summary-val ${!row.val ? "empty" : ""}`}
                        >
                          {row.val || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                {status && (
                  <div className={`cn-status ${status.type}`}>
                    {status.type === "success" ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <AlertCircle size={15} />
                    )}
                    {status.msg}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading} className="cn-submit">
                  {loading ? (
                    <Loader2
                      size={15}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Send size={14} />
                  )}
                  {loading ? "Publishing…" : "Publish to Database"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

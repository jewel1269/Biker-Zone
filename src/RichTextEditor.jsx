import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Heading1,
  Heading2,
  Quote,
  Minus,
  Eye,
  Edit3,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";

const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

function isSelectionInsideEditor(editor) {
  if (!editor) return false;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  return editor.contains(selection.anchorNode);
}

function sanitizeUrl(rawUrl) {
  const url = (rawUrl || "").trim();
  if (!url) return "";
  if (url.startsWith("#")) return url;

  const withScheme =
    /^([a-z][a-z0-9+.-]*:)?\/\//i.test(url) || /^mailto:|^tel:/i.test(url)
      ? url
      : `https://${url}`;

  try {
    const parsed = new URL(withScheme);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function sanitizeHtml(html) {
  if (!html) return "";
  if (typeof window === "undefined" || !window.DOMParser) return html;

  const allowedTags = new Set([
    "P",
    "BR",
    "B",
    "STRONG",
    "I",
    "EM",
    "U",
    "H1",
    "H2",
    "BLOCKQUOTE",
    "UL",
    "OL",
    "LI",
    "A",
    "HR",
    "DIV",
    "SPAN",
  ]);

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const walk = (node) => {
    if (!node || !node.childNodes) return;
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toUpperCase();

        if (!allowedTags.has(tag)) {
          while (child.firstChild) {
            node.insertBefore(child.firstChild, child);
          }
          node.removeChild(child);
          return;
        }

        [...child.attributes].forEach((attr) => {
          const name = attr.name.toLowerCase();
          if (tag === "A") {
            if (name !== "href" && name !== "target" && name !== "rel") {
              child.removeAttribute(attr.name);
            }
          } else {
            child.removeAttribute(attr.name);
          }
        });

        if (tag === "A") {
          const safeHref = sanitizeUrl(child.getAttribute("href"));
          if (!safeHref) {
            child.replaceWith(...child.childNodes);
            return;
          }
          child.setAttribute("href", safeHref);
          child.setAttribute("target", "_blank");
          child.setAttribute("rel", "noopener noreferrer");
        }
      }
      walk(child);
    });
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

function htmlToText(html) {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, " ");
  }
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function getWordCount(html) {
  const text = htmlToText(html).trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function isMeaningfullyEmpty(html) {
  if (!html) return true;
  const text = htmlToText(html).replace(/\u00a0/g, " ").trim();
  if (text) return false;

  const compact = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, "")
    .replace(/\s+/g, "")
    .replace(/<(p|div)><\/\1>/gi, "");
  return compact.length === 0;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write full article body content here...",
}) {
  const editorRef = useRef(null);
  const rangeRef = useRef(null);

  const [preview, setPreview] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [activeState, setActiveState] = useState({
    bold: false,
    italic: false,
    underline: false,
    unordered: false,
    ordered: false,
    h1: false,
    h2: false,
    quote: false,
    link: false,
  });

  const safeHtml = useMemo(() => sanitizeHtml(value || ""), [value]);
  const words = useMemo(() => getWordCount(safeHtml), [safeHtml]);
  const empty = useMemo(() => isMeaningfullyEmpty(safeHtml), [safeHtml]);

  const syncContent = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const cleaned = sanitizeHtml(editor.innerHTML);
    if (editor.innerHTML !== cleaned) editor.innerHTML = cleaned;
    onChange?.(cleaned);
  }, [onChange]);

  const refreshActiveState = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !isSelectionInsideEditor(editor)) return;

    let format = "";
    try {
      format = (document.queryCommandValue("formatBlock") || "").toLowerCase();
    } catch {
      format = "";
    }

    const get = (cmd) => {
      try {
        return Boolean(document.queryCommandState(cmd));
      } catch {
        return false;
      }
    };

    setActiveState({
      bold: get("bold"),
      italic: get("italic"),
      underline: get("underline"),
      unordered: get("insertUnorderedList"),
      ordered: get("insertOrderedList"),
      h1: format.includes("h1"),
      h2: format.includes("h2"),
      quote: format.includes("blockquote"),
      link: get("createLink"),
    });
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const initial = sanitizeHtml(value || "");
    if (editor.innerHTML !== initial) editor.innerHTML = initial;

    const handleSelection = () => refreshActiveState();
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, [refreshActiveState, value]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const incoming = sanitizeHtml(value || "");
    if (editor.innerHTML !== incoming && document.activeElement !== editor) {
      editor.innerHTML = incoming;
    }
  }, [value]);

  const focusEditor = () => editorRef.current?.focus();

  const run = useCallback(
    (command, commandValue = null) => {
      focusEditor();
      try {
        document.execCommand("styleWithCSS", false, false);
      } catch {
        // No-op for browsers that do not support this command.
      }
      document.execCommand(command, false, commandValue);
      syncContent();
      refreshActiveState();
    },
    [refreshActiveState, syncContent],
  );

  const saveRange = () => {
    const editor = editorRef.current;
    if (!editor || !isSelectionInsideEditor(editor)) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    rangeRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreRange = () => {
    const range = rangeRef.current;
    if (!range) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  };

  const openLinkInput = () => {
    saveRange();
    setLinkDraft("");
    setShowLinkInput(true);
  };

  const applyLink = () => {
    const safeUrl = sanitizeUrl(linkDraft);
    if (!safeUrl) {
      setShowLinkInput(false);
      setLinkDraft("");
      return;
    }

    focusEditor();
    restoreRange();
    run("createLink", safeUrl);
    setShowLinkInput(false);
    setLinkDraft("");
  };

  const removeLink = () => run("unlink");

  const onPaste = (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    const toInsert = html ? sanitizeHtml(html) : (text || "").replace(/\n/g, "<br>");
    focusEditor();
    document.execCommand("insertHTML", false, toInsert);
    syncContent();
  };

  const tools = [
    { key: "bold", icon: Bold, title: "Bold", action: () => run("bold") },
    {
      key: "italic",
      icon: Italic,
      title: "Italic",
      action: () => run("italic"),
    },
    {
      key: "underline",
      icon: Underline,
      title: "Underline",
      action: () => run("underline"),
    },
    null,
    {
      key: "h1",
      icon: Heading1,
      title: "Heading 1",
      action: () => run("formatBlock", "<h1>"),
    },
    {
      key: "h2",
      icon: Heading2,
      title: "Heading 2",
      action: () => run("formatBlock", "<h2>"),
    },
    {
      key: "quote",
      icon: Quote,
      title: "Quote",
      action: () => run("formatBlock", "<blockquote>"),
    },
    null,
    {
      key: "unordered",
      icon: List,
      title: "Bulleted list",
      action: () => run("insertUnorderedList"),
    },
    {
      key: "ordered",
      icon: ListOrdered,
      title: "Numbered list",
      action: () => run("insertOrderedList"),
    },
    { key: "hr", icon: Minus, title: "Divider", action: () => run("insertHorizontalRule") },
    null,
    { key: "link", icon: LinkIcon, title: "Insert link", action: openLinkInput },
    { key: "unlink", icon: Unlink, title: "Remove link", action: removeLink },
    null,
    { key: "undo", icon: Undo2, title: "Undo", action: () => run("undo") },
    { key: "redo", icon: Redo2, title: "Redo", action: () => run("redo") },
    {
      key: "clear",
      icon: Eraser,
      title: "Clear formatting",
      action: () => run("removeFormat"),
    },
  ];

  return (
    <div className="cn-editor-wrap">
      <div className="cn-toolbar">
        {tools.map((tool, idx) =>
          tool ? (
            <button
              key={tool.key}
              type="button"
              title={tool.title}
              className={`cn-tool-btn ${activeState[tool.key] ? "is-active" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                tool.action();
              }}
            >
              <tool.icon size={13} />
            </button>
          ) : (
            <div key={`sep-${idx}`} className="cn-tool-sep" />
          ),
        )}

        {showLinkInput && (
          <div className="cn-link-input-wrap">
            <input
              type="text"
              className="cn-link-input"
              placeholder="https://example.com"
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setShowLinkInput(false);
                  setLinkDraft("");
                }
              }}
              autoFocus
            />
            <button type="button" className="cn-link-apply" onClick={applyLink}>
              Apply
            </button>
          </div>
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
              safeHtml ||
              '<p style="color:var(--ink-faint);font-style:italic">Nothing to preview yet.</p>',
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="cn-editable"
          data-placeholder={placeholder}
          data-empty={empty ? "true" : "false"}
          onInput={syncContent}
          onKeyUp={refreshActiveState}
          onMouseUp={refreshActiveState}
          onPaste={onPaste}
        />
      )}

      <div className="cn-word-count">{words} words</div>

      <style>{`
        .cn-tool-btn.is-active {
          background: var(--ink, #0f1117);
          color: #fff;
        }
        .cn-editable[data-empty="true"]::before {
          content: attr(data-placeholder);
          color: var(--ink-faint, #9ca3af);
          pointer-events: none;
        }
        .cn-link-input-wrap {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          margin-left: 0.5rem;
          padding-left: 0.5rem;
          border-left: 1px solid var(--rule, #e5e7eb);
        }
        .cn-link-input {
          height: 26px;
          width: 180px;
          border: 1px solid var(--rule, #e5e7eb);
          border-radius: 4px;
          padding: 0 0.5rem;
          font-size: 0.75rem;
          outline: none;
          background: #fff;
        }
        .cn-link-input:focus {
          border-color: var(--ink, #0f1117);
          box-shadow: 0 0 0 2px rgba(15, 17, 23, 0.08);
        }
        .cn-link-apply {
          height: 26px;
          border: none;
          border-radius: 4px;
          padding: 0 0.6rem;
          font-size: 0.6875rem;
          font-weight: 600;
          cursor: pointer;
          background: var(--ink, #0f1117);
          color: #fff;
        }
        .cn-link-apply:hover {
          opacity: 0.92;
        }
      `}</style>
    </div>
  );
}

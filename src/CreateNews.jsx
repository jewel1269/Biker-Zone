import { useState, useRef, useCallback, useEffect } from "react";
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
  Building2,
} from "lucide-react";

function ToolbarIcon({ Icon, size = 14 }) {
  return <Icon size={size} strokeWidth={2} />;
}

/* ─── Rich text: sync prop → DOM without breaking caret ─────────── */
function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const [preview, setPreview] = useState(false);
  const focusedRef = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || focusedRef.current || preview) return;
    const next = value ?? "";
    if (el.innerHTML !== next) {
      el.innerHTML = next;
    }
  }, [value, preview]);

  const syncContent = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    requestAnimationFrame(() => syncContent());
  };

  const insertLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) exec("createLink", url);
  };

  const tools = [
    { icon: Bold, cmd: "bold", title: "Bold" },
    { icon: Italic, cmd: "italic", title: "Italic" },
    { icon: Underline, cmd: "underline", title: "Underline" },
    null,
    { icon: Heading1, cmd: "formatBlock", val: "h1", title: "Heading 1" },
    { icon: Heading2, cmd: "formatBlock", val: "h2", title: "Heading 2" },
    null,
    { icon: List, cmd: "insertUnorderedList", title: "Bullet list" },
    { icon: ListOrdered, cmd: "insertOrderedList", title: "Numbered list" },
    { icon: Quote, cmd: "formatBlock", val: "blockquote", title: "Quote" },
    { icon: Minus, cmd: "insertHorizontalRule", title: "Divider" },
    null,
    { icon: Link, action: insertLink, title: "Insert link" },
  ];

  const toolbarItems = tools.map((tool, i) =>
    tool === null ? (
      <div key={i} className="mx-1 h-5 w-px bg-corporate-200" />
    ) : (
      <button
        key={i}
        type="button"
        title={tool.title}
        onMouseDown={(e) => {
          e.preventDefault();
          tool.action ? tool.action() : exec(tool.cmd, tool.val);
        }}
        className="rounded p-1.5 text-corporate-500 transition-colors hover:bg-white hover:text-corporate-900 hover:shadow-sm"
      >
        <ToolbarIcon Icon={tool.icon} />
      </button>
    ),
  );

  return (
    <div className="overflow-hidden rounded-lg border border-corporate-200 bg-white shadow-corporate">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-corporate-200 bg-corporate-50/90 px-3 py-2">
        {toolbarItems}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              !preview
                ? "bg-corporate-800 text-white shadow-sm"
                : "text-corporate-600 hover:bg-white"
            }`}
          >
            <Edit3 size={11} /> Edit
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              preview
                ? "bg-corporate-800 text-white shadow-sm"
                : "text-corporate-600 hover:bg-white"
            }`}
          >
            <Eye size={11} /> Preview
          </button>
        </div>
      </div>

      {preview ? (
        <div
          className="rich-preview min-h-64 border-t border-transparent p-4 text-sm"
          dangerouslySetInnerHTML={{
            __html:
              value ||
              "<p class=\"text-corporate-400\">Nothing to preview yet.</p>",
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncContent}
          onFocus={() => {
            focusedRef.current = true;
          }}
          onBlur={() => {
            focusedRef.current = false;
            syncContent();
          }}
          className="min-h-64 p-4 text-sm leading-relaxed text-corporate-900 outline-none focus:ring-2 focus:ring-inset focus:ring-corporate-300/60"
          style={{ minHeight: "16rem" }}
          data-placeholder="Write article body content here..."
        />
      )}
    </div>
  );
}

function FileUploadZone({
  files,
  onFiles,
  maxFiles = 10,
  single = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = useCallback(
    (newFiles) => {
      const valid = Array.from(newFiles || []).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (single) {
        onFiles(valid.slice(0, 1));
      } else {
        onFiles([...files, ...valid].slice(0, maxFiles));
      }
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

  const removeFile = (idx) => {
    onFiles(files.filter((_, i) => i !== idx));
  };

  const previewUrl = (file) =>
    typeof file === "string" ? file : URL.createObjectURL(file);

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
          dragging
            ? "border-corporate-600 bg-corporate-100/50"
            : "border-corporate-200 hover:border-corporate-400 hover:bg-corporate-50/80"
        }`}
      >
        <Upload size={20} className="mx-auto mb-2 text-corporate-400" />
        <p className="text-xs font-semibold text-corporate-600">
          Drag and drop or <span className="text-corporate-800">browse</span>
        </p>
        <p className="mt-1 text-[10px] text-corporate-500">
          PNG, JPG, WEBP · {single ? "1 file" : `Up to ${maxFiles} files`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={!single}
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className={single ? "block" : "grid grid-cols-3 gap-2"}>
          {files.map((file, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-lg border border-corporate-200 bg-corporate-100 ${
                single ? "aspect-video" : "aspect-square"
              }`}
            >
              <img
                src={previewUrl(file)}
                className="h-full w-full object-cover"
                alt={`preview-${idx}`}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-corporate-900/90 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <X size={12} />
              </button>
              {!single && (
                <div className="absolute inset-x-0 bottom-0 truncate bg-corporate-900/50 px-1.5 py-0.5 text-[9px] font-semibold text-white">
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

function SectionHeader({ icon: Icon, title, sub }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-corporate-200 bg-corporate-50">
        <Icon size={16} className="text-corporate-700" strokeWidth={2} />
      </div>
      <div>
        <p className="text-sm font-semibold tracking-tight text-corporate-900">
          {title}
        </p>
        {sub && (
          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-corporate-500">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-corporate-200 bg-white p-6 shadow-corporate ${className}`}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-corporate-500">
      {children}
    </label>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-corporate-200 bg-white px-3.5 py-2.5 text-sm text-corporate-900 outline-none transition-all placeholder:text-corporate-400 focus:border-corporate-400 focus:ring-2 focus:ring-corporate-300/40 ${className}`}
      {...props}
    />
  );
}

export default function CreateNews({ onCreated }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    content: "",
    coverFiles: [],
    galleryFiles: [],
  });

  const AUTH_PWD = "hello";

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("author", form.author);
      data.append("description", form.description);
      data.append("content", form.content);
      data.append("password", AUTH_PWD);
      form.coverFiles.forEach((f) => data.append("coverImage", f));
      form.galleryFiles.forEach((f) => data.append("images", f));

      await axios.post("/api/news", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onCreated?.();
    } catch {
      alert("System error: check network logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col gap-6 border-b border-corporate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-corporate-500">
            <Building2 size={12} className="text-corporate-400" />
            <span>Corporate communications</span>
            <ChevronRight size={10} className="text-corporate-300" />
            <span className="text-corporate-800">New press release</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-corporate-950 sm:text-3xl">
            Create press release
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-corporate-600">
            Compose and publish official announcements. Content is stored in{" "}
            <span className="font-semibold text-corporate-900">
              News_Collection
            </span>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-lg border border-corporate-200 bg-white px-3 py-2 text-[10px] font-medium text-corporate-600 shadow-corporate">
          <span
            className="h-2 w-2 rounded-full bg-emerald-500"
            aria-hidden
          />
          Database connected
        </div>
      </header>

      <form onSubmit={handleCreate}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <Card>
              <SectionHeader icon={Type} title="Headline" sub="Article title" />
              <FieldLabel>Title *</FieldLabel>
              <Input
                placeholder="Enter official headline…"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="text-base font-semibold"
              />
            </Card>

            <Card>
              <SectionHeader
                icon={User}
                title="Author"
                sub="Attribution"
              />
              <FieldLabel>Author name *</FieldLabel>
              <Input
                placeholder="e.g. Corporate Communications"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                required
              />
            </Card>

            <Card>
              <SectionHeader
                icon={AlignLeft}
                title="Summary"
                sub="SEO and listings"
              />
              <FieldLabel>Short description</FieldLabel>
              <Input
                placeholder="One or two sentences for search and previews…"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Card>

            <Card>
              <SectionHeader
                icon={FileText}
                title="Article body"
                sub="Full content"
              />
              <FieldLabel>Content *</FieldLabel>
              <RichTextEditor
                value={form.content}
                onChange={(val) => setForm({ ...form, content: val })}
              />
            </Card>
          </div>

          <div className="space-y-5 lg:col-span-5">
            <Card>
              <SectionHeader
                icon={ImageIcon}
                title="Cover image"
                sub="Primary visual"
              />
              <FileUploadZone
                files={form.coverFiles}
                onFiles={(files) => setForm({ ...form, coverFiles: files })}
                maxFiles={1}
                single
              />
            </Card>

            <Card>
              <SectionHeader
                icon={Layers}
                title="Media gallery"
                sub={`${form.galleryFiles.length} / 10 uploaded`}
              />
              <FileUploadZone
                files={form.galleryFiles}
                onFiles={(files) => setForm({ ...form, galleryFiles: files })}
                maxFiles={10}
              />
            </Card>

            <Card className="border-corporate-300/60 bg-corporate-50/50">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-corporate-500">
                Submission summary
              </p>
              <div className="space-y-2">
                {[
                  { label: "Title", val: form.title || "—" },
                  { label: "Author", val: form.author || "—" },
                  { label: "Description", val: form.description || "—" },
                  {
                    label: "Cover",
                    val: `${form.coverFiles.length} file(s)`,
                  },
                  {
                    label: "Gallery",
                    val: `${form.galleryFiles.length} file(s)`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-3"
                  >
                    <span className="flex-shrink-0 text-[11px] font-medium text-corporate-500">
                      {row.label}
                    </span>
                    <span className="max-w-[200px] truncate text-right text-[11px] font-semibold text-corporate-900">
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-corporate-900 py-3.5 text-sm font-semibold text-white shadow-corporate transition-all hover:bg-corporate-950 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={15} />
              )}
              {loading ? "Publishing…" : "Publish to database"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

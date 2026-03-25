import { useMemo, useState } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  User,
  Send,
  Save,
  Info,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  Tag,
  AlignLeft,
  BookOpen,
  Newspaper,
} from "lucide-react";

const MAX_GALLERY_IMAGES = 10;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const isValidImage = (file) => file?.type?.startsWith("image/");

const isWithinSize = (file) => file?.size <= MAX_IMAGE_SIZE_BYTES;

export default function CorporateNewsPublisher() {
  const [coverImage, setCoverImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    summary: "",
    content: "",
    category: "Internal Announcement",
    status: "Draft",
  });

  const canPublish = useMemo(
    () => formData.title.trim() && formData.summary.trim() && formData.content.trim(),
    [formData.title, formData.summary, formData.content]
  );

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setCoverFromFile = (file) => {
    if (!file) return;
    if (!isValidImage(file)) {
      showToast("error", "Cover must be a valid image file.");
      return;
    }
    if (!isWithinSize(file)) {
      showToast("error", "Cover image exceeds 10MB.");
      return;
    }
    setCoverImage({ file, preview: URL.createObjectURL(file) });
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    setCoverFromFile(file);
  };

  const handleCoverDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    setCoverFromFile(file);
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (!isValidImage(file)) {
        showToast("error", `${file.name} is not an image file.`);
        return false;
      }
      if (!isWithinSize(file)) {
        showToast("error", `${file.name} exceeds 10MB.`);
        return false;
      }
      return true;
    });

    if (gallery.length + validFiles.length > MAX_GALLERY_IMAGES) {
      showToast("error", "Maximum 10 gallery images allowed.");
      return;
    }

    const newItems = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      title: "",
      caption: "",
    }));

    setGallery((prev) => [...prev, ...newItems]);
  };

  const updateGalleryItem = (index, field, value) => {
    setGallery((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeGalleryItem = (index) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== index));
  };

  const buildMultipartPayload = () => {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (coverImage?.file) {
      data.append("cover_image", coverImage.file, coverImage.file.name);
    }

    gallery.forEach((item, index) => {
      data.append("gallery_images", item.file, item.file.name);
      data.append(`gallery_metadata[${index}][title]`, item.title || "");
      data.append(`gallery_metadata[${index}][caption]`, item.caption || "");
    });

    return data;
  };

  const logFormData = (label, data) => {
    console.group(label);
    for (const [key, value] of data.entries()) {
      console.log(key, "->", value);
    }
    console.groupEnd();
  };

  const handleSaveDraft = () => {
    const data = buildMultipartPayload();
    logFormData("Draft FormData", data);
    showToast("success", "Draft prepared. See console payload.");
  };

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      showToast("error", "Headline is required.");
      return;
    }
    if (!formData.summary.trim()) {
      showToast("error", "Executive summary is required.");
      return;
    }
    if (!formData.content.trim()) {
      showToast("error", "Manuscript content is required.");
      return;
    }

    setIsSubmitting(true);
    const data = buildMultipartPayload();
    logFormData("Publish FormData", data);

    try {
      const response = await fetch(`${API_BASE_URL}/api/news`, {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}`);
      }

      showToast("success", "Article published successfully.");
      console.log("Publish response:", result);
    } catch (error) {
      console.error("Publish error:", error);
      showToast("error", error.message || "Publish failed. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldCls =
    "w-full bg-slate-50 border border-transparent focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased pb-24">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-8 h-[68px] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900 leading-none">CMS Portal</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Communications
                </span>
                <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
                <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                  New Release
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:border-slate-400 hover:text-slate-900 bg-white rounded-lg transition-all"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={isSubmitting || !canPublish}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-all shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Publish
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto px-8 mt-8">
        <div className="grid grid-cols-12 gap-7">
          <div className="col-span-12 lg:col-span-8 space-y-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 pt-7 pb-6 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold rounded uppercase tracking-widest mb-4">
                  <BookOpen className="w-2.5 h-2.5" /> Editor
                </span>
                <textarea
                  name="title"
                  rows={2}
                  placeholder="Article Headline..."
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full text-3xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent resize-none leading-snug tracking-tight"
                />
              </div>

              <div className="px-8 py-7 space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <User className="w-3 h-3" /> Author
                    </label>
                    <input
                      name="author"
                      type="text"
                      placeholder="e.g. Communications Dept."
                      value={formData.author}
                      onChange={handleInputChange}
                      className={fieldCls}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Tag className="w-3 h-3" /> Classification
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`${fieldCls} cursor-pointer`}
                    >
                      <option>Internal Announcement</option>
                      <option>Press Release</option>
                      <option>Quarterly Report</option>
                      <option>Corporate Update</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Globe className="w-3 h-3" /> Publication Status
                  </label>
                  <div className="flex gap-2.5">
                    {["Draft", "Review", "Published"].map((statusValue) => (
                      <label
                        key={statusValue}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer text-xs font-semibold transition-all select-none ${
                          formData.status === statusValue
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={statusValue}
                          checked={formData.status === statusValue}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        {statusValue}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <AlignLeft className="w-3 h-3" /> Executive Summary
                  </label>
                  <textarea
                    name="summary"
                    rows={2}
                    placeholder="Brief overview for news feeds and previews..."
                    value={formData.summary}
                    onChange={handleInputChange}
                    className={`${fieldCls} resize-none leading-relaxed`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <FileText className="w-3 h-3" /> Full Manuscript
                    </label>
                    <span className="text-[10px] text-slate-400">{formData.content.length} chars</span>
                  </div>
                  <textarea
                    name="content"
                    rows={14}
                    placeholder="Begin composing professional content..."
                    value={formData.content}
                    onChange={handleInputChange}
                    className={`${fieldCls} resize-y leading-relaxed`}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" /> Media Gallery
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Attach high-resolution visuals. Max 10 images.
                  </p>
                </div>
                <label className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:border-slate-900 hover:text-slate-900 bg-white rounded-lg cursor-pointer transition-all shadow-sm">
                  <Upload className="w-3.5 h-3.5" /> Add Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />
                </label>
              </div>

              <div className="p-8">
                {gallery.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">No media added yet</p>
                    <p className="text-xs mt-1 opacity-60">Click Add Images to upload</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-5">
                    {gallery.map((item, index) => (
                      <div
                        key={`${item.file.name}-${index}`}
                        className="group border border-slate-100 rounded-xl overflow-hidden bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all"
                      >
                        <div className="relative aspect-video overflow-hidden bg-slate-200">
                          <img
                            src={item.preview}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <button
                            type="button"
                            onClick={() => removeGalleryItem(index)}
                            className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center shadow-lg hover:bg-red-50 hover:text-red-500 text-slate-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-2 left-2.5 text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded">
                            #{index + 1}
                          </span>
                        </div>
                        <div className="p-4 space-y-2.5">
                          <input
                            placeholder="Image label..."
                            value={item.title}
                            onChange={(event) =>
                              updateGalleryItem(index, "title", event.target.value)
                            }
                            className="w-full bg-transparent border-b border-slate-200 pb-1 text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-amber-400 transition-colors"
                          />
                          <input
                            placeholder="Caption or description..."
                            value={item.caption}
                            onChange={(event) =>
                              updateGalleryItem(index, "caption", event.target.value)
                            }
                            className="w-full bg-transparent text-xs text-slate-500 placeholder:text-slate-300 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                <h3 className="text-sm font-bold text-slate-900">Cover Image</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Featured visual for article preview.
                </p>
              </div>
              <div className="p-6">
                <label
                  className={`group relative flex flex-col items-center justify-center aspect-[4/3] border-2 border-dashed rounded-xl cursor-pointer overflow-hidden transition-all ${
                    dragOver
                      ? "border-amber-400 bg-amber-50"
                      : "border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/30"
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleCoverDrop}
                >
                  {coverImage ? (
                    <>
                      <img src={coverImage.preview} alt="Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-lg">
                          Change Image
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          setCoverImage(null);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center shadow hover:bg-red-50 hover:text-red-500 text-slate-500 transition-colors z-10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5 p-6 text-center">
                      <div className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-600">Drop image here</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          or <span className="text-amber-600 font-semibold">browse files</span>
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400">PNG, JPG, WEBP - Max 10MB</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                <h3 className="text-sm font-bold text-slate-900">Submission Summary</h3>
              </div>
              <div className="px-6 py-5 space-y-3">
                {[
                  { label: "Status", value: formData.status },
                  { label: "Category", value: formData.category },
                  { label: "Author", value: formData.author || "-" },
                  { label: "Gallery", value: `${gallery.length} / 10 images` },
                  { label: "Cover", value: coverImage ? "Attached" : "None" },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {label}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting || !canPublish}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Publish Article
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
              <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-400">
                    Guidelines
                  </span>
                </div>
                <h4 className="font-bold text-sm mb-4">Editorial Standards</h4>
                <ul className="space-y-3">
                  {[
                    "Clear headlines under 12 words",
                    "Always cite sources accurately",
                    "High-resolution media only",
                    "Review before publishing",
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
                      <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

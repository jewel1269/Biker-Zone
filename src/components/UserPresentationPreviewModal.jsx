import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-responsive-modal";
import {
  FaSpinner,
  FaChevronRight,
  FaChevronLeft,
  FaCheckCircle,
} from "react-icons/fa";
import {
  FiImage,
  FiHelpCircle,
  FiMinus,
  FiPlus,
  FiLayout,
  FiTarget,
  FiZap,
  FiSettings,
  FiCpu,
} from "react-icons/fi";
import toast from "react-hot-toast";
import "react-responsive-modal/styles.css";

const DEFAULT_PRESENTATION_SCOPE_TEMPLATE = `Context: [Identify the problem or technical background]

Learning Objectives: [List 3 key takeaways]

Key Data Points: [Insert critical metrics or proof points]

Success Criteria: [Define what the audience should be able to do after the session]`;

const isValidScopeContent = (value) => {
  const text = String(value || "").trim();
  if (!text) return false;

  if (/^[a-f\d]{24}$/i.test(text)) return false;
  if (!text.includes(" ") && text.length < 20) return false;

  return true;
};

const presentationThemePreviews = {
  "Executive Corporate": {
    accent: "from-indigo-500/45 via-blue-500/40 to-slate-800/70",
    headingClass: "text-[12px] font-black uppercase tracking-[0.2em]",
    fontFamily: 'Cambria, Georgia, "Times New Roman", serif',
    toneColor: "#a5b4fc",
    heading: "Executive Impact",
    subheading: "Data-driven strategic alignment",
    body: "Clear hierarchy with high-contrast business visuals.",
  },
  "Minimalist Tech": {
    accent: "from-cyan-400/45 via-blue-500/35 to-slate-900/80",
    headingClass: "text-[12px] font-semibold tracking-wide",
    fontFamily: '"Segoe UI", "Trebuchet MS", Arial, sans-serif',
    toneColor: "#67e8f9",
    heading: "Minimalist Tech",
    subheading: "Structured typography and whitespace",
    body: "Modern sans-serif treatment with clean geometry.",
  },
  "Dynamic Startup": {
    accent: "from-rose-500/45 via-red-500/40 to-slate-900/85",
    headingClass: "text-[12px] font-extrabold tracking-wide",
    fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, Arial, sans-serif',
    toneColor: "#f87171",
    heading: "Startup Momentum",
    subheading: "Bold gradients and kinetic layout",
    body: "High-energy type scale with expressive color accents.",
  },
  "Non-Profit/Cause Based": {
    accent: "from-emerald-400/45 via-teal-500/40 to-slate-800/80",
    headingClass: "text-[12px] font-bold tracking-wider",
    fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
    toneColor: "#6ee7b7",
    heading: "Cause Narrative",
    subheading: "Empathy-first storytelling",
    body: "Human-centric visuals and clear supporting facts.",
  },
  "Bina Theme": {
    accent: "from-slate-900/90 via-cyan-500/25 to-indigo-600/35",
    headingClass: "text-[12px] font-black uppercase tracking-[0.18em]",
    fontFamily: '"Inter", "Segoe UI", "Trebuchet MS", Arial, sans-serif',
    toneColor: "#22d3ee",
    heading: "Bina Design System",
    subheading: "Intelligence-driven dark minimalism",
    body: "High-impact typography, dark-mode contrast, and focused information hierarchy.",
  },
};

const imageStylePreviews = {
  "Photorealistic Business": {
    accent: "from-slate-200/30 via-slate-400/20 to-slate-700/70",
    title: "Photorealistic Business",
    caption: "Natural light, office scenes, realistic texture.",
  },
  "Minimalist Vector": {
    accent: "from-cyan-300/40 via-blue-500/30 to-slate-900/80",
    title: "Minimalist Vector",
    caption: "Flat forms, limited palette, simplified silhouettes.",
  },
  "3D Abstract Render": {
    accent: "from-violet-400/50 via-fuchsia-500/40 to-slate-900/80",
    title: "3D Abstract Render",
    caption: "Depth, reflections, volumetric gradients.",
  },
  "Cinematic Photography": {
    accent: "from-amber-300/40 via-orange-500/35 to-slate-900/85",
    title: "Cinematic Photography",
    caption: "Dramatic lighting and rich tonal contrast.",
  },
};

const StylePreviewCard = ({
  title,
  selection,
  subtitle,
  description,
  accent,
  headingClass,
  fontFamily,
  toneColor,
}) => {
  const toneStyle = toneColor ? { color: toneColor } : undefined;
  const cardStyle = fontFamily ? { fontFamily } : undefined;
  return (
    <div className="group relative">
      <div
        className="rounded-xl border border-slate-700 bg-[#070A10] p-3 transition-all duration-200 group-hover:shadow-[0_8px_26px_rgba(0,0,0,0.35)]"
        style={cardStyle}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          {title}
        </p>
        <p className="mt-1 text-xs font-semibold" style={toneStyle}>
          {selection}
        </p>
        <div
          className={`mt-2 overflow-hidden rounded-lg border border-slate-700 bg-gradient-to-br transition-all duration-200 group-hover:scale-[1.02] ${accent}`}
        >
          <div className="grid grid-cols-3 gap-2 bg-black/35 p-3">
            <div className="col-span-2 space-y-1">
              <p className={`${headingClass} text-white`}>{subtitle}</p>
              <p className="text-[10px] text-slate-200">{description}</p>
              <div className="flex gap-1 pt-1">
                <span className="h-1.5 w-8 rounded-full bg-white/70" />
                <span className="h-1.5 w-5 rounded-full bg-white/45" />
                <span className="h-1.5 w-4 rounded-full bg-white/30" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="h-5 rounded bg-white/20" />
              <div className="h-10 rounded bg-white/35" />
              <div className="h-3 rounded bg-white/20" />
            </div>
          </div>
        </div>
        <div className="max-h-0 overflow-hidden pt-0 opacity-0 transition-all duration-200 group-hover:max-h-80 group-hover:pt-3 group-hover:opacity-100">
          <div className="rounded-2xl border border-slate-600 bg-[#04070D] p-4">
            <div
              className={`overflow-hidden rounded-xl border border-slate-600 bg-gradient-to-br ${accent}`}
            >
              <div className="grid grid-cols-3 gap-3 bg-black/35 p-5">
                <div className="col-span-2 space-y-2">
                  <p className={`${headingClass} text-base text-white`}>
                    {subtitle}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-100">
                    {description}
                  </p>
                  <div className="space-y-1 pt-1">
                    <div className="h-2 w-40 rounded-full bg-white/80" />
                    <div className="h-2 w-32 rounded-full bg-white/60" />
                    <div className="h-2 w-24 rounded-full bg-white/40" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-10 rounded-lg bg-white/20" />
                  <div className="h-20 rounded-lg bg-white/35" />
                  <div className="h-6 rounded-lg bg-white/20" />
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Enlarged preview: typography + image composition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserPresentationPreviewModal = ({
  isOpen,
  setIsOpen,
  initialConfig,
  onGenerate,
  onGenerateScope,
  loading = false,
  scopeLoading = false,
}) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    topics: DEFAULT_PRESENTATION_SCOPE_TEMPLATE,
    slideCount: 10,
    imageCount: 1,
    quizCount: 5,
    presentationStyle: "Executive Corporate",
    imageStyle: "Photorealistic Business",
    aspectRatio: "16:9",
    includeMCQs: true,
    includeTrainingEnvironments: false,
    includeSpeakerNotes: true,
    includeStudentNotes: true,
  });

  useEffect(() => {
    if (isOpen && initialConfig) {
      const initialTopics = String(initialConfig.topics || "").trim();
      setConfig((prev) => ({
        ...prev,
        ...initialConfig,
        topics: isValidScopeContent(initialTopics)
          ? initialTopics
          : DEFAULT_PRESENTATION_SCOPE_TEMPLATE,
      }));
      setStep(1);
    }
  }, [isOpen, initialConfig]);

  const projectedVisuals = useMemo(() => {
    const slideCount = Number(config.slideCount) || 0;
    const imageCount = Number(config.imageCount) || 0;
    return Math.max(0, slideCount) * Math.max(0, imageCount);
  }, [config.slideCount, config.imageCount]);

  const nextStep = () => setStep((s) => Math.min(3, s + 1));
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const handleGenerateScopeClick = async () => {
    if (!onGenerateScope || scopeLoading) return;
    const aiScope = await onGenerateScope();
    const nextScope = String(aiScope || "").trim();
    if (nextScope) {
      setConfig((prev) => ({
        ...prev,
        topics: nextScope,
      }));
    }
  };

  const handleFinalSubmit = () => {
    if (!String(config.topics || "").trim())
      return toast.error("Please define the presentation scope.");
    onGenerate?.(config);
    setIsOpen(false);
  };

  const modalStyles = {
    modal:
      "rounded-none shadow-2xl max-w-none w-screen h-screen m-0 border-0 bg-[#0B0E14] p-0 overflow-hidden",
    modalContainer: "p-0",
    overlay: "bg-black/70",
    closeIcon: "hidden",
  };

  return (
    <Modal
      open={Boolean(isOpen)}
      onClose={() => !loading && setIsOpen(false)}
      center
      classNames={modalStyles}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-slate-800 p-6">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step === num
                      ? "bg-primary text-secondary ring-4 ring-primary/20"
                      : step > num
                        ? "bg-primary-gradient text-white"
                        : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {step > num ? <FaCheckCircle /> : num}
                </div>
                <span
                  className={`text-xs font-bold uppercase tracking-widest ${
                    step === num ? "text-primary" : "text-slate-500"
                  }`}
                >
                  {num === 1 ? "Context" : num === 2 ? "Visuals" : "Logic"}
                </span>
                {num < 3 && <div className="ml-2 h-[2px] w-12 bg-slate-800" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <FiTarget className="text-primary" /> Define Purpose
                </h3>
                <p className="text-sm text-slate-400">
                  Provide the foundational content for your SME presentation.
                </p>
              </div>

              <div className="space-y-6">
                <div className="group relative">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="block text-[10px] font-black uppercase text-slate-500">
                      Presentation Scope
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateScopeClick}
                      disabled={scopeLoading || !onGenerateScope}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-black/40 px-3 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {scopeLoading ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate with AI"
                      )}
                    </button>
                  </div>
                  {scopeLoading && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-slate-400">
                      <FaSpinner className="animate-spin" />
                      Generating AI scope draft...
                    </div>
                  )}
                  <textarea
                    value={config.topics}
                    onChange={(e) =>
                      setConfig({ ...config, topics: e.target.value })
                    }
                    disabled={scopeLoading}
                    placeholder={
                      scopeLoading
                        ? "AI is generating presentation scope..."
                        : "Describe the presentation scope"
                    }
                    className="h-44 w-full rounded-2xl border border-slate-600 bg-transparent p-4 text-sm outline-none transition-all focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-600 bg-transparent p-4">
                  <div>
                    <p className="text-sm font-bold">Target Slide Volume</p>
                    <p className="text-xs text-slate-500">
                      Unrestricted slide generation capability
                    </p>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl bg-black/40 p-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          slideCount: Math.max(1, Number(config.slideCount) - 1),
                        })
                      }
                      className="hover:text-primary"
                    >
                      <FiMinus />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={config.slideCount}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          slideCount: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="w-12 bg-transparent text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          slideCount: Number(config.slideCount) + 1,
                        })
                      }
                      className="hover:text-primary"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <FiLayout className="text-primary" /> Aesthetic Architecture
                </h3>
                <p className="text-sm text-slate-400">
                  Custom image styling and layout configurations as requested by
                  SME.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-200">
                    Presentation Theme
                  </label>
                  <select
                    value={config.presentationStyle}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        presentationStyle: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-transparent p-3 text-sm text-black outline-none focus:border-primary dark:text-white"
                  >
                    {Object.keys(presentationThemePreviews).map((theme) => (
                      <option
                        key={theme}
                        value={theme}
                        className="bg-slate-800 text-black dark:text-white"
                      >
                        {theme}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500">
                    AI Image Specification
                  </label>
                  <select
                    value={config.imageStyle}
                    onChange={(e) =>
                      setConfig({ ...config, imageStyle: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-600 bg-transparent p-3 text-sm text-black outline-none focus:border-primary dark:text-white"
                  >
                    {Object.keys(imageStylePreviews).map((style) => (
                      <option
                        key={style}
                        value={style}
                        className="bg-slate-800 text-black dark:text-white"
                      >
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 flex items-center justify-between rounded-2xl border border-slate-600 bg-transparent p-4">
                  <div className="flex items-center gap-3">
                    <FiImage className="text-primary" />
                    <span className="text-sm font-bold">
                      Visual Density (Images per Slide)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl bg-black/40 p-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          imageCount: Math.max(0, Number(config.imageCount) - 1),
                        })
                      }
                    >
                      <FiMinus />
                    </button>
                    <span className="w-8 text-center font-bold">
                      {config.imageCount}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          imageCount: Number(config.imageCount) + 1,
                        })
                      }
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="col-span-2 space-y-3 rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Style Preview Gallery
                    </p>
                    <p className="text-xs text-slate-500">
                      Hover thumbnail to enlarge
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <StylePreviewCard
                      title="Selected Presentation Theme"
                      selection={config.presentationStyle}
                      subtitle={
                        presentationThemePreviews[config.presentationStyle]
                          ?.heading || config.presentationStyle
                      }
                      description={
                        presentationThemePreviews[config.presentationStyle]
                          ?.body || "Structured visual style preview."
                      }
                      accent={
                        presentationThemePreviews[config.presentationStyle]
                          ?.accent || "from-slate-500/40 to-slate-900/80"
                      }
                      headingClass={
                        presentationThemePreviews[config.presentationStyle]
                          ?.headingClass || "text-[12px] font-bold"
                      }
                      fontFamily={
                        presentationThemePreviews[config.presentationStyle]
                          ?.fontFamily
                      }
                      toneColor={
                        presentationThemePreviews[config.presentationStyle]
                          ?.toneColor
                      }
                    />
                    <StylePreviewCard
                      title="Selected AI Image Style"
                      selection={config.imageStyle}
                      subtitle={
                        imageStylePreviews[config.imageStyle]?.title ||
                        config.imageStyle
                      }
                      description={
                        imageStylePreviews[config.imageStyle]?.caption ||
                        "Generated image composition preview."
                      }
                      accent={
                        imageStylePreviews[config.imageStyle]?.accent ||
                        "from-slate-500/40 to-slate-900/80"
                      }
                      headingClass="text-[12px] font-bold tracking-wide"
                      fontFamily={
                        presentationThemePreviews[config.presentationStyle]
                          ?.fontFamily
                      }
                      toneColor={
                        presentationThemePreviews[config.presentationStyle]
                          ?.toneColor
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <FiZap className="text-primary" /> Intelligence &amp; Logic
                </h3>
                <p className="text-sm text-slate-400">
                  Finalize assessment criteria and interactive elements.
                </p>
              </div>

              <div className="space-y-6">
                <div
                  onClick={() =>
                    setConfig({ ...config, includeMCQs: !config.includeMCQs })
                  }
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-3 transition-all ${
                    config.includeMCQs
                      ? "border-primary bg-primary/5"
                      : "border-slate-600 bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <FiHelpCircle
                      className={`text-2xl ${
                        config.includeMCQs ? "text-primary" : "text-slate-500"
                      }`}
                    />
                    <div>
                      <p className="font-bold">Comprehensive Quiz Module</p>
                      <p className="text-xs italic text-slate-500">
                        Unlimited assessment questions for the SME cause.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-md border-2 ${
                      config.includeMCQs
                        ? "border-primary bg-primary text-secondary"
                        : "border-slate-700"
                    }`}
                  >
                    {config.includeMCQs && <FaCheckCircle size={14} />}
                  </div>
                </div>

                {config.includeMCQs && (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-600 bg-transparent p-3">
                    <span className="text-sm font-bold">
                      Total Assessment Questions
                    </span>
                    <div className="flex items-center gap-4 rounded-xl bg-black/40 p-2">
                      <button
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            quizCount: Math.max(1, Number(config.quizCount) - 1),
                          })
                        }
                      >
                        <FiMinus />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={config.quizCount}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            quizCount: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-12 bg-transparent text-center font-bold"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            quizCount: Number(config.quizCount) + 1,
                          })
                        }
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                )}

                <div
                  onClick={() =>
                    setConfig({
                      ...config,
                      includeTrainingEnvironments:
                        !config.includeTrainingEnvironments,
                    })
                  }
                  className={`mt-2 flex cursor-pointer items-center justify-between rounded-2xl border border-gray-600 p-3 transition-all ${
                    config.includeTrainingEnvironments
                      ? "bg-transparent ring-1 ring-primary"
                      : "bg-transparent"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <FiCpu
                      className={`text-2xl ${
                        config.includeTrainingEnvironments
                          ? "text-gray-600"
                          : "text-gray-600/60"
                      }`}
                    />
                    <div>
                      <p className="font-bold text-white">
                        Include Training Environments
                      </p>
                      <p className="text-[11px] font-medium text-primary/60">
                        Add interactive labs or visual thought experiments for
                        hands-on learning.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`relative h-6 w-12 rounded-full transition-colors ${
                      config.includeTrainingEnvironments
                        ? "bg-primary-dark"
                        : "border border-primary/20 bg-transparent"
                    }`}
                  >
                    <div
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                        config.includeTrainingEnvironments ? "left-7" : "left-1"
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-3 rounded-2xl border border-slate-700 bg-slate-900/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Notes Integration
                  </p>

                  <div
                    onClick={() =>
                      setConfig({
                        ...config,
                        includeSpeakerNotes: !config.includeSpeakerNotes,
                      })
                    }
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      config.includeSpeakerNotes
                        ? "border-primary bg-primary/5"
                        : "border-slate-600 bg-transparent"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">Speaker Notes</p>
                      <p className="text-xs text-slate-400">
                        Presenter cues and talking points in full presentation
                        mode.
                      </p>
                    </div>
                    <div
                      className={`relative h-6 w-12 rounded-full transition-colors ${
                        config.includeSpeakerNotes
                          ? "bg-primary-dark"
                          : "border border-primary/20 bg-transparent"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                          config.includeSpeakerNotes ? "left-7" : "left-1"
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      setConfig({
                        ...config,
                        includeStudentNotes: !config.includeStudentNotes,
                      })
                    }
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
                      config.includeStudentNotes
                        ? "border-primary bg-primary/5"
                        : "border-slate-600 bg-transparent"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">Student Notes</p>
                      <p className="text-xs text-slate-400">
                        Show learner guidance beside the lesson during delivery.
                      </p>
                    </div>
                    <div
                      className={`relative h-6 w-12 rounded-full transition-colors ${
                        config.includeStudentNotes
                          ? "bg-primary-dark"
                          : "border border-primary/20 bg-transparent"
                      }`}
                    >
                      <div
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                          config.includeStudentNotes ? "left-7" : "left-1"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/50 p-6">
          <button
            type="button"
            onClick={() => (step === 1 ? setIsOpen(false) : prevStep())}
            className="flex items-center gap-2 font-bold text-slate-400 transition hover:text-white"
          >
            {step === 1 ? (
              "Cancel"
            ) : (
              <>
                <FaChevronLeft /> Back
              </>
            )}
          </button>

          <div className="flex items-center gap-4">
            <div className="mr-4 hidden text-right md:block">
              <p className="text-[10px] font-bold uppercase text-slate-500">
                Projected Assets
              </p>
              <p className="text-xs font-bold text-primary">
                {config.slideCount} Slides • {projectedVisuals} AI Visuals
              </p>
            </div>

            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 rounded-xl bg-primary-dark px-8 py-2 font-bold text-secondary transition-all hover:bg-primary-dark"
              >
                Next <FaChevronRight />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-primary-dark px-8 py-2 font-bold text-secondary shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <>
                    <FiSettings /> Create Presentation
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserPresentationPreviewModal;


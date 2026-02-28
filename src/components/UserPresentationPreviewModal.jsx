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
  FiMaximize2,
  FiMinimize2,
  FiX,
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
    accent: "from-indigo-500/30 via-blue-500/20 to-slate-900/70",
    fontFamily: 'Cambria, Georgia, "Times New Roman", serif',
    toneColor: "#a5b4fc",
    variants: [
      {
        id: "exec-title",
        label: "Executive Title",
        title: "Quarterly Business Review",
        subtitle: "Strategic priorities and alignment",
        bullets: [
          "Revenue drivers and margin levers",
          "Risk posture and mitigation plan",
          "Next-quarter execution roadmap",
        ],
      },
      {
        id: "exec-metrics",
        label: "Metrics Focus",
        title: "Performance Snapshot",
        subtitle: "Key outcomes and indicators",
        bullets: ["ARR +12%", "Churn 2.1%", "NPS 51", "Pipeline $4.2M"],
      },
      {
        id: "exec-split",
        label: "Visual Split",
        title: "Customer Impact",
        subtitle: "What changed and why it matters",
        bullets: ["Before/after comparison", "Proof points", "Action items"],
      },
    ],
  },
  "Minimalist Tech": {
    accent: "from-cyan-400/25 via-blue-500/15 to-slate-950/80",
    fontFamily: '"Segoe UI", "Trebuchet MS", Arial, sans-serif',
    toneColor: "#67e8f9",
    variants: [
      {
        id: "tech-brief",
        label: "Tech Brief",
        title: "System Overview",
        subtitle: "Architecture in one slide",
        bullets: ["Inputs → Processing → Outputs", "Key constraints", "Interfaces"],
      },
      {
        id: "tech-diagram",
        label: "Diagram + Notes",
        title: "Request Flow",
        subtitle: "How data moves through services",
        bullets: ["Client", "API Gateway", "Services", "DB/Cache"],
      },
      {
        id: "tech-checklist",
        label: "Implementation Plan",
        title: "Build Checklist",
        subtitle: "Milestones and acceptance",
        bullets: ["MVP scope", "Instrumentation", "Rollout plan"],
      },
    ],
  },
  "Dynamic Startup": {
    accent: "from-rose-500/30 via-red-500/20 to-slate-950/85",
    fontFamily: '"Trebuchet MS", "Segoe UI", Tahoma, Arial, sans-serif',
    toneColor: "#f87171",
    variants: [
      {
        id: "startup-story",
        label: "Story Mode",
        title: "Why Now",
        subtitle: "Problem, wedge, momentum",
        bullets: ["Pain is acute", "We win with speed", "Distribution advantage"],
      },
      {
        id: "startup-pitch",
        label: "Pitch Deck",
        title: "Product & Traction",
        subtitle: "Signals that matter",
        bullets: ["Activation 38%", "MoM 18%", "Top ICPs", "Next hires"],
      },
      {
        id: "startup-demo",
        label: "Demo Flow",
        title: "Live Walkthrough",
        subtitle: "A crisp narrative for demos",
        bullets: ["Setup", "Core value", "Edge cases", "What’s next"],
      },
    ],
  },
  "Non-Profit/Cause Based": {
    accent: "from-emerald-400/25 via-teal-500/18 to-slate-950/78",
    fontFamily: '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif',
    toneColor: "#6ee7b7",
    variants: [
      {
        id: "cause-narrative",
        label: "Narrative",
        title: "The Human Story",
        subtitle: "Context and lived experience",
        bullets: ["Who is impacted", "What they face", "What we can change"],
      },
      {
        id: "cause-impact",
        label: "Impact",
        title: "Impact Metrics",
        subtitle: "Outcomes and accountability",
        bullets: ["People reached", "Programs delivered", "Cost per outcome"],
      },
      {
        id: "cause-call",
        label: "Call to Action",
        title: "How to Help",
        subtitle: "Partners, volunteers, donors",
        bullets: ["Contribute", "Share", "Join the program"],
      },
    ],
  },
  "Bina Theme": {
    accent: "from-slate-900/90 via-cyan-500/25 to-indigo-600/35",
    fontFamily: '"Inter", "Segoe UI", "Trebuchet MS", Arial, sans-serif',
    toneColor: "#22d3ee",
    variants: [
      {
        id: "bina-focus",
        label: "Focused",
        title: "Signal Over Noise",
        subtitle: "Minimal, high-contrast hierarchy",
        bullets: ["One big idea", "Supporting evidence", "Next action"],
      },
      {
        id: "bina-grid",
        label: "Grid",
        title: "System Components",
        subtitle: "A structured view",
        bullets: ["UI", "Data", "Logic", "Ops"],
      },
      {
        id: "bina-labs",
        label: "Labs",
        title: "Hands-on Module",
        subtitle: "Training environments ready",
        bullets: ["Scenario", "Steps", "Checks", "Reflection"],
      },
    ],
  },
};

const imageStylePreviews = {
  "Photorealistic Business": {
    accent: "from-slate-200/20 via-slate-400/10 to-slate-900/70",
    title: "Photorealistic Business",
    caption: "Natural light, office scenes, realistic texture.",
  },
  "Minimalist Vector": {
    accent: "from-cyan-300/25 via-blue-500/15 to-slate-950/80",
    title: "Minimalist Vector",
    caption: "Flat forms, limited palette, simplified silhouettes.",
  },
  "3D Abstract Render": {
    accent: "from-violet-400/25 via-fuchsia-500/18 to-slate-950/80",
    title: "3D Abstract Render",
    caption: "Depth, reflections, volumetric gradients.",
  },
  "Cinematic Photography": {
    accent: "from-amber-300/20 via-orange-500/15 to-slate-950/85",
    title: "Cinematic Photography",
    caption: "Dramatic lighting and rich tonal contrast.",
  },
};

const getDefaultThemeVariantId = (themeKey) => {
  const variants = presentationThemePreviews[themeKey]?.variants || [];
  return variants[0]?.id || "";
};

const GammaPreviewCard = ({
  isSelected,
  onSelect,
  themeAccent,
  fontFamily,
  toneColor,
  variant,
  themeLabel,
}) => {
  const cardStyle = fontFamily ? { fontFamily } : undefined;
  const toneStyle = toneColor ? { color: toneColor } : undefined;

  const VariantLayout = () => {
    switch (variant.id) {
      case "exec-title":
      case "startup-story":
      case "cause-narrative":
        return (
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="line-clamp-2 text-base font-semibold text-white">
                {variant.title}
              </p>
              <p className="mt-1 line-clamp-1 text-[11px] text-slate-200">
                {variant.subtitle}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-3">
              <div className="col-span-3 space-y-2">
                <div className="h-2 w-4/5 rounded-full bg-white/25" />
                <div className="h-2 w-full rounded-full bg-white/18" />
                <div className="h-2 w-3/5 rounded-full bg-white/12" />
              </div>
              <div className="col-span-2">
                <div className="h-20 rounded-xl border border-white/15 bg-white/10" />
                <div className="mt-2 h-6 rounded-lg border border-white/10 bg-white/5" />
              </div>
            </div>
          </div>
        );
      case "exec-metrics":
      case "startup-pitch":
      case "cause-impact":
        return (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {variant.title}
                </p>
                <p className="mt-1 truncate text-[11px] text-slate-200">
                  {variant.subtitle}
                </p>
              </div>
              <div className="h-7 w-10 rounded-lg border border-white/15 bg-white/10" />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {["KPI 1", "KPI 2", "KPI 3", "KPI 4"].map((k) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/15 bg-white/10 p-2"
                >
                  <div className="h-2 w-10 rounded-full bg-white/20" />
                  <div className="mt-2 h-3 w-12 rounded-full bg-white/30" />
                </div>
              ))}
            </div>
            <div className="mt-3 h-10 rounded-xl border border-white/15 bg-white/10" />
          </div>
        );
      case "exec-split":
      case "tech-diagram":
      case "startup-demo":
      case "bina-grid":
        return (
          <div className="grid h-full grid-cols-5 gap-3">
            <div className="col-span-3">
              <p className="truncate text-sm font-semibold text-white">
                {variant.title}
              </p>
              <p className="mt-1 truncate text-[11px] text-slate-200">
                {variant.subtitle}
              </p>
              <div className="mt-4 space-y-2">
                {variant.bullets.slice(0, 3).map((line) => (
                  <div key={line} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    <span className="h-2 w-full rounded-full bg-white/20" />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <span className="h-1.5 w-10 rounded-full bg-white/40" />
                <span className="h-1.5 w-8 rounded-full bg-white/28" />
                <span className="h-1.5 w-6 rounded-full bg-white/18" />
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <div className="h-10 rounded-xl border border-white/15 bg-white/10" />
              <div className="h-24 rounded-xl border border-white/15 bg-white/10" />
              <div className="h-8 rounded-xl border border-white/10 bg-white/5" />
            </div>
          </div>
        );
      case "tech-brief":
      case "tech-checklist":
      case "cause-call":
      case "bina-focus":
      case "bina-labs":
      default:
        return (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {variant.title}
                </p>
                <p className="mt-1 truncate text-[11px] text-slate-200">
                  {variant.subtitle}
                </p>
              </div>
              <div className="h-7 w-10 rounded-lg border border-white/15 bg-white/10" />
            </div>
            <div className="mt-4 space-y-2">
              {variant.bullets.slice(0, 3).map((line) => (
                <div key={line} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-md border border-white/20 bg-white/10" />
                  <span className="h-2 w-full rounded-full bg-white/20" />
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="h-10 rounded-xl border border-white/15 bg-white/10" />
              <div className="h-10 rounded-xl border border-white/15 bg-white/10" />
              <div className="h-10 rounded-xl border border-white/15 bg-white/10" />
            </div>
          </div>
        );
    }
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full rounded-2xl border bg-[#070A10] p-3 text-left transition-all ${
        isSelected
          ? "border-primary ring-2 ring-primary/30"
          : "border-slate-800 hover:border-slate-700"
      }`}
      style={cardStyle}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {themeLabel}
          </p>
          <p className="mt-1 text-xs font-semibold" style={toneStyle}>
            {variant.label}
          </p>
        </div>
        {isSelected ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-secondary">
            <FaCheckCircle size={14} />
          </span>
        ) : (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-black/30 text-slate-400 opacity-0 transition group-hover:opacity-100">
            <FaChevronRight size={12} />
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="relative">
          <div className="absolute left-2 top-2 h-full w-full rounded-xl border border-slate-800 bg-[#0B0E14] opacity-35" />
          <div className="absolute left-1 top-1 h-full w-full rounded-xl border border-slate-800 bg-[#0B0E14] opacity-55" />

          <div
            className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br ${themeAccent}`}
          >
            <div className="aspect-video bg-black/25 p-4">
              <VariantLayout />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-0 top-full z-50 mt-3 w-[520px] max-w-[80vw] translate-y-1 opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100">
        <div className="rounded-2xl border border-slate-700 bg-[#04070D] p-4 shadow-2xl shadow-black/60">
          <div
            className={`overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-br ${themeAccent}`}
          >
            <div className="aspect-video bg-black/20 p-6">
              <p className="text-lg font-semibold text-white">{variant.title}</p>
              <p className="mt-2 text-sm text-slate-100">{variant.subtitle}</p>
              <div className="mt-5 grid grid-cols-5 gap-4">
                <div className="col-span-3 space-y-3">
                  {variant.bullets.slice(0, 4).map((line) => (
                    <div key={line} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-white/60" />
                      <span className="h-3 w-full rounded-full bg-white/25" />
                    </div>
                  ))}
                </div>
                <div className="col-span-2">
                  <div className="h-full rounded-2xl border border-white/15 bg-white/10" />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Hover preview: Gamma-style slide thumbnail.
          </p>
        </div>
      </div>
    </button>
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedOutlineSlideId, setSelectedOutlineSlideId] = useState(null);
  const [config, setConfig] = useState({
    topics: DEFAULT_PRESENTATION_SCOPE_TEMPLATE,
    slideCount: 10,
    imageCount: 1,
    quizCount: 5,
    presentationStyle: "Executive Corporate",
    presentationVariant: getDefaultThemeVariantId("Executive Corporate"),
    imageStyle: "Photorealistic Business",
    aspectRatio: "16:9",
    includeMCQs: true,
    mcqCadence: "auto_4_5",
    linkQuizStatsSidebar: true,
    enforceTellShowDo: true,
    enforceFiveByFive: true,
    enforceBenefitHeadlines: true,
    showSlideVisualPreference: "architecture_code_analogy",
    includeBridgeLabs: true,
    includeTrainingEnvironments: false,
    trainingEnvironmentMode: "labs_or_sandbox",
    trainingEnvironmentGuidance: "",
    includeSpeakerNotes: true,
    speakerNotesGuidance: "",
    includeStudentNotes: true,
    studentNotesGuidance: "",
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
        presentationVariant:
          initialConfig.presentationVariant ||
          getDefaultThemeVariantId(
            initialConfig.presentationStyle || prev.presentationStyle,
          ),
      }));
      setStep(1);
      setIsFullscreen(false);
      setSelectedOutlineSlideId(null);
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

  const deckOutline = useMemo(() => {
    const totalSlides = Math.max(1, Number(config.slideCount) || 1);
    const cadence = config.includeMCQs ? config.mcqCadence : "none";
    const mcqEvery =
      cadence === "every_3" ? 3 : cadence === "every_6" ? 6 : 5;

    const slides = [];

    const tellCount = Math.min(2, Math.max(1, Math.round(totalSlides * 0.2)));
    const showCount = Math.max(1, Math.round(totalSlides * 0.2));
    const reserved = tellCount + showCount + (config.includeTrainingEnvironments ? 1 : 0);
    const remaining = Math.max(0, totalSlides - reserved);
    const doCount = config.includeTrainingEnvironments ? 1 : 0;
    const extraTell = remaining > 0 ? Math.min(2, remaining) : 0;
    const extraShow = remaining - extraTell > 0 ? 1 : 0;

    const tellSlides = tellCount + extraTell;
    const showSlides = showCount + extraShow;

    let index = 1;
    const pushSlide = (s) => {
      slides.push(s);
      index += 1;
    };

    const makeId = (prefix, n) => `${prefix}-${n}`;
    const benefitHeadlineExamples = [
      "Secure the perimeter fast",
      "Reduce latency sustainably",
      "Ship with confidence",
      "Align teams on outcomes",
      "Make failures observable",
    ];

    const createContent = (type, n) => {
      const headlineBase =
        benefitHeadlineExamples[(n - 1) % benefitHeadlineExamples.length];
      const headline = config.enforceBenefitHeadlines
        ? headlineBase
        : `Topic slide ${n}`;

      const bullets =
        config.enforceFiveByFive
          ? ["Key idea", "Proof point", "Next step"]
          : ["Key idea and context", "Proof point with metrics", "Next step and action items"];

      const visual =
        type === "Show"
          ? config.showSlideVisualPreference === "terminal_first"
            ? "Terminal recording"
            : config.showSlideVisualPreference === "code_first"
              ? "Code walkthrough"
              : "Architecture diagram"
          : "Minimal diagram";

      return { headline, bullets, visual };
    };

    for (let i = 0; i < tellSlides; i += 1) {
      pushSlide({
        id: makeId("tell", index),
        section: "Tell",
        type: "Concept",
        order: index,
        content: createContent("Tell", index),
      });
      if (config.includeMCQs && index % mcqEvery === 0) {
        pushSlide({
          id: makeId("mcq", index),
          section: "Reset",
          type: "MCQ",
          order: index,
          content: {
            headline: "Knowledge check",
            bullets: ["1 question", "Instant feedback", "Instructor stats"],
            visual: config.linkQuizStatsSidebar ? "Quiz stats sidebar" : "Inline results",
          },
        });
      }
    }

    for (let i = 0; i < showSlides; i += 1) {
      pushSlide({
        id: makeId("show", index),
        section: "Show",
        type: "Demonstration",
        order: index,
        content: createContent("Show", index),
      });
      if (config.includeBridgeLabs && config.includeTrainingEnvironments) {
        pushSlide({
          id: makeId("bridge", index),
          section: "Bridge",
          type: "Training task",
          order: index,
          content: {
            headline: "Apply it in a lab",
            bullets: ["Open sandbox", "Run commands", "Verify output"],
            visual: "Lab checklist",
          },
        });
      }
      if (config.includeMCQs && index % mcqEvery === 0) {
        pushSlide({
          id: makeId("mcq", index),
          section: "Reset",
          type: "MCQ",
          order: index,
          content: {
            headline: "Knowledge check",
            bullets: ["1 question", "Instant feedback", "Instructor stats"],
            visual: config.linkQuizStatsSidebar ? "Quiz stats sidebar" : "Inline results",
          },
        });
      }
    }

    if (doCount) {
      pushSlide({
        id: makeId("do", index),
        section: "Do",
        type: "Application",
        order: index,
        content: {
          headline: "Practice in the environment",
          bullets: ["Task brief", "Steps", "Success criteria"],
          visual: config.trainingEnvironmentMode === "thought_experiments"
            ? "Thought experiment"
            : "Lab / sandbox",
        },
      });
    }

    return slides.slice(0, totalSlides);
  }, [
    config.slideCount,
    config.includeMCQs,
    config.mcqCadence,
    config.linkQuizStatsSidebar,
    config.enforceBenefitHeadlines,
    config.enforceFiveByFive,
    config.showSlideVisualPreference,
    config.includeBridgeLabs,
    config.includeTrainingEnvironments,
    config.trainingEnvironmentMode,
  ]);

  const selectedOutlineSlide = useMemo(() => {
    const fallback = deckOutline[0] || null;
    if (!selectedOutlineSlideId) return fallback;
    return deckOutline.find((s) => s.id === selectedOutlineSlideId) || fallback;
  }, [deckOutline, selectedOutlineSlideId]);

  const modalStyles = useMemo(() => {
    if (isFullscreen) {
      return {
        modal:
          "rounded-none shadow-2xl max-w-none w-screen h-screen m-0 border-0 bg-[#0B0E14] p-0 overflow-hidden",
        modalContainer: "p-0",
        overlay: "bg-black/70",
        closeIcon: "hidden",
      };
    }
    return {
      modal:
        "rounded-2xl shadow-2xl max-w-6xl w-[96vw] h-[92vh] mx-4 border border-slate-800 bg-[#0B0E14] p-0 overflow-hidden",
      modalContainer: "py-3",
      overlay: "bg-black/70",
      closeIcon: "hidden",
    };
  }, [isFullscreen]);

  return (
    <Modal
      open={Boolean(isOpen)}
      onClose={() => setIsOpen(false)}
      center
      classNames={modalStyles}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-slate-800 p-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Presentation Builder
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-100">
                  Configure scope, visuals, and logic.
                </p>
              </div>
              <div className="flex items-center justify-between">
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
                    {num < 3 && (
                      <div className="ml-2 h-[2px] w-10 bg-slate-800" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-black/30 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-primary hover:text-white"
              >
                {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                {isFullscreen ? "Exit full screen" : "Full screen"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-black/30 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                <FiX />
                Close
              </button>
            </div>
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

                <div className="rounded-2xl border border-slate-800 bg-[#070A10] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Generation Blueprint
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-100">
                        Configure how the AI structures learning.
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Defaults follow “Tell, Show, Do” + the 5×5 rule.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          enforceTellShowDo: !prev.enforceTellShowDo,
                        }))
                      }
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                        config.enforceTellShowDo
                          ? "border-primary bg-primary/5"
                          : "border-slate-800 bg-black/10"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-100">
                          Tell, Show, Do
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Concept slides → demonstration → training task trigger.
                        </p>
                      </div>
                      <div
                        className={`relative h-6 w-12 rounded-full transition-colors ${
                          config.enforceTellShowDo
                            ? "bg-primary-dark"
                            : "border border-primary/20 bg-transparent"
                        }`}
                      >
                        <div
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                            config.enforceTellShowDo ? "left-7" : "left-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          enforceFiveByFive: !prev.enforceFiveByFive,
                        }))
                      }
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                        config.enforceFiveByFive
                          ? "border-primary bg-primary/5"
                          : "border-slate-800 bg-black/10"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-100">
                          5×5 Rule
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Max 3 bullets, max 5 words per bullet.
                        </p>
                      </div>
                      <div
                        className={`relative h-6 w-12 rounded-full transition-colors ${
                          config.enforceFiveByFive
                            ? "bg-primary-dark"
                            : "border border-primary/20 bg-transparent"
                        }`}
                      >
                        <div
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                            config.enforceFiveByFive ? "left-7" : "left-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          enforceBenefitHeadlines: !prev.enforceBenefitHeadlines,
                        }))
                      }
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                        config.enforceBenefitHeadlines
                          ? "border-primary bg-primary/5"
                          : "border-slate-800 bg-black/10"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-100">
                          Benefit-driven Headlines
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          “Securing the perimeter” not “Firewall rules”.
                        </p>
                      </div>
                      <div
                        className={`relative h-6 w-12 rounded-full transition-colors ${
                          config.enforceBenefitHeadlines
                            ? "bg-primary-dark"
                            : "border border-primary/20 bg-transparent"
                        }`}
                      >
                        <div
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                            config.enforceBenefitHeadlines ? "left-7" : "left-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-black/10 p-4">
                      <p className="text-sm font-bold text-slate-100">
                        Demonstration (“Show”) Preference
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        The AI will prefer these visual types on Tell slides.
                      </p>
                      <select
                        value={config.showSlideVisualPreference}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            showSlideVisualPreference: e.target.value,
                          }))
                        }
                        className="mt-3 w-full rounded-xl border border-slate-700 bg-transparent p-3 text-sm text-black outline-none focus:border-primary dark:text-white"
                      >
                        <option
                          value="architecture_code_analogy"
                          className="bg-slate-800 text-black dark:text-white"
                        >
                          Architecture + Code + Analogy
                        </option>
                        <option
                          value="architecture_first"
                          className="bg-slate-800 text-black dark:text-white"
                        >
                          Architecture first
                        </option>
                        <option
                          value="code_first"
                          className="bg-slate-800 text-black dark:text-white"
                        >
                          Code walkthrough first
                        </option>
                        <option
                          value="terminal_first"
                          className="bg-slate-800 text-black dark:text-white"
                        >
                          Terminal recording first
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-800 bg-black/10 p-4">
                      <p className="text-sm font-bold text-slate-100">
                        Knowledge Check Cadence
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        MCQ slide insertion timing.
                      </p>
                      <select
                        value={config.mcqCadence}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            mcqCadence: e.target.value,
                          }))
                        }
                        className="mt-3 w-full rounded-xl border border-slate-700 bg-transparent p-3 text-sm text-black outline-none focus:border-primary dark:text-white"
                        disabled={!config.includeMCQs}
                      >
                        <option
                          value="auto_4_5"
                          className="bg-slate-800 text-black dark:text-white"
                        >
                          Auto (every 4–5 slides)
                        </option>
                        <option
                          value="every_3"
                          className="bg-slate-800 text-black dark:text-white"
                        >
                          Every 3 slides
                        </option>
                        <option
                          value="every_6"
                          className="bg-slate-800 text-black dark:text-white"
                        >
                          Every 6 slides
                        </option>
                      </select>
                    </div>

                    <div
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          includeBridgeLabs: !prev.includeBridgeLabs,
                        }))
                      }
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                        config.includeBridgeLabs
                          ? "border-primary bg-primary/5"
                          : "border-slate-800 bg-black/10"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-100">
                          Bridge Slides
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Insert a training task after deep dives.
                        </p>
                      </div>
                      <div
                        className={`relative h-6 w-12 rounded-full transition-colors ${
                          config.includeBridgeLabs
                            ? "bg-primary-dark"
                            : "border border-primary/20 bg-transparent"
                        }`}
                      >
                        <div
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                            config.includeBridgeLabs ? "left-7" : "left-1"
                          }`}
                        />
                      </div>
                    </div>

                    <div
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          linkQuizStatsSidebar: !prev.linkQuizStatsSidebar,
                        }))
                      }
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                        config.linkQuizStatsSidebar
                          ? "border-primary bg-primary/5"
                          : "border-slate-800 bg-black/10"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-100">
                          Real-time Quiz Stats
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Link MCQs to instructor visibility.
                        </p>
                      </div>
                      <div
                        className={`relative h-6 w-12 rounded-full transition-colors ${
                          config.linkQuizStatsSidebar
                            ? "bg-primary-dark"
                            : "border border-primary/20 bg-transparent"
                        }`}
                      >
                        <div
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
                            config.linkQuizStatsSidebar ? "left-7" : "left-1"
                          }`}
                        />
                      </div>
                    </div>
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

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  <div className="lg:col-span-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Presentation Theme
                    </p>
                    <div className="mt-3 space-y-2">
                      {Object.keys(presentationThemePreviews).map((themeKey) => {
                        const isActive = config.presentationStyle === themeKey;
                        return (
                          <button
                            key={themeKey}
                            type="button"
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                presentationStyle: themeKey,
                                presentationVariant: getDefaultThemeVariantId(
                                  themeKey,
                                ),
                              }))
                            }
                            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                              isActive
                                ? "border-primary bg-primary/5 text-white"
                                : "border-slate-800 bg-transparent text-slate-300 hover:border-slate-700"
                            }`}
                          >
                            <span className="font-semibold">{themeKey}</span>
                            <span className="text-xs text-slate-500">
                              3 previews
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                          Select a Preview
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-200">
                          Choose the slide look (Gamma-style).
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        Hover to enlarge • Click to select
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      {(presentationThemePreviews[config.presentationStyle]
                        ?.variants || []
                      ).map((variant) => (
                        <GammaPreviewCard
                          key={variant.id}
                          variant={variant}
                          themeLabel={config.presentationStyle}
                          themeAccent={
                            presentationThemePreviews[config.presentationStyle]
                              ?.accent || "from-slate-500/20 to-slate-950/80"
                          }
                          fontFamily={
                            presentationThemePreviews[config.presentationStyle]
                              ?.fontFamily
                          }
                          toneColor={
                            presentationThemePreviews[config.presentationStyle]
                              ?.toneColor
                          }
                          isSelected={config.presentationVariant === variant.id}
                          onSelect={() =>
                            setConfig((prev) => ({
                              ...prev,
                              presentationVariant: variant.id,
                            }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="space-y-3 rounded-2xl border border-slate-800 bg-[#070A10] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      AI Image Specification
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(imageStylePreviews).map((styleKey) => {
                        const selected = config.imageStyle === styleKey;
                        const accent = imageStylePreviews[styleKey]?.accent;
                        return (
                          <button
                            key={styleKey}
                            type="button"
                            onClick={() =>
                              setConfig((prev) => ({
                                ...prev,
                                imageStyle: styleKey,
                              }))
                            }
                            className={`group rounded-2xl border p-3 text-left transition ${
                              selected
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div
                              className={`overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br ${accent}`}
                            >
                              <div className="aspect-video bg-black/25 p-3">
                                <div className="h-3 w-16 rounded-full bg-white/25" />
                                <div className="mt-2 h-2 w-24 rounded-full bg-white/20" />
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                  <div className="col-span-2 space-y-2">
                                    <div className="h-2 w-full rounded-full bg-white/20" />
                                    <div className="h-2 w-4/5 rounded-full bg-white/15" />
                                    <div className="h-2 w-3/5 rounded-full bg-white/10" />
                                  </div>
                                  <div className="rounded-lg border border-white/15 bg-white/10" />
                                </div>
                              </div>
                            </div>
                            <p className="mt-2 text-xs font-semibold text-slate-100">
                              {imageStylePreviews[styleKey]?.title || styleKey}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              {imageStylePreviews[styleKey]?.caption}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-[#070A10] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FiImage className="text-primary" />
                        <div>
                          <p className="text-sm font-bold text-slate-100">
                            Visual Density &amp; Deck Structure
                          </p>
                          <p className="text-xs text-slate-500">
                            Full outline of sections, slides, and hierarchy
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 rounded-xl bg-black/30 p-2">
                        <button
                          type="button"
                          onClick={() =>
                            setConfig({
                              ...config,
                              imageCount: Math.max(
                                0,
                                Number(config.imageCount) - 1,
                              ),
                            })
                          }
                        >
                          <FiMinus />
                        </button>
                        <span className="w-8 text-center font-bold text-slate-100">
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

                    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-5">
                      <div className="xl:col-span-3">
                        <div className="rounded-2xl border border-slate-800 bg-black/20 p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                              Deck Outline
                            </p>
                            <p className="text-xs font-semibold text-slate-300">
                              {deckOutline.length} slides
                            </p>
                          </div>

                          <div className="mt-3 max-h-[360px] space-y-1 overflow-y-auto pr-1">
                            {deckOutline.map((s) => {
                              const active = selectedOutlineSlide?.id === s.id;
                              const badge =
                                s.section === "Tell"
                                  ? "bg-cyan-500/10 text-cyan-200 border-cyan-500/20"
                                  : s.section === "Show"
                                    ? "bg-indigo-500/10 text-indigo-200 border-indigo-500/20"
                                    : s.section === "Do"
                                      ? "bg-emerald-500/10 text-emerald-200 border-emerald-500/20"
                                      : s.section === "Reset"
                                        ? "bg-amber-500/10 text-amber-200 border-amber-500/20"
                                        : "bg-slate-500/10 text-slate-200 border-slate-500/20";
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => setSelectedOutlineSlideId(s.id)}
                                  className={`flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-2 text-left transition ${
                                    active
                                      ? "border-primary bg-primary/5"
                                      : "border-slate-800 bg-transparent hover:border-slate-700"
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-100">
                                      {String(s.order).padStart(2, "0")}.{" "}
                                      {s.content.headline}
                                    </p>
                                    <p className="mt-1 truncate text-[11px] text-slate-400">
                                      {s.type} • {s.content.visual}
                                    </p>
                                  </div>
                                  <span
                                    className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${badge}`}
                                  >
                                    {s.section}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="xl:col-span-2">
                        <div className="rounded-2xl border border-slate-800 bg-black/20 p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                            Selected Slide
                          </p>
                          {selectedOutlineSlide ? (
                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm font-semibold text-slate-100">
                                  {selectedOutlineSlide.content.headline}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {selectedOutlineSlide.section} •{" "}
                                  {selectedOutlineSlide.type}
                                </p>
                              </div>

                              <div className="rounded-xl border border-slate-800 bg-black/10 p-3">
                                <p className="text-xs font-semibold text-slate-200">
                                  Content hierarchy
                                </p>
                                <ul className="mt-2 space-y-2 text-xs text-slate-300">
                                  {selectedOutlineSlide.content.bullets
                                    .slice(0, 3)
                                    .map((b) => (
                                      <li key={b} className="flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-300/70" />
                                        <span>{b}</span>
                                      </li>
                                    ))}
                                </ul>
                                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                                  <span>
                                    Images/slide:{" "}
                                    <span className="font-semibold text-slate-200">
                                      {config.imageCount}
                                    </span>
                                  </span>
                                  <span>
                                    Notes:{" "}
                                    <span className="font-semibold text-slate-200">
                                      {config.includeSpeakerNotes ? "Speaker" : ""}
                                      {config.includeSpeakerNotes &&
                                      config.includeStudentNotes
                                        ? " + "
                                        : ""}
                                      {config.includeStudentNotes ? "Student" : ""}
                                      {!config.includeSpeakerNotes &&
                                      !config.includeStudentNotes
                                        ? "None"
                                        : ""}
                                    </span>
                                  </span>
                                </div>
                              </div>

                              <div className="rounded-xl border border-slate-800 bg-black/10 p-3">
                                <p className="text-xs font-semibold text-slate-200">
                                  Visual guidance
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {config.showSlideVisualPreference
                                    .replaceAll("_", " ")
                                    .replaceAll("  ", " ")}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-slate-400">
                              Select a slide in the outline.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-800 bg-black/20 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Summary
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-200 sm:grid-cols-3">
                        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-black/10 px-3 py-2">
                          <span className="text-slate-400">Theme</span>
                          <span className="font-semibold">
                            {config.presentationStyle}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-black/10 px-3 py-2">
                          <span className="text-slate-400">Preview</span>
                          <span className="font-semibold">
                            {presentationThemePreviews[config.presentationStyle]
                              ?.variants?.find(
                                (v) => v.id === config.presentationVariant,
                              )?.label || "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-black/10 px-3 py-2">
                          <span className="text-slate-400">Image Spec</span>
                          <span className="font-semibold">{config.imageStyle}</span>
                        </div>
                      </div>
                    </div>
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

                {config.includeTrainingEnvironments && (
                  <div className="rounded-2xl border border-slate-800 bg-[#070A10] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Training Environment Details
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-200">
                          Mode
                        </label>
                        <select
                          value={config.trainingEnvironmentMode}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              trainingEnvironmentMode: e.target.value,
                            }))
                          }
                          className="mt-2 w-full rounded-xl border border-slate-700 bg-transparent p-3 text-sm text-black outline-none focus:border-primary dark:text-white"
                        >
                          <option
                            value="labs_or_sandbox"
                            className="bg-slate-800 text-black dark:text-white"
                          >
                            Labs / Sandbox
                          </option>
                          <option
                            value="thought_experiments"
                            className="bg-slate-800 text-black dark:text-white"
                          >
                            Visual thought experiments
                          </option>
                          <option
                            value="mixed"
                            className="bg-slate-800 text-black dark:text-white"
                          >
                            Mixed (auto)
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-200">
                          Guidance (optional)
                        </label>
                        <textarea
                          value={config.trainingEnvironmentGuidance}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              trainingEnvironmentGuidance: e.target.value,
                            }))
                          }
                          placeholder="Add lab goals, tools, constraints, or copy-paste commands."
                          className="mt-2 h-24 w-full rounded-xl border border-slate-700 bg-transparent p-3 text-sm outline-none transition-all focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

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

                  {config.includeSpeakerNotes && (
                    <div className="rounded-xl border border-slate-800 bg-black/10 p-3">
                      <label className="text-xs font-semibold text-slate-200">
                        Speaker Notes Guidance (optional)
                      </label>
                      <textarea
                        value={config.speakerNotesGuidance}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            speakerNotesGuidance: e.target.value,
                          }))
                        }
                        placeholder="Add internal talking points, delivery cues, and live demo gotchas."
                        className="mt-2 h-24 w-full rounded-xl border border-slate-700 bg-transparent p-3 text-sm outline-none transition-all focus:border-primary"
                      />
                    </div>
                  )}

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

                  {config.includeStudentNotes && (
                    <div className="rounded-xl border border-slate-800 bg-black/10 p-3">
                      <label className="text-xs font-semibold text-slate-200">
                        Student Notes Guidance (optional)
                      </label>
                      <textarea
                        value={config.studentNotesGuidance}
                        onChange={(e) =>
                          setConfig((prev) => ({
                            ...prev,
                            studentNotesGuidance: e.target.value,
                          }))
                        }
                        placeholder="Add doc links, repos, and copy-paste commands students should use."
                        className="mt-2 h-24 w-full rounded-xl border border-slate-700 bg-transparent p-3 text-sm outline-none transition-all focus:border-primary"
                      />
                    </div>
                  )}
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


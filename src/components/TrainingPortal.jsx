import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiBookOpen,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiGrid,
  FiHelpCircle,
  FiHome,
  FiLock,
  FiPlayCircle,
} from "react-icons/fi";

import ServiceNowSandbox from "./ServiceNowSandbox.jsx";

// ── Mock "tables" (u_lessons / u_labs) ────────────────────────────────────────
// These simulate ServiceNow custom tables:
// - u_lessons: stores rich text + video metadata
// - u_labs: stores lab steps + checklist + sandbox target
const u_courses = [
  {
    id: "sn-fundamentals",
    title: "ServiceNow Fundamentals",
    description:
      "Learn core navigation, lists & forms, and how records flow through the platform.",
  },
];

const u_lessons = [
  {
    sys_id: "lesson-001",
    u_course: "sn-fundamentals",
    u_order: 1,
    u_title: "Lesson 1 — Navigating Next Experience (Polaris)",
    u_rich_text_html: `
      <h2>Navigation basics</h2>
      <p>In this lesson you'll learn where to find:</p>
      <ul>
        <li>Application navigator equivalents in Workspace</li>
        <li>Lists, filters, and columns</li>
        <li>Record forms, related lists, and activity</li>
      </ul>
      <h3>Steps</h3>
      <ol>
        <li>Open the <strong>Course Catalog</strong> and select this lesson.</li>
        <li>Watch the video and follow the reading steps.</li>
        <li>Use <strong>Next</strong> to continue.</li>
      </ol>
    `,
    u_video: { type: "youtube", youtubeId: "M7lc1UVf-VE" }, // YouTube API demo video (safe placeholder)
  },
  {
    sys_id: "lesson-002",
    u_course: "sn-fundamentals",
    u_order: 2,
    u_title: "Lesson 2 — Lists, Filters, and Personalization",
    u_rich_text_html: `
      <h2>Lists</h2>
      <p>Lists are where most work starts. You can search, filter, sort, and personalize columns.</p>
      <h3>Try it</h3>
      <ol>
        <li>Open a list view.</li>
        <li>Apply an advanced filter.</li>
        <li>Hide/show columns from a config panel.</li>
      </ol>
    `,
    u_video: { type: "youtube", youtubeId: "ysz5S6PUM-U" }, // "Big Buck Bunny" embed (safe)
  },
  {
    sys_id: "lesson-003",
    u_course: "sn-fundamentals",
    u_order: 3,
    u_title: "Lesson 3 — Forms, States, and Work Notes",
    u_rich_text_html: `
      <h2>Forms</h2>
      <p>Forms are used to view and update records. Pay attention to:</p>
      <ul>
        <li>State transitions (New → In Progress → Resolved)</li>
        <li>Assigned to / Assignment group</li>
        <li>Notes, tasks, and related tabs</li>
      </ul>
      <p>When you're ready, move into the lab to practice.</p>
    `,
    u_video: { type: "mp4", mp4Url: "" }, // optional; will show placeholder if empty
  },
];

const u_labs = [
  {
    sys_id: "lab-101",
    u_course: "sn-fundamentals",
    u_order: 1,
    u_title: "Lab 1 — Work an Incident end-to-end",
    u_instructions: [
      "Open an incident from the list.",
      "Assign it to yourself.",
      "Add a task in the Tasks tab.",
      "Resolve the incident and save.",
      "Confirm the status is Resolved in the list.",
    ],
    u_checklist: [
      { id: "c1", text: "Assigned the incident to me" },
      { id: "c2", text: "Added at least one task" },
      { id: "c3", text: "Marked incident as Resolved" },
      { id: "c4", text: "Saved changes" },
    ],
    u_sandbox: { type: "internal", href: "#/sandbox" },
  },
  {
    sys_id: "lab-102",
    u_course: "sn-fundamentals",
    u_order: 2,
    u_title: "Lab 2 — Personalize a List",
    u_instructions: [
      "Open the incidents list.",
      "Use the Config panel to hide at least one column.",
      "Apply an advanced filter (Priority or Category).",
      "Export the list to CSV.",
    ],
    u_checklist: [
      { id: "c1", text: "Updated visible columns" },
      { id: "c2", text: "Applied at least one advanced filter" },
      { id: "c3", text: "Exported to CSV" },
    ],
    u_sandbox: { type: "internal", href: "#/sandbox" },
  },
];

// ── "Data Broker" selectors (UI Builder-like) ────────────────────────────────
function useDataBroker() {
  return useMemo(() => {
    return {
      getCourses: () => u_courses,
      getCourse: (id) => u_courses.find((c) => c.id === id) || null,
      getLessonsByCourse: (courseId) =>
        u_lessons
          .filter((l) => l.u_course === courseId)
          .sort((a, b) => a.u_order - b.u_order),
      getLesson: (sysId) => u_lessons.find((l) => l.sys_id === sysId) || null,
      getLabsByCourse: (courseId) =>
        u_labs
          .filter((l) => l.u_course === courseId)
          .sort((a, b) => a.u_order - b.u_order),
      getLab: (sysId) => u_labs.find((l) => l.sys_id === sysId) || null,
    };
  }, []);
}

// ── Hash router ──────────────────────────────────────────────────────────────
function parseHash() {
  const raw = (window.location.hash || "#/dashboard").replace(/^#/, "");
  const [path, query] = raw.split("?");
  const segs = path.split("/").filter(Boolean);
  return { segs, query: query || "" };
}

function setHash(path) {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
}

// ── Progress persistence ─────────────────────────────────────────────────────
const LS_KEY = "sn_training_progress_v1";

function loadProgress() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveProgress(p) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function StatusBadge({ status }) {
  const cfg =
    status === "Completed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "In Progress"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-slate-50 text-slate-600 border-slate-200";
  const Icon =
    status === "Completed"
      ? FiCheckCircle
      : status === "In Progress"
        ? FiPlayCircle
        : FiLock;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 shadow-lg">
      <FiCheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
      <span className="text-xs font-medium text-emerald-800">{message}</span>
    </div>
  );
}

function Breadcrumbs({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          {i > 0 && <span className="text-slate-300">/</span>}
          {it.onClick ? (
            <button
              onClick={it.onClick}
              className="hover:text-primary hover:underline"
            >
              {it.label}
            </button>
          ) : (
            <span className="text-slate-700 font-medium">{it.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Card({ title, subtitle, right, children, onClick, disabled }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={[
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
        disabled ? "opacity-60" : onClick ? "cursor-pointer hover:bg-slate-50" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-bold text-slate-900">{title}</h3>
            {right}
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

// ── Main portal ──────────────────────────────────────────────────────────────
export default function TrainingPortal() {
  const db = useDataBroker();

  const [route, setRoute] = useState(() => parseHash());
  const [toast, setToast] = useState(null);

  const [progress, setProgress] = useState(() => {
    return (
      loadProgress() || {
        lessonCompleted: {},
        labCompleted: {},
        labStarted: {},
        labChecklist: {},
      }
    );
  });

  useEffect(() => saveProgress(progress), [progress]);

  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const course = db.getCourse("sn-fundamentals");
  const lessons = db.getLessonsByCourse(course.id);
  const labs = db.getLabsByCourse(course.id);

  const sandboxAbsHref = useMemo(() => {
    // Works for dev + build (same-origin). Uses hash view for sandbox.
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#/sandbox`;
  }, []);

  const view = route.segs[0] || "dashboard";
  const viewId = route.segs[1] || "";

  const lessonById = useMemo(() => {
    const m = new Map(lessons.map((l) => [l.sys_id, l]));
    return m;
  }, [lessons]);

  const labById = useMemo(() => {
    const m = new Map(labs.map((l) => [l.sys_id, l]));
    return m;
  }, [labs]);

  function labStatus(labSysId) {
    const ordered = labs;
    const idx = ordered.findIndex((l) => l.sys_id === labSysId);
    const prev = idx > 0 ? ordered[idx - 1] : null;
    const locked = prev ? !progress.labCompleted[prev.sys_id] : false;
    if (locked) return "Locked";
    if (progress.labCompleted[labSysId]) return "Completed";
    if (progress.labStarted[labSysId]) return "In Progress";
    return "New";
  }

  function openLesson(sysId) {
    setHash(`/lesson/${sysId}`);
  }
  function openLab(sysId) {
    setHash(`/lab/${sysId}`);
  }

  function markLessonComplete(sysId) {
    setProgress((p) => ({
      ...p,
      lessonCompleted: { ...p.lessonCompleted, [sysId]: true },
    }));
    setToast("Lesson marked as completed");
  }

  function updateChecklist(labSysId, itemId, checked) {
    setProgress((p) => {
      const existing = p.labChecklist[labSysId] || {};
      return {
        ...p,
        labChecklist: {
          ...p.labChecklist,
          [labSysId]: { ...existing, [itemId]: checked },
        },
      };
    });
  }

  function markLabStarted(labSysId) {
    setProgress((p) => ({
      ...p,
      labStarted: { ...p.labStarted, [labSysId]: true },
    }));
  }

  function markLabComplete(labSysId) {
    setProgress((p) => ({
      ...p,
      labCompleted: { ...p.labCompleted, [labSysId]: true },
      labStarted: { ...p.labStarted, [labSysId]: true },
    }));
    setToast("Lab completed — great job");
  }

  const sidebarItems = [
    { id: "dashboard", label: "My Dashboard", icon: FiHome },
    { id: "catalog", label: "Course Catalog", icon: FiBookOpen },
    { id: "labs", label: "Active Labs", icon: FiGrid },
    { id: "help", label: "Help & Docs", icon: FiHelpCircle },
  ];

  // sandbox is its own full-screen view (used by iframe too)
  if (view === "sandbox") {
    return <ServiceNowSandbox />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <div className="h-8 w-8 rounded bg-primary text-white flex items-center justify-center text-[11px] font-extrabold">
            Bina
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold">
              <span className="text-slate-900">Service</span>
              <span className="text-primary">Now</span> Labs
            </div>
            <div className="text-[11px] text-slate-500">Bina Training Instance</div>
          </div>
        </div>

        <nav className="p-2">
          {sidebarItems.map((it) => {
            const active = view === it.id || (view === "lesson" && it.id === "catalog") || (view === "lab" && it.id === "labs");
            const Icon = it.icon;
            return (
              <button
                key={it.id}
                onClick={() => setHash(`/${it.id}`)}
                className={[
                  "flex w-full items-center gap-2 rounded px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {it.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500">
          Theme: Polaris (Next Experience) — demo styling
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs text-slate-500">Training Portal</div>
              <div className="truncate text-base font-bold">
                {view === "dashboard"
                  ? "My Dashboard"
                  : view === "catalog"
                    ? "Course Catalog"
                    : view === "labs"
                      ? "Active Labs"
                      : view === "lesson"
                        ? "Lesson"
                        : view === "lab"
                          ? "Lab"
                          : "Help & Docs"}
              </div>
            </div>
            <button
              onClick={() => setHash("/sandbox")}
              className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Open sandbox"
            >
              Open Sandbox <FiExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-5 no-scrollbar">
          {/* Dashboard */}
          {view === "dashboard" && (
            <div className="space-y-4">
              <Breadcrumbs items={[{ label: "Home" }]} />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Card
                  title={`${Object.keys(progress.lessonCompleted).length} Lessons Completed`}
                  subtitle="Keep going — consistency wins."
                />
                <Card
                  title={`${Object.keys(progress.labCompleted).length} Labs Completed`}
                  subtitle="Hands-on progress tracked locally."
                />
                <Card
                  title="Next Recommended"
                  subtitle={
                    lessons.find((l) => !progress.lessonCompleted[l.sys_id])
                      ?.u_title || "All lessons complete"
                  }
                  onClick={() => {
                    const next = lessons.find(
                      (l) => !progress.lessonCompleted[l.sys_id],
                    );
                    if (next) openLesson(next.sys_id);
                  }}
                  disabled={
                    !lessons.some((l) => !progress.lessonCompleted[l.sys_id])
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <Card
                  title="Course Progress"
                  subtitle={course.description}
                  right={
                    <span className="text-xs font-semibold text-slate-700">
                      {Object.keys(progress.lessonCompleted).length}/{lessons.length} lessons
                    </span>
                  }
                >
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${Math.round(
                          (Object.keys(progress.lessonCompleted).length /
                            Math.max(1, lessons.length)) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setHash("/catalog")}
                      className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                    >
                      Browse Lessons
                    </button>
                    <button
                      onClick={() => setHash("/labs")}
                      className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Go to Labs
                    </button>
                  </div>
                </Card>

                <Card
                  title="Help & Docs"
                  subtitle="Quick links to official ServiceNow documentation."
                  onClick={() => setHash("/help")}
                >
                  <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                    <li>Developer portal</li>
                    <li>Now Learning</li>
                    <li>Workspace / UI Builder docs</li>
                  </ul>
                </Card>
              </div>
            </div>
          )}

          {/* Course Catalog */}
          {view === "catalog" && (
            <div className="space-y-4">
              <Breadcrumbs items={[{ label: "Home", onClick: () => setHash("/dashboard") }, { label: "Course Catalog" }]} />

              <Card title={course.title} subtitle={course.description}>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  {lessons.map((l) => (
                    <Card
                      key={l.sys_id}
                      title={l.u_title}
                      subtitle={
                        progress.lessonCompleted[l.sys_id]
                          ? "Completed"
                          : "Not completed"
                      }
                      right={
                        progress.lessonCompleted[l.sys_id] ? (
                          <StatusBadge status="Completed" />
                        ) : (
                          <StatusBadge status="In Progress" />
                        )
                      }
                      onClick={() => openLesson(l.sys_id)}
                    />
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Lesson view */}
          {view === "lesson" && (
            <LessonView
              course={course}
              lessons={lessons}
              lesson={lessonById.get(viewId)}
              progress={progress}
              onBack={() => setHash("/catalog")}
              onMarkComplete={markLessonComplete}
              onOpenLesson={openLesson}
            />
          )}

          {/* Labs list */}
          {view === "labs" && (
            <div className="space-y-4">
              <Breadcrumbs items={[{ label: "Home", onClick: () => setHash("/dashboard") }, { label: "Active Labs" }]} />

              <div className="grid grid-cols-1 gap-3">
                {labs.map((lab) => {
                  const status = labStatus(lab.sys_id);
                  const locked = status === "Locked";
                  const right =
                    status === "Completed" ? (
                      <StatusBadge status="Completed" />
                    ) : status === "Locked" ? (
                      <StatusBadge status="Locked" />
                    ) : (
                      <StatusBadge status="In Progress" />
                    );
                  return (
                    <Card
                      key={lab.sys_id}
                      title={lab.u_title}
                      subtitle={
                        locked
                          ? "Locked — complete the previous lab to unlock"
                          : "Open to continue"
                      }
                      right={right}
                      disabled={locked}
                      onClick={() => {
                        if (!locked) openLab(lab.sys_id);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Lab view */}
          {view === "lab" && (
            <LabView
              course={course}
              lab={labById.get(viewId)}
              status={labById.get(viewId) ? labStatus(viewId) : "Locked"}
              sandboxAbsHref={sandboxAbsHref}
              checklistState={progress.labChecklist[viewId] || {}}
              onBack={() => setHash("/labs")}
              onStart={() => markLabStarted(viewId)}
              onUpdateChecklist={updateChecklist}
              onMarkComplete={() => markLabComplete(viewId)}
            />
          )}

          {/* Help */}
          {view === "help" && (
            <div className="space-y-4">
              <Breadcrumbs items={[{ label: "Home", onClick: () => setHash("/dashboard") }, { label: "Help & Docs" }]} />
              <Card title="Official Docs" subtitle="ServiceNow documentation links">
                <div className="space-y-2 text-sm">
                  <DocLink
                    label="Now Learning"
                    href="https://nowlearning.servicenow.com/"
                  />
                  <DocLink
                    label="ServiceNow Developer Portal"
                    href="https://developer.servicenow.com/"
                  />
                  <DocLink
                    label="UI Builder documentation"
                    href="https://www.servicenow.com/products/ui-builder.html"
                  />
                  <DocLink
                    label="Workspace (Next Experience) overview"
                    href="https://www.servicenow.com/"
                  />
                </div>
              </Card>

              <Card
                title="Sandbox"
                subtitle="Open the embedded ServiceNow-like sandbox used by labs."
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setHash("/sandbox")}
                    className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                  >
                    Open Sandbox
                  </button>
                  <a
                    href={sandboxAbsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Open in new tab <FiExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}

function DocLink({ label, href }) {
  return (
    <a
      className="inline-flex items-center gap-2 text-primary hover:underline"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {label} <FiExternalLink className="h-4 w-4" />
    </a>
  );
}

function LessonView({
  course,
  lessons,
  lesson,
  progress,
  onBack,
  onMarkComplete,
  onOpenLesson,
}) {
  if (!lesson) {
    return (
      <Card
        title="Lesson not found"
        subtitle="The lesson id in the URL doesn't match any record."
      />
    );
  }

  const idx = lessons.findIndex((l) => l.sys_id === lesson.sys_id);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;
  const done = !!progress.lessonCompleted[lesson.sys_id];

  const videoEl =
    lesson.u_video?.type === "youtube" && lesson.u_video.youtubeId ? (
      <iframe
        className="h-56 w-full rounded border border-slate-200 md:h-80"
        src={`https://www.youtube.com/embed/${lesson.u_video.youtubeId}`}
        title="Lesson video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    ) : lesson.u_video?.type === "mp4" && lesson.u_video.mp4Url ? (
      <video
        className="h-56 w-full rounded border border-slate-200 md:h-80"
        controls
        src={lesson.u_video.mp4Url}
      />
    ) : (
      <div className="flex h-56 w-full items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500 md:h-80">
        Video not configured (YouTube or MP4)
      </div>
    );

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", onClick: () => setHash("/dashboard") },
          { label: course.title, onClick: onBack },
          { label: lesson.u_title },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Card
            title={lesson.u_title}
            subtitle={done ? "Completed" : "In progress"}
            right={done ? <StatusBadge status="Completed" /> : <StatusBadge status="In Progress" />}
          >
            <div
              className="prose prose-slate max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: lesson.u_rich_text_html }}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => onMarkComplete(lesson.sys_id)}
                className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
              >
                Mark lesson complete
              </button>
              <button
                onClick={onBack}
                className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to catalog
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <Card title="Video" subtitle="Tutorial / walkthrough">
            {videoEl}
          </Card>

          <Card title="Lesson Navigation" subtitle="Move between lessons">
            <div className="flex gap-2">
              <button
                disabled={!prev}
                onClick={() => prev && onOpenLesson(prev.sys_id)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                disabled={!next}
                onClick={() => next && onOpenLesson(next.sys_id)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-primary px-3 py-2 text-xs font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next <FiChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LabView({
  course,
  lab,
  status,
  sandboxAbsHref,
  checklistState,
  onBack,
  onStart,
  onUpdateChecklist,
  onMarkComplete,
}) {
  const startedRef = useRef(false);

  useEffect(() => {
    if (!lab) return;
    if (!startedRef.current && status !== "Locked") {
      startedRef.current = true;
      onStart();
    }
  }, [lab, status, onStart]);

  if (!lab) {
    return (
      <Card
        title="Lab not found"
        subtitle="The lab id in the URL doesn't match any record."
      />
    );
  }

  const locked = status === "Locked";
  const completed = status === "Completed";
  const checklist = lab.u_checklist || [];
  const allDone =
    checklist.length > 0 &&
    checklist.every((c) => !!(checklistState || {})[c.id]);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", onClick: () => setHash("/dashboard") },
          { label: course.title, onClick: onBack },
          { label: lab.u_title },
        ]}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-extrabold">{lab.u_title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Split-screen lab: instructions + sandbox
          </p>
        </div>
        <StatusBadge status={locked ? "Locked" : completed ? "Completed" : "In Progress"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Instructions + checklist */}
        <div className="space-y-3">
          <Card title="Instructions" subtitle="Follow step-by-step">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              {lab.u_instructions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </Card>

          <Card title="Checklist" subtitle="Complete these to finish the lab">
            <div className="space-y-2">
              {checklist.map((c) => (
                <label key={c.id} className="flex items-start gap-2 text-sm">
                  <input
                    disabled={locked || completed}
                    type="checkbox"
                    checked={!!checklistState[c.id]}
                    onChange={(e) =>
                      onUpdateChecklist(lab.sys_id, c.id, e.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span
                    className={[
                      "text-slate-700",
                      checklistState[c.id] ? "line-through text-slate-400" : "",
                    ].join(" ")}
                  >
                    {c.text}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                disabled={locked || completed || !allDone}
                onClick={onMarkComplete}
                className="rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mark as Complete
              </button>
              <button
                onClick={onBack}
                className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back to labs
              </button>
              {!allDone && !locked && !completed && (
                <span className="self-center text-[11px] text-slate-500">
                  Complete all checklist items to enable “Mark as Complete”.
                </span>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Sandbox */}
        <div className="space-y-3">
          <Card title="Sandbox" subtitle="Use this environment to practice">
            <div className="flex flex-wrap gap-2 pb-3">
              <a
                href={sandboxAbsHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open in new tab <FiExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="h-[520px] overflow-hidden rounded border border-slate-200 bg-white">
              <iframe
                title="Sandbox"
                src={sandboxAbsHref}
                className="h-full w-full"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


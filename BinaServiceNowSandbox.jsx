import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowDown,
  FiArrowUp,
  FiBook,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClipboard,
  FiEye,
  FiLoader,
  FiLock,
  FiMinus,
  FiPause,
  FiPlay,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUser,
  FiX,
} from "react-icons/fi";

const STATES = ["New", "To Do", "In Progress", "In Review", "On Hold", "Done", "Closed"];
const STATE_CONFIG = {
  New: {
    icon: FiPlus,
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/50",
  },
  "To Do": {
    icon: FiPlus,
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/50",
  },
  "In Progress": {
    icon: FiPlay,
    className:
      "bg-amber-50 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/50",
  },
  "In Review": {
    icon: FiEye,
    className:
      "bg-violet-50 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300 border border-violet-200/60 dark:border-violet-700/50",
  },
  "On Hold": {
    icon: FiPause,
    className:
      "bg-orange-50 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border border-orange-200/60 dark:border-orange-700/50",
  },
  Done: {
    icon: FiCheckCircle,
    className:
      "bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200/60 dark:border-teal-700/50",
  },
  Closed: {
    icon: FiLock,
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-400 border border-slate-200 dark:border-slate-600/50",
  },
};

const PRIORITIES = [
  { value: "1", label: "Critical" },
  { value: "2", label: "High" },
  { value: "3", label: "Moderate" },
  { value: "4", label: "Low" },
];
const PRIORITY_CONFIG = {
  "1": {
    icon: FiAlertTriangle,
    label: "Critical",
    className:
      "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200/60 dark:border-red-700/50",
  },
  "2": {
    icon: FiArrowUp,
    label: "High",
    className:
      "bg-rose-50 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-700/50",
  },
  "3": {
    icon: FiMinus,
    label: "Moderate",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-700/50",
  },
  "4": {
    icon: FiArrowDown,
    label: "Low",
    className:
      "bg-sky-50 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 border border-sky-200/60 dark:border-sky-700/50",
  },
};

const initialIncidents = [
  {
    id: "INC0010001",
    short_description: "Email access not working after password reset",
    description: "",
    attachments: [],
    state: "New",
    priority: "2",
    assigned_to: "John Smith",
    opened: "2025-02-28 09:15",
  },
  {
    id: "INC0010002",
    short_description: "VPN connection drops after 30 minutes",
    description: "",
    attachments: [],
    state: "In Progress",
    priority: "3",
    assigned_to: "Sarah Lee",
    opened: "2025-02-28 10:22",
  },
  {
    id: "INC0010003",
    short_description: "Printer not responding on 3rd floor",
    description: "",
    attachments: [],
    state: "On Hold",
    priority: "4",
    assigned_to: "Mike Johnson",
    opened: "2025-02-27 14:00",
  },
  {
    id: "INC0010004",
    short_description: "Laptop unable to join corporate WiFi",
    description: "",
    attachments: [],
    state: "Done",
    priority: "2",
    assigned_to: "John Smith",
    opened: "2025-02-27 11:30",
  },
  {
    id: "INC0010005",
    short_description: "Software license activation failed",
    description: "",
    attachments: [],
    state: "Closed",
    priority: "3",
    assigned_to: "Sarah Lee",
    opened: "2025-02-26 16:45",
  },
  {
    id: "INC0010006",
    short_description: "Monitor flickering on docking station",
    description: "",
    attachments: [],
    state: "To Do",
    priority: "4",
    assigned_to: "",
    opened: "2025-03-01 08:00",
  },
  {
    id: "INC0010007",
    short_description: "Unable to access shared drive from home",
    description: "",
    attachments: [],
    state: "In Progress",
    priority: "2",
    assigned_to: "Mike Johnson",
    opened: "2025-02-28 15:20",
  },
];

function formatOpened() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function nextIncidentId(incidents) {
  const nums = incidents
    .map((i) => parseInt(String(i.id).replace(/\D/g, ""), 10))
    .filter(Boolean);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `INC001${String(next).padStart(4, "0")}`;
}

function StateBadge({ state }) {
  const config = STATE_CONFIG[state] || STATE_CONFIG["To Do"];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {state}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["3"];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {config.label}
    </span>
  );
}

const btnPrimary =
  "rounded-lg border border-[var(--primary-dark)] bg-[var(--primary)] text-[var(--bg-default)] font-medium transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-default)] disabled:opacity-50";
const btnSecondary =
  "rounded-lg border font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bina-btn-secondary";

/** Guided exercise: 2 steps — (1) open form, (2) fill all content and save */
const EXERCISE_STEPS = [
  { id: 1, label: 'Click the "To Do" button to create a new incident.' },
  {
    id: 2,
    label:
      "Fill up all the content below. Title and description are required; State, Priority, and Assigned to are optional. Then click Save.",
    validate: "all",
  },
];

const SANDBOX_STYLES = `
.servicenow-sandbox { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
.servicenow-sandbox .bina-bg-default { background-color: var(--bg-default); }
.servicenow-sandbox .bina-text-default { color: var(--text-default); }
.servicenow-sandbox .bina-text-muted { color: var(--text-muted); }
.servicenow-sandbox .bina-bg-secondary-dark { background-color: var(--secondary-dark); }
.servicenow-sandbox .bina-border-primary { border-color: var(--primary); }
.servicenow-sandbox .bina-border-grey-dark { border-color: var(--grey-dark); }
.servicenow-sandbox .bina-bg-primary-light-20 { background-color: color-mix(in srgb, var(--primary-light) 20%, transparent); }
.servicenow-sandbox .bina-bg-primary-light-30 { background-color: color-mix(in srgb, var(--primary-light) 30%, transparent); }
.servicenow-sandbox .bina-bg-primary-light-40 { background-color: color-mix(in srgb, var(--primary-light) 40%, transparent); }
.servicenow-sandbox .bina-bg-primary-light-50 { background-color: color-mix(in srgb, var(--primary-light) 50%, transparent); }
.servicenow-sandbox .bina-bg-primary-light-60 { background-color: color-mix(in srgb, var(--primary-light) 60%, transparent); }
.servicenow-sandbox .bina-bg-primary-20 { background-color: color-mix(in srgb, var(--primary) 20%, transparent); }
.servicenow-sandbox .bina-bg-secondary-dark-30 { background-color: color-mix(in srgb, var(--secondary-dark) 30%, transparent); }
.servicenow-sandbox .bina-bg-secondary-dark-50 { background-color: color-mix(in srgb, var(--secondary-dark) 50%, transparent); }
.servicenow-sandbox .bina-bg-secondary-dark-20 { background-color: color-mix(in srgb, var(--secondary-dark) 20%, transparent); }
.servicenow-sandbox .bina-bg-grey-dark-10 { background-color: color-mix(in srgb, var(--grey-dark) 10%, transparent); }
.servicenow-sandbox .bina-bg-grey-dark-20 { background-color: color-mix(in srgb, var(--grey-dark) 20%, transparent); }
.servicenow-sandbox .bina-border-grey-dark-20 { border-color: color-mix(in srgb, var(--grey-dark) 20%, transparent); }
.servicenow-sandbox .bina-border-grey-dark-30 { border-color: color-mix(in srgb, var(--grey-dark) 30%, transparent); }
.servicenow-sandbox .bina-border-grey-dark-40 { border-color: color-mix(in srgb, var(--grey-dark) 40%, transparent); }
.servicenow-sandbox .bina-border-grey-dark-50 { border-color: color-mix(in srgb, var(--grey-dark) 50%, transparent); }
.servicenow-sandbox .bina-hover-bg-grey-dark-20:hover { background-color: color-mix(in srgb, var(--grey-dark) 20%, transparent); }
.servicenow-sandbox .bina-hover-text-default:hover { color: var(--text-default); }
.servicenow-sandbox .bina-btn-secondary { border-color: var(--grey-dark); background-color: var(--bg-default); color: var(--text-default); }
.servicenow-sandbox .bina-btn-secondary:hover { background-color: color-mix(in srgb, var(--grey-dark) 20%, transparent); }
.servicenow-sandbox th.bina-th-hover:hover { background-color: color-mix(in srgb, var(--primary) 14%, transparent); }
.servicenow-sandbox tr.bina-row-hover:hover { background-color: color-mix(in srgb, var(--primary-light) 34%, transparent); }
.servicenow-sandbox .bina-surface { background-color: color-mix(in srgb, var(--bg-default) 92%, var(--secondary-dark)); }
.servicenow-sandbox .bina-focus-ring:focus-visible { outline: none; box-shadow: 0 0 0 2px var(--primary); }
/* Start Exercise button: brighter in dark theme (--primary is semi-transparent there) */
[data-theme="dark"] .servicenow-sandbox .btn-start-exercise {
  background: var(--button-primary);
  color: var(--secondary-dark);
  border-color: var(--primary-dark);
}
[data-theme="dark"] .servicenow-sandbox .btn-start-exercise:hover {
  opacity: 0.95;
  filter: brightness(1.05);
}
`;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function BinaServiceNowSandbox() {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [selectedId, setSelectedId] = useState(null);
  const [formDraft, setFormDraft] = useState(null);
  const [filterState, setFilterState] = useState("");
  const [sortBy, setSortBy] = useState("opened");
  const [sortDir, setSortDir] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModule, setActiveModule] = useState("incident"); // incident | change | problem
  const [formPanelOpen, setFormPanelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { incidentId, x, y }
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deletingIds, setDeletingIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [exerciseActive, setExerciseActive] = useState(false);
  const [exerciseStep, setExerciseStep] = useState(1);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  const closeTimeoutRef = useRef(null);
  const searchRef = useRef(null);

  const isNewIncident = Boolean(formDraft && !selectedId);
  const currentStepConfig = EXERCISE_STEPS.find((s) => s.id === exerciseStep);

  const isStepValid = useMemo(() => {
    if (!formDraft || !currentStepConfig?.validate) return true;
    if (currentStepConfig.validate === "all") {
      return (
        String(formDraft.short_description ?? "").trim().length > 0 &&
        String(formDraft.description ?? "").trim().length > 0
      );
    }
    return true;
  }, [formDraft, currentStepConfig]);

  const startExercise = () => {
    setExerciseActive(true);
    setExerciseStep(1);
    setExerciseCompleted(false);
  };

  const exitExercise = () => {
    setExerciseActive(false);
    setExerciseStep(1);
    setExerciseCompleted(false);
  };

  useEffect(() => {
    if (formDraft) {
      const id = requestAnimationFrame(() => setFormPanelOpen(true));
      return () => cancelAnimationFrame(id);
    }
    setFormPanelOpen(false);
  }, [formDraft]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!contextMenu) return undefined;
    const close = () => setContextMenu(null);
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("click", close);
    document.addEventListener("contextmenu", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("contextmenu", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (deletingIds.length === 0) return undefined;
    const idsToRemove = [...deletingIds];
    const t = setTimeout(() => {
      setIncidents((prev) => prev.filter((i) => !idsToRemove.includes(i.id)));
      setDeletingIds([]);
    }, 260);
    return () => clearTimeout(t);
  }, [deletingIds]);

  // Focus search with "/"
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "/") return;
      const target = e.target;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredAndSorted = useMemo(() => {
    let list = filterState ? incidents.filter((i) => i.state === filterState) : [...incidents];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.id && i.id.toLowerCase().includes(q)) ||
          (i.short_description && i.short_description.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.assigned_to && i.assigned_to.toLowerCase().includes(q)) ||
          (i.state && i.state.toLowerCase().includes(q)),
      );
    }
    list = [...list].sort((a, b) => {
      const aVal = a[sortBy] ?? "";
      const bVal = b[sortBy] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [incidents, filterState, sortBy, sortDir, searchQuery]);

  const counts = useMemo(() => {
    const c = { total: incidents.length, open: 0, closed: 0, unassigned: 0 };
    incidents.forEach((i) => {
      if (i.state === "Closed") c.closed += 1;
      else c.open += 1;
      if (!String(i.assigned_to ?? "").trim()) c.unassigned += 1;
    });
    return c;
  }, [incidents]);

  const openForm = (incident) => {
    setSelectedId(incident.id);
    setFormDraft({ ...incident, description: incident.description ?? "" });
  };

  const openFormForNew = () => {
    setSelectedId(null);
    setFormDraft({
      id: nextIncidentId(incidents),
      short_description: "",
      description: "",
      attachments: [],
      state: "To Do",
      priority: "3",
      assigned_to: "",
      opened: formatOpened(),
    });
    if (exerciseActive && exerciseStep === 1) setExerciseStep(2);
  };

  const closeForm = () => {
    setSelectedId(null);
    setFormDraft(null);
  };

  const handleSave = () => {
    if (!formDraft || saving) return;
    if (exerciseActive && exerciseStep === 2 && isNewIncident) {
      setExerciseCompleted(true);
      setExerciseActive(false);
      setExerciseStep(1);
    }
    setSaving(true);
    const toSave = { ...formDraft, description: formDraft.description ?? "", attachments: [] };
    if (isNewIncident) setIncidents((prev) => [...prev, toSave]);
    else setIncidents((prev) => prev.map((i) => (i.id === formDraft.id ? toSave : i)));
    setTimeout(() => {
      setSaving(false);
      closeForm();
    }, 600);
  };

  const handleCancel = () => {
    if (exerciseActive && formDraft) setExerciseStep(1);
    setFormPanelOpen(false);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => closeForm(), 280);
  };

  const updateDraft = (field, value) => {
    setFormDraft((d) => (d ? { ...d, [field]: value } : null));
  };

  const toggleSort = (column) => {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else setSortBy(column);
  };

  const handleRowContextMenu = (e, incident) => {
    e.preventDefault();
    e.stopPropagation();
    const MENU_W = 180;
    const MENU_H = 44;
    const pad = 8;
    const x = clamp(e.clientX, pad, window.innerWidth - MENU_W - pad);
    const y = clamp(e.clientY, pad, window.innerHeight - MENU_H - pad);
    setContextMenu({ incidentId: incident.id, x, y });
  };

  const openDeleteModal = (incidentId) => {
    setContextMenu(null);
    setDeleteConfirmId(incidentId);
  };
  const closeDeleteModal = () => setDeleteConfirmId(null);

  const handleDeleteIncident = (incidentId) => {
    setDeleteConfirmId(null);
    setDeletingIds((prev) => (prev.includes(incidentId) ? prev : [...prev, incidentId]));
    if (selectedId === incidentId) handleCancel();
  };

  const sortIcon =
    sortDir === "asc" ? (
      <FiChevronUp className="w-4 h-4 shrink-0" aria-hidden />
    ) : (
      <FiChevronDown className="w-4 h-4 shrink-0" aria-hidden />
    );

  const thBase =
    "text-left py-2.5 px-3 font-medium select-none text-xs tracking-wide uppercase";
  const thClickable = "cursor-pointer bina-th-hover transition-colors";

  const ariaSort = (col) => {
    if (sortBy !== col) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  };

  return (
    <div className="servicenow-sandbox min-h-screen flex flex-col bina-bg-default bina-text-default font-sans">
      <style dangerouslySetInnerHTML={{ __html: SANDBOX_STYLES }} />

      {/* Corporate top chrome */}
      <header
        className="h-14 px-4 flex items-center gap-4 border-b bina-border-grey-dark-30 bina-bg-secondary-dark"
        style={{ boxShadow: "var(--shadow-default)" }}
      >
        <div className="flex items-center gap-3 min-w-[220px]">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: "color-mix(in srgb, var(--primary) 18%, transparent)",
              border: "1px solid color-mix(in srgb, var(--grey-dark) 45%, transparent)",
            }}
            aria-hidden
          >
            <FiClipboard className="w-5 h-5" style={{ color: "var(--primary-dark)" }} aria-hidden />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">ServiceNow Labs</div>
            <div className="text-xs bina-text-muted">Bina training instance</div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bina-text-muted pointer-events-none" aria-hidden />
          <input
            ref={searchRef}
            type="text"
            placeholder='Search incidents… (press "/")'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-16 py-2 text-sm rounded-lg border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-shadow"
            aria-label="Search incidents"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] bina-text-muted border bina-border-grey-dark-40 rounded px-1.5 py-0.5">
            /
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm min-w-[180px] justify-end">
          <FiUser className="w-4 h-4 bina-text-muted" aria-hidden />
          <span>Lab User</span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left nav (corporate, compact) */}
        <aside className="w-[5rem] flex-shrink-0 bina-bg-secondary-dark border-r bina-border-grey-dark-30 bina-text-muted">
          <nav className="py-3 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setActiveModule("incident")}
              className={`w-full flex flex-col items-center gap-1 py-3 text-[11px] border-l-2 border-transparent focus:outline-none transition-colors ${
                activeModule === "incident"
                  ? "border-[var(--primary)] bina-bg-primary-light-30 bina-text-default"
                  : "bina-hover-bg-grey-dark-20 bina-hover-text-default"
              }`}
              aria-current={activeModule === "incident" ? "page" : undefined}
            >
              <FiClipboard className="w-5 h-5 shrink-0" aria-hidden />
              <span>Incident</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModule("change")}
              className={`w-full flex flex-col items-center gap-1 py-3 text-[11px] border-l-2 border-transparent focus:outline-none transition-colors ${
                activeModule === "change"
                  ? "border-[var(--primary)] bina-bg-primary-light-30 bina-text-default"
                  : "bina-hover-bg-grey-dark-20 bina-hover-text-default"
              }`}
              aria-current={activeModule === "change" ? "page" : undefined}
            >
              <FiRefreshCw className="w-5 h-5 shrink-0" aria-hidden />
              <span>Change</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModule("problem")}
              className={`w-full flex flex-col items-center gap-1 py-3 text-[11px] border-l-2 border-transparent focus:outline-none transition-colors ${
                activeModule === "problem"
                  ? "border-[var(--primary)] bina-bg-primary-light-30 bina-text-default"
                  : "bina-hover-bg-grey-dark-20 bina-hover-text-default"
              }`}
              aria-current={activeModule === "problem" ? "page" : undefined}
            >
              <FiAlertCircle className="w-5 h-5 shrink-0" aria-hidden />
              <span>Problem</span>
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bina-bg-default flex flex-col">
          {/* Context banner (corporate callout) */}
          <div className="px-4 py-2.5 text-sm border-b bina-border-grey-dark-20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-2 text-xs font-medium rounded-full px-3 py-1 border bina-border-grey-dark-40"
                  style={{ backgroundColor: "color-mix(in srgb, var(--primary-light) 18%, transparent)" }}
                >
                  Training environment
                </span>
                <span className="text-xs bina-text-muted">
                  Changes are in-memory for the demo.
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs bina-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-medium bina-text-default">{counts.total}</span> total
                </span>
                <span className="opacity-60">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-medium bina-text-default">{counts.open}</span> open
                </span>
                <span className="opacity-60">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-medium bina-text-default">{counts.closed}</span> closed
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-xs bina-text-muted mb-1">Bina Labs / ServiceNow</div>
                <h2 className="text-xl font-semibold bina-text-default">Incidents</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={openFormForNew} className={`inline-flex items-center gap-2 px-4 py-2 text-sm ${btnPrimary}`}>
                  <FiPlus className="w-4 h-4 shrink-0" aria-hidden />
                  To Do
                </button>

                {!exerciseActive ? (
                  <button
                    type="button"
                    onClick={startExercise}
                    className="btn-start-exercise inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border font-medium transition-all duration-200 border-[var(--primary)] bg-[var(--primary)] text-[var(--bg-default)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                    aria-label="Start guided exercise"
                  >
                    <FiBook className="w-4 h-4 shrink-0" aria-hidden />
                    Start Exercise
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={exitExercise}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border bina-border-grey-dark-40 bina-bg-default bina-text-default hover:opacity-90 transition-opacity"
                    aria-label="Exit exercise"
                  >
                    <FiX className="w-4 h-4 shrink-0" aria-hidden />
                    Exit
                  </button>
                )}
              </div>
            </div>

            {/* Exercise completion message */}
            {exerciseCompleted && (
              <div
                className="mb-4 p-4 rounded-lg border flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
                style={{
                  borderColor: "var(--primary)",
                  backgroundColor: "color-mix(in srgb, var(--primary-light) 26%, transparent)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "var(--primary)", color: "var(--bg-default)" }}
                  >
                    <FiCheckCircle className="w-5 h-5" aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold bina-text-default">Exercise complete!</p>
                    <p className="text-sm bina-text-muted">
                      You&apos;ve created an incident. Try creating another or explore the list.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExerciseCompleted(false)}
                  className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg border bina-border-grey-dark-40 bina-bg-default bina-text-default hover:opacity-90 transition-opacity"
                  aria-label="Dismiss"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Filters (corporate toolbar) */}
            <div className="mb-4 rounded-lg border bina-border-grey-dark-40 bina-bg-default" style={{ boxShadow: "var(--shadow-default)" }}>
              <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-sm bina-text-muted">State</div>
                  <select
                    value={filterState}
                    onChange={(e) => setFilterState(e.target.value)}
                    className="text-sm rounded-lg border bina-border-grey-dark bina-bg-default bina-text-default px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    aria-label="Filter by state"
                  >
                    <option value="">All</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  {(filterState || searchQuery.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterState("");
                        setSearchQuery("");
                      }}
                      className="text-sm rounded-lg border bina-border-grey-dark-40 bina-bg-default bina-text-default px-3 py-2 hover:opacity-90 transition-opacity"
                      aria-label="Clear filters"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <p className="text-sm bina-text-muted">
                  Click a row to edit. Right-click a row for <strong>Delete</strong>.
                </p>
              </div>
            </div>

            {/* Guided exercise: step 1 banner (form not open yet) */}
            {exerciseActive && exerciseStep === 1 && !formDraft && (
              <div
                className="mb-4 p-4 rounded-lg border flex flex-wrap items-center justify-between gap-3"
                style={{
                  borderColor: "var(--primary)",
                  backgroundColor: "color-mix(in srgb, var(--primary-light) 24%, transparent)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "var(--primary)", color: "var(--bg-default)" }}
                  >
                    <FiBook className="w-4 h-4" aria-hidden />
                  </div>
                  <div>
                    <p className="font-medium bina-text-default">
                      Step {exerciseStep} of 2: {currentStepConfig?.label}
                    </p>
                    <p className="text-sm bina-text-muted mt-0.5">
                      Click <strong>To Do</strong> to open the new incident form.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={exitExercise}
                  className="text-sm bina-text-muted hover:bina-text-default underline transition-colors"
                  aria-label="Exit exercise"
                >
                  Exit exercise
                </button>
              </div>
            )}

            {activeModule !== "incident" && (
              <div className="mb-4 p-4 rounded-lg border bina-border-primary bina-bg-primary-light-20 bina-text-default animate-in fade-in slide-in-from-bottom-2 duration-200">
                <p className="font-medium">{activeModule === "change" ? "Change" : "Problem"} Management</p>
                <p className="text-sm bina-text-muted mt-1">
                  This module is available in the full ServiceNow lab. Switch to <strong>Incident</strong> to create and manage incidents here.
                </p>
              </div>
            )}

            {activeModule === "incident" && (
              <div className="rounded-lg border bina-border-grey-dark-40 bina-bg-default overflow-hidden" style={{ boxShadow: "var(--shadow-default)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="bina-bg-secondary-dark-50 bina-text-default border-b bina-border-grey-dark-40">
                        <th
                          className={`${thBase} ${thClickable}`}
                          onClick={() => toggleSort("id")}
                          aria-sort={ariaSort("id")}
                        >
                          <span className="inline-flex items-center gap-1">
                            Number {sortBy === "id" ? sortIcon : null}
                          </span>
                        </th>
                        <th className={thBase}>Title</th>
                        <th
                          className={`${thBase} ${thClickable}`}
                          onClick={() => toggleSort("state")}
                          aria-sort={ariaSort("state")}
                        >
                          <span className="inline-flex items-center gap-1">
                            State {sortBy === "state" ? sortIcon : null}
                          </span>
                        </th>
                        <th
                          className={`${thBase} ${thClickable}`}
                          onClick={() => toggleSort("priority")}
                          aria-sort={ariaSort("priority")}
                        >
                          <span className="inline-flex items-center gap-1">
                            Priority {sortBy === "priority" ? sortIcon : null}
                          </span>
                        </th>
                        <th className={thBase}>Assigned to</th>
                        <th
                          className={`${thBase} ${thClickable}`}
                          onClick={() => toggleSort("opened")}
                          aria-sort={ariaSort("opened")}
                        >
                          <span className="inline-flex items-center gap-1">
                            Opened {sortBy === "opened" ? sortIcon : null}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSorted.map((inc) => {
                        const isDeleting = deletingIds.includes(inc.id);
                        const isSelected = selectedId === inc.id;
                        return (
                          <tr
                            key={inc.id}
                            onClick={() => !isDeleting && openForm(inc)}
                            onContextMenu={(e) => !isDeleting && handleRowContextMenu(e, inc)}
                            className={`border-b bina-border-grey-dark-20 cursor-pointer transition-all duration-200 ease-out bina-row-hover ${
                              isSelected ? "bina-bg-primary-light-50" : ""
                            } ${isDeleting ? "opacity-0 pointer-events-none -translate-x-4" : ""}`}
                          >
                            <td className="py-2.5 px-3 font-medium" style={{ color: "var(--primary-dark)" }}>
                              {inc.id}
                            </td>
                            <td className="py-2.5 px-3 bina-text-default max-w-[320px] truncate">{inc.short_description}</td>
                            <td className="py-2.5 px-3">
                              <StateBadge state={inc.state} />
                            </td>
                            <td className="py-2.5 px-3">
                              <PriorityBadge priority={inc.priority} />
                            </td>
                            <td className="py-2.5 px-3 bina-text-muted">{inc.assigned_to || "—"}</td>
                            <td className="py-2.5 px-3 bina-text-muted whitespace-nowrap">{inc.opened}</td>
                          </tr>
                        );
                      })}
                      {filteredAndSorted.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-10 text-center bina-text-muted text-sm">
                            {searchQuery || filterState ? "No incidents match your filters." : "No incidents yet. Click To Do to create one."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Right-click context menu: Delete */}
      {contextMenu && (
        <div
          className="fixed z-[60] min-w-[160px] rounded-lg border bina-border-grey-dark-40 bina-bg-default shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
          role="menu"
          aria-label="Incident actions"
        >
          <button
            type="button"
            onClick={() => openDeleteModal(contextMenu.incidentId)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
            role="menuitem"
          >
            <FiTrash2 className="w-4 h-4 shrink-0" aria-hidden />
            Delete
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <>
          <div
            className="fixed inset-0 z-[70] transition-opacity duration-200"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={closeDeleteModal}
            onKeyDown={(e) => e.key === "Escape" && closeDeleteModal()}
            role="button"
            tabIndex={0}
            aria-label="Close delete confirmation"
          />
          <div
            className="fixed left-1/2 top-1/2 z-[71] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl transition-all duration-200"
            style={{
              backgroundColor: "var(--bg-default)",
              color: "var(--text-default)",
              border: "1px solid var(--grey-dark)",
              boxShadow: "var(--shadow-default)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "var(--secondary-dark)", color: "var(--primary-dark)" }}>
                <FiTrash2 className="w-5 h-5" aria-hidden />
              </div>
              <h2 id="delete-modal-title" className="text-lg font-semibold" style={{ color: "var(--text-default)" }}>
                Delete incident?
              </h2>
            </div>
            <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
              Incident <strong>{deleteConfirmId}</strong> will be permanently removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ borderColor: "var(--grey-dark)", backgroundColor: "var(--bg-default)", color: "var(--text-default)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteIncident(deleteConfirmId)}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ borderColor: "var(--primary-dark)", backgroundColor: "var(--primary)", color: "var(--text-default)" }}
              >
                <FiTrash2 className="w-4 h-4 shrink-0" aria-hidden />
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Slide-over form */}
      {formDraft && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black transition-opacity duration-300 ease-out"
            style={{ opacity: formPanelOpen ? 0.4 : 0 }}
            onClick={handleCancel}
            onKeyDown={(e) => e.key === "Escape" && handleCancel()}
            role="button"
            tabIndex={0}
            aria-label="Close form"
          />
          <aside
            className={`fixed top-0 right-0 h-full w-full max-w-md bina-bg-default border-l bina-border-grey-dark-40 shadow-lg z-50 flex flex-col overflow-hidden transition-transform duration-300 ease-out ${
              formPanelOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-modal="true"
            aria-labelledby="incident-form-title"
            role="dialog"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b bina-border-grey-dark-40 bina-bg-secondary-dark-30">
              <div>
                <div className="text-xs bina-text-muted">Incident</div>
                <h3 id="incident-form-title" className="font-semibold bina-text-default">
                  {isNewIncident ? "New Incident" : formDraft.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 rounded-lg bina-hover-bg-grey-dark-20 bina-text-default transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" aria-hidden />
              </button>
            </div>

            {/* Guided exercise banner inside form (step 2) */}
            {exerciseActive && formDraft && currentStepConfig && (
              <div className="mx-4 mt-3 p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "var(--primary)", backgroundColor: "color-mix(in srgb, var(--primary-light) 20%, transparent)" }}>
                <p className="text-sm font-medium bina-text-default">
                  Step {exerciseStep} of 2: {currentStepConfig.label}
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium bina-text-default mb-1">Number</label>
                  <input
                    type="text"
                    value={formDraft.id}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border bina-border-grey-dark bina-bg-grey-dark-10 bina-text-muted text-sm cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium bina-text-default mb-1">
                    Title <span className="bina-text-muted">(required)</span>
                  </label>
                  <input
                    type="text"
                    value={formDraft.short_description}
                    onChange={(e) => updateDraft("short_description", e.target.value)}
                    placeholder="Brief title for the incident"
                    className="w-full px-3 py-2 rounded-lg border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium bina-text-default mb-1">
                    Description <span className="bina-text-muted">(required)</span>
                  </label>
                  <textarea
                    value={formDraft.description ?? ""}
                    onChange={(e) => updateDraft("description", e.target.value)}
                    placeholder="Add details, steps to reproduce…"
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y min-h-[96px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium bina-text-default mb-1">State (optional)</label>
                    <select
                      value={formDraft.state}
                      onChange={(e) => updateDraft("state", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      {STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium bina-text-default mb-1">Priority (optional)</label>
                    <select
                      value={formDraft.priority}
                      onChange={(e) => updateDraft("priority", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium bina-text-default mb-1">Assigned to (optional)</label>
                  <input
                    type="text"
                    value={formDraft.assigned_to}
                    onChange={(e) => updateDraft("assigned_to", e.target.value)}
                    placeholder="Enter name"
                    className="w-full px-3 py-2 rounded-lg border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium bina-text-default mb-1">Opened</label>
                  <input
                    type="text"
                    value={formDraft.opened}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border bina-border-grey-dark bina-bg-grey-dark-10 bina-text-muted text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t bina-border-grey-dark-40 bina-bg-secondary-dark-20">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || (exerciseActive && exerciseStep === 2 && !isStepValid)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200 ${btnPrimary} ${
                    saving || (exerciseActive && exerciseStep === 2 && !isStepValid) ? "opacity-80 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? (
                    <>
                      <FiLoader className="w-4 h-4 shrink-0 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className={`px-4 py-2 text-sm ${btnSecondary} ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  Cancel
                </button>
              </div>
              {!isNewIncident && (
                <button
                  type="button"
                  onClick={() => formDraft?.id && openDeleteModal(formDraft.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800/50 transition-colors"
                  aria-label="Delete incident"
                >
                  <FiTrash2 className="w-4 h-4 shrink-0" aria-hidden />
                  Delete
                </button>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
}


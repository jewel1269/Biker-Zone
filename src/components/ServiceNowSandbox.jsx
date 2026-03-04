import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaBarsStaggered } from "react-icons/fa6";
import {
  FiAlertTriangle,
  FiAlertCircle,
  FiActivity,
  FiBell,
  FiCheck,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiClipboard,
  FiEdit2,
  FiFilter,
  FiGrid,
  FiHome,
  FiList,
  FiMenu,
  FiMoreHorizontal,
  FiMoreVertical,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiStar,
  FiTrash2,
  FiUser,
  FiX,
  FiZap,
  FiColumns,
  FiDownload,
  FiEye,
  FiClock,
  FiHash,
  FiInfo,
} from "react-icons/fi";

// ── Data ──────────────────────────────────────────────────────────────────────
const STATES = ["New", "In Progress", "On Hold", "Resolved", "Closed", "Cancelled"];
const PRIORITIES = [
  { value: "1", label: "1 - Critical" },
  { value: "2", label: "2 - High" },
  { value: "3", label: "3 - Moderate" },
  { value: "4", label: "4 - Low" },
  { value: "5", label: "5 - Planning" },
];
const CATEGORIES = ["Inquiry/Help", "Hardware", "Software", "Network", "Text", "Other"];
const FORM_TABS = [
  "Details",
  "Work Orders",
  "SLAs",
  "Tasks",
  "Interactions",
  "Emails",
  "Task skills",
];

const P_CFG = {
  1: {
    label: "1 - Critical",
    dot: "bg-red-500",
    badge:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/40",
  },
  2: {
    label: "2 - High",
    dot: "bg-orange-500",
    badge:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/40",
  },
  3: {
    label: "3 - Moderate",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40",
  },
  4: {
    label: "4 - Low",
    dot: "bg-blue-500",
    badge:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40",
  },
  5: {
    label: "5 - Planning",
    dot: "bg-violet-500",
    badge:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/40",
  },
};
const S_CFG = {
  New: "text-blue-600 dark:text-blue-400",
  "In Progress": "text-amber-600 dark:text-amber-400",
  "On Hold": "text-orange-600 dark:text-orange-400",
  Resolved: "text-emerald-600 dark:text-emerald-400",
  Closed: "text-slate-500 dark:text-slate-400",
  Cancelled: "text-red-500 dark:text-red-400",
};

const INCIDENTS_SEED = [
  {
    id: "INC0001037",
    opened: "2020-03-02 15:24",
    short_description: "Need help, laptop not working properly",
    caller: "Signee Gye",
    priority: "3",
    state: "New",
    category: "Inquiry/Help",
    description: "Laptop fails to boot after latest OS update.",
    assigned_to: "",
    assignment_group: "",
  },
  {
    id: "INC0001038",
    opened: "2020-03-02 15:24",
    short_description: "Internet is slow and not loading images",
    caller: "Text",
    priority: "1",
    state: "New",
    category: "Text",
    description: "Network is degraded across the entire floor.",
    assigned_to: "",
    assignment_group: "",
  },
  {
    id: "INC0001039",
    opened: "2020-03-02 15:24",
    short_description: "Can't connect to server",
    caller: "Frank Boehm",
    priority: "1",
    state: "Resolved",
    category: "Inquiry/Help",
    description: "Unable to reach internal server at 10.0.0.5.",
    assigned_to: "John Smith",
    assignment_group: "IT Support",
  },
  {
    id: "INC0001040",
    opened: "2020-03-02 15:24",
    short_description: "Requesting tools for new hire",
    caller: "Text",
    priority: "3",
    state: "New",
    category: "Text",
    description: "New employee needs access to standard toolset.",
    assigned_to: "",
    assignment_group: "",
  },
  {
    id: "INC0001041",
    opened: "2020-03-02 15:24",
    short_description: "Laptop gets really hot when in use",
    caller: "Furmaan Bharyar",
    priority: "2",
    state: "New",
    category: "Hardware",
    description: "Fan runs at max speed and device overheats.",
    assigned_to: "",
    assignment_group: "",
  },
  {
    id: "INC0001042",
    opened: "2020-03-02 15:24",
    short_description: "Emails aren't sending",
    caller: "Text",
    priority: "5",
    state: "New",
    category: "Text",
    description: "Email client fails to deliver outbound messages.",
    assigned_to: "",
    assignment_group: "",
  },
  {
    id: "INC0001043",
    opened: "2020-03-02 15:24",
    short_description: "Can't log in with SSO and okta",
    caller: "Lu Zhou",
    priority: "3",
    state: "Closed",
    category: "Inquiry/Help",
    description: "SSO login fails with Okta credential error.",
    assigned_to: "Sarah Lee",
    assignment_group: "Identity",
  },
  {
    id: "INC0001044",
    opened: "2020-03-02 15:24",
    short_description: "Internet is lagging",
    caller: "Text",
    priority: "1",
    state: "New",
    category: "Text",
    description: "Network speed is below acceptable thresholds.",
    assigned_to: "",
    assignment_group: "",
  },
  {
    id: "INC0001045",
    opened: "2020-03-02 15:24",
    short_description: "Printer not working in the common room",
    caller: "Juan Jose Esteve",
    priority: "5",
    state: "New",
    category: "Hardware",
    description: "3rd floor communal printer is offline.",
    assigned_to: "",
    assignment_group: "",
  },
  {
    id: "INC0001046",
    opened: "2020-03-02 15:24",
    short_description: "Server is down",
    caller: "Text",
    priority: "2",
    state: "New",
    category: "Text",
    description: "Production server is unresponsive.",
    assigned_to: "",
    assignment_group: "",
  },
  {
    id: "INC0001047",
    opened: "2020-03-02 15:24",
    short_description: "Forgot login, need to reset",
    caller: "Jacqueline Likoki",
    priority: "3",
    state: "In Progress",
    category: "Inquiry/Help",
    description: "User is locked out of their account.",
    assigned_to: "Mike Johnson",
    assignment_group: "IT Support",
  },
  {
    id: "INC0001048",
    opened: "2020-03-02 15:24",
    short_description: "Can't access files in shared folder",
    caller: "Text",
    priority: "4",
    state: "New",
    category: "Text",
    description: "Permission denied on the shared network drive.",
    assigned_to: "",
    assignment_group: "",
  },
  {
    id: "INC0001049",
    opened: "2020-03-02 15:24",
    short_description: "Need help granting editing rights",
    caller: "Dusana Semenov",
    priority: "5",
    state: "Closed",
    category: "Software",
    description: "User needs editor permissions on a shared document.",
    assigned_to: "Sarah Lee",
    assignment_group: "IT Support",
  },
  {
    id: "INC0001050",
    opened: "2020-03-02 15:24",
    short_description: "New hire equipment request",
    caller: "Text",
    priority: "4",
    state: "New",
    category: "Text",
    description: "Laptop and peripherals needed for new hire on Monday.",
    assigned_to: "",
    assignment_group: "",
  },
  {
    id: "INC0001051",
    opened: "2020-03-02 15:24",
    short_description: "Email sending from wrong address",
    caller: "Monica Böttger",
    priority: "5",
    state: "Resolved",
    category: "Software",
    description: "Outgoing emails show incorrect sender address.",
    assigned_to: "John Smith",
    assignment_group: "IT Support",
  },
];

const CURRENT_USER = { name: "AG Operator", initials: "AG", group: "IT Support" };

function formatNow() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0",
  )}`;
}

const NAV_TREE = [
  { id: "cases", label: "Cases", Icon: FiClipboard, subs: ["All", "Open", "Resolved"] },
  { id: "customer", label: "Customer", Icon: FiUser, subs: [] },
  { id: "interactions", label: "Interactions", Icon: FiActivity, subs: [] },
  { id: "tasks", label: "Tasks", Icon: FiCheck, subs: [] },
  { id: "slas", label: "SLAs", Icon: FiZap, subs: [] },
  {
    id: "incidents",
    label: "Incidents",
    Icon: FiClipboard,
    subs: ["All", "Open", "Open - Unassigned", "Resolved"],
  },
  { id: "problems", label: "Problems", Icon: FiAlertCircle, subs: [] },
  { id: "change", label: "Change", Icon: FiRefreshCw, subs: [] },
  { id: "request", label: "Request", Icon: FiList, subs: [] },
  { id: "catalog", label: "Catalog Tasks", Icon: FiGrid, subs: [] },
  { id: "cmbds", label: "CMBDs", Icon: FiSettings, subs: [] },
];

function PriorityBadge({ p }) {
  const c = P_CFG[p] ?? P_CFG["3"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${c.badge}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
function StateBadge({ s }) {
  return (
    <span className={`text-xs font-medium ${S_CFG[s] ?? "text-slate-500 dark:text-slate-400"}`}>
      {s}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</label>
      {children}
    </div>
  );
}

function PgBtn({ children, active, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex h-6 min-w-[24px] items-center justify-center rounded border dark:border-gray-700 border-gray-300 px-1 text-[12px] font-medium transition-colors",
        active
          ? "border-primary bg-primary text-white"
          : disabled
            ? "border-grey-dark/10 text-muted/30 cursor-not-allowed"
            : "border-grey-dark/20 hover:border-primary/50 bg-primary-gradient text-muted hover:text-default",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function NavItem({ Icon, label, collapsed, active, hasChildren, expanded, onClick }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={[
        "flex w-full items-center gap-2 border-l-2 px-3 py-1.5 text-[16px] transition-colors",
        active
          ? "bg-primary/10 dark:bg-primary/20 border-primary font-semibold text-primary"
          : "hover:bg-primary/5 border-transparent text-muted hover:text-default",
      ].join(" ")}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-left leading-tight">{label}</span>
          {hasChildren &&
            (expanded ? (
              <FiChevronDown className="h-4 w-4 shrink-0 opacity-60" />
            ) : (
              <FiChevronRight className="h-4 w-4 shrink-0 opacity-60" />
            ))}
        </>
      )}
    </button>
  );
}
function DropdownMenu({ items, onClose, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className={`absolute z-50 min-w-[160px] rounded border border-grey-dark/20 bg-white shadow-lg dark:bg-secondary-dark dark:border-gray-700 py-1 ${className}`}
    >
      {items.map((item, i) =>
        item === "---" ? (
          <div key={i} className="my-1 border-t border-grey-dark/10 dark:border-gray-700" />
        ) : (
          <button
            key={i}
            onClick={() => {
              item.action();
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-default hover:bg-primary/5 transition-colors text-left"
          >
            {item.icon && <item.icon className="h-3.5 w-3.5 text-muted shrink-0" />}
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 shadow-lg dark:bg-emerald-950/60 dark:border-emerald-800/40">
      <FiCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{message}</span>
    </div>
  );
}

function FilterPanel({ filters, setFilters, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  const inp =
    "w-full rounded border border-grey-dark/25 bg-primary-gradient px-2.5 py-1.5 text-xs text-default placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 dark:border-grey-dark/15 transition-colors";
  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-grey-dark/20 bg-white shadow-xl dark:bg-secondary-dark dark:border-gray-700 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-default">Advanced Filters</span>
        <button onClick={onClose} className="text-muted hover:text-default">
          <FiX className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
            Priority
          </label>
          <select
            className={inp}
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
            Category
          </label>
          <select
            className={inp}
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted">
            Assigned To
          </label>
          <input
            className={inp}
            placeholder="Filter by assignee…"
            value={filters.assignedTo}
            onChange={(e) => setFilters((f) => ({ ...f, assignedTo: e.target.value }))}
          />
        </div>
        <div className="flex justify-between pt-1">
          <button
            onClick={() => setFilters({ priority: "", category: "", assignedTo: "" })}
            className="text-xs text-muted hover:text-default underline"
          >
            Clear all
          </button>
          <button onClick={onClose} className="rounded bg-primary px-3 py-1 text-xs font-semibold text-white hover:opacity-90">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

const ALL_COLUMNS = ["id", "opened", "short_description", "caller", "priority", "state", "category"];
const COL_LABELS = {
  id: "Number",
  opened: "Opened",
  short_description: "Short description",
  caller: "Caller",
  priority: "Priority",
  state: "Status",
  category: "Category",
};

function ColumnPanel({ visibleCols, setVisibleCols, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-grey-dark/20 bg-white shadow-xl dark:bg-secondary-dark dark:border-gray-700 p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-default">Columns</span>
        <button onClick={onClose} className="text-muted hover:text-default">
          <FiX className="h-3.5 w-3.5" />
        </button>
      </div>
      {ALL_COLUMNS.map((col) => (
        <label
          key={col}
          className="flex items-center gap-2 py-1 cursor-pointer text-xs text-default hover:text-primary"
        >
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded accent-primary"
            checked={visibleCols.includes(col)}
            onChange={(e) => {
              if (e.target.checked) setVisibleCols((p) => [...p, col]);
              else if (visibleCols.length > 2) setVisibleCols((p) => p.filter((c) => c !== col));
            }}
          />
          {COL_LABELS[col]}
        </label>
      ))}
    </div>
  );
}

const SAMPLE_NOTIFS = [
  { id: 1, text: "INC0001041 was assigned to you", time: "2 min ago", read: false },
  { id: 2, text: "SLA breach warning on INC0001038", time: "15 min ago", read: false },
  { id: 3, text: "INC0001039 resolved by John Smith", time: "1 hr ago", read: true },
  { id: 4, text: "New comment on INC0001047", time: "3 hr ago", read: true },
];

function NotifPanel({ onClose }) {
  const ref = useRef(null);
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFS);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-grey-dark/20 bg-white shadow-xl dark:bg-secondary-dark dark:border-gray-700 overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-grey-dark/15 dark:border-gray-700 px-3 py-2">
        <span className="text-xs font-bold text-default">Notifications</span>
        <button
          onClick={() => setNotifs((n) => n.map((x) => ({ ...x, read: true })))}
          className="text-[10px] text-primary hover:underline"
        >
          Mark all read
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto no-scrollbar">
        {notifs.map((n) => (
          <div
            key={n.id}
            onClick={() => setNotifs((p) => p.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
            className={`flex items-start gap-2 border-b border-grey-dark/10 dark:border-gray-700/50 px-3 py-2.5 cursor-pointer hover:bg-primary/5 transition-colors ${
              !n.read ? "bg-primary/3" : ""
            }`}
          >
            {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
            {n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0" />}
            <div>
              <p className={`text-[11px] leading-snug ${n.read ? "text-muted" : "text-default font-medium"}`}>
                {n.text}
              </p>
              <p className="mt-0.5 text-[10px] text-muted/60">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-grey-dark/15 dark:border-gray-700 px-3 py-2">
        <button className="text-[11px] text-primary hover:underline">View all notifications</button>
      </div>
    </div>
  );
}

function ProfilePanel({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-grey-dark/20 bg-white shadow-xl dark:bg-secondary-dark dark:border-gray-700 overflow-hidden"
    >
      <div className="border-b border-grey-dark/15 dark:border-gray-700 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
            {CURRENT_USER.initials}
          </div>
          <div>
            <p className="text-xs font-semibold text-default">{CURRENT_USER.name}</p>
            <p className="text-[10px] text-muted">{CURRENT_USER.group}</p>
          </div>
        </div>
      </div>
      {[
        { icon: FiUser, label: "My Profile" },
        { icon: FiSettings, label: "Preferences" },
        { icon: FiClock, label: "Activity Log" },
        "---",
        { icon: FiX, label: "Sign Out" },
      ].map((item, i) =>
        item === "---" ? (
          <div key={i} className="my-1 border-t border-grey-dark/10 dark:border-gray-700" />
        ) : (
          <button
            key={i}
            onClick={onClose}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-default hover:bg-primary/5 transition-colors"
          >
            <item.icon className="h-3.5 w-3.5 text-muted shrink-0" />
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}

function SettingsPanel({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-grey-dark/20 bg-white shadow-xl dark:bg-secondary-dark dark:border-gray-700 py-1"
    >
      {[
        { icon: FiSettings, label: "System Settings" },
        { icon: FiUser, label: "User Preferences" },
        { icon: FiEye, label: "Display Options" },
        { icon: FiHash, label: "Plugins" },
        "---",
        { icon: FiInfo, label: "About" },
      ].map((item, i) =>
        item === "---" ? (
          <div key={i} className="my-1 border-t border-grey-dark/10 dark:border-gray-700" />
        ) : (
          <button
            key={i}
            onClick={onClose}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-default hover:bg-primary/5 transition-colors"
          >
            <item.icon className="h-3.5 w-3.5 text-muted shrink-0" />
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}

function WorkOrdersTab({ inc }) {
  return (
    <div className="px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Work Orders</span>
        <button className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-white hover:opacity-90">
          <FiPlus className="h-3 w-3" /> Add
        </button>
      </div>
      {inc.assigned_to ? (
        <div className="rounded border border-grey-dark/15 dark:border-gray-700 divide-y divide-grey-dark/10 dark:divide-gray-700">
          <div className="px-3 py-2.5">
            <p className="text-xs font-semibold text-default">WO-{inc.id.slice(-4)}-01</p>
            <p className="mt-0.5 text-[11px] text-muted">Assigned to: {inc.assigned_to}</p>
            <p className="mt-0.5 text-[11px] text-muted">Group: {inc.assignment_group}</p>
            <div className="mt-1.5">
              <StateBadge s="In Progress" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FiClipboard className="mb-2 h-7 w-7 text-muted/30" />
          <p className="text-xs text-muted">No work orders yet</p>
          <p className="mt-0.5 text-[11px] text-muted/60">Assign the incident to create a work order</p>
        </div>
      )}
    </div>
  );
}

function SLAsTab({ inc }) {
  const slaItems = [
    { name: "Initial Response", target: "1 hr", elapsed: "0:32", status: "Met", pct: 55 },
    {
      name: "Update Frequency",
      target: "4 hrs",
      elapsed: "1:15",
      status: inc.state === "Resolved" ? "Met" : "Active",
      pct: 31,
    },
    {
      name: "Resolution",
      target: "8 hrs",
      elapsed: "2:40",
      status: inc.state === "Resolved" ? "Met" : "Active",
      pct: 33,
    },
  ];
  return (
    <div className="px-4 py-3 space-y-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted">SLA Status</span>
      {slaItems.map((s, i) => (
        <div key={i} className="rounded border border-grey-dark/15 dark:border-gray-700 p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-default">{s.name}</span>
            <span
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                s.status === "Met"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
              }`}
            >
              {s.status}
            </span>
          </div>
          <div className="mb-1 flex items-center justify-between text-[10px] text-muted">
            <span>Elapsed: {s.elapsed}</span>
            <span>Target: {s.target}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-grey-dark/15 dark:bg-gray-700">
            <div
              className={`h-1.5 rounded-full transition-all ${s.status === "Met" ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${s.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TasksTab() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Investigate root cause", done: false },
    { id: 2, text: "Notify affected users", done: false },
    { id: 3, text: "Apply fix / workaround", done: false },
  ]);
  const [newTask, setNewTask] = useState("");
  return (
    <div className="px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
          Tasks ({tasks.filter((t) => !t.done).length} open)
        </span>
      </div>
      <div className="space-y-1.5 mb-3">
        {tasks.map((t) => (
          <label key={t.id} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={t.done}
              onChange={() =>
                setTasks((p) => p.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))
              }
              className="h-3.5 w-3.5 rounded accent-primary"
            />
            <span className={`text-xs transition-colors ${t.done ? "line-through text-muted/50" : "text-default"}`}>
              {t.text}
            </span>
            <button
              onClick={() => setTasks((p) => p.filter((x) => x.id !== t.id))}
              className="ml-auto opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all"
            >
              <FiX className="h-3 w-3" />
            </button>
          </label>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          className="flex-1 rounded border border-grey-dark/25 bg-primary-gradient px-2 py-1 text-xs placeholder-muted focus:border-primary focus:outline-none dark:border-grey-dark/15"
          placeholder="Add task…"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newTask.trim()) {
              setTasks((p) => [...p, { id: Date.now(), text: newTask.trim(), done: false }]);
              setNewTask("");
            }
          }}
        />
        <button
          onClick={() => {
            if (newTask.trim()) {
              setTasks((p) => [...p, { id: Date.now(), text: newTask.trim(), done: false }]);
              setNewTask("");
            }
          }}
          className="rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-white hover:opacity-90"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function InteractionsTab() {
  const [interactions, setInteractions] = useState([
    {
      id: 1,
      type: "Call",
      user: "AG Operator",
      time: "2020-03-02 15:30",
      note: "Initial call received from user. Confirmed issue details.",
    },
    {
      id: 2,
      type: "Note",
      user: "John Smith",
      time: "2020-03-02 16:10",
      note: "Investigated logs. Issue traced to recent deployment.",
    },
  ]);
  const [newNote, setNewNote] = useState("");
  return (
    <div className="px-4 py-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Interactions</span>
      <div className="mt-3 space-y-2.5">
        {interactions.map((i) => (
          <div key={i.id} className="rounded border border-grey-dark/15 dark:border-gray-700 p-2.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-primary">{i.type}</span>
              <span className="text-[10px] text-muted">{i.time}</span>
            </div>
            <p className="text-xs text-default">{i.note}</p>
            <p className="mt-1 text-[10px] text-muted">— {i.user}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        <textarea
          className="w-full rounded border border-grey-dark/25 bg-primary-gradient px-2.5 py-1.5 text-xs placeholder-muted focus:border-primary focus:outline-none dark:border-grey-dark/15 min-h-[60px] resize-y"
          placeholder="Add a note…"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button
          onClick={() => {
            if (newNote.trim()) {
              setInteractions((p) => [
                ...p,
                { id: Date.now(), type: "Note", user: CURRENT_USER.name, time: formatNow(), note: newNote.trim() },
              ]);
              setNewNote("");
            }
          }}
          className="rounded bg-primary px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90"
        >
          Add Note
        </button>
      </div>
    </div>
  );
}

function EmailsTab({ inc }) {
  const [emails, setEmails] = useState([
    {
      id: 1,
      subject: "Re: " + inc.short_description,
      from: inc.caller || "caller@company.com",
      to: "itsupport@company.com",
      time: "2020-03-02 15:35",
      body: "Hello, I am having the following issue: " + inc.description,
    },
  ]);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({
    to: inc.caller ? `${inc.caller.toLowerCase().replace(" ", ".")}@company.com` : "",
    subject: "Re: " + inc.short_description,
    body: "",
  });
  return (
    <div className="px-4 py-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Emails ({emails.length})</span>
        <button
          onClick={() => setComposing(true)}
          className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-white hover:opacity-90"
        >
          <FiPlus className="h-3 w-3" /> Compose
        </button>
      </div>
      {composing && (
        <div className="mb-3 rounded border border-primary/30 bg-primary/3 p-3 space-y-2">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">To</label>
            <input
              className="mt-0.5 w-full rounded border border-grey-dark/25 bg-primary-gradient px-2.5 py-1.5 text-xs placeholder-muted focus:border-primary focus:outline-none dark:border-grey-dark/15"
              value={draft.to}
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Subject</label>
            <input
              className="mt-0.5 w-full rounded border border-grey-dark/25 bg-primary-gradient px-2.5 py-1.5 text-xs placeholder-muted focus:border-primary focus:outline-none dark:border-grey-dark/15"
              value={draft.subject}
              onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Body</label>
            <textarea
              className="mt-0.5 w-full rounded border border-grey-dark/25 bg-primary-gradient px-2.5 py-1.5 text-xs placeholder-muted focus:border-primary focus:outline-none dark:border-grey-dark/15 min-h-[60px] resize-y"
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              placeholder="Email body…"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (draft.body.trim()) {
                  setEmails((p) => [
                    ...p,
                    { id: Date.now(), subject: draft.subject, from: "itsupport@company.com", to: draft.to, time: formatNow(), body: draft.body },
                  ]);
                  setComposing(false);
                  setDraft((d) => ({ ...d, body: "" }));
                }
              }}
              className="rounded bg-primary px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90"
            >
              Send
            </button>
            <button
              onClick={() => setComposing(false)}
              className="rounded border border-grey-dark/25 px-3 py-1 text-[11px] text-muted hover:text-default"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {emails.map((e) => (
          <div key={e.id} className="rounded border border-grey-dark/15 dark:border-gray-700 p-2.5">
            <div className="mb-1 flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-default truncate">{e.subject}</span>
              <span className="shrink-0 text-[10px] text-muted">{e.time}</span>
            </div>
            <p className="text-[10px] text-muted">
              From: {e.from} → {e.to}
            </p>
            <p className="mt-1 text-xs text-default/80 line-clamp-2">{e.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskSkillsTab({ inc }) {
  const skills = [
    { name: "Network Diagnostics", level: "Advanced", assigned: false },
    { name: "Hardware Repair", level: "Intermediate", assigned: inc.category === "Hardware" },
    { name: "Software Troubleshooting", level: "Advanced", assigned: inc.category === "Software" },
    { name: "Account Management", level: "Basic", assigned: inc.category === "Inquiry/Help" },
    { name: "Server Administration", level: "Expert", assigned: false },
  ];
  return (
    <div className="px-4 py-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Required Skills</span>
      <div className="mt-3 space-y-1.5">
        {skills.map((s, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded border border-grey-dark/10 dark:border-gray-700/60 px-2.5 py-2"
          >
            <div>
              <p className="text-xs font-medium text-default">{s.name}</p>
              <p className="text-[10px] text-muted">{s.level}</p>
            </div>
            {s.assigned && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Matched
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── History view ───────────────────────────────────────────────────────────────
function HistoryView({ incidents, openEdit }) {
  const recent = [...incidents].slice(0, 8);
  return (
    <div className="flex-1 overflow-auto p-4 no-scrollbar">
      <h2 className="mb-3 text-sm font-bold text-default">Recently Viewed</h2>
      <div className="space-y-1.5">
        {recent.map((inc) => (
          <button
            key={inc.id}
            onClick={() => openEdit(inc)}
            className="flex w-full items-center gap-3 rounded border border-grey-dark/10 dark:border-gray-700 bg-white dark:bg-secondary-dark px-3 py-2 hover:bg-primary/5 transition-colors text-left"
          >
            <FiClipboard className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-primary-dark">{inc.id}</p>
              <p className="truncate text-xs text-muted">{inc.short_description}</p>
            </div>
            <StateBadge s={inc.state} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Favorites view ────────────────────────────────────────────────────────────
function FavoritesView({ favorites, incidents, openEdit, removeFavorite }) {
  const favIncs = incidents.filter((i) => favorites.includes(i.id));
  return (
    <div className="flex-1 overflow-auto p-4 no-scrollbar">
      <h2 className="mb-3 text-sm font-bold text-default">Favorites</h2>
      {favIncs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FiStar className="mb-2 h-8 w-8 text-muted/30" />
          <p className="text-xs text-muted">No favorites yet</p>
          <p className="mt-0.5 text-[11px] text-muted/60">
            Click the star icon on any incident to add it here
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {favIncs.map((inc) => (
            <div
              key={inc.id}
              className="flex items-center gap-3 rounded border border-grey-dark/10 dark:border-gray-700 bg-white dark:bg-secondary-dark px-3 py-2"
            >
              <button onClick={() => openEdit(inc)} className="flex min-w-0 flex-1 items-center gap-3 text-left hover:opacity-80">
                <FiClipboard className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-primary-dark">{inc.id}</p>
                  <p className="truncate text-xs text-muted">{inc.short_description}</p>
                </div>
                <StateBadge s={inc.state} />
              </button>
              <button onClick={() => removeFavorite(inc.id)} className="shrink-0 text-amber-400 hover:text-muted">
                <FiStar className="h-4 w-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ServiceNowSandbox() {
  const [incidents, setIncidents] = useState(INCIDENTS_SEED);
  const [formDraft, setFormDraft] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formTab, setFormTab] = useState("Details");

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [sortCol, setSortCol] = useState("opened");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [checked, setChecked] = useState([]);

  const [expandedNav, setExpandedNav] = useState("incidents");
  const [sidebarWide, setSidebarWide] = useState(true);
  const [mobileSB, setMobileSB] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  // New state
  const [activeView, setActiveView] = useState("incidents"); // "incidents" | "history" | "favorites" | "workspaces"
  const [favorites, setFavorites] = useState(["INC0001039", "INC0001043"]);
  const [openTabs, setOpenTabs] = useState([{ id: "INC0001046", label: "INC0001046" }]);
  const [activeHeaderTab, setActiveHeaderTab] = useState("INC0001046");
  const [advFilters, setAdvFilters] = useState({ priority: "", category: "", assignedTo: "" });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showColumnPanel, setShowColumnPanel] = useState(false);
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS);
  const [listTab, setListTab] = useState("Lists"); // "Lists" | "My Lists"
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPanelMore, setShowPanelMore] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const filterBtnRef = useRef(null);
  const columnBtnRef = useRef(null);
  const editBtnRef = useRef(null);

  function showToast(msg) {
    setToast(msg);
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...incidents];
    if (filterMode === "open") list = list.filter((i) => !["Resolved", "Closed", "Cancelled"].includes(i.state));
    if (filterMode === "open-unassigned")
      list = list.filter(
        (i) => !["Resolved", "Closed", "Cancelled"].includes(i.state) && !i.assigned_to,
      );
    if (filterMode === "resolved") list = list.filter((i) => i.state === "Resolved");

    // My Lists: only assigned to current user
    if (listTab === "My Lists") list = list.filter((i) => i.assigned_to === CURRENT_USER.name);

    // Advanced filters
    if (advFilters.priority) list = list.filter((i) => i.priority === advFilters.priority);
    if (advFilters.category) list = list.filter((i) => i.category === advFilters.category);
    if (advFilters.assignedTo)
      list = list.filter((i) => (i.assigned_to || "").toLowerCase().includes(advFilters.assignedTo.toLowerCase()));

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.short_description.toLowerCase().includes(q) ||
          (i.caller || "").toLowerCase().includes(q) ||
          i.state.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      const c = String(a[sortCol] ?? "").localeCompare(String(b[sortCol] ?? ""), undefined, { numeric: true });
      return sortDir === "asc" ? c : -c;
    });
    return list;
  }, [incidents, filterMode, search, sortCol, sortDir, advFilters, listTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);
  const allChk = pageData.length > 0 && pageData.every((i) => checked.includes(i.id));

  function toggleSort(col) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  function openNew() {
    const newId = `INC${String(Math.floor(Math.random() * 9e6 + 1e6))}`;
    setIsNew(true);
    setFormDraft({
      id: newId,
      opened: formatNow(),
      short_description: "",
      description: "",
      caller: "",
      priority: "3",
      state: "New",
      category: "Inquiry/Help",
      assigned_to: "",
      assignment_group: "",
    });
    setFormTab("Details");
    setFormOpen(true);
    setMobileSB(false);
    // Add to open tabs
    if (!openTabs.find((t) => t.id === newId)) {
      setOpenTabs((p) => [...p, { id: newId, label: newId }]);
    }
    setActiveHeaderTab(newId);
  }

  function openEdit(inc) {
    setIsNew(false);
    setFormDraft({ ...inc });
    setFormTab("Details");
    setFormOpen(true);
    setMobileSB(false);
    setActiveView("incidents");
    // Add to open tabs
    if (!openTabs.find((t) => t.id === inc.id)) {
      setOpenTabs((p) => [...p, { id: inc.id, label: inc.id }]);
    }
    setActiveHeaderTab(inc.id);
  }

  function closeForm() {
    setFormOpen(false);
    setTimeout(() => setFormDraft(null), 260);
  }

  function closeTab(tabId) {
    setOpenTabs((p) => p.filter((t) => t.id !== tabId));
    if (formDraft?.id === tabId) closeForm();
    if (activeHeaderTab === tabId) {
      const remaining = openTabs.filter((t) => t.id !== tabId);
      if (remaining.length > 0) setActiveHeaderTab(remaining[remaining.length - 1].id);
    }
  }

  function handleSave() {
    if (!formDraft || saving) return;
    setSaving(true);
    setTimeout(() => {
      if (isNew) setIncidents((p) => [formDraft, ...p]);
      else setIncidents((p) => p.map((i) => (i.id === formDraft.id ? formDraft : i)));
      setSaving(false);
      closeForm();
      showToast(isNew ? "Incident created successfully" : "Incident saved successfully");
    }, 480);
  }

  function handleDelete(id) {
    setIncidents((p) => p.filter((i) => i.id !== id));
    setDeleteId(null);
    if (formDraft?.id === id) closeForm();
    closeTab(id);
    showToast("Incident deleted");
  }

  function upd(f, v) {
    setFormDraft((d) => (d ? { ...d, [f]: v } : null));
  }

  function handleAssignToMe() {
    if (!formDraft) return;
    upd("assigned_to", CURRENT_USER.name);
    upd("assignment_group", CURRENT_USER.group);
    showToast(`Assigned to ${CURRENT_USER.name}`);
  }

  function handleResolve() {
    if (!formDraft) return;
    upd("state", "Resolved");
    showToast("Incident marked as Resolved");
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastRefresh(new Date());
      showToast("List refreshed");
    }, 600);
  }

  function toggleFavorite(id) {
    setFavorites((p) => (p.includes(id) ? p.filter((f) => f !== id) : [...p, id]));
  }

  function handleExport() {
    const csv = [
      ["Number", "Opened", "Short Description", "Caller", "Priority", "State", "Category"],
      ...filtered.map((i) => [i.id, i.opened, `"${i.short_description}"`, i.caller, P_CFG[i.priority]?.label, i.state, i.category]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "incidents.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported to CSV");
  }

  // page numbers to show
  const pageNums = () => {
    const out = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) out.push(i);
    return out;
  };

  const activeFilterCount = [advFilters.priority, advFilters.category, advFilters.assignedTo].filter(Boolean).length;

  // ── Input class ────────────────────────────────────────────────────────────
  const inp =
    "w-full rounded border border-grey-dark/25 bg-primary-gradient px-2.5 py-1.5 text-xs text-default placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 dark:border-grey-dark/15 transition-colors";

  // ── TH helper ─────────────────────────────────────────────────────────────
  const TH = ({ col, label, minW = "" }) => (
    <th
      onClick={() => toggleSort(col)}
      className={`hover:bg-primary/5 group cursor-pointer select-none whitespace-nowrap px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted transition-colors hover:text-default ${minW}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortCol === col ? (
          sortDir === "asc" ? (
            <FiChevronUp className="h-3 w-3 shrink-0 text-primary" />
          ) : (
            <FiChevronDown className="h-3 w-3 shrink-0 text-primary" />
          )
        ) : (
          <FiChevronDown className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-30" />
        )}
      </span>
    </th>
  );

  const headerNavItems = ["All", "Favorites", "History", "Workspaces"];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-primary-gradient font-sans text-default antialiased">
      <header className="border-grey-dark/20 z-30 flex h-14 shrink-0 items-center gap-1.5 border-b dark:border-gray-700 border-gray-300 bg-secondary-dark px-3 shadow-default">
        <button className="hover:bg-grey-dark/20 rounded p-1 text-muted lg:hidden" onClick={() => setMobileSB((v) => !v)}>
          <FiMenu className="h-4 w-4" />
        </button>

        <div className="mr-3 flex shrink-0 items-center gap-2  border-r border-gray-700/40 pr-4">
          <FaBarsStaggered className="text-lg dark:text-white/80 text-gray-700" />

          <div className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight dark:text-white text-gray-700">
              Service<span className="text-primary">Now</span> Labs
            </span>
            <p className="text-xs text-gray-400">Bina Training Instance</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden items-center gap-0.5 lg:flex">
          {headerNavItems.map((n) => (
            <button
              key={n}
              onClick={() => {
                if (n === "All") {
                  setActiveView("incidents");
                  setExpandedNav("incidents");
                } else if (n === "Favorites") setActiveView("favorites");
                else if (n === "History") setActiveView("history");
                else if (n === "Workspaces") setActiveView("workspaces");
              }}
              className={`rounded px-2 py-1 text-base font-medium transition ${
                (n === "All" && activeView === "incidents") ||
                (n === "Favorites" && activeView === "favorites") ||
                (n === "History" && activeView === "history") ||
                (n === "Workspaces" && activeView === "workspaces")
                  ? "bg-grey-dark/30 text-white"
                  : "text-muted/80 hover:bg-grey-dark/20 hover:text-white"
              }`}
            >
              {n}
            </button>
          ))}
          <div className="relative">
            <button onClick={() => setShowMoreMenu((v) => !v)} className="text-muted/60 hover:bg-grey-dark/20 rounded p-1">
              <FiMoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {showMoreMenu && (
              <DropdownMenu
                className="left-0 top-full"
                items={[
                  {
                    icon: FiClipboard,
                    label: "Incidents",
                    action: () => {
                      setActiveView("incidents");
                      setExpandedNav("incidents");
                    },
                  },
                  {
                    icon: FiAlertCircle,
                    label: "Problems",
                    action: () => {
                      setActiveView("incidents");
                      setExpandedNav("problems");
                    },
                  },
                  {
                    icon: FiRefreshCw,
                    label: "Change Requests",
                    action: () => {
                      setActiveView("incidents");
                      setExpandedNav("change");
                    },
                  },
                  {
                    icon: FiList,
                    label: "Service Requests",
                    action: () => {
                      setActiveView("incidents");
                      setExpandedNav("request");
                    },
                  },
                ]}
                onClose={() => setShowMoreMenu(false)}
              />
            )}
          </div>
        </nav>

        {/* Open-record tabs */}
        <div className="hidden items-center gap-1 pl-2 sm:flex overflow-x-auto no-scrollbar">
          {openTabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => {
                setActiveHeaderTab(tab.id);
                const inc = incidents.find((i) => i.id === tab.id);
                if (inc) openEdit(inc);
              }}
              className={`border-grey-dark/30 flex cursor-pointer items-center gap-1.5 rounded-t-sm border border-b-0 px-2.5 py-1 text-[11px] font-medium shadow-sm transition-colors ${
                activeHeaderTab === tab.id
                  ? "bg-primary-gradient text-default"
                  : "bg-white/5 text-muted hover:bg-primary-gradient/50 hover:text-default"
              }`}
            >
              <FiClipboard className="h-3 w-3 shrink-0 text-primary" />
              <span>{tab.label}</span>
              <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} className="text-muted hover:text-default">
                <FiX className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button onClick={openNew} className="text-muted/60 hover:bg-grey-dark/20 rounded p-1">
            <FiPlus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <div className="relative hidden sm:block">
            <FiSearch className="text-muted/60 pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2" />
            <input
              placeholder="Search"
              className="border-grey-dark/20 focus:border-primary/60 w-36 rounded border bg-white/5 py-1 pl-6 pr-2 text-xs text-white/80 placeholder-white/30 transition-all focus:w-48 focus:outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setActiveView("incidents");
              }}
            />
          </div>

          {/* Bell */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setShowNotifPanel((v) => !v);
                setShowSettingsPanel(false);
                setShowProfilePanel(false);
              }}
              className={`text-muted/60 hover:bg-grey-dark/20 rounded p-1.5 hover:text-white transition-colors ${
                showNotifPanel ? "bg-grey-dark/20 text-white" : ""
              }`}
            >
              <FiBell className="h-4 w-4" />
            </button>
            {showNotifPanel && <NotifPanel onClose={() => setShowNotifPanel(false)} />}
          </div>

          {/* Phone */}
          <button
            className="text-muted/60 hover:bg-grey-dark/20 hidden rounded p-1.5 hover:text-white sm:block"
            onClick={() => showToast("Phone integration not configured")}
          >
            <FiPhone className="h-4 w-4" />
          </button>

          {/* Settings */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setShowSettingsPanel((v) => !v);
                setShowNotifPanel(false);
                setShowProfilePanel(false);
              }}
              className={`text-muted/60 hover:bg-grey-dark/20 rounded p-1.5 hover:text-white transition-colors ${
                showSettingsPanel ? "bg-grey-dark/20 text-white" : ""
              }`}
            >
              <FiSettings className="h-4 w-4" />
            </button>
            {showSettingsPanel && <SettingsPanel onClose={() => setShowSettingsPanel(false)} />}
          </div>

          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfilePanel((v) => !v);
                setShowNotifPanel(false);
                setShowSettingsPanel(false);
              }}
              className="ring-primary/30 ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white ring-2 hover:ring-primary/60 transition-all"
            >
              {CURRENT_USER.initials}
            </button>
            {showProfilePanel && <ProfilePanel onClose={() => setShowProfilePanel(false)} />}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {mobileSB && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileSB(false)} />}

        {/* ════════ SIDEBAR ════════ */}
        <aside
          className={[
            "border-grey-dark/20 fixed inset-y-0 left-0 z-50 flex flex-col border-r dark:border-gray-700 border-gray-300",
            "bg-white shadow-default transition-all duration-200 dark:bg-secondary-dark",
            "lg:relative lg:z-auto lg:shadow-none",
            mobileSB ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            sidebarWide ? "w-52" : "w-12",
          ].join(" ")}
          style={{ top: mobileSB ? "44px" : undefined }}
        >
          {/* Collapse btn */}
          <div className="border-grey-dark/15 flex h-9 shrink-0 items-center justify-end border-b dark:border-gray-800 border-gray-300 px-2">
            <button
              className="hover:bg-primary/10 rounded p-1 font-bold text-muted transition hover:text-primary"
              onClick={() => setSidebarWide((v) => !v)}
            >
              {sidebarWide ? <FiChevronLeft className="h-4 w-4" /> : <FiChevronRight className="h-4 w-4" />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-1 no-scrollbar">
            <NavItem
              Icon={FiHome}
              label="Home"
              collapsed={!sidebarWide}
              active={false}
              onClick={() => {
                setActiveView("incidents");
                setExpandedNav("incidents");
                setFilterMode("all");
                setPage(1);
                setMobileSB(false);
              }}
            />
            {NAV_TREE.map((item) => (
              <div key={item.id}>
                <NavItem
                  Icon={item.Icon}
                  label={item.label}
                  collapsed={!sidebarWide}
                  active={expandedNav === item.id}
                  hasChildren={item.subs.length > 0}
                  expanded={expandedNav === item.id}
                  onClick={() => {
                    setExpandedNav((v) => (v === item.id ? "" : item.id));
                    if (item.subs.length === 0) {
                      setActiveView("incidents");
                      setFilterMode("all");
                      setPage(1);
                      setMobileSB(false);
                    }
                  }}
                />
                {sidebarWide &&
                  expandedNav === item.id &&
                  item.subs.map((sub) => {
                    const fm =
                      sub === "All" ? "all" : sub === "Open" ? "open" : sub === "Open - Unassigned" ? "open-unassigned" : "resolved";
                    const isActive = filterMode === fm && expandedNav === item.id && activeView === "incidents";
                    return (
                      <button
                        key={sub}
                        onClick={() => {
                          setFilterMode(fm);
                          setPage(1);
                          setMobileSB(false);
                          setActiveView("incidents");
                        }}
                        className={[
                          "flex w-full items-center gap-2 border-l-2 py-1.5 pl-9 pr-3 text-[14px] transition-colors",
                          isActive
                            ? "bg-primary/8 dark:bg-primary/15 border-primary font-semibold text-primary"
                            : "hover:bg-primary/5 border-transparent text-muted hover:text-default",
                        ].join(" ")}
                      >
                        {sub}
                      </button>
                    );
                  })}
              </div>
            ))}
          </nav>
        </aside>

        {/* ════════ MAIN ════════ */}
        <main className="flex flex-1 overflow-hidden">
          {/* ── Detail Panel ── */}
          {formOpen && formDraft && (
            <div
              className={[
                "border-grey-dark/20 flex shrink-0 flex-col border-r dark:border-gray-700 border-gray-300",
                "bg-white shadow-default dark:bg-secondary-dark",
                "w-full sm:w-[360px] md:w-[380px]",
                "transition-all duration-200",
                formOpen ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
              ].join(" ")}
            >
              {/* Panel title */}
              <div className="border-grey-dark/15 shrink-0 border-b dark:border-gray-700 border-gray-300 px-4 py-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                    {isNew ? "New Incident" : formDraft.id}
                  </span>
                  <button
                    onClick={() => toggleFavorite(formDraft.id)}
                    title={favorites.includes(formDraft.id) ? "Remove from favorites" : "Add to favorites"}
                    className="transition-colors"
                  >
                    <FiStar
                      className={`h-3 w-3 ${
                        favorites.includes(formDraft.id) ? "fill-amber-400 text-amber-400" : "text-muted/50 hover:text-amber-400"
                      }`}
                    />
                  </button>
                  <div className="relative ml-auto">
                    <button
                      className="hover:bg-grey-dark/15 rounded p-0.5 text-muted hover:text-default"
                      onClick={() => setShowPanelMore((v) => !v)}
                    >
                      <FiMoreVertical className="h-4 w-4" />
                    </button>
                    {showPanelMore && (
                      <DropdownMenu
                        className="right-0 top-full"
                        items={[
                          {
                            icon: FiClipboard,
                            label: "Copy ID",
                            action: () => {
                              navigator.clipboard?.writeText(formDraft.id);
                              showToast("Copied to clipboard");
                            },
                          },
                          {
                            icon: FiStar,
                            label: favorites.includes(formDraft.id) ? "Remove favorite" : "Add to favorites",
                            action: () => toggleFavorite(formDraft.id),
                          },
                          "---",
                          { icon: FiTrash2, label: "Delete", action: () => setDeleteId(formDraft.id) },
                        ]}
                        onClose={() => setShowPanelMore(false)}
                      />
                    )}
                  </div>
                  <button className="hover:bg-grey-dark/15 rounded p-0.5 text-muted hover:text-default" onClick={closeForm}>
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
                <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-default">
                  {formDraft.short_description || <span className="font-normal italic text-muted">No description set</span>}
                </p>
              </div>

              {/* Panel actions */}
              <div className="border-grey-dark/15 bg-grey-light/30 flex shrink-0 items-center gap-2 border-b px-4 py-2 dark:bg-secondary-dark">
                <button
                  onClick={handleAssignToMe}
                  className="border-grey-dark/25 hover:bg-grey-dark/10 rounded border bg-primary-gradient px-3 py-1 text-xs font-medium text-default transition"
                >
                  Assign to me
                </button>
                <button
                  onClick={handleResolve}
                  disabled={formDraft.state === "Resolved" || formDraft.state === "Closed"}
                  className="border-grey-dark/25 hover:bg-grey-dark/10 rounded border bg-primary-gradient px-3 py-1 text-xs font-medium text-default transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resolve
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded bg-primary px-3 py-1 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>

              {/* Panel tabs */}
              <div className="border-grey-dark/15 flex shrink-0 overflow-x-auto border-b dark:border-gray-700 border-gray-300 bg-white no-scrollbar dark:bg-secondary-dark">
                {FORM_TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormTab(t)}
                    className={[
                      "shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-[11px] font-medium transition-colors",
                      formTab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-default",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Panel form */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {formTab === "Details" ? (
                  <div>
                    <div className="space-y-3 px-4 py-3">
                      {/* Section label */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted">Case</span>
                        <FiChevronUp className="text-muted/50 h-3.5 w-3.5" />
                      </div>

                      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                        <Field label="Number">
                          <input className={inp + " cursor-not-allowed opacity-60"} readOnly value={formDraft.id} />
                        </Field>
                        <Field label=" ">
                          <label className="mt-3.5 flex cursor-pointer items-center gap-1.5 text-[11px] text-muted">
                            <input type="checkbox" defaultChecked className="h-3 w-3 rounded accent-primary" />
                            Needs attention
                          </label>
                        </Field>
                        <Field label="Channel">
                          <input
                            className={inp}
                            value={formDraft.caller || ""}
                            onChange={(e) => upd("caller", e.target.value)}
                            placeholder="SMS"
                          />
                        </Field>
                        <Field label="Opened">
                          <input className={inp + " cursor-not-allowed opacity-60"} readOnly value={formDraft.opened} />
                        </Field>
                        <Field label="Account">
                          <input className={inp} readOnly placeholder="—" />
                        </Field>
                        <Field label="Priority">
                          <select className={inp} value={formDraft.priority} onChange={(e) => upd("priority", e.target.value)}>
                            {PRIORITIES.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Contact">
                          <input className={inp} readOnly placeholder="—" />
                        </Field>
                        <Field label="Assignment group">
                          <input
                            className={inp}
                            value={formDraft.assignment_group || ""}
                            onChange={(e) => upd("assignment_group", e.target.value)}
                          />
                        </Field>
                        <Field label="Product">
                          <input className={inp} readOnly placeholder="—" />
                        </Field>
                        <Field label="Assigned to">
                          <input
                            className={inp}
                            value={formDraft.assigned_to || ""}
                            onChange={(e) => upd("assigned_to", e.target.value)}
                          />
                        </Field>
                        <Field label="Asset">
                          <input className={inp} readOnly placeholder="—" />
                        </Field>
                        <Field label="Contract">
                          <input className={inp} readOnly placeholder="—" />
                        </Field>
                        <Field label="Partner Contact">
                          <input className={inp} readOnly placeholder="—" />
                        </Field>
                        <Field label="Entitlement">
                          <input className={inp} readOnly placeholder="—" />
                        </Field>
                      </div>

                      <div className="border-grey-dark/10 space-y-2.5 border-t pt-1">
                        <Field label="Short description">
                          <input
                            className={inp}
                            value={formDraft.short_description}
                            onChange={(e) => upd("short_description", e.target.value)}
                            placeholder="Brief summary…"
                          />
                        </Field>
                        <Field label="State">
                          <select className={inp} value={formDraft.state} onChange={(e) => upd("state", e.target.value)}>
                            {STATES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Category">
                          <select className={inp} value={formDraft.category} onChange={(e) => upd("category", e.target.value)}>
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Description">
                          <textarea
                            className={inp + " min-h-[72px] resize-y"}
                            rows={3}
                            value={formDraft.description}
                            onChange={(e) => upd("description", e.target.value)}
                            placeholder="Detailed description…"
                          />
                        </Field>
                      </div>
                    </div>

                    {/* Delete */}
                    {!isNew && (
                      <div className="border-grey-dark/10 border-t px-4 py-3">
                        <button
                          onClick={() => setDeleteId(formDraft.id)}
                          className="flex items-center gap-1.5 rounded border border-red-200/60 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800/30 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" /> Delete Incident
                        </button>
                      </div>
                    )}
                  </div>
                ) : formTab === "Work Orders" ? (
                  <WorkOrdersTab inc={formDraft} />
                ) : formTab === "SLAs" ? (
                  <SLAsTab inc={formDraft} />
                ) : formTab === "Tasks" ? (
                  <TasksTab inc={formDraft} />
                ) : formTab === "Interactions" ? (
                  <InteractionsTab inc={formDraft} />
                ) : formTab === "Emails" ? (
                  <EmailsTab inc={formDraft} />
                ) : formTab === "Task skills" ? (
                  <TaskSkillsTab inc={formDraft} />
                ) : null}
              </div>
            </div>
          )}

          {/* ── LIST / ALTERNATE PANEL ── */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* History View */}
            {activeView === "history" && (
              <>
                <div className="border-grey-dark/15 flex shrink-0 items-center border-b dark:border-gray-700 border-gray-300 bg-white px-4 py-2.5 dark:bg-secondary-dark">
                  <h2 className="text-[15px] font-bold text-default">History</h2>
                </div>
                <HistoryView incidents={incidents} openEdit={openEdit} />
              </>
            )}

            {/* Favorites View */}
            {activeView === "favorites" && (
              <>
                <div className="border-grey-dark/15 flex shrink-0 items-center border-b dark:border-gray-700 border-gray-300 bg-white px-4 py-2.5 dark:bg-secondary-dark">
                  <h2 className="text-[15px] font-bold text-default">Favorites</h2>
                </div>
                <FavoritesView
                  favorites={favorites}
                  incidents={incidents}
                  openEdit={openEdit}
                  removeFavorite={(id) => setFavorites((p) => p.filter((f) => f !== id))}
                />
              </>
            )}

            {/* Workspaces View */}
            {activeView === "workspaces" && (
              <>
                <div className="border-grey-dark/15 flex shrink-0 items-center border-b dark:border-gray-700 border-gray-300 bg-white px-4 py-2.5 dark:bg-secondary-dark">
                  <h2 className="text-[15px] font-bold text-default">Workspaces</h2>
                </div>
                <div className="flex-1 overflow-auto p-4 no-scrollbar">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      { name: "IT Support", icon: FiSettings, count: incidents.filter((i) => i.assignment_group === "IT Support").length },
                      { name: "Identity", icon: FiUser, count: incidents.filter((i) => i.assignment_group === "Identity").length },
                      { name: "All Incidents", icon: FiClipboard, count: incidents.length },
                      { name: "My Queue", icon: FiList, count: incidents.filter((i) => i.assigned_to === CURRENT_USER.name).length },
                      { name: "Critical", icon: FiAlertTriangle, count: incidents.filter((i) => i.priority === "1").length },
                      { name: "Unassigned", icon: FiAlertCircle, count: incidents.filter((i) => !i.assigned_to).length },
                    ].map((ws, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveView("incidents");
                          setExpandedNav("incidents");
                          setFilterMode("all");
                          setPage(1);
                        }}
                        className="flex flex-col items-center gap-2 rounded-lg border border-grey-dark/15 dark:border-gray-700 bg-white dark:bg-secondary-dark p-4 hover:bg-primary/5 transition-colors text-center"
                      >
                        <ws.icon className="h-6 w-6 text-primary" />
                        <span className="text-xs font-semibold text-default">{ws.name}</span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {ws.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Incidents View */}
            {activeView === "incidents" && (
              <>
                {/* List tabs */}
                <div className="border-grey-dark/15 flex shrink-0 gap-0.5 border-b dark:border-gray-700 border-gray-300 bg-white px-4 dark:bg-secondary-dark">
                  {["Lists", "My Lists"].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setListTab(t);
                        setPage(1);
                      }}
                      className={[
                        "whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                        listTab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-default",
                      ].join(" ")}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Toolbar */}
                <div className="border-grey-dark/15 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b dark:border-gray-700 border-gray-300 bg-white px-4 py-2.5 dark:bg-secondary-dark">
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="text-[15px] font-bold text-default">{listTab === "My Lists" ? "My Incidents" : "Incidents"}</h2>
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">{filtered.length}</span>
                    <span className="hidden text-[10px] text-muted sm:block">
                      Last refreshed{" "}
                      {lastRefresh.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {checked.length > 0 && (
                      <button
                        onClick={() => {
                          setIncidents((p) => p.filter((i) => !checked.includes(i.id)));
                          setChecked([]);
                          showToast(`Deleted ${checked.length} incident(s)`);
                        }}
                        className="flex items-center gap-1 rounded border border-red-200/60 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:border-red-800/30 dark:text-red-400"
                      >
                        <FiTrash2 className="h-3 w-3" /> Delete ({checked.length})
                      </button>
                    )}
                    {/* Mobile search */}
                    <div className="relative sm:hidden">
                      <FiSearch className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted" />
                      <input
                        placeholder="Search…"
                        className="border-gray-700 w-28 rounded border bg-primary-gradient py-1 pl-6 pr-2 text-xs focus:border-primary focus:outline-none"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                      />
                    </div>

                    {/* Filter */}
                    <div className="relative" ref={filterBtnRef}>
                      <button
                        onClick={() => {
                          setShowFilterPanel((v) => !v);
                          setShowColumnPanel(false);
                          setShowEditMenu(false);
                        }}
                        className={`border-gray-700 hover:bg-grey-dark/8 flex items-center gap-1 rounded border bg-primary-gradient px-2 py-1 text-xs text-muted transition hover:text-default ${
                          showFilterPanel || activeFilterCount > 0 ? "border-primary text-primary" : ""
                        }`}
                      >
                        <FiFilter className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Filter</span>
                        {activeFilterCount > 0 && (
                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-white">
                            {activeFilterCount}
                          </span>
                        )}
                      </button>
                      {showFilterPanel && (
                        <FilterPanel
                          filters={advFilters}
                          setFilters={(v) => {
                            setAdvFilters(v);
                            setPage(1);
                          }}
                          onClose={() => setShowFilterPanel(false)}
                        />
                      )}
                    </div>

                    {/* Refresh */}
                    <button
                      onClick={handleRefresh}
                      title="Refresh"
                      className="border-gray-700 hover:bg-grey-dark/8 flex items-center gap-1 rounded border bg-primary-gradient px-2 py-1 text-xs text-muted transition hover:text-default"
                    >
                      <FiRefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                      <span className="hidden md:inline">Refresh</span>
                    </button>

                    {/* Config (column visibility) */}
                    <div className="relative" ref={columnBtnRef}>
                      <button
                        onClick={() => {
                          setShowColumnPanel((v) => !v);
                          setShowFilterPanel(false);
                          setShowEditMenu(false);
                        }}
                        title="Config"
                        className={`border-gray-700 hover:bg-grey-dark/8 flex items-center gap-1 rounded border bg-primary-gradient px-2 py-1 text-xs text-muted transition hover:text-default ${
                          showColumnPanel ? "border-primary text-primary" : ""
                        }`}
                      >
                        <FiSettings className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Config</span>
                      </button>
                      {showColumnPanel && (
                        <ColumnPanel visibleCols={visibleCols} setVisibleCols={setVisibleCols} onClose={() => setShowColumnPanel(false)} />
                      )}
                    </div>

                    {/* Edit dropdown */}
                    <div className="relative" ref={editBtnRef}>
                      <button
                        onClick={() => {
                          setShowEditMenu((v) => !v);
                          setShowFilterPanel(false);
                          setShowColumnPanel(false);
                        }}
                        className={`border-grey-dark/20 hover:bg-grey-dark/8 flex items-center gap-1 rounded border bg-primary-gradient px-2 py-1 text-xs text-muted transition hover:text-default ${
                          showEditMenu ? "border-primary text-primary" : ""
                        }`}
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Edit</span>
                        <FiChevronDown className="h-3 w-3" />
                      </button>
                      {showEditMenu && (
                        <DropdownMenu
                          className="right-0 top-full"
                          items={[
                            { icon: FiDownload, label: "Export to CSV", action: handleExport },
                            { icon: FiColumns, label: "Manage columns", action: () => { setShowColumnPanel(true); setShowEditMenu(false); } },
                            "---",
                            checked.length > 0
                              ? {
                                  icon: FiCheck,
                                  label: `Mark ${checked.length} as Resolved`,
                                  action: () => {
                                    setIncidents((p) => p.map((i) => (checked.includes(i.id) ? { ...i, state: "Resolved" } : i)));
                                    setChecked([]);
                                    showToast(`${checked.length} incident(s) resolved`);
                                  },
                                }
                              : { icon: FiCheck, label: "Mark selected as Resolved", action: () => showToast("Select incidents first") },
                            {
                              icon: FiTrash2,
                              label: checked.length > 0 ? `Delete ${checked.length} selected` : "Delete selected",
                              action: () => {
                                if (checked.length) {
                                  setIncidents((p) => p.filter((i) => !checked.includes(i.id)));
                                  setChecked([]);
                                  showToast(`Deleted ${checked.length} incident(s)`);
                                } else showToast("Select incidents first");
                              },
                            },
                          ]}
                          onClose={() => setShowEditMenu(false)}
                        />
                      )}
                    </div>

                    <button
                      onClick={openNew}
                      className="flex items-center gap-1 rounded bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                    >
                      <FiPlus className="h-3.5 w-3.5" /> New
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto no-scrollbar">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-grey-dark/20 border-b dark:border-gray-700 border-gray-300 bg-white dark:bg-secondary-dark">
                        <th className="w-9 px-3 py-2.5">
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded accent-primary"
                            checked={allChk}
                            onChange={(e) => setChecked(e.target.checked ? pageData.map((i) => i.id) : [])}
                          />
                        </th>
                        {visibleCols.includes("id") && <TH col="id" label="Number" />}
                        {visibleCols.includes("opened") && <TH col="opened" label="Opened" />}
                        {visibleCols.includes("short_description") && <TH col="short_description" label="Short description" />}
                        {visibleCols.includes("caller") && <TH col="caller" label="Caller" />}
                        {visibleCols.includes("priority") && <TH col="priority" label="Priority" />}
                        {visibleCols.includes("state") && <TH col="state" label="Status" />}
                        {visibleCols.includes("category") && <TH col="category" label="Category" />}
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.map((inc, idx) => (
                        <tr
                          key={inc.id}
                          onClick={() => openEdit(inc)}
                          className={[
                            "border-grey-dark/10 cursor-pointer border-b dark:border-gray-700 border-gray-300 transition-colors",
                            formDraft?.id === inc.id ? "bg-primary/8 dark:bg-primary/15" : idx % 2 === 0 ? "hover:bg-primary/5 dark:hover:bg-primary/10 bg-white dark:bg-secondary-dark" : "bg-grey-light/25 dark:bg-secondary-dark/50 hover:bg-primary/5 dark:hover:bg-primary/10",
                          ].join(" ")}
                        >
                          <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="h-3.5 w-3.5 rounded accent-primary"
                              checked={checked.includes(inc.id)}
                              onChange={(e) =>
                                setChecked((p) => (e.target.checked ? [...p, inc.id] : p.filter((id) => id !== inc.id)))
                              }
                            />
                          </td>
                          {visibleCols.includes("id") && (
                            <td className="whitespace-nowrap px-3 py-2 text-xs font-bold text-primary-dark hover:underline">{inc.id}</td>
                          )}
                          {visibleCols.includes("opened") && (
                            <td className="whitespace-nowrap px-3 py-2 text-[12px] text-muted">{inc.opened}</td>
                          )}
                          {visibleCols.includes("short_description") && (
                            <td className="max-w-[180px] truncate px-3 py-2 text-sm text-default lg:max-w-[260px] xl:max-w-[340px]">
                              {inc.short_description}
                            </td>
                          )}
                          {visibleCols.includes("caller") && (
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-muted">{inc.caller}</td>
                          )}
                          {visibleCols.includes("priority") && (
                            <td className="px-3 py-2">
                              <PriorityBadge p={inc.priority} />
                            </td>
                          )}
                          {visibleCols.includes("state") && (
                            <td className="px-3 py-2">
                              <StateBadge s={inc.state} />
                            </td>
                          )}
                          {visibleCols.includes("category") && (
                            <td className="whitespace-nowrap px-3 py-2 text-sm text-muted">{inc.category}</td>
                          )}
                        </tr>
                      ))}
                      {pageData.length === 0 && (
                        <tr>
                          <td colSpan={visibleCols.length + 1} className="py-20 text-center text-sm text-muted">
                            No incidents match the current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="border-grey-dark/15 flex shrink-0 flex-wrap items-center justify-between gap-2 border-t dark:border-gray-700 border-gray-300 bg-white px-4 py-2 dark:bg-secondary-dark">
                  <span className="text-[12px] text-muted">
                    Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of{" "}
                    {filtered.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <PgBtn disabled={page === 1} onClick={() => setPage(1)}>
                      <FiChevronLeft className="h-4 w-4" />
                      <FiChevronLeft className="-ml-1.5 h-4 w-4" />
                    </PgBtn>
                    <PgBtn disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                      <FiChevronLeft className="h-4 w-4" />
                    </PgBtn>
                    {pageNums().map((p) => (
                      <PgBtn key={p} active={p === page} onClick={() => setPage(p)}>
                        {p}
                      </PgBtn>
                    ))}
                    <PgBtn disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                      <FiChevronRight className="h-4 w-4" />
                    </PgBtn>
                    <PgBtn disabled={page === totalPages} onClick={() => setPage(totalPages)}>
                      <FiChevronRight className="h-3 w-3" />
                      <FiChevronRight className="-ml-1.5 h-3 w-3" />
                    </PgBtn>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-muted">
                    <select
                      className="border-grey-dark/20 rounded border dark:border-gray-700 border-gray-300  bg-primary-gradient px-1.5 py-0.5 text-[11px] text-default focus:outline-none"
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(+e.target.value);
                        setPage(1);
                      }}
                    >
                      {[15, 25, 50, 100].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <span className="hidden sm:inline">Records per page</span>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* end list panel */}
        </main>
      </div>

      {/* ════════════ DELETE MODAL ════════════ */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4" onClick={() => setDeleteId(null)}>
          <div
            className="border-grey-dark/20 w-full max-w-sm rounded-lg border bg-white p-6 shadow-default dark:bg-secondary-dark"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
                <FiTrash2 className="h-4 w-4 text-red-500" />
              </div>
              <h3 className="text-sm font-bold text-default">Delete incident?</h3>
            </div>
            <p className="text-xs leading-relaxed text-muted">
              Incident <span className="font-semibold text-default">{deleteId}</span> will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="border-grey-dark/25 hover:bg-grey-dark/8 rounded border bg-primary-gradient px-4 py-1.5 text-xs font-medium text-default transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex items-center gap-1.5 rounded bg-red-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
              >
                <FiTrash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TOAST ════════════ */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}


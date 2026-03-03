import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowDown,
  FiArrowUp,
  FiCheckCircle,
  FiEye,
  FiLock,
  FiMinus,
  FiPause,
  FiPlay,
  FiPlus,
} from "react-icons/fi";
import type { ExerciseStep, Incident } from "./types";

export const STATES = [
  "To Do",
  "In Progress",
  "In Review",
  "On Hold",
  "Done",
  "Closed",
  "New",
] as const;

export const STATE_CONFIG: Record<
  string,
  { icon: IconType; className: string }
> = {
  "To Do": {
    icon: FiPlus,
    className:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/50",
  },
  New: {
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

export const PRIORITIES = [
  { value: "1", label: "Critical" },
  { value: "2", label: "High" },
  { value: "3", label: "Moderate" },
  { value: "4", label: "Low" },
] as const;

export const PRIORITY_CONFIG: Record<
  string,
  { icon: IconType; label: string; className: string }
> = {
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

export const initialIncidents: Incident[] = [
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

/** Guided exercise: 2 steps — (1) open form, (2) fill all content and save */
export const EXERCISE_STEPS: ExerciseStep[] = [
  { id: 1, label: 'Click the "To Do" button to create a new incident.' },
  {
    id: 2,
    label:
      "Fill up all the content below. Title and description are required; State, Priority, and Assigned to are optional. Then click Save.",
    validate: "all",
  },
];

export const MODULES = [
  { id: "incident", label: "Incident", icon: FiAlertCircle },
  { id: "change", label: "Change", icon: FiAlertCircle },
  { id: "problem", label: "Problem", icon: FiAlertCircle },
] as const;


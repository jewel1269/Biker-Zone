export type IncidentState =
  | "To Do"
  | "In Progress"
  | "In Review"
  | "On Hold"
  | "Done"
  | "Closed"
  | "New";

export type IncidentPriority = "1" | "2" | "3" | "4";

export type ServiceNowModule = "incident" | "change" | "problem";

export interface Incident {
  id: string;
  short_description: string;
  description: string;
  attachments: string[];
  state: IncidentState;
  priority: IncidentPriority;
  assigned_to: string;
  opened: string;
}

export interface ExerciseStep {
  id: number;
  label: string;
  validate?: "all";
}


import type { Incident } from "./types";

export function formatOpened() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

export function nextIncidentId(incidents: Incident[]) {
  const nums = incidents
    .map((i) => parseInt(i.id.replace(/\D/g, ""), 10))
    .filter(Boolean);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `INC001${String(next).padStart(4, "0")}`;
}


import type { MouseEvent } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import type { Incident } from "../types";
import PriorityBadge from "./PriorityBadge";
import StateBadge from "./StateBadge";

export default function IncidentsTable({
  incidents,
  selectedId,
  deletingIds,
  sortBy,
  sortDir,
  onToggleSort,
  onOpenForm,
  onRowContextMenu,
  emptyMessage,
}: {
  incidents: Incident[];
  selectedId: string | null;
  deletingIds: string[];
  sortBy: keyof Incident;
  sortDir: "asc" | "desc";
  onToggleSort: (column: keyof Incident) => void;
  onOpenForm: (incident: Incident) => void;
  onRowContextMenu: (e: MouseEvent, incident: Incident) => void;
  emptyMessage: string;
}) {
  return (
    <div
      className="rounded-lg border bina-border-grey-dark-40 bina-bg-default overflow-hidden"
      style={{ boxShadow: "var(--shadow-default)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bina-bg-secondary-dark-50 bina-text-default border-b bina-border-grey-dark-40">
              <th
                className="text-left py-2.5 px-3 font-medium cursor-pointer bina-th-hover transition-colors select-none"
                onClick={() => onToggleSort("id")}
              >
                <span className="inline-flex items-center gap-1">
                  Number{" "}
                  {sortBy === "id" &&
                    (sortDir === "asc" ? (
                      <FiChevronUp className="w-4 h-4 shrink-0" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 shrink-0" />
                    ))}
                </span>
              </th>
              <th className="text-left py-2.5 px-3 font-medium">Title</th>
              <th
                className="text-left py-2.5 px-3 font-medium cursor-pointer bina-th-hover transition-colors select-none"
                onClick={() => onToggleSort("state")}
              >
                <span className="inline-flex items-center gap-1">
                  State{" "}
                  {sortBy === "state" &&
                    (sortDir === "asc" ? (
                      <FiChevronUp className="w-4 h-4 shrink-0" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 shrink-0" />
                    ))}
                </span>
              </th>
              <th
                className="text-left py-2.5 px-3 font-medium cursor-pointer bina-th-hover transition-colors select-none"
                onClick={() => onToggleSort("priority")}
              >
                <span className="inline-flex items-center gap-1">
                  Priority{" "}
                  {sortBy === "priority" &&
                    (sortDir === "asc" ? (
                      <FiChevronUp className="w-4 h-4 shrink-0" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 shrink-0" />
                    ))}
                </span>
              </th>
              <th className="text-left py-2.5 px-3 font-medium">Assigned to</th>
              <th
                className="text-left py-2.5 px-3 font-medium cursor-pointer bina-th-hover transition-colors select-none"
                onClick={() => onToggleSort("opened")}
              >
                <span className="inline-flex items-center gap-1">
                  Opened{" "}
                  {sortBy === "opened" &&
                    (sortDir === "asc" ? (
                      <FiChevronUp className="w-4 h-4 shrink-0" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 shrink-0" />
                    ))}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc) => {
              const isDeleting = deletingIds.includes(inc.id);
              return (
                <tr
                  key={inc.id}
                  onClick={() => !isDeleting && onOpenForm(inc)}
                  onContextMenu={(e) =>
                    !isDeleting && onRowContextMenu(e, inc)
                  }
                  className={`border-b bina-border-grey-dark-20 cursor-pointer transition-all duration-200 ease-out bina-row-hover ${
                    selectedId === inc.id ? "bina-bg-primary-light-50" : ""
                  } ${
                    isDeleting ? "opacity-0 pointer-events-none -translate-x-4" : ""
                  }`}
                >
                  <td
                    className="py-2 px-3 font-medium"
                    style={{ color: "var(--primary-dark)" }}
                  >
                    {inc.id}
                  </td>
                  <td className="py-2 px-3 bina-text-default max-w-[220px] truncate">
                    {inc.short_description}
                  </td>
                  <td className="py-2 px-3">
                    <StateBadge state={inc.state} />
                  </td>
                  <td className="py-2 px-3">
                    <PriorityBadge priority={inc.priority} />
                  </td>
                  <td className="py-2 px-3 bina-text-muted">
                    {inc.assigned_to || "—"}
                  </td>
                  <td className="py-2 px-3 bina-text-muted">{inc.opened}</td>
                </tr>
              );
            })}
            {incidents.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center bina-text-muted text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


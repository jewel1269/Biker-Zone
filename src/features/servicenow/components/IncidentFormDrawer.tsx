import { FiLoader, FiTrash2, FiX } from "react-icons/fi";
import { PRIORITIES, STATES } from "../constants";
import { btnPrimary, btnSecondary } from "../styles";
import type { Incident } from "../types";

export default function IncidentFormDrawer({
  formDraft,
  isNewIncident,
  formPanelOpen,
  saving,
  disableSave,
  exerciseBannerText,
  onCancel,
  onSave,
  onUpdateDraft,
  onRequestDelete,
}: {
  formDraft: Incident;
  isNewIncident: boolean;
  formPanelOpen: boolean;
  saving: boolean;
  disableSave: boolean;
  exerciseBannerText?: string;
  onCancel: () => void;
  onSave: () => void;
  onUpdateDraft: <K extends keyof Incident>(field: K, value: Incident[K]) => void;
  onRequestDelete?: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black transition-opacity duration-300 ease-out"
        style={{ opacity: formPanelOpen ? 0.4 : 0 }}
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
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
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bina-border-grey-dark-40 bina-bg-secondary-dark-30">
          <h3 id="incident-form-title" className="font-semibold bina-text-default">
            {isNewIncident ? "New Incident" : `Incident: ${formDraft.id}`}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg bina-hover-bg-grey-dark-20 bina-text-default transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {exerciseBannerText && (
          <div
            className="mx-4 mt-3 p-3 rounded-lg border-2 flex flex-wrap items-center justify-between gap-3"
            style={{
              borderColor: "var(--primary)",
              backgroundColor: "color-mix(in srgb, var(--primary-light) 20%, transparent)",
            }}
          >
            <p className="text-sm font-medium bina-text-default">
              {exerciseBannerText}
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium bina-text-default mb-1">
              Number
            </label>
            <input
              type="text"
              value={formDraft.id}
              readOnly
              className="w-full px-3 py-2 rounded border bina-border-grey-dark bina-bg-grey-dark-10 bina-text-muted text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium bina-text-default mb-1">
              Title
            </label>
            <input
              type="text"
              value={formDraft.short_description}
              onChange={(e) => onUpdateDraft("short_description", e.target.value)}
              placeholder="Brief title for the incident"
              className="w-full px-3 py-2 rounded border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium bina-text-default mb-1">
              Description
            </label>
            <textarea
              value={formDraft.description ?? ""}
              onChange={(e) => onUpdateDraft("description", e.target.value)}
              placeholder="Add details, steps to reproduce..."
              rows={4}
              className="w-full px-3 py-2 rounded border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y min-h-[80px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium bina-text-default mb-1">
              State (optional)
            </label>
            <select
              value={formDraft.state}
              onChange={(e) => onUpdateDraft("state", e.target.value as Incident["state"])}
              className="w-full px-3 py-2 rounded border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium bina-text-default mb-1">
              Priority (optional)
            </label>
            <select
              value={formDraft.priority}
              onChange={(e) =>
                onUpdateDraft("priority", e.target.value as Incident["priority"])
              }
              className="w-full px-3 py-2 rounded border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium bina-text-default mb-1">
              Assigned to (optional)
            </label>
            <input
              type="text"
              value={formDraft.assigned_to}
              onChange={(e) => onUpdateDraft("assigned_to", e.target.value)}
              placeholder="Enter name"
              className="w-full px-3 py-2 rounded border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium bina-text-default mb-1">
              Opened
            </label>
            <input
              type="text"
              value={formDraft.opened}
              readOnly
              className="w-full px-3 py-2 rounded border bina-border-grey-dark bina-bg-grey-dark-10 bina-text-muted text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t bina-border-grey-dark-40 bina-bg-secondary-dark-20">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || disableSave}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm transition-all duration-200 ${btnPrimary} ${
                saving || disableSave ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {saving ? (
                <>
                  <FiLoader className="w-4 h-4 shrink-0 animate-spin" aria-hidden />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className={`px-4 py-2 text-sm ${btnSecondary} ${
                saving ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              Cancel
            </button>
          </div>

          {!isNewIncident && onRequestDelete && (
            <button
              type="button"
              onClick={onRequestDelete}
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
  );
}


import { FiTrash2 } from "react-icons/fi";

export default function DeleteConfirmModal({
  incidentId,
  onCancel,
  onConfirm,
}: {
  incidentId: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-[70] transition-opacity duration-200"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
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
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: "var(--secondary-dark)",
              color: "var(--primary-dark)",
            }}
          >
            <FiTrash2 className="w-5 h-5" aria-hidden />
          </div>
          <h2
            id="delete-modal-title"
            className="text-lg font-semibold"
            style={{ color: "var(--text-default)" }}
          >
            Delete incident?
          </h2>
        </div>
        <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
          Incident <strong>{incidentId}</strong> will be permanently removed.
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
            style={{
              borderColor: "var(--grey-dark)",
              backgroundColor: "var(--bg-default)",
              color: "var(--text-default)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
            style={{
              borderColor: "var(--primary-dark)",
              backgroundColor: "var(--primary)",
              color: "var(--text-default)",
            }}
          >
            <FiTrash2 className="w-4 h-4 shrink-0" aria-hidden />
            Delete
          </button>
        </div>
      </div>
    </>
  );
}


import { FiCheckCircle } from "react-icons/fi";

export default function ExerciseCompletionBanner({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  return (
    <div
      className="mb-4 p-4 rounded-xl border-2 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
      style={{
        borderColor: "var(--primary)",
        backgroundColor: "color-mix(in srgb, var(--primary-light) 30%, transparent)",
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
            You&apos;ve created an incident. Try creating another or explore the
            list.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg border bina-border-grey-dark-40 bina-bg-default bina-text-default hover:opacity-90 transition-opacity"
        aria-label="Dismiss"
      >
        Dismiss
      </button>
    </div>
  );
}


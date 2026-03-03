import { FiBook } from "react-icons/fi";

export default function ExerciseStep1Banner({
  stepLabel,
  onExit,
}: {
  stepLabel: string;
  onExit: () => void;
}) {
  return (
    <div
      className="mb-4 p-4 rounded-xl border-2 flex flex-wrap items-center justify-between gap-3"
      style={{
        borderColor: "var(--primary)",
        backgroundColor: "color-mix(in srgb, var(--primary-light) 25%, transparent)",
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
          <p className="font-medium bina-text-default">{stepLabel}</p>
          <p className="text-sm bina-text-muted mt-0.5">
            Click the <strong>To Do</strong> button above to open the new
            incident form.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onExit}
        className="text-sm bina-text-muted hover:bina-text-default underline transition-colors"
        aria-label="Exit exercise"
      >
        Exit exercise
      </button>
    </div>
  );
}


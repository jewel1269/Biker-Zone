import { FiBook, FiPlus } from "react-icons/fi";
import { STATES } from "../constants";
import { btnPrimary } from "../styles";

export default function IncidentsToolbar({
  filterState,
  onFilterStateChange,
  exerciseActive,
  onOpenNew,
  onStartExercise,
}: {
  filterState: string;
  onFilterStateChange: (next: string) => void;
  exerciseActive: boolean;
  onOpenNew: () => void;
  onStartExercise: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenNew}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm ${btnPrimary}`}
        >
          <FiPlus className="w-4 h-4 shrink-0" aria-hidden />
          To Do
        </button>
        {!exerciseActive && (
          <button
            type="button"
            onClick={onStartExercise}
            className="btn-start-exercise inline-flex items-center gap-2 px-4 py-2 text-sm rounded-xl border-2 font-medium transition-all duration-200 border-[var(--primary)] bg-[var(--primary)] text-[var(--bg-default)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            aria-label="Start guided exercise"
          >
            <FiBook className="w-4 h-4 shrink-0" aria-hidden />
            Start Exercise
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <label className="text-sm bina-text-muted">State:</label>
        <select
          value={filterState}
          onChange={(e) => onFilterStateChange(e.target.value)}
          className="text-sm rounded border bina-border-grey-dark bina-bg-default bina-text-default px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">All</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}


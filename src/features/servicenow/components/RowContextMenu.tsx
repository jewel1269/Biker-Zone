import { FiTrash2 } from "react-icons/fi";

export default function RowContextMenu({
  x,
  y,
  onDelete,
  onRequestClose,
}: {
  x: number;
  y: number;
  onDelete: () => void;
  onRequestClose: () => void;
}) {
  return (
    <div
      className="fixed z-[60] min-w-[140px] rounded-lg border bina-border-grey-dark-40 bina-bg-default shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.key === "Escape" && onRequestClose()}
      role="menu"
    >
      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
      >
        <FiTrash2 className="w-4 h-4 shrink-0" aria-hidden />
        Delete
      </button>
    </div>
  );
}


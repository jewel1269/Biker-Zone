import { FiSearch, FiUser } from "react-icons/fi";

export default function ServiceNowHeader({
  searchQuery,
  onSearchQueryChange,
}: {
  searchQuery: string;
  onSearchQueryChange: (next: string) => void;
}) {
  return (
    <header
      className="flex items-center justify-between h-14 px-4 bina-bg-secondary-dark bina-text-default border-b bina-border-grey-dark-30"
      style={{ boxShadow: "var(--shadow-default)" }}
    >
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-lg tracking-tight">ServiceNow Labs</h1>
        <span className="text-sm bina-text-muted border-l bina-border-grey-dark-50 pl-3">
          Training instance
        </span>
      </div>

      <div className="flex-1 max-w-md mx-6 relative">
        <FiSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 bina-text-muted pointer-events-none"
          aria-hidden
        />
        <input
          type="text"
          placeholder="Search incidents..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bina-border-grey-dark bina-bg-default bina-text-default focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-shadow"
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <FiUser className="w-4 h-4 bina-text-muted" aria-hidden />
        <span>Lab User</span>
      </div>
    </header>
  );
}


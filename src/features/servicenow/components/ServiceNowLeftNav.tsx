import { FiAlertCircle, FiClipboard, FiRefreshCw } from "react-icons/fi";
import type { ServiceNowModule } from "../types";

export default function ServiceNowLeftNav({
  activeModule,
  onChangeModule,
}: {
  activeModule: ServiceNowModule;
  onChangeModule: (m: ServiceNowModule) => void;
}) {
  return (
    <aside className="w-[4.5rem] flex-shrink-0 bina-bg-secondary-dark border-r bina-border-grey-dark-30 bina-text-muted">
      <nav className="py-3 flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onChangeModule("incident")}
          className={`w-full flex flex-col items-center gap-1 py-3 text-xs border-l-2 border-transparent focus:outline-none focus:ring-0 transition-colors ${
            activeModule === "incident"
              ? "border-[var(--primary)] bina-bg-primary-light-30 bina-text-default"
              : "bina-hover-bg-grey-dark-20 bina-hover-text-default"
          }`}
        >
          <FiClipboard className="w-5 h-5 shrink-0" aria-hidden />
          <span>Incident</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeModule("change")}
          className={`w-full flex flex-col items-center gap-1 py-3 text-xs border-l-2 border-transparent focus:outline-none focus:ring-0 transition-colors ${
            activeModule === "change"
              ? "border-[var(--primary)] bina-bg-primary-light-30 bina-text-default"
              : "bina-hover-bg-grey-dark-20 bina-hover-text-default"
          }`}
        >
          <FiRefreshCw className="w-5 h-5 shrink-0" aria-hidden />
          <span>Change</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeModule("problem")}
          className={`w-full flex flex-col items-center gap-1 py-3 text-xs border-l-2 border-transparent focus:outline-none focus:ring-0 transition-colors ${
            activeModule === "problem"
              ? "border-[var(--primary)] bina-bg-primary-light-30 bina-text-default"
              : "bina-hover-bg-grey-dark-20 bina-hover-text-default"
          }`}
        >
          <FiAlertCircle className="w-5 h-5 shrink-0" aria-hidden />
          <span>Problem</span>
        </button>
      </nav>
    </aside>
  );
}


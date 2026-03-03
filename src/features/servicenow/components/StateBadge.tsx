import { STATE_CONFIG } from "../constants";

export default function StateBadge({ state }: { state: string }) {
  const config = STATE_CONFIG[state] || STATE_CONFIG["To Do"];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {state}
    </span>
  );
}


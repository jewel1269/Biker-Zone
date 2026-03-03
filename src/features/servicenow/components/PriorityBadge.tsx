import { PRIORITY_CONFIG } from "../constants";

export default function PriorityBadge({ priority }: { priority: string }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["3"];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {config.label}
    </span>
  );
}


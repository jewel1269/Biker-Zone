import type { ServiceNowModule } from "../types";

export default function ModuleUnavailableBanner({
  activeModule,
}: {
  activeModule: ServiceNowModule;
}) {
  if (activeModule === "incident") return null;
  return (
    <div className="mb-4 p-4 rounded-lg border bina-border-primary bina-bg-primary-light-20 bina-text-default animate-in fade-in slide-in-from-bottom-2 duration-200">
      <p className="font-medium">
        {activeModule === "change" ? "Change" : "Problem"} Management
      </p>
      <p className="text-sm bina-text-muted mt-1">
        This module is available in the full ServiceNow lab. Switch to{" "}
        <strong>Incident</strong> in the left menu to create and manage
        incidents here.
      </p>
    </div>
  );
}


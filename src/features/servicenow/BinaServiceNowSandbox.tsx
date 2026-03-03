import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { EXERCISE_STEPS, initialIncidents } from "./constants";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import ExerciseCompletionBanner from "./components/ExerciseCompletionBanner";
import ExerciseStep1Banner from "./components/ExerciseStep1Banner";
import IncidentFormDrawer from "./components/IncidentFormDrawer";
import IncidentsTable from "./components/IncidentsTable";
import IncidentsToolbar from "./components/IncidentsToolbar";
import ModuleUnavailableBanner from "./components/ModuleUnavailableBanner";
import RowContextMenu from "./components/RowContextMenu";
import ServiceNowHeader from "./components/ServiceNowHeader";
import ServiceNowLeftNav from "./components/ServiceNowLeftNav";
import { SANDBOX_STYLES } from "./styles";
import type { Incident, ServiceNowModule } from "./types";
import { formatOpened, nextIncidentId } from "./utils";

type ContextMenuState = { incidentId: string; x: number; y: number } | null;

export default function BinaServiceNowSandbox() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formDraft, setFormDraft] = useState<Incident | null>(null);
  const [filterState, setFilterState] = useState("");
  const [sortBy, setSortBy] = useState<keyof Incident>("opened");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModule, setActiveModule] =
    useState<ServiceNowModule>("incident");
  const [formPanelOpen, setFormPanelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [exerciseActive, setExerciseActive] = useState(false);
  const [exerciseStep, setExerciseStep] = useState(1);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);

  const closeTimeoutRef = useRef<number | null>(null);

  const isNewIncident = !!formDraft && !selectedId;
  const currentStepConfig = EXERCISE_STEPS.find((s) => s.id === exerciseStep);

  const isStepValid = useMemo(() => {
    if (!formDraft || !currentStepConfig?.validate) return true;
    if (currentStepConfig.validate === "all") {
      return (
        String(formDraft.short_description ?? "").trim().length > 0 &&
        String(formDraft.description ?? "").trim().length > 0
      );
    }
    return true;
  }, [formDraft, currentStepConfig]);

  const startExercise = () => {
    setExerciseActive(true);
    setExerciseStep(1);
    setExerciseCompleted(false);
  };

  const exitExercise = () => {
    setExerciseActive(false);
    setExerciseStep(1);
    setExerciseCompleted(false);
  };

  // Animate sidebar in when form opens
  useEffect(() => {
    if (formDraft) {
      const id = requestAnimationFrame(() => setFormPanelOpen(true));
      return () => cancelAnimationFrame(id);
    }
    setFormPanelOpen(false);
  }, [formDraft]);

  // Clear close timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Close context menu on click outside or Escape
  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("click", close);
    document.addEventListener("contextmenu", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("contextmenu", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [contextMenu]);

  // Delete animation: after delay remove incidents and clear deletingIds
  useEffect(() => {
    if (deletingIds.length === 0) return;
    const idsToRemove = [...deletingIds];
    const t = window.setTimeout(() => {
      setIncidents((prev) => prev.filter((i) => !idsToRemove.includes(i.id)));
      setDeletingIds([]);
    }, 260);
    return () => window.clearTimeout(t);
  }, [deletingIds]);

  const filteredAndSorted = useMemo(() => {
    let list = filterState
      ? incidents.filter((i) => i.state === filterState)
      : [...incidents];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (i) =>
          (i.id && i.id.toLowerCase().includes(q)) ||
          (i.short_description &&
            i.short_description.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.assigned_to && i.assigned_to.toLowerCase().includes(q)) ||
          (i.state && i.state.toLowerCase().includes(q)),
      );
    }

    list = [...list].sort((a, b) => {
      const aVal = a[sortBy] ?? "";
      const bVal = b[sortBy] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [incidents, filterState, sortBy, sortDir, searchQuery]);

  const openForm = (incident: Incident) => {
    setSelectedId(incident.id);
    setFormDraft({
      ...incident,
      description: incident.description ?? "",
    });
  };

  const openFormForNew = () => {
    setSelectedId(null);
    setFormDraft({
      id: nextIncidentId(incidents),
      short_description: "",
      description: "",
      attachments: [],
      state: "To Do",
      priority: "3",
      assigned_to: "",
      opened: formatOpened(),
    });
    if (exerciseActive && exerciseStep === 1) setExerciseStep(2);
  };

  const closeForm = () => {
    setSelectedId(null);
    setFormDraft(null);
  };

  const handleSave = () => {
    if (!formDraft || saving) return;
    if (exerciseActive && exerciseStep === 2 && isNewIncident) {
      setExerciseCompleted(true);
      setExerciseActive(false);
      setExerciseStep(1);
    }
    setSaving(true);
    const toSave: Incident = {
      ...formDraft,
      description: formDraft.description ?? "",
      attachments: [],
    };
    if (isNewIncident) {
      setIncidents((prev) => [...prev, toSave]);
    } else {
      setIncidents((prev) => prev.map((i) => (i.id === formDraft.id ? toSave : i)));
    }
    window.setTimeout(() => {
      setSaving(false);
      closeForm();
    }, 600);
  };

  const handleCancel = () => {
    if (exerciseActive && formDraft) setExerciseStep(1);
    setFormPanelOpen(false);
    if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = window.setTimeout(() => closeForm(), 280);
  };

  const updateDraft = <K extends keyof Incident>(field: K, value: Incident[K]) => {
    setFormDraft((d) => (d ? { ...d, [field]: value } : null));
  };

  const toggleSort = (column: keyof Incident) => {
    if (sortBy === column) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else setSortBy(column);
  };

  const handleRowContextMenu = (e: MouseEvent, incident: Incident) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ incidentId: incident.id, x: e.clientX, y: e.clientY });
  };

  const openDeleteModal = (incidentId: string) => {
    setContextMenu(null);
    setDeleteConfirmId(incidentId);
  };

  const closeDeleteModal = () => setDeleteConfirmId(null);

  const handleDeleteIncident = (incidentId: string) => {
    setDeleteConfirmId(null);
    setDeletingIds((prev) =>
      prev.includes(incidentId) ? prev : [...prev, incidentId],
    );
    if (selectedId === incidentId) handleCancel();
  };

  const emptyMessage =
    searchQuery || filterState
      ? "No incidents match your filters."
      : "No incidents yet. Click To Do to create one.";

  const step1Label = `Step ${exerciseStep} of 2: ${currentStepConfig?.label ?? ""}`;
  const formExerciseBannerText =
    exerciseActive && formDraft && currentStepConfig
      ? `Step ${exerciseStep} of 2: ${currentStepConfig.label}`
      : undefined;

  return (
    <div className="servicenow-sandbox min-h-screen flex flex-col bina-bg-default bina-text-default font-sans">
      <style dangerouslySetInnerHTML={{ __html: SANDBOX_STYLES }} />

      <ServiceNowHeader
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <div className="flex flex-1 min-h-0">
        <ServiceNowLeftNav
          activeModule={activeModule}
          onChangeModule={setActiveModule}
        />

        <main className="flex-1 overflow-auto bina-bg-default flex flex-col">
          <div
            className="bina-bg-primary-light-60 px-4 py-2.5 text-sm border-b bina-border-grey-dark-20 font-medium"
            style={{ color: "var(--primary-dark)" }}
          >
            Training environment – changes are not saved to production.
          </div>

          <div className="p-4 md:p-6 flex-1">
            <h2 className="text-xl font-semibold bina-text-default mb-4">
              Incidents
            </h2>

            {exerciseCompleted && (
              <ExerciseCompletionBanner
                onDismiss={() => setExerciseCompleted(false)}
              />
            )}

            <IncidentsToolbar
              filterState={filterState}
              onFilterStateChange={setFilterState}
              exerciseActive={exerciseActive}
              onOpenNew={openFormForNew}
              onStartExercise={startExercise}
            />

            <p className="bina-text-muted text-sm mb-4">
              Click <strong>To Do</strong> to create an incident, or click a row
              to edit. Right-click (or two-finger click) a row for options such
              as <strong>Delete</strong>. Use the search bar or State filter to
              narrow results.
            </p>

            {exerciseActive && exerciseStep === 1 && !formDraft && (
              <ExerciseStep1Banner stepLabel={step1Label} onExit={exitExercise} />
            )}

            <ModuleUnavailableBanner activeModule={activeModule} />

            {activeModule === "incident" && (
              <IncidentsTable
                incidents={filteredAndSorted}
                selectedId={selectedId}
                deletingIds={deletingIds}
                sortBy={sortBy}
                sortDir={sortDir}
                onToggleSort={toggleSort}
                onOpenForm={openForm}
                onRowContextMenu={handleRowContextMenu}
                emptyMessage={emptyMessage}
              />
            )}
          </div>
        </main>
      </div>

      {contextMenu && (
        <RowContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRequestClose={() => setContextMenu(null)}
          onDelete={() => openDeleteModal(contextMenu.incidentId)}
        />
      )}

      {deleteConfirmId && (
        <DeleteConfirmModal
          incidentId={deleteConfirmId}
          onCancel={closeDeleteModal}
          onConfirm={() => handleDeleteIncident(deleteConfirmId)}
        />
      )}

      {formDraft && (
        <IncidentFormDrawer
          formDraft={formDraft}
          isNewIncident={isNewIncident}
          formPanelOpen={formPanelOpen}
          saving={saving}
          disableSave={exerciseActive && exerciseStep === 2 && !isStepValid}
          exerciseBannerText={formExerciseBannerText}
          onCancel={handleCancel}
          onSave={handleSave}
          onUpdateDraft={updateDraft}
          onRequestDelete={
            !isNewIncident ? () => formDraft?.id && openDeleteModal(formDraft.id) : undefined
          }
        />
      )}
    </div>
  );
}


import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { AppShell } from "~/components/layout/AppShell";
import { EmptyRoutines } from "~/components/routines/EmptyRoutines";
import { RoutineCard } from "~/components/routines/RoutineCard";
import { RoutineEditorModal } from "~/components/routines/RoutineEditorModal";
import { Banner } from "~/components/ui/Banner";
import { Spinner } from "~/components/ui/Spinner";
import { useStore } from "~/context/StoreContext";
import { useCustomExercises } from "~/hooks/useCustomExercises";
import { useRoutines } from "~/hooks/useRoutines";
import { errorMessage } from "~/lib/errors";
import { addRoutineToWorkout, emptyWorkout } from "~/lib/workout";
import type { Routine } from "~/types/workout";

export const Route = createFileRoute("/routines/")({
  component: RoutinesPage,
});

function RoutinesPage() {
  return (
    <AuthGuard>
      <AppShell>
        <RoutinesDashboard />
      </AppShell>
    </AuthGuard>
  );
}

function RoutinesDashboard() {
  const { store, unit } = useStore();
  const navigate = useNavigate();

  const { routines, loading, error, setError, refresh } = useRoutines();
  const { customExercises } = useCustomExercises();

  // The editor modal: closed, or open for a new routine (null) or an existing one
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  function openEditor(routine: Routine | null) {
    setEditingRoutine(routine);
    setEditorOpen(true);
  }

  async function deleteRoutine(routineId: string) {
    if (!store) return;
    if (!window.confirm("Are you sure you want to delete this routine template?")) {
      return;
    }
    try {
      await store.deleteRoutine(routineId);
      await refresh();
    } catch (err) {
      setError(errorMessage(err, "Failed to delete routine."));
    }
  }

  async function startWorkout(routine: Routine) {
    if (!store) return;
    try {
      // Add to the workout in progress, or start a new one
      const active = (await store.getActiveWorkout()) ?? emptyWorkout();
      await store.saveWorkout(addRoutineToWorkout(active, routine, unit));
      void navigate({ to: "/" });
    } catch (err) {
      setError(errorMessage(err, "Could not start workout."));
    }
  }

  return (
    <div className="space-y-5 pb-20">
      {/* Header & Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-100">Routines</h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            Workout templates to quick-start your sessions
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor(null)}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 text-xs font-bold text-neutral-950 transition-colors hover:bg-lime-300 active:scale-95"
        >
          <span>+ New Routine</span>
        </button>
      </div>

      {error ? <Banner tone="error">{error}</Banner> : null}

      {loading ? (
        <Spinner label="Loading routines…" />
      ) : routines.length === 0 ? (
        <EmptyRoutines onCreate={() => openEditor(null)} />
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              customExercises={customExercises}
              onEdit={() => openEditor(routine)}
              onDelete={() => void deleteRoutine(routine.id)}
              onStart={() => void startWorkout(routine)}
            />
          ))}
        </div>
      )}

      {editorOpen ? (
        <RoutineEditorModal
          routine={editingRoutine}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            setEditorOpen(false);
            void refresh();
          }}
        />
      ) : null}
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { AppShell } from "~/components/layout/AppShell";
import { Banner } from "~/components/ui/Banner";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Field } from "~/components/ui/Input";
import { Modal } from "~/components/ui/Modal";
import { Spinner } from "~/components/ui/Spinner";
import { ExercisePickerModal } from "~/components/workout/ExercisePickerModal";
import { useStore } from "~/context/StoreContext";
import type { Exercise, Routine, RoutineExercise } from "~/types/workout";
import { newId, routineSeedSets } from "~/types/workout";

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

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState("");
  const [routineDesc, setRoutineDesc] = useState("");
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!store) return;
    setLoading(true);
    try {
      const [routineList, customList] = await Promise.all([
        store.listRoutines(),
        store.listCustomExercises(),
      ]);
      setRoutines(routineList);
      setCustomExercises(customList);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load routines.");
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleOpenCreate() {
    setEditingRoutineId(null);
    setRoutineName("");
    setRoutineDesc("");
    setRoutineExercises([]);
    setFormError(null);
    setEditorOpen(true);
  }

  function handleOpenEdit(routine: Routine) {
    setEditingRoutineId(routine.id);
    setRoutineName(routine.name);
    setRoutineDesc(routine.description || "");
    setRoutineExercises([...routine.exercises]);
    setFormError(null);
    setEditorOpen(true);
  }

  function handleAddExercise(exercise: Exercise) {
    // Default 3 sets
    setRoutineExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        targetSets: 3,
      },
    ]);
  }

  function handleRemoveExercise(index: number) {
    setRoutineExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function handleUpdateSets(index: number, delta: number) {
    setRoutineExercises((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const nextSets = Math.max(1, Math.min(10, item.targetSets + delta));
        return { ...item, targetSets: nextSets };
      }),
    );
  }

  async function handleSaveRoutine() {
    if (!routineName.trim()) {
      setFormError("Please enter a routine name.");
      return;
    }
    if (routineExercises.length === 0) {
      setFormError("Please add at least one exercise to the routine.");
      return;
    }
    if (!store) return;

    setSaving(true);
    setFormError(null);
    try {
      const routine: Routine = {
        id: editingRoutineId ?? newId(),
        name: routineName.trim(),
        description: routineDesc.trim() || undefined,
        exercises: routineExercises,
        createdAt: Date.now(),
      };
      await store.saveRoutine(routine);
      setEditorOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save routine.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRoutine(routineId: string) {
    if (!store) return;
    if (!window.confirm("Are you sure you want to delete this routine template?")) {
      return;
    }
    try {
      await store.deleteRoutine(routineId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete routine.");
    }
  }

  function handleStartWorkoutFromRoutine(routine: Routine) {
    const newWorkout = {
      id: newId(),
      startedAt: Date.now(),
      finishedAt: null,
      note: `Routine: ${routine.name}`,
      sets: routineSeedSets(routine, unit),
    };

    try {
      sessionStorage.setItem("replog_active_draft", JSON.stringify(newWorkout));
    } catch {
      // ignore storage failure
    }

    void navigate({ to: "/" });
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
          onClick={handleOpenCreate}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 text-xs font-bold text-neutral-950 transition-colors hover:bg-lime-300 active:scale-95"
        >
          <span>+ New Routine</span>
        </button>
      </div>

      {error ? <Banner tone="error">{error}</Banner> : null}

      {/* Routine List */}
      {loading ? (
        <Spinner label="Loading routines…" />
      ) : routines.length === 0 ? (
        <Card className="py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-lime-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
              <path d="M12 11v6m-3-3h6" />
            </svg>
          </div>
          <p className="text-base font-semibold text-neutral-200">No workout routines yet</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-neutral-400">
            Build your favorite Push, Pull, Leg, or Full-body split routine templates and jump straight into training.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center rounded-xl bg-neutral-800 px-4 py-2 text-xs font-semibold text-lime-400 hover:bg-neutral-700"
          >
            Create your first routine
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => {
            const exerciseCount = routine.exercises.length;
            const totalSets = routine.exercises.reduce((sum, e) => sum + e.targetSets, 0);

            return (
              <div
                key={routine.id}
                className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-sm transition-all hover:border-neutral-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-base font-bold text-neutral-100">
                        {routine.name}
                      </h2>
                      <span className="rounded-md bg-neutral-800/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
                        {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"} · {totalSets} sets
                      </span>
                    </div>
                    {routine.description ? (
                      <p className="mt-1 text-xs text-neutral-400 line-clamp-1">
                        {routine.description}
                      </p>
                    ) : null}
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(routine)}
                      aria-label="Edit routine"
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteRoutine(routine.id)}
                      aria-label="Delete routine"
                      className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-950/30 hover:text-red-400"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Exercise Pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {routine.exercises.map((item, idx) => {
                    const custom = customExercises.find((c) => c.id === item.exerciseId);
                    return (
                      <span
                        key={`${item.exerciseId}-${idx}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800/80 bg-neutral-950/60 px-2 py-1 text-[11px] text-neutral-300"
                      >
                        <span>{item.exerciseName}</span>
                        <span className="font-semibold text-lime-400">×{item.targetSets}</span>
                        {custom?.videoUrl ? (
                          <a
                            href={custom.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Open video reference"
                            className="text-lime-400 hover:text-lime-300"
                          >
                            ▶
                          </a>
                        ) : null}
                      </span>
                    );
                  })}
                </div>

                {/* Start Workout Button */}
                <div className="mt-4 pt-3 border-t border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => handleStartWorkoutFromRoutine(routine)}
                    className="flex w-full min-h-[38px] items-center justify-center gap-2 rounded-xl bg-lime-400/10 border border-lime-400/30 px-4 text-xs font-bold text-lime-400 transition-all hover:bg-lime-400 hover:text-neutral-950 active:scale-[0.99]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Start Workout with this Routine</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Routine Creator / Editor Modal */}
      {editorOpen ? (
        <Modal
          title={editingRoutineId ? "Edit Routine" : "New Routine"}
          onClose={() => setEditorOpen(false)}
        >
          <div className="space-y-4">
            {formError ? <Banner tone="error">{formError}</Banner> : null}

            <Field
              label="Routine Name"
              value={routineName}
              onChange={setRoutineName}
              placeholder="e.g. Chest & Triceps Blast"
              autoFocus
            />

            <Field
              label="Description (Optional)"
              value={routineDesc}
              onChange={setRoutineDesc}
              placeholder="e.g. Hypertrophy focus with 90s rest"
            />

            {/* Exercises List in Builder */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">
                  Exercises ({routineExercises.length})
                </span>
                <button
                  type="button"
                  onClick={() => setExercisePickerOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-lime-400 hover:text-lime-300"
                >
                  <span>+ Add Exercise</span>
                </button>
              </div>

              {routineExercises.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-800 py-6 text-center">
                  <p className="text-xs text-neutral-500">No exercises added yet.</p>
                  <button
                    type="button"
                    onClick={() => setExercisePickerOpen(true)}
                    className="mt-2 text-xs font-semibold text-lime-400 underline underline-offset-2"
                  >
                    Select an exercise from library
                  </button>
                </div>
              ) : (
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {routineExercises.map((ex, index) => (
                    <div
                      key={`${ex.exerciseId}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-2.5"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="truncate text-sm font-semibold text-neutral-200">
                          {ex.exerciseName}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Target sets selector */}
                        <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 px-1 py-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateSets(index, -1)}
                            className="h-6 w-6 rounded text-sm text-neutral-400 hover:text-neutral-100"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-neutral-200">
                            {ex.targetSets} sets
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateSets(index, 1)}
                            className="h-6 w-6 rounded text-sm text-neutral-400 hover:text-neutral-100"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          aria-label={`Remove ${ex.exerciseName}`}
                          className="h-7 w-7 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setEditorOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={saving || !routineName.trim()}
                onClick={() => void handleSaveRoutine()}
              >
                {saving ? "Saving…" : "Save Routine"}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Exercise Picker Modal */}
      {exercisePickerOpen ? (
        <ExercisePickerModal
          onPick={handleAddExercise}
          onClose={() => setExercisePickerOpen(false)}
        />
      ) : null}
    </div>
  );
}

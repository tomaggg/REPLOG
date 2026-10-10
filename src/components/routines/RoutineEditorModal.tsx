import { useState } from "react";
import { Banner } from "~/components/ui/Banner";
import { Button } from "~/components/ui/Button";
import { Field } from "~/components/ui/Input";
import { Modal } from "~/components/ui/Modal";
import { ExercisePickerModal } from "~/components/workout/ExercisePickerModal";
import { useStore } from "~/context/StoreContext";
import { errorMessage } from "~/lib/errors";
import { newId } from "~/lib/id";
import type { Exercise, Routine, RoutineExercise } from "~/types/workout";
import { RoutineExerciseRow } from "./RoutineExerciseRow";

const DEFAULT_SETS = 3;
const MIN_SETS = 1;
const MAX_SETS = 10;

export function RoutineEditorModal({
  routine,
  onSaved,
  onClose,
}: {
  routine: Routine | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { store } = useStore();

  const [name, setName] = useState(routine?.name ?? "");
  const [description, setDescription] = useState(routine?.description ?? "");
  const [exercises, setExercises] = useState<RoutineExercise[]>(routine?.exercises ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function addExercise(exercise: Exercise) {
    setExercises((prev) => [
      ...prev,
      { exerciseId: exercise.id, exerciseName: exercise.name, targetSets: DEFAULT_SETS },
    ]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function changeSets(index: number, delta: number) {
    setExercises((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const targetSets = Math.max(MIN_SETS, Math.min(MAX_SETS, item.targetSets + delta));
        return { ...item, targetSets };
      }),
    );
  }

  async function save() {
    if (!name.trim()) {
      setFormError("Please enter a routine name.");
      return;
    }
    if (exercises.length === 0) {
      setFormError("Please add at least one exercise to the routine.");
      return;
    }
    if (!store) return;

    setSaving(true);
    setFormError(null);
    try {
      await store.saveRoutine({
        id: routine?.id ?? newId(),
        name: name.trim(),
        description: description.trim() || undefined,
        exercises,
        createdAt: Date.now(),
      });
      onSaved();
    } catch (err) {
      setFormError(errorMessage(err, "Failed to save routine."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Modal title={routine ? "Edit Routine" : "New Routine"} onClose={onClose}>
        <div className="space-y-4">
          {formError ? <Banner tone="error">{formError}</Banner> : null}

          <Field
            label="Routine Name"
            value={name}
            onChange={setName}
            placeholder="e.g. Chest & Triceps Blast"
            autoFocus
          />

          <Field
            label="Description (Optional)"
            value={description}
            onChange={setDescription}
            placeholder="e.g. Hypertrophy focus with 90s rest"
          />

          {/* Exercises in this routine */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">
                Exercises ({exercises.length})
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-lime-400 hover:text-lime-300"
              >
                <span>+ Add Exercise</span>
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-800 py-6 text-center">
                <p className="text-xs text-neutral-500">No exercises added yet.</p>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="mt-2 text-xs font-semibold text-lime-400 underline underline-offset-2"
                >
                  Select an exercise from library
                </button>
              </div>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {exercises.map((ex, index) => (
                  <RoutineExerciseRow
                    key={`${ex.exerciseId}-${index}`}
                    exercise={ex}
                    onChangeSets={(delta) => changeSets(index, delta)}
                    onRemove={() => removeExercise(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={saving || !name.trim()}
              onClick={() => void save()}
            >
              {saving ? "Saving…" : "Save Routine"}
            </Button>
          </div>
        </div>
      </Modal>

      {pickerOpen ? (
        <ExercisePickerModal onPick={addExercise} onClose={() => setPickerOpen(false)} />
      ) : null}
    </>
  );
}

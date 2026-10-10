import { useMemo, useState } from "react";
import { Banner } from "~/components/ui/Banner";
import { Button, PrimaryButton } from "~/components/ui/Button";
import { formatDuration, formatTime } from "~/components/ui/formatters";
import { BUILTIN_EXERCISES } from "~/services/exercises";
import { useCustomExercises } from "~/hooks/useCustomExercises";
import type { FinishDetails } from "~/hooks/useActiveWorkout";
import type {
  Exercise,
  ExerciseHistory,
  Routine,
  SetEntry,
  Unit,
  Workout,
} from "~/types/workout";
import { newId } from "~/lib/id";
import { addRoutineToWorkout, groupSets } from "~/lib/workout";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseHistoryDrawer } from "./ExerciseHistoryDrawer";
import { ExercisePickerModal } from "./ExercisePickerModal";
import { FinishWorkoutModal } from "./FinishWorkoutModal";
import { RoutinePickerModal } from "./RoutinePickerModal";

function withAddedSet(sets: SetEntry[], exercise: Exercise, weight: number, reps: number, unit: Unit) {
  const setIndex = sets.filter((s) => s.exerciseId === exercise.id).length + 1;
  return [
    ...sets,
    { id: newId(), exerciseId: exercise.id, exerciseName: exercise.name, setIndex, weight, reps, unit },
  ];
}

/** Remove one set, then renumber each exercise's sets 1, 2, 3… */
function withoutSet(sets: SetEntry[], setId: string): SetEntry[] {
  const counts = new Map<string, number>();
  return sets
    .filter((s) => s.id !== setId)
    .map((s) => {
      const c = (counts.get(s.exerciseId) ?? 0) + 1;
      counts.set(s.exerciseId, c);
      return { ...s, setIndex: c };
    });
}

export function WorkoutLogger({
  draft,
  history,
  unit,
  busy,
  error,
  onChange,
  onFinish,
  onDiscard,
}: {
  draft: Workout;
  history: Record<string, ExerciseHistory>;
  unit: Unit;
  busy: boolean;
  error: string | null;
  onChange: (next: Workout) => void;
  onFinish: (details: FinishDetails) => void;
  onDiscard: () => void;
}) {
  const { customExercises } = useCustomExercises();
  const [picking, setPicking] = useState(false);
  const [pickingRoutine, setPickingRoutine] = useState(false);
  const [inspecting, setInspecting] = useState<string | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);

  // Built-in + custom exercises by id (custom ones win on a clash)
  const exerciseMap = useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const ex of BUILTIN_EXERCISES) map.set(ex.id, ex);
    for (const ex of customExercises) map.set(ex.id, ex);
    return map;
  }, [customExercises]);

  const safeSets = useMemo(
    () => (Array.isArray(draft.sets) ? draft.sets : []),
    [draft.sets],
  );
  const groups = useMemo(() => groupSets(safeSets), [safeSets]);

  function setSets(sets: SetEntry[]) {
    onChange({ ...draft, sets });
  }

  function addSet(exercise: Exercise, weight: number, reps: number) {
    setSets(withAddedSet(safeSets, exercise, weight, reps, unit));
  }

  function updateSet(setId: string, patch: Partial<SetEntry>) {
    setSets(safeSets.map((s) => (s.id === setId ? { ...s, ...patch } : s)));
  }

  function removeExercise(exerciseId: string) {
    setSets(safeSets.filter((s) => s.exerciseId !== exerciseId));
  }

  function startRoutine(routine: Routine) {
    onChange(addRoutineToWorkout({ ...draft, sets: safeSets }, routine, unit));
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Session header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-neutral-100">Today's Session</h2>
          <p className="text-xs text-neutral-500">
            Started at {formatTime(draft.startedAt)} ·{" "}
            {formatDuration(draft.startedAt, null)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {safeSets.length > 0 ? (
            <button
              type="button"
              onClick={onDiscard}
              className="text-xs font-semibold text-neutral-500 hover:text-red-400"
            >
              Discard
            </button>
          ) : null}
        </div>
      </div>

      {error ? <Banner tone="error">{error}</Banner> : null}

      <input
        value={draft.note || ""}
        onChange={(e) => onChange({ ...draft, note: e.target.value })}
        placeholder="Session note (e.g. Leg Day, felt strong on bench)…"
        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 outline-none focus:border-lime-400"
      />

      {groups.map((group) => (
        <ExerciseCard
          key={group.exerciseId}
          group={group}
          exercise={exerciseMap.get(group.exerciseId)}
          history={history[group.exerciseId]}
          unit={unit}
          onInspect={() => setInspecting(group.exerciseId)}
          onRemoveExercise={() => removeExercise(group.exerciseId)}
          onAddSet={(w, r) => addSet({ id: group.exerciseId, name: group.exerciseName, group: "" }, w, r)}
          onEditSet={updateSet}
          onRemoveSet={(setId) => setSets(withoutSet(safeSets, setId))}
        />
      ))}

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => setPicking(true)} className="w-full">
          + Add Exercise
        </Button>
        <Button variant="secondary" onClick={() => setPickingRoutine(true)} className="w-full">
          ▶ Start Routine
        </Button>
      </div>

      {safeSets.length > 0 ? (
        <PrimaryButton onClick={() => setFinishOpen(true)} disabled={busy} className="mt-6 w-full">
          {busy ? "Saving session…" : "Finish Workout"}
        </PrimaryButton>
      ) : null}

      {/* Modals and drawers */}
      {picking ? (
        <ExercisePickerModal
          onPick={(ex) => addSet(ex, 0, 0)}
          onClose={() => setPicking(false)}
          excludeIds={groups.map((g) => g.exerciseId)}
        />
      ) : null}

      {pickingRoutine ? (
        <RoutinePickerModal onPick={startRoutine} onClose={() => setPickingRoutine(false)} />
      ) : null}

      {inspecting ? (
        <ExerciseHistoryDrawer
          exerciseName={groups.find((g) => g.exerciseId === inspecting)?.exerciseName ?? ""}
          exercise={exerciseMap.get(inspecting)}
          history={history[inspecting]}
          onClose={() => setInspecting(null)}
        />
      ) : null}

      {finishOpen ? (
        <FinishWorkoutModal
          draft={draft}
          exerciseCount={groups.length}
          setCount={safeSets.length}
          busy={busy}
          onChange={onChange}
          onFinish={onFinish}
          onClose={() => setFinishOpen(false)}
        />
      ) : null}
    </div>
  );
}

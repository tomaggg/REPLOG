import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Banner } from "~/components/ui/Banner";
import { Button, PrimaryButton } from "~/components/ui/Button";
import { ElapsedTimer } from "~/components/ui/ElapsedTimer";
import { formatTime } from "~/components/ui/formatters";
import { MuscleBreakdown } from "~/components/muscles/MuscleBreakdown";
import { useExerciseLookup } from "~/hooks/useExerciseLookup";
import { muscleBreakdown } from "~/lib/muscles";
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
import { unlockSound } from "~/lib/alert";
import { formatSet, loadTypeOf, setLoadType } from "~/lib/load-types";
import { findPRs, prLabel } from "~/lib/records";
import { addRoutineToWorkout, groupSets, previousSet, renumberSets } from "~/lib/workout";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseHistoryDrawer } from "./ExerciseHistoryDrawer";
import { ExercisePickerModal } from "./ExercisePickerModal";
import { FinishWorkoutModal } from "./FinishWorkoutModal";
import { PRToast } from "./PRToast";
import { RestTimerBar } from "./RestTimerBar";
import { RoutinePickerModal } from "./RoutinePickerModal";

function withAddedSet(sets: SetEntry[], exercise: Exercise, weight: number, reps: number, unit: Unit) {
  const setIndex = sets.filter((s) => s.exerciseId === exercise.id).length + 1;
  return [
    ...sets,
    {
      id: newId(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      setIndex,
      weight,
      reps,
      unit,
      loadType: loadTypeOf(exercise),
    },
  ];
}

/** Remove one set, then renumber each exercise's sets 1, 2, 3… */
function withoutSet(sets: SetEntry[], setId: string): SetEntry[] {
  return renumberSets(sets.filter((s) => s.id !== setId));
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
  restSeconds,
  onRestSecondsChange,
  beforeStart,
}: {
  draft: Workout;
  history: Record<string, ExerciseHistory>;
  unit: Unit;
  busy: boolean;
  error: string | null;
  onChange: (next: Workout) => void;
  onFinish: (details: FinishDetails) => void;
  onDiscard: () => void;
  /** Rest timer length, started each time a set is ticked off */
  restSeconds: number;
  onRestSecondsChange: (seconds: number) => void;
  /** Shown until the first exercise is added, e.g. the weekly streak */
  beforeStart?: ReactNode;
}) {
  const exerciseMap = useExerciseLookup();
  const [picking, setPicking] = useState(false);
  const [pickingRoutine, setPickingRoutine] = useState(false);
  const [inspecting, setInspecting] = useState<string | null>(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [prMessage, setPrMessage] = useState<string | null>(null);
  const hidePrMessage = useCallback(() => setPrMessage(null), []);

  const safeSets = useMemo(
    () => (Array.isArray(draft.sets) ? draft.sets : []),
    [draft.sets],
  );
  const groups = useMemo(() => groupSets(safeSets), [safeSets]);
  const doneSets = safeSets.filter((s) => s.done);

  // Muscles worked: what's been done so far, or the plan until a set is ticked
  const counted = doneSets.length > 0 ? doneSets : safeSets;
  const muscleShares = muscleBreakdown(counted, (id) => exerciseMap.get(id)?.group);
  const muscleCaption =
    doneSets.length > 0
      ? `Based on ${doneSets.length} completed ${doneSets.length === 1 ? "set" : "sets"}`
      : `Planned · ${safeSets.length} ${safeSets.length === 1 ? "set" : "sets"}`;

  function setSets(sets: SetEntry[]) {
    onChange({ ...draft, sets });
  }

  function addSet(exercise: Exercise, weight: number, reps: number) {
    setSets(withAddedSet(safeSets, exercise, weight, reps, unit));
  }

  function updateSet(setId: string, patch: Partial<SetEntry>) {
    setSets(safeSets.map((s) => (s.id === setId ? { ...s, ...patch } : s)));
  }

  /** Tick a set on or off. Ticking one on starts the rest timer and checks for a PR. */
  function toggleDone(setId: string) {
    const target = safeSets.find((s) => s.id === setId);
    if (!target) return;
    if (target.done) {
      setSets(safeSets.map((s) => (s.id === setId ? { ...s, done: false } : s)));
      return;
    }

    let ticked: SetEntry = { ...target, done: true };
    // Ticking an empty row means "same as last time"
    const previous = previousSet(history[target.exerciseId], target.setIndex - 1, target.unit);
    if (previous && ticked.weight === 0 && ticked.reps === 0) {
      ticked = { ...ticked, weight: previous.weight, reps: previous.reps };
    }
    const sets = safeSets.map((s) => (s.id === setId ? ticked : s));

    unlockSound(); // must happen during a tap so the end-of-rest beep is allowed
    onChange({ ...draft, sets, restEndsAt: Date.now() + restSeconds * 1000 });

    const sameExercise = sets.filter((s) => s.exerciseId === target.exerciseId);
    const pr = findPRs(sameExercise, history[target.exerciseId], setLoadType(ticked)).get(setId);
    if (pr) {
      setPrMessage(
        `${prLabel(pr)}! ${target.exerciseName} ${formatSet(ticked)}`,
      );
    }
  }

  /** −15s / +15s on the running timer; also becomes the length of future rests. */
  function adjustRest(seconds: number) {
    if (!draft.restEndsAt) return;
    onChange({ ...draft, restEndsAt: Math.max(Date.now(), draft.restEndsAt + seconds * 1000) });
    onRestSecondsChange(restSeconds + seconds);
  }

  function endRest() {
    onChange({ ...draft, restEndsAt: undefined });
  }

  function removeExercise(exerciseId: string) {
    setSets(safeSets.filter((s) => s.exerciseId !== exerciseId));
  }

  function startRoutine(routine: Routine) {
    onChange(
      addRoutineToWorkout({ ...draft, sets: safeSets }, routine, unit, (id) =>
        loadTypeOf(exerciseMap.get(id)),
      ),
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Session header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-neutral-100">Today's Session</h2>
          <p className="text-xs text-neutral-500">
            {safeSets.length > 0 ? (
              <>
                Started at {formatTime(draft.startedAt)} ·{" "}
                <ElapsedTimer startedAt={draft.startedAt} className="font-semibold text-lime-400" />
              </>
            ) : (
              "Add an exercise or start a routine to begin"
            )}
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

      {safeSets.length === 0 ? beforeStart : null}

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
          onInspect={() => setInspecting(group.exerciseId)}
          onRemoveExercise={() => removeExercise(group.exerciseId)}
          onAddSet={(w, r) =>
            addSet(
              exerciseMap.get(group.exerciseId) ?? { id: group.exerciseId, name: group.exerciseName, group: "" },
              w,
              r,
            )
          }
          onEditSet={updateSet}
          onToggleSetDone={toggleDone}
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

      <MuscleBreakdown shares={muscleShares} caption={muscleCaption} />

      {prMessage ? <PRToast message={prMessage} onDone={hidePrMessage} /> : null}

      {draft.restEndsAt ? (
        <RestTimerBar endsAt={draft.restEndsAt} onAdjust={adjustRest} onDismiss={endRest} />
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
          exerciseCount={new Set(doneSets.map((s) => s.exerciseId)).size}
          doneSetCount={doneSets.length}
          totalSetCount={safeSets.length}
          busy={busy}
          onChange={onChange}
          onFinish={onFinish}
          onClose={() => setFinishOpen(false)}
        />
      ) : null}
    </div>
  );
}

import type { RoutineExercise } from "~/types/workout";

/** One exercise inside the routine editor, with a -/+ target-sets counter. */
export function RoutineExerciseRow({
  exercise,
  onChangeSets,
  onRemove,
}: {
  exercise: RoutineExercise;
  onChangeSets: (delta: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 p-2.5">
      <div className="min-w-0 flex-1 pr-2">
        <p className="truncate text-sm font-semibold text-neutral-200">{exercise.exerciseName}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Target sets selector */}
        <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 px-1 py-0.5">
          <button
            type="button"
            onClick={() => onChangeSets(-1)}
            className="h-6 w-6 rounded text-sm text-neutral-400 hover:text-neutral-100"
          >
            -
          </button>
          <span className="w-8 text-center text-xs font-bold text-neutral-200">
            {exercise.targetSets} sets
          </span>
          <button
            type="button"
            onClick={() => onChangeSets(1)}
            className="h-6 w-6 rounded text-sm text-neutral-400 hover:text-neutral-100"
          >
            +
          </button>
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${exercise.exerciseName}`}
          className="h-7 w-7 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

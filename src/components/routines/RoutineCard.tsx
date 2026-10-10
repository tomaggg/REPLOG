import { EditIcon, PlayIcon, TrashIcon } from "~/components/ui/icons";
import type { Exercise, Routine } from "~/types/workout";

/** One routine in the Routines list. */
export function RoutineCard({
  routine,
  customExercises,
  onEdit,
  onDelete,
  onStart,
}: {
  routine: Routine;
  customExercises: Exercise[];
  onEdit: () => void;
  onDelete: () => void;
  onStart: () => void;
}) {
  const exerciseCount = routine.exercises.length;
  const totalSets = routine.exercises.reduce((sum, e) => sum + e.targetSets, 0);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-sm transition-all hover:border-neutral-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-bold text-neutral-100">{routine.name}</h2>
            <span className="rounded-md bg-neutral-800/90 px-2 py-0.5 text-[10px] font-semibold text-neutral-400">
              {exerciseCount} {exerciseCount === 1 ? "exercise" : "exercises"} · {totalSets} sets
            </span>
          </div>
          {routine.description ? (
            <p className="mt-1 text-xs text-neutral-400 line-clamp-1">{routine.description}</p>
          ) : null}
        </div>

        {/* Actions: Edit & Delete */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit routine"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          >
            <EditIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete routine"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-950/30 hover:text-red-400"
          >
            <TrashIcon className="h-4 w-4" />
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
          onClick={onStart}
          className="flex w-full min-h-[38px] items-center justify-center gap-2 rounded-xl bg-lime-400/10 border border-lime-400/30 px-4 text-xs font-bold text-lime-400 transition-all hover:bg-lime-400 hover:text-neutral-950 active:scale-[0.99]"
        >
          <PlayIcon className="h-4 w-4" />
          <span>Start Workout with this Routine</span>
        </button>
      </div>
    </div>
  );
}

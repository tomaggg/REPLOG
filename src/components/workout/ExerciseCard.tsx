import { Card } from "~/components/ui/Card";
import { HistoryIcon } from "~/components/ui/icons";
import type { Exercise, ExerciseHistory, SetEntry } from "~/types/workout";
import { bestSet, type SetGroup } from "~/lib/workout";
import { SetRow } from "./SetRow";

function nextSetSeed(group: SetGroup, history: ExerciseHistory | undefined) {
  const lastToday = group.sets[group.sets.length - 1];
  if (lastToday) return { weight: lastToday.weight, reps: lastToday.reps };
  const lastBefore = history?.last?.[history.last.length - 1];
  if (lastBefore) return { weight: lastBefore.weight, reps: lastBefore.reps };
  return { weight: 0, reps: 0 };
}

export function ExerciseCard({
  group,
  exercise,
  history,
  onInspect,
  onRemoveExercise,
  onAddSet,
  onEditSet,
  onRemoveSet,
}: {
  group: SetGroup;
  exercise: Exercise | undefined;
  history: ExerciseHistory | undefined;
  onInspect: () => void;
  onRemoveExercise: () => void;
  onAddSet: (weight: number, reps: number) => void;
  onEditSet: (setId: string, patch: Partial<SetEntry>) => void;
  onRemoveSet: (setId: string) => void;
}) {
  const seed = nextSetSeed(group, history);
  const best = bestSet(group.sets);

  const lastSets = (history?.last ?? []).filter((s) => s.weight > 0 || s.reps > 0);
  const lastSetCount = lastSets.length;

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onInspect}
              className="text-left font-bold text-neutral-100 hover:text-lime-400"
            >
              {group.exerciseName}
            </button>
            {exercise?.videoUrl ? (
              <a
                href={exercise.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open video demonstration"
                className="inline-flex items-center text-[10px] font-semibold text-lime-400 hover:underline"
              >
                ▶ Video
              </a>
            ) : null}
            {exercise?.notes ? (
              <button
                type="button"
                onClick={onInspect}
                title="View form notes"
                className="inline-flex items-center text-[10px] text-neutral-400 hover:text-neutral-200"
              >
                ✎ Notes
              </button>
            ) : null}
          </div>
          {best && best.weight > 0 && best.reps > 0 ? (
            <p className="text-xs text-lime-400">
              best: {best.weight} {best.unit} × {best.reps}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onRemoveExercise}
          className="text-xs text-neutral-500 hover:text-red-400"
        >
          Remove
        </button>
      </div>

      {/* Last session history bar */}
      {lastSetCount > 0 ? (
        <div className="flex items-start gap-2 rounded-xl border border-neutral-800/60 bg-neutral-950/50 px-3 py-2">
          <div className="mt-0.5 shrink-0">
            <HistoryIcon className="h-3.5 w-3.5 text-neutral-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
              Last · {lastSetCount} {lastSetCount === 1 ? "set" : "sets"}
            </p>
            <div className="flex flex-wrap gap-x-0.5 gap-y-0.5 text-[11px]">
              {lastSets.map((s, i) => (
                <span key={s.id} className="inline-flex items-center gap-1">
                  <span className="text-neutral-300 font-semibold">{s.weight}</span>
                  <span className="text-neutral-500">{s.unit}</span>
                  <span className="text-neutral-600">×</span>
                  <span className="text-neutral-300 font-semibold">{s.reps}</span>
                  {i < lastSets.length - 1 && <span className="text-neutral-700 mx-0.5">·</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {group.sets.map((s, idx) => (
          <SetRow
            key={s.id}
            set={s}
            index={idx + 1}
            exerciseName={group.exerciseName}
            onEdit={(patch) => onEditSet(s.id, patch)}
            onRemove={() => onRemoveSet(s.id)}
          />
        ))}

        {/* New sets start with the previous set's numbers, ready to edit */}
        <button
          type="button"
          onClick={() => onAddSet(seed.weight, seed.reps)}
          aria-label={`Add ${group.exerciseName} set`}
          className="min-h-11 w-full rounded-xl border border-dashed border-neutral-700 text-sm font-semibold text-lime-400 hover:border-lime-400/60 hover:bg-lime-400/5 active:scale-[0.99]"
        >
          + Add Set
        </button>
      </div>
    </Card>
  );
}

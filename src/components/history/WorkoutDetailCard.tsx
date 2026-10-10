import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Banner } from "~/components/ui/Banner";
import { GhostButton } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { formatDate, formatDuration, formatTime } from "~/components/ui/formatters";
import type { Workout } from "~/types/workout";
import { bestSet, formatVolume, groupSets } from "~/types/workout";

export function WorkoutDetailCard({
  workout,
  onDelete,
  busy,
  error,
}: {
  workout: Workout;
  onDelete: () => void;
  busy: boolean;
  error: string | null;
}) {
  const safeSets = useMemo(() => (Array.isArray(workout.sets) ? workout.sets : []), [workout.sets]);
  const groups = useMemo(() => groupSets(safeSets), [safeSets]);

  return (
    <div className="space-y-3 pb-20">
      <div className="flex items-center gap-2 px-1">
        <Link
          to="/history"
          className="inline-flex min-h-10 items-center rounded-xl border border-neutral-800 px-3 text-sm font-medium text-neutral-300 hover:border-neutral-700 hover:text-neutral-100"
        >
          ‹ Back to History
        </Link>
      </div>

      <Card className="space-y-1">
        <p className="text-base font-bold text-neutral-100">
          {formatDate(workout.startedAt)} · {formatTime(workout.startedAt)}
        </p>
        <p className="text-xs text-neutral-500">
          Duration: {formatDuration(workout.startedAt, workout.finishedAt)} ·{" "}
          {safeSets.length} set{safeSets.length === 1 ? "" : "s"} · {formatVolume(workout)} total
        </p>
      </Card>

      {error ? <Banner tone="error">{error}</Banner> : null}

      {workout.note ? (
        <Card>
          <p className="text-xs italic text-neutral-300">{workout.note}</p>
        </Card>
      ) : null}

      {groups.map((group) => {
        const best = bestSet(group.sets);
        return (
          <Card key={group.exerciseId} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="truncate text-base font-semibold text-neutral-100">
                {group.exerciseName}
              </h3>
              {best ? (
                <span className="shrink-0 text-xs font-semibold text-lime-400">
                  best {best.weight} {best.unit} × {best.reps}
                </span>
              ) : null}
            </div>
            <ul className="divide-y divide-neutral-800">
              {group.sets.map((set, i) => (
                <li key={set.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-neutral-500">Set {i + 1}</span>
                  <span className="font-semibold text-neutral-100">
                    {set.weight} {set.unit} × {set.reps}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}

      <GhostButton onClick={onDelete} disabled={busy} className="w-full text-red-400 hover:bg-red-500/10">
        {busy ? "Deleting…" : "Delete this workout"}
      </GhostButton>
    </div>
  );
}

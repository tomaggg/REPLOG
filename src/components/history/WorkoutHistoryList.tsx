import { Link } from "@tanstack/react-router";
import { Card } from "~/components/ui/Card";
import { formatDate, formatDuration, formatTime } from "~/components/ui/formatters";
import type { Workout } from "~/types/workout";
import { formatVolume } from "~/lib/workout";

export function WorkoutHistoryList({ workouts }: { workouts: Workout[] }) {
  if (!workouts || workouts.length === 0) {
    return (
      <Card className="py-8 text-center">
        <p className="text-base font-medium text-neutral-200">No finished workouts yet</p>
        <p className="mt-1 text-xs text-neutral-400">
          Log a session on the Today tab and it will show up here with your lift stats!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3 pb-20">
      {workouts.map((workout) => {
        const safeSets = Array.isArray(workout.sets) ? workout.sets : [];
        const names = [...new Set(safeSets.map((s) => s.exerciseName))];
        const prCount = safeSets.filter((s) => s.pr).length;
        return (
          <Link
            key={workout.id}
            to="/history/$workoutId"
            params={{ workoutId: workout.id }}
            className="block w-full text-left transition-transform active:scale-[0.995]"
          >
            <Card className="space-y-1 hover:border-neutral-700">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-semibold text-neutral-100">
                  {formatDate(workout.startedAt)}
                </span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {formatTime(workout.startedAt)} · {formatDuration(workout.startedAt, workout.finishedAt)}
                </span>
              </div>
              <p className="text-sm text-neutral-300">
                {names.length ? names.join(" · ") : "No sets recorded"}
              </p>
              <p className="text-xs text-neutral-500">
                {safeSets.length} set{safeSets.length === 1 ? "" : "s"} · {formatVolume(workout)}{" "}
                total
                {prCount > 0 ? (
                  <span className="ml-2 font-bold text-amber-400">
                    🏆 {prCount} PR{prCount === 1 ? "" : "s"}
                  </span>
                ) : null}
              </p>
              {workout.note ? (
                <p className="truncate pt-1 text-xs italic text-neutral-500">{workout.note}</p>
              ) : null}
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

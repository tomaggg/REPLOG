import { Link } from "@tanstack/react-router";
import { REGION_COLORS } from "~/components/muscles/regionColors";
import { Card } from "~/components/ui/Card";
import { formatDate, formatDuration, formatTime } from "~/components/ui/formatters";
import { useExerciseLookup } from "~/hooks/useExerciseLookup";
import { formatSet, setLoadType } from "~/lib/load-types";
import { muscleBreakdown, regionBreakdown } from "~/lib/muscles";
import { bestSet, formatVolume, groupSets } from "~/lib/workout";
import type { Exercise, Workout } from "~/types/workout";

/** Exercises listed on a card before "+N more" */
const MAX_EXERCISES = 4;
/** Body regions shown as dots */
const MAX_REGIONS = 3;

/** "September 2026" */
function monthLabel(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function WorkoutHistoryList({ workouts }: { workouts: Workout[] }) {
  const exercises = useExerciseLookup();

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

  // Workouts arrive newest first, so each month's workouts are already together
  const sections: { label: string; workouts: Workout[] }[] = [];
  for (const workout of workouts) {
    const label = monthLabel(workout.startedAt);
    const last = sections[sections.length - 1];
    if (last?.label === label) last.workouts.push(workout);
    else sections.push({ label, workouts: [workout] });
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.label} className="space-y-3">
          {/* Month headings only help when the list spans more than one month */}
          {sections.length > 1 ? (
            <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              {section.label}
            </h3>
          ) : null}
          {section.workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} exercises={exercises} />
          ))}
        </section>
      ))}
    </div>
  );
}

function WorkoutCard({ workout, exercises }: { workout: Workout; exercises: Map<string, Exercise> }) {
  const sets = Array.isArray(workout.sets) ? workout.sets : [];
  const groups = groupSets(sets);
  const shown = groups.slice(0, MAX_EXERCISES);
  const hidden = groups.length - shown.length;
  const prCount = sets.filter((s) => s.pr).length;
  const volume = formatVolume(workout);
  const regions = regionBreakdown(muscleBreakdown(sets, (id) => exercises.get(id)?.group)).slice(0, MAX_REGIONS);

  return (
    <Link
      to="/history/$workoutId"
      params={{ workoutId: workout.id }}
      className="block w-full text-left transition-transform active:scale-[0.995]"
    >
      <Card className="space-y-3 hover:border-neutral-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-neutral-100">{formatDate(workout.startedAt)}</p>
            {workout.note ? <p className="truncate text-xs text-neutral-400">{workout.note}</p> : null}
          </div>
          <div className="shrink-0 text-right text-xs tabular-nums text-neutral-500">
            <p>{formatTime(workout.startedAt)}</p>
            <p>{formatDuration(workout.startedAt, workout.finishedAt)}</p>
          </div>
        </div>

        {groups.length > 0 ? (
          <ul className="divide-y divide-neutral-800/70 rounded-xl bg-neutral-950/60 px-3">
            {shown.map((group) => {
              const best = bestSet(group.sets, setLoadType(group.sets[0]));
              return (
                <li key={group.exerciseId} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-200">{group.exerciseName}</p>
                    <p className="text-[11px] text-neutral-500">
                      {group.sets.length} {group.sets.length === 1 ? "set" : "sets"}
                    </p>
                  </div>
                  {best ? (
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums text-neutral-200">{formatSet(best)}</p>
                      <p className="text-[11px] text-neutral-500">top set</p>
                    </div>
                  ) : null}
                </li>
              );
            })}
            {hidden > 0 ? (
              <li className="py-2 text-xs text-neutral-500">
                +{hidden} more {hidden === 1 ? "exercise" : "exercises"}
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">No sets recorded</p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          {regions.map((r) => (
            <span key={r.region} className="inline-flex items-center gap-1.5 text-neutral-400">
              <span className={`h-2 w-2 rounded-full ${REGION_COLORS[r.region].bar}`} />
              {r.region}
            </span>
          ))}
          <span className="ml-auto tabular-nums text-neutral-500">
            {sets.length} {sets.length === 1 ? "set" : "sets"}
            {volume !== "—" ? ` · ${volume}` : ""}
          </span>
          {prCount > 0 ? <span className="font-bold text-amber-400">🏆 {prCount}</span> : null}
        </div>
      </Card>
    </Link>
  );
}

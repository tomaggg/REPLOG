import { Card } from "~/components/ui/Card";
import { CheckIcon } from "~/components/ui/icons";
import { startOfWeek } from "~/lib/dates";
import { thisWeek, weekStreak } from "~/lib/streak";
import type { Workout } from "~/types/workout";

/** This week's training days as dots, plus the weekly streak. */
export function WeekStreakCard({ workouts }: { workouts: Workout[] }) {
  const days = thisWeek(workouts);
  const streak = weekStreak(workouts);
  const monday = startOfWeek(Date.now());
  const sessions = workouts.filter((w) => w.startedAt >= monday).length;
  const trainedThisWeek = sessions > 0;

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">This week</p>
          <p className="mt-0.5 text-sm font-semibold text-neutral-200">
            {sessions} {sessions === 1 ? "workout" : "workouts"}
          </p>
        </div>
        <div className="text-right">
          {streak > 0 ? (
            <p className="text-sm font-bold text-amber-300">
              🔥 {streak}-week streak
            </p>
          ) : null}
          <p className="text-[11px] text-neutral-500">
            {streak === 0
              ? "Train this week to start a streak"
              : trainedThisWeek
                ? "Keep it going!"
                : "Train this week to keep it"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-1.5">
            <span className={`text-[11px] font-semibold ${day.isToday ? "text-lime-400" : "text-neutral-500"}`}>
              {new Date(day.date).toLocaleDateString(undefined, { weekday: "narrow" })}
            </span>
            <span
              aria-label={`${new Date(day.date).toLocaleDateString(undefined, { weekday: "long" })}: ${day.trained ? "trained" : "no workout"}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                day.trained
                  ? "bg-lime-400 text-neutral-950"
                  : day.isToday
                    ? "border-2 border-lime-400/60"
                    : day.isFuture
                      ? "border border-dashed border-neutral-800"
                      : "bg-neutral-800/70"
              }`}
            >
              {day.trained ? <CheckIcon className="h-4 w-4" /> : null}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

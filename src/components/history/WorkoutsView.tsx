import { useState } from "react";
import { Card } from "~/components/ui/Card";
import { SegmentedControl } from "~/components/ui/SegmentedControl";
import { addDays, addMonths, startOfDay } from "~/lib/dates";
import type { Workout } from "~/types/workout";
import { WorkoutHistoryList } from "./WorkoutHistoryList";

/** Workouts shown at first, and how many more each "Show more" adds */
const PAGE_SIZE = 7;

export type ListPeriod = "7d" | "2w" | "1m" | "3m" | "1y";

export const LIST_PERIODS: { id: ListPeriod; label: string; empty: string }[] = [
  { id: "7d", label: "7D", empty: "in the last 7 days" },
  { id: "2w", label: "2W", empty: "in the last 2 weeks" },
  { id: "1m", label: "1M", empty: "in the last month" },
  { id: "3m", label: "3M", empty: "in the last 3 months" },
  { id: "1y", label: "1Y", empty: "in the last year" },
];

/** When a period starts, counted back from today (today is included) */
function periodStart(period: ListPeriod, now = Date.now()): number {
  const today = startOfDay(now);
  switch (period) {
    case "7d":
      return addDays(today, -6);
    case "2w":
      return addDays(today, -13);
    case "1m":
      return addMonths(today, -1);
    case "3m":
      return addMonths(today, -3);
    case "1y":
      return addMonths(today, -12);
  }
}

/** The workout list for a chosen period, 7 at a time. */
export function WorkoutsView({
  workouts,
  period,
  onPeriodChange,
}: {
  workouts: Workout[];
  period: ListPeriod;
  onPeriodChange: (period: ListPeriod) => void;
}) {
  const [shown, setShown] = useState(PAGE_SIZE);

  const start = periodStart(period);
  const inPeriod = workouts.filter((w) => w.startedAt >= start);
  const empty = LIST_PERIODS.find((p) => p.id === period)?.empty;

  return (
    <div className="space-y-3">
      <SegmentedControl
        label="Show workouts from"
        options={LIST_PERIODS}
        value={period}
        onChange={(p) => {
          setShown(PAGE_SIZE);
          onPeriodChange(p);
        }}
      />

      {workouts.length > 0 && inPeriod.length === 0 ? (
        <Card className="py-8 text-center">
          <p className="text-base font-medium text-neutral-200">No workouts {empty}</p>
          <p className="mt-1 text-xs text-neutral-400">Pick a longer period to see older sessions.</p>
        </Card>
      ) : (
        <WorkoutHistoryList workouts={inPeriod.slice(0, shown)} />
      )}

      {inPeriod.length > shown ? (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE_SIZE)}
          className="min-h-11 w-full rounded-xl border border-neutral-800 text-sm font-semibold text-neutral-300 hover:border-neutral-700"
        >
          Show more ({inPeriod.length - shown} left)
        </button>
      ) : null}
    </div>
  );
}

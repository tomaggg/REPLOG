import { useMemo, useState } from "react";
import { MuscleBreakdown } from "~/components/muscles/MuscleBreakdown";
import { Card } from "~/components/ui/Card";
import { SegmentedControl } from "~/components/ui/SegmentedControl";
import { useStore } from "~/context/StoreContext";
import { useExerciseLookup } from "~/hooks/useExerciseLookup";
import { addDays, addMonths, DAY_MS, startOfMonth, toDateInput } from "~/lib/dates";
import { muscleBreakdown } from "~/lib/muscles";
import {
  buildBuckets,
  bucketSizeFor,
  formatMetric,
  inRange,
  metricValue,
  periodRange,
  totalsOf,
  type Bucket,
  type BucketSize,
  type Metric,
  type StatsPeriod,
} from "~/lib/stats";
import type { Workout } from "~/types/workout";
import { BarChart } from "./BarChart";

const PERIODS: { id: StatsPeriod; label: string }[] = [
  { id: "1w", label: "7D" },
  { id: "1m", label: "1M" },
  { id: "3m", label: "3M" },
  { id: "1y", label: "1Y" },
  { id: "custom", label: "Custom" },
];

const METRICS: { id: Metric; label: string }[] = [
  { id: "workouts", label: "Workouts" },
  { id: "duration", label: "Time" },
  { id: "volume", label: "Volume" },
  { id: "reps", label: "Reps" },
];

const short = (ms: number) => new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/** "Sep 23 – Oct 22", with years when it isn't all this year: "Oct 23, 2025 – Oct 23, 2026" */
function formatRange(start: number, end: number): string {
  const thisYear = new Date().getFullYear();
  const withYear = new Date(start).getFullYear() !== thisYear || new Date(end).getFullYear() !== thisYear;
  const fmt = (ms: number) =>
    new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: withYear ? "numeric" : undefined });
  return `${fmt(start)} – ${fmt(end)}`;
}

/** Under a bar: "Mon", "Oct 13", "Jan", or "Oct '25" for a month in another year */
function barLabel(b: Bucket, size: BucketSize, period: StatsPeriod): string {
  if (size === "month") {
    const d = new Date(b.start);
    const month = d.toLocaleDateString(undefined, { month: "short" });
    return d.getFullYear() === new Date().getFullYear() ? month : `${month} ’${String(d.getFullYear()).slice(2)}`;
  }
  if (size === "day" && period === "1w") return new Date(b.start).toLocaleDateString(undefined, { weekday: "short" });
  return short(b.start);
}

/** Above the chart: "Wed, Oct 22", "Oct 13 – Oct 19", "October 2026", or "Oct 23 – Oct 31, 2025" for a part month */
function barTitle(b: Bucket, size: BucketSize): string {
  if (size === "day") {
    const d = new Date(b.start);
    const year = d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined;
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year });
  }
  const wholeMonth = size === "month" && b.start === startOfMonth(b.start) && b.end === addMonths(b.start, 1);
  if (wholeMonth) return new Date(b.start).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return formatRange(b.start, b.end - 1);
}

/** Totals, a chart and muscle split for a chosen period, for a chosen period. */
export function StatsView({ workouts }: { workouts: Workout[] }) {
  const { unit } = useStore();
  const exercises = useExerciseLookup();
  const [period, setPeriod] = useState<StatsPeriod>("1m");
  const [custom, setCustom] = useState(() => ({
    from: toDateInput(addDays(Date.now(), -29)),
    to: toDateInput(Date.now()),
  }));
  const [metric, setMetric] = useState<Metric>("volume");
  // null = the newest bar
  const [selected, setSelected] = useState<number | null>(null);

  const data = useMemo(() => {
    const range = periodRange(period, custom);
    const size = bucketSizeFor(range);
    const buckets = buildBuckets(workouts, range, size, unit);
    const current = inRange(workouts, range);
    return {
      range,
      size,
      totals: totalsOf(current, unit),
      buckets,
      shares: muscleBreakdown(current.flatMap((w) => w.sets ?? []), (id) => exercises.get(id)?.group),
      setCount: current.reduce((n, w) => n + (w.sets?.length ?? 0), 0),
    };
  }, [workouts, period, custom, unit, exercises]);

  if (workouts.length === 0) {
    return (
      <Card className="py-8 text-center">
        <p className="text-base font-medium text-neutral-200">No stats yet</p>
        <p className="mt-1 text-xs text-neutral-400">Finish a workout and your totals will show up here.</p>
      </Card>
    );
  }

  const { range, size, totals, buckets, shares, setCount } = data;
  const weeks = (range.end - range.start) / (7 * DAY_MS);
  const perWorkout = (v: number) => (totals.workouts ? v / totals.workouts : 0);
  const subtitles: Record<Metric, string> = {
    workouts: `${(totals.workouts / weeks).toFixed(1)} / week`,
    duration: `avg ${formatMetric("duration", perWorkout(totals.durationMs), unit)}`,
    volume: `avg ${formatMetric("volume", perWorkout(totals.volume), unit)}`,
    reps: `avg ${formatMetric("reps", perWorkout(totals.reps), unit)}`,
  };

  const bars = buckets.map((b) => ({
    value: metricValue(b.totals, metric),
    label: barLabel(b, size, period),
    title: barTitle(b, size),
  }));
  const selectedBar = Math.min(selected ?? bars.length - 1, bars.length - 1);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <SegmentedControl
          label="Period"
          options={PERIODS}
          value={period}
          onChange={(p) => {
            setPeriod(p);
            setSelected(null);
          }}
        />
        {period === "custom" ? (
          <div className="grid grid-cols-2 gap-2">
            <DateField label="From" value={custom.from} onChange={(from) => setCustom((c) => ({ ...c, from }))} />
            <DateField label="To" value={custom.to} onChange={(to) => setCustom((c) => ({ ...c, to }))} />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {METRICS.map((m) => (
          <StatTile
            key={m.id}
            label={m.label}
            value={formatMetric(m.id, metricValue(totals, m.id), unit)}
            subtitle={subtitles[m.id]}
            active={metric === m.id}
            onClick={() => {
              setMetric(m.id);
              setSelected(null);
            }}
          />
        ))}
      </div>
      <p className="px-1 text-[11px] text-neutral-500">
        Totals for {formatRange(range.start, range.end - 1)}. Tap a stat to chart it.
      </p>

      <Card>
        <BarChart
          bars={bars}
          selected={selectedBar}
          onSelect={setSelected}
          format={(v) => formatMetric(metric, v, unit)}
        />
      </Card>

      <MuscleBreakdown shares={shares} caption={`Based on ${setCount} sets`} />
    </div>
  );
}

function StatTile({
  label,
  value,
  subtitle,
  active,
  onClick,
}: {
  label: string;
  value: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-w-0 rounded-2xl border p-3 text-left transition-colors ${
        active ? "border-lime-400/60 bg-lime-400/5" : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
      }`}
    >
      <span className={`text-xs font-semibold ${active ? "text-lime-400" : "text-neutral-400"}`}>{label}</span>
      <p className="mt-1 truncate text-2xl font-black tabular-nums text-neutral-100">{value}</p>
      <p className="truncate text-[11px] text-neutral-500">{subtitle}</p>
    </button>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1 text-xs text-neutral-400">
      <span>{label}</span>
      <input
        type="date"
        value={value}
        max={toDateInput(Date.now())}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="min-h-11 w-full min-w-0 rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-base text-neutral-100 outline-none [color-scheme:dark] focus:border-lime-400"
      />
    </label>
  );
}

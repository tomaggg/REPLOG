import { useState } from "react";
import { DAY_MS, toDateInput } from "~/lib/dates";
import { shortDate, weightChangeSince, type WeightStats as Stats } from "~/lib/weight";
import type { Unit } from "~/types/workout";

type Period = "1w" | "1m" | "3m" | "all" | "custom";

const PERIODS: { id: Period; label: string; days?: number }[] = [
  { id: "1w", label: "1W", days: 7 },
  { id: "1m", label: "1M", days: 30 },
  { id: "3m", label: "3M", days: 90 },
  { id: "all", label: "All" },
  { id: "custom", label: "Custom" },
];

/** Midday of the picked day, so an entry logged any time that day is the closest. */
function middayOf(dateInput: string): number {
  const [y, m, d] = dateInput.split("-").map(Number);
  return new Date(y, m - 1, d, 12).getTime();
}

/**
 * Current weight, the change over a chosen period (1 week by default), and
 * where today's weight sits between the lowest and highest.
 */
export function WeightStats({
  stats,
  unit,
  points,
}: {
  stats: Stats | null;
  unit: Unit;
  /** Weights in `unit`, oldest first */
  points: { timestamp: number; weight: number }[];
}) {
  const [period, setPeriod] = useState<Period>("1w");
  const [customDate, setCustomDate] = useState(() => toDateInput(Date.now() - 7 * DAY_MS));
  if (!stats) return null;

  const days = PERIODS.find((p) => p.id === period)?.days;
  // The date to compare against; the nearest entry to it is used
  const targetMs =
    period === "all"
      ? (points[0]?.timestamp ?? 0)
      : period === "custom"
        ? middayOf(customDate)
        : Date.now() - (days ?? 7) * DAY_MS;
  const change = weightChangeSince(points, targetMs);

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Current weight</p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="text-4xl font-black tabular-nums text-neutral-100">{stats.current.toFixed(1)}</span>
            <span className="text-base font-semibold text-neutral-500">{unit}</span>
          </p>
        </div>
        {change ? <ChangePill diff={change.diff} unit={unit} since={change.baselineDate} /> : null}
      </div>

      <div className="space-y-2">
        <div role="group" aria-label="Change over" className="flex gap-1 rounded-xl bg-neutral-950 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={period === p.id}
              onClick={() => setPeriod(p.id)}
              className={`min-h-11 flex-1 rounded-lg text-xs font-bold transition-colors ${
                period === p.id ? "bg-neutral-800 text-lime-400" : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === "custom" ? (
          <label className="flex items-center justify-between gap-3 text-xs text-neutral-400">
            <span>Change since</span>
            <input
              id="weight-change-since"
              type="date"
              value={customDate}
              max={toDateInput(Date.now())}
              onChange={(e) => e.target.value && setCustomDate(e.target.value)}
              className="min-h-11 rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-base text-neutral-100 outline-none [color-scheme:dark] focus:border-lime-400"
            />
          </label>
        ) : null}
      </div>

      <RangeTrack min={stats.min} max={stats.max} current={stats.current} />
    </div>
  );
}

/** "▼ 1.6 kg / since Mar 4". Down is blue, up is amber. */
function ChangePill({ diff, unit, since }: { diff: number; unit: Unit; since: number }) {
  const rounded = Math.round(diff * 10) / 10;
  const style =
    rounded < 0 ? "bg-sky-400/10 text-sky-300" : rounded > 0 ? "bg-amber-400/10 text-amber-300" : "bg-neutral-800 text-neutral-400";

  return (
    <div className="text-right">
      <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums ${style}`}>
        {rounded === 0 ? "No change" : `${rounded < 0 ? "▼" : "▲"} ${Math.abs(rounded).toFixed(1)} ${unit}`}
      </span>
      <p className="mt-1 text-[11px] text-neutral-500">since {shortDate(since)}</p>
    </div>
  );
}

/** Lowest and highest at the ends of a track, with a dot for today's weight. */
function RangeTrack({ min, max, current }: { min: number; max: number; current: number }) {
  const position = max > min ? ((current - min) / (max - min)) * 100 : 50;

  return (
    <div className="space-y-2">
      <div className="relative h-1.5 rounded-full bg-neutral-800">
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neutral-900 bg-lime-400"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-neutral-500">
          Lowest <span className="font-bold tabular-nums text-neutral-200">{min.toFixed(1)}</span>
        </span>
        <span className="text-neutral-500">
          Highest <span className="font-bold tabular-nums text-neutral-200">{max.toFixed(1)}</span>
        </span>
      </div>
    </div>
  );
}

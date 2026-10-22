// Training totals over a date range: workouts, time, volume and reps,
// plus the same totals split into day / week / month bars for a chart.

import type { Unit, Workout } from "~/types/workout";
import { addDays, addMonths, DAY_MS, fromDateInput, startOfDay, startOfMonth, startOfWeek } from "./dates";
import { setLoadType } from "./load-types";
import { convertWeight } from "./weight";

export type StatsPeriod = "1w" | "1m" | "3m" | "1y" | "custom";
export type Metric = "workouts" | "duration" | "volume" | "reps";
export type BucketSize = "day" | "week" | "month";

/** A time range: `start` included, `end` not. */
export interface Range {
  start: number;
  end: number;
}

export interface Totals {
  workouts: number;
  durationMs: number;
  /** Weight × reps of weighted sets, in the chosen unit */
  volume: number;
  /** Reps of all sets except timed ones (those store seconds) */
  reps: number;
}

/** How many months back 1M / 3M / 1Y go */
const PERIOD_MONTHS: Partial<Record<StatsPeriod, number>> = { "1m": 1, "3m": 3, "1y": 12 };

/**
 * The range for a period, up to the end of today. 1W is the last 7 days;
 * 1M / 3M / 1Y start on the same date 1, 3 or 12 months ago (Oct 23, 2025 – Oct 23, 2026).
 */
export function periodRange(period: StatsPeriod, custom: { from: string; to: string }, now = Date.now()): Range {
  const today = startOfDay(now);
  const end = addDays(today, 1);
  if (period === "1w") return { start: addDays(end, -7), end };
  if (period === "custom") {
    const a = fromDateInput(custom.from);
    const b = fromDateInput(custom.to);
    return { start: Math.min(a, b), end: addDays(Math.max(a, b), 1) };
  }
  return { start: addMonths(today, -(PERIOD_MONTHS[period] ?? 1)), end };
}

/** Days for short ranges, weeks up to ~6 months, months after that */
export function bucketSizeFor(range: Range): BucketSize {
  const days = Math.round((range.end - range.start) / DAY_MS);
  return days <= 31 ? "day" : days <= 190 ? "week" : "month";
}

export function inRange(workouts: Workout[], range: Range): Workout[] {
  return workouts.filter((w) => w.startedAt >= range.start && w.startedAt < range.end);
}

export function totalsOf(workouts: Workout[], unit: Unit): Totals {
  const totals: Totals = { workouts: workouts.length, durationMs: 0, volume: 0, reps: 0 };
  for (const w of workouts) {
    if (w.finishedAt) totals.durationMs += Math.max(0, w.finishedAt - w.startedAt);
    for (const s of w.sets ?? []) {
      const type = setLoadType(s);
      const reps = Number(s.reps) || 0;
      if (type !== "timed") totals.reps += reps;
      if (type === "weighted") totals.volume += convertWeight((Number(s.weight) || 0) * reps, s.unit, unit);
    }
  }
  return totals;
}

export function metricValue(totals: Totals, metric: Metric): number {
  return metric === "duration" ? totals.durationMs : totals[metric];
}

export interface Bucket {
  start: number;
  end: number;
  totals: Totals;
}

/** `range` split into day / week / month bars. The first and last bars are clipped to the range. */
export function buildBuckets(workouts: Workout[], range: Range, size: BucketSize, unit: Unit): Bucket[] {
  const first = size === "day" ? startOfDay(range.start) : size === "week" ? startOfWeek(range.start) : startOfMonth(range.start);
  const step = (ms: number) => (size === "day" ? addDays(ms, 1) : size === "week" ? addDays(ms, 7) : addMonths(ms, 1));

  const buckets: Bucket[] = [];
  for (let at = first; at < range.end; at = step(at)) {
    const bucket = { start: Math.max(at, range.start), end: Math.min(step(at), range.end) };
    buckets.push({ ...bucket, totals: totalsOf(inRange(workouts, bucket), unit) });
  }
  return buckets;
}


/** "9h 40m", "45m" */
export function formatHoursMinutes(ms: number): string {
  const mins = Math.round(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** 1,284 · 42.3k · 1.2M */
export function formatCount(n: number): string {
  if (n < 10_000) return Math.round(n).toLocaleString();
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function formatMetric(metric: Metric, value: number, unit: Unit): string {
  if (metric === "duration") return formatHoursMinutes(value);
  if (metric === "volume") return `${formatCount(value)} ${unit}`;
  return formatCount(value);
}

// Pure helpers for the body-weight tracker.

import type { Unit, UserProfile, WeightEntry } from "~/types/workout";

const LB_PER_KG = 2.20462;

/** Convert a weight between kg and lb, rounded to one decimal. */
export function convertWeight(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  if (from === "kg" && to === "lb") {
    return Number((value * LB_PER_KG).toFixed(1));
  }
  if (from === "lb" && to === "kg") {
    return Number((value / LB_PER_KG).toFixed(1));
  }
  return value;
}

/** A copy of the logs sorted newest first. */
export function newestFirst(logs: WeightEntry[]): WeightEntry[] {
  return [...logs].sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * The unit the user started tracking in: from onboarding, else the profile,
 * else the oldest log (logs are newest first), else kg.
 */
export function startingUnit(profile: UserProfile | null, logs: WeightEntry[]): Unit {
  return (
    profile?.initialWeightUnit ??
    profile?.unit ??
    (logs.length > 0 ? logs[logs.length - 1].unit : "kg")
  );
}

/** A log converted to the unit the user is viewing in. */
export interface DisplayWeightEntry extends WeightEntry {
  originalUnit: Unit;
  displayWeight: number;
}

export function toDisplayUnit(logs: WeightEntry[], unit: Unit): DisplayWeightEntry[] {
  return logs.map((log) => ({
    ...log,
    originalUnit: log.unit,
    displayWeight: convertWeight(log.weight, log.unit, unit),
    unit,
  }));
}

export interface WeightStats {
  current: number;
  diff: number;
  min: number;
  max: number;
  avg: number;
}

/** Stats for a list of weights in date order (oldest first). Null when empty. */
export function weightStats(weights: number[]): WeightStats | null {
  if (weights.length === 0) return null;
  const latest = weights[weights.length - 1];
  const initial = weights[0];
  return {
    current: latest,
    diff: latest - initial,
    min: Math.min(...weights),
    max: Math.max(...weights),
    avg: weights.reduce((a, b) => a + b, 0) / weights.length,
  };
}

/**
 * Change from the weight around `targetMs` to the latest weight. The baseline is
 * the entry closest to the target date, before or after it (on a tie, the earlier
 * one), never the latest entry itself. `points` must be oldest first.
 * Null when there are no entries.
 */
export function weightChangeSince(
  points: { timestamp: number; weight: number }[],
  targetMs: number,
): { diff: number; baselineDate: number } | null {
  if (points.length === 0) return null;
  const latest = points[points.length - 1];
  const candidates = points.length > 1 ? points.slice(0, -1) : points;

  let baseline = candidates[0];
  for (const p of candidates) {
    if (Math.abs(p.timestamp - targetMs) < Math.abs(baseline.timestamp - targetMs)) baseline = p;
  }
  return { diff: latest.weight - baseline.weight, baselineDate: baseline.timestamp };
}

/** "Mar 4" */
export function shortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** "Tue, Mar 4, 2025" */
export function longDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "09:41" */
export function shortTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Read a typed weight ("75.5" or "75,5"). Null if it isn't a positive number. */
export function parseWeight(text: string): number | null {
  const val = Number(text.replace(",", "."));
  return isNaN(val) || val <= 0 ? null : val;
}

// ---- Chart ----

export interface ChartPoint {
  timestamp: number;
  weight: number;
  dateStr: string;
  /** Position inside the SVG viewBox. */
  x: number;
  y: number;
}

export interface ChartData {
  width: number;
  height: number;
  padX: number;
  padY: number;
  coords: ChartPoint[];
  linePath: string;
  areaPath: string;
  /** Horizontal grid lines with their labels. */
  ticks: { val: number; y: number }[];
}

// SVG viewBox size and the space kept around the plot for labels.
// Close to a phone card's real size, so labels aren't shrunk to unreadable.
const WIDTH = 340;
const HEIGHT = 190;
const PAD_X = 36;
const PAD_Y = 16;

/** Lay out weight logs (oldest first) as SVG points and paths. Null when empty. */
export function buildWeightChart(
  logs: { timestamp: number; weight: number }[],
): ChartData | null {
  if (logs.length === 0) return null;

  const weights = logs.map((l) => l.weight);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  // Leave some room above and below the line so it doesn't touch the edges
  const padding = Math.max((rawMax - rawMin) * 0.15, 1);
  const minBound = Math.floor(rawMin - padding);
  const maxBound = Math.ceil(rawMax + padding);
  const range = maxBound - minBound || 1;

  const graphWidth = WIDTH - PAD_X * 2;
  const graphHeight = HEIGHT - PAD_Y * 2;
  const bottom = HEIGHT - PAD_Y;

  const coords: ChartPoint[] = logs.map((l, idx) => ({
    timestamp: l.timestamp,
    weight: l.weight,
    dateStr: shortDate(l.timestamp),
    // A single point sits in the middle
    x:
      logs.length === 1
        ? PAD_X + graphWidth / 2
        : PAD_X + (idx / (logs.length - 1)) * graphWidth,
    y: PAD_Y + graphHeight - ((l.weight - minBound) / range) * graphHeight,
  }));

  let linePath: string;
  let areaPath: string;
  if (coords.length === 1) {
    // A short flat line, so one log is still visible
    const { x, y } = coords[0];
    linePath = `M ${x - 15} ${y} L ${x + 15} ${y}`;
    areaPath = `M ${x - 15} ${y} L ${x + 15} ${y} L ${x + 15} ${bottom} L ${x - 15} ${bottom} Z`;
  } else {
    // Smooth curve: each segment bends halfway between two points
    linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cx = (curr.x + next.x) / 2;
      linePath += ` C ${cx} ${curr.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
    }
    areaPath = `${linePath} L ${coords[coords.length - 1].x} ${bottom} L ${coords[0].x} ${bottom} Z`;
  }

  const ticks = [
    { val: maxBound, y: PAD_Y },
    { val: (maxBound + minBound) / 2, y: PAD_Y + graphHeight / 2 },
    { val: minBound, y: PAD_Y + graphHeight },
  ];

  return {
    width: WIDTH,
    height: HEIGHT,
    padX: PAD_X,
    padY: PAD_Y,
    coords,
    linePath,
    areaPath,
    ticks,
  };
}

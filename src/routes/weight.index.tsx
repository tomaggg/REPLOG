import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { AppShell } from "~/components/layout/AppShell";
import { Banner } from "~/components/ui/Banner";
import { Field } from "~/components/ui/Input";
import { Spinner } from "~/components/ui/Spinner";
import { useStore } from "~/context/StoreContext";
import type { Unit, UserProfile, WeightEntry } from "~/types/workout";

export const Route = createFileRoute("/weight/")({
  component: WeightTrackerPage,
});

function WeightTrackerPage() {
  return (
    <AuthGuard>
      <AppShell>
        <WeightTrackerDashboard />
      </AppShell>
    </AuthGuard>
  );
}

// Weight unit conversion helpers
function convertWeight(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  if (from === "kg" && to === "lb") {
    return Number((value * 2.20462).toFixed(1));
  }
  if (from === "lb" && to === "kg") {
    return Number((value / 2.20462).toFixed(1));
  }
  return value;
}

function WeightTrackerDashboard() {
  const { store } = useStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>([]);
  // activeWeightUnit is the user's selected viewing/input unit for Weight Tracker
  const [activeUnit, setActiveUnit] = useState<Unit>("kg");
  const [newWeight, setNewWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    weight: number;
    unit: Unit;
    x: number;
    y: number;
  } | null>(null);

  const loadData = useCallback(async () => {
    if (!store) return;
    try {
      setLoading(true);
      const [prof, logs] = await Promise.all([
        store.getProfile(),
        store.listWeightLogs(),
      ]);
      setProfile(prof);

      // Onboarding unit: initialWeightUnit or prof.unit or default to first log's unit or "kg"
      const defaultUnit: Unit =
        prof?.initialWeightUnit ??
        prof?.unit ??
        (logs.length > 0 ? logs[logs.length - 1].unit : "kg");

      setActiveUnit((prev) => prev || defaultUnit);

      const sorted = [...logs].sort((a, b) => b.timestamp - a.timestamp);
      setWeightLogs(sorted);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load weight logs.");
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Determine initial onboarding unit for the Net / Overview display
  const onboardingUnit: Unit =
    profile?.initialWeightUnit ??
    profile?.unit ??
    (weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].unit : "kg");

  // Normalized logs converted to activeUnit for display, chart, and statistics
  const normalizedLogsInActiveUnit = useMemo(() => {
    return weightLogs.map((log) => ({
      ...log,
      originalUnit: log.unit,
      displayWeight: convertWeight(log.weight, log.unit, activeUnit),
      unit: activeUnit,
    }));
  }, [weightLogs, activeUnit]);

  // Chronological order (oldest to newest) for trends and chart
  const chronologicalLogs = useMemo(() => {
    return [...normalizedLogsInActiveUnit].reverse();
  }, [normalizedLogsInActiveUnit]);

  // Calculations for current weight, net change, min, max
  const stats = useMemo(() => {
    if (chronologicalLogs.length === 0) return null;
    const weights = chronologicalLogs.map((l) => l.displayWeight);
    const latest = weights[weights.length - 1];
    const initial = weights[0];
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
    const diff = latest - initial;

    return {
      current: latest,
      diff,
      min,
      max,
      avg,
    };
  }, [chronologicalLogs]);

  async function handleLogWeight(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!store || saving) return;
    const val = Number(newWeight.replace(",", "."));
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid weight value.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      await store.logBodyWeight(val, activeUnit);
      if (profile) {
        const updatedProfile = {
          ...profile,
          bodyWeight: val,
          unit: activeUnit,
          updatedAt: Date.now(),
        };
        await store.saveProfile(updatedProfile);
        setProfile(updatedProfile);
      }
      setNewWeight("");
      setSuccessMsg(`Logged ${val} ${activeUnit} successfully.`);
      const updatedLogs = await store.listWeightLogs();
      setWeightLogs([...updatedLogs].sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save weight.");
    } finally {
      setSaving(false);
    }
  }

  // Interactive SVG Graph coordinates calculations
  const chartData = useMemo(() => {
    if (chronologicalLogs.length === 0) return null;

    const points = chronologicalLogs.map((l) => ({
      timestamp: l.timestamp,
      weight: l.displayWeight,
      dateStr: new Date(l.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      fullDateStr: new Date(l.timestamp).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));

    const weights = points.map((p) => p.weight);
    const rawMin = Math.min(...weights);
    const rawMax = Math.max(...weights);
    // Add margin for nice visualization
    const padding = Math.max((rawMax - rawMin) * 0.15, 1);
    const minBound = Math.floor(rawMin - padding);
    const maxBound = Math.ceil(rawMax + padding);
    const range = maxBound - minBound || 1;

    const width = 600;
    const height = 240;
    const padX = 40;
    const padY = 30;
    const graphWidth = width - padX * 2;
    const graphHeight = height - padY * 2;

    const coords = points.map((p, idx) => {
      const x =
        points.length === 1
          ? padX + graphWidth / 2
          : padX + (idx / (points.length - 1)) * graphWidth;
      const y = padY + graphHeight - ((p.weight - minBound) / range) * graphHeight;
      return { ...p, x, y };
    });

    // Generate smooth SVG path
    let linePath = "";
    let areaPath = "";

    if (coords.length === 1) {
      linePath = `M ${coords[0].x - 15} ${coords[0].y} L ${coords[0].x + 15} ${coords[0].y}`;
      areaPath = `M ${coords[0].x - 15} ${coords[0].y} L ${coords[0].x + 15} ${coords[0].y} L ${coords[0].x + 15} ${height - padY} L ${coords[0].x - 15} ${height - padY} Z`;
    } else {
      linePath = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const curr = coords[i];
        const next = coords[i + 1];
        const cx = (curr.x + next.x) / 2;
        linePath += ` C ${cx} ${curr.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
      }
      areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`;
    }

    // Grid ticks (3 horizontal levels)
    const ticks = [
      { val: maxBound, y: padY },
      { val: (maxBound + minBound) / 2, y: padY + graphHeight / 2 },
      { val: minBound, y: padY + graphHeight },
    ];

    return {
      width,
      height,
      padX,
      padY,
      coords,
      linePath,
      areaPath,
      ticks,
      minBound,
      maxBound,
    };
  }, [chronologicalLogs]);

  return (
    <div className="space-y-6 pb-14">
      {/* Header and Unit Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-100">
            Weight Tracker
          </h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            Log, convert units, and visualize your body weight progress.
          </p>
        </div>

        {/* Global Unit Switcher for Weight Tracker */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-semibold text-neutral-400">Unit:</span>
          <div className="flex rounded-xl border border-neutral-800 bg-neutral-950 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveUnit("kg")}
              className={`rounded-lg px-3 py-1 font-bold transition-all ${
                activeUnit === "kg"
                  ? "bg-lime-400 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              KG
            </button>
            <button
              type="button"
              onClick={() => setActiveUnit("lb")}
              className={`rounded-lg px-3 py-1 font-bold transition-all ${
                activeUnit === "lb"
                  ? "bg-lime-400 text-neutral-950 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              LB
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current Weight */}
        <div className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Current Weight
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-lime-400">
              {stats ? stats.current.toFixed(1) : "—"}
            </span>
            <span className="text-sm font-bold text-neutral-400">{activeUnit}</span>
          </div>
        </div>

        {/* Net Change */}
        <div className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Net Change
            </p>
            {onboardingUnit !== activeUnit ? (
              <span className="rounded bg-neutral-800/80 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400">
                init {onboardingUnit}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-3xl font-black ${
                stats
                  ? stats.diff > 0
                    ? "text-amber-400"
                    : stats.diff < 0
                    ? "text-sky-400"
                    : "text-neutral-200"
                  : "text-neutral-500"
              }`}
            >
              {stats
                ? stats.diff > 0
                  ? `+${stats.diff.toFixed(1)}`
                  : stats.diff.toFixed(1)
                : "—"}
            </span>
            <span className="text-sm font-bold text-neutral-400">{activeUnit}</span>
          </div>
        </div>

        {/* Lowest */}
        <div className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Lowest
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-neutral-200">
              {stats ? stats.min.toFixed(1) : "—"}
            </span>
            <span className="text-sm font-bold text-neutral-400">{activeUnit}</span>
          </div>
        </div>

        {/* Highest */}
        <div className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Highest
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-neutral-200">
              {stats ? stats.max.toFixed(1) : "—"}
            </span>
            <span className="text-sm font-bold text-neutral-400">{activeUnit}</span>
          </div>
        </div>
      </div>

      {/* Weight Progress Chart */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 shadow-lg backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-200">Weight Trend</h2>
            <p className="text-[11px] text-neutral-500">
              Interactive timeline • Converted dynamically to {activeUnit.toUpperCase()}
            </p>
          </div>
          {hoveredPoint ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs">
              <span className="text-neutral-400">{hoveredPoint.date}:</span>
              <span className="font-bold text-lime-400">
                {hoveredPoint.weight.toFixed(1)} {hoveredPoint.unit}
              </span>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="py-12">
            <Spinner label="Loading weight data…" />
          </div>
        ) : !chartData || chartData.coords.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <p className="text-sm text-neutral-500">Not enough data to graph yet.</p>
            <p className="mt-1 text-xs text-neutral-600">
              Log your body weight over time to reveal the trend curve.
            </p>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="w-full h-48 sm:h-56 touch-none"
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                {/* Neon green gradient fill under graph */}
                <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a3e635" stopOpacity="0.25" />
                  <stop offset="90%" stopColor="#a3e635" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {chartData.ticks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={chartData.padX}
                    y1={tick.y}
                    x2={chartData.width - chartData.padX}
                    y2={tick.y}
                    stroke="#262626"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={chartData.padX - 8}
                    y={tick.y + 3}
                    fill="#737373"
                    fontSize="10"
                    textAnchor="end"
                  >
                    {tick.val.toFixed(1)}
                  </text>
                </g>
              ))}

              {/* Filled Area */}
              <path d={chartData.areaPath} fill="url(#weightAreaGrad)" />

              {/* Trend Stroke Line */}
              <path
                d={chartData.linePath}
                fill="none"
                stroke="#a3e635"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              {chartData.coords.map((pt, i) => {
                const isHovered =
                  hoveredPoint && hoveredPoint.weight === pt.weight && hoveredPoint.x === pt.x;

                return (
                  <g key={i}>
                    {/* Invisible larger hover hotspot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="16"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() =>
                        setHoveredPoint({
                          date: pt.dateStr,
                          weight: pt.weight,
                          unit: activeUnit,
                          x: pt.x,
                          y: pt.y,
                        })
                      }
                    />
                    {/* Outer glowing ring when hovered */}
                    {isHovered ? (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="7"
                        fill="none"
                        stroke="#a3e635"
                        strokeWidth="2"
                        className="animate-pulse"
                      />
                    ) : null}
                    {/* Point dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? "4" : "3"}
                      fill={isHovered ? "#ffffff" : "#a3e635"}
                      stroke="#0a0a0a"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Bottom date labels */}
            <div className="mt-1 flex justify-between px-6 text-[10px] text-neutral-500">
              <span>{chartData.coords[0].dateStr}</span>
              {chartData.coords.length > 2 ? (
                <span>
                  {
                    chartData.coords[Math.floor(chartData.coords.length / 2)]
                      .dateStr
                  }
                </span>
              ) : null}
              {chartData.coords.length > 1 ? (
                <span>
                  {chartData.coords[chartData.coords.length - 1].dateStr}
                </span>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Log Form Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-lg backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-200">Log Body Weight</h2>
          <span className="text-xs font-semibold text-neutral-400">
            Logging in: <span className="text-lime-400 font-bold uppercase">{activeUnit}</span>
          </span>
        </div>

        {error ? (
          <div className="mb-3">
            <Banner tone="error">{error}</Banner>
          </div>
        ) : null}
        {successMsg ? (
          <div className="mb-3">
            <Banner tone="success">{successMsg}</Banner>
          </div>
        ) : null}

        <form onSubmit={handleLogWeight} className="flex gap-2">
          <div className="flex-1">
            <Field
              label=""
              value={newWeight}
              onChange={setNewWeight}
              placeholder={`Enter weight in ${activeUnit} (e.g. ${activeUnit === "kg" ? "75.5" : "166.4"})`}
              inputMode="decimal"
              suffix={activeUnit}
            />
          </div>
          <button
            type="submit"
            disabled={saving || !newWeight}
            className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-lime-400 px-5 text-sm font-bold text-neutral-950 transition-colors hover:bg-lime-300 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save Log"}
          </button>
        </form>
      </div>

      {/* History List */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-neutral-200">
            History ({normalizedLogsInActiveUnit.length})
          </h2>
          <span className="text-[11px] text-neutral-500">
            All logs converted to {activeUnit.toUpperCase()}
          </span>
        </div>

        {loading ? (
          <Spinner label="Loading weight history…" />
        ) : normalizedLogsInActiveUnit.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-neutral-500">No weight entries recorded yet.</p>
            <p className="mt-1 text-xs text-neutral-600">
              Log your first body weight entry using the form above!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/80">
            {normalizedLogsInActiveUnit.map((log) => {
              const date = new Date(log.timestamp);
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-neutral-800/20"
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-200">
                      {date.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {date.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {log.originalUnit !== activeUnit ? (
                        <span className="ml-1 text-neutral-600">
                          (recorded: {log.weight} {log.originalUnit})
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-lime-400">
                      {log.displayWeight.toFixed(1)}
                    </span>{" "}
                    <span className="text-xs font-semibold text-neutral-400">
                      {activeUnit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

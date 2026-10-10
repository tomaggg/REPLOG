import type React from "react";
import { formatChange, type WeightStats as Stats } from "~/lib/weight";
import type { Unit } from "~/types/workout";

export function WeightStats({
  stats,
  unit,
  startUnit,
}: {
  stats: Stats | null;
  unit: Unit;
  startUnit: Unit;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        label="Current Weight"
        value={stats ? stats.current.toFixed(1) : "—"}
        valueColor="text-lime-400"
        unit={unit}
      />
      <StatCard
        label="Net Change"
        badge={
          startUnit !== unit ? (
            <span className="rounded bg-neutral-800/80 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400">
              init {startUnit}
            </span>
          ) : null
        }
        value={stats ? formatChange(stats.diff) : "—"}
        valueColor={changeColor(stats)}
        unit={unit}
      />
      <StatCard
        label="Lowest"
        value={stats ? stats.min.toFixed(1) : "—"}
        valueColor="text-neutral-200"
        unit={unit}
      />
      <StatCard
        label="Highest"
        value={stats ? stats.max.toFixed(1) : "—"}
        valueColor="text-neutral-200"
        unit={unit}
      />
    </div>
  );
}

// Gaining is amber, losing is blue, no change is plain
function changeColor(stats: Stats | null): string {
  if (!stats) return "text-neutral-500";
  if (stats.diff > 0) return "text-amber-400";
  if (stats.diff < 0) return "text-sky-400";
  return "text-neutral-200";
}

function StatCard({
  label,
  badge,
  value,
  valueColor,
  unit,
}: {
  label: string;
  /** Optional extra shown at the right of the label. */
  badge?: React.ReactNode;
  value: string;
  valueColor: string;
  unit: Unit;
}) {
  const title = (
    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{label}</p>
  );

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm backdrop-blur-sm">
      {badge === undefined ? (
        title
      ) : (
        <div className="flex items-center justify-between gap-1">
          {title}
          {badge}
        </div>
      )}
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className={`text-3xl font-black ${valueColor}`}>{value}</span>
        <span className="text-sm font-bold text-neutral-400">{unit}</span>
      </div>
    </div>
  );
}

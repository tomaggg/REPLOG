import { useState } from "react";
import { Spinner } from "~/components/ui/Spinner";
import type { ChartData } from "~/lib/weight";
import type { Unit } from "~/types/workout";
import { WeightChartSvg, type HoveredPoint } from "./WeightChartSvg";

export function WeightChart({
  chart,
  unit,
  loading,
}: {
  chart: ChartData | null;
  unit: Unit;
  loading: boolean;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-neutral-200">Weight Trend</h2>
          <p className="text-[11px] text-neutral-500">
            Interactive timeline • Converted dynamically to {unit.toUpperCase()}
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
      ) : !chart || chart.coords.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center text-center">
          <p className="text-sm text-neutral-500">Not enough data to graph yet.</p>
          <p className="mt-1 text-xs text-neutral-600">
            Log your body weight over time to reveal the trend curve.
          </p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <WeightChartSvg
            chart={chart}
            unit={unit}
            hoveredPoint={hoveredPoint}
            onHover={setHoveredPoint}
          />
          <DateLabels chart={chart} />
        </div>
      )}
    </div>
  );
}

/** First, middle and last dates under the chart. */
function DateLabels({ chart }: { chart: ChartData }) {
  const { coords } = chart;
  return (
    <div className="mt-1 flex justify-between px-6 text-[10px] text-neutral-500">
      <span>{coords[0].dateStr}</span>
      {coords.length > 2 ? <span>{coords[Math.floor(coords.length / 2)].dateStr}</span> : null}
      {coords.length > 1 ? <span>{coords[coords.length - 1].dateStr}</span> : null}
    </div>
  );
}

import type React from "react";
import type { ChartData } from "~/lib/weight";

export interface HoveredPoint {
  date: string;
  weight: number;
  /** Shown after values, e.g. "kg" or "BMI" */
  unit: string;
  x: number;
  y: number;
}

// Chart colors (Tailwind lime-400, neutral-800/500/950)
const LIME = "#a3e635";
const GRID = "#262626";
const LABEL = "#737373";
const BACKGROUND = "#0a0a0a";

export function WeightChartSvg({
  chart,
  unit,
  hoveredPoint,
  onHover,
}: {
  chart: ChartData;
  /** Shown after values, e.g. "kg" or "BMI" */
  unit: string;
  hoveredPoint: HoveredPoint | null;
  onHover: (point: HoveredPoint | null) => void;
}) {
  /** Select the entry closest to the finger or mouse, left to right. */
  function pick(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * chart.width;
    let nearest = chart.coords[0];
    for (const pt of chart.coords) {
      if (Math.abs(pt.x - x) < Math.abs(nearest.x - x)) nearest = pt;
    }
    onHover({ date: nearest.dateStr, weight: nearest.weight, unit, x: nearest.x, y: nearest.y });
  }

  return (
    <svg
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      // pan-y: swiping up/down still scrolls the page; tap or drag sideways selects
      className="h-auto w-full cursor-crosshair touch-pan-y select-none"
      onPointerDown={pick}
      onPointerMove={(e) => {
        // Mouse: follow the cursor. Touch: only while the finger is down.
        if (e.pointerType === "mouse" || e.buttons > 0) pick(e);
      }}
      onPointerLeave={(e) => {
        // A tap on a phone keeps its value visible; a mouse leaving clears it
        if (e.pointerType === "mouse") onHover(null);
      }}
    >
      <defs>
        {/* Green fade under the line */}
        <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LIME} stopOpacity="0.25" />
          <stop offset="90%" stopColor={LIME} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid lines with value labels */}
      {chart.ticks.map((tick, i) => (
        <g key={i}>
          <line
            x1={chart.padX}
            y1={tick.y}
            x2={chart.width - chart.padX}
            y2={tick.y}
            stroke={GRID}
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <text x={chart.padX - 6} y={tick.y + 4} fill={LABEL} fontSize="11" textAnchor="end">
            {tick.val.toFixed(1)}
          </text>
        </g>
      ))}

      <path d={chart.areaPath} fill="url(#weightAreaGrad)" />
      <path d={chart.linePath} fill="none" stroke={LIME} strokeWidth="2.5" strokeLinecap="round" />

      {/* Guide line down from the selected entry */}
      {hoveredPoint ? (
        <line
          x1={hoveredPoint.x}
          y1={chart.padY}
          x2={hoveredPoint.x}
          y2={chart.height - chart.padY}
          stroke={LABEL}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ) : null}

      {/* Data points */}
      {chart.coords.map((pt, i) => {
        const isHovered = hoveredPoint?.x === pt.x;
        return (
          <g key={i}>
            {isHovered ? (
              <circle cx={pt.x} cy={pt.y} r="7" fill="none" stroke={LIME} strokeWidth="2" />
            ) : null}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={isHovered ? "4.5" : "3"}
              fill={isHovered ? "#ffffff" : LIME}
              stroke={BACKGROUND}
              strokeWidth="1.5"
            />
          </g>
        );
      })}
    </svg>
  );
}

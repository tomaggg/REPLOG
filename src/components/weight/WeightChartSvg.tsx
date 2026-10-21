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
  return (
    <svg
      viewBox={`0 0 ${chart.width} ${chart.height}`}
      className="w-full h-48 sm:h-56 touch-none"
      preserveAspectRatio="none"
      onMouseLeave={() => onHover(null)}
    >
      <defs>
        {/* Green fade under the line */}
        <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LIME} stopOpacity="0.25" />
          <stop offset="90%" stopColor={LIME} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Grid lines with weight labels */}
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
          <text x={chart.padX - 8} y={tick.y + 3} fill={LABEL} fontSize="10" textAnchor="end">
            {tick.val.toFixed(1)}
          </text>
        </g>
      ))}

      <path d={chart.areaPath} fill="url(#weightAreaGrad)" />
      <path d={chart.linePath} fill="none" stroke={LIME} strokeWidth="2.5" strokeLinecap="round" />

      {/* Data points */}
      {chart.coords.map((pt, i) => {
        const isHovered =
          hoveredPoint && hoveredPoint.weight === pt.weight && hoveredPoint.x === pt.x;

        return (
          <g key={i}>
            {/* Invisible larger circle, so the dot is easy to hover */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r="16"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() =>
                onHover({ date: pt.dateStr, weight: pt.weight, unit, x: pt.x, y: pt.y })
              }
            />
            {/* Pulsing ring when hovered */}
            {isHovered ? (
              <circle
                cx={pt.x}
                cy={pt.y}
                r="7"
                fill="none"
                stroke={LIME}
                strokeWidth="2"
                className="animate-pulse"
              />
            ) : null}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={isHovered ? "4" : "3"}
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

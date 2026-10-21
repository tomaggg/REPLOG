import { BMI_CATEGORIES, bmiCategory, formatHeight, healthyWeightRange } from "~/lib/bmi";
import type { Unit } from "~/types/workout";
import { BandScale } from "./BandScale";
import { TONE_STYLES } from "./tones";

// The gauge shows BMI 15–40; values outside sit at the ends
const GAUGE_MIN = 15;
const GAUGE_MAX = 40;

/** Current BMI, its category, and the healthy weight range for the user's height. */
export function BmiCard({
  bmi,
  weight,
  unit,
  heightCm,
}: {
  bmi: number | null;
  /** Latest weight in `unit`, or null if nothing is logged */
  weight: number | null;
  unit: Unit;
  heightCm: number | null;
}) {
  // The page only shows this after setup, when all three are known
  if (bmi === null || weight === null || heightCm === null) return null;

  const category = bmiCategory(bmi);
  const range = healthyWeightRange(heightCm, unit);
  const below = range.min - weight;
  const above = weight - range.max;

  return (
    <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Your BMI</p>
          <p className="mt-1 text-5xl font-black tabular-nums text-neutral-100">{bmi.toFixed(1)}</p>
        </div>
        <span className={`mt-1 rounded-lg px-2.5 py-1 text-xs font-bold ${TONE_STYLES[category.tone].pill}`}>
          {category.label}
        </span>
      </div>

      <BandScale bands={BMI_CATEGORIES} min={GAUGE_MIN} max={GAUGE_MAX} value={bmi} />

      <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-xs">
        <p className="text-neutral-400">
          Healthy weight for {formatHeight(heightCm, unit)}:{" "}
          <span className="font-bold text-neutral-100">
            {range.min.toFixed(1)}–{range.max.toFixed(1)} {unit}
          </span>
        </p>
        <p className="mt-0.5 font-semibold text-neutral-300">
          {below > 0
            ? `${below.toFixed(1)} ${unit} below that range`
            : above > 0
              ? `${above.toFixed(1)} ${unit} above that range`
              : "You're within it"}
        </p>
      </div>
    </div>
  );
}

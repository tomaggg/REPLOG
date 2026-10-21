import { BODY_FAT_BANDS, bodyFatBand, estimatedBodyFat } from "~/lib/bmi";
import type { Sex } from "~/types/workout";
import { BandScale } from "./BandScale";
import { TONE_STYLES } from "./tones";

const SCALE_MAX = 45;

/** Body-fat estimate from BMI, age and sex, on the band scale for that sex. */
export function BodyFatCard({
  bmi,
  age,
  sex,
  onAddDetails,
}: {
  bmi: number | null;
  age: number | null;
  sex: Sex | undefined;
  onAddDetails: () => void;
}) {
  const estimate = bmi === null ? null : estimatedBodyFat(bmi, age, sex);

  if (estimate === null || !sex) {
    const missing = [!sex && "sex", age === null && "birth year", bmi === null && "height and weight"]
      .filter(Boolean)
      .join(", ");
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Estimated body fat</p>
          <p className="mt-1 text-xs text-neutral-400">
            {age !== null && age < 18 ? "This estimate is only for adults." : `Needs your ${missing}.`}
          </p>
        </div>
        {age === null || age >= 18 ? (
          <button
            type="button"
            onClick={onAddDetails}
            className="min-h-10 shrink-0 rounded-xl border border-neutral-700 px-3 text-xs font-bold text-neutral-200 hover:border-lime-400/60 hover:text-lime-400"
          >
            Add
          </button>
        ) : null}
      </div>
    );
  }

  const band = bodyFatBand(estimate, sex);

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Estimated body fat</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-neutral-100">
            ~{Math.max(0, Math.round(estimate))}%
          </p>
        </div>
        <span className={`mt-1 rounded-lg px-2.5 py-1 text-xs font-bold ${TONE_STYLES[band.tone].pill}`}>
          {band.label}
        </span>
      </div>

      <BandScale bands={BODY_FAT_BANDS[sex]} min={0} max={SCALE_MAX} value={estimate} />

      <p className="text-[11px] leading-relaxed text-neutral-500">
        Ranges for {sex === "male" ? "men" : "women"}. Estimated from BMI, age and sex, so it can be
        off by several percent. BMI can't tell muscle from fat, so if you carry a lot of muscle, both
        numbers will read high.
      </p>
    </div>
  );
}

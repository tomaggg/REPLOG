import { CollapsibleCard } from "~/components/ui/CollapsibleCard";
import { BODY_FAT_BANDS, bodyFatBand, estimatedBodyFat } from "~/lib/bmi";
import type { Sex } from "~/types/workout";
import { BandScale } from "./BandScale";
import { TONE_STYLES } from "./tones";

const SCALE_MAX = 45;

/** Body-fat estimate from BMI, age and sex, on the band scale for that sex. Collapsed by default. */
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
    const tooYoung = age !== null && age < 18;
    const missing = [!sex && "sex", age === null && "birth year", bmi === null && "height and weight"]
      .filter(Boolean)
      .join(", ");
    return (
      <CollapsibleCard
        title="Estimated body fat"
        summary={<span className="font-normal text-neutral-400">{tooYoung ? "Only for adults" : `Needs your ${missing}`}</span>}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-400">
            {tooYoung
              ? "This estimate is only meant for adults (18+)."
              : `Add your ${missing} in your body profile to see an estimate.`}
          </p>
          {!tooYoung ? (
            <button
              type="button"
              onClick={onAddDetails}
              className="min-h-11 shrink-0 rounded-xl border border-neutral-700 px-4 text-xs font-bold text-neutral-200 hover:border-lime-400/60 hover:text-lime-400"
            >
              Add
            </button>
          ) : null}
        </div>
      </CollapsibleCard>
    );
  }

  const band = bodyFatBand(estimate, sex);
  const percent = Math.max(0, Math.round(estimate));

  return (
    <CollapsibleCard
      title="Estimated body fat"
      summary={
        <>
          ~{percent}% <span className={TONE_STYLES[band.tone].text}>· {band.label}</span>
        </>
      }
    >
      <div className="space-y-3">
        <BandScale bands={BODY_FAT_BANDS[sex]} min={0} max={SCALE_MAX} value={estimate} />
        <p className="text-[11px] leading-relaxed text-neutral-500">
          Ranges for {sex === "male" ? "men" : "women"}. Estimated from BMI, age and sex, so it can be
          off by several percent. BMI can't tell muscle from fat, so if you carry a lot of muscle, both
          numbers will read high.
        </p>
      </div>
    </CollapsibleCard>
  );
}

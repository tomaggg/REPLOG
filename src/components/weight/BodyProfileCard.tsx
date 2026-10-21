import { useState } from "react";
import { ageFrom, cmToFeetInches, feetInchesToCm, formatHeight } from "~/lib/bmi";
import type { Sex, Unit, UserProfile } from "~/types/workout";

type BodyPatch = Pick<UserProfile, "sex" | "heightCm" | "birthYear">;

const MIN_HEIGHT_CM = 100;
const MAX_HEIGHT_CM = 250;

/** Sex, height and birth year — shown as a summary, or as a form while editing. */
export function BodyProfileCard({
  sex,
  heightCm,
  birthYear,
  unit,
  editing,
  onEditingChange,
  onSave,
}: {
  sex: Sex | undefined;
  heightCm: number | null;
  birthYear: number | undefined;
  /** kg = metric (cm), lb = imperial (feet & inches) */
  unit: Unit;
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onSave: (patch: BodyPatch) => Promise<boolean>;
}) {
  const age = ageFrom(birthYear);
  const nothingSet = !sex && heightCm === null && !birthYear;

  if (!editing) {
    const height = heightCm === null ? null : formatHeight(heightCm, unit);
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Body profile</p>
          <p className="mt-1 text-sm font-semibold text-neutral-200">
            {nothingSet
              ? "Not set yet"
              : [sex === "male" ? "Male" : sex === "female" ? "Female" : null, height, age ? `${age} y` : null]
                  .filter(Boolean)
                  .join(" · ")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onEditingChange(true)}
          className="min-h-10 shrink-0 rounded-xl border border-neutral-700 px-3 text-xs font-bold text-neutral-200 hover:border-lime-400/60 hover:text-lime-400"
        >
          {nothingSet ? "Add" : "Edit"}
        </button>
      </div>
    );
  }

  return (
    <BodyProfileForm
      key={unit}
      initial={{ sex, heightCm, birthYear }}
      unit={unit}
      onCancel={() => onEditingChange(false)}
      onSave={async (patch) => {
        if (await onSave(patch)) onEditingChange(false);
      }}
    />
  );
}

/**
 * The body form. With `askWeight` it's the first-time setup: everything asked
 * at once, including a first weight entry.
 */
export function BodyProfileForm({
  initial,
  unit,
  askWeight = false,
  title = "Body profile",
  intro,
  onCancel,
  onSave,
}: {
  initial: {
    sex: Sex | undefined;
    heightCm: number | null;
    birthYear: number | undefined;
    weight?: number | null;
  };
  /** kg = metric (kg, cm), lb = imperial (lb, feet & inches) */
  unit: Unit;
  askWeight?: boolean;
  title?: string;
  intro?: string;
  /** Leave out to hide the Cancel button */
  onCancel?: () => void;
  /** `weight` is null unless `askWeight` is set */
  onSave: (patch: BodyPatch, weight: number | null) => Promise<void>;
}) {
  const start = initial.heightCm ? cmToFeetInches(initial.heightCm) : null;
  const [sex, setSex] = useState<Sex | undefined>(initial.sex);
  // Height follows the Metric / Imperial switch at the top of the page
  const useFeet = unit === "lb";
  const [cm, setCm] = useState(initial.heightCm ? String(Math.round(initial.heightCm)) : "");
  const [feet, setFeet] = useState(start ? String(start.feet) : "");
  const [inches, setInches] = useState(start ? String(start.inches) : "");
  const [birthYear, setBirthYear] = useState(initial.birthYear ? String(initial.birthYear) : "");
  const [weight, setWeight] = useState(initial.weight ? String(initial.weight) : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!sex) {
      setError("Please choose male or female.");
      return;
    }
    const heightCm = useFeet
      ? feet || inches
        ? feetInchesToCm(Number(feet) || 0, Number(inches) || 0)
        : undefined
      : cm
        ? Number(cm.replace(",", "."))
        : undefined;
    if (heightCm === undefined || !(heightCm >= MIN_HEIGHT_CM && heightCm <= MAX_HEIGHT_CM)) {
      setError("Please enter a height between 100 and 250 cm (3′3″ to 8′2″).");
      return;
    }
    const weightValue = askWeight ? Number(weight.replace(",", ".")) : null;
    if (weightValue !== null && !(weightValue > 0)) {
      setError("Please enter your current weight.");
      return;
    }
    const year = birthYear ? Number(birthYear) : undefined;
    const thisYear = new Date().getFullYear();
    if (year !== undefined && !(year >= 1900 && year <= thisYear - 10)) {
      setError(`Please enter a birth year between 1900 and ${thisYear - 10}.`);
      return;
    }
    setError(null);
    setSaving(true);
    await onSave({ sex, heightCm, birthYear: year }, weightValue);
    setSaving(false);
  }

  const input =
    "min-h-11 w-full min-w-0 rounded-xl border border-neutral-800 bg-neutral-950 px-3 text-base text-neutral-100 outline-none focus:border-lime-400";

  return (
    <div className="space-y-4 rounded-2xl border border-lime-400/40 bg-neutral-900/60 p-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">{title}</p>
        {intro ? <p className="text-sm text-neutral-300">{intro}</p> : null}
      </div>

      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 text-xs font-semibold text-neutral-400">Sex</legend>
        <div className="grid grid-cols-2 gap-1.5">
          {(["male", "female"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={sex === s}
              onClick={() => setSex(s)}
              className={`min-h-11 rounded-xl border text-sm font-bold ${
                sex === s
                  ? "border-lime-400 bg-lime-400/10 text-lime-400"
                  : "border-neutral-800 bg-neutral-950 text-neutral-400"
              }`}
            >
              {s === "male" ? "Male" : "Female"}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor={useFeet ? "height-feet" : "height-cm"} className="block text-xs font-semibold text-neutral-400">
          Height
        </label>
        {useFeet ? (
          <div className="flex items-center gap-2">
            <input id="height-feet" inputMode="numeric" value={feet} onChange={(e) => setFeet(e.target.value.replace(/\D/g, ""))} placeholder="5" className={input} />
            <span className="text-xs text-neutral-500">ft</span>
            <input id="height-inches" inputMode="numeric" value={inches} onChange={(e) => setInches(e.target.value.replace(/\D/g, ""))} placeholder="10" className={input} />
            <span className="text-xs text-neutral-500">in</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input id="height-cm" inputMode="decimal" value={cm} onChange={(e) => setCm(e.target.value.replace(/[^0-9.,]/g, ""))} placeholder="175" className={input} />
            <span className="text-xs text-neutral-500">cm</span>
          </div>
        )}
      </div>

      {askWeight ? (
        <div className="space-y-1.5">
          <label htmlFor="current-weight" className="text-xs font-semibold text-neutral-400">
            Current weight
          </label>
          <div className="flex items-center gap-2">
            <input id="current-weight" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^0-9.,]/g, ""))} placeholder={unit === "kg" ? "75" : "165"} className={input} />
            <span className="text-xs text-neutral-500">{unit}</span>
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="birth-year" className="text-xs font-semibold text-neutral-400">
          Birth year <span className="font-normal text-neutral-600">(optional, for the body-fat estimate)</span>
        </label>
        <input id="birth-year" inputMode="numeric" value={birthYear} onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1995" className={input} />
      </div>

      {error ? <p className="text-xs font-medium text-red-300">{error}</p> : null}

      <div className={`grid gap-2 ${onCancel ? "grid-cols-2" : "grid-cols-1"}`}>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="min-h-11 rounded-xl border border-neutral-700 text-sm font-semibold text-neutral-300">
            Cancel
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="min-h-11 rounded-xl bg-lime-400 text-sm font-bold text-neutral-950 hover:bg-lime-300 disabled:opacity-50"
        >
          {saving ? "Saving…" : askWeight ? "Save & see my BMI" : "Save"}
        </button>
      </div>
    </div>
  );
}

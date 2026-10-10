import { useState } from "react";
import { Banner } from "~/components/ui/Banner";
import { PrimaryButton } from "~/components/ui/Button";
import { useStore } from "~/context/StoreContext";
import type { Unit, UserProfile } from "~/types/workout";
import { errorMessage } from "~/lib/errors";

export function OnboardingModal({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { store, setUnit } = useStore();
  const [weightUnit, setWeightUnit] = useState<Unit>("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [bodyWeight, setBodyWeight] = useState("");
  const [height, setHeight] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleWeightUnitChange(u: Unit) {
    setWeightUnit(u);
    setUnit(u);
  }

  async function handleSubmit() {
    if (!store || busy) return;
    const weightNum = Number(bodyWeight.replace(",", "."));
    const heightNum = Number(height.replace(",", "."));

    if (!weightNum || weightNum <= 0) {
      setError("Please enter a valid body weight.");
      return;
    }
    if (!heightNum || heightNum <= 0) {
      setError("Please enter a valid height.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const profile: UserProfile = {
        unit: weightUnit,
        initialWeightUnit: weightUnit,
        bodyWeight: weightNum,
        height: heightNum,
        onboarded: true,
        updatedAt: Date.now(),
      };

      await store.saveProfile(profile);
      await store.logBodyWeight(weightNum, weightUnit);
      onComplete();
    } catch (err) {
      setError(errorMessage(err, "Could not save profile preferences."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-100">
            Welcome to RepLog
          </h2>
          <p className="text-xs text-neutral-400">
            Set your body stats and preferred units to get started.
          </p>
        </div>

        {error ? (
          <div className="mt-4">
            <Banner tone="error">{error}</Banner>
          </div>
        ) : null}

        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          {/* Body Weight Field with inline KG / LB Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                Body Weight
              </label>
              {/* Unit Toggle Pill */}
              <div className="flex gap-0.5 rounded-lg border border-neutral-800 bg-neutral-950 p-0.5">
                {(["kg", "lb"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleWeightUnitChange(u)}
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition-all ${weightUnit === u
                      ? "bg-lime-400 text-neutral-950 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200"
                      }`}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={bodyWeight}
                onChange={(e) => setBodyWeight(e.target.value)}
                placeholder={weightUnit === "kg" ? "e.g. 75" : "e.g. 165"}
                inputMode="decimal"
                autoFocus
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 pr-10"
              />
              <span className="pointer-events-none absolute right-3 text-xs font-semibold text-neutral-500">
                {weightUnit}
              </span>
            </div>
          </div>

          {/* Height Field with inline CM / IN Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">
                Height
              </label>
              {/* Unit Toggle Pill */}
              <div className="flex gap-0.5 rounded-lg border border-neutral-800 bg-neutral-950 p-0.5">
                {(["cm", "in"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setHeightUnit(u)}
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition-all ${heightUnit === u
                      ? "bg-lime-400 text-neutral-950 shadow-sm"
                      : "text-neutral-400 hover:text-neutral-200"
                      }`}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={heightUnit === "cm" ? "e.g. 178" : "e.g. 70"}
                inputMode="decimal"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400 pr-10"
              />
              <span className="pointer-events-none absolute right-3 text-xs font-semibold text-neutral-500">
                {heightUnit}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <PrimaryButton type="submit" disabled={busy || !bodyWeight || !height}>
              {busy ? "Saving…" : "Save & Start"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}

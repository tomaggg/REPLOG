import type { Unit } from "~/types/workout";

const UNITS: Unit[] = ["kg", "lb"];

export function WeightUnitToggle({
  unit,
  onChange,
}: {
  unit: Unit;
  onChange: (unit: Unit) => void;
}) {
  return (
    <div className="flex items-center gap-2 self-start sm:self-auto">
      <span className="text-xs font-semibold text-neutral-400">Unit:</span>
      <div className="flex rounded-xl border border-neutral-800 bg-neutral-950 p-1 text-xs">
        {UNITS.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onChange(u)}
            className={`rounded-lg px-3 py-1 font-bold transition-all ${
              unit === u
                ? "bg-lime-400 text-neutral-950 shadow-sm"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {u.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

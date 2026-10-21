import type { Unit } from "~/types/workout";

// Metric = kg and cm, imperial = lb and feet/inches
const SYSTEMS: { unit: Unit; label: string; detail: string }[] = [
  { unit: "kg", label: "Metric", detail: "kg · cm" },
  { unit: "lb", label: "Imperial", detail: "lb · ft/in" },
];

export function UnitSystemToggle({
  unit,
  onChange,
}: {
  unit: Unit;
  onChange: (unit: Unit) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Measurement system"
      className="flex self-start rounded-xl border border-neutral-800 bg-neutral-950 p-1 sm:self-auto"
    >
      {SYSTEMS.map((s) => (
        <button
          key={s.unit}
          type="button"
          aria-pressed={unit === s.unit}
          onClick={() => onChange(s.unit)}
          className={`min-h-11 rounded-lg px-3 py-1 text-left transition-all ${
            unit === s.unit
              ? "bg-lime-400 text-neutral-950 shadow-sm"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <span className="block text-xs font-bold">{s.label}</span>
          <span className="block text-[10px] font-medium opacity-75">{s.detail}</span>
        </button>
      ))}
    </div>
  );
}

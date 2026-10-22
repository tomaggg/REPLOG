/** A row of buttons where exactly one is selected, e.g. 1W / 1M / 3M. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  /** Read out by screen readers */
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-1 rounded-xl bg-neutral-950 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onChange(o.id)}
          className={`min-h-11 flex-1 rounded-lg px-2 text-xs font-bold transition-colors ${
            value === o.id ? "bg-neutral-800 text-lime-400" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

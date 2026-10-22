/** Labels shown under the bars at most; the rest are skipped so they don't overlap */
const MAX_LABELS = 7;

export interface Bar {
  value: number;
  /** Under the bar, e.g. "Mon" */
  label: string;
  /** Above the chart when selected, e.g. "Week of Oct 13" */
  title: string;
}

/**
 * Simple tappable bar chart. Tap a bar to see its value; a dashed line marks
 * the average.
 */
export function BarChart({
  bars,
  selected,
  onSelect,
  format,
}: {
  bars: Bar[];
  selected: number;
  onSelect: (index: number) => void;
  format: (value: number) => string;
}) {
  const max = Math.max(...bars.map((b) => b.value), 0);
  const average = bars.length ? bars.reduce((sum, b) => sum + b.value, 0) / bars.length : 0;
  const every = Math.ceil(bars.length / MAX_LABELS);
  const current = bars[selected];
  const heightOf = (v: number) => (max > 0 ? (v / max) * 100 : 0);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs text-neutral-400">{current?.title}</p>
        <p className="text-lg font-black tabular-nums text-neutral-100">{current ? format(current.value) : "—"}</p>
      </div>

      <div className="relative">
        <div className="flex h-36 items-end gap-[3px]">
          {bars.map((bar, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`${bar.title}: ${format(bar.value)}`}
              aria-pressed={i === selected}
              className="flex h-full min-w-0 flex-1 items-end"
            >
              <span
                className={`block w-full rounded-t-[3px] transition-colors ${
                  i === selected ? "bg-lime-400" : bar.value > 0 ? "bg-lime-400/35" : "bg-neutral-800"
                }`}
                // Empty bars keep a thin stub so every day/week is visible
                style={{ height: bar.value > 0 ? `max(4px, ${heightOf(bar.value)}%)` : "2px" }}
              />
            </button>
          ))}
        </div>
        {average > 0 ? (
          <div
            className="pointer-events-none absolute inset-x-0 border-t border-dashed border-neutral-500/70"
            style={{ bottom: `${heightOf(average)}%` }}
          >
            <span className="absolute -top-4 right-0 text-[10px] font-semibold text-neutral-500">avg</span>
          </div>
        ) : null}
      </div>

      <div className="flex h-4 gap-[3px] text-[10px] text-neutral-500">
        {bars.map((bar, i) => {
          // Label every Nth bar, counted back from the newest
          const show = (bars.length - 1 - i) % every === 0;
          // Centered under its bar, but kept inside the chart at both ends
          const place = i === bars.length - 1 ? "right-0" : i === 0 ? "left-0" : "left-1/2 -translate-x-1/2";
          return (
            <span key={i} className="relative min-w-0 flex-1">
              {show ? <span className={`absolute whitespace-nowrap ${place}`}>{bar.label}</span> : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

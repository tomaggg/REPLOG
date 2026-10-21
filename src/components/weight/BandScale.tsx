import type { Tone } from "~/lib/bmi";
import { TONE_STYLES } from "./tones";

/**
 * A horizontal bar split into colored bands, with a marker at `value`.
 * Used for the BMI gauge and the body-fat scale.
 */
export function BandScale({
  bands,
  min,
  max,
  value,
}: {
  /** Each band starts at `from` and runs to the next band's start (or `max`). */
  bands: readonly { label: string; from: number; tone: Tone }[];
  min: number;
  max: number;
  value: number;
}) {
  const pos = (v: number) => ((Math.min(max, Math.max(min, v)) - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      <div className="relative pt-2">
        <div className="flex h-2.5 overflow-hidden rounded-full">
          {bands.map((band, i) => {
            const end = bands[i + 1]?.from ?? max;
            return (
              <div
                key={band.label}
                className={`${TONE_STYLES[band.tone].bar} opacity-70`}
                style={{ width: `${pos(end) - pos(band.from)}%` }}
              />
            );
          })}
        </div>
        {/* Marker: a small triangle above the bar and a line through it */}
        <div className="absolute top-0 -translate-x-1/2" style={{ left: `${pos(value)}%` }}>
          <div className="mx-auto h-0 w-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-neutral-100" />
          <div className="mx-auto h-3.5 w-0.5 bg-neutral-100" />
        </div>
      </div>
      {/* Band start values under the bar */}
      <div className="relative h-4 text-[11px] tabular-nums text-neutral-500">
        {bands.slice(1).map((band) => (
          <span key={band.label} className="absolute -translate-x-1/2" style={{ left: `${pos(band.from)}%` }}>
            {band.from}
          </span>
        ))}
      </div>
    </div>
  );
}

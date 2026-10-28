import { useState } from "react";
import { MUSCLES, type Muscle, type MuscleShare } from "~/lib/muscles";
import { HEAD, MUSCLE_SHAPES, NECK, OUTLINE_HALF, VIEW_HEIGHT, type BodyView } from "./bodyShapes";

const MIRROR = "translate(200,0) scale(-1,1)";
const BODY_FILL = "#262626"; // neutral-800
const BODY_EDGE = "#404040"; // neutral-700
const LIME = "163, 230, 53"; // lime-400

/** Untrained muscles stay body-grey; the most-worked one is full lime. */
function heatFill(percent: number | undefined, max: number): string {
  if (!percent) return BODY_FILL;
  return `rgba(${LIME}, ${(0.22 + 0.78 * (percent / max)).toFixed(3)})`;
}

function formatPercent(p: number) {
  return p >= 1 ? `${Math.round(p)}%` : "<1%";
}

/** Front and back of the body, each muscle shaded by its share. Tap a muscle to name it. */
export function BodyMap({ shares }: { shares: MuscleShare[] }) {
  const [picked, setPicked] = useState<Muscle | null>(null);
  if (shares.length === 0) return null;

  const max = shares[0].percent;
  const byMuscle = new Map(shares.map((s) => [s.muscle, s.percent]));
  // Show the most-worked muscle until the user taps one
  const selected = picked ?? shares[0].muscle;
  const selectedPercent = byMuscle.get(selected);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {(["front", "back"] as const).map((view) => (
          <Figure
            key={view}
            view={view}
            fillFor={(m) => heatFill(byMuscle.get(m), max)}
            selected={selected}
            onPick={(m) => setPicked(m === picked ? null : m)}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-neutral-500">
        <span>Not worked</span>
        <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-neutral-800 via-lime-400/40 to-lime-400" />
        <span>Most worked</span>
      </div>

      <p className="flex items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs" aria-live="polite">
        <span className="font-semibold text-neutral-200">{MUSCLES[selected].label}</span>
        <span className="font-bold tabular-nums text-lime-400">
          {selectedPercent ? formatPercent(selectedPercent) : "not worked"}
        </span>
      </p>
    </div>
  );
}

function Figure({
  view,
  fillFor,
  selected,
  onPick,
}: {
  view: BodyView;
  fillFor: (muscle: Muscle) => string;
  selected: Muscle;
  onPick: (muscle: Muscle) => void;
}) {
  const shapes = Object.entries(MUSCLE_SHAPES[view]) as [Muscle, string][];

  return (
    <figure className="m-0 flex flex-col items-center gap-1">
      <svg viewBox={`0 0 200 ${VIEW_HEIGHT}`} className="h-auto w-full max-w-[160px]" role="img" aria-label={`${view} of body`}>
        <g fill={BODY_FILL} stroke={BODY_EDGE} strokeWidth={1}>
          <ellipse {...HEAD} />
          <rect {...NECK} />
          {OUTLINE_HALF.map((d) => (
            <g key={d}>
              <path d={d} />
              <path d={d} transform={MIRROR} />
            </g>
          ))}
        </g>
        {shapes.map(([muscle, d]) =>
          [undefined, MIRROR].map((transform) => (
            <path
              key={`${muscle}-${transform ?? "left"}`}
              d={d}
              transform={transform}
              fill={fillFor(muscle)}
              stroke={muscle === selected ? "#f5f5f5" : "#0a0a0a"}
              strokeWidth={muscle === selected ? 1.6 : 1.2}
              className="cursor-pointer transition-[fill] duration-300 motion-reduce:transition-none"
              onClick={() => onPick(muscle)}
            >
              <title>{MUSCLES[muscle].label}</title>
            </path>
          )),
        )}
      </svg>
      <figcaption className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
        {view}
      </figcaption>
    </figure>
  );
}

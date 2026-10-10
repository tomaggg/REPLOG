import { mixToShares, musclesFor } from "~/lib/muscles";
import { REGION_COLORS } from "./regionColors";

/** Muscles below this share are too minor to list. */
const MIN_PERCENT = 8;

/**
 * The muscles one exercise works, biggest first, with their share.
 * `compact` is a single line of names (for the workout screen).
 */
export function MuscleTags({
  exerciseId,
  group,
  compact = false,
}: {
  exerciseId: string;
  group: string | undefined;
  compact?: boolean;
}) {
  const shares = mixToShares(musclesFor(exerciseId, group), MIN_PERCENT);
  if (shares.length === 0) return null;

  if (compact) {
    return (
      <p className="truncate text-[11px] text-neutral-500">
        {shares.map((s) => s.label).join(" · ")}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {shares.map((s, i) => (
        <span
          key={s.muscle}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] ${
            i === 0 ? "border-neutral-600 bg-neutral-800" : "border-neutral-800 bg-neutral-950/60"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${REGION_COLORS[s.region].bar}`} />
          <span className={i === 0 ? "font-semibold text-neutral-100" : "text-neutral-300"}>
            {s.label}
          </span>
          <span className="tabular-nums text-neutral-500">{Math.round(s.percent)}%</span>
        </span>
      ))}
    </div>
  );
}

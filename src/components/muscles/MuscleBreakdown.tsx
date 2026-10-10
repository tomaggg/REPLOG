import { useState } from "react";
import { Card } from "~/components/ui/Card";
import { regionBreakdown, type MuscleShare } from "~/lib/muscles";
import { REGION_COLORS } from "./regionColors";

/** Muscles shown before "Show all". */
const TOP_COUNT = 6;

function formatPercent(p: number) {
  return p >= 1 ? `${Math.round(p)}%` : "<1%";
}

/**
 * "Muscles worked" card: a stacked bar by body region, then each muscle's
 * share of the session's work.
 */
export function MuscleBreakdown({
  shares,
  caption,
}: {
  shares: MuscleShare[];
  /** e.g. "Based on 12 completed sets" */
  caption: string;
}) {
  const [showAll, setShowAll] = useState(false);
  if (shares.length === 0) return null;

  const regions = regionBreakdown(shares);
  const visible = showAll ? shares : shares.slice(0, TOP_COUNT);
  const biggest = shares[0].percent;

  return (
    <Card className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-bold text-neutral-100">Muscles worked</h3>
        <span className="text-[10px] text-neutral-500">{caption}</span>
      </div>

      {/* Body regions as one stacked bar, with a legend */}
      <div className="flex h-2.5 overflow-hidden rounded-full bg-neutral-800">
        {regions.map((r) => (
          <div
            key={r.region}
            className={REGION_COLORS[r.region].bar}
            style={{ width: `${r.percent}%` }}
            title={`${r.region} ${formatPercent(r.percent)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
        {regions.map((r) => (
          <span key={r.region} className="inline-flex items-center gap-1.5 text-neutral-400">
            <span className={`h-2 w-2 rounded-full ${REGION_COLORS[r.region].bar}`} />
            {r.region}
            <span className="font-semibold text-neutral-200">{formatPercent(r.percent)}</span>
          </span>
        ))}
      </div>

      {/* Each muscle; bar length is relative to the most-worked muscle */}
      <ul className="space-y-2 border-t border-neutral-800/80 pt-3">
        {visible.map((s) => (
          <li key={s.muscle} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="min-w-0 truncate text-neutral-300">{s.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-neutral-100">
                {formatPercent(s.percent)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
              <div
                className={`h-full rounded-full ${REGION_COLORS[s.region].bar}`}
                style={{ width: `${(s.percent / biggest) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      {shares.length > TOP_COUNT ? (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-semibold text-lime-400 hover:underline"
        >
          {showAll ? "Show less" : `Show all ${shares.length} muscles`}
        </button>
      ) : null}
    </Card>
  );
}

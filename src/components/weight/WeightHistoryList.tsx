import { CollapsibleCard } from "~/components/ui/CollapsibleCard";
import { Spinner } from "~/components/ui/Spinner";
import { bmi } from "~/lib/bmi";
import { longDate, shortTime, type DisplayWeightEntry } from "~/lib/weight";
import type { Unit } from "~/types/workout";

export function WeightHistoryList({
  logs,
  unit,
  loading,
  heightCm,
}: {
  logs: DisplayWeightEntry[];
  unit: Unit;
  loading: boolean;
  /** Shows each entry's BMI when known */
  heightCm: number | null;
}) {
  const latest = logs[0];
  const summary = loading
    ? "Loading…"
    : latest
      ? `${logs.length} ${logs.length === 1 ? "entry" : "entries"} · latest ${latest.displayWeight.toFixed(1)} ${unit}`
      : "No entries yet";

  return (
    <CollapsibleCard title="History" summary={summary}>
      {loading ? (
        <Spinner label="Loading weight history…" />
      ) : logs.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-neutral-500">No weight entries recorded yet.</p>
          <p className="mt-1 text-xs text-neutral-600">
            Log your first body weight entry using the form above!
          </p>
        </div>
      ) : (
        <div className="-my-3 divide-y divide-neutral-800/80">
          {logs.map((log) => (
            <HistoryRow key={log.id} log={log} unit={unit} heightCm={heightCm} />
          ))}
        </div>
      )}
    </CollapsibleCard>
  );
}

function HistoryRow({
  log,
  unit,
  heightCm,
}: {
  log: DisplayWeightEntry;
  unit: Unit;
  heightCm: number | null;
}) {
  return (
    <div className="flex items-center justify-between py-3 transition-colors hover:bg-neutral-800/20">
      <div>
        <p className="text-sm font-medium text-neutral-200">{longDate(log.timestamp)}</p>
        <p className="text-[11px] text-neutral-500">
          {shortTime(log.timestamp)}
          {/* Show the original value when it was logged in the other unit */}
          {log.originalUnit !== unit ? (
            <span className="ml-1 text-neutral-600">
              (recorded: {log.weight} {log.originalUnit})
            </span>
          ) : null}
        </p>
      </div>
      <div className="text-right">
        <span className="text-base font-extrabold text-lime-400">
          {log.displayWeight.toFixed(1)}
        </span>{" "}
        <span className="text-xs font-semibold text-neutral-400">{unit}</span>
        {heightCm !== null ? (
          <p className="text-[11px] tabular-nums text-neutral-500">
            BMI {bmi(log.weight, log.originalUnit, heightCm).toFixed(1)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

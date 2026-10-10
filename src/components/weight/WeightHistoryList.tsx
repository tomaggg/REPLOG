import { Spinner } from "~/components/ui/Spinner";
import { longDate, shortTime, type DisplayWeightEntry } from "~/lib/weight";
import type { Unit } from "~/types/workout";

export function WeightHistoryList({
  logs,
  unit,
  loading,
}: {
  logs: DisplayWeightEntry[];
  unit: Unit;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-neutral-200">History ({logs.length})</h2>
        <span className="text-[11px] text-neutral-500">
          All logs converted to {unit.toUpperCase()}
        </span>
      </div>

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
        <div className="divide-y divide-neutral-800/80">
          {logs.map((log) => (
            <HistoryRow key={log.id} log={log} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryRow({ log, unit }: { log: DisplayWeightEntry; unit: Unit }) {
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
      </div>
    </div>
  );
}

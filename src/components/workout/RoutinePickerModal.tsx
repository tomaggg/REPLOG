import { Link } from "@tanstack/react-router";
import { FullScreenPicker } from "~/components/ui/FullScreenPicker";
import { Spinner } from "~/components/ui/Spinner";
import { useRoutines } from "~/hooks/useRoutines";
import type { Routine } from "~/types/workout";

function plural(n: number, word: string) {
  return `${n} ${n === 1 ? word : `${word}s`}`;
}

export function RoutinePickerModal({
  onPick,
  onClose,
}: {
  onPick: (routine: Routine) => void;
  onClose: () => void;
}) {
  const { routines, loading, error } = useRoutines();

  return (
    <FullScreenPicker
      header={<h2 className="text-lg font-bold text-neutral-100">Start Routine</h2>}
      onClose={onClose}
    >
      {loading ? (
        <Spinner label="Loading routines…" />
      ) : error ? (
        <p className="py-8 text-center text-sm text-red-400">{error}</p>
      ) : routines.length === 0 ? (
        <div className="space-y-3 py-8 text-center">
          <p className="text-sm text-neutral-500">You don't have any routines yet.</p>
          <Link
            to="/routines"
            className="inline-block text-sm font-semibold text-lime-400 hover:underline"
          >
            Create a routine →
          </Link>
        </div>
      ) : (
        <ul className="space-y-2 pb-8">
          {routines.map((routine) => {
            const totalSets = routine.exercises.reduce((n, ex) => n + ex.targetSets, 0);
            return (
              <li key={routine.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(routine);
                    onClose();
                  }}
                  className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-left hover:border-neutral-700 active:scale-[0.99]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-medium text-neutral-100">
                      {routine.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-neutral-500">
                      {routine.exercises.map((ex) => ex.exerciseName).join(" · ")}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-neutral-600">
                      {plural(routine.exercises.length, "exercise")} · {plural(totalSets, "set")}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-lime-400">Start</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </FullScreenPicker>
  );
}

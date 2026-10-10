import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Spinner } from "~/components/ui/Spinner";
import { useStore } from "~/context/StoreContext";
import type { Routine } from "~/types/workout";

export function RoutinePickerModal({
  onPick,
  onClose,
}: {
  onPick: (routine: Routine) => void;
  onClose: () => void;
}) {
  const { store } = useStore();
  const [routines, setRoutines] = useState<Routine[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!store) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await store.listRoutines();
        if (!cancelled) setRoutines(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load routines.");
          setRoutines([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-neutral-800 px-4 pt-4 pb-3">
          <h2 className="text-lg font-bold text-neutral-100">Start Routine</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-xl px-3 text-sm font-medium text-neutral-300 hover:text-neutral-100"
          >
            Cancel
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {routines === null ? (
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
                          {routine.exercises.length}{" "}
                          {routine.exercises.length === 1 ? "exercise" : "exercises"} · {totalSets}{" "}
                          {totalSets === 1 ? "set" : "sets"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-lime-400">Start</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

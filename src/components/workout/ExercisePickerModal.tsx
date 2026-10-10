import { useEffect, useMemo, useState } from "react";
import { searchExercises } from "~/services/exercises";
import { useStore } from "~/context/StoreContext";
import type { Exercise } from "~/types/workout";

export function ExercisePickerModal({
  onPick,
  onClose,
  excludeIds = [],
}: {
  onPick: (exercise: Exercise) => void;
  onClose: () => void;
  excludeIds?: string[];
}) {
  const { store } = useStore();
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!store) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await store.listCustomExercises();
        if (!cancelled) setCustomExercises(list);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  const results = useMemo(
    () => searchExercises(query, customExercises),
    [query, customExercises],
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-950/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 pt-4 pb-3">
          <span className="flex flex-1 items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-3 focus-within:border-lime-400">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              inputMode="text"
              placeholder="Search exercises…"
              className="min-h-12 w-full min-w-0 bg-transparent text-base text-neutral-100 outline-none placeholder:text-neutral-600"
            />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-12 rounded-xl px-3 text-sm font-medium text-neutral-300 hover:text-neutral-100"
          >
            Cancel
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          {results.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              No exercise matches “{query}”.
            </p>
          ) : (
            <ul className="space-y-2 pb-8">
              {results.map((exercise) => {
                const already = excludeIds.includes(exercise.id);
                return (
                  <li key={exercise.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onPick(exercise);
                        onClose();
                      }}
                      className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-left hover:border-neutral-700 active:scale-[0.99]"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-medium text-neutral-100">
                          {exercise.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-neutral-500">{exercise.group}</span>
                          {exercise.videoUrl ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-lime-400">
                              ▶ Video
                            </span>
                          ) : null}
                          {exercise.notes ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-400">
                              ✎ Note
                            </span>
                          ) : null}
                        </div>
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-lime-400">
                        {already ? "+ Set" : "Add"}
                      </span>
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

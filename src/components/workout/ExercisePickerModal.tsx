import { useMemo, useState } from "react";
import { FullScreenPicker } from "~/components/ui/FullScreenPicker";
import { useCustomExercises } from "~/hooks/useCustomExercises";
import { searchExercises } from "~/services/exercises";
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
  const { customExercises } = useCustomExercises();
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => searchExercises(query, customExercises),
    [query, customExercises],
  );

  const searchBox = (
    <span className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-3 focus-within:border-lime-400">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        inputMode="text"
        placeholder="Search exercises…"
        className="min-h-12 w-full min-w-0 bg-transparent text-base text-neutral-100 outline-none placeholder:text-neutral-600"
      />
    </span>
  );

  return (
    <FullScreenPicker header={searchBox} onClose={onClose}>
      {results.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">
          No exercise matches “{query}”.
        </p>
      ) : (
        <ul className="space-y-2 pb-8">
          {results.map((exercise) => (
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
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-neutral-500">{exercise.group}</span>
                    {exercise.videoUrl ? (
                      <span className="text-[10px] text-lime-400">▶ Video</span>
                    ) : null}
                    {exercise.notes ? (
                      <span className="text-[10px] text-neutral-400">✎ Note</span>
                    ) : null}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-lime-400">
                  {excludeIds.includes(exercise.id) ? "+ Set" : "Add"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </FullScreenPicker>
  );
}

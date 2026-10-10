import type { Exercise, SetEntry } from "~/types/workout";
import { Modal } from "~/components/ui/Modal";

export interface ExerciseHistory {
  last: SetEntry[];
  best: SetEntry | null;
  sessions: number;
}

export function ExerciseHistoryDrawer({
  exerciseName,
  exercise,
  history,
  onClose,
}: {
  exerciseName: string;
  exercise?: Exercise;
  history: ExerciseHistory | undefined;
  onClose: () => void;
}) {
  const best = history?.best;
  const last = history?.last ?? [];

  return (
    <Modal title={exerciseName} onClose={onClose}>
      <div className="space-y-4">
        {/* Exercise Reference: Video link & Notes */}
        {exercise && (exercise.videoUrl || exercise.notes) ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">Exercise Reference</span>
              {exercise.group ? (
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                  {exercise.group}
                </span>
              ) : null}
            </div>

            {exercise.videoUrl ? (
              <div>
                <a
                  href={exercise.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-lime-400/10 border border-lime-400/30 px-2.5 py-1 text-xs font-semibold text-lime-400 hover:bg-lime-400 hover:text-neutral-950 transition-colors"
                >
                  <span>▶ Watch Video Reference</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ) : null}

            {exercise.notes ? (
              <div className="rounded-lg bg-neutral-900/80 p-2.5 text-xs text-neutral-300 whitespace-pre-wrap border border-neutral-800/80">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Personal Form Notes
                </p>
                {exercise.notes}
              </div>
            ) : null}
          </div>
        ) : null}

        {history && history.sessions > 0 ? (
          <>
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Logged in {history.sessions} session{history.sessions === 1 ? "" : "s"}</span>
              {best ? (
                <span className="font-semibold text-lime-400">
                  PR: {best.weight} {best.unit} × {best.reps}
                </span>
              ) : null}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Most Recent Performance
              </h4>
              <ul className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-950 px-3">
                {last.map((s, idx) => (
                  <li key={s.id || idx} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-neutral-500">Set {idx + 1}</span>
                    <span className="font-semibold text-neutral-100">
                      {s.weight} {s.unit} × {s.reps}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-neutral-500">
            No previous history logged for this exercise yet.
          </p>
        )}
      </div>
    </Modal>
  );
}

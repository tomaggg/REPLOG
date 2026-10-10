import { bestSet } from "~/types/workout";
import type { SetEntry } from "~/types/workout";
import { Modal } from "~/components/ui/Modal";

export interface ExerciseHistory {
  last: SetEntry[];
  best: SetEntry | null;
  sessions: number;
}

export function ExerciseHistoryDrawer({
  exerciseName,
  history,
  onClose,
}: {
  exerciseName: string;
  history: ExerciseHistory | undefined;
  onClose: () => void;
}) {
  const best = history?.best;
  const last = history?.last ?? [];

  return (
    <Modal title={exerciseName} onClose={onClose}>
      <div className="space-y-4">
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

import { useEffect, useState } from "react";
import { Banner } from "~/components/ui/Banner";
import { Button } from "~/components/ui/Button";
import { Modal } from "~/components/ui/Modal";
import { formatDuration } from "~/components/ui/formatters";
import type { FinishDetails } from "~/hooks/useActiveWorkout";
import type { Workout } from "~/types/workout";


function toDatetimeLocal(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function fromDatetimeLocal(s: string): number | null {
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

function formatShort(ms: number): string {
  try {
    return new Date(ms).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(ms);
  }
}

function DateTimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (timestamp: number) => void;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label className="block text-sm font-semibold text-neutral-300">
        {label}
      </label>

      <div className="relative min-w-0">
        <input
          type="datetime-local"
          value={toDatetimeLocal(value)}
          onChange={(e) => {
            const timestamp = fromDatetimeLocal(e.target.value);
            if (timestamp !== null) onChange(timestamp);
          }}
          className="
            block min-h-12 w-full min-w-0 max-w-full
            appearance-none rounded-xl
            border border-neutral-700 bg-neutral-950
            px-3 py-3 text-base text-neutral-100
            outline-none
            focus:border-lime-400 focus:ring-1 focus:ring-lime-400
            [color-scheme:dark]
          "
        />
      </div>

      <p className="text-xs text-neutral-500">
        {formatShort(value)}
      </p>
    </div>
  );
}

/** Review step before saving: adjust start/end time and the session note. */
export function FinishWorkoutModal({
  draft,
  exerciseCount,
  setCount,
  busy,
  onChange,
  onFinish,
  onClose,
}: {
  draft: Workout;
  exerciseCount: number;
  setCount: number;
  busy: boolean;
  onChange: (next: Workout) => void;
  onFinish: (details: FinishDetails) => void;
  onClose: () => void;
}) {
  const [startedAt, setStartedAt] = useState<number>(draft.startedAt);
  const [finishedAt, setFinishedAt] = useState<number>(Date.now());
  const [note, setNote] = useState<string>(draft.note || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ((draft.note ?? "") !== note) {
      onChange({ ...draft, note });
    }
  }, [note, draft, onChange]);

  function save() {
    if (finishedAt <= startedAt) {
      setError("End time must be after the start time.");
      return;
    }
    setError(null);
    onFinish({ startedAt, finishedAt, note: note.trim() });
    onClose();
  }

  return (
    <Modal title="Finish Workout" onClose={() => !busy && onClose()}>
      <div className="space-y-4">
        {error ? <Banner tone="error">{error}</Banner> : null}

        {/* Summary */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3 space-y-1 text-xs">
          <div className="flex justify-between text-neutral-300">
            <span>Exercises</span>
            <span className="font-semibold text-neutral-100">{exerciseCount}</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span>Total sets</span>
            <span className="font-semibold text-neutral-100">{setCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DateTimeField label="Start Time" value={startedAt} onChange={setStartedAt} />
          <DateTimeField label="End Time" value={finishedAt} onChange={setFinishedAt} />
        </div>

        {/* Duration */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2 text-xs flex justify-between items-center">
          <span className="text-neutral-400">Duration</span>
          <span className="font-bold text-lime-400">
            {formatDuration(startedAt, finishedAt)}
          </span>
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-neutral-400">
            Session Notes
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Leg Day · Added 2.5kg to squat, elbows felt good on bench…"
            rows={4}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:border-lime-400 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="secondary" size="md" disabled={busy} onClick={onClose}>
            Back
          </Button>
          <Button
            variant="primary"
            size="md"
            disabled={busy || finishedAt <= startedAt}
            onClick={save}
          >
            {busy ? "Saving…" : "Save & Finish"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

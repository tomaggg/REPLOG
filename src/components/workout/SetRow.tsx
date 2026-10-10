import { CheckIcon, CloseIcon } from "~/components/ui/icons";
import { prLabel } from "~/lib/records";
import type { PRKind, SetEntry } from "~/types/workout";
import { NumberInput } from "./NumberInput";

export function SetRow({
  set,
  index,
  exerciseName,
  previous,
  pr,
  onEdit,
  onToggleDone,
  onRemove,
}: {
  set: SetEntry;
  index: number;
  exerciseName: string;
  /** The matching set from last session, shown as a faint hint in empty boxes */
  previous?: { weight: number; reps: number };
  /** Set when this (ticked) set beats the exercise's records */
  pr?: PRKind;
  onEdit: (patch: Partial<SetEntry>) => void;
  onToggleDone: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`-mx-1.5 rounded-xl px-1.5 py-1 transition-colors ${
        pr ? "bg-amber-400/10" : set.done ? "bg-lime-400/10" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="w-6 shrink-0 text-center text-sm font-semibold text-neutral-500">{index}</span>
        <div className="min-w-0 flex-1">
          <NumberInput
            value={set.weight}
            inputMode="decimal"
            ariaLabel={`${exerciseName} set ${index} weight`}
            placeholder={previous ? String(previous.weight) : "0"}
            onCommit={(n) => onEdit({ weight: n })}
          />
        </div>
        <span className="w-6 shrink-0 text-center text-xs text-neutral-500">{set.unit}</span>
        <span className="shrink-0 text-neutral-600">×</span>
        <div className="min-w-0 flex-1">
          <NumberInput
            value={set.reps}
            inputMode="numeric"
            ariaLabel={`${exerciseName} set ${index} reps`}
            placeholder={previous ? String(previous.reps) : "0"}
            onCommit={(n) => onEdit({ reps: n })}
          />
        </div>
        <button
          type="button"
          aria-label={`Mark ${exerciseName} set ${index} as done`}
          aria-pressed={!!set.done}
          onClick={onToggleDone}
          className={`flex min-h-12 w-11 shrink-0 items-center justify-center rounded-xl active:scale-95 ${
            set.done
              ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
              : "border border-neutral-700 text-neutral-600 hover:border-lime-400/60 hover:text-lime-400"
          }`}
        >
          <CheckIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={`Remove ${exerciseName} set ${index}`}
          onClick={onRemove}
          className="flex min-h-12 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-700 text-neutral-600 hover:border-red-400/60 hover:text-red-400 active:scale-95"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
      {pr ? (
        <p className="pt-1 pl-8 text-[11px] font-bold text-amber-400">🏆 {prLabel(pr)}</p>
      ) : null}
    </div>
  );
}

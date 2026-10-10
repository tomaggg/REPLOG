import { CheckIcon, CloseIcon } from "~/components/ui/icons";
import type { SetEntry } from "~/types/workout";
import { NumberInput } from "./NumberInput";

export function SetRow({
  set,
  index,
  exerciseName,
  onEdit,
  onToggleDone,
  onRemove,
}: {
  set: SetEntry;
  index: number;
  exerciseName: string;
  onEdit: (patch: Partial<SetEntry>) => void;
  onToggleDone: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`-mx-1.5 flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors ${
        set.done ? "bg-lime-400/10" : ""
      }`}
    >
      <span className="w-6 shrink-0 text-center text-sm font-semibold text-neutral-500">{index}</span>
      <div className="min-w-0 flex-1">
        <NumberInput
          value={set.weight}
          inputMode="decimal"
          ariaLabel={`${exerciseName} set ${index} weight`}
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
  );
}

import { useEffect, useRef, useState } from "react";
import type { SetEntry, Unit } from "~/types/workout";
import { NumberInput } from "./NumberInput";

export function SetRow({
  set,
  index,
  exerciseName,
  onEdit,
  onRemove,
}: {
  set: SetEntry;
  index: number;
  exerciseName: string;
  onEdit: (patch: Partial<SetEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
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
        aria-label={`Remove ${exerciseName} set ${index}`}
        onClick={onRemove}
        className="min-h-12 w-9 shrink-0 rounded-xl border border-neutral-800 text-lg leading-none text-neutral-500 hover:border-red-900/50 hover:text-red-400 active:scale-95"
      >
        ×
      </button>
    </div>
  );
}

/**
 * The "+" row under the sets. It is pre-filled from `seed` (the previous set)
 * until the user types in it, then keeps what they typed.
 */
export function AddSetRow({
  unit,
  exerciseName,
  seed,
  onAdd,
}: {
  unit: Unit;
  exerciseName: string;
  seed: { weight: number; reps: number };
  onAdd: (weight: number, reps: number) => void;
}) {
  const [weight, setWeight] = useState(seed.weight);
  const [reps, setReps] = useState(seed.reps);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current) {
      setWeight(seed.weight);
      setReps(seed.reps);
    }
  }, [seed.weight, seed.reps]);

  return (
    <div className="flex items-center gap-2">
      <span className="w-6 shrink-0 text-center text-sm text-neutral-600">+</span>
      <div className="min-w-0 flex-1">
        <NumberInput
          value={weight}
          inputMode="decimal"
          ariaLabel={`${exerciseName} new set weight`}
          onCommit={(n) => {
            touched.current = true;
            setWeight(n);
          }}
        />
      </div>
      <span className="w-6 shrink-0 text-center text-xs text-neutral-500">{unit}</span>
      <span className="shrink-0 text-neutral-600">×</span>
      <div className="min-w-0 flex-1">
        <NumberInput
          value={reps}
          inputMode="numeric"
          ariaLabel={`${exerciseName} new set reps`}
          onCommit={(n) => {
            touched.current = true;
            setReps(n);
          }}
        />
      </div>
      <button
        type="button"
        aria-label={`Add ${exerciseName} set`}
        onClick={() => onAdd(weight, reps)}
        className="min-h-12 w-9 shrink-0 rounded-xl bg-lime-400 text-xl leading-none font-bold text-neutral-950 hover:bg-lime-300 active:scale-95"
      >
        +
      </button>
    </div>
  );
}

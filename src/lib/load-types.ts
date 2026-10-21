// How each tracking type is shown and compared. See LoadType in types/workout.ts.

import type { Exercise, LoadType, SetEntry } from "~/types/workout";
import { convertWeight } from "./weight";

export const LOAD_TYPES: Record<LoadType, { label: string; hint: string }> = {
  weighted: { label: "Weighted", hint: "Weight × reps. Heavier is better." },
  bodyweight: { label: "Bodyweight", hint: "Reps only, no weight." },
  assisted: { label: "Assisted", hint: "Machine assistance × reps. Less assistance is better." },
  timed: { label: "Timed", hint: "Seconds held, no weight." },
};

export function loadTypeOf(exercise: Exercise | undefined): LoadType {
  return exercise?.loadType ?? "weighted";
}

export function setLoadType(set: SetEntry): LoadType {
  return set.loadType ?? "weighted";
}

/** Whether the weight box is shown for this type. */
export function usesWeight(type: LoadType): boolean {
  return type === "weighted" || type === "assisted";
}

/** A set as text: "60 kg × 8", "BW × 12", "20 kg assist × 8", "45 s". */
export function formatSet(set: SetEntry): string {
  switch (setLoadType(set)) {
    case "bodyweight":
      return `BW × ${set.reps}`;
    case "assisted":
      return `${set.weight} ${set.unit} assist × ${set.reps}`;
    case "timed":
      return `${set.reps} s`;
    default:
      return `${set.weight} ${set.unit} × ${set.reps}`;
  }
}

/** Does this set have enough numbers to say anything about progress? */
export function setCounts(set: SetEntry, type: LoadType): boolean {
  return type === "weighted" ? set.weight > 0 && set.reps > 0 : set.reps > 0;
}

function kg(set: SetEntry): number {
  return convertWeight(set.weight, set.unit, "kg");
}

/** True when `a` is a better set than `b` for this tracking type. */
export function isBetterSet(a: SetEntry, b: SetEntry, type: LoadType): boolean {
  switch (type) {
    case "bodyweight":
    case "timed":
      return a.reps > b.reps;
    case "assisted":
      // Less help wins; with the same help, more reps wins
      return kg(a) < kg(b) || (kg(a) === kg(b) && a.reps > b.reps);
    default:
      return kg(a) > kg(b) || (kg(a) === kg(b) && a.reps > b.reps);
  }
}

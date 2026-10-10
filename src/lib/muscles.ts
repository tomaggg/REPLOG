// Which muscles an exercise works, and how a session's work splits across them.
//
// Each exercise has a "muscle mix": relative weights like { lats: 5, biceps: 1 }.
// One set spreads one unit of work across its mix (here 5/6 lats, 1/6 biceps),
// and a session's percentages are those units added up over all its sets.
// Counting sets (not kg lifted) is the usual way to measure training volume per
// muscle, and keeps heavy leg exercises from drowning out everything else.

import { EXERCISE_MUSCLES } from "~/services/exercise-muscles";
import type { SetEntry } from "~/types/workout";

export type Region = "Chest" | "Shoulders" | "Back" | "Arms" | "Core" | "Legs";

/** Every muscle area we track, with its display name and body region. */
export const MUSCLES = {
  upperChest: { label: "Upper chest", region: "Chest" },
  midChest: { label: "Mid chest", region: "Chest" },
  lowerChest: { label: "Lower chest", region: "Chest" },

  frontDelts: { label: "Front delts", region: "Shoulders" },
  sideDelts: { label: "Side delts", region: "Shoulders" },
  rearDelts: { label: "Rear delts", region: "Shoulders" },

  lats: { label: "Lats", region: "Back" },
  midBack: { label: "Mid back (rhomboids, mid traps)", region: "Back" },
  traps: { label: "Upper traps", region: "Back" },
  lowerBack: { label: "Lower back (erectors)", region: "Back" },

  bicepsLong: { label: "Biceps – long head", region: "Arms" },
  bicepsShort: { label: "Biceps – short head", region: "Arms" },
  brachialis: { label: "Brachialis", region: "Arms" },
  forearms: { label: "Forearms", region: "Arms" },
  tricepsLong: { label: "Triceps – long head", region: "Arms" },
  tricepsLateral: { label: "Triceps – lateral & medial", region: "Arms" },

  upperAbs: { label: "Upper abs", region: "Core" },
  lowerAbs: { label: "Lower abs", region: "Core" },
  obliques: { label: "Obliques", region: "Core" },
  deepCore: { label: "Deep core (transverse abs)", region: "Core" },

  quads: { label: "Quads", region: "Legs" },
  hamstrings: { label: "Hamstrings", region: "Legs" },
  glutes: { label: "Glutes", region: "Legs" },
  gluteMed: { label: "Side glutes (medius)", region: "Legs" },
  adductors: { label: "Adductors (inner thigh)", region: "Legs" },
  calves: { label: "Calves", region: "Legs" },
  hipFlexors: { label: "Hip flexors", region: "Legs" },
} as const satisfies Record<string, { label: string; region: Region }>;

export type Muscle = keyof typeof MUSCLES;

/** Relative weights: { lats: 5, biceps: 1 } means mostly lats, a little biceps. */
export type MuscleMix = Partial<Record<Muscle, number>>;

/** Used for custom exercises and anything without its own mix. */
const GROUP_DEFAULTS: Record<string, MuscleMix> = {
  Chest: { midChest: 4, upperChest: 2, lowerChest: 2, frontDelts: 1, tricepsLateral: 1 },
  Back: { lats: 4, midBack: 3, rearDelts: 1, bicepsLong: 1, bicepsShort: 1 },
  Shoulders: { sideDelts: 4, frontDelts: 3, rearDelts: 3 },
  Arms: { bicepsLong: 2, bicepsShort: 2, brachialis: 1, tricepsLong: 2, tricepsLateral: 2, forearms: 1 },
  Core: { upperAbs: 3, lowerAbs: 3, obliques: 2, deepCore: 2 },
  Legs: { quads: 4, glutes: 3, hamstrings: 3, adductors: 1, calves: 1 },
};

/** The muscle mix for an exercise, falling back to its group's default. */
export function musclesFor(exerciseId: string, group: string | undefined): MuscleMix {
  return EXERCISE_MUSCLES[exerciseId] ?? GROUP_DEFAULTS[group ?? ""] ?? {};
}

export interface MuscleShare {
  muscle: Muscle;
  label: string;
  region: Region;
  /** 0–100 */
  percent: number;
}

/** A mix as percentages, biggest first. Shares under `minPercent` are dropped. */
export function mixToShares(mix: MuscleMix, minPercent = 0): MuscleShare[] {
  const total = Object.values(mix).reduce((sum, w) => sum + (w ?? 0), 0);
  if (total === 0) return [];
  return (Object.entries(mix) as [Muscle, number][])
    .map(([muscle, weight]) => ({
      muscle,
      label: MUSCLES[muscle].label,
      region: MUSCLES[muscle].region,
      percent: (weight / total) * 100,
    }))
    .filter((s) => s.percent >= minPercent)
    .sort((a, b) => b.percent - a.percent);
}

/**
 * How a list of sets splits across muscles. Each set adds one unit spread over
 * its exercise's mix. `groupOf` looks up an exercise's group for the fallback.
 */
export function muscleBreakdown(
  sets: SetEntry[],
  groupOf: (exerciseId: string) => string | undefined,
): MuscleShare[] {
  const work: MuscleMix = {};
  for (const set of sets) {
    for (const share of mixToShares(musclesFor(set.exerciseId, groupOf(set.exerciseId)))) {
      work[share.muscle] = (work[share.muscle] ?? 0) + share.percent / 100;
    }
  }
  return mixToShares(work);
}

/** Muscle percentages added up per body region, biggest first. */
export function regionBreakdown(shares: MuscleShare[]): { region: Region; percent: number }[] {
  const totals = new Map<Region, number>();
  for (const s of shares) totals.set(s.region, (totals.get(s.region) ?? 0) + s.percent);
  return [...totals]
    .map(([region, percent]) => ({ region, percent }))
    .sort((a, b) => b.percent - a.percent);
}

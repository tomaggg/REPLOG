// Personal records (PRs). Weights are compared in kg so kg and lb sets mix correctly.
// What counts as "better" depends on how the exercise is tracked (lib/load-types.ts).

import type { ExerciseHistory, LoadType, PRKind, SetEntry } from "~/types/workout";
import { setCounts, setLoadType } from "./load-types";
import { convertWeight } from "./weight";

/**
 * Best numbers from past sessions. Each tracking type uses some of them:
 * weighted → weightKg, e1rmKg · bodyweight/timed → reps · assisted → assistKg, repsAtAssist
 */
export type Records = NonNullable<ExerciseHistory["records"]>;

/**
 * Estimated one-rep max (Epley formula): what you could probably lift once,
 * judging by a heavier-than-1 rep set. 100 kg × 5 ≈ 117 kg.
 */
export function estimatedOneRepMax(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (1 + reps / 30);
}

function toKg(set: SetEntry): number {
  return convertWeight(set.weight, set.unit, "kg");
}

/** The best numbers in a list of sets, or null if none have reps. */
export function recordsOf(sets: SetEntry[]): Records | null {
  const valid = sets.filter((s) => s.reps > 0);
  if (valid.length === 0) return null;
  const weighted = valid.filter((s) => s.weight > 0);
  const assistKg = Math.min(...valid.map(toKg));
  return {
    weightKg: Math.max(0, ...weighted.map(toKg)),
    e1rmKg: Math.max(0, ...weighted.map((s) => estimatedOneRepMax(toKg(s), s.reps))),
    reps: Math.max(...valid.map((s) => s.reps)),
    assistKg,
    repsAtAssist: Math.max(...valid.filter((s) => toKg(s) === assistKg).map((s) => s.reps)),
  };
}

/** Is `set` a PR against `r`? Updates `r` so later sets today must beat it too. */
function checkSet(set: SetEntry, r: Records, type: LoadType): PRKind | null {
  const kg = toKg(set);
  switch (type) {
    case "bodyweight":
    case "timed": {
      const pr = set.reps > r.reps ? (type === "timed" ? "time" : "reps") : null;
      r.reps = Math.max(r.reps, set.reps);
      return pr;
    }
    case "assisted": {
      let pr: PRKind | null = null;
      if (kg < r.assistKg) {
        pr = "assist";
        r.assistKg = kg;
        r.repsAtAssist = set.reps;
      } else if (kg === r.assistKg && set.reps > r.repsAtAssist) {
        pr = "reps";
        r.repsAtAssist = set.reps;
      }
      return pr;
    }
    default: {
      const e1rm = estimatedOneRepMax(kg, set.reps);
      const pr = kg > r.weightKg ? "weight" : e1rm > r.e1rmKg ? "e1rm" : null;
      r.weightKg = Math.max(r.weightKg, kg);
      r.e1rmKg = Math.max(r.e1rmKg, e1rm);
      return pr;
    }
  }
}

/**
 * Which of today's sets for ONE exercise are PRs. Each done set is compared
 * with past sessions and the earlier sets today. Returns set id → kind.
 * The first time someone does an exercise there's nothing to beat, so no PRs.
 */
export function findPRs(
  sets: SetEntry[],
  history: ExerciseHistory | undefined,
  type: LoadType,
): Map<string, PRKind> {
  const prs = new Map<string, PRKind>();
  if (!history?.records) return prs;

  const running = { ...history.records };
  const inOrder = [...sets].sort((a, b) => a.setIndex - b.setIndex);
  for (const set of inOrder) {
    if (!set.done || !setCounts(set, type)) continue;
    const pr = checkSet(set, running, type);
    if (pr) prs.set(set.id, pr);
  }
  return prs;
}

/** Stamp `pr` on the sets of a workout that's being finished, for history. */
export function markPRs(sets: SetEntry[], history: Record<string, ExerciseHistory>): SetEntry[] {
  const prs = new Map<string, PRKind>();
  const byExercise = new Map<string, SetEntry[]>();
  for (const set of sets) {
    byExercise.set(set.exerciseId, [...(byExercise.get(set.exerciseId) ?? []), set]);
  }
  for (const [exerciseId, list] of byExercise) {
    const type = setLoadType(list[0]);
    for (const [id, kind] of findPRs(list, history[exerciseId], type)) prs.set(id, kind);
  }
  return sets.map((s) => {
    const { pr: _old, ...rest } = s;
    const kind = prs.get(s.id);
    return kind ? { ...rest, pr: kind } : rest;
  });
}

const PR_LABELS: Record<PRKind, string> = {
  weight: "New weight PR",
  e1rm: "New rep PR",
  reps: "New rep PR",
  assist: "Less assistance PR",
  time: "Longest hold PR",
};

export function prLabel(kind: PRKind): string {
  return PR_LABELS[kind];
}

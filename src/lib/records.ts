// Personal records (PRs). All comparisons happen in kg so kg and lb sets mix correctly.

import type { ExerciseHistory, PRKind, SetEntry } from "~/types/workout";
import { convertWeight } from "./weight";

export interface Records {
  /** Heaviest weight ever lifted */
  weightKg: number;
  /** Best estimated one-rep max */
  e1rmKg: number;
}

/**
 * Estimated one-rep max (Epley formula): what you could probably lift once,
 * judging by a heavier-than-1 rep set. 100 kg × 5 ≈ 117 kg.
 */
export function estimatedOneRepMax(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (1 + reps / 30);
}

/** Only sets with both a weight and reps say anything about strength. */
function counts(set: SetEntry): boolean {
  return set.weight > 0 && set.reps > 0;
}

function toKg(set: SetEntry): number {
  return convertWeight(set.weight, set.unit, "kg");
}

/** The best numbers in a list of sets, or null if none count. */
export function recordsOf(sets: SetEntry[]): Records | null {
  const valid = sets.filter(counts);
  if (valid.length === 0) return null;
  return {
    weightKg: Math.max(...valid.map(toKg)),
    e1rmKg: Math.max(...valid.map((s) => estimatedOneRepMax(toKg(s), s.reps))),
  };
}

/**
 * Which of today's sets for ONE exercise are PRs. Each done set is compared
 * with past sessions and the earlier sets today. Returns set id → kind.
 * The first time someone does an exercise there's nothing to beat, so no PRs.
 */
export function findPRs(sets: SetEntry[], history: ExerciseHistory | undefined): Map<string, PRKind> {
  const prs = new Map<string, PRKind>();
  if (!history?.records) return prs;

  let { weightKg, e1rmKg } = history.records;
  const inOrder = [...sets].sort((a, b) => a.setIndex - b.setIndex);
  for (const set of inOrder) {
    if (!set.done || !counts(set)) continue;
    const kg = toKg(set);
    const e1rm = estimatedOneRepMax(kg, set.reps);
    if (kg > weightKg) prs.set(set.id, "weight");
    else if (e1rm > e1rmKg) prs.set(set.id, "e1rm");
    weightKg = Math.max(weightKg, kg);
    e1rmKg = Math.max(e1rmKg, e1rm);
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
    for (const [id, kind] of findPRs(list, history[exerciseId])) prs.set(id, kind);
  }
  return sets.map((s) => {
    const { pr: _old, ...rest } = s;
    const kind = prs.get(s.id);
    return kind ? { ...rest, pr: kind } : rest;
  });
}

export function prLabel(kind: PRKind): string {
  return kind === "weight" ? "New weight PR" : "New rep PR";
}

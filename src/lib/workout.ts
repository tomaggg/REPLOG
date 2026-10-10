import type {
  ExerciseHistory,
  Routine,
  SetEntry,
  Unit,
  Workout,
} from "~/types/workout";
import { newId } from "./id";

export function emptyWorkout(): Workout {
  return { id: newId(), startedAt: Date.now(), finishedAt: null, note: "", sets: [] };
}

/** Total weight moved in a workout, split by unit. */
export function volumeByUnit(workout: Workout): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of workout.sets ?? []) {
    const v = (Number(s.weight) || 0) * (Number(s.reps) || 0);
    out[s.unit] = (out[s.unit] ?? 0) + v;
  }
  return out;
}

export function formatVolume(workout: Workout): string {
  const parts = Object.entries(volumeByUnit(workout)).map(
    ([unit, v]) => `${Math.round(v).toLocaleString()} ${unit}`,
  );
  return parts.length ? parts.join(" + ") : "—";
}

export interface SetGroup {
  exerciseId: string;
  exerciseName: string;
  sets: SetEntry[];
}

/** Group a flat list of sets by exercise, keeping the order exercises first appear. */
export function groupSets(sets: SetEntry[]): SetGroup[] {
  const groups = new Map<string, SetGroup>();
  for (const s of sets ?? []) {
    let group = groups.get(s.exerciseId);
    if (!group) {
      group = { exerciseId: s.exerciseId, exerciseName: s.exerciseName, sets: [] };
      groups.set(s.exerciseId, group);
    }
    group.sets.push(s);
  }
  for (const group of groups.values()) {
    group.sets.sort((a, b) => a.setIndex - b.setIndex);
  }
  return [...groups.values()];
}

/** Heaviest set; ties go to the one with more reps. */
export function bestSet(sets: SetEntry[]): SetEntry | null {
  let best: SetEntry | null = null;
  for (const s of sets ?? []) {
    if (!best || s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) {
      best = s;
    }
  }
  return best;
}

/**
 * Per-exercise history from past finished workouts.
 * `workouts` must be sorted newest first (as the store returns them).
 */
export function buildExerciseHistory(workouts: Workout[]): Record<string, ExerciseHistory> {
  const out: Record<string, ExerciseHistory> = {};
  const allSets = new Map<string, SetEntry[]>();

  for (const w of workouts) {
    if (!w.finishedAt) continue;
    for (const group of groupSets(w.sets)) {
      const entry = out[group.exerciseId] ?? { last: [], best: null, sessions: 0 };
      entry.sessions += 1;
      // The first workout we see is the newest, so that's "last time"
      if (entry.last.length === 0) entry.last = group.sets;
      out[group.exerciseId] = entry;

      allSets.set(group.exerciseId, [...(allSets.get(group.exerciseId) ?? []), ...group.sets]);
    }
  }

  for (const [exerciseId, sets] of allSets) {
    out[exerciseId].best = bestSet(sets);
  }
  return out;
}

/** Placeholder (0 × 0) sets for each exercise in a routine, to be filled in while logging. */
export function routineSeedSets(routine: Routine, unit: Unit): SetEntry[] {
  const out: SetEntry[] = [];
  for (const ex of routine.exercises) {
    for (let s = 1; s <= ex.targetSets; s++) {
      out.push({
        id: newId(),
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        setIndex: s,
        weight: 0,
        reps: 0,
        unit,
      });
    }
  }
  return out;
}

/**
 * Add a routine's exercises to a workout. Exercises already in the workout are
 * skipped so their logged sets aren't duplicated. An empty note becomes
 * "Routine: <name>".
 */
export function addRoutineToWorkout(workout: Workout, routine: Routine, unit: Unit): Workout {
  const present = new Set(workout.sets.map((s) => s.exerciseId));
  const seeded = routineSeedSets(routine, unit).filter((s) => !present.has(s.exerciseId));
  return {
    ...workout,
    // An empty session starts its clock now
    startedAt: workout.sets.length === 0 ? Date.now() : workout.startedAt,
    note: workout.note.trim() ? workout.note : `Routine: ${routine.name}`,
    sets: [...workout.sets, ...seeded],
  };
}

// Data shapes used across RepLog. This file holds types only — no logic.
// Helpers that work with these types live in ~/lib/workout.ts.

export type Unit = "kg" | "lb";

export interface AuthUser {
  uid: string;
  email: string;
}

export type Sex = "male" | "female";

/** Everything here is optional except the preferred unit — users fill it in when they want. */
export interface UserProfile {
  unit: Unit;
  initialWeightUnit?: Unit;
  /** Latest body weight, in `unit` (kept in sync with weight logs). */
  bodyWeight?: number;
  heightCm?: number;
  sex?: Sex;
  birthYear?: number;
  updatedAt: number;
  /** Rest timer length between sets, in seconds. */
  restSeconds?: number;
  /** Old profiles only: height saved without a unit (cm or inches). Use heightCmOf(). */
  height?: number;
  /** Old profiles only: from the removed first-time form. */
  onboarded?: boolean;
}

export interface WeightEntry {
  id: string;
  timestamp: number;
  weight: number;
  unit: Unit;
}

/** A lift you can log. Includes built-in exercises and user custom exercises. */
export interface Exercise {
  id: string;
  name: string;
  group: string;
  imageUrl?: string;
  videoUrl?: string;
  notes?: string;
  isCustom?: boolean;
  /** How sets are logged; "weighted" when missing. */
  loadType?: LoadType;
}

/** One set: weight lifted, reps performed, for an exercise. */
export interface SetEntry {
  id: string;
  exerciseId: string;
  /** Denormalized so a set is readable on its own (history, best sets). */
  exerciseName: string;
  /** 1-based order of this set within its exercise. */
  setIndex: number;
  /** Weight lifted — or the assistance, for assisted exercises. 0 when not used. */
  weight: number;
  /** Reps — or seconds, for timed exercises. */
  reps: number;
  unit: Unit;
  /** The exercise's tracking type when this set was logged; "weighted" when missing. */
  loadType?: LoadType;
  /** Ticked off while logging. Only done sets are kept when a workout is finished. */
  done?: boolean;
  /** Set when this set was a personal record at the time it was logged. */
  pr?: PRKind;
}

/**
 * How an exercise is tracked:
 * - weighted: weight × reps (heavier is better)
 * - bodyweight: reps only
 * - assisted: machine/band assistance × reps (LESS assistance is better)
 * - timed: seconds held, stored in `reps`
 */
export type LoadType = "weighted" | "bodyweight" | "assisted" | "timed";

/**
 * weight: heaviest ever · e1rm: best estimated one-rep max · reps: most reps
 * (bodyweight, or same assistance) · assist: least assistance · time: longest hold
 */
export type PRKind = "weight" | "e1rm" | "reps" | "assist" | "time";

/**
 * A training session. `finishedAt === null` means it is still in progress
 * (the "active workout" shown on the home page).
 */
export interface Workout {
  id: string;
  /** epoch milliseconds */
  startedAt: number;
  /** epoch milliseconds, or null while in progress */
  finishedAt: number | null;
  note: string;
  sets: SetEntry[];
  /** While resting between sets: when the rest timer runs out (epoch ms). */
  restEndsAt?: number;
}

/** One exercise inside a routine template. */
export interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
}

/** A pre-configured workout template. */
export interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: number;
}

/** What past sessions tell us about one exercise. */
export interface ExerciseHistory {
  /** Sets from the most recent finished session that included this exercise. */
  last: SetEntry[];
  /** Heaviest set ever logged. */
  best: SetEntry | null;
  /** Number of finished sessions that included this exercise. */
  sessions: number;
  /** Best numbers so far, in kg — what a new set must beat to be a PR. */
  records: {
    weightKg: number;
    e1rmKg: number;
    reps: number;
    assistKg: number;
    repsAtAssist: number;
  } | null;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

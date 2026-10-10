// Data shapes used across RepLog. This file holds types only — no logic.
// Helpers that work with these types live in ~/lib/workout.ts.

export type Unit = "kg" | "lb";

export interface AuthUser {
  uid: string;
  email: string;
}

export interface UserProfile {
  unit: Unit;
  initialWeightUnit?: Unit;
  bodyWeight: number;
  height: number;
  onboarded: boolean;
  updatedAt: number;
  /** Rest timer length between sets, in seconds. */
  restSeconds?: number;
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
}

/** One set: weight lifted, reps performed, for an exercise. */
export interface SetEntry {
  id: string;
  exerciseId: string;
  /** Denormalized so a set is readable on its own (history, best sets). */
  exerciseName: string;
  /** 1-based order of this set within its exercise. */
  setIndex: number;
  weight: number;
  reps: number;
  unit: Unit;
  /** Ticked off while logging. Only done sets are kept when a workout is finished. */
  done?: boolean;
  /** Set when this set was a personal record at the time it was logged. */
  pr?: PRKind;
}

/** "weight": heaviest ever. "e1rm": strongest set by estimated one-rep max. */
export type PRKind = "weight" | "e1rm";

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
  records: { weightKg: number; e1rmKg: number } | null;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

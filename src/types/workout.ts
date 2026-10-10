// Core types and domain helpers for RepLog

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
}

/** A training session. `finishedAt === null` means it is in progress. */
export interface Workout {
  id: string;
  /** epoch milliseconds */
  startedAt: number;
  /** epoch milliseconds, or null while open */
  finishedAt: number | null;
  note: string;
  sets: SetEntry[];
}

/** A pre-configured routine template */
export interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: number;
}

/** Everything the app does with accounts and data goes through this interface. */
export interface DataStore {
  kind: "firebase" | "demo";
  onAuthChange(cb: (user: AuthUser | null) => void): () => void;
  signUp(email: string, password: string): Promise<AuthUser>;
  logIn(email: string, password: string): Promise<AuthUser>;
  logOut(): Promise<void>;
  listWorkouts(): Promise<Workout[]>;
  saveWorkout(workout: Workout): Promise<void>;
  deleteWorkout(workoutId: string): Promise<void>;
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  listWeightLogs(): Promise<WeightEntry[]>;
  logBodyWeight(weight: number, unit: Unit): Promise<void>;
  listRoutines(): Promise<Routine[]>;
  saveRoutine(routine: Routine): Promise<void>;
  deleteRoutine(routineId: string): Promise<void>;
  listCustomExercises(): Promise<Exercise[]>;
  saveCustomExercise(exercise: Exercise): Promise<void>;
  deleteCustomExercise(exerciseId: string): Promise<void>;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}

export function emptyWorkout(id: string): Workout {
  return { id, startedAt: Date.now(), finishedAt: null, note: "", sets: [] };
}

export function newId(): string {
  const c = globalThis.crypto;
  if (c && "randomUUID" in c) return c.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Total weight moved in a workout, split by unit. */
export function volumeByUnit(workout: Workout): Record<string, number> {
  const out: Record<string, number> = {};
  const sets = Array.isArray(workout?.sets) ? workout.sets : [];
  for (const s of sets) {
    const v = (Number(s.weight) || 0) * (Number(s.reps) || 0);
    out[s.unit] = (out[s.unit] ?? 0) + v;
  }
  return out;
}

export function formatVolume(workout: Workout): string {
  const byUnit = volumeByUnit(workout);
  const parts = Object.entries(byUnit).map(
    ([unit, v]) => `${Math.round(v).toLocaleString()} ${unit}`,
  );
  return parts.length ? parts.join(" + ") : "—";
}

export function groupSets(
  sets: SetEntry[],
): { exerciseId: string; exerciseName: string; sets: SetEntry[] }[] {
  const safeSets = Array.isArray(sets) ? sets : [];
  const order: string[] = [];
  const map = new Map<
    string,
    { exerciseId: string; exerciseName: string; sets: SetEntry[] }
  >();
  for (const s of safeSets) {
    let bucket = map.get(s.exerciseId);
    if (!bucket) {
      bucket = { exerciseId: s.exerciseId, exerciseName: s.exerciseName, sets: [] };
      map.set(s.exerciseId, bucket);
      order.push(s.exerciseId);
    }
    bucket.sets.push(s);
  }
  return order.map((id) => {
    const b = map.get(id)!;
    b.sets.sort((a, z) => a.setIndex - z.setIndex);
    return b;
  });
}

export function bestSet(sets: SetEntry[]): SetEntry | null {
  const safeSets = Array.isArray(sets) ? sets : [];
  let best: SetEntry | null = null;
  for (const s of safeSets) {
    if (!best) {
      best = s;
      continue;
    }
    if (s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)) {
      best = s;
    }
  }
  return best;
}

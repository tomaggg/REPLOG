import type {
  AuthUser,
  Exercise,
  Routine,
  Unit,
  UserProfile,
  WeightEntry,
  Workout,
} from "~/types/workout";

/**
 * Everything the app does with accounts and data goes through this interface.
 *
 * There are two implementations:
 *  - firebase-store.ts — the real backend (Firebase Auth + Firestore)
 *  - demo-store.ts     — in-memory only, used when Firebase isn't configured or ?demo=1
 *
 * To add a new kind of data: add methods here, then implement them in both stores.
 */
export interface DataStore {
  kind: "firebase" | "demo";

  // Auth
  onAuthChange(cb: (user: AuthUser | null) => void): () => void;
  signUp(email: string, password: string): Promise<AuthUser>;
  logIn(email: string, password: string): Promise<AuthUser>;
  logOut(): Promise<void>;

  // Workouts (finished and in-progress)
  listWorkouts(): Promise<Workout[]>;
  /** The workout that is still in progress (finishedAt === null), if any. */
  getActiveWorkout(): Promise<Workout | null>;
  saveWorkout(workout: Workout): Promise<void>;
  deleteWorkout(workoutId: string): Promise<void>;

  // Profile and body weight
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  listWeightLogs(): Promise<WeightEntry[]>;
  logBodyWeight(weight: number, unit: Unit): Promise<void>;

  // Routines
  listRoutines(): Promise<Routine[]>;
  saveRoutine(routine: Routine): Promise<void>;
  deleteRoutine(routineId: string): Promise<void>;

  // Custom exercises (user-created, or user edits to built-in ones)
  listCustomExercises(): Promise<Exercise[]>;
  saveCustomExercise(exercise: Exercise): Promise<void>;
  deleteCustomExercise(exerciseId: string): Promise<void>;
}

/** An error whose message is safe to show to the user. */
export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}

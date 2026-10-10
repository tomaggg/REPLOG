import { initializeApp, getApps } from "@firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "@firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "@firebase/firestore";
import { newId } from "~/lib/id";
import type {
  AuthUser,
  Exercise,
  FirebaseConfig,
  Routine,
  UserProfile,
  WeightEntry,
  Workout,
} from "~/types/workout";
import { StoreError, type DataStore } from "./data-store";

const PERMISSION_HELP =
  "Firestore permission error: Please update your Firestore Security Rules in the Firebase console to match /users/{userId}/{document=**}.";

/** Remove undefined values so Firestore doesn't reject the document. */
function stripUndefined<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/** Wrap a Firestore error in a StoreError the UI can show, e.g. "Could not save routine: …". */
function toStoreError(action: string, err: unknown): StoreError {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("permission-denied") || msg.includes("insufficient permissions")) {
    return new StoreError(PERMISSION_HELP);
  }
  return new StoreError(`Could not ${action}: ${msg}`);
}

function friendlyAuthError(err: unknown): StoreError {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("auth/email-already-in-use")) {
    return new StoreError("That email is already registered. Try logging in.");
  }
  if (msg.includes("auth/invalid-email")) {
    return new StoreError("Please enter a valid email address.");
  }
  if (msg.includes("auth/weak-password")) {
    return new StoreError("Passwords should be at least 6 characters.");
  }
  if (
    msg.includes("auth/wrong-password") ||
    msg.includes("auth/user-not-found") ||
    msg.includes("auth/invalid-credential")
  ) {
    return new StoreError("Invalid email or password.");
  }
  return new StoreError(msg);
}

export async function createFirebaseStore(config: FirebaseConfig): Promise<DataStore> {
  const app = getApps().length === 0 ? initializeApp(config) : getApps()[0]!;
  const auth = getAuth(app);
  const db = getFirestore(app);

  function requireUid(): string {
    const cur = auth.currentUser;
    if (!cur) throw new StoreError("You must be logged in.");
    return cur.uid;
  }

  /** users/{uid}/{name} */
  function userCollection(name: string) {
    return collection(db, "users", requireUid(), name);
  }

  /** users/{uid}/{name}/{id} */
  function userDoc(name: string, id: string) {
    return doc(db, "users", requireUid(), name, id);
  }

  async function save(name: string, id: string, data: object, action: string) {
    try {
      await setDoc(userDoc(name, id), stripUndefined(data));
    } catch (err) {
      throw toStoreError(action, err);
    }
  }

  async function remove(name: string, id: string, action: string) {
    try {
      await deleteDoc(userDoc(name, id));
    } catch (err) {
      throw toStoreError(action, err);
    }
  }

  return {
    kind: "firebase",

    // ---- Auth ----
    onAuthChange(cb) {
      return onAuthStateChanged(auth, (u) => {
        cb(u ? { uid: u.uid, email: u.email ?? "" } : null);
      });
    },
    async signUp(email, password): Promise<AuthUser> {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        return { uid: res.user.uid, email: res.user.email ?? email };
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },
    async logIn(email, password): Promise<AuthUser> {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        return { uid: res.user.uid, email: res.user.email ?? email };
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },
    async logOut() {
      await signOut(auth);
    },

    // ---- Workouts ----
    async listWorkouts() {
      try {
        const snap = await getDocs(query(userCollection("workouts"), orderBy("startedAt", "desc")));
        return snap.docs.map((d) => d.data() as Workout);
      } catch (err) {
        throw toStoreError("load workouts", err);
      }
    },
    async getActiveWorkout() {
      try {
        const snap = await getDocs(
          query(userCollection("workouts"), where("finishedAt", "==", null), limit(1)),
        );
        return snap.empty ? null : (snap.docs[0].data() as Workout);
      } catch (err) {
        throw toStoreError("load your current workout", err);
      }
    },
    saveWorkout: (workout) => save("workouts", workout.id, workout, "save workout"),
    deleteWorkout: (workoutId) => remove("workouts", workoutId, "delete workout"),

    // ---- Profile and body weight ----
    async getProfile() {
      try {
        const snap = await getDoc(userDoc("profile", "main"));
        return snap.exists() ? (snap.data() as UserProfile) : null;
      } catch (err) {
        const storeErr = toStoreError("load profile", err);
        if (storeErr.message === PERMISSION_HELP) throw storeErr;
        return null;
      }
    },
    saveProfile: (profile) => save("profile", "main", profile, "save profile"),
    async listWeightLogs() {
      try {
        const snap = await getDocs(query(userCollection("weightLogs"), orderBy("timestamp", "desc")));
        return snap.docs.map((d) => d.data() as WeightEntry);
      } catch {
        return [];
      }
    },
    async logBodyWeight(weight, unit) {
      const entry: WeightEntry = { id: newId(), timestamp: Date.now(), weight, unit };
      await save("weightLogs", entry.id, entry, "log body weight");
    },

    // ---- Routines ----
    async listRoutines() {
      try {
        const snap = await getDocs(query(userCollection("routines"), orderBy("createdAt", "desc")));
        return snap.docs.map((d) => d.data() as Routine);
      } catch {
        return [];
      }
    },
    saveRoutine: (routine) => save("routines", routine.id, routine, "save routine"),
    deleteRoutine: (routineId) => remove("routines", routineId, "delete routine"),

    // ---- Custom exercises ----
    async listCustomExercises() {
      try {
        const snap = await getDocs(userCollection("customExercises"));
        return snap.docs.map((d) => d.data() as Exercise);
      } catch {
        return [];
      }
    },
    saveCustomExercise: (exercise) =>
      save("customExercises", exercise.id, exercise, "save exercise"),
    deleteCustomExercise: (exerciseId) =>
      remove("customExercises", exerciseId, "delete exercise"),
  };
}

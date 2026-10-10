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
  orderBy,
  query,
  setDoc,
} from "@firebase/firestore";
import type {
  AuthUser,
  DataStore,
  FirebaseConfig,
  UserProfile,
  WeightEntry,
  Workout,
} from "~/types/workout";
import { StoreError, newId } from "~/types/workout";

export async function createFirebaseStore(
  config: FirebaseConfig,
): Promise<DataStore> {
  const app = getApps().length === 0 ? initializeApp(config) : getApps()[0]!;
  const auth = getAuth(app);
  const db = getFirestore(app);

  function requireUser(): AuthUser {
    const cur = auth.currentUser;
    if (!cur) throw new StoreError("You must be logged in.");
    return { uid: cur.uid, email: cur.email ?? "" };
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

  return {
    kind: "firebase",
    onAuthChange(cb) {
      return onAuthStateChanged(auth, (u) => {
        if (!u) cb(null);
        else cb({ uid: u.uid, email: u.email ?? "" });
      });
    },
    async signUp(email, password) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        return { uid: res.user.uid, email: res.user.email ?? email };
      } catch (err) {
        throw friendlyAuthError(err);
      }
    },
    async logIn(email, password) {
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
    async listWorkouts() {
      const u = requireUser();
      const colRef = collection(db, "users", u.uid, "workouts");
      const q = query(colRef, orderBy("startedAt", "desc"));
      try {
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data() as Workout);
      } catch (err) {
        throw new StoreError(
          err instanceof Error
            ? `Could not load workouts: ${err.message}`
            : "Could not load workouts.",
        );
      }
    },
    async saveWorkout(workout) {
      const u = requireUser();
      const ref = doc(db, "users", u.uid, "workouts", workout.id);
      try {
        await setDoc(ref, workout);
      } catch (err) {
        throw new StoreError(
          err instanceof Error
            ? `Could not save workout: ${err.message}`
            : "Could not save workout.",
        );
      }
    },
    async deleteWorkout(workoutId) {
      const u = requireUser();
      const ref = doc(db, "users", u.uid, "workouts", workoutId);
      try {
        await deleteDoc(ref);
      } catch (err) {
        throw new StoreError(
          err instanceof Error
            ? `Could not delete workout: ${err.message}`
            : "Could not delete workout.",
        );
      }
    },
    async getProfile() {
      const u = requireUser();
      const ref = doc(db, "users", u.uid, "profile", "main");
      try {
        const snap = await getDoc(ref);
        return snap.exists() ? (snap.data() as UserProfile) : null;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("permission-denied") || msg.includes("insufficient permissions")) {
          throw new StoreError("Firestore permission error: Please update your Firestore Security Rules in the Firebase console to match /users/{userId}/{document=**}.");
        }
        return null;
      }
    },
    async saveProfile(profile) {
      const u = requireUser();
      const ref = doc(db, "users", u.uid, "profile", "main");
      try {
        await setDoc(ref, profile);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("permission-denied") || msg.includes("insufficient permissions")) {
          throw new StoreError("Firestore permission error: Please update your Firestore Security Rules in the Firebase console to match /users/{userId}/{document=**}.");
        }
        throw new StoreError(`Could not save profile: ${msg}`);
      }
    },
    async listWeightLogs() {
      const u = requireUser();
      const colRef = collection(db, "users", u.uid, "weightLogs");
      const q = query(colRef, orderBy("timestamp", "desc"));
      try {
        const snap = await getDocs(q);
        return snap.docs.map((d) => d.data() as WeightEntry);
      } catch {
        return [];
      }
    },
    async logBodyWeight(weight, unit) {
      const u = requireUser();
      const entryId = newId();
      const ref = doc(db, "users", u.uid, "weightLogs", entryId);
      const entry: WeightEntry = {
        id: entryId,
        timestamp: Date.now(),
        weight,
        unit,
      };

      try {
        await setDoc(ref, entry);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("permission-denied") || msg.includes("insufficient permissions")) {
          throw new StoreError("Firestore permission error: Please update your Firestore Security Rules in the Firebase console to match /users/{userId}/{document=**}.");
        }
        throw new StoreError(`Could not log body weight: ${msg}`);
      }
    },
  };
}

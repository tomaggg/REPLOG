import type {
  AuthUser,
  DataStore,
  UserProfile,
  WeightEntry,
  Workout,
} from "~/types/workout";
import { StoreError, newId } from "~/types/workout";

// In-memory memory stores for demo mode (never written to localStorage)
let memoryUser: AuthUser | null = null;
const memoryWorkouts = new Map<string, Workout[]>();
const memoryProfiles = new Map<string, UserProfile>();
const memoryWeightLogs = new Map<string, WeightEntry[]>();

export function createDemoStore(): DataStore {
  const listeners = new Set<(u: AuthUser | null) => void>();

  function setUser(u: AuthUser | null) {
    memoryUser = u;
    for (const l of listeners) l(u);
  }

  return {
    kind: "demo",
    onAuthChange(cb) {
      listeners.add(cb);
      cb(memoryUser);
      return () => {
        listeners.delete(cb);
      };
    },
    async signUp(email) {
      const u: AuthUser = { uid: `demo-${Date.now()}`, email };
      setUser(u);
      return u;
    },
    async logIn(email) {
      if (memoryUser && memoryUser.email.toLowerCase() === email.toLowerCase()) {
        return memoryUser;
      }
      const u: AuthUser = { uid: `demo-${Date.now()}`, email };
      setUser(u);
      return u;
    },
    async logOut() {
      setUser(null);
    },
    async listWorkouts() {
      if (!memoryUser) throw new StoreError("Must be logged in.");
      const list = memoryWorkouts.get(memoryUser.uid) ?? [];
      return [...list].sort((a, b) => b.startedAt - a.startedAt);
    },
    async saveWorkout(w) {
      if (!memoryUser) throw new StoreError("Must be logged in.");
      const list = memoryWorkouts.get(memoryUser.uid) ?? [];
      const idx = list.findIndex((x) => x.id === w.id);
      if (idx >= 0) list[idx] = w;
      else list.unshift(w);
      memoryWorkouts.set(memoryUser.uid, list);
    },
    async deleteWorkout(id) {
      if (!memoryUser) throw new StoreError("Must be logged in.");
      const list = (memoryWorkouts.get(memoryUser.uid) ?? []).filter((x) => x.id !== id);
      memoryWorkouts.set(memoryUser.uid, list);
    },
    async getProfile() {
      if (!memoryUser) return null;
      return memoryProfiles.get(memoryUser.uid) ?? null;
    },
    async saveProfile(profile) {
      if (!memoryUser) throw new StoreError("Must be logged in.");
      memoryProfiles.set(memoryUser.uid, profile);
    },
    async listWeightLogs() {
      if (!memoryUser) return [];
      const list = memoryWeightLogs.get(memoryUser.uid) ?? [];
      return [...list].sort((a, b) => b.timestamp - a.timestamp);
    },
    async logBodyWeight(weight, unit) {
      if (!memoryUser) throw new StoreError("Must be logged in.");
      const currentLogs = memoryWeightLogs.get(memoryUser.uid) ?? [];
      const entry: WeightEntry = {
        id: newId(),
        timestamp: Date.now(),
        weight,
        unit,
      };
      currentLogs.unshift(entry);
      memoryWeightLogs.set(memoryUser.uid, currentLogs);
    },
  };
}

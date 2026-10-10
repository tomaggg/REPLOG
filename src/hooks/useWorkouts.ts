import type { Workout } from "~/types/workout";
import { useStoreData } from "./useStoreData";

/** All of the user's finished workouts, newest first. */
export function useWorkouts() {
  const { data, ...rest } = useStoreData<Workout[]>(
    async (store) => (await store.listWorkouts()).filter((w) => w.finishedAt !== null),
    [],
    "Could not load workouts.",
  );
  return { workouts: data, ...rest };
}

import type { Routine } from "~/types/workout";
import { useStoreData } from "./useStoreData";

/** The user's saved routines, newest first. */
export function useRoutines() {
  const { data, ...rest } = useStoreData<Routine[]>(
    (store) => store.listRoutines(),
    [],
    "Could not load routines.",
  );
  return { routines: data, ...rest };
}

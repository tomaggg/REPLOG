import type { Exercise } from "~/types/workout";
import { useStoreData } from "./useStoreData";

/** The user's custom exercises */
export function useCustomExercises() {
  const { data, ...rest } = useStoreData<Exercise[]>(
    (store) => store.listCustomExercises(),
    [],
    "Could not load exercises.",
  );
  return { customExercises: data, ...rest };
}

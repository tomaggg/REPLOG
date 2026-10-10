import { useMemo } from "react";
import { BUILTIN_EXERCISES } from "~/services/exercises";
import type { Exercise } from "~/types/workout";
import { useCustomExercises } from "./useCustomExercises";

/** Every exercise by id: built-ins plus the user's own (their edits win on a clash). */
export function useExerciseLookup(): Map<string, Exercise> {
  const { customExercises } = useCustomExercises();
  return useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const ex of BUILTIN_EXERCISES) map.set(ex.id, ex);
    for (const ex of customExercises) map.set(ex.id, { ...map.get(ex.id), ...ex });
    return map;
  }, [customExercises]);
}

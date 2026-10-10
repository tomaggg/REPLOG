import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "~/context/StoreContext";
import { errorMessage } from "~/lib/errors";
import { markPRs } from "~/lib/records";
import { completedSets, emptyWorkout } from "~/lib/workout";
import type { ExerciseHistory, Workout } from "~/types/workout";

/** Wait this long after the last edit before saving, so typing doesn't cause a write per keystroke. */
const SAVE_DELAY_MS = 800;

export interface FinishDetails {
  startedAt: number;
  finishedAt: number;
  note: string;
}

export function useActiveWorkout() {
  const { store } = useStore();
  const [workout, setWorkout] = useState<Workout>(emptyWorkout);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Has the current workout been changed (and therefore saved to the store) yet?
  const started = useRef(false);
  // The latest unsaved version, and the timer that will save it
  const pendingSave = useRef<Workout | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Lets the save-on-close handler use the current store
  const storeRef = useRef(store);
  storeRef.current = store;

  function cancelPendingSave() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    pendingSave.current = null;
  }

  /** Save any pending change right now. */
  const flush = useCallback(async () => {
    const toSave = pendingSave.current;
    cancelPendingSave();
    if (!toSave || !storeRef.current) return;
    try {
      await storeRef.current.saveWorkout(toSave);
    } catch (err) {
      setError(errorMessage(err, "Could not save your workout."));
    }
  }, []);

  // Load the in-progress workout, if there is one
  useEffect(() => {
    if (!store) return;
    let cancelled = false;
    setLoading(true);
    store
      .getActiveWorkout()
      .then((active) => {
        // Skip if nothing is in progress, or the user already started logging
        if (cancelled || !active || started.current) return;
        started.current = true;
        setWorkout(active);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Could not load your workout."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [store]);

  // Save immediately when the app goes to the background or this page closes
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") void flush();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void flush();
    };
  }, [flush]);

  const latest = useRef(workout);
  latest.current = workout;

  const update = useCallback(
    (next: Workout) => {
      const firstExercise = latest.current.sets.length === 0 && next.sets.length > 0;
      const toSave = firstExercise ? { ...next, startedAt: Date.now() } : next;
      started.current = true;
      latest.current = toSave;
      setWorkout(toSave);

      pendingSave.current = toSave;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
    },
    [flush],
  );

  function reset() {
    started.current = false;
    setWorkout(emptyWorkout());
  }

  /**
   * Mark the workout as finished. `history` (past sessions) is used to stamp
   * personal records on the saved sets. Returns true on success.
   */
  async function finish(
    details: FinishDetails,
    history: Record<string, ExerciseHistory>,
  ): Promise<boolean> {
    if (!store) return false;
    cancelPendingSave();
    setBusy(true);
    setError(null);
    try {
      // Keep only the sets that were ticked off; a rest timer means nothing once finished
      await store.saveWorkout({
        ...workout,
        ...details,
        sets: markPRs(completedSets(workout.sets), history),
        restEndsAt: undefined,
      });
      reset();
      return true;
    } catch (err) {
      setError(errorMessage(err, "Could not save workout."));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function discard() {
    if (!store) return;
    cancelPendingSave();
    setBusy(true);
    setError(null);
    try {
      if (started.current) await store.deleteWorkout(workout.id);
      reset();
    } catch (err) {
      setError(errorMessage(err, "Could not discard workout."));
    } finally {
      setBusy(false);
    }
  }

  return { workout, loading, busy, error, update, finish, discard };
}

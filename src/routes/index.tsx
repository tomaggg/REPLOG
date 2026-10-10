import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { AppShell } from "~/components/layout/AppShell";
import type { ExerciseHistory } from "~/components/workout/ExerciseHistoryDrawer";
import { WorkoutLogger } from "~/components/workout/WorkoutLogger";
import { useAuth } from "~/context/AuthContext";
import { useStore } from "~/context/StoreContext";
import type { Workout } from "~/types/workout";
import { bestSet, emptyWorkout, newId } from "~/types/workout";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <AuthGuard>
      <AppShell>
        <WorkoutDashboard />
      </AppShell>
    </AuthGuard>
  );
}

function WorkoutDashboard() {
  const { store, unit } = useStore();
  const { user } = useAuth();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [draft, setDraft] = useState<Workout | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!store) return;
    try {
      const list = await store.listWorkouts();
      setWorkouts(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load workouts.");
    }
  }, [store]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const currentDraft = draft ?? emptyWorkout(newId());

  function persistDraft(next: Workout | null) {
    setDraft(next);
  }

  // Pre-calculate per-exercise history safely from past workouts
  const exerciseHistory = useMemo(() => {
    const out: Record<string, ExerciseHistory> = {};
    for (const w of workouts) {
      if (!w.finishedAt) continue;
      const sets = Array.isArray(w.sets) ? w.sets : [];
      const seenInWorkout = new Set<string>();
      for (const s of sets) {
        if (!seenInWorkout.has(s.exerciseId)) {
          seenInWorkout.add(s.exerciseId);
          const current = out[s.exerciseId] ?? { last: [], best: null, sessions: 0 };
          current.sessions += 1;
          if (current.last.length === 0) {
            current.last = sets.filter((x) => x.exerciseId === s.exerciseId);
          }
          out[s.exerciseId] = current;
        }
      }
    }

    const allSetsByExercise = new Map<string, typeof workouts[number]["sets"]>();
    for (const w of workouts) {
      const sets = Array.isArray(w.sets) ? w.sets : [];
      for (const s of sets) {
        const list = allSetsByExercise.get(s.exerciseId) ?? [];
        list.push(s);
        allSetsByExercise.set(s.exerciseId, list);
      }
    }

    for (const [id, list] of allSetsByExercise.entries()) {
      if (out[id]) {
        out[id].best = bestSet(list);
      }
    }
    return out;
  }, [workouts]);

  async function handleFinish() {
    const safeSets = Array.isArray(currentDraft.sets) ? currentDraft.sets : [];
    if (!store || busy || safeSets.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const finished: Workout = {
        ...currentDraft,
        finishedAt: Date.now(),
      };
      await store.saveWorkout(finished);
      persistDraft(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save workout.");
    } finally {
      setBusy(false);
    }
  }

  function handleDiscard() {
    if (window.confirm("Discard today's workout sets?")) {
      persistDraft(null);
    }
  }

  return (
    <WorkoutLogger
      draft={currentDraft}
      history={exerciseHistory}
      unit={unit}
      busy={busy}
      error={error}
      onChange={persistDraft}
      onFinish={() => void handleFinish()}
      onDiscard={handleDiscard}
    />
  );
}

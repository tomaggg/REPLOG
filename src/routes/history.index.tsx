import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { WorkoutHistoryList } from "~/components/history/WorkoutHistoryList";
import { AppShell } from "~/components/layout/AppShell";
import { Spinner } from "~/components/ui/Spinner";
import { useStore } from "~/context/StoreContext";
import type { Workout } from "~/types/workout";

export const Route = createFileRoute("/history/")({
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <AuthGuard>
      <AppShell>
        <HistoryDashboard />
      </AppShell>
    </AuthGuard>
  );
}

function HistoryDashboard() {
  const { store } = useStore();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!store) return;
    setLoading(true);
    try {
      const list = await store.listWorkouts();
      // Only finished workouts belong in history
      setWorkouts(list.filter((w) => w.finishedAt !== null));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load history.");
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  if (loading) {
    return <Spinner label="Loading workout history…" />;
  }

  if (error) {
    return (
      <div className="py-8 text-center text-sm text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-neutral-100">Workout History</h2>
        <span className="text-xs text-neutral-500">
          {workouts.length} session{workouts.length === 1 ? "" : "s"} logged
        </span>
      </div>

      <WorkoutHistoryList workouts={workouts} />
    </div>
  );
}

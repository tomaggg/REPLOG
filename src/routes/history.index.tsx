import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { WorkoutHistoryList } from "~/components/history/WorkoutHistoryList";
import { AppShell } from "~/components/layout/AppShell";
import { Spinner } from "~/components/ui/Spinner";
import { useWorkouts } from "~/hooks/useWorkouts";

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
  const { workouts, loading, error } = useWorkouts();

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

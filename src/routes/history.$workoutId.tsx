import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { WorkoutDetailCard } from "~/components/history/WorkoutDetailCard";
import { AppShell } from "~/components/layout/AppShell";
import { Spinner } from "~/components/ui/Spinner";
import { useStore } from "~/context/StoreContext";
import { useWorkouts } from "~/hooks/useWorkouts";
import { errorMessage } from "~/lib/errors";

export const Route = createFileRoute("/history/$workoutId")({
  component: WorkoutDetailPage,
});

function WorkoutDetailPage() {
  const { workoutId } = Route.useParams();

  return (
    <AuthGuard>
      <AppShell>
        <WorkoutDetailContent workoutId={workoutId} />
      </AppShell>
    </AuthGuard>
  );
}

function WorkoutDetailContent({ workoutId }: { workoutId: string }) {
  const { store } = useStore();
  const navigate = useNavigate();

  const { workouts, loading, error, setError } = useWorkouts();
  const workout = workouts.find((w) => w.id === workoutId) ?? null;
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!store || busy || !workout) return;
    if (!window.confirm("Are you sure you want to delete this workout entry?")) return;

    setBusy(true);
    setError(null);
    try {
      await store.deleteWorkout(workout.id);
      void navigate({ to: "/history" });
    } catch (err) {
      setError(errorMessage(err, "Could not delete workout."));
      setBusy(false);
    }
  }

  if (loading) {
    return <Spinner label="Loading workout details…" />;
  }

  if (error || !workout) {
    return (
      <div className="py-8 text-center text-sm text-neutral-400">
        <p>{error ?? "Workout not found"}</p>
      </div>
    );
  }

  return (
    <WorkoutDetailCard
      workout={workout}
      onDelete={() => void handleDelete()}
      busy={busy}
      error={error}
    />
  );
}

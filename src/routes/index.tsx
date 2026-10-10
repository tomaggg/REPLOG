import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { AppShell } from "~/components/layout/AppShell";
import { Spinner } from "~/components/ui/Spinner";
import { WorkoutLogger } from "~/components/workout/WorkoutLogger";
import { useStore } from "~/context/StoreContext";
import { useActiveWorkout, type FinishDetails } from "~/hooks/useActiveWorkout";
import { useRestSeconds } from "~/hooks/useRestSeconds";
import { useWorkouts } from "~/hooks/useWorkouts";
import { buildExerciseHistory } from "~/lib/workout";

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
  const { unit } = useStore();
  const active = useActiveWorkout();
  const past = useWorkouts();
  const [restSeconds, setRestSeconds] = useRestSeconds();

  const exerciseHistory = useMemo(() => buildExerciseHistory(past.workouts), [past.workouts]);

  async function handleFinish(details: FinishDetails) {
    if (!active.workout.sets.some((s) => s.done)) return;
    const saved = await active.finish(details, exerciseHistory);
    if (saved) await past.refresh();
  }

  function handleDiscard() {
    if (window.confirm("Discard today's workout sets?")) {
      void active.discard();
    }
  }

  if (active.loading) {
    return <Spinner label="Loading your workout…" />;
  }

  return (
    <WorkoutLogger
      draft={active.workout}
      history={exerciseHistory}
      unit={unit}
      busy={active.busy}
      error={active.error ?? past.error}
      onChange={active.update}
      onFinish={(details) => void handleFinish(details)}
      onDiscard={handleDiscard}
      restSeconds={restSeconds}
      onRestSecondsChange={setRestSeconds}
    />
  );
}

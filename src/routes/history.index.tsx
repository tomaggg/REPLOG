import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { StatsView } from "~/components/history/StatsView";
import { LIST_PERIODS, WorkoutsView, type ListPeriod } from "~/components/history/WorkoutsView";
import { AppShell } from "~/components/layout/AppShell";
import { SegmentedControl } from "~/components/ui/SegmentedControl";
import { Spinner } from "~/components/ui/Spinner";
import { useWorkouts } from "~/hooks/useWorkouts";

type View = "workouts" | "stats";

const VIEWS: { id: View; label: string }[] = [
  { id: "workouts", label: "Workouts" },
  { id: "stats", label: "Stats" },
];

// The view and list period live in the URL, so they're kept when you open a
// workout and come back: /history?view=stats, /history?period=3m
interface HistorySearch {
  view?: "stats";
  /** Leave out for the last 7 days */
  period?: Exclude<ListPeriod, "7d">;
}

const isListPeriod = (v: unknown): v is Exclude<ListPeriod, "7d"> =>
  LIST_PERIODS.some((p) => p.id === v && p.id !== "7d");

export const Route = createFileRoute("/history/")({
  validateSearch: (search: Record<string, unknown>): HistorySearch => ({
    view: search.view === "stats" ? "stats" : undefined,
    period: isListPeriod(search.period) ? search.period : undefined,
  }),
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
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/history/" });
  const view: View = search.view ?? "workouts";

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
        <h2 className="text-lg font-bold text-neutral-100">History</h2>
        <span className="text-xs text-neutral-500">
          {workouts.length} session{workouts.length === 1 ? "" : "s"} logged
        </span>
      </div>

      <SegmentedControl
        label="History view"
        options={VIEWS}
        value={view}
        onChange={(v) => void navigate({ search: (s) => ({ ...s, view: v === "stats" ? "stats" : undefined }), replace: true })}
      />

      {view === "stats" ? (
        <StatsView workouts={workouts} />
      ) : (
        <WorkoutsView
          workouts={workouts}
          period={search.period ?? "7d"}
          onPeriodChange={(p) =>
            void navigate({ search: (s) => ({ ...s, period: p === "7d" ? undefined : p }), replace: true })
          }
        />
      )}
    </div>
  );
}

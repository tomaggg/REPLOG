import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { AppShell } from "~/components/layout/AppShell";
import { LogWeightForm } from "~/components/weight/LogWeightForm";
import { WeightChart } from "~/components/weight/WeightChart";
import { WeightHistoryList } from "~/components/weight/WeightHistoryList";
import { WeightStats } from "~/components/weight/WeightStats";
import { WeightUnitToggle } from "~/components/weight/WeightUnitToggle";
import { useWeightLogs } from "~/hooks/useWeightLogs";
import { buildWeightChart, startingUnit, toDisplayUnit, weightStats } from "~/lib/weight";
import type { Unit } from "~/types/workout";

export const Route = createFileRoute("/weight/")({
  component: WeightTrackerPage,
});

function WeightTrackerPage() {
  return (
    <AuthGuard>
      <AppShell>
        <WeightTrackerDashboard />
      </AppShell>
    </AuthGuard>
  );
}

function WeightTrackerDashboard() {
  const { profile, logs, loading, saving, error, successMsg, logWeight } = useWeightLogs();
  // The unit everything on this page is shown and logged in: the one the user
  // picked with the toggle, otherwise the unit they started tracking in
  const [chosenUnit, setChosenUnit] = useState<Unit | null>(null);
  const startUnit = startingUnit(profile, logs);
  const unit = chosenUnit ?? startUnit;
  const [newWeight, setNewWeight] = useState("");

  // Logs in the viewing unit, newest first (for the list)…
  const displayLogs = useMemo(() => toDisplayUnit(logs, unit), [logs, unit]);
  // …and oldest first (for stats and the chart)
  const chronological = useMemo(() => [...displayLogs].reverse(), [displayLogs]);

  const stats = useMemo(
    () => weightStats(chronological.map((l) => l.displayWeight)),
    [chronological],
  );
  const chart = useMemo(
    () =>
      buildWeightChart(
        chronological.map((l) => ({ timestamp: l.timestamp, weight: l.displayWeight })),
      ),
    [chronological],
  );

  return (
    <div className="space-y-6 pb-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-100">
            Weight Tracker
          </h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            Log, convert units, and visualize your body weight progress.
          </p>
        </div>
        <WeightUnitToggle unit={unit} onChange={setChosenUnit} />
      </div>

      <WeightStats stats={stats} unit={unit} startUnit={startUnit} />

      <WeightChart chart={chart} unit={unit} loading={loading} />

      <LogWeightForm
        value={newWeight}
        onChange={setNewWeight}
        onSubmit={() => void logWeight(newWeight, unit, () => setNewWeight(""))}
        unit={unit}
        saving={saving}
        error={error}
        successMsg={successMsg}
      />

      <WeightHistoryList logs={displayLogs} unit={unit} loading={loading} />
    </div>
  );
}

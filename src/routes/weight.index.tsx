import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { AppShell } from "~/components/layout/AppShell";
import { Banner } from "~/components/ui/Banner";
import { Spinner } from "~/components/ui/Spinner";
import { BmiCard } from "~/components/weight/BmiCard";
import { BodyFatCard } from "~/components/weight/BodyFatCard";
import { BodyProfileCard, BodyProfileForm } from "~/components/weight/BodyProfileCard";
import { LogWeightForm } from "~/components/weight/LogWeightForm";
import { WeightChart, type ChartMetric } from "~/components/weight/WeightChart";
import { WeightHistoryList } from "~/components/weight/WeightHistoryList";
import { WeightStats } from "~/components/weight/WeightStats";
import { UnitSystemToggle } from "~/components/weight/UnitSystemToggle";
import { useWeightLogs } from "~/hooks/useWeightLogs";
import { ageFrom, bmi, heightCmOf } from "~/lib/bmi";
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
  const { profile, logs, loading, saving, error, successMsg, logWeight, saveBody, setUpBody } =
    useWeightLogs();
  // The unit everything on this page is shown and logged in: the one the user
  // picked with the toggle, otherwise the unit they started tracking in
  const [chosenUnit, setChosenUnit] = useState<Unit | null>(null);
  const startUnit = startingUnit(profile, logs);
  const unit = chosenUnit ?? startUnit;
  const [newWeight, setNewWeight] = useState("");
  const [editingBody, setEditingBody] = useState(false);
  const [metric, setMetric] = useState<ChartMetric>("weight");

  const heightCm = heightCmOf(profile);
  const age = ageFrom(profile?.birthYear);

  // Logs in the viewing unit, newest first (for the list)…
  const displayLogs = useMemo(() => toDisplayUnit(logs, unit), [logs, unit]);
  // …and oldest first (for stats and the chart)
  const chronological = useMemo(() => [...displayLogs].reverse(), [displayLogs]);

  const stats = useMemo(
    () => weightStats(chronological.map((l) => l.displayWeight)),
    [chronological],
  );
  const latest = logs[0] ?? null;
  const currentBmi = latest && heightCm ? bmi(latest.weight, latest.unit, heightCm) : null;

  const showBmi = metric === "bmi" && heightCm !== null;
  const chart = useMemo(
    () =>
      buildWeightChart(
        chronological.map((l) => ({
          timestamp: l.timestamp,
          weight: showBmi ? bmi(l.weight, l.originalUnit, heightCm) : l.displayWeight,
        })),
      ),
    [chronological, showBmi, heightCm],
  );

  // First visit (or details missing): ask for everything at once
  const needsSetup = !loading && (heightCm === null || !profile?.sex || logs.length === 0);

  const header = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-neutral-100">Weight & BMI</h1>
        <p className="mt-0.5 text-xs text-neutral-400">
          Track your body weight and see what it means for your height.
        </p>
      </div>
      <UnitSystemToggle unit={unit} onChange={setChosenUnit} />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6 pb-14">
        {header}
        <Spinner label="Loading…" />
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="space-y-6 pb-14">
        {header}
        {error ? <Banner tone="error">{error}</Banner> : null}
        {/* Remount on kg/lb change so the pre-filled weight matches the unit shown */}
        <BodyProfileForm
          key={unit}
          title="Set up your body profile"
          intro="A few details to work out your BMI."
          askWeight
          unit={unit}
          initial={{
            sex: profile?.sex,
            heightCm,
            birthYear: profile?.birthYear,
            weight: stats?.current ?? null,
          }}
          onSave={async (patch, weight) => {
            if (weight !== null) await setUpBody(patch, weight, unit);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-14">
      {header}

      {/* Daily use first: log today's weight without scrolling */}
      <LogWeightForm
        value={newWeight}
        onChange={setNewWeight}
        onSubmit={() => void logWeight(newWeight, unit, () => setNewWeight(""))}
        unit={unit}
        saving={saving}
        error={error}
        successMsg={successMsg}
      />

      <WeightStats
        stats={stats}
        unit={unit}
        points={chronological.map((l) => ({ timestamp: l.timestamp, weight: l.displayWeight }))}
      />

      <BmiCard bmi={currentBmi} weight={stats?.current ?? null} unit={unit} heightCm={heightCm} />

      <WeightChart
        chart={chart}
        unit={unit}
        loading={loading}
        metric={showBmi ? "bmi" : "weight"}
        onMetricChange={setMetric}
        bmiAvailable={heightCm !== null}
      />

      <BodyFatCard bmi={currentBmi} age={age} sex={profile?.sex} onAddDetails={() => setEditingBody(true)} />

      {/* Set once, rarely changed */}
      <BodyProfileCard
        sex={profile?.sex}
        heightCm={heightCm}
        birthYear={profile?.birthYear}
        unit={unit}
        editing={editingBody}
        onEditingChange={setEditingBody}
        onSave={saveBody}
      />

      <WeightHistoryList logs={displayLogs} unit={unit} loading={loading} heightCm={heightCm} />
    </div>
  );
}

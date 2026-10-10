import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { AppShell } from "~/components/layout/AppShell";
import { Banner } from "~/components/ui/Banner";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { useStore } from "~/context/StoreContext";
import { errorMessage } from "~/lib/errors";
import { newId } from "~/lib/id";
import { decodeSharedRoutine, type SharedRoutine } from "~/lib/share";

// Opened from a share link: /routines/import?r=…
export const Route = createFileRoute("/routines/import")({
  validateSearch: (search: Record<string, unknown>) => ({
    r: typeof search.r === "string" ? search.r : "",
  }),
  component: ImportRoutinePage,
});

function ImportRoutinePage() {
  const { r } = Route.useSearch();
  return (
    <AuthGuard>
      <AppShell>
        <ImportRoutine code={r} />
      </AppShell>
    </AuthGuard>
  );
}

function ImportRoutine({ code }: { code: string }) {
  const { store } = useStore();
  const navigate = useNavigate();
  const shared = useMemo(() => decodeSharedRoutine(code), [code]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goToRoutines() {
    void navigate({ to: "/routines" });
  }

  async function addToMyRoutines(routine: SharedRoutine) {
    if (!store) return;
    setSaving(true);
    setError(null);
    try {
      // Bring along the sender's own exercises that this account doesn't have yet
      const mine = new Set((await store.listCustomExercises()).map((e) => e.id));
      for (const exercise of routine.customExercises) {
        if (!mine.has(exercise.id)) await store.saveCustomExercise(exercise);
      }
      await store.saveRoutine({
        id: newId(),
        name: routine.name,
        description: routine.description,
        exercises: routine.exercises,
        createdAt: Date.now(),
      });
      goToRoutines();
    } catch (err) {
      setError(errorMessage(err, "Could not add this routine."));
      setSaving(false);
    }
  }

  if (!shared) {
    return (
      <Card className="space-y-4 py-8 text-center">
        <p className="text-base font-semibold text-neutral-200">This link doesn't work</p>
        <p className="text-xs text-neutral-400">
          It may have been cut off when it was copied. Ask for the link again.
        </p>
        <Button variant="secondary" onClick={goToRoutines}>
          Go to my routines
        </Button>
      </Card>
    );
  }

  const totalSets = shared.exercises.reduce((sum, e) => sum + e.targetSets, 0);
  const customCount = shared.customExercises.length;

  return (
    <div className="space-y-4 pb-20">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-lime-400">
          Shared routine
        </p>
        <h1 className="mt-0.5 text-xl font-bold tracking-tight text-neutral-100">{shared.name}</h1>
        {shared.description ? (
          <p className="mt-1 text-xs text-neutral-400">{shared.description}</p>
        ) : null}
      </div>

      {error ? <Banner tone="error">{error}</Banner> : null}

      <Card className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          {shared.exercises.length} {shared.exercises.length === 1 ? "exercise" : "exercises"} ·{" "}
          {totalSets} sets
        </p>
        <ul className="divide-y divide-neutral-800/80">
          {shared.exercises.map((item, idx) => (
            <li
              key={`${item.exerciseId}-${idx}`}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate text-neutral-200">{item.exerciseName}</span>
              <span className="shrink-0 font-semibold text-lime-400">×{item.targetSets}</span>
            </li>
          ))}
        </ul>
        {customCount > 0 ? (
          <p className="pt-1 text-xs text-neutral-500">
            Includes {customCount} custom {customCount === 1 ? "exercise" : "exercises"} with
            their videos and notes. They'll be added to your exercise library too.
          </p>
        ) : null}
      </Card>

      <div className="space-y-2">
        <Button onClick={() => void addToMyRoutines(shared)} disabled={saving}>
          {saving ? "Adding…" : "Add to my routines"}
        </Button>
        <Button variant="ghost" onClick={goToRoutines} disabled={saving}>
          No thanks
        </Button>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { ExerciseCard } from "~/components/exercises/ExerciseCard";
import { ExerciseFormModal } from "~/components/exercises/ExerciseFormModal";
import { GroupFilter } from "~/components/exercises/GroupFilter";
import { SearchBox } from "~/components/exercises/SearchBox";
import { AppShell } from "~/components/layout/AppShell";
import { Banner } from "~/components/ui/Banner";
import { Card } from "~/components/ui/Card";
import { Spinner } from "~/components/ui/Spinner";
import { useStore } from "~/context/StoreContext";
import { useCustomExercises } from "~/hooks/useCustomExercises";
import { errorMessage } from "~/lib/errors";
import { filterExercises, mergeExercises } from "~/lib/exercises";
import type { Exercise } from "~/types/workout";

export const Route = createFileRoute("/exercises/")({
  component: ExercisesPage,
});

function ExercisesPage() {
  return (
    <AuthGuard>
      <AppShell>
        <ExercisesDashboard />
      </AppShell>
    </AuthGuard>
  );
}

function ExercisesDashboard() {
  const { store } = useStore();
  const { customExercises, loading, error, setError, refresh } = useCustomExercises();

  const [selectedGroup, setSelectedGroup] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Form modal: `editing` is the exercise being edited, or null for a new one.
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);

  const allExercises = useMemo(() => mergeExercises(customExercises), [customExercises]);
  const filtered = useMemo(
    () => filterExercises(allExercises, selectedGroup, searchQuery),
    [allExercises, selectedGroup, searchQuery],
  );

  function openForm(exercise: Exercise | null) {
    setEditing(exercise);
    setModalOpen(true);
  }

  function handleSaved() {
    setModalOpen(false);
    void refresh();
  }

  async function handleDelete(exerciseId: string) {
    if (!store) return;
    if (!window.confirm("Remove your customizations / exercise?")) return;
    try {
      await store.deleteCustomExercise(exerciseId);
      await refresh();
    } catch (err) {
      setError(errorMessage(err, "Failed to delete."));
    }
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-neutral-100">Exercises</h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            Video refs & personal form notes
          </p>
        </div>
        <button
          type="button"
          onClick={() => openForm(null)}
          className="shrink-0 inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 text-xs font-bold text-neutral-950 transition-colors hover:bg-lime-300 active:scale-95"
        >
          + New
        </button>
      </div>

      {error ? <Banner tone="error">{error}</Banner> : null}

      <SearchBox value={searchQuery} onChange={setSearchQuery} />
      <GroupFilter selected={selectedGroup} onSelect={setSelectedGroup} />

      {loading ? (
        <Spinner label="Loading exercise database…" />
      ) : filtered.length === 0 ? (
        <Card className="py-10 text-center">
          <p className="text-base font-semibold text-neutral-200">No exercises found</p>
          <p className="mt-1 text-xs text-neutral-400">
            Try a different search or muscle group.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-2.5">
          {filtered.map((item) => (
            <ExerciseCard
              key={item.id}
              exercise={item}
              isCustomized={customExercises.some((c) => c.id === item.id)}
              onEdit={() => openForm(item)}
              onDelete={() => void handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      {modalOpen ? (
        <ExerciseFormModal
          exercise={editing}
          onSaved={handleSaved}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthGuard } from "~/components/auth/AuthGuard";
import { AppShell } from "~/components/layout/AppShell";
import { Banner } from "~/components/ui/Banner";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Field } from "~/components/ui/Input";
import { Modal } from "~/components/ui/Modal";
import { Spinner } from "~/components/ui/Spinner";
import { useStore } from "~/context/StoreContext";
import { BUILTIN_EXERCISES, GROUPS } from "~/services/exercises";
import type { Exercise } from "~/types/workout";
import { newId } from "~/types/workout";

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

// ─── Muscle Group Color Map ───────────────────────────────────────────────────

type GroupColor = { bg: string; text: string; border: string; abbr: string };

const GROUP_META: Record<string, GroupColor> = {
  Chest:     { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20",    abbr: "CH" },
  Back:      { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20",     abbr: "BK" },
  Legs:      { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   abbr: "LG" },
  Shoulders: { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20",  abbr: "SH" },
  Arms:      { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/20",  abbr: "AR" },
  Core:      { bg: "bg-lime-500/10",    text: "text-lime-400",    border: "border-lime-500/20",    abbr: "CR" },
  Other:     { bg: "bg-neutral-700/30", text: "text-neutral-400", border: "border-neutral-700/30", abbr: "OT" },
};

function getMeta(group: string) {
  return GROUP_META[group] ?? GROUP_META["Other"];
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function ExercisesDashboard() {
  const { store } = useStore();

  const [customList, setCustomList] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [group, setGroup] = useState<string>("Chest");
  const [videoUrl, setVideoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isCustomCreated, setIsCustomCreated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!store) return;
    setLoading(true);
    try {
      const list = await store.listCustomExercises();
      setCustomList(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load exercises.");
    } finally {
      setLoading(false);
    }
  }, [store]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Merge built-in list with customized list
  const allExercises = useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const b of BUILTIN_EXERCISES) {
      map.set(b.id, { ...b, isCustom: false });
    }
    for (const c of customList) {
      const existing = map.get(c.id);
      if (existing) {
        map.set(c.id, { ...existing, ...c });
      } else {
        map.set(c.id, { ...c, isCustom: true });
      }
    }
    return Array.from(map.values());
  }, [customList]);

  // Filtered exercises
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allExercises.filter((item) => {
      const matchGroup =
        selectedGroup === "All" ||
        item.group.toLowerCase() === selectedGroup.toLowerCase();
      if (!matchGroup) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    });
  }, [allExercises, selectedGroup, searchQuery]);

  function handleOpenCreate() {
    setEditingId(null);
    setName("");
    setGroup("Chest");
    setVideoUrl("");
    setNotes("");
    setIsCustomCreated(true);
    setModalError(null);
    setModalOpen(true);
  }

  function handleOpenEdit(ex: Exercise) {
    setEditingId(ex.id);
    setName(ex.name);
    setGroup(ex.group || "Chest");
    setVideoUrl(ex.videoUrl || "");
    setNotes(ex.notes || "");
    setIsCustomCreated(Boolean(ex.isCustom));
    setModalError(null);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      setModalError("Please provide an exercise name.");
      return;
    }
    if (!store) return;

    setSaving(true);
    setModalError(null);
    try {
      const exerciseId = editingId ?? `custom-${newId()}`;
      const payload: Exercise = {
        id: exerciseId,
        name: name.trim(),
        group: group.trim() || "Other",
        videoUrl: videoUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        isCustom: editingId ? isCustomCreated : true,
      };

      await store.saveCustomExercise(payload);
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : "Failed to save exercise.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(exerciseId: string) {
    if (!store) return;
    if (!window.confirm("Remove your customizations / exercise?")) return;
    try {
      await store.deleteCustomExercise(exerciseId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-neutral-100">Exercises</h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            Video refs & personal form notes
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="shrink-0 inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-lime-400 px-3.5 text-xs font-bold text-neutral-950 transition-colors hover:bg-lime-300 active:scale-95"
        >
          + New
        </button>
      </div>

      {error ? <Banner tone="error">{error}</Banner> : null}

      {/* Search Input */}
      <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-3 focus-within:border-lime-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 shrink-0 text-neutral-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exercises…"
          className="min-h-10 w-full bg-transparent text-sm text-neutral-100 placeholder-neutral-600 outline-none"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="shrink-0 text-xs text-neutral-500 hover:text-neutral-300"
          >
            Clear
          </button>
        ) : null}
      </div>

      {/* Muscle Group Filter Badges */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {GROUPS.map((grp) => {
          const isSelected = selectedGroup.toLowerCase() === grp.toLowerCase();
          const meta = getMeta(grp);
          return (
            <button
              key={grp}
              type="button"
              onClick={() => setSelectedGroup(grp)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-lime-400 text-neutral-950 font-bold"
                  : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              }`}
            >
              {grp}
            </button>
          );
        })}
      </div>

      {/* Exercise Cards */}
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
          {filtered.map((item) => {
            const meta = getMeta(item.group);
            const hasVideo = Boolean(item.videoUrl);
            const hasNotes = Boolean(item.notes);
            const isCustomized = customList.some((c) => c.id === item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleOpenEdit(item)}
                className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 backdrop-blur-sm transition-all hover:border-neutral-700 hover:bg-neutral-900 active:scale-[0.99]"
              >
                {/* Muscle Group Abbr Tile */}
                <div
                  className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-xl border ${meta.bg} ${meta.border}`}
                >
                  <span className={`text-[11px] font-black tracking-widest ${meta.text}`}>{meta.abbr}</span>
                </div>

                {/* Name + Group + Refs */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-neutral-100 leading-tight">
                      {item.name}
                    </span>
                    {item.isCustom && (
                      <span className="rounded-md bg-lime-400/10 px-1.5 py-0.5 text-[10px] font-bold text-lime-400">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${meta.text}`}>
                      {item.group}
                    </span>

                    {hasVideo && (
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-lime-400 hover:text-lime-300"
                        title="Watch video reference"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        Video
                      </a>
                    )}

                    {hasNotes && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500"
                        title={item.notes}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        Notes
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isCustomized && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDelete(item.id);
                    }}
                    aria-label="Delete customization"
                    title={item.isCustom ? "Delete exercise" : "Revert customizations"}
                    className="shrink-0 rounded-lg p-2 text-neutral-500 hover:bg-red-950/30 hover:text-red-400 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Exercise Edit / Create Modal */}
      {modalOpen ? (
        <Modal
          title={editingId ? `Customize ${name || "Exercise"}` : "New Exercise"}
          onClose={() => setModalOpen(false)}
        >
          <div className="space-y-4">
            {modalError ? <Banner tone="error">{modalError}</Banner> : null}

            <Field
              label="Exercise Name"
              value={name}
              onChange={setName}
              placeholder="e.g. Incline Dumbbell Curl"
              autoFocus={!editingId}
            />

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Muscle Group
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 focus:border-lime-400 focus:outline-none"
              >
                {GROUPS.filter((g) => g !== "All").map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Video Link (YouTube, Vimeo, IG, etc.)"
              value={videoUrl}
              onChange={setVideoUrl}
              placeholder="https://www.youtube.com/watch?v=..."
              type="url"
            />

            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">
                Personal Form Cues & Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Keep elbows tucked, pause 1 sec at top contraction…"
                rows={4}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:border-lime-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={saving || !name.trim()}
                onClick={() => void handleSave()}
              >
                {saving ? "Saving…" : "Save Exercise"}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

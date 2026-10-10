import { useState } from "react";
import { Banner } from "~/components/ui/Banner";
import { Button } from "~/components/ui/Button";
import { Field } from "~/components/ui/Input";
import { Modal } from "~/components/ui/Modal";
import { useStore } from "~/context/StoreContext";
import { errorMessage } from "~/lib/errors";
import { newId } from "~/lib/id";
import { GROUPS } from "~/services/exercises";
import type { Exercise } from "~/types/workout";

export function ExerciseFormModal({
  exercise,
  onSaved,
  onClose,
}: {
  exercise: Exercise | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const { store } = useStore();
  const isEditing = exercise !== null;

  const [name, setName] = useState(exercise?.name ?? "");
  const [group, setGroup] = useState(exercise?.group || "Chest");
  const [videoUrl, setVideoUrl] = useState(exercise?.videoUrl || "");
  const [notes, setNotes] = useState(exercise?.notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError("Please provide an exercise name.");
      return;
    }
    if (!store) return;

    setSaving(true);
    setError(null);
    try {
      await store.saveCustomExercise({
        id: exercise?.id ?? `custom-${newId()}`,
        name: name.trim(),
        group: group.trim() || "Other",
        videoUrl: videoUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        isCustom: exercise ? Boolean(exercise.isCustom) : true,
      });
      onSaved();
    } catch (err) {
      setError(errorMessage(err, "Failed to save exercise."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEditing ? `Customize ${name || "Exercise"}` : "New Exercise"}
      onClose={onClose}
    >
      <div className="space-y-4">
        {error ? <Banner tone="error">{error}</Banner> : null}

        <Field
          label="Exercise Name"
          value={name}
          onChange={setName}
          placeholder="e.g. Incline Dumbbell Curl"
          autoFocus={!isEditing}
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
          <Button variant="secondary" size="md" onClick={onClose}>
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
  );
}

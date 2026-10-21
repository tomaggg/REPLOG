import { MuscleTags } from "~/components/muscles/MuscleTags";
import { NotesIcon, PlayIcon, TrashIcon } from "~/components/ui/icons";
import { getGroupMeta } from "~/lib/exercises";
import { LOAD_TYPES, loadTypeOf } from "~/lib/load-types";
import type { Exercise } from "~/types/workout";

export function ExerciseCard({
  exercise,
  isCustomized,
  onEdit,
  onDelete,
}: {
  exercise: Exercise;
  isCustomized: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const meta = getGroupMeta(exercise.group);

  return (
    <div
      onClick={onEdit}
      className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 backdrop-blur-sm transition-all hover:border-neutral-700 hover:bg-neutral-900 active:scale-[0.99]"
    >
      {/* Muscle group tile */}
      <div
        className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-xl border ${meta.bg} ${meta.border}`}
      >
        <span className={`text-[11px] font-black tracking-widest ${meta.text}`}>{meta.abbr}</span>
      </div>

      {/* Name, group and links */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-neutral-100 leading-tight">
            {exercise.name}
          </span>
          {loadTypeOf(exercise) !== "weighted" && (
            <span className="rounded-md bg-sky-400/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
              {LOAD_TYPES[loadTypeOf(exercise)].label}
            </span>
          )}
          {exercise.isCustom && (
            <span className="rounded-md bg-lime-400/10 px-1.5 py-0.5 text-[10px] font-bold text-lime-400">
              Custom
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={`text-[11px] font-semibold ${meta.text}`}>{exercise.group}</span>

          {exercise.videoUrl && (
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              // Stop the click from also opening the edit modal.
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-lime-400 hover:text-lime-300"
              title="Watch video reference"
            >
              <PlayIcon className="h-3 w-3" />
              Video
            </a>
          )}

          {exercise.notes && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500"
              title={exercise.notes}
            >
              <NotesIcon className="h-3 w-3" />
              Notes
            </span>
          )}
        </div>
        <MuscleTags exerciseId={exercise.id} group={exercise.group} compact />
      </div>

      {isCustomized && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete customization"
          title={exercise.isCustom ? "Delete exercise" : "Revert customizations"}
          className="shrink-0 rounded-lg p-2 text-neutral-500 hover:bg-red-950/30 hover:text-red-400 transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

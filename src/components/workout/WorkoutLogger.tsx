import { useEffect, useMemo, useRef, useState } from "react";
import { Banner } from "~/components/ui/Banner";
import { Button, GhostButton, PrimaryButton } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { formatDuration, formatTime } from "~/components/ui/formatters";
import { BUILTIN_EXERCISES } from "~/services/exercises";
import { useStore } from "~/context/StoreContext";
import type { Exercise, SetEntry, Unit, Workout } from "~/types/workout";
import { bestSet, groupSets, newId } from "~/types/workout";
import { ExerciseHistoryDrawer, type ExerciseHistory } from "./ExerciseHistoryDrawer";
import { ExercisePickerModal } from "./ExercisePickerModal";

function parseNum(v: string): number {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function NumberInput({
  value,
  onCommit,
  inputMode,
  ariaLabel,
  className = "",
}: {
  value: number;
  onCommit: (n: number) => void;
  inputMode: "decimal" | "numeric";
  ariaLabel: string;
  className?: string;
}) {
  const [text, setText] = useState(value === 0 ? "" : String(value));
  const lastValue = useRef(value);

  useEffect(() => {
    if (value !== lastValue.current) {
      lastValue.current = value;
      setText(value === 0 ? "" : String(value));
    }
  }, [value]);

  return (
    <input
      aria-label={ariaLabel}
      value={text}
      inputMode={inputMode}
      enterKeyHint="done"
      placeholder="0"
      onChange={(e) => {
        const next = e.target.value.replace(/[^0-9.,]/g, "");
        setText(next);
        lastValue.current = parseNum(next);
        onCommit(parseNum(next));
      }}
      onBlur={() => {
        const n = parseNum(text);
        setText(n === 0 ? "" : String(n));
      }}
      className={`min-h-12 w-full min-w-0 rounded-xl border border-neutral-700 bg-neutral-950 px-3 text-center text-lg font-semibold text-neutral-100 outline-none focus:border-lime-400 ${className}`}
    />
  );
}

function SetRow({
  set,
  index,
  exerciseName,
  onEdit,
  onRemove,
}: {
  set: SetEntry;
  index: number;
  exerciseName: string;
  onEdit: (patch: Partial<SetEntry>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 shrink-0 text-center text-sm font-semibold text-neutral-500">{index}</span>
      <div className="min-w-0 flex-1">
        <NumberInput
          value={set.weight}
          inputMode="decimal"
          ariaLabel={`${exerciseName} set ${index} weight`}
          onCommit={(n) => onEdit({ weight: n })}
        />
      </div>
      <span className="w-6 shrink-0 text-center text-xs text-neutral-500">{set.unit}</span>
      <span className="shrink-0 text-neutral-600">×</span>
      <div className="min-w-0 flex-1">
        <NumberInput
          value={set.reps}
          inputMode="numeric"
          ariaLabel={`${exerciseName} set ${index} reps`}
          onCommit={(n) => onEdit({ reps: n })}
        />
      </div>
      <button
        type="button"
        aria-label={`Remove ${exerciseName} set ${index}`}
        onClick={onRemove}
        className="min-h-12 w-9 shrink-0 rounded-xl border border-neutral-800 text-lg leading-none text-neutral-500 hover:border-red-900/50 hover:text-red-400 active:scale-95"
      >
        ×
      </button>
    </div>
  );
}

function AddSetRow({
  unit,
  exerciseName,
  seed,
  onAdd,
}: {
  unit: Unit;
  exerciseName: string;
  seed: { weight: number; reps: number };
  onAdd: (weight: number, reps: number) => void;
}) {
  const [weight, setWeight] = useState(seed.weight);
  const [reps, setReps] = useState(seed.reps);
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current) {
      setWeight(seed.weight);
      setReps(seed.reps);
    }
  }, [seed.weight, seed.reps]);

  return (
    <div className="flex items-center gap-2">
      <span className="w-6 shrink-0 text-center text-sm text-neutral-600">+</span>
      <div className="min-w-0 flex-1">
        <NumberInput
          value={weight}
          inputMode="decimal"
          ariaLabel={`${exerciseName} new set weight`}
          onCommit={(n) => {
            touched.current = true;
            setWeight(n);
          }}
        />
      </div>
      <span className="w-6 shrink-0 text-center text-xs text-neutral-500">{unit}</span>
      <span className="shrink-0 text-neutral-600">×</span>
      <div className="min-w-0 flex-1">
        <NumberInput
          value={reps}
          inputMode="numeric"
          ariaLabel={`${exerciseName} new set reps`}
          onCommit={(n) => {
            touched.current = true;
            setReps(n);
          }}
        />
      </div>
      <button
        type="button"
        aria-label={`Add ${exerciseName} set`}
        onClick={() => onAdd(weight, reps)}
        className="min-h-12 w-9 shrink-0 rounded-xl bg-lime-400 text-xl leading-none font-bold text-neutral-950 hover:bg-lime-300 active:scale-95"
      >
        +
      </button>
    </div>
  );
}

export function WorkoutLogger({
  draft,
  history,
  unit,
  busy,
  error,
  onChange,
  onFinish,
  onDiscard,
}: {
  draft: Workout;
  history: Record<string, ExerciseHistory>;
  unit: Unit;
  busy: boolean;
  error: string | null;
  onChange: (next: Workout) => void;
  onFinish: () => void;
  onDiscard: () => void;
}) {
  const { store } = useStore();
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [picking, setPicking] = useState(false);
  const [inspecting, setInspecting] = useState<string | null>(null);

  useEffect(() => {
    if (!store) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await store.listCustomExercises();
        if (!cancelled) setCustomExercises(list);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [store]);

  const exerciseMap = useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const ex of BUILTIN_EXERCISES) {
      map.set(ex.id, ex);
    }
    for (const ex of customExercises) {
      map.set(ex.id, ex);
    }
    return map;
  }, [customExercises]);

  const safeSets = useMemo(() => (Array.isArray(draft?.sets) ? draft.sets : []), [draft?.sets]);
  const groups = useMemo(() => groupSets(safeSets), [safeSets]);

  function addSet(exercise: Exercise, weight: number, reps: number) {
    const nextSets = [...safeSets];
    const existing = nextSets.filter((s) => s.exerciseId === exercise.id);
    const setIndex = existing.length + 1;
    nextSets.push({
      id: newId(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      setIndex,
      weight,
      reps,
      unit,
    });
    onChange({ ...draft, sets: nextSets });
  }

  function updateSet(setId: string, patch: Partial<SetEntry>) {
    const nextSets = safeSets.map((s) => (s.id === setId ? { ...s, ...patch } : s));
    onChange({ ...draft, sets: nextSets });
  }

  function removeSet(setId: string) {
    const nextSets = safeSets.filter((s) => s.id !== setId);
    const renumbered: SetEntry[] = [];
    const counts = new Map<string, number>();
    for (const s of nextSets) {
      const c = (counts.get(s.exerciseId) ?? 0) + 1;
      counts.set(s.exerciseId, c);
      renumbered.push({ ...s, setIndex: c });
    }
    onChange({ ...draft, sets: renumbered });
  }

  function removeExercise(exerciseId: string) {
    const nextSets = safeSets.filter((s) => s.exerciseId !== exerciseId);
    onChange({ ...draft, sets: nextSets });
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Session header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-bold text-neutral-100">Today's Session</h2>
          <p className="text-xs text-neutral-500">
            Started at {formatTime(draft.startedAt)} · {formatDuration(draft.startedAt, null)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {safeSets.length > 0 ? (
            <button
              type="button"
              onClick={onDiscard}
              className="text-xs font-semibold text-neutral-500 hover:text-red-400"
            >
              Discard
            </button>
          ) : null}
        </div>
      </div>

      {error ? <Banner tone="error">{error}</Banner> : null}

      {/* Note input */}
      <input
        value={draft.note || ""}
        onChange={(e) => onChange({ ...draft, note: e.target.value })}
        placeholder="Session note (e.g. Leg Day, felt strong on bench)…"
        className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-200 placeholder-neutral-600 outline-none focus:border-lime-400"
      />

      {/* Grouped exercises */}
      {groups.map((group) => {
        const hist = history[group.exerciseId];
        const lastSet = group.sets[group.sets.length - 1];
        const seed = lastSet
          ? { weight: lastSet.weight, reps: lastSet.reps }
          : hist?.last?.[hist.last.length - 1]
            ? { weight: hist.last[hist.last.length - 1].weight, reps: hist.last[hist.last.length - 1].reps }
            : { weight: 0, reps: 0 };

        const best = bestSet(group.sets);
        const meta = exerciseMap.get(group.exerciseId);

        // Summarise last session sets for this exercise
        // Filter out 0kg×0 placeholder sets (e.g. from routine seeds saved without logging)
        const lastSets = (hist?.last ?? []).filter((s) => s.weight > 0 || s.reps > 0);
        const lastSetCount = lastSets.length;
        // Build a compact "Nx W unit × R" summary grouped by weight+reps
        const lastSummary = lastSets.map((s, i) => (
          <span key={s.id} className="inline-flex items-center gap-1">
            <span className="text-neutral-300 font-semibold">{s.weight}</span>
            <span className="text-neutral-500">{s.unit}</span>
            <span className="text-neutral-600">×</span>
            <span className="text-neutral-300 font-semibold">{s.reps}</span>
            {i < lastSets.length - 1 && <span className="text-neutral-700 mx-0.5">·</span>}
          </span>
        ));

        return (
          <Card key={group.exerciseId} className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-800/80 pb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setInspecting(group.exerciseId)}
                    className="text-left font-bold text-neutral-100 hover:text-lime-400"
                  >
                    {group.exerciseName}
                  </button>
                  {meta?.videoUrl ? (
                    <a
                      href={meta.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open video demonstration"
                      className="inline-flex items-center text-[10px] font-semibold text-lime-400 hover:underline"
                    >
                      ▶ Video
                    </a>
                  ) : null}
                  {meta?.notes ? (
                    <button
                      type="button"
                      onClick={() => setInspecting(group.exerciseId)}
                      title="View form notes"
                      className="inline-flex items-center text-[10px] text-neutral-400 hover:text-neutral-200"
                    >
                      ✎ Notes
                    </button>
                  ) : null}
                </div>
                {best && best.weight > 0 && best.reps > 0 ? (
                  <p className="text-xs text-lime-400">
                    best: {best.weight} {best.unit} × {best.reps}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeExercise(group.exerciseId)}
                className="text-xs text-neutral-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>

            {/* Last session history bar */}
            {lastSetCount > 0 ? (
              <div className="flex items-start gap-2 rounded-xl border border-neutral-800/60 bg-neutral-950/50 px-3 py-2">
                <div className="mt-0.5 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 7v5l4 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-1">
                    Last · {lastSetCount} {lastSetCount === 1 ? "set" : "sets"}
                  </p>
                  <div className="flex flex-wrap gap-x-0.5 gap-y-0.5 text-[11px]">
                    {lastSummary}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              {group.sets.map((s, idx) => (
                <SetRow
                  key={s.id}
                  set={s}
                  index={idx + 1}
                  exerciseName={group.exerciseName}
                  onEdit={(patch) => updateSet(s.id, patch)}
                  onRemove={() => removeSet(s.id)}
                />
              ))}

              <AddSetRow
                unit={unit}
                exerciseName={group.exerciseName}
                seed={seed}
                onAdd={(w, r) => addSet({ id: group.exerciseId, name: group.exerciseName, group: "" }, w, r)}
              />
            </div>
          </Card>
        );
      })}

      {/* Add exercise trigger */}
      <Button
        variant="secondary"
        onClick={() => setPicking(true)}
        className="w-full"
      >
        + Add Exercise
      </Button>

      {/* Finish Session trigger */}
      {safeSets.length > 0 ? (
        <PrimaryButton
          onClick={onFinish}
          disabled={busy}
          className="mt-6 w-full"
        >
          {busy ? "Saving session…" : "Finish Workout"}
        </PrimaryButton>
      ) : null}

      {/* Exercise Picker Modal */}
      {picking ? (
        <ExercisePickerModal
          onPick={(ex) => addSet(ex, 0, 0)}
          onClose={() => setPicking(false)}
          excludeIds={groups.map((g) => g.exerciseId)}
        />
      ) : null}

      {/* History Inspection Drawer */}
      {inspecting ? (
        <ExerciseHistoryDrawer
          exerciseName={groups.find((g) => g.exerciseId === inspecting)?.exerciseName ?? ""}
          exercise={exerciseMap.get(inspecting)}
          history={history[inspecting]}
          onClose={() => setInspecting(null)}
        />
      ) : null}
    </div>
  );
}

// Sharing routines by link. The whole routine is packed into the link itself
// (/routines/import?r=…), so nothing extra is stored in the database and the
// person receiving it decides whether to save it.

import type { Exercise, Routine, RoutineExercise } from "~/types/workout";

/** What a share link contains. */
export interface SharedRoutine {
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  /** The sender's own exercises used by this routine, so the receiver gets them too. */
  customExercises: Exercise[];
}

// Limits for links we receive — they can come from anyone, so don't trust them
const MAX_TEXT = 200;
const MAX_NOTES = 2000;
const MAX_EXERCISES = 50;
const MIN_SETS = 1;
const MAX_SETS = 10;

/** The link to send someone, e.g. https://replog.app/routines/import?r=eyJu… */
export function routineShareUrl(routine: Routine, allCustom: Exercise[], origin: string): string {
  const usedIds = new Set(routine.exercises.map((e) => e.exerciseId));
  const shared: SharedRoutine = {
    name: routine.name,
    description: routine.description,
    exercises: routine.exercises,
    // Only exercises the sender created, not their edits to built-in ones
    customExercises: allCustom.filter((c) => c.isCustom && usedIds.has(c.id)),
  };
  return `${origin}/routines/import?r=${encode(shared)}`;
}

/** Read a routine out of a share link's `r` value. Returns null if it's broken. */
export function decodeSharedRoutine(code: string): SharedRoutine | null {
  try {
    const raw = JSON.parse(decode(code));
    const exercises = (Array.isArray(raw?.exercises) ? raw.exercises : [])
      .slice(0, MAX_EXERCISES)
      .map(cleanRoutineExercise)
      .filter((e: RoutineExercise | null): e is RoutineExercise => e !== null);
    const name = text(raw?.name, MAX_TEXT);
    if (!name || exercises.length === 0) return null;

    const customExercises = (Array.isArray(raw?.customExercises) ? raw.customExercises : [])
      .slice(0, MAX_EXERCISES)
      .map(cleanExercise)
      .filter((e: Exercise | null): e is Exercise => e !== null);

    return {
      name,
      description: text(raw?.description, MAX_TEXT) || undefined,
      exercises,
      customExercises,
    };
  } catch {
    return null;
  }
}

// ---- Validation helpers ----

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanRoutineExercise(raw: any): RoutineExercise | null {
  const exerciseId = text(raw?.exerciseId, MAX_TEXT);
  const exerciseName = text(raw?.exerciseName, MAX_TEXT);
  if (!exerciseId || !exerciseName) return null;
  const sets = Math.round(Number(raw?.targetSets));
  const targetSets = Number.isFinite(sets) ? Math.min(MAX_SETS, Math.max(MIN_SETS, sets)) : 3;
  return { exerciseId, exerciseName, targetSets };
}

function cleanExercise(raw: any): Exercise | null {
  const id = text(raw?.id, MAX_TEXT);
  const name = text(raw?.name, MAX_TEXT);
  if (!id || !name) return null;
  const videoUrl = text(raw?.videoUrl, MAX_TEXT * 5);
  return {
    id,
    name,
    group: text(raw?.group, MAX_TEXT) || "Other",
    // Only real web links, so a shared link can't smuggle in a javascript: URL
    videoUrl: /^https?:\/\//i.test(videoUrl) ? videoUrl : undefined,
    notes: text(raw?.notes, MAX_NOTES) || undefined,
    isCustom: true,
  };
}

// ---- Packing data into a URL-safe string (UTF-8 → base64url) ----

function encode(data: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(code: string): string {
  const base64 = code.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Pure helpers for the exercise library page. No React, no database.

import { BUILTIN_EXERCISES } from "~/services/exercises";
import type { Exercise } from "~/types/workout";

/**
 * Built-in exercises plus the user's own. 
 */
export function mergeExercises(customList: Exercise[]): Exercise[] {
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
}

/** Keep exercises in `group` ("All" = any) whose name, group or notes contain `query`. */
export function filterExercises(
  exercises: Exercise[],
  group: string,
  query: string,
): Exercise[] {
  const q = query.trim().toLowerCase();
  return exercises.filter((item) => {
    const matchGroup =
      group === "All" || item.group.toLowerCase() === group.toLowerCase();
    if (!matchGroup) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.group.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q))
    );
  });
}

// ─── Muscle group colours ───────────────────────────────────────────────────

export interface GroupMeta {
  bg: string;
  text: string;
  border: string;
  abbr: string;
}

const GROUP_META: Record<string, GroupMeta> = {
  Chest:     { bg: "bg-rose-500/10",    text: "text-rose-400",    border: "border-rose-500/20",    abbr: "CH" },
  Back:      { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20",     abbr: "BK" },
  Legs:      { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   abbr: "LG" },
  Shoulders: { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20",  abbr: "SH" },
  Arms:      { bg: "bg-orange-500/10",  text: "text-orange-400",  border: "border-orange-500/20",  abbr: "AR" },
  Core:      { bg: "bg-lime-500/10",    text: "text-lime-400",    border: "border-lime-500/20",    abbr: "CR" },
  Other:     { bg: "bg-neutral-700/30", text: "text-neutral-400", border: "border-neutral-700/30", abbr: "OT" },
};

/** Colours and 2-letter label for a muscle group; unknown groups use "Other". */
export function getGroupMeta(group: string): GroupMeta {
  return GROUP_META[group] ?? GROUP_META.Other;
}

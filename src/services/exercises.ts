import type { Exercise } from "~/types/workout";

export const BUILTIN_EXERCISES: Exercise[] = [
  // Chest
  { id: "bench-press", name: "Barbell Bench Press", group: "Chest" },
  { id: "incline-bench-press", name: "Incline Barbell Bench Press", group: "Chest" },
  { id: "dumbbell-bench-press", name: "Dumbbell Bench Press", group: "Chest" },
  { id: "incline-db-press", name: "Incline Dumbbell Press", group: "Chest" },
  { id: "dip", name: "Chest Dip", group: "Chest" },
  { id: "push-up", name: "Push-Up", group: "Chest" },
  { id: "cable-flye", name: "Cable Flye", group: "Chest" },

  // Back
  { id: "barbell-row", name: "Barbell Row", group: "Back" },
  { id: "lat-pulldown", name: "Lat Pulldown", group: "Back" },
  { id: "pull-up", name: "Pull-Up", group: "Back" },
  { id: "chin-up", name: "Chin-Up", group: "Back" },
  { id: "db-row", name: "Single-Arm Dumbbell Row", group: "Back" },
  { id: "seated-cable-row", name: "Seated Cable Row", group: "Back" },
  { id: "deadlift", name: "Barbell Deadlift", group: "Back" },

  // Legs
  { id: "squat", name: "Barbell Back Squat", group: "Legs" },
  { id: "front-squat", name: "Barbell Front Squat", group: "Legs" },
  { id: "leg-press", name: "Leg Press", group: "Legs" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", group: "Legs" },
  { id: "walking-lunge", name: "Dumbbell Walking Lunge", group: "Legs" },
  { id: "leg-extension", name: "Leg Extension", group: "Legs" },
  { id: "leg-curl", name: "Lying Leg Curl", group: "Legs" },
  { id: "calf-raise", name: "Standing Calf Raise", group: "Legs" },

  // Shoulders
  { id: "overhead-press", name: "Overhead Barbell Press", group: "Shoulders" },
  { id: "db-shoulder-press", name: "Dumbbell Shoulder Press", group: "Shoulders" },
  { id: "lateral-raise", name: "Dumbbell Lateral Raise", group: "Shoulders" },
  { id: "face-pull", name: "Cable Face Pull", group: "Shoulders" },
  { id: "rear-delt-flye", name: "Rear Delt Flye", group: "Shoulders" },

  // Arms
  { id: "barbell-curl", name: "Barbell Curl", group: "Arms" },
  { id: "db-curl", name: "Dumbbell Curl", group: "Arms" },
  { id: "hammer-curl", name: "Dumbbell Hammer Curl", group: "Arms" },
  { id: "triceps-pushdown", name: "Triceps Cable Pushdown", group: "Arms" },
  { id: "skullcrusher", name: "Barbell Skullcrusher", group: "Arms" },
  { id: "overhead-triceps-ext", name: "Overhead Dumbbell Triceps Extension", group: "Arms" },

  // Core
  { id: "plank", name: "Plank", group: "Core" },
  { id: "hanging-leg-raise", name: "Hanging Leg Raise", group: "Core" },
  { id: "ab-wheel", name: "Ab Wheel Rollout", group: "Core" },
  { id: "cable-crunch", name: "Cable Crunch", group: "Core" },
];

export const GROUPS = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"] as const;

export function searchExercises(
  query: string,
  customList: Exercise[] = [],
  groupFilter: string = "All",
): Exercise[] {
  const q = query.trim().toLowerCase();

  // Merge built-in exercises with user customizations (custom exercises take precedence on ID match)
  const map = new Map<string, Exercise>();
  for (const ex of BUILTIN_EXERCISES) {
    map.set(ex.id, ex);
  }
  for (const custom of customList) {
    const existing = map.get(custom.id);
    if (existing) {
      map.set(custom.id, { ...existing, ...custom });
    } else {
      map.set(custom.id, custom);
    }
  }

  const all = Array.from(map.values());

  return all.filter((e) => {
    const matchesGroup = groupFilter === "All" || e.group.toLowerCase() === groupFilter.toLowerCase();
    if (!matchesGroup) return false;

    if (!q) return true;
    return (
      e.name.toLowerCase().includes(q) ||
      e.group.toLowerCase().includes(q) ||
      (e.notes && e.notes.toLowerCase().includes(q))
    );
  });
}

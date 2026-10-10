// Muscle mix for every built-in exercise (ids from exercises.ts).
// Numbers are relative weights: { lats: 5, bicepsLong: 1 } = mostly lats.
// Similar movements share a template; tweak a template to adjust them all.
// Exercises missing here fall back to their group's default in lib/muscles.ts.

import type { MuscleMix } from "~/lib/muscles";

// ---------- Chest ----------
const FLAT_PRESS: MuscleMix = { midChest: 5, upperChest: 1.5, lowerChest: 1.5, frontDelts: 1.5, tricepsLateral: 1.5, tricepsLong: 0.5 };
const INCLINE_PRESS: MuscleMix = { upperChest: 5, midChest: 2, frontDelts: 2, tricepsLateral: 1.5, tricepsLong: 0.5 };
const DECLINE_PRESS: MuscleMix = { lowerChest: 5, midChest: 2.5, tricepsLateral: 1.5, tricepsLong: 0.5, frontDelts: 0.5 };
const CLOSE_GRIP_PRESS: MuscleMix = { tricepsLateral: 3.5, tricepsLong: 1.5, midChest: 2.5, upperChest: 0.5, frontDelts: 1.5 };
const FLAT_FLYE: MuscleMix = { midChest: 6, upperChest: 1.5, lowerChest: 1.5, frontDelts: 1 };
const INCLINE_FLYE: MuscleMix = { upperChest: 6, midChest: 2, frontDelts: 1.5 };
const HIGH_TO_LOW_FLYE: MuscleMix = { lowerChest: 4.5, midChest: 4, frontDelts: 0.5 };
const PUSH_UP: MuscleMix = { midChest: 4, upperChest: 1, lowerChest: 1.5, frontDelts: 1.5, tricepsLateral: 1.5, tricepsLong: 0.5, deepCore: 0.5 };
const CLOSE_PUSH_UP: MuscleMix = { tricepsLateral: 3.5, tricepsLong: 1, midChest: 2.5, frontDelts: 1.5, deepCore: 0.5 };

// ---------- Back ----------
const WIDE_PULL: MuscleMix = { lats: 5, midBack: 2, rearDelts: 1, bicepsLong: 0.75, bicepsShort: 0.75, brachialis: 0.5, forearms: 0.5 };
const NEUTRAL_PULL: MuscleMix = { lats: 5, midBack: 1.5, bicepsLong: 1, bicepsShort: 1, brachialis: 1, forearms: 0.5 };
const PULL_UP: MuscleMix = { ...WIDE_PULL, deepCore: 0.5 };
const NEUTRAL_PULL_UP: MuscleMix = { ...NEUTRAL_PULL, deepCore: 0.5 };
const LAT_ISOLATION: MuscleMix = { lats: 8, tricepsLong: 1, deepCore: 0.5 };
const LAT_PULLOVER: MuscleMix = { lats: 7, tricepsLong: 1, lowerChest: 1, deepCore: 0.5 };
const UPPER_BACK_ROW: MuscleMix = { midBack: 4, lats: 2.5, rearDelts: 1.5, traps: 1, bicepsLong: 0.5, bicepsShort: 0.5, brachialis: 0.5 };
const LAT_ROW: MuscleMix = { lats: 5, midBack: 2, rearDelts: 0.5, bicepsLong: 0.75, bicepsShort: 0.75, brachialis: 0.5 };
const ROW_WITH_SHRUG: MuscleMix = { midBack: 4.5, traps: 2, lats: 1.5, rearDelts: 1, bicepsLong: 0.5, bicepsShort: 0.5 };
const WIDE_ELBOW_ROW: MuscleMix = { midBack: 4, rearDelts: 2.5, lats: 1, traps: 1, bicepsLong: 0.5, bicepsShort: 0.5 };
const SHRUG: MuscleMix = { traps: 8, forearms: 1, midBack: 1 };

// ---------- Shoulders ----------
const OVERHEAD_PRESS: MuscleMix = { frontDelts: 5, sideDelts: 2, tricepsLateral: 1.5, tricepsLong: 0.5, upperChest: 1, traps: 0.5 };
const ARNOLD_PRESS: MuscleMix = { frontDelts: 4.5, sideDelts: 3, tricepsLateral: 1.5, upperChest: 0.5 };
const LATERAL_RAISE: MuscleMix = { sideDelts: 8, frontDelts: 0.5, traps: 1 };
const Y_RAISE: MuscleMix = { sideDelts: 6, midBack: 1.5, traps: 1, rearDelts: 1 };
const UPRIGHT_ROW: MuscleMix = { sideDelts: 5, traps: 3, frontDelts: 1, brachialis: 0.5, bicepsLong: 0.5 };
const REAR_DELT_FLYE: MuscleMix = { rearDelts: 6, midBack: 2.5, traps: 0.5, sideDelts: 0.5 };
const FACE_PULL: MuscleMix = { rearDelts: 5, midBack: 2.5, traps: 1, sideDelts: 0.5 };

// ---------- Arms: biceps ----------
const CURL: MuscleMix = { bicepsLong: 3.5, bicepsShort: 3.5, brachialis: 2, forearms: 1 };
const STRETCH_CURL: MuscleMix = { bicepsLong: 5, bicepsShort: 2.5, brachialis: 1.5, forearms: 0.5 };
const PREACHER_CURL: MuscleMix = { bicepsShort: 5, bicepsLong: 2.5, brachialis: 2, forearms: 0.5 };
const FAT_GRIP_CURL: MuscleMix = { bicepsLong: 3, bicepsShort: 3, brachialis: 2, forearms: 2.5 };
const FAT_GRIP_PREACHER: MuscleMix = { bicepsShort: 4.5, bicepsLong: 2, brachialis: 2, forearms: 2 };
const HAMMER_CURL: MuscleMix = { brachialis: 4.5, forearms: 3, bicepsLong: 2, bicepsShort: 0.5 };
const REVERSE_CURL: MuscleMix = { forearms: 4.5, brachialis: 4, bicepsLong: 0.75, bicepsShort: 0.75 };
const ZOTTMAN_CURL: MuscleMix = { brachialis: 3, forearms: 3, bicepsLong: 2, bicepsShort: 2 };

// ---------- Arms: triceps ----------
const OVERHEAD_TRICEPS: MuscleMix = { tricepsLong: 6.5, tricepsLateral: 3.5 };
const SKULL_CRUSHER: MuscleMix = { tricepsLong: 5, tricepsLateral: 5 };
const PRESSDOWN: MuscleMix = { tricepsLateral: 7, tricepsLong: 3 };
const KICKBACK: MuscleMix = { tricepsLateral: 6, tricepsLong: 4 };
const JM_PRESS: MuscleMix = { tricepsLateral: 6, tricepsLong: 2.5, midChest: 1, frontDelts: 0.5 };
const DIP: MuscleMix = { tricepsLateral: 4, tricepsLong: 1.5, lowerChest: 3, frontDelts: 1.5 };
const BENCH_DIP: MuscleMix = { tricepsLateral: 5, tricepsLong: 2, frontDelts: 2, lowerChest: 1 };

// ---------- Core ----------
const CRUNCH: MuscleMix = { upperAbs: 6, lowerAbs: 2, obliques: 1.5, deepCore: 0.5 };
const BICYCLE_CRUNCH: MuscleMix = { obliques: 5, upperAbs: 3, lowerAbs: 2, hipFlexors: 0.5 };
const REVERSE_CRUNCH: MuscleMix = { lowerAbs: 6, upperAbs: 2, obliques: 1, hipFlexors: 1 };
const LEG_RAISE: MuscleMix = { lowerAbs: 5, hipFlexors: 3, upperAbs: 1, obliques: 1 };
const ROLLOUT: MuscleMix = { upperAbs: 3.5, lowerAbs: 2.5, deepCore: 2.5, obliques: 1, lats: 1 };
const PLANK: MuscleMix = { deepCore: 4, upperAbs: 2, lowerAbs: 2, obliques: 2 };
const ANTI_ROTATION: MuscleMix = { obliques: 5, deepCore: 4, upperAbs: 1 };
const ROTATION: MuscleMix = { obliques: 6, upperAbs: 2, lowerAbs: 1, hipFlexors: 1 };

// ---------- Legs ----------
const BACK_SQUAT: MuscleMix = { quads: 6, glutes: 2.5, adductors: 1.5, lowerBack: 0.5 };
const FRONT_SQUAT: MuscleMix = { quads: 6.5, glutes: 2, adductors: 1, deepCore: 0.5, midBack: 0.5 };
const MACHINE_SQUAT: MuscleMix = { quads: 7, glutes: 2, adductors: 1 };
const BELT_SQUAT: MuscleMix = { quads: 5.5, glutes: 3, adductors: 1.5 };
const GOBLET_SQUAT: MuscleMix = { quads: 6, glutes: 2.5, adductors: 1, deepCore: 0.5 };
const LEG_PRESS: MuscleMix = { quads: 6, glutes: 2.5, adductors: 1.5 };
const SINGLE_LEG_PRESS: MuscleMix = { quads: 5.5, glutes: 3, adductors: 1, gluteMed: 0.5 };
const LUNGE: MuscleMix = { quads: 4.5, glutes: 3.5, adductors: 1.5, gluteMed: 0.5 };
const REVERSE_LUNGE: MuscleMix = { glutes: 4, quads: 4, adductors: 1.5, gluteMed: 0.5 };
const SPLIT_SQUAT: MuscleMix = { quads: 4.5, glutes: 4, adductors: 1.5, gluteMed: 0.5 };
const STEP_UP: MuscleMix = { quads: 4.5, glutes: 4, gluteMed: 1 };
const QUAD_ISOLATION: MuscleMix = { quads: 10 };
const REVERSE_NORDIC: MuscleMix = { quads: 8, hipFlexors: 1.5 };
const HINGE: MuscleMix = { hamstrings: 5, glutes: 3, lowerBack: 2, forearms: 0.5 };
const SNATCH_GRIP_HINGE: MuscleMix = { hamstrings: 4.5, glutes: 3, lowerBack: 2, midBack: 1, traps: 0.5, forearms: 0.5 };
const GOOD_MORNING: MuscleMix = { hamstrings: 4.5, lowerBack: 3, glutes: 2.5 };
const HYPEREXTENSION: MuscleMix = { glutes: 3.5, hamstrings: 3.5, lowerBack: 3 };
const LYING_LEG_CURL: MuscleMix = { hamstrings: 9, calves: 1 };
const SEATED_LEG_CURL: MuscleMix = { hamstrings: 10 };
const NORDIC: MuscleMix = { hamstrings: 9, calves: 0.5, glutes: 0.5 };
const GLUTE_HAM_RAISE: MuscleMix = { hamstrings: 7, glutes: 2, calves: 1 };
const HIP_THRUST: MuscleMix = { glutes: 7, hamstrings: 1.5, quads: 1, gluteMed: 0.5 };
const SINGLE_LEG_HIP_THRUST: MuscleMix = { glutes: 6.5, gluteMed: 1.5, hamstrings: 1.5, quads: 0.5 };
const ABDUCTION: MuscleMix = { gluteMed: 8, glutes: 2 };
const ADDUCTION: MuscleMix = { adductors: 10 };
const COPENHAGEN: MuscleMix = { adductors: 8, obliques: 1.5, deepCore: 0.5 };
const CALF_RAISE: MuscleMix = { calves: 10 };
const CALF_JUMP: MuscleMix = { calves: 9, quads: 1 };

export const EXERCISE_MUSCLES: Record<string, MuscleMix> = {
  // Chest
  "chest-press-machine": FLAT_PRESS,
  "dumbbell-chest-press": FLAT_PRESS,
  "low-incline-barbell-press": INCLINE_PRESS,
  "low-incline-db-press": INCLINE_PRESS,
  "low-incline-machine-press": INCLINE_PRESS,
  "low-incline-smith-machine-press": INCLINE_PRESS,
  "decline-barbell-press": DECLINE_PRESS,
  "decline-machine-chest-press": DECLINE_PRESS,
  "decline-smith-machine-press": DECLINE_PRESS,
  "close-grip-bench-press": CLOSE_GRIP_PRESS,
  "pec-deck": FLAT_FLYE,
  "pec-deck-w-integrated-partials": FLAT_FLYE,
  "db-flye-w-integrated-partials": FLAT_FLYE,
  "low-incline-db-flye": INCLINE_FLYE,
  "low-to-high-cable-crossover": INCLINE_FLYE,
  "bent-over-cable-pec-flye-w-integrated-partials": HIGH_TO_LOW_FLYE,
  "deficit-pushup": PUSH_UP,
  "close-grip-push-up": CLOSE_PUSH_UP,

  // Back
  "wide-grip-lat-pulldown": WIDE_PULL,
  "overhand-lat-pulldown": WIDE_PULL,
  "lean-back-lat-pulldown": { ...WIDE_PULL, midBack: 2.5 },
  "lean-back-machine-pulldown": { ...WIDE_PULL, midBack: 2.5 },
  "dual-handle-lat-pulldown-mid-back-lats": { lats: 4.5, midBack: 3, rearDelts: 0.5, bicepsLong: 0.75, bicepsShort: 0.75, brachialis: 0.5 },
  "half-kneeling-1-arm-lat-pulldown": NEUTRAL_PULL,
  "pull-up": PULL_UP,
  "medium-grip-pull-up": PULL_UP,
  "wide-grip-band-assisted-pull-up": PULL_UP,
  "neutral-grip-pullup": NEUTRAL_PULL_UP,
  "1-arm-lat-pull-in": LAT_ISOLATION,
  "cable-lat-prayer": LAT_ISOLATION,
  "straight-bar-lat-prayer": LAT_ISOLATION,
  "cross-body-lat-pull-around": LAT_ISOLATION,
  "db-lat-pullover": LAT_PULLOVER,
  "machine-lat-pullover": LAT_PULLOVER,
  "chest-supported-machine-row": UPPER_BACK_ROW,
  "chest-supported-t-bar-row": UPPER_BACK_ROW,
  "overhand-machine-row": UPPER_BACK_ROW,
  "super-rom-overhand-cable-row": UPPER_BACK_ROW,
  "elbows-in-1-arm-db-row": LAT_ROW,
  "lat-focused-cable-row": LAT_ROW,
  "chest-supported-t-bar-row-kelso-shrug": ROW_WITH_SHRUG,
  "incline-chest-supported-db-row-kelso-shrug": ROW_WITH_SHRUG,
  "machine-chest-supported-row-kelso-shrug": ROW_WITH_SHRUG,
  "arm-out-single-arm-db-row": WIDE_ELBOW_ROW,
  "helms-row": WIDE_ELBOW_ROW,
  "db-shrug": SHRUG,
  "machine-shrug": SHRUG,
  "cable-paused-shrug-in": SHRUG,

  // Shoulders
  "seated-barbell-shoulder-press": OVERHEAD_PRESS,
  "seated-db-shoulder-press": OVERHEAD_PRESS,
  "machine-shoulder-press": OVERHEAD_PRESS,
  "smith-machine-shoulder-press": OVERHEAD_PRESS,
  "cable-shoulder-press": OVERHEAD_PRESS,
  "standing-db-arnold-press": ARNOLD_PRESS,
  "db-lateral-raise": LATERAL_RAISE,
  "super-rom-db-lateral-raise": LATERAL_RAISE,
  "machine-lateral-raise": LATERAL_RAISE,
  "cuffed-behind-the-back-lateral-raise": LATERAL_RAISE,
  "cross-body-cable-y-raise": Y_RAISE,
  "cable-upright-row": UPRIGHT_ROW,
  "bent-over-reverse-db-flye": REAR_DELT_FLYE,
  "bent-over-reverse-db-flye-w-integrated-partials": REAR_DELT_FLYE,
  "cable-reverse-flye-mechanical-dropset": REAR_DELT_FLYE,
  "rear-delt-45-cable-flye": REAR_DELT_FLYE,
  "reverse-pec-deck": REAR_DELT_FLYE,
  "reverse-pec-deck-w-integrated-partials": REAR_DELT_FLYE,
  "db-rear-delt-swing": { rearDelts: 6, midBack: 2, traps: 1 },
  "rope-face-pull": FACE_PULL,
  "lying-paused-rope-face-pull": FACE_PULL,

  // Arms — biceps
  "bottom-2-3-ez-bar-curl": CURL,
  "slow-eccentric-db-curl": CURL,
  "concentration-cable-curl": PREACHER_CURL,
  "db-concentration-curl": PREACHER_CURL,
  "bayesian-cable-curl": STRETCH_CURL,
  "slow-eccentric-bayesian-curl": STRETCH_CURL,
  "db-incline-curl": STRETCH_CURL,
  "incline-db-stretch-curl": STRETCH_CURL,
  "slow-eccentric-db-incline-curl": STRETCH_CURL,
  "overhead-cable-curl": { bicepsShort: 4.5, bicepsLong: 3, brachialis: 1.5, forearms: 0.5 },
  "kneeling-overhead-cable-curl": { bicepsShort: 4.5, bicepsLong: 3, brachialis: 1.5, forearms: 0.5 },
  "bottom-2-3-constant-tension-preacher-curl": PREACHER_CURL,
  "db-preacher-curl": PREACHER_CURL,
  "db-scott-curl": PREACHER_CURL,
  "slow-eccentric-db-scott-curl": PREACHER_CURL,
  "spider-curl": PREACHER_CURL,
  "n1-style-short-head-curl": { bicepsShort: 6, bicepsLong: 2, brachialis: 1.5, forearms: 0.5 },
  "fat-grip-db-curl": FAT_GRIP_CURL,
  "fat-grip-preacher-curl": FAT_GRIP_PREACHER,
  "hammer-curl": HAMMER_CURL,
  "hammer-preacher-curl": { ...HAMMER_CURL, brachialis: 5 },
  "reverse-grip-cable-curl": REVERSE_CURL,
  "reverse-grip-db-curl": REVERSE_CURL,
  "reverse-grip-ez-bar-curl": REVERSE_CURL,
  "inverse-db-zottman-curl": ZOTTMAN_CURL,

  // Arms — triceps
  "overhead-cable-triceps-extension-bar": OVERHEAD_TRICEPS,
  "overhead-cable-triceps-extension-rope": OVERHEAD_TRICEPS,
  "katana-triceps-extension": OVERHEAD_TRICEPS,
  "db-french-press": OVERHEAD_TRICEPS,
  "seated-db-french-press": OVERHEAD_TRICEPS,
  "slow-eccentric-db-french-press": OVERHEAD_TRICEPS,
  "cable-skull-crusher": SKULL_CRUSHER,
  "db-skull-crusher": SKULL_CRUSHER,
  "ez-bar-skull-crusher": SKULL_CRUSHER,
  "slow-eccentric-db-skull-crusher": SKULL_CRUSHER,
  "slow-eccentric-ez-bar-skull-crusher": SKULL_CRUSHER,
  "triceps-pressdown-bar": PRESSDOWN,
  "triceps-pressdown-rope": PRESSDOWN,
  "triceps-diverging-pressdown-long-rope-or-2-ropes": PRESSDOWN,
  "dual-cable-triceps-press": PRESSDOWN,
  "cable-triceps-kickback": KICKBACK,
  "db-triceps-kickback": KICKBACK,
  "barbell-jm-press": JM_PRESS,
  "smith-machine-jm-press": JM_PRESS,
  "bodyweight-dip": DIP,
  "paused-assisted-dip": DIP,
  "close-grip-assisted-dip": { ...DIP, tricepsLateral: 5, lowerChest: 2 },
  "bench-dip": BENCH_DIP,

  // Core
  "cable-crunch": CRUNCH,
  "machine-crunch": CRUNCH,
  "plate-weighted-crunch": CRUNCH,
  "bicycle-crunch": BICYCLE_CRUNCH,
  "reverse-crunch": REVERSE_CRUNCH,
  "hanging-leg-raise": { ...LEG_RAISE, forearms: 0.5 },
  "roman-chair-leg-raise": LEG_RAISE,
  "ab-wheel-rollout": ROLLOUT,
  "swiss-ball-rollout": ROLLOUT,
  "llpt-plank": PLANK,
  "half-kneeling-pallof-press": ANTI_ROTATION,
  "medicine-ball-russian-twists": ROTATION,
  "stomach-vacuums": { deepCore: 10 },

  // Legs — squat patterns
  "high-bar-back-squat": BACK_SQUAT,
  "smith-machine-squat": MACHINE_SQUAT,
  "machine-squat": MACHINE_SQUAT,
  "hack-squat": MACHINE_SQUAT,
  "front-squat": FRONT_SQUAT,
  "belt-squat": BELT_SQUAT,
  "goblet-squat": GOBLET_SQUAT,
  "leg-press": LEG_PRESS,
  "single-leg-leg-press": SINGLE_LEG_PRESS,
  "barbell-lunge": LUNGE,
  "db-walking-lunge": LUNGE,
  "smith-machine-lunge": LUNGE,
  "db-reverse-lunge": REVERSE_LUNGE,
  "smith-machine-reverse-lunge": REVERSE_LUNGE,
  "db-bulgarian-split-squat": SPLIT_SQUAT,
  "db-step-up": STEP_UP,
  "leg-extension": QUAD_ISOLATION,
  "sissy-squat": QUAD_ISOLATION,
  "reverse-nordic": REVERSE_NORDIC,

  // Legs — hinge & hamstrings
  "db-rdl": HINGE,
  "paused-barbell-rdl": HINGE,
  "paused-db-rdl": HINGE,
  "snatch-grip-rdl": SNATCH_GRIP_HINGE,
  "good-morning": GOOD_MORNING,
  "arms-extended-45-hyperextension": HYPEREXTENSION,
  "prisoner-45-hyperextension": HYPEREXTENSION,
  "lying-leg-curl": LYING_LEG_CURL,
  "seated-leg-curl": SEATED_LEG_CURL,
  "nordic-ham-curl": NORDIC,
  "glute-ham-raise": GLUTE_HAM_RAISE,

  // Legs — glutes, hips, calves
  "barbell-hip-thrust": HIP_THRUST,
  "single-leg-db-hip-thrust": SINGLE_LEG_HIP_THRUST,
  "cable-hip-abduction": ABDUCTION,
  "machine-hip-abduction": ABDUCTION,
  "lateral-band-walk": ABDUCTION,
  "cable-hip-adduction": ADDUCTION,
  "machine-hip-adduction": ADDUCTION,
  "copenhagen-hip-adduction": COPENHAGEN,
  "standing-calf-raise": CALF_RAISE,
  "seated-calf-raise": CALF_RAISE,
  "donkey-calf-raise": CALF_RAISE,
  "leg-press-calf-press": CALF_RAISE,
  "db-calf-jumps": CALF_JUMP,
  "leg-press-calf-jumps": CALF_JUMP,
};

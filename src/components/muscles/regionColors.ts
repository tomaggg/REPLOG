import type { Region } from "~/lib/muscles";

/** One color per body region, used for bars, dots and tags. */
export const REGION_COLORS: Record<Region, { bar: string; text: string }> = {
  Chest: { bar: "bg-rose-400", text: "text-rose-300" },
  Shoulders: { bar: "bg-amber-400", text: "text-amber-300" },
  Back: { bar: "bg-sky-400", text: "text-sky-300" },
  Arms: { bar: "bg-violet-400", text: "text-violet-300" },
  Core: { bar: "bg-emerald-400", text: "text-emerald-300" },
  Legs: { bar: "bg-orange-400", text: "text-orange-300" },
};

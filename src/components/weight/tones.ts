import type { Tone } from "~/lib/bmi";

/** Colors for BMI and body-fat bands. */
export const TONE_STYLES: Record<Tone, { bar: string; text: string; pill: string }> = {
  low: { bar: "bg-sky-400", text: "text-sky-300", pill: "bg-sky-400/15 text-sky-300" },
  good: { bar: "bg-lime-400", text: "text-lime-400", pill: "bg-lime-400/15 text-lime-400" },
  warn: { bar: "bg-amber-400", text: "text-amber-300", pill: "bg-amber-400/15 text-amber-300" },
  high: { bar: "bg-red-400", text: "text-red-300", pill: "bg-red-400/15 text-red-300" },
};

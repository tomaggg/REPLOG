// BMI and body-fat estimates. BMI = weight (kg) / height (m)².

import type { Sex, Unit, UserProfile } from "~/types/workout";
import { convertWeight } from "./weight";

const CM_PER_INCH = 2.54;

/** Height in cm. Old profiles saved height without a unit: under 100 can only be inches. */
export function heightCmOf(profile: UserProfile | null): number | null {
  if (profile?.heightCm) return profile.heightCm;
  if (!profile?.height) return null;
  return profile.height < 100 ? profile.height * CM_PER_INCH : profile.height;
}

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * 12 + inches) * CM_PER_INCH;
}

/** "175 cm" for metric (kg) users, "5′9″" for imperial (lb) users. */
export function formatHeight(cm: number, unit: Unit): string {
  if (unit === "kg") return `${Math.round(cm)} cm`;
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}′${inches}″`;
}

export function ageFrom(birthYear: number | undefined): number | null {
  return birthYear ? new Date().getFullYear() - birthYear : null;
}

export function bmi(weight: number, unit: Unit, heightCm: number): number {
  const m = heightCm / 100;
  return convertWeight(weight, unit, "kg") / (m * m);
}

// ---- BMI categories (WHO adult ranges, the same for men and women) ----

export type Tone = "low" | "good" | "warn" | "high";

export const BMI_CATEGORIES = [
  { label: "Underweight", from: 0, to: 18.5, tone: "low" },
  { label: "Healthy", from: 18.5, to: 25, tone: "good" },
  { label: "Overweight", from: 25, to: 30, tone: "warn" },
  { label: "Obese", from: 30, to: Infinity, tone: "high" },
] as const satisfies readonly { label: string; from: number; to: number; tone: Tone }[];

export type BmiCategory = (typeof BMI_CATEGORIES)[number];

export function bmiCategory(value: number): BmiCategory {
  return BMI_CATEGORIES.find((c) => value < c.to) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

/** The weights (in `unit`) that give a healthy BMI of 18.5–24.9 at this height. */
export function healthyWeightRange(heightCm: number, unit: Unit): { min: number; max: number } {
  const m2 = (heightCm / 100) ** 2;
  return {
    min: convertWeight(18.5 * m2, "kg", unit),
    max: convertWeight(24.9 * m2, "kg", unit),
  };
}

// ---- Body fat (this is where sex matters) ----

/**
 * Estimated body-fat % from BMI, age and sex (Deurenberg et al., 1991).
 * At the same BMI, women carry about 11% more body fat than men.
 * Only meant for adults; returns null otherwise.
 */
export function estimatedBodyFat(bmiValue: number, age: number | null, sex: Sex | undefined): number | null {
  if (!sex || age === null || age < 18) return null;
  const male = sex === "male" ? 1 : 0;
  return 1.2 * bmiValue + 0.23 * age - 10.8 * male - 5.4;
}

/** Body-fat bands (American Council on Exercise), different for men and women. */
export const BODY_FAT_BANDS: Record<Sex, { label: string; from: number; tone: Tone }[]> = {
  male: [
    { label: "Essential", from: 0, tone: "low" },
    { label: "Athletic", from: 6, tone: "good" },
    { label: "Fitness", from: 14, tone: "good" },
    { label: "Average", from: 18, tone: "warn" },
    { label: "Obese", from: 25, tone: "high" },
  ],
  female: [
    { label: "Essential", from: 0, tone: "low" },
    { label: "Athletic", from: 14, tone: "good" },
    { label: "Fitness", from: 21, tone: "good" },
    { label: "Average", from: 25, tone: "warn" },
    { label: "Obese", from: 32, tone: "high" },
  ],
};

export function bodyFatBand(percent: number, sex: Sex) {
  const bands = BODY_FAT_BANDS[sex];
  return [...bands].reverse().find((b) => percent >= b.from) ?? bands[0];
}

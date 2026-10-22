// Weekly streak: how many weeks in a row (Monday–Sunday) had at least one workout.

import type { Workout } from "~/types/workout";
import { addDays, startOfDay, startOfWeek } from "./dates";

/**
 * Weeks in a row with a workout, counted back from this week. If you haven't
 * trained yet this week, the streak isn't broken: it counts from last week.
 */
export function weekStreak(workouts: Workout[], now = Date.now()): number {
  const weeks = new Set(workouts.map((w) => startOfWeek(w.startedAt)));
  let week = startOfWeek(now);
  if (!weeks.has(week)) week = addDays(week, -7);

  let streak = 0;
  while (weeks.has(week)) {
    streak += 1;
    week = addDays(week, -7);
  }
  return streak;
}

export interface WeekDay {
  /** 00:00 of the day */
  date: number;
  trained: boolean;
  isToday: boolean;
  isFuture: boolean;
}

/** Monday to Sunday of this week, with which days had a workout */
export function thisWeek(workouts: Workout[], now = Date.now()): WeekDay[] {
  const trainedDays = new Set(workouts.map((w) => startOfDay(w.startedAt)));
  const today = startOfDay(now);
  const monday = startOfWeek(now);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return { date, trained: trainedDays.has(date), isToday: date === today, isFuture: date > today };
  });
}

// Small calendar helpers. All work in the phone's local time.

export const DAY_MS = 24 * 60 * 60 * 1000;

/** 00:00 of the day `ms` falls in */
export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Monday 00:00 of the week `ms` falls in */
export function startOfWeek(ms: number): number {
  const d = new Date(startOfDay(ms));
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

/** The 1st of the month `ms` falls in, at 00:00 */
export function startOfMonth(ms: number): number {
  const d = new Date(startOfDay(ms));
  d.setDate(1);
  return d.getTime();
}

/** Calendar days later (or earlier, if negative). Safe across daylight-saving changes. */
export function addDays(ms: number, days: number): number {
  const d = new Date(ms);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export function addMonths(ms: number, months: number): number {
  const d = new Date(ms);
  d.setMonth(d.getMonth() + months);
  return d.getTime();
}

/** "2026-10-22" for a date input */
export function toDateInput(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 00:00 of a date input's day */
export function fromDateInput(value: string): number {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

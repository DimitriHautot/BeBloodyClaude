import { addDays, toISODate } from '../lib/dates';

/** ISO "YYYY-MM-DD" string for the date `days` days before now. */
export function daysAgo(days: number): string {
  return toISODate(addDays(new Date(), -days));
}

/** ISO "YYYY-MM-DD" string for the date `days` days after now. */
export function daysFromNow(days: number): string {
  return toISODate(addDays(new Date(), days));
}

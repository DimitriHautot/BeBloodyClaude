import { addDays, toISODate } from '../lib/dates';

/** ISO "YYYY-MM-DD" string for the date `days` days before now. */
export function dateDaysAgo(days: number): string {
  return toISODate(addDays(new Date(), -days));
}

/** ISO "YYYY-MM-DD" string for the date `days` days after now. */
export function dateDaysFromNow(days: number): string {
  return toISODate(addDays(new Date(), days));
}

import { addDays, toISODate, today } from '../lib/dates';

/** ISO "YYYY-MM-DD" string for the date `days` days before today (see dates.ts's today()). */
export function dateDaysAgo(days: number): string {
  return toISODate(addDays(today(), -days));
}

/** ISO "YYYY-MM-DD" string for the date `days` days after today (see dates.ts's today()). */
export function dateDaysFromNow(days: number): string {
  return toISODate(addDays(today(), days));
}

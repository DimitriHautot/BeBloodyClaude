const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Parses an ISO "YYYY-MM-DD" date string as UTC midnight (not local time),
 * so date math is identical regardless of the machine's timezone.
 */
export function parseISODate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

/** Formats a Date as an ISO "YYYY-MM-DD" string (UTC calendar day). */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Adds (or, for a negative value, subtracts) a number of whole days to a date. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/** Number of whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

/**
 * Today's *local* calendar date (represented at UTC midnight, like every
 * other date in this module, for consistent date math). Unlike every other
 * date here, this one is deliberately timezone-sensitive: it must reflect
 * the donor's own calendar day, not a fixed UTC day. A donor east of UTC
 * (e.g. Belgium, UTC+1/+2) reaches their local midnight — and can become
 * eligible for a new donation — hours before UTC midnight; using the UTC
 * calendar day here made the app think "today" hadn't arrived yet for up
 * to a couple of hours after it locally had, showing a same-day-eligible
 * donation as still a day away.
 */
export function today(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** Formats a date for display, e.g. "21 août 2026". */
export function formatDateLabel(date: Date): string {
  // timeZone: 'UTC' is required — without it, toLocaleDateString renders in
  // the machine's local timezone, which can shift the displayed calendar
  // day by one for a UTC-midnight Date (e.g. showing "20 août" instead of
  // "21 août" on a machine west of UTC).
  return date.toLocaleDateString('fr-BE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

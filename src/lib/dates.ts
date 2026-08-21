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

/** Today's date at UTC midnight. */
export function today(): Date {
  return parseISODate(toISODate(new Date()));
}

/** Formats a date for display, e.g. "21 août 2026". */
export function formatDateLabel(date: Date): string {
  // timeZone: 'UTC' is required — without it, toLocaleDateString renders in
  // the machine's local timezone, which can shift the displayed calendar
  // day by one for a UTC-midnight Date (e.g. showing "20 août" instead of
  // "21 août" on a machine west of UTC).
  return date.toLocaleDateString('fr-BE', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

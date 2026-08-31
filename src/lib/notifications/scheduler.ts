const NOTIFICATION_HOUR_LOCAL = 8;

/** The next local 8:00 AM strictly after `from` (today's if not yet past, tomorrow's otherwise). */
export function nextLocal8am(from: Date): Date {
  const next = new Date(from.getFullYear(), from.getMonth(), from.getDate(), NOTIFICATION_HOUR_LOCAL, 0, 0, 0);
  if (next.getTime() <= from.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

/** Whether local 8:00 AM has already passed today, for `now`. */
export function isPast8amLocal(now: Date): boolean {
  return now.getHours() >= NOTIFICATION_HOUR_LOCAL;
}

/**
 * Runs `runCheck` once daily at local 8:00 AM, for as long as the app stays
 * open — there is no backend to push a wake-up while the app (or its tab)
 * is closed, so this is a best-effort mechanism. To catch a due check that
 * was missed while the app wasn't running (e.g. opened at 10am having been
 * closed since before 8am), the caller should also run `runCheck` once
 * immediately on start if it determines a check is still due for today —
 * this function only handles the "stays open across 8am" case. Returns a
 * cancel function.
 */
export function scheduleDailyChecks(runCheck: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  function schedule() {
    const now = new Date();
    const next = nextLocal8am(now);
    timer = setTimeout(() => {
      runCheck();
      schedule();
    }, next.getTime() - now.getTime());
  }

  schedule();
  return () => clearTimeout(timer);
}

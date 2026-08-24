import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addDays, daysBetween, formatDateLabel, parseISODate, toISODate, today } from '../dates';

const ORIGINAL_TZ = process.env.TZ;

/** Timezones spanning the full range of real-world UTC offsets. */
const TIMEZONES = ['UTC', 'Pacific/Kiritimati', 'Etc/GMT+12', 'America/New_York', 'Asia/Tokyo'];

function withTZ(tz: string, fn: () => void) {
  process.env.TZ = tz;
  try {
    fn();
  } finally {
    process.env.TZ = ORIGINAL_TZ;
  }
}

afterEach(() => {
  process.env.TZ = ORIGINAL_TZ;
});

describe('parseISODate', () => {
  it('parses an ISO date string to UTC midnight of that day', () => {
    const date = parseISODate('2026-08-21');
    expect(date.getUTCFullYear()).toBe(2026);
    expect(date.getUTCMonth()).toBe(7); // 0-indexed
    expect(date.getUTCDate()).toBe(21);
    expect(date.getUTCHours()).toBe(0);
    expect(date.getUTCMinutes()).toBe(0);
    expect(date.getUTCSeconds()).toBe(0);
  });

  it('handles a leap day', () => {
    const date = parseISODate('2024-02-29');
    expect(date.getUTCMonth()).toBe(1);
    expect(date.getUTCDate()).toBe(29);
  });

  it('handles a year boundary', () => {
    const date = parseISODate('2025-12-31');
    expect(date.getUTCFullYear()).toBe(2025);
    expect(date.getUTCMonth()).toBe(11);
    expect(date.getUTCDate()).toBe(31);
  });

  it.each(TIMEZONES)('is unaffected by the machine timezone (%s)', (tz) => {
    withTZ(tz, () => {
      const date = parseISODate('2026-08-21');
      expect(date.toISOString()).toBe('2026-08-21T00:00:00.000Z');
    });
  });
});

describe('toISODate', () => {
  it('formats a UTC-midnight Date as YYYY-MM-DD', () => {
    expect(toISODate(new Date('2026-08-21T00:00:00Z'))).toBe('2026-08-21');
  });

  it('round-trips with parseISODate', () => {
    expect(toISODate(parseISODate('2026-01-05'))).toBe('2026-01-05');
    expect(toISODate(parseISODate('2026-12-31'))).toBe('2026-12-31');
  });

  it('uses the UTC calendar day even for a timestamp just before UTC midnight', () => {
    expect(toISODate(new Date('2025-12-31T23:59:59.999Z'))).toBe('2025-12-31');
    expect(toISODate(new Date('2026-01-01T00:00:00.000Z'))).toBe('2026-01-01');
  });

  it.each(TIMEZONES)('is unaffected by the machine timezone (%s)', (tz) => {
    withTZ(tz, () => {
      expect(toISODate(new Date('2026-08-21T00:00:00Z'))).toBe('2026-08-21');
    });
  });
});

describe('addDays', () => {
  it('adds whole days within a month', () => {
    expect(toISODate(addDays(parseISODate('2026-08-21'), 10))).toBe('2026-08-31');
  });

  it('subtracts days for a negative value', () => {
    expect(toISODate(addDays(parseISODate('2026-08-21'), -21))).toBe('2026-07-31');
  });

  it('crosses a month boundary', () => {
    expect(toISODate(addDays(parseISODate('2026-08-31'), 1))).toBe('2026-09-01');
  });

  it('crosses a year boundary', () => {
    expect(toISODate(addDays(parseISODate('2025-12-31'), 1))).toBe('2026-01-01');
    expect(toISODate(addDays(parseISODate('2026-01-01'), -1))).toBe('2025-12-31');
  });

  it('handles a leap year February correctly', () => {
    expect(toISODate(addDays(parseISODate('2024-02-28'), 1))).toBe('2024-02-29');
    expect(toISODate(addDays(parseISODate('2024-02-29'), 1))).toBe('2024-03-01');
  });

  it('does not add a leap day in a non-leap year', () => {
    expect(toISODate(addDays(parseISODate('2023-02-28'), 1))).toBe('2023-03-01');
  });

  it('adding 0 days returns the same calendar day', () => {
    expect(toISODate(addDays(parseISODate('2026-08-21'), 0))).toBe('2026-08-21');
  });

  it.each(TIMEZONES)(
    'crosses a local DST transition without skipping or duplicating a day (%s)',
    (tz) => {
      withTZ(tz, () => {
        // 2026-03-08 is the US spring-forward DST transition; addDays works
        // in UTC-based 24h increments so it must be unaffected either way.
        expect(toISODate(addDays(parseISODate('2026-03-07'), 1))).toBe('2026-03-08');
        expect(toISODate(addDays(parseISODate('2026-03-08'), 1))).toBe('2026-03-09');
      });
    }
  );
});

describe('today', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns UTC midnight of the current local calendar day', () => {
    vi.setSystemTime(new Date('2026-08-21T14:32:00Z'));
    withTZ('UTC', () => {
      expect(toISODate(today())).toBe('2026-08-21');
      expect(today().getUTCHours()).toBe(0);
    });
  });

  // Regression test: today() used to return the UTC calendar day, which is
  // wrong for a donor east of UTC — they reach local midnight (and can
  // become eligible for a new donation) hours before UTC midnight, so the
  // app kept showing "tomorrow" for something that was already possible
  // today. today() must track the LOCAL calendar day instead, which means
  // it now legitimately differs across timezones for the same instant.
  it.each([
    ['UTC', '2026-08-21T23:45:00Z', '2026-08-21'],
    ['Pacific/Kiritimati', '2026-08-21T09:45:00Z', '2026-08-21'], // 23:45 local (UTC+14)
    ['Pacific/Kiritimati', '2026-08-21T10:15:00Z', '2026-08-22'], // 00:15 local (UTC+14): local day already advanced
    ['Etc/GMT+12', '2026-08-21T11:45:00Z', '2026-08-20'], // 23:45 local (UTC-12): local day still lags
    ['Etc/GMT+12', '2026-08-21T12:15:00Z', '2026-08-21'], // 00:15 local (UTC-12)
    ['Asia/Tokyo', '2026-08-21T14:45:00Z', '2026-08-21'], // 23:45 local (UTC+9)
    ['Asia/Tokyo', '2026-08-21T15:15:00Z', '2026-08-22'], // 00:15 local (UTC+9): local day already advanced
    ['America/New_York', '2026-08-22T03:45:00Z', '2026-08-21'], // 23:45 local (UTC-4, EDT): local day still lags
    ['America/New_York', '2026-08-22T04:15:00Z', '2026-08-22'] // 00:15 local (UTC-4, EDT)
  ])('reflects the local calendar day, not the UTC one, in %s at %s', (tz, instant, expected) => {
    vi.setSystemTime(new Date(instant));
    withTZ(tz, () => {
      expect(toISODate(today())).toBe(expected);
    });
  });
});

describe('daysBetween', () => {
  it('returns 0 for the same date', () => {
    expect(daysBetween(parseISODate('2026-08-21'), parseISODate('2026-08-21'))).toBe(0);
  });

  it('returns a positive count when `to` is after `from`', () => {
    expect(daysBetween(parseISODate('2026-08-21'), parseISODate('2026-09-04'))).toBe(14);
  });

  it('returns a negative count when `to` is before `from`', () => {
    expect(daysBetween(parseISODate('2026-08-21'), parseISODate('2026-08-11'))).toBe(-10);
  });

  it('is consistent with addDays', () => {
    const from = parseISODate('2026-08-21');
    expect(daysBetween(from, addDays(from, 30))).toBe(30);
  });
});

describe('formatDateLabel', () => {
  it('formats a date in French (fr-BE), e.g. "21 août 2026"', () => {
    expect(formatDateLabel(parseISODate('2026-08-21'))).toBe('21 août 2026');
  });

  it('formats a single-digit day without a leading zero', () => {
    expect(formatDateLabel(parseISODate('2026-08-05'))).toBe('5 août 2026');
  });

  it.each(TIMEZONES)(
    'renders the same calendar day regardless of the machine timezone (%s)',
    (tz) => {
      // Regression test: without an explicit UTC timeZone option,
      // toLocaleDateString renders in the machine's local timezone, which
      // can shift a UTC-midnight Date to the previous or next calendar day.
      withTZ(tz, () => {
        expect(formatDateLabel(parseISODate('2026-08-21'))).toBe('21 août 2026');
      });
    }
  );
});

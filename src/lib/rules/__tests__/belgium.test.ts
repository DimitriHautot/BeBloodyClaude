import { describe, expect, it } from 'vitest';
import { belgiumRules } from '../belgium';
import type { Donation, DonationType } from '../../donations/types';
import { dateDaysAgo, dateDaysFromNow } from '../../../test-support/dateFixtures';
import { toISODate } from '../../dates';

function donation(id: string, type: Donation['type'], date: string): Donation {
  return { id, type, date };
}

const settings = { countryCode: 'BE', sex: 'male' as const };

describe('belgiumRules.computeNextEligibleDate', () => {
  it('is eligible today when there is no donation history', () => {
    const next = belgiumRules.computeNextEligibleDate('blood', [], settings);
    expect(toISODate(next)).toBe(dateDaysFromNow(0));
  });

  it('applies the 84-day (12-week) minimum interval for whole blood since the last blood donation', () => {
    const history = [donation('1', 'blood', dateDaysAgo(10))];
    const next = belgiumRules.computeNextEligibleDate('blood', history, settings);
    expect(toISODate(next)).toBe(dateDaysFromNow(74));
  });

  it('applies the 14-day minimum interval for plasma since the last plasma donation', () => {
    const history = [donation('1', 'plasma', dateDaysAgo(5))];
    const next = belgiumRules.computeNextEligibleDate('plasma', history, settings);
    expect(toISODate(next)).toBe(dateDaysFromNow(9));
  });

  it('is not blocked once the minimum interval has already passed', () => {
    const history = [donation('1', 'plasma', dateDaysAgo(100))];
    const next = belgiumRules.computeNextEligibleDate('plasma', history, settings);
    expect(toISODate(next)).toBe(dateDaysFromNow(0));
  });

  it('a whole blood donation only delays plasma by 14 days, not the 84-day blood interval', () => {
    const history = [donation('1', 'blood', dateDaysAgo(10))];
    const next = belgiumRules.computeNextEligibleDate('plasma', history, settings);
    expect(toISODate(next)).toBe(dateDaysFromNow(4));
  });

  it('enforces the rolling 365-day quota (max 4 whole blood donations per year)', () => {
    const history: Donation[] = [
      donation('1', 'blood', dateDaysAgo(300)),
      donation('2', 'blood', dateDaysAgo(220)),
      donation('3', 'blood', dateDaysAgo(140)),
      donation('4', 'blood', dateDaysAgo(65))
    ];
    const next = belgiumRules.computeNextEligibleDate('blood', history, settings);
    // 4th donation used up the yearly quota; next slot opens 365+1 days after the oldest donation still in the window.
    expect(toISODate(next)).toBe(dateDaysFromNow(66));
  });

  it('enforces the rolling 365-day quota for plasma (max 19 donations per year)', () => {
    const history: Donation[] = Array.from({ length: 19 }, (_, i) => donation(`${i}`, 'plasma', dateDaysAgo(350 - i)));
    const next = belgiumRules.computeNextEligibleDate('plasma', history, settings);
    // Oldest donation in the window (350 days ago) must age out: 366 - 350 = 16 days from now.
    expect(toISODate(next)).toBe(dateDaysFromNow(16));
  });

  it('the platelets quota (24/year) counts whole blood donations toward the same budget', () => {
    // 4 blood + 20 platelets = 24, filling the shared quota exactly.
    const history: Donation[] = [
      ...Array.from({ length: 4 }, (_, i) => donation(`b${i}`, 'blood', dateDaysAgo(300 + i))),
      ...Array.from({ length: 20 }, (_, i) => donation(`p${i}`, 'platelets', dateDaysAgo(200 - i)))
    ];
    const next = belgiumRules.computeNextEligibleDate('platelets', history, settings);
    // Oldest donation counted toward the shared quota is the oldest blood one (303 days ago).
    expect(toISODate(next)).toBe(dateDaysFromNow(63));
  });

  it('the whole blood quota (4/year) is independent of platelet donations', () => {
    const history: Donation[] = [
      ...Array.from({ length: 4 }, (_, i) => donation(`b${i}`, 'blood', dateDaysAgo(300 + i))),
      ...Array.from({ length: 20 }, (_, i) => donation(`p${i}`, 'platelets', dateDaysAgo(200 - i)))
    ];
    // Blood's own quota (4/year) is already exhausted by the 4 blood donations alone,
    // regardless of the platelet donations also present in the history.
    const next = belgiumRules.computeNextEligibleDate('blood', history, settings);
    expect(toISODate(next)).toBe(dateDaysFromNow(63));
  });
});

describe('belgiumRules.earliestPossibleDate', () => {
  it('is not floored to today — with no history, it can be arbitrarily far in the past', () => {
    const earliest = belgiumRules.earliestPossibleDate('blood', [], settings);
    // No constraint at all: the epoch is used internally as "no floor".
    expect(earliest.getTime()).toBeLessThan(new Date('2000-01-01').getTime());
  });

  it('returns a date in the past once the minimum interval has already elapsed, unlike computeNextEligibleDate', () => {
    const history = [donation('1', 'blood', dateDaysAgo(100))];
    const earliest = belgiumRules.earliestPossibleDate('blood', history, settings);
    // 100 days ago + 84-day interval = 16 days ago, still in the past.
    expect(toISODate(earliest)).toBe(dateDaysAgo(16));

    // computeNextEligibleDate floors the very same computation to today.
    const next = belgiumRules.computeNextEligibleDate('blood', history, settings);
    expect(toISODate(next)).toBe(dateDaysFromNow(0));
  });

  it('matches computeNextEligibleDate when the earliest date is still in the future', () => {
    const history = [donation('1', 'blood', dateDaysAgo(10))];
    const earliest = belgiumRules.earliestPossibleDate('blood', history, settings);
    const next = belgiumRules.computeNextEligibleDate('blood', history, settings);
    expect(toISODate(earliest)).toBe(toISODate(next));
    expect(toISODate(earliest)).toBe(dateDaysFromNow(74));
  });
});

describe('belgiumRules.isDonationAllowed — cross-type delay matrix', () => {
  // [fromType, toType, delayDays] — see donneurdesang.be/fr/qui-peut-donner/delai-entre-deux-dons
  const matrix: [DonationType, DonationType, number][] = [
    ['blood', 'blood', 84],
    ['blood', 'plasma', 14],
    ['blood', 'platelets', 28],
    ['plasma', 'blood', 14],
    ['plasma', 'plasma', 14],
    ['plasma', 'platelets', 14],
    ['platelets', 'blood', 28],
    ['platelets', 'plasma', 14],
    ['platelets', 'platelets', 28]
  ];

  it.each(matrix)('%s → %s requires %d days', (from, to, delayDays) => {
    const history = [donation('1', from, dateDaysAgo(delayDays - 1))];
    expect(
      belgiumRules.isDonationAllowed(to, dateDaysAgo(0), history, settings),
      `expected ${to} to be rejected ${delayDays - 1} days after a ${from} donation`
    ).toBe(false);

    const historyAtBoundary = [donation('1', from, dateDaysAgo(delayDays))];
    expect(
      belgiumRules.isDonationAllowed(to, dateDaysAgo(0), historyAtBoundary, settings),
      `expected ${to} to be allowed exactly ${delayDays} days after a ${from} donation`
    ).toBe(true);
  });
});

describe('belgiumRules.isDonationAllowed', () => {
  it('allows any date when there is no donation history', () => {
    expect(belgiumRules.isDonationAllowed('blood', dateDaysAgo(1000), [], settings)).toBe(true);
    expect(belgiumRules.isDonationAllowed('blood', dateDaysFromNow(0), [], settings)).toBe(true);
  });

  it('rejects a 5th whole blood donation within a rolling 365-day window', () => {
    const history: Donation[] = [
      donation('1', 'blood', dateDaysAgo(300)),
      donation('2', 'blood', dateDaysAgo(220)),
      donation('3', 'blood', dateDaysAgo(140)),
      donation('4', 'blood', dateDaysAgo(65))
    ];
    expect(belgiumRules.isDonationAllowed('blood', dateDaysAgo(0), history, settings)).toBe(false);
  });

  it('rejects two whole blood donations recorded on the same day', () => {
    const history = [donation('1', 'blood', dateDaysAgo(0))];
    expect(belgiumRules.isDonationAllowed('blood', dateDaysAgo(0), history, settings)).toBe(false);
  });

  it('ignores donations recorded after the candidate date (back-dated entries)', () => {
    // A donation recorded 5 days ago should be validated against history as
    // it stood at that time, ignoring a later donation entered afterwards.
    const history = [donation('1', 'blood', dateDaysAgo(3))];
    expect(belgiumRules.isDonationAllowed('blood', dateDaysAgo(5), history, settings)).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { franceRules } from '../france';
import type { Donation, DonationType } from '../../donations/types';
import type { DonorSettings } from '../../settings/storage';
import { dateDaysAgo, dateDaysFromNow } from '../../../test-support/dateFixtures';
import { toISODate } from '../../dates';

function donation(id: string, type: Donation['type'], date: string): Donation {
  return { id, type, date, countryCode: 'FR' };
}

const maleSettings: DonorSettings = { countryCode: 'FR', sex: 'male' };
const femaleSettings: DonorSettings = { countryCode: 'FR', sex: 'female' };

describe('franceRules.computeNextEligibleDate', () => {
  it('is eligible today when there is no donation history', () => {
    const next = franceRules.computeNextEligibleDate('blood', [], maleSettings);
    expect(toISODate(next)).toBe(dateDaysFromNow(0));
  });

  it('applies the 56-day (8-week) minimum interval for whole blood since the last blood donation', () => {
    const history = [donation('1', 'blood', dateDaysAgo(10))];
    const next = franceRules.computeNextEligibleDate('blood', history, maleSettings);
    expect(toISODate(next)).toBe(dateDaysFromNow(46));
  });

  it('applies the 14-day minimum interval for plasma since the last plasma donation', () => {
    const history = [donation('1', 'plasma', dateDaysAgo(5))];
    const next = franceRules.computeNextEligibleDate('plasma', history, maleSettings);
    expect(toISODate(next)).toBe(dateDaysFromNow(9));
  });

  it('is not blocked once the minimum interval has already passed', () => {
    const history = [donation('1', 'plasma', dateDaysAgo(100))];
    const next = franceRules.computeNextEligibleDate('plasma', history, maleSettings);
    expect(toISODate(next)).toBe(dateDaysFromNow(0));
  });

  it('a whole blood donation only delays plasma by 14 days, not the 56-day blood interval', () => {
    const history = [donation('1', 'blood', dateDaysAgo(10))];
    const next = franceRules.computeNextEligibleDate('plasma', history, maleSettings);
    expect(toISODate(next)).toBe(dateDaysFromNow(4));
  });

  it('enforces the rolling 365-day quota for men (max 6 whole blood donations per year)', () => {
    const history: Donation[] = [
      donation('1', 'blood', dateDaysAgo(300)),
      donation('2', 'blood', dateDaysAgo(260)),
      donation('3', 'blood', dateDaysAgo(220)),
      donation('4', 'blood', dateDaysAgo(180)),
      donation('5', 'blood', dateDaysAgo(140)),
      donation('6', 'blood', dateDaysAgo(65))
    ];
    const next = franceRules.computeNextEligibleDate('blood', history, maleSettings);
    // 6th donation used up the yearly quota; next slot opens 365 days after the oldest donation still in the window.
    expect(toISODate(next)).toBe(dateDaysFromNow(65));
  });

  it('enforces the lower rolling 365-day quota for women (max 4 whole blood donations per year)', () => {
    const history: Donation[] = [
      donation('1', 'blood', dateDaysAgo(300)),
      donation('2', 'blood', dateDaysAgo(220)),
      donation('3', 'blood', dateDaysAgo(140)),
      donation('4', 'blood', dateDaysAgo(65))
    ];
    const next = franceRules.computeNextEligibleDate('blood', history, femaleSettings);
    expect(toISODate(next)).toBe(dateDaysFromNow(65));
  });

  it('enforces the rolling 365-day quota for plasma (max 24 donations per year)', () => {
    const history: Donation[] = Array.from({ length: 24 }, (_, i) => donation(`${i}`, 'plasma', dateDaysAgo(350 - i)));
    const next = franceRules.computeNextEligibleDate('plasma', history, maleSettings);
    // Oldest donation in the window (350 days ago) must age out: 365 - 350 = 15 days from now.
    expect(toISODate(next)).toBe(dateDaysFromNow(15));
  });

  it('enforces the rolling 365-day quota for platelets (max 12 donations per year)', () => {
    const history: Donation[] = Array.from({ length: 12 }, (_, i) => donation(`${i}`, 'platelets', dateDaysAgo(300 - i)));
    const next = franceRules.computeNextEligibleDate('platelets', history, maleSettings);
    expect(toISODate(next)).toBe(dateDaysFromNow(65));
  });

  it('the combined 24-donations/year cap can block a type even with zero donations of that type', () => {
    // 20 plasma donations: well under plasma's own 24/year quota, and under
    // the combined 24/year cap too — a platelets request is unaffected.
    const underCap: Donation[] = Array.from({ length: 20 }, (_, i) => donation(`p${i}`, 'plasma', dateDaysAgo(300 - i)));
    const nextUnderCap = franceRules.computeNextEligibleDate('platelets', underCap, maleSettings);
    expect(toISODate(nextUnderCap)).toBe(dateDaysFromNow(0));

    // 25 plasma donations exceed the combined 24/year cap by themselves,
    // even though no platelet donation has ever been recorded and
    // platelets' own 12/year quota is nowhere near reached.
    const overCap: Donation[] = Array.from({ length: 25 }, (_, i) => donation(`p${i}`, 'plasma', dateDaysAgo(350 - i)));
    const nextOverCap = franceRules.computeNextEligibleDate('platelets', overCap, maleSettings);
    expect(toISODate(nextOverCap)).not.toBe(dateDaysFromNow(0));
  });
});

describe('franceRules.earliestPossibleDate', () => {
  it('is not floored to today — with no history, it can be arbitrarily far in the past', () => {
    const earliest = franceRules.earliestPossibleDate('blood', [], maleSettings);
    expect(earliest.getTime()).toBeLessThan(new Date('2000-01-01').getTime());
  });

  it('returns a date in the past once the minimum interval has already elapsed, unlike computeNextEligibleDate', () => {
    const history = [donation('1', 'blood', dateDaysAgo(100))];
    const earliest = franceRules.earliestPossibleDate('blood', history, maleSettings);
    // 100 days ago + 56-day interval = 44 days ago, still in the past.
    expect(toISODate(earliest)).toBe(dateDaysAgo(44));

    const next = franceRules.computeNextEligibleDate('blood', history, maleSettings);
    expect(toISODate(next)).toBe(dateDaysFromNow(0));
  });

  it('matches computeNextEligibleDate when the earliest date is still in the future', () => {
    const history = [donation('1', 'blood', dateDaysAgo(10))];
    const earliest = franceRules.earliestPossibleDate('blood', history, maleSettings);
    const next = franceRules.computeNextEligibleDate('blood', history, maleSettings);
    expect(toISODate(earliest)).toBe(toISODate(next));
    expect(toISODate(earliest)).toBe(dateDaysFromNow(46));
  });
});

describe('franceRules.isDonationAllowed — cross-type delay matrix', () => {
  // [fromType, toType, delayDays] — see annexe 1 of
  // https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039704282/
  const matrix: [DonationType, DonationType, number][] = [
    ['blood', 'blood', 56],
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
      franceRules.isDonationAllowed(to, dateDaysAgo(0), history, maleSettings),
      `expected ${to} to be rejected ${delayDays - 1} days after a ${from} donation`
    ).toBe(false);

    const historyAtBoundary = [donation('1', from, dateDaysAgo(delayDays))];
    expect(
      franceRules.isDonationAllowed(to, dateDaysAgo(0), historyAtBoundary, maleSettings),
      `expected ${to} to be allowed exactly ${delayDays} days after a ${from} donation`
    ).toBe(true);
  });
});

describe('franceRules.isDonationAllowed', () => {
  it('allows any date when there is no donation history', () => {
    expect(franceRules.isDonationAllowed('blood', dateDaysAgo(1000), [], maleSettings)).toBe(true);
    expect(franceRules.isDonationAllowed('blood', dateDaysFromNow(0), [], maleSettings)).toBe(true);
  });

  it('rejects a 7th whole blood donation within a rolling 365-day window (men)', () => {
    const history: Donation[] = [
      donation('1', 'blood', dateDaysAgo(300)),
      donation('2', 'blood', dateDaysAgo(260)),
      donation('3', 'blood', dateDaysAgo(220)),
      donation('4', 'blood', dateDaysAgo(180)),
      donation('5', 'blood', dateDaysAgo(140)),
      donation('6', 'blood', dateDaysAgo(65))
    ];
    expect(franceRules.isDonationAllowed('blood', dateDaysAgo(0), history, maleSettings)).toBe(false);
  });

  it('rejects a 5th whole blood donation within a rolling 365-day window (women)', () => {
    const history: Donation[] = [
      donation('1', 'blood', dateDaysAgo(300)),
      donation('2', 'blood', dateDaysAgo(220)),
      donation('3', 'blood', dateDaysAgo(140)),
      donation('4', 'blood', dateDaysAgo(65))
    ];
    expect(franceRules.isDonationAllowed('blood', dateDaysAgo(0), history, femaleSettings)).toBe(false);
  });

  it('rejects two whole blood donations recorded on the same day', () => {
    const history = [donation('1', 'blood', dateDaysAgo(0))];
    expect(franceRules.isDonationAllowed('blood', dateDaysAgo(0), history, maleSettings)).toBe(false);
  });

  it('ignores donations recorded after the candidate date (back-dated entries)', () => {
    const history = [donation('1', 'blood', dateDaysAgo(3))];
    expect(franceRules.isDonationAllowed('blood', dateDaysAgo(5), history, maleSettings)).toBe(true);
  });
});

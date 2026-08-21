import { describe, expect, it } from 'vitest';
import { belgiumRules } from '../belgium';
import type { Donation } from '../../donations/types';
import { dateDaysAgo, dateDaysFromNow } from '../../../test-support/dateFixtures';
import { toISODate } from '../../dates';

function donation(id: string, type: Donation['type'], date: string): Donation {
  return { id, type, date };
}

describe('belgiumRules.computeNextEligibleDate', () => {
  it('is eligible today when there is no donation history', () => {
    const next = belgiumRules.computeNextEligibleDate('blood', [], { countryCode: 'BE', sex: 'male' });
    expect(toISODate(next)).toBe(dateDaysFromNow(0));
  });

  it('applies the 60-day minimum interval for whole blood since the last blood donation', () => {
    const history = [donation('1', 'blood', dateDaysAgo(10))];
    const next = belgiumRules.computeNextEligibleDate('blood', history, { countryCode: 'BE', sex: 'male' });
    expect(toISODate(next)).toBe(dateDaysFromNow(50));
  });

  it('applies the 14-day minimum interval for plasma since the last plasma donation', () => {
    const history = [donation('1', 'plasma', dateDaysAgo(5))];
    const next = belgiumRules.computeNextEligibleDate('plasma', history, { countryCode: 'BE', sex: 'male' });
    expect(toISODate(next)).toBe(dateDaysFromNow(9));
  });

  it('is not blocked once the minimum interval has already passed', () => {
    const history = [donation('1', 'plasma', dateDaysAgo(100))];
    const next = belgiumRules.computeNextEligibleDate('plasma', history, { countryCode: 'BE', sex: 'male' });
    expect(toISODate(next)).toBe(dateDaysFromNow(0));
  });

  it('a whole blood donation delays eligibility for plasma too (cross-type constraint)', () => {
    const history = [donation('1', 'blood', dateDaysAgo(10))];
    const next = belgiumRules.computeNextEligibleDate('plasma', history, { countryCode: 'BE', sex: 'male' });
    // Blocked by the 60-day whole blood recovery window, not just the 14-day plasma interval.
    expect(toISODate(next)).toBe(dateDaysFromNow(50));
  });

  it('enforces the rolling 365-day quota (max 4 whole blood donations per year)', () => {
    const history: Donation[] = [
      donation('1', 'blood', dateDaysAgo(300)),
      donation('2', 'blood', dateDaysAgo(220)),
      donation('3', 'blood', dateDaysAgo(140)),
      donation('4', 'blood', dateDaysAgo(65))
    ];
    const next = belgiumRules.computeNextEligibleDate('blood', history, { countryCode: 'BE', sex: 'male' });
    // 4th donation used up the yearly quota; next slot opens 365+1 days after the oldest donation still in the window.
    expect(toISODate(next)).toBe(dateDaysFromNow(66));
  });
});

describe('belgiumRules.isDonationAllowed', () => {
  const settings = { countryCode: 'BE', sex: 'male' as const };

  it('allows any date when there is no donation history', () => {
    expect(belgiumRules.isDonationAllowed('blood', dateDaysAgo(1000), [], settings)).toBe(true);
    expect(belgiumRules.isDonationAllowed('blood', dateDaysFromNow(0), [], settings)).toBe(true);
  });

  it('rejects a whole blood donation less than 60 days after the previous one', () => {
    const history = [donation('1', 'blood', dateDaysAgo(30))];
    expect(belgiumRules.isDonationAllowed('blood', dateDaysAgo(0), history, settings)).toBe(false);
  });

  it('allows a whole blood donation exactly 60 days after the previous one', () => {
    const history = [donation('1', 'blood', dateDaysAgo(60))];
    expect(belgiumRules.isDonationAllowed('blood', dateDaysAgo(0), history, settings)).toBe(true);
  });

  it('rejects a plasma donation less than 14 days after the previous plasma donation', () => {
    const history = [donation('1', 'plasma', dateDaysAgo(10))];
    expect(belgiumRules.isDonationAllowed('plasma', dateDaysAgo(0), history, settings)).toBe(false);
  });

  it('rejects a plasma donation less than 60 days after a whole blood donation (cross-type)', () => {
    const history = [donation('1', 'blood', dateDaysAgo(20))];
    expect(belgiumRules.isDonationAllowed('plasma', dateDaysAgo(0), history, settings)).toBe(false);
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

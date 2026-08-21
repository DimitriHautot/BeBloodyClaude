import { describe, expect, it } from 'vitest';
import { belgiumRules } from '../belgium';
import type { Donation } from '../../donations/types';

const DAY_MS = 24 * 60 * 60 * 1000;

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  return toISO(new Date(Date.now() - days * DAY_MS));
}

function daysFromNow(days: number): string {
  return toISO(new Date(Date.now() + days * DAY_MS));
}

function donation(id: string, type: Donation['type'], date: string): Donation {
  return { id, type, date };
}

describe('belgiumRules.computeNextEligibleDate', () => {
  it('is eligible today when there is no donation history', () => {
    const next = belgiumRules.computeNextEligibleDate('blood', [], { countryCode: 'BE', sex: 'male' });
    expect(toISO(next)).toBe(daysFromNow(0));
  });

  it('applies the 60-day minimum interval for whole blood since the last blood donation', () => {
    const history = [donation('1', 'blood', daysAgo(10))];
    const next = belgiumRules.computeNextEligibleDate('blood', history, { countryCode: 'BE', sex: 'male' });
    expect(toISO(next)).toBe(daysFromNow(50));
  });

  it('applies the 14-day minimum interval for plasma since the last plasma donation', () => {
    const history = [donation('1', 'plasma', daysAgo(5))];
    const next = belgiumRules.computeNextEligibleDate('plasma', history, { countryCode: 'BE', sex: 'male' });
    expect(toISO(next)).toBe(daysFromNow(9));
  });

  it('is not blocked once the minimum interval has already passed', () => {
    const history = [donation('1', 'plasma', daysAgo(100))];
    const next = belgiumRules.computeNextEligibleDate('plasma', history, { countryCode: 'BE', sex: 'male' });
    expect(toISO(next)).toBe(daysFromNow(0));
  });

  it('a whole blood donation delays eligibility for plasma too (cross-type constraint)', () => {
    const history = [donation('1', 'blood', daysAgo(10))];
    const next = belgiumRules.computeNextEligibleDate('plasma', history, { countryCode: 'BE', sex: 'male' });
    // Blocked by the 60-day whole blood recovery window, not just the 14-day plasma interval.
    expect(toISO(next)).toBe(daysFromNow(50));
  });

  it('enforces the rolling 365-day quota (max 4 whole blood donations per year)', () => {
    const history: Donation[] = [
      donation('1', 'blood', daysAgo(300)),
      donation('2', 'blood', daysAgo(220)),
      donation('3', 'blood', daysAgo(140)),
      donation('4', 'blood', daysAgo(65))
    ];
    const next = belgiumRules.computeNextEligibleDate('blood', history, { countryCode: 'BE', sex: 'male' });
    // 4th donation used up the yearly quota; next slot opens 365+1 days after the oldest donation still in the window.
    expect(toISO(next)).toBe(daysFromNow(66));
  });
});

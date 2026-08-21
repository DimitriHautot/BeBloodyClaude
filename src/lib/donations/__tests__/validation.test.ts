import { describe, expect, it } from 'vitest';
import { validateNewDonation } from '../validation';
import type { Donation } from '../types';
import type { DonorSettings } from '../../settings/storage';

const DAY_MS = 24 * 60 * 60 * 1000;

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysAgo(days: number): string {
  return toISO(new Date(Date.now() - days * DAY_MS));
}

function donation(id: string, type: Donation['type'], date: string): Donation {
  return { id, type, date };
}

const belgianSettings: DonorSettings = { countryCode: 'BE', sex: 'male' };

describe('validateNewDonation', () => {
  it('allows a donation that respects the rules of the selected country', () => {
    const result = validateNewDonation('plasma', daysAgo(0), [], belgianSettings);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('rejects a donation that violates the minimum interval, with an explanatory reason', () => {
    const history = [donation('1', 'blood', daysAgo(10))];
    const result = validateNewDonation('blood', daysAgo(0), history, belgianSettings);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Belgique/);
  });

  it('rejects a donation that violates a cross-type constraint', () => {
    const history = [donation('1', 'blood', daysAgo(10))];
    const result = validateNewDonation('plasma', daysAgo(0), history, belgianSettings);
    expect(result.allowed).toBe(false);
  });

  it('rejects a donation that would exceed the rolling annual quota', () => {
    const history: Donation[] = [
      donation('1', 'blood', daysAgo(300)),
      donation('2', 'blood', daysAgo(220)),
      donation('3', 'blood', daysAgo(140)),
      donation('4', 'blood', daysAgo(65))
    ];
    const result = validateNewDonation('blood', daysAgo(0), history, belgianSettings);
    expect(result.allowed).toBe(false);
  });

  it('rejects a second donation of the same type recorded on the same day', () => {
    const history = [donation('1', 'blood', daysAgo(0))];
    const result = validateNewDonation('blood', daysAgo(0), history, belgianSettings);
    expect(result.allowed).toBe(false);
  });

  it('throws for a country code with no registered rule set', () => {
    expect(() => validateNewDonation('blood', daysAgo(0), [], { countryCode: 'XX', sex: 'male' })).toThrow();
  });
});

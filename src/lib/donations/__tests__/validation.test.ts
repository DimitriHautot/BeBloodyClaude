import { describe, expect, it } from 'vitest';
import { validateNewDonation } from '../validation';
import { DONATION_TYPES, type Donation } from '../types';
import type { DonorSettings } from '../../settings/storage';
import { dateDaysAgo } from '../../../test-support/dateFixtures';

function donation(id: string, type: Donation['type'], date: string): Donation {
  return { id, type, date };
}

const belgianSettings: DonorSettings = { countryCode: 'BE', sex: 'male' };

describe('validateNewDonation', () => {
  it('allows a donation that respects the rules of the selected country', () => {
    const result = validateNewDonation('plasma', dateDaysAgo(0), [], belgianSettings);
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('rejects a donation that violates the minimum interval, with an explanatory reason', () => {
    const history = [donation('1', 'blood', dateDaysAgo(10))];
    const result = validateNewDonation('blood', dateDaysAgo(0), history, belgianSettings);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/Belgique/);
  });

  it('rejects a donation that violates a cross-type constraint', () => {
    const history = [donation('1', 'blood', dateDaysAgo(10))];
    const result = validateNewDonation('plasma', dateDaysAgo(0), history, belgianSettings);
    expect(result.allowed).toBe(false);
  });

  it('rejects a donation that would exceed the rolling annual quota', () => {
    const history: Donation[] = [
      donation('1', 'blood', dateDaysAgo(300)),
      donation('2', 'blood', dateDaysAgo(220)),
      donation('3', 'blood', dateDaysAgo(140)),
      donation('4', 'blood', dateDaysAgo(65))
    ];
    const result = validateNewDonation('blood', dateDaysAgo(0), history, belgianSettings);
    expect(result.allowed).toBe(false);
  });

  const sameDayCombinations = DONATION_TYPES.flatMap((existingType) =>
    DONATION_TYPES.map((newType) => [newType, existingType] as const)
  );

  it.each(sameDayCombinations)(
    'rejects a new %s donation on the same day as an existing %s donation',
    (newType, existingType) => {
      const history = [donation('1', existingType, dateDaysAgo(0))];
      const result = validateNewDonation(newType, dateDaysAgo(0), history, belgianSettings);
      expect(result.allowed).toBe(false);
    }
  );

  it('throws for a country code with no registered rule set', () => {
    expect(() => validateNewDonation('blood', dateDaysAgo(0), [], { countryCode: 'XX', sex: 'male' })).toThrow();
  });
});

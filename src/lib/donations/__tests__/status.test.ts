import { describe, expect, it } from 'vitest';
import { computeDonationStatus } from '../status';
import type { Donation } from '../types';
import type { DonorSettings } from '../../settings/storage';
import { dateDaysAgo } from '../../../test-support/dateFixtures';
import { today } from '../../dates';

function donation(id: string, type: Donation['type'], date: string): Donation {
  return { id, type, date, countryCode: 'BE' };
}

const baseSettings: DonorSettings = { countryCode: 'BE', sex: 'male' };

describe('computeDonationStatus', () => {
  it('is eligible today when there is no donation history', () => {
    expect(computeDonationStatus('blood', [], baseSettings, today())).toBe('eligible');
  });

  it('is upcoming when within the configured highlight window', () => {
    // blood->blood is 84 days; 74 days ago puts the next eligible date 10
    // days out, inside a 14-day window.
    const history = [donation('1', 'blood', dateDaysAgo(74))];
    const settings: DonorSettings = { ...baseSettings, highlightUpcoming: true, highlightUpcomingDays: 14 };
    expect(computeDonationStatus('blood', history, settings, today())).toBe('upcoming');
  });

  it('is later when beyond the configured highlight window', () => {
    const history = [donation('1', 'blood', dateDaysAgo(74))];
    const settings: DonorSettings = { ...baseSettings, highlightUpcoming: true, highlightUpcomingDays: 5 };
    expect(computeDonationStatus('blood', history, settings, today())).toBe('later');
  });

  it('is later (never upcoming) when highlighting is disabled, regardless of proximity', () => {
    const history = [donation('1', 'blood', dateDaysAgo(83))];
    const settings: DonorSettings = { ...baseSettings, highlightUpcoming: false };
    expect(computeDonationStatus('blood', history, settings, today())).toBe('later');
  });
});

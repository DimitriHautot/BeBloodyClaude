import { describe, expect, it } from 'vitest';
import { evaluateDailyNotification, isEvaluationDueToday } from '../evaluate';
import type { Donation } from '../../donations/types';
import type { DonorSettings } from '../../settings/storage';
import { dateDaysAgo } from '../../../test-support/dateFixtures';
import { today, toISODate } from '../../dates';

function donation(id: string, type: Donation['type'], date: string): Donation {
  return { id, type, date, countryCode: 'BE' };
}

const settingsWithHighlight: DonorSettings = {
  countryCode: 'BE',
  sex: 'male',
  highlightUpcoming: true,
  highlightUpcomingDays: 14
};

describe('evaluateDailyNotification', () => {
  it('records statuses but emits no notification on the very first evaluation', () => {
    const result = evaluateDailyNotification([], settingsWithHighlight, {}, today());
    expect(result.notification).toBeNull();
    expect(result.statusByType.blood).toBe('eligible');
  });

  it('emits no notification when no status changed since the previous evaluation', () => {
    const previous = { blood: 'eligible' as const, plasma: 'eligible' as const, platelets: 'eligible' as const };
    const result = evaluateDailyNotification([], settingsWithHighlight, previous, today());
    expect(result.notification).toBeNull();
  });

  it('reports a type that just became eligible', () => {
    const previous = { blood: 'upcoming' as const };
    const result = evaluateDailyNotification([], settingsWithHighlight, previous, today());
    expect(result.notification).toEqual({
      title: 'Don de sang',
      body: 'Possible dès maintenant : Sang total'
    });
  });

  it('reports a type that just became upcoming', () => {
    // blood->blood is 84 days; 74 days ago -> 10 days out, inside the 14-day window.
    const history = [donation('1', 'blood', dateDaysAgo(74))];
    const previous = { blood: 'later' as const };
    const result = evaluateDailyNotification(history, settingsWithHighlight, previous, today());
    expect(result.notification).toEqual({
      title: 'Don de sang',
      body: 'Bientôt possible, pensez à prendre rendez-vous : Sang total'
    });
  });

  it('groups multiple types that changed status the same day into one notification', () => {
    const history = [donation('1', 'blood', dateDaysAgo(74))];
    const previous = { blood: 'later' as const, plasma: 'later' as const };
    const result = evaluateDailyNotification(history, settingsWithHighlight, previous, today());
    expect(result.notification).toEqual({
      title: 'Don de sang',
      body: [
        'Possible dès maintenant : Plasma',
        'Bientôt possible, pensez à prendre rendez-vous : Sang total'
      ].join('\n')
    });
  });

  it('never reports "upcoming" when highlightUpcoming is disabled', () => {
    const history = [donation('1', 'blood', dateDaysAgo(74))];
    const settings: DonorSettings = { ...settingsWithHighlight, highlightUpcoming: false };
    const previous = { blood: 'later' as const };
    const result = evaluateDailyNotification(history, settings, previous, today());
    expect(result.notification).toBeNull();
    expect(result.statusByType.blood).toBe('later');
  });

  it('does not report a type moving to "later"', () => {
    // A donation from yesterday puts the next eligible blood date 83 days
    // out — well outside a narrow 5-day highlight window, so it reads as
    // "later" today (unlike a previous evaluation where, e.g., a wider
    // window or a different history had it recorded as "upcoming").
    const history = [donation('1', 'blood', dateDaysAgo(1))];
    const settings: DonorSettings = { ...settingsWithHighlight, highlightUpcomingDays: 5 };
    const previous = { blood: 'upcoming' as const };
    const result = evaluateDailyNotification(history, settings, previous, today());
    expect(result.statusByType.blood).toBe('later');
    expect(result.notification).toBeNull();
  });

  it('only evaluates donation types currently allowed for the donor', () => {
    const settings: DonorSettings = {
      ...settingsWithHighlight,
      allowedDonationTypes: { blood: true, plasma: false, platelets: false }
    };
    const result = evaluateDailyNotification([], settings, {}, today());
    expect(Object.keys(result.statusByType)).toEqual(['blood']);
  });
});

describe('isEvaluationDueToday', () => {
  it('is due when no evaluation has ever run', () => {
    expect(isEvaluationDueToday({ lastEvaluatedDate: null, statusByType: {} }, toISODate(today()))).toBe(true);
  });

  it('is due when the last evaluation was on a previous day', () => {
    expect(isEvaluationDueToday({ lastEvaluatedDate: '2020-01-01', statusByType: {} }, toISODate(today()))).toBe(
      true
    );
  });

  it('is not due when already evaluated today', () => {
    const todayISO = toISODate(today());
    expect(isEvaluationDueToday({ lastEvaluatedDate: todayISO, statusByType: {} }, todayISO)).toBe(false);
  });
});

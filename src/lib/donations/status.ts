import type { Donation, DonationType } from './types';
import type { DonorSettings } from '../settings/storage';
import { getRuleSet } from '../rules/registry';
import { daysBetween } from '../dates';

export type DonationStatus = 'eligible' | 'upcoming' | 'later';

/**
 * 'eligible' (possible today), 'upcoming' (possible within the donor's
 * configured highlight window), or 'later' (beyond that window, or
 * highlighting is off). Shared between NextDonationSummary (display) and
 * the notification evaluator, so both agree on what "soon" means.
 */
export function computeDonationStatus(
  type: DonationType,
  allDonations: Donation[],
  donorSettings: DonorSettings,
  today: Date
): DonationStatus {
  const ruleSet = getRuleSet(donorSettings.countryCode);
  const date = ruleSet.computeNextEligibleDate(type, allDonations, donorSettings);

  if (date.getTime() <= today.getTime()) return 'eligible';

  if (donorSettings.highlightUpcoming) {
    const windowDays = donorSettings.highlightUpcomingDays ?? 14;
    const daysUntil = daysBetween(today, date);
    if (daysUntil >= 1 && daysUntil <= windowDays) return 'upcoming';
  }

  return 'later';
}

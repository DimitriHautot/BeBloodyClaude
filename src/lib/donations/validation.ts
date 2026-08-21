import type { Donation, DonationType } from './types';
import { DONATION_TYPE_LABELS } from './types';
import type { DonorSettings } from '../settings/storage';
import { getRuleSet } from '../rules/registry';

export interface DonationValidation {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates a candidate donation (type + date) against the donation rule
 * set for the donor's currently selected country (see
 * `src/lib/rules/registry.ts`), given their existing donation history.
 */
export function validateNewDonation(
  type: DonationType,
  date: string,
  existingDonations: Donation[],
  donorSettings: DonorSettings
): DonationValidation {
  const ruleSet = getRuleSet(donorSettings.countryCode);
  const allowed = ruleSet.isDonationAllowed(type, date, existingDonations, donorSettings);

  if (allowed) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Cette date ne respecte pas les règles de don pour ${DONATION_TYPE_LABELS[type]} (${ruleSet.countryName}).`
  };
}

import type { Donation, DonationType } from './types';
import type { DonorSettings } from '../settings/storage';
import { getRuleSet } from '../rules/registry';
import { parseISODate, today } from '../dates';
import { resolveLocale, translate } from '../i18n';

export interface DonationValidation {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates a candidate donation (type + date) against the donation rule
 * set for the donor's currently selected country (see
 * `src/lib/rules/registry.ts`), given their existing donation history.
 * A donation date in the future is always rejected, regardless of country
 * — a donation can only be recorded for today or a past date.
 */
export function validateNewDonation(
  type: DonationType,
  date: string,
  existingDonations: Donation[],
  donorSettings: DonorSettings
): DonationValidation {
  const locale = resolveLocale(donorSettings.language);

  if (parseISODate(date).getTime() > today().getTime()) {
    return { allowed: false, reason: translate('form.dateInFutureError', locale) };
  }

  const ruleSet = getRuleSet(donorSettings.countryCode);
  const allowed = ruleSet.isDonationAllowed(type, date, existingDonations, donorSettings);

  if (allowed) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: translate('form.ruleViolationError', locale, {
      type: translate(`donationTypes.${type}`, locale),
      country: ruleSet.countryName
    })
  };
}

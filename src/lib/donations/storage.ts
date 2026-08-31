import { persisted } from '../storage';
import type { Donation, DonationType } from './types';
import type { DonorSettings } from '../settings/storage';
import { validateNewDonation, type DonationValidation } from './validation';

export const donations = persisted<Donation[]>('donations', []);

/**
 * Validates the candidate donation against the rules of the donor's
 * currently selected country before adding it. If rejected, the store is
 * left unchanged and the returned result explains why.
 */
export function addDonation(
  input: { type: DonationType; date: string },
  donorSettings: DonorSettings
): DonationValidation {
  let result: DonationValidation = { allowed: true };

  donations.update((list) => {
    result = validateNewDonation(input.type, input.date, list, donorSettings);
    if (!result.allowed) return list;

    const donation: Donation = {
      id: crypto.randomUUID(),
      type: input.type,
      date: input.date,
      countryCode: donorSettings.countryCode
    };
    return [...list, donation].sort((a, b) => a.date.localeCompare(b.date));
  });

  return result;
}

export function removeDonation(id: string): void {
  donations.update((list) => list.filter((d) => d.id !== id));
}

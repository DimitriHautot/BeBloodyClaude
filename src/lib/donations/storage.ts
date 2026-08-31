import { persisted } from '../storage';
import { createDonation, isValidDonation, type Donation, type DonationType } from './types';
import type { DonorSettings } from '../settings/storage';
import { validateNewDonation, type DonationValidation } from './validation';

export const donations = persisted<Donation[]>('donations', [], (stored) =>
  // Drop any entry missing a required field (e.g. tampered-with or corrupt
  // localStorage) rather than let it crash downstream code that assumes
  // every field is present, like the country flag shown per donation.
  stored.filter(isValidDonation)
);

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

    const donation = createDonation({
      id: crypto.randomUUID(),
      type: input.type,
      date: input.date,
      countryCode: donorSettings.countryCode
    });
    return [...list, donation].sort((a, b) => a.date.localeCompare(b.date));
  });

  return result;
}

export function removeDonation(id: string): void {
  donations.update((list) => list.filter((d) => d.id !== id));
}

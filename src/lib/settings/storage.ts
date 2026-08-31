import { persisted } from '../storage';
import { DONATION_TYPES, type DonationType } from '../donations/types';

export type Sex = 'male' | 'female';

const SEX_SYMBOLS: Record<Sex, string> = {
  male: '♂',
  female: '♀'
};

/** The male (♂) or female (♀) sex symbol for `sex`. */
export function getSexSymbol(sex: Sex): string {
  return SEX_SYMBOLS[sex];
}

export interface DonorSettings {
  countryCode: string;
  sex: Sex;
  debugMode?: boolean;
  /** Highlight donation types becoming possible soon (orange) in NextDonationSummary. */
  highlightUpcoming?: boolean;
  /** Window (in days after today) considered "soon" when highlightUpcoming is on. */
  highlightUpcomingDays?: number;
  /** Which donation types this donor can give. All true by default. */
  allowedDonationTypes?: Record<DonationType, boolean>;
}

export const DEFAULT_DONOR_SETTINGS: DonorSettings = {
  countryCode: 'BE',
  sex: 'male',
  debugMode: false,
  highlightUpcoming: false,
  highlightUpcomingDays: 14,
  allowedDonationTypes: { blood: true, plasma: true, platelets: true }
};

export const donorSettings = persisted<DonorSettings>(
  'donorSettings',
  DEFAULT_DONOR_SETTINGS,
  (stored) => ({ ...DEFAULT_DONOR_SETTINGS, ...stored })
);

/** `settings.allowedDonationTypes`, backfilled with `true` for any type missing from it. */
export function getAllowedTypesRecord(settings: DonorSettings): Record<DonationType, boolean> {
  return {
    blood: settings.allowedDonationTypes?.blood ?? true,
    plasma: settings.allowedDonationTypes?.plasma ?? true,
    platelets: settings.allowedDonationTypes?.platelets ?? true
  };
}

/** The donation types this donor can currently give, per `allowedDonationTypes`. */
export function getAllowedTypes(settings: DonorSettings): DonationType[] {
  const allowed = getAllowedTypesRecord(settings);
  return DONATION_TYPES.filter((type) => allowed[type]);
}

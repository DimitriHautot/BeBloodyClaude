import { persisted } from '../storage';

export type Sex = 'male' | 'female';

export interface DonorSettings {
  countryCode: string;
  sex: Sex;
  debugMode?: boolean;
  /** Highlight donation types becoming possible soon (orange) in NextDonationSummary. */
  highlightUpcoming?: boolean;
  /** Window (in days after today) considered "soon" when highlightUpcoming is on. */
  highlightUpcomingDays?: number;
}

export const DEFAULT_DONOR_SETTINGS: DonorSettings = {
  countryCode: 'BE',
  sex: 'male',
  debugMode: false,
  highlightUpcoming: false,
  highlightUpcomingDays: 14
};

export const donorSettings = persisted<DonorSettings>('donorSettings', DEFAULT_DONOR_SETTINGS);

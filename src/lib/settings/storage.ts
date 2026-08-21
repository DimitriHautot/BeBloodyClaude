import { persisted } from '../storage';

export type Sex = 'male' | 'female';

export interface DonorSettings {
  countryCode: string;
  sex: Sex;
  debugMode?: boolean;
}

export const DEFAULT_DONOR_SETTINGS: DonorSettings = {
  countryCode: 'BE',
  sex: 'male',
  debugMode: false
};

export const donorSettings = persisted<DonorSettings>('donorSettings', DEFAULT_DONOR_SETTINGS);

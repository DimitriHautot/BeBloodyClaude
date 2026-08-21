import { persisted } from '../storage';

export type Sex = 'male' | 'female';

export interface DonorSettings {
  countryCode: string;
  sex: Sex;
}

export const DEFAULT_DONOR_SETTINGS: DonorSettings = {
  countryCode: 'BE',
  sex: 'male'
};

export const donorSettings = persisted<DonorSettings>('donorSettings', DEFAULT_DONOR_SETTINGS);

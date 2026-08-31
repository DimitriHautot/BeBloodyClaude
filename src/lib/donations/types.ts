export type DonationType = 'blood' | 'plasma' | 'platelets';

export interface Donation {
  id: string;
  type: DonationType;
  /** ISO date string (YYYY-MM-DD), no time component. */
  date: string;
  /**
   * ISO 3166-1 alpha-2 code of the country whose rules applied when this
   * donation was recorded (the donor's `DonorSettings.countryCode` at that
   * time). Kept per-donation rather than read from the donor's current
   * settings because that choice can change later, while a past donation's
   * governing rules shouldn't.
   */
  countryCode: string;
}

export const DONATION_TYPES: DonationType[] = ['blood', 'plasma', 'platelets'];

export const DONATION_TYPE_LABELS: Record<DonationType, string> = {
  blood: 'Sang total',
  plasma: 'Plasma',
  platelets: 'Plaquettes'
};

export type DonationType = 'blood' | 'plasma' | 'platelets';

export interface Donation {
  id: string;
  type: DonationType;
  /** ISO date string (YYYY-MM-DD), no time component. */
  date: string;
}

export const DONATION_TYPES: DonationType[] = ['blood', 'plasma', 'platelets'];

export const DONATION_TYPE_LABELS: Record<DonationType, string> = {
  blood: 'Sang total',
  plasma: 'Plasma',
  platelets: 'Plaquettes'
};

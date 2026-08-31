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

/** Narrows `value` to `Donation`: a valid id, type, date and countryCode all present. */
export function isValidDonation(value: unknown): value is Donation {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    DONATION_TYPES.includes(candidate.type as DonationType) &&
    typeof candidate.date === 'string' &&
    candidate.date.length > 0 &&
    typeof candidate.countryCode === 'string' &&
    candidate.countryCode.length > 0
  );
}

/**
 * Builds a `Donation`, throwing if `id`, `type`, `date` or `countryCode` is
 * missing or empty. The sole way to construct a `Donation` — a partial one
 * (e.g. missing `countryCode`) must never enter the store, since downstream
 * code (like the country flag shown per donation) assumes every field is
 * present.
 */
export function createDonation(input: {
  id: string;
  type: DonationType;
  date: string;
  countryCode: string;
}): Donation {
  if (!isValidDonation(input)) {
    throw new Error('Cannot create a Donation without id, type, date and countryCode all provided.');
  }
  return { id: input.id, type: input.type, date: input.date, countryCode: input.countryCode };
}

import type { Donation, DonationType } from '../donations/types';
import type { DonorSettings } from '../settings/storage';

/**
 * A country's blood/plasma/platelet donation rules.
 *
 * `computeNextEligibleDate` receives the donor's FULL donation history
 * (all types combined), not just the history for `type`. This is
 * intentional: a real rule set typically needs to reason about
 * cross-type interactions (e.g. a whole blood donation delaying
 * eligibility for plasma) and rolling-window annual quotas that require
 * looking at all past donations of a type over the last 365 days — not
 * just the single most recent donation of that type.
 *
 * Any new country implementation must keep this signature even if its
 * rules happen not to use cross-type interactions.
 */
export interface DonationRuleSet {
  /** ISO 3166-1 alpha-2 country code, e.g. 'BE'. */
  countryCode: string;
  /** Human-readable name for display in the settings UI. */
  countryName: string;
  computeNextEligibleDate(
    type: DonationType,
    allDonations: Donation[],
    donorSettings: DonorSettings
  ): Date;
  /**
   * Earliest date a donation of `type` would be allowed given
   * `allDonations`, with NO floor on today — unlike
   * `computeNextEligibleDate`, this can return a date in the past. Used to
   * set the lower bound (`min`) on a date picker for recording a donation,
   * alongside the upper bound (today, since a donation can't be in the
   * future).
   */
  earliestPossibleDate(
    type: DonationType,
    allDonations: Donation[],
    donorSettings: DonorSettings
  ): Date;
  /**
   * Whether a donation of `type` on `date` (ISO YYYY-MM-DD) would be
   * allowed given the donations that happened strictly before `date` in
   * `allDonations`. Unlike `computeNextEligibleDate`, this is not floored
   * to today — it is used to validate a donation being recorded for any
   * date, past or present.
   */
  isDonationAllowed(
    type: DonationType,
    date: string,
    allDonations: Donation[],
    donorSettings: DonorSettings
  ): boolean;
}

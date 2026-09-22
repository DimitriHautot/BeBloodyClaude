import type { Donation, DonationType } from '../donations/types';
import type { DonorSettings } from '../settings/storage';

/**
 * A country's blood/plasma/platelet donation rules.
 *
 * `computeNextEligibleDate` receives the donor's FULL donation history
 * (all types combined), not just the history for `type`. This is
 * intentional: a real rule set typically needs to reason about
 * cross-type interactions (e.g., a whole blood donation delaying
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
  /**
   * The date to SUGGEST to the donor as their next possible donation —
   * shown directly in the UI (`NextDonationSummary`). If this country's
   * source distinguishes a stricter health recommendation from a shorter
   * legal minimum (e.g. Belgium's Red Cross advising 3 months while the
   * law only requires 2 — see `belgium.ts`), use the RECOMMENDATION here,
   * never the bare legal minimum: this method exists to guide the donor
   * toward a safe interval, not merely a legally-compliant one.
   */
  computeNextEligibleDate(
    type: DonationType,
    allDonations: Donation[],
    donorSettings: DonorSettings
  ): Date;
  /**
   * The earliest date a donation of `type` would be allowed given
   * `allDonations`, with NO floor on today — unlike
   * `computeNextEligibleDate`, this can return a date in the past. Used to
   * set the lower bound (`min`) on a date picker for recording a donation,
   * alongside the upper bound (today, since a donation can't be in the
   * future).
   *
   * This validates a donation that actually happened (or is being
   * backdated), not a future suggestion — so if this country distinguishes
   * a legal minimum from a stricter recommendation (see
   * `computeNextEligibleDate` above), use the LEGAL minimum here: a real,
   * legally valid past donation must never be rejected just because it
   * falls short of the (separately surfaced) recommendation. Never display
   * this narrower date to the donor as a suggestion — it exists only to
   * avoid rejecting real history, not to encourage shorter intervals.
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
   * today — it is used to validate a donation being recorded for any
   * date, past or present.
   *
   * Same rule as `earliestPossibleDate` above: use the legal minimum, not
   * the recommendation, when this country's rules distinguish the two.
   */
  isDonationAllowed(
    type: DonationType,
    date: string,
    allDonations: Donation[],
    donorSettings: DonorSettings
  ): boolean;
  /**
   * Return a map of official references for the country.
   * The key is a 2-letter language code, and the value is an array of URLs.
   */
  officialReferences():Map<string, string[]>;
}

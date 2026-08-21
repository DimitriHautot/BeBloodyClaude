import type { Donation, DonationType } from '../donations/types';
import { DONATION_TYPES } from '../donations/types';
import type { DonationRuleSet } from './types';

interface TypeRule {
  minIntervalDays: number;
  maxPerRollingYear: number;
}

/**
 * Belgian Red Cross (Croix-Rouge de Belgique) rules, as published on
 * donneurdesang.be / donneurdeplasma.be:
 * - Whole blood: 2 months (60 days) minimum interval, max 4 donations/year.
 * - Plasma: 2 weeks (14 days) minimum interval, max 23 donations/year.
 * - Platelets: 2 weeks (14 days) minimum interval, max 24 donations/year.
 *
 * NOTE: the official sources do not publish an explicit cross-type delay
 * (e.g. how long to wait after a whole blood donation before donating
 * plasma). As a conservative assumption, this implementation treats every
 * past donation — regardless of type — as imposing its own type's minimum
 * interval before ANY subsequent donation. This is deliberately
 * conservative (a whole blood donation blocks other types for 60 days,
 * not just 0) and should be verified against the Red Cross before being
 * relied on for real medical decisions.
 */
const RULES: Record<DonationType, TypeRule> = {
  blood: { minIntervalDays: 60, maxPerRollingYear: 4 },
  plasma: { minIntervalDays: 14, maxPerRollingYear: 23 },
  platelets: { minIntervalDays: 14, maxPerRollingYear: 24 }
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

/**
 * Recovery constraint: the earliest date any new donation could happen,
 * based on ALL past donations (any type). Each donation blocks new
 * donations until `donationDate + minIntervalDays(that donation's type)`.
 */
function recoveryConstraintDate(allDonations: Donation[]): Date | null {
  let latest: Date | null = null;
  for (const donation of allDonations) {
    const blockedUntil = addDays(parseDate(donation.date), RULES[donation.type].minIntervalDays);
    if (latest === null || blockedUntil > latest) {
      latest = blockedUntil;
    }
  }
  return latest;
}

/**
 * Rolling 365-day quota constraint for a single donation type: pushes the
 * candidate date forward until fewer than `maxPerRollingYear` donations of
 * that type fall within the trailing 365-day window ending on the
 * candidate date.
 */
function quotaConstraintDate(donationsOfType: Donation[], rule: TypeRule, candidate: Date): Date {
  const sortedDates = donationsOfType.map((d) => parseDate(d.date)).sort((a, b) => a.getTime() - b.getTime());

  let result = candidate;
  for (let i = 0; i < sortedDates.length + 1; i++) {
    const windowStart = addDays(result, -365);
    const inWindow = sortedDates.filter((d) => d > windowStart && d <= result);
    if (inWindow.length < rule.maxPerRollingYear) {
      return result;
    }
    // Push past the oldest donation in the window so it falls outside the
    // rolling window, freeing up a quota slot.
    const oldestInWindow = inWindow[0];
    result = addDays(oldestInWindow, 365 + 1);
  }
  return result;
}

/** Earliest date `type` would be allowed given `allDonations`, with no floor on today. */
function earliestEligibleDate(type: DonationType, allDonations: Donation[]): Date {
  const rule = RULES[type];
  const donationsOfType = allDonations.filter((d) => d.type === type);

  // No floor: if there's no blocking history, any date (even far in the
  // past) is a valid candidate to start the quota computation from.
  const afterRecovery = recoveryConstraintDate(allDonations) ?? new Date(0);

  return quotaConstraintDate(donationsOfType, rule, afterRecovery);
}

export const belgiumRules: DonationRuleSet = {
  countryCode: 'BE',
  countryName: 'Belgique',
  computeNextEligibleDate(type: DonationType, allDonations: Donation[]): Date {
    const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
    const earliest = earliestEligibleDate(type, allDonations);
    return earliest > today ? earliest : today;
  },
  isDonationAllowed(type: DonationType, date: string, allDonations: Donation[]): boolean {
    const candidate = parseDate(date);
    // Donations on or before the candidate date have already happened by
    // then and must be considered; only donations strictly after it (e.g.
    // entered out of order) are excluded, since they hadn't happened yet.
    const priorDonations = allDonations.filter((d) => parseDate(d.date) <= candidate);
    const earliest = earliestEligibleDate(type, priorDonations);
    return candidate.getTime() >= earliest.getTime();
  }
};

// Re-exported for tests / other rule sets that want the same shape of data.
export const belgiumTypeRules = RULES;
export { DONATION_TYPES };

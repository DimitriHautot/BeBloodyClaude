import type { Donation, DonationType } from '../donations/types';
import { DONATION_TYPES } from '../donations/types';
import type { DonationRuleSet } from './types';
import { addDays, parseISODate, today as todayDate } from '../dates';

/**
 * Belgian Red Cross (Croix-Rouge de Belgique) rules, as published on
 * donneurdesang.be/fr/qui-peut-donner/delai-entre-deux-dons:
 *
 * Minimum delay (in days) before a donation of `to` is allowed, given a
 * previous donation of `from` — CROSS_DELAY_DAYS[from][to]. Values taken
 * directly from the site's "dernier don / prochain don" matrix (in weeks,
 * converted to days: 2 sem = 14j, 4 sem = 28j, 12 sem = 84j). Note the
 * whole-blood-to-whole-blood delay (12 weeks = 3 mois) is the Red Cross's
 * stricter recommendation, not the 2-month legal minimum also mentioned on
 * the page — used for `computeNextEligibleDate` (the forward-looking "next
 * possible donation" guidance shown to the donor).
 */
const CROSS_DELAY_DAYS: Record<DonationType, Record<DonationType, number>> = {
  blood: { blood: 84, plasma: 14, platelets: 28 },
  plasma: { blood: 14, plasma: 14, platelets: 14 },
  platelets: { blood: 28, plasma: 14, platelets: 28 }
};

/**
 * Whole-blood-to-whole-blood delay used to validate a donation actually
 * being recorded (`isDonationAllowed`, and the date-picker's lower bound
 * from `earliestPossibleDate`): the law's 2-month minimum, not the Red
 * Cross's stricter 3-month recommendation above — donneurdesang.be states
 * "la loi autorise le don après un délai de minimum 2 mois entre 2 dons"
 * distinctly from the Red Cross's own 3-month advice, and a real donation
 * legally spaced by only 2 months must be recordable as history even
 * though the app won't *recommend* donating again that soon.
 *
 * Interpreted here as 56 days (8 weeks) — the EU Directive 2004/33/CE
 * floor also used as France's legal minimum in `france.ts` — since neither
 * donneurdesang.be nor the underlying arrêté royal du 4 avril 1996 relatif
 * au sang et aux dérivés du sang d'origine humaine spell out an exact day
 * count for "2 mois", and both ejustice.just.fgov.be and donneurdesang.be
 * are blocked by this environment's network proxy. Treat this specific
 * value as unverified until confirmed against the primary text.
 */
const LEGAL_MIN_BLOOD_TO_BLOOD_DAYS = 56;

const VALIDATION_DELAY_DAYS: Record<DonationType, Record<DonationType, number>> = {
  ...CROSS_DELAY_DAYS,
  blood: { ...CROSS_DELAY_DAYS.blood, blood: LEGAL_MIN_BLOOD_TO_BLOOD_DAYS }
};

interface QuotaRule {
  maxPerRollingYear: number;
  /** Donation types that count against this quota (see platelets below). */
  countedTypes: DonationType[];
}

/**
 * Rolling 365-day annual quotas. Whole blood and plasma each have their own
 * independent quota. Platelets are a special case: the page states the
 * platelet quota (24/year) counts whole blood donations too ("incluant les
 * éventuels dons de sang") — a shared budget, not a platelets-only cap.
 *
 * Plasma also has a 15 liters / year cap mentioned on the page that isn't
 * implemented here — we have no donation volume data to check it against.
 */
const QUOTA: Record<DonationType, QuotaRule> = {
  blood: { maxPerRollingYear: 4, countedTypes: ['blood'] },
  plasma: { maxPerRollingYear: 19, countedTypes: ['plasma'] },
  platelets: { maxPerRollingYear: 24, countedTypes: ['platelets', 'blood'] }
};

/**
 * Recovery constraint: the earliest date a donation of `targetType` would
 * be allowed, based on ALL past donations (any type). Each past donation
 * blocks `targetType` until `donationDate + delayDays[thatType][targetType]`.
 * `delayDays` is `CROSS_DELAY_DAYS` (Red Cross recommendation) for forward
 * guidance, or `VALIDATION_DELAY_DAYS` (legal minimum) when validating an
 * actual donation being recorded — see the two matrices above.
 */
function recoveryConstraintDate(
  allDonations: Donation[],
  targetType: DonationType,
  delayDays: Record<DonationType, Record<DonationType, number>>
): Date | null {
  let latest: Date | null = null;
  for (const donation of allDonations) {
    const blockedUntil = addDays(parseISODate(donation.date), delayDays[donation.type][targetType]);
    if (latest === null || blockedUntil > latest) {
      latest = blockedUntil;
    }
  }
  return latest;
}

/**
 * Rolling 365-day quota constraint: pushes the candidate date forward until
 * fewer than `maxPerRollingYear` donations counted for this quota (see
 * `QuotaRule.countedTypes`) fall within the trailing 365-day window ending
 * on the candidate date.
 */
function quotaConstraintDate(donationsForQuota: Donation[], maxPerRollingYear: number, candidate: Date): Date {
  const sortedDates = donationsForQuota.map((d) => parseISODate(d.date)).sort((a, b) => a.getTime() - b.getTime());

  let result = candidate;
  for (let i = 0; i < sortedDates.length + 1; i++) {
    const windowStart = addDays(result, -365);
    const inWindow = sortedDates.filter((d) => d > windowStart && d <= result);
    if (inWindow.length < maxPerRollingYear) {
      return result;
    }
    // Push past the oldest donation in the window so it falls outside the
    // rolling window, freeing up a quota slot.
    const oldestInWindow = inWindow[0];
    result = addDays(oldestInWindow, 365);
  }
  return result;
}

/** The earliest date `type` would be allowed given `allDonations`, with no floor on today. */
function earliestEligibleDate(
  type: DonationType,
  allDonations: Donation[],
  delayDays: Record<DonationType, Record<DonationType, number>>
): Date {
  const quota = QUOTA[type];
  const donationsForQuota = allDonations.filter((d) => quota.countedTypes.includes(d.type));

  // No floor: if there's no blocking history, any date (even far in the
  // past) is a valid candidate to start the quota computation from.
  const afterRecovery = recoveryConstraintDate(allDonations, type, delayDays) ?? new Date(0);

  return quotaConstraintDate(donationsForQuota, quota.maxPerRollingYear, afterRecovery);
}

export const belgiumRules: DonationRuleSet = {
  countryCode: 'BE',
  countryName: 'Belgique',
  computeNextEligibleDate(type: DonationType, allDonations: Donation[]): Date {
    const today = todayDate();
    const earliest = earliestEligibleDate(type, allDonations, CROSS_DELAY_DAYS);
    return earliest > today ? earliest : today;
  },
  earliestPossibleDate(type: DonationType, allDonations: Donation[]): Date {
    return earliestEligibleDate(type, allDonations, VALIDATION_DELAY_DAYS);
  },
  isDonationAllowed(type: DonationType, date: string, allDonations: Donation[]): boolean {
    const candidate = parseISODate(date);
    // Donations on or before the candidate date have already happened by
    // then and must be considered; only donations strictly after it (e.g.
    // entered out of order) are excluded, since they hadn't happened yet.
    const priorDonations = allDonations.filter((d) => parseISODate(d.date) <= candidate);
    const earliest = earliestEligibleDate(type, priorDonations, VALIDATION_DELAY_DAYS);
    return candidate.getTime() >= earliest.getTime();
  },
  officialReferences():Map<string, string[]> {
    const officialReferences = new Map<string, string[]>();
    officialReferences.set("de", ["https://www.donneurdesang.be/de/wer-kann-spenden/zeitspanne-zwischen-zwei-spenden"]);
    officialReferences.set("en", ["https://www.donneurdesang.be/en/who-can-donate/wait-between-two-donations"]);
    officialReferences.set("fr", ["https://www.donneurdesang.be/fr/qui-peut-donner/delai-entre-deux-dons"]);
    officialReferences.set("nl", ["https://www.donneurdesang.be/nl/wie-mag-doneren/termijn-tussen-twee-donaties"]);
    return officialReferences;
  }
};

// Re-exported for tests / other rule sets that want the same shape of data.
export const belgiumCrossDelayDays = CROSS_DELAY_DAYS;
export const belgiumValidationDelayDays = VALIDATION_DELAY_DAYS;
export const belgiumQuota = QUOTA;
export { DONATION_TYPES };

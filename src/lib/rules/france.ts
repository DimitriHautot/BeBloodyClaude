import type { Donation, DonationType } from '../donations/types';
import type { DonorSettings } from '../settings/storage';
import type { DonationRuleSet } from './types';
import { addDays, parseISODate, today as todayDate } from '../dates';

/**
 * French rules (Établissement français du sang), as published in the
 * "tableau des intervalles entre deux dons" (annexe 1 de l'arrêté du 17
 * décembre 2019, https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039704282/)
 * and confirmed by the annual-quota table on
 * https://www.service-public.gouv.fr/particuliers/vosdroits/F2376.
 *
 * Minimum delay (in days) before a donation of `to` is allowed, given a
 * previous donation of `from` — CROSS_DELAY_DAYS[from][to]. Values taken
 * from the annexe 1 matrix (in weeks, converted to days: 2 sem = 14j,
 * 4 sem = 28j, 8 sem = 56j), restricted to whole blood / plasma / platelets
 * (the other rows/columns — granulocytes, red cells, CSH — are out of
 * scope for this app, per AGENTS.md).
 */
const CROSS_DELAY_DAYS: Record<DonationType, Record<DonationType, number>> = {
  blood: { blood: 56, plasma: 14, platelets: 28 },
  plasma: { blood: 14, plasma: 14, platelets: 14 },
  platelets: { blood: 28, plasma: 14, platelets: 28 }
};

interface QuotaRule {
  maxPerRollingYear: number;
  /** Donation types that count against this quota. */
  countedTypes: DonationType[];
}

/**
 * Rolling 365-day annual quotas per type, from the service-public.gouv.fr
 * table. Unlike Belgium, whole blood has a sex-dependent quota (6/year for
 * men, 4/year for women); plasma (24/year) and platelets (12/year) don't
 * vary by sex.
 */
function ownQuotaRule(type: DonationType, sex: DonorSettings['sex']): QuotaRule {
  if (type === 'blood') {
    return { maxPerRollingYear: sex === 'female' ? 4 : 6, countedTypes: ['blood'] };
  }
  if (type === 'plasma') {
    return { maxPerRollingYear: 24, countedTypes: ['plasma'] };
  }
  return { maxPerRollingYear: 12, countedTypes: ['platelets'] };
}

/**
 * On top of each type's own quota, service-public.gouv.fr states an
 * overall cap, all donation types combined: "Au cours d'une année, avec
 * une tolérance de 15 jours, un maximum de 24 prélèvements est autorisé
 * par donneur, tout type de don confondu." The 15-day tolerance isn't
 * implemented here (no data on how it interacts with the rolling window),
 * only the 24-donations-per-year combined cap.
 */
const GLOBAL_QUOTA: QuotaRule = {
  maxPerRollingYear: 24,
  countedTypes: ['blood', 'plasma', 'platelets']
};

/**
 * Recovery constraint: the earliest date a donation of `targetType` would
 * be allowed, based on ALL past donations (any type). Each past donation
 * blocks `targetType` until `donationDate + CROSS_DELAY_DAYS[thatType][targetType]`.
 */
function recoveryConstraintDate(allDonations: Donation[], targetType: DonationType): Date | null {
  let latest: Date | null = null;
  for (const donation of allDonations) {
    const delayDays = CROSS_DELAY_DAYS[donation.type][targetType];
    const blockedUntil = addDays(parseISODate(donation.date), delayDays);
    if (latest === null || blockedUntil > latest) {
      latest = blockedUntil;
    }
  }
  return latest;
}

/**
 * Rolling 365-day quota constraint: pushes the candidate date forward until
 * fewer than `maxPerRollingYear` donations counted for this quota fall
 * within the trailing 365-day window ending on the candidate date.
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
function earliestEligibleDate(type: DonationType, allDonations: Donation[], donorSettings: DonorSettings): Date {
  // No floor: if there's no blocking history, any date (even far in the
  // past) is a valid candidate to start the quota computation from.
  const afterRecovery = recoveryConstraintDate(allDonations, type) ?? new Date(0);

  const ownRule = ownQuotaRule(type, donorSettings.sex);
  const afterOwnQuota = quotaConstraintDate(
    allDonations.filter((d) => ownRule.countedTypes.includes(d.type)),
    ownRule.maxPerRollingYear,
    afterRecovery
  );

  // The combined-types cap is applied last, starting from afterOwnQuota:
  // moving the date forward only removes old donations from the own-type
  // window, so it never violates the own-type quota already satisfied.
  return quotaConstraintDate(
    allDonations.filter((d) => GLOBAL_QUOTA.countedTypes.includes(d.type)),
    GLOBAL_QUOTA.maxPerRollingYear,
    afterOwnQuota
  );
}

export const franceRules: DonationRuleSet = {
  countryCode: 'FR',
  countryName: 'France',
  computeNextEligibleDate(type: DonationType, allDonations: Donation[], donorSettings: DonorSettings): Date {
    const today = todayDate();
    const earliest = earliestEligibleDate(type, allDonations, donorSettings);
    return earliest > today ? earliest : today;
  },
  earliestPossibleDate(type: DonationType, allDonations: Donation[], donorSettings: DonorSettings): Date {
    return earliestEligibleDate(type, allDonations, donorSettings);
  },
  isDonationAllowed(type: DonationType, date: string, allDonations: Donation[], donorSettings: DonorSettings): boolean {
    const candidate = parseISODate(date);
    // Donations on or before the candidate date have already happened by
    // then and must be considered; only donations strictly after it (e.g.
    // entered out of order) are excluded, since they hadn't happened yet.
    const priorDonations = allDonations.filter((d) => parseISODate(d.date) <= candidate);
    const earliest = earliestEligibleDate(type, priorDonations, donorSettings);
    return candidate.getTime() >= earliest.getTime();
  },
  officialReferences(): Map<string, string[]> {
    const officialReferences = new Map<string, string[]>();
    officialReferences.set('fr', [
      'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000039704282/',
      'https://www.service-public.gouv.fr/particuliers/vosdroits/F2376'
    ]);
    return officialReferences;
  }
};

// Re-exported for tests / other rule sets that want the same shape of data.
export const franceCrossDelayDays = CROSS_DELAY_DAYS;
export const franceGlobalQuota = GLOBAL_QUOTA;

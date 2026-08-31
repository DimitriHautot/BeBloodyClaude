import type { Donation, DonationType } from '../donations/types';
import { DONATION_TYPE_LABELS } from '../donations/types';
import { computeDonationStatus, type DonationStatus } from '../donations/status';
import type { DonorSettings } from '../settings/storage';
import { getAllowedTypes } from '../settings/storage';
import type { NotificationState } from './storage';

export interface DailyNotification {
  title: string;
  body: string;
}

export interface DailyEvaluationResult {
  /** Every allowed type's status as of `today`, to persist as the new baseline. */
  statusByType: Partial<Record<DonationType, DonationStatus>>;
  /** A single notification grouping every type that changed status today, or
   * null if nothing changed (including the very first evaluation, which has
   * no prior baseline to compare against). */
  notification: DailyNotification | null;
}

/**
 * Computes today's status for every donation type the donor is allowed to
 * give, and compares it against `previousStatusByType` (yesterday's, or
 * whenever this was last evaluated) to detect types that just became
 * "upcoming" or "eligible". A type with no previous status recorded (first
 * evaluation ever, or newly allowed since the last one) is never reported as
 * having "become" anything — there is nothing to compare it to yet.
 */
export function evaluateDailyNotification(
  allDonations: Donation[],
  donorSettings: DonorSettings,
  previousStatusByType: Partial<Record<DonationType, DonationStatus>>,
  today: Date
): DailyEvaluationResult {
  const statusByType: Partial<Record<DonationType, DonationStatus>> = {};
  const becameEligible: DonationType[] = [];
  const becameUpcoming: DonationType[] = [];

  for (const type of getAllowedTypes(donorSettings)) {
    const status = computeDonationStatus(type, allDonations, donorSettings, today);
    statusByType[type] = status;

    const previous = previousStatusByType[type];
    if (previous === undefined || previous === status) continue;

    if (status === 'eligible') becameEligible.push(type);
    else if (status === 'upcoming') becameUpcoming.push(type);
  }

  if (becameEligible.length === 0 && becameUpcoming.length === 0) {
    return { statusByType, notification: null };
  }

  return { statusByType, notification: buildNotification(becameEligible, becameUpcoming) };
}

function buildNotification(becameEligible: DonationType[], becameUpcoming: DonationType[]): DailyNotification {
  const lines: string[] = [];
  if (becameEligible.length > 0) {
    lines.push(`Possible dès maintenant : ${listTypeLabels(becameEligible)}`);
  }
  if (becameUpcoming.length > 0) {
    lines.push(`Bientôt possible, pensez à prendre rendez-vous : ${listTypeLabels(becameUpcoming)}`);
  }
  return { title: 'Don de sang', body: lines.join('\n') };
}

function listTypeLabels(types: DonationType[]): string {
  return types.map((type) => DONATION_TYPE_LABELS[type]).join(', ');
}

/** Whether a daily evaluation is still due for `today` (none has run yet today). */
export function isEvaluationDueToday(state: NotificationState, todayISO: string): boolean {
  return state.lastEvaluatedDate !== todayISO;
}

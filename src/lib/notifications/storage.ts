import { persisted } from '../storage';
import type { DonationType } from '../donations/types';
import type { DonationStatus } from '../donations/status';

export interface NotificationState {
  /** ISO date (YYYY-MM-DD) of the last daily evaluation, or null before the first one. */
  lastEvaluatedDate: string | null;
  /** Each allowed type's status as of the last evaluation. */
  statusByType: Partial<Record<DonationType, DonationStatus>>;
}

const DEFAULT_NOTIFICATION_STATE: NotificationState = {
  lastEvaluatedDate: null,
  statusByType: {}
};

export const notificationState = persisted<NotificationState>(
  'notificationState',
  DEFAULT_NOTIFICATION_STATE,
  (stored) => ({ ...DEFAULT_NOTIFICATION_STATE, ...stored })
);

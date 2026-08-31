import { get } from 'svelte/store';
import { donations } from '../donations/storage';
import { donorSettings } from '../settings/storage';
import { toISODate, today as todayDate } from '../dates';
import { evaluateDailyNotification, isEvaluationDueToday } from './evaluate';
import { notificationState } from './storage';

/** Whether this browser can show notifications at all. */
export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/** Whether the browser has actually granted notification permission. */
export function hasNotificationPermission(): boolean {
  return notificationsSupported() && Notification.permission === 'granted';
}

export async function registerNotificationsServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/notifications-sw.js');
  } catch {
    // Registration can fail (e.g. unsupported context, network issue on
    // first load) — notifications degrade to the `Notification` constructor
    // fallback in showNotification() below.
    return null;
  }
}

/**
 * Shows a system notification, preferring the service worker (required by
 * some browsers, e.g. Chrome on Android disallows the `Notification`
 * constructor directly from a page) and falling back to the constructor
 * when no service worker is registered.
 */
export async function showNotification(title: string, body: string): Promise<void> {
  const registration = typeof navigator !== 'undefined' ? await navigator.serviceWorker?.ready.catch(() => null) : null;
  if (registration) {
    registration.active?.postMessage({ type: 'show-notification', title, body });
    return;
  }
  if (notificationsSupported()) {
    new Notification(title, { body });
  }
}

/**
 * Runs the daily evaluation if one is still due for today, persisting the
 * new status baseline and showing a notification when something changed.
 * Safe to call as often as desired — a no-op once today's check has run.
 */
export async function runDailyCheckIfDue(): Promise<void> {
  const today = todayDate();
  const todayISO = toISODate(today);
  const state = get(notificationState);
  if (!isEvaluationDueToday(state, todayISO)) return;

  const result = evaluateDailyNotification(get(donations), get(donorSettings), state.statusByType, today);
  notificationState.set({ lastEvaluatedDate: todayISO, statusByType: result.statusByType });

  if (result.notification) {
    await showNotification(result.notification.title, result.notification.body);
  }
}

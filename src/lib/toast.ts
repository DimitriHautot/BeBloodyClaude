import { writable } from 'svelte/store';

export const toastMessage = writable<string | null>(null);

let hideTimer: ReturnType<typeof setTimeout> | undefined;

/** Shows a brief message, auto-hidden after `durationMs`. Replaces any toast already showing. */
export function showToast(message: string, durationMs = 4000): void {
  clearTimeout(hideTimer);
  toastMessage.set(message);
  hideTimer = setTimeout(() => toastMessage.set(null), durationMs);
}

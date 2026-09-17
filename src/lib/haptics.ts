/** A short, light haptic tick for a key action (e.g. successfully adding a
 * donation) — the kind of subtle feedback native Android apps give on a
 * confirmed action.
 *
 * `Navigator.vibrate` is a real Android/Chrome feature but Safari (iOS and
 * macOS) never defines it at all, despite TypeScript's DOM lib typing it as
 * always present — calling it there without this guard would throw. No
 * platform check needed: this capability check alone already limits the
 * effect to devices that actually support it. */
export function hapticTick(): void {
  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate(15);
  }
}

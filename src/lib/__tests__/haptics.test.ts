import { describe, expect, it, afterEach, vi } from 'vitest';
import { hapticTick } from '../haptics';

describe('hapticTick', () => {
  afterEach(() => {
    // @ts-expect-error - test-only cleanup of a property we may have added.
    delete navigator.vibrate;
  });

  it('calls navigator.vibrate with a short duration when supported', () => {
    const vibrate = vi.fn();
    navigator.vibrate = vibrate;

    hapticTick();

    expect(vibrate).toHaveBeenCalledWith(15);
  });

  it('does not throw when navigator.vibrate is unsupported (e.g. Safari)', () => {
    // @ts-expect-error - simulate a browser (Safari) that never defines it.
    navigator.vibrate = undefined;

    expect(() => hapticTick()).not.toThrow();
  });
});

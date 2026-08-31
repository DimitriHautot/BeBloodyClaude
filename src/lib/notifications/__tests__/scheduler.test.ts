import { describe, expect, it } from 'vitest';
import { nextLocal8am, isPast8amLocal } from '../scheduler';

describe('nextLocal8am', () => {
  it('returns 8am the same day when called before 8am', () => {
    const from = new Date(2026, 7, 31, 6, 30, 0);
    const next = nextLocal8am(from);
    expect(next).toEqual(new Date(2026, 7, 31, 8, 0, 0, 0));
  });

  it('returns 8am the next day when called exactly at 8am', () => {
    const from = new Date(2026, 7, 31, 8, 0, 0, 0);
    const next = nextLocal8am(from);
    expect(next).toEqual(new Date(2026, 8, 1, 8, 0, 0, 0));
  });

  it('returns 8am the next day when called after 8am', () => {
    const from = new Date(2026, 7, 31, 14, 0, 0);
    const next = nextLocal8am(from);
    expect(next).toEqual(new Date(2026, 8, 1, 8, 0, 0, 0));
  });

  it('rolls over the month/year correctly', () => {
    const from = new Date(2026, 11, 31, 20, 0, 0);
    const next = nextLocal8am(from);
    expect(next).toEqual(new Date(2027, 0, 1, 8, 0, 0, 0));
  });
});

describe('isPast8amLocal', () => {
  it('is false before 8am', () => {
    expect(isPast8amLocal(new Date(2026, 7, 31, 7, 59, 0))).toBe(false);
  });

  it('is true exactly at 8am', () => {
    expect(isPast8amLocal(new Date(2026, 7, 31, 8, 0, 0))).toBe(true);
  });

  it('is true after 8am', () => {
    expect(isPast8amLocal(new Date(2026, 7, 31, 23, 0, 0))).toBe(true);
  });
});

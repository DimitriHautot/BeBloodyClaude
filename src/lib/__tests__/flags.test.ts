import { describe, expect, it } from 'vitest';
import { getFlag } from '../flags';

describe('getFlag', () => {
  it('returns the regional-indicator emoji flag for an uppercase ISO code', () => {
    expect(getFlag('BE')).toBe('🇧🇪');
    expect(getFlag('FR')).toBe('🇫🇷');
  });

  it('accepts a lowercase or mixed-case code by uppercasing it first', () => {
    expect(getFlag('be')).toBe('🇧🇪');
    expect(getFlag('Fr')).toBe('🇫🇷');
  });

  it('handles both boundary letters of the alphabet', () => {
    expect(getFlag('AA')).toBe('🇦🇦');
    expect(getFlag('ZZ')).toBe('🇿🇿');
  });

  it('throws for a code shorter than 2 letters', () => {
    expect(() => getFlag('B')).toThrow('The country code must contain exactly 2 letters.');
    expect(() => getFlag('')).toThrow('The country code must contain exactly 2 letters.');
  });

  it('throws for a code longer than 2 letters', () => {
    expect(() => getFlag('BEL')).toThrow('The country code must contain exactly 2 letters.');
  });
});

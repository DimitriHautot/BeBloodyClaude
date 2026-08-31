import { describe, expect, it } from 'vitest';
import { createDonation, isValidDonation } from '../types';

const valid = { id: '1', type: 'blood' as const, date: '2026-01-01', countryCode: 'BE' };

describe('createDonation', () => {
  it('builds a Donation when every field is provided', () => {
    expect(createDonation(valid)).toEqual(valid);
  });

  it('throws when countryCode is missing', () => {
    const { countryCode, ...withoutCountryCode } = valid;
    expect(() => createDonation(withoutCountryCode as typeof valid)).toThrow();
  });

  it('throws when countryCode is empty', () => {
    expect(() => createDonation({ ...valid, countryCode: '' })).toThrow();
  });

  it('throws when date is missing', () => {
    const { date, ...withoutDate } = valid;
    expect(() => createDonation(withoutDate as typeof valid)).toThrow();
  });

  it('throws when date is empty', () => {
    expect(() => createDonation({ ...valid, date: '' })).toThrow();
  });

  it('throws when type is missing or not a known donation type', () => {
    const { type, ...withoutType } = valid;
    expect(() => createDonation(withoutType as typeof valid)).toThrow();
    expect(() => createDonation({ ...valid, type: 'invalid' as typeof valid.type })).toThrow();
  });

  it('throws when id is missing or empty', () => {
    const { id, ...withoutId } = valid;
    expect(() => createDonation(withoutId as typeof valid)).toThrow();
    expect(() => createDonation({ ...valid, id: '' })).toThrow();
  });
});

describe('isValidDonation', () => {
  it('accepts a fully-populated Donation', () => {
    expect(isValidDonation(valid)).toBe(true);
  });

  it('rejects a value missing countryCode (e.g. corrupted localStorage)', () => {
    const { countryCode, ...withoutCountryCode } = valid;
    expect(isValidDonation(withoutCountryCode)).toBe(false);
  });

  it('rejects non-object values', () => {
    expect(isValidDonation(null)).toBe(false);
    expect(isValidDonation(undefined)).toBe(false);
    expect(isValidDonation('donation')).toBe(false);
  });
});

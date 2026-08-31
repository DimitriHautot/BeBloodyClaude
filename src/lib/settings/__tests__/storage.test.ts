import { describe, expect, it } from 'vitest';
import { getAllowedTypes, getAllowedTypesRecord, type DonorSettings } from '../storage';

function settings(allowedDonationTypes?: DonorSettings['allowedDonationTypes']): DonorSettings {
  return { countryCode: 'BE', sex: 'male', allowedDonationTypes };
}

describe('getAllowedTypesRecord', () => {
  it('defaults every type to true when allowedDonationTypes is missing entirely', () => {
    expect(getAllowedTypesRecord(settings(undefined))).toEqual({
      blood: true,
      plasma: true,
      platelets: true
    });
  });

  it('backfills only the types missing from a partial allowedDonationTypes', () => {
    expect(getAllowedTypesRecord(settings({ blood: false } as DonorSettings['allowedDonationTypes']))).toEqual({
      blood: false,
      plasma: true,
      platelets: true
    });
  });
});

describe('getAllowedTypes', () => {
  it('returns all 3 types by default', () => {
    expect(getAllowedTypes(settings(undefined))).toEqual(['blood', 'plasma', 'platelets']);
  });

  it('excludes a type explicitly set to false', () => {
    expect(getAllowedTypes(settings({ blood: true, plasma: false, platelets: true }))).toEqual([
      'blood',
      'platelets'
    ]);
  });

  it('can return a single type when only one is allowed', () => {
    expect(getAllowedTypes(settings({ blood: false, plasma: true, platelets: false }))).toEqual(['plasma']);
  });
});

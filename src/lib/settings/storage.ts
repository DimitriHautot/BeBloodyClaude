import { persisted } from '../storage';
import { DONATION_TYPES, type DonationType } from '../donations/types';
import type { LanguagePreference } from '../i18n';

export type Sex = 'male' | 'female';

// The trailing U+FE0E (text variation selector) forces the plain-text glyph
// instead of the taller emoji-style one. Without it, iOS substitutes the
// emoji glyph for ♂/♀ in some rendering contexts (notably native <select>/
// <option>, which CSS can't reach) but not others, causing an inconsistent
// vertical offset between platforms — see the DonationForm/SettingsPanel
// "symbole du sexe décalé" fix.
const SEX_SYMBOLS: Record<Sex, string> = {
  male: '♂︎',
  female: '♀︎'
};

/** The male (♂) or female (♀) sex symbol for `sex`. */
export function getSexSymbol(sex: Sex): string {
  return SEX_SYMBOLS[sex];
}

export type ThemePreference = 'system' | 'light' | 'dark';

export interface DonorSettings {
  countryCode: string;
  sex: Sex;
  debugMode?: boolean;
  /** Highlight donation types becoming possible soon (orange) in NextDonationSummary. */
  highlightUpcoming?: boolean;
  /** Window (in days after today) considered "soon" when highlightUpcoming is on. */
  highlightUpcomingDays?: number;
  /** Which donation types this donor can give. All true by default. */
  allowedDonationTypes?: Record<DonationType, boolean>;
  /** Light/dark appearance. `'system'` follows the OS/browser setting. */
  theme?: ThemePreference;
  /** Interface language. `'system'` follows the OS/browser language (see `resolveLocale`). */
  language?: LanguagePreference;
}

export const DEFAULT_DONOR_SETTINGS: DonorSettings = {
  countryCode: 'BE',
  sex: 'male',
  debugMode: false,
  highlightUpcoming: false,
  highlightUpcomingDays: 14,
  allowedDonationTypes: { blood: true, plasma: true, platelets: true },
  theme: 'system',
  language: 'system'
};

// Captured before `persisted` below writes its initial value to localStorage,
// so it reflects whether the app has ever been opened on this device/browser.
const hadStoredSettings = (() => {
  try {
    return localStorage.getItem('donorSettings') !== null;
  } catch {
    return true;
  }
})();

/** Whether this is the first time the app is opened (no settings persisted yet). */
export const isFirstLaunch = !hadStoredSettings;

export const donorSettings = persisted<DonorSettings>(
  'donorSettings',
  DEFAULT_DONOR_SETTINGS,
  (stored) => ({ ...DEFAULT_DONOR_SETTINGS, ...stored })
);

/** `settings.allowedDonationTypes`, backfilled with `true` for any type missing from it. */
export function getAllowedTypesRecord(settings: DonorSettings): Record<DonationType, boolean> {
  return {
    blood: settings.allowedDonationTypes?.blood ?? true,
    plasma: settings.allowedDonationTypes?.plasma ?? true,
    platelets: settings.allowedDonationTypes?.platelets ?? true
  };
}

/** The donation types this donor can currently give, per `allowedDonationTypes`. */
export function getAllowedTypes(settings: DonorSettings): DonationType[] {
  const allowed = getAllowedTypesRecord(settings);
  return DONATION_TYPES.filter((type) => allowed[type]);
}

import { derived, type Readable } from 'svelte/store';
import { donorSettings } from '../settings/storage';
import { getFlag } from '../flags';
import { fr, type MessageKey } from './fr';
import { en } from './en';
import { nl } from './nl';
import { de } from './de';

/** Locales with a full translation. Add a key here (and its dictionary file,
 * covering every `MessageKey`) to introduce a new language — everything
 * else (the Langue selector, the `system` fallback logic) picks it up
 * automatically. */
export const translations = { fr, en, nl, de } satisfies Record<string, Record<MessageKey, string>>;

export type Locale = keyof typeof translations;

export const AVAILABLE_LOCALES = Object.keys(translations) as Locale[];

/** Display name of each locale, in that locale's own language — used for the Langue selector's options. */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  nl: 'Nederlands',
  de: 'Deutsch'
};

/**
 * ISO 3166-1 alpha-2 of the country whose flag represents each locale in the
 * Langue selector — not always the locale's own "home" country (English ->
 * GB, the Union Jack, not a language-code lookalike).
 */
const LOCALE_FLAG_COUNTRY: Record<Locale, string> = {
  fr: 'FR',
  en: 'GB',
  nl: 'NL',
  de: 'DE'
};

/** Flag emoji shown next to each locale in the Langue selector, derived from `LOCALE_FLAG_COUNTRY` via the same `getFlag` used for the country selector. */
export const LOCALE_FLAGS: Record<Locale, string> = Object.fromEntries(
  (Object.keys(LOCALE_FLAG_COUNTRY) as Locale[]).map((loc) => [loc, getFlag(LOCALE_FLAG_COUNTRY[loc])])
) as Record<Locale, string>;

/**
 * BCP 47 tag used to format dates (`formatDateLabel` in `src/lib/dates.ts`)
 * and any other `Intl`-based rendering for each locale, so date formatting
 * follows the donor's chosen language too (e.g. "11 December 2026" in
 * English rather than "11 décembre 2026").
 */
export const LOCALE_BCP47: Record<Locale, string> = {
  fr: 'fr-BE',
  en: 'en-GB',
  nl: 'nl-NL',
  de: 'de-DE'
};

/** Used both as the initial locale and as the fallback for a key missing from another locale's dictionary. */
export const DEFAULT_LOCALE: Locale = 'fr';

export type LanguagePreference = 'system' | Locale;

function isLocale(value: string): value is Locale {
  return (AVAILABLE_LOCALES as string[]).includes(value);
}

/**
 * Resolves a donor's language preference to an actual `Locale`. `'system'`
 * (and an explicit choice whose translation isn't available, e.g. one added
 * to `LanguagePreference` before its dictionary shipped) follows the
 * browser/OS language (`navigator.language`, e.g. `'nl-BE'` -> `'nl'`) when
 * it's one of `AVAILABLE_LOCALES`, falling back to `DEFAULT_LOCALE`
 * otherwise. `systemLanguage` is only for tests — real callers rely on the
 * `navigator.language` default.
 */
export function resolveLocale(preference: LanguagePreference | undefined, systemLanguage?: string): Locale {
  if (preference && preference !== 'system' && isLocale(preference)) {
    return preference;
  }
  const browserLanguage = systemLanguage ?? (typeof navigator !== 'undefined' ? navigator.language : '');
  const detected = browserLanguage.split('-')[0];
  return isLocale(detected) ? detected : DEFAULT_LOCALE;
}

function interpolate(message: string, vars?: Record<string, string | number>): string {
  if (!vars) return message;
  return message.replace(/\{(\w+)\}/g, (token, name) => (name in vars ? String(vars[name]) : token));
}

/**
 * Translates `key` for `locale`, falling back to `DEFAULT_LOCALE` for a key
 * missing from that locale's dictionary. `key` is typed as `string` rather
 * than `MessageKey` so callers can build it dynamically (e.g.
 * `` `donationTypes.${type}` ``) without fighting template-literal type
 * inference; an unknown key is returned as-is, which is easy to spot in a
 * review or a failing test.
 */
export function translate(key: string, locale: Locale, vars?: Record<string, string | number>): string {
  const dict = translations[locale] ?? translations[DEFAULT_LOCALE];
  const defaultDict = translations[DEFAULT_LOCALE] as Record<string, string>;
  const message = (dict as Record<string, string>)[key] ?? defaultDict[key] ?? key;
  return interpolate(message, vars);
}

/** Reactive current locale, derived from the donor's persisted language preference. */
export const locale: Readable<Locale> = derived(donorSettings, ($settings) => resolveLocale($settings.language));

/** Reactive BCP 47 tag for the current locale — pass to `formatDateLabel`/`Intl` calls. */
export const dateLocale: Readable<string> = derived(locale, ($locale) => LOCALE_BCP47[$locale]);

/** Reactive translate function for Svelte templates: `$t('key')` / `$t('key', { count: 2 })`. */
export const t: Readable<(key: string, vars?: Record<string, string | number>) => string> = derived(
  locale,
  ($locale) =>
    (key: string, vars?: Record<string, string | number>) =>
      translate(key, $locale, vars)
);

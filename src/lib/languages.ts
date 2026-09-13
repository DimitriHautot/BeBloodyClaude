/** Human-readable French names for the 2-letter language codes used in `officialReferences`. */
const LANGUAGE_NAMES: Record<string, string> = {
  de: 'Allemand',
  en: 'Anglais',
  fr: 'Français',
  nl: 'Néerlandais'
};

/** French display name for a 2-letter language code, falling back to the code itself if unknown. */
export function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] ?? code;
}

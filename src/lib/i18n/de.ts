import type { MessageKey } from './fr';

/**
 * German message dictionary. Must cover every `MessageKey` from `fr.ts`
 * (the reference dictionary) — `Record<MessageKey, string>` makes a missing
 * or misspelled key a compile error.
 */
export const de: Record<MessageKey, string> = {
  'donationTypes.blood': 'Vollblut',
  'donationTypes.plasma': 'Plasma',
  'donationTypes.platelets': 'Thrombozyten',

  'common.addDonationOf': 'Spende von {type} hinzufügen',

  'menu.ariaLabel': 'Menü',
  'menu.settings': 'Einstellungen',
  'menu.references': 'Referenzen',
  'menu.about': 'Über',
  'menu.cancel': 'Abbrechen',

  'modal.close': 'Schließen',

  'form.addDonation': 'Spende hinzufügen',
  'form.donationType': 'Spendentyp',
  'form.date': 'Datum',
  'form.submit': 'Hinzufügen',
  'form.dateInFutureError': 'Das Datum einer Spende darf nicht in der Zukunft liegen.',
  'form.ruleViolationError': 'Dieses Datum entspricht nicht den Spenderegeln für {type} ({country}).',

  'list.title': 'Verlauf',
  'list.empty': 'Noch keine Spende erfasst.',
  'list.totalOne': '{count} Spende insgesamt',
  'list.totalMany': '{count} Spenden insgesamt',
  'list.delete': 'Löschen',

  'summary.title': 'Nächste mögliche Spende',
  'summary.now': 'Ab sofort',

  'about.intro1':
    'BeBloody ist eine App, die für Vollblut, Plasma und Thrombozyten das nächste mögliche Spendedatum berechnet — ohne Backend, ohne Konto und ohne Tracking: alle Daten bleiben lokal auf diesem Gerät gespeichert.',
  'about.introBy': 'Diese App ist ein persönliches Projekt, entwickelt von',
  'about.introBy2': 'in seiner Freizeit, mit tatkräftiger Unterstützung von',
  'about.intro2': 'Während der Entwicklung erfolgt keine Validierung durch eine offizielle Stelle.',
  'about.intro3a': 'Dennoch basieren die Berechnungen auf online veröffentlichten Regeln',
  'about.intro3link': 'siehe die offiziellen Referenzen',
  'about.intro3b':
    'Trotzdem können die erzielten Ergebnisse von denen einer offiziellen Stelle abweichen. Diese können aufgrund ihrer Fachkenntnis und ihres Zugangs zu detaillierteren Daten genauer sein.',
  'about.intro4':
    'Die App wird "wie besehen" ohne jegliche Gewährleistung bereitgestellt. Dimitri Hautot haftet in keinem Fall für direkte oder indirekte Schäden, einschließlich besonderer, Folge-, Neben- oder Strafschäden, die sich aus der Nutzung der App ergeben.',
  'about.disclaimerBold':
    'Die Installation und Nutzung der App setzt die vollständige Zustimmung zu diesem Haftungsausschluss voraus.',
  'about.contact': 'Kontakt',
  'about.sourceCode': 'Quellcode',

  'references.intro1':
    'Diese App wurde von einer belgischen Privatperson entwickelt, um einem Bedürfnis zu entsprechen, das er seit mehreren Jahren hatte.',
  'references.intro2a': 'Sie wird',
  'references.intro2bold': 'in keiner Weise',
  'references.intro2b': 'von einer offiziellen staatlichen Stelle gesponsert oder auch nur überprüft.',
  'references.intro3':
    'Sie wurde jedoch anhand offizieller, unten aufgeführter Regeln für jedes Land entwickelt.',

  'settings.country': 'Land (geltende Regeln)',
  'settings.sex': 'Geschlecht',
  'settings.male': 'Mann',
  'settings.female': 'Frau',
  'settings.language': 'Sprache',
  'settings.languageSystem': 'System',
  'settings.theme': 'Design',
  'settings.themeSystem': '☀️ System 🌙',
  'settings.themeLight': '☀️ Hell',
  'settings.themeDark': '🌙 Dunkel',
  'settings.allowedTypes': 'Mögliche Spendentypen',
  'settings.highlightUpcoming': 'Bald mögliche Spenden hervorheben',
  'settings.highlightUpcomingDays': 'Anzahl Tage vor der möglichen Spende',
  'settings.debugMode': 'Debug-Modus'
};

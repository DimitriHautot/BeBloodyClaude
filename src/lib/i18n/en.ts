import type { MessageKey } from './fr';

/**
 * English message dictionary. Must cover every `MessageKey` from `fr.ts`
 * (the reference dictionary) — `Record<MessageKey, string>` makes a missing
 * or misspelled key a compile error.
 */
export const en: Record<MessageKey, string> = {
  'donationTypes.blood': 'Whole blood',
  'donationTypes.plasma': 'Plasma',
  'donationTypes.platelets': 'Platelets',

  'common.addDonationOf': 'Add a {type} donation',

  'menu.ariaLabel': 'Menu',
  'menu.settings': 'Settings',
  'menu.references': 'References',
  'menu.about': 'About',
  'menu.cancel': 'Cancel',

  'modal.close': 'Close',

  'form.addDonation': 'Add a donation',
  'form.donationType': 'Donation type',
  'form.date': 'Date',
  'form.submit': 'Add',
  'form.dateInFutureError': "A donation's date cannot be in the future.",
  'form.ruleViolationError': 'This date does not meet the donation rules for {type} ({country}).',

  'list.title': 'History',
  'list.empty': 'No donation recorded yet.',
  'list.totalOne': '{count} donation in total',
  'list.totalMany': '{count} donations in total',
  'list.delete': 'Delete',

  'summary.title': 'Next possible donation',
  'summary.now': 'Right now',

  'about.intro1':
    'BeBloody is an app that calculates, for whole blood, plasma and platelets, the next date a donation is possible — with no backend, no account, and no tracking: all data stays stored locally on this device.',
  'about.introBy': 'This app is a personal project, developed by',
  'about.introBy2': 'in his spare time, with the help of',
  'about.intro2': 'No validation by an official body is carried out during development.',
  'about.intro3a': 'That said, the calculations are modeled using rules published online',
  'about.intro3link': 'see the official references',
  'about.intro3b':
    'Even so, the results obtained may not always match those from an official body, which can be more accurate thanks to their expertise and access to more detailed data.',
  'about.intro4':
    'The app is provided "as is" without warranty of any kind. Dimitri Hautot shall not be liable for any direct or indirect damages, including special, consequential, incidental or punitive damages, resulting from the use of the app.',
  'about.disclaimerBold': 'Installing and using the app implies full acceptance of this disclaimer.',
  'about.contact': 'Contact',
  'about.sourceCode': 'Source code',

  'references.intro1':
    'This app was developed by a private individual from Belgium to address a need he had been facing for several years.',
  'references.intro2a': 'It is',
  'references.intro2bold': 'in no way',
  'references.intro2b': 'sponsored or even reviewed by any official state body.',
  'references.intro3': 'However, it was developed using official rules for each country, listed below.',

  'settings.country': 'Country (applicable rules)',
  'settings.sex': 'Sex',
  'settings.male': 'Male',
  'settings.female': 'Female',
  'settings.language': 'Language',
  'settings.languageSystem': 'System',
  'settings.theme': 'Theme',
  'settings.themeSystem': '☀️ System 🌙',
  'settings.themeLight': '☀️ Light',
  'settings.themeDark': '🌙 Dark',
  'settings.allowedTypes': 'Possible donation types',
  'settings.highlightUpcoming': 'Highlight donations coming up soon',
  'settings.highlightUpcomingDays': 'Number of days before the donation is possible',
  'settings.debugMode': 'Debug mode'
};

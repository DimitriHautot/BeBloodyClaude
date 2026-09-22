import type { MessageKey } from './fr';

/**
 * Dutch message dictionary. Must cover every `MessageKey` from `fr.ts`
 * (the reference dictionary) — `Record<MessageKey, string>` makes a missing
 * or misspelled key a compile error.
 */
export const nl: Record<MessageKey, string> = {
  'donationTypes.blood': 'Volbloed',
  'donationTypes.plasma': 'Plasma',
  'donationTypes.platelets': 'Bloedplaatjes',

  'common.addDonationOf': 'Donatie van {type} toevoegen',

  'menu.ariaLabel': 'Menu',
  'menu.settings': 'Instellingen',
  'menu.references': 'Referenties',
  'menu.about': 'Over',
  'menu.cancel': 'Annuleren',

  'modal.close': 'Sluiten',

  'form.addDonation': 'Donatie toevoegen',
  'form.donationType': 'Type donatie',
  'form.date': 'Datum',
  'form.submit': 'Toevoegen',
  'form.dateInFutureError': 'De datum van een donatie mag niet in de toekomst liggen.',
  'form.ruleViolationError': 'Deze datum voldoet niet aan de donatieregels voor {type} ({country}).',

  'list.title': 'Geschiedenis',
  'list.empty': 'Nog geen donatie geregistreerd.',
  'list.totalOne': '{count} donatie in totaal',
  'list.totalMany': '{count} donaties in totaal',
  'list.delete': 'Verwijderen',

  'summary.title': 'Eerstvolgende mogelijke donatie',
  'summary.now': 'Nu al mogelijk',

  'about.intro1':
    'BeBloody is een app die voor volbloed, plasma en bloedplaatjes de eerstvolgende datum berekent waarop een donatie mogelijk is — zonder backend, zonder account en zonder tracking: alle gegevens blijven lokaal op dit toestel opgeslagen.',
  'about.introBy': 'Deze app is een persoonlijk initiatief, ontwikkeld door',
  'about.introBy2': 'in zijn vrije tijd, met hulp van',
  'about.intro2': 'Er vindt tijdens de ontwikkeling geen validatie door een officiële instantie plaats.',
  'about.intro3a': 'De berekeningen zijn echter gemodelleerd op basis van online gepubliceerde regels',
  'about.intro3link': 'zie de officiële referenties',
  'about.intro3b':
    'Toch is het mogelijk dat de verkregen resultaten niet altijd overeenkomen met die van een officiële instantie. Deze kunnen nauwkeuriger zijn dankzij hun expertise en toegang tot meer gedetailleerde gegevens.',
  'about.intro4':
    'De app wordt geleverd "zoals ze is", zonder enige garantie. Dimitri Hautot is in geen geval aansprakelijk voor directe of indirecte schade, met inbegrip van bijzondere, gevolg-, incidentele of punitieve schade, voortvloeiend uit het gebruik van de app.',
  'about.disclaimerBold':
    'Het installeren en gebruiken van de app impliceert volledige aanvaarding van deze disclaimer.',
  'about.contact': 'Contact',
  'about.sourceCode': 'Broncode',

  'references.intro1':
    'Deze app werd ontwikkeld door een Belgische particulier om te voorzien in een behoefte waarmee hij al jaren te maken had.',
  'references.intro2a': 'Ze wordt',
  'references.intro2bold': 'op geen enkele wijze',
  'references.intro2b': 'gesponsord of zelfs herzien door een officiële overheidsinstantie.',
  'references.intro3':
    'Ze werd echter ontwikkeld op basis van officiële regels voor elk land, hieronder opgesomd.',

  'settings.country': 'Land (toepasselijke regels)',
  'settings.sex': 'Geslacht',
  'settings.male': 'Man',
  'settings.female': 'Vrouw',
  'settings.language': 'Taal',
  'settings.languageSystem': 'Systeem',
  'settings.theme': 'Thema',
  'settings.themeSystem': '☀️ Systeem 🌙',
  'settings.themeLight': '☀️ Licht',
  'settings.themeDark': '🌙 Donker',
  'settings.allowedTypes': 'Mogelijke donatietypes',
  'settings.highlightUpcoming': 'Binnenkort mogelijke donaties markeren',
  'settings.highlightUpcomingDays': 'Aantal dagen voor de donatie mogelijk is',
  'settings.debugMode': 'Debugmodus',

  'update.available': 'Nieuwe versie beschikbaar',
  'update.reload': 'Herladen'
};

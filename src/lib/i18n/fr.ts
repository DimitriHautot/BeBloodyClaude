/**
 * French message dictionary — the app's default language and the fallback
 * used for any key missing from another locale (see `translate` in
 * `./index.ts`). Every other locale's dictionary must cover the same keys.
 */
export const fr = {
  'donationTypes.blood': 'Sang total',
  'donationTypes.plasma': 'Plasma',
  'donationTypes.platelets': 'Plaquettes',

  'common.addDonationOf': 'Ajouter un don de {type}',

  'menu.ariaLabel': 'Menu',
  'menu.settings': 'Paramètres',
  'menu.references': 'Références',
  'menu.about': 'À propos',
  'menu.cancel': 'Annuler',

  'modal.close': 'Fermer',

  'form.addDonation': 'Ajouter un don',
  'form.donationType': 'Type de don',
  'form.date': 'Date',
  'form.submit': 'Ajouter',
  'form.dateInFutureError': "La date d'un don ne peut pas être dans le futur.",
  'form.ruleViolationError': 'Cette date ne respecte pas les règles de don pour {type} ({country}).',

  'list.title': 'Historique',
  'list.empty': "Aucun don enregistré pour l'instant.",
  'list.totalOne': '{count} don au total',
  'list.totalMany': '{count} dons au total',
  'list.delete': 'Supprimer',

  'summary.title': 'Prochain don possible',
  'summary.now': 'Dès maintenant',

  'about.intro1':
    "BeBloody est une application qui calcule, pour le sang total, le plasma et les plaquettes, la prochaine date à laquelle un don est possible — sans backend, sans compte, ni traçage : toutes les données restent stockées localement sur cet appareil.",
  'about.introBy': 'Cette application est une initiative personnelle, développée par',
  'about.introBy2': 'dans son temps libre, bien aidé par',
  'about.intro2': "Aucune validation par un organisme officiel n'est effectuée lors du processus de développement.",
  'about.intro3a': 'Toutefois, les calculs sont modélisés en utilisant des règles publiées sur Internet',
  'about.intro3link': 'voir les références officielles',
  'about.intro3b':
    "Malgré cela, il est possible que les résultats obtenus ne soient pas toujours identiques à ceux obtenus via un organisme officiel. Ces derniers peuvent être plus précis en raison de leur expertise et de leur accès à des données plus détaillées.",
  'about.intro4':
    'L\'application est fournie "telle quelle" sans garantie de quelque nature que ce soit. Dimitri Hautot ne sera en aucun cas responsable des dommages directs ou indirects, y compris les dommages spéciaux, consécutifs, accessoires ou punitifs, résultant de l\'utilisation de l\'application.',
  'about.disclaimerBold':
    "L'installation et l'utilisation de l'application impliquent l'adhésion totale à cette clause de non-responsabilité.",
  'about.contact': 'Contact',
  'about.sourceCode': 'Code source',

  'references.intro1':
    "Cette application a été développée par un particulier belge pour répondre à un besoin qu'il rencontrait depuis plusieurs années.",
  'references.intro2a': "Elle n'est",
  'references.intro2bold': 'en aucun cas',
  'references.intro2b': 'sponsorisée ou même revue par une quelconque instance officielle étatique.',
  'references.intro3':
    'Cependant, elle a été développée en utilisant des règles officielles pour chaque pays, listées ci-dessous.',

  'settings.country': 'Pays (règles applicables)',
  'settings.sex': 'Sexe',
  'settings.male': 'Homme',
  'settings.female': 'Femme',
  'settings.language': 'Langue',
  'settings.languageSystem': 'Système',
  'settings.theme': 'Thème',
  'settings.themeSystem': '☀️ Système 🌙',
  'settings.themeLight': '☀️ Clair',
  'settings.themeDark': '🌙 Sombre',
  'settings.allowedTypes': 'Types de dons possibles',
  'settings.highlightUpcoming': 'Mise en évidence des dons bientôt possibles',
  'settings.highlightUpcomingDays': 'Nombre de jours avant le don possible',
  'settings.debugMode': 'Mode debug'
} satisfies Record<string, string>;

export type MessageKey = keyof typeof fr;

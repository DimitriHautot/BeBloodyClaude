# Changelog

Historique des changements fusionnés dans `main`, du plus récent au plus
ancien. Voir la skill `changelog-entry`
(`.claude/skills/changelog-entry/SKILL.md`) pour la convention de mise à
jour de ce fichier.

## Non publié

- Ajout du support multi-langues (étape 1/3) : infrastructure i18n maison
  (dictionnaire de textes, pas de librairie externe) et réglage "Langue"
  (Système / 🇫🇷 Français, drapeau par langue via `getFlag()`) dans
  Paramètres ; tous les textes de l'interface passent désormais par ce
  dictionnaire. L'anglais et le néerlandais suivront chacun dans leur
  propre PR (`5dbcc6e`)
- Ajout du support multi-langues (étape 2/3) : traduction anglaise
  (🇬🇧 English dans le réglage Langue, "Système" peut désormais résoudre
  vers l'anglais) ; inclut aussi le correctif faisant suivre le formatage
  des dates à la langue choisie (store `dateLocale`), les dates restaient
  sinon en français même en anglais. Le néerlandais suivra dans sa propre
  PR (`07e0574`)
- Ajout du support multi-langues (étape 3/3) : traduction néerlandaise
  (🇳🇱 Nederlands dans le réglage Langue, "Système" peut désormais résoudre
  vers le néerlandais, dates au format `nl-NL`) (`bd64234`)
- Ajout d'écrans de lancement iOS sombres (variante `-dark` par taille
  d'écran, même icône, fond `--color-bg-night`) : ne peut suivre que
  l'apparence système, jamais le réglage Système/Clair/Sombre de l'app,
  car dessiné par iOS avant le chargement de la page — dernière feature du
  plan thème sombre (`9043098`)
- La couleur de la barre d'état/chrome mobile (`theme-color`) suit
  désormais le thème réellement affiché (système, ou l'override
  Clair/Sombre), y compris en direct si le système change pendant que
  l'app est ouverte — dernier point du plan natif resté en suspens
  (`adf2d7c`)
- Ajout d'un réglage "Thème" (☀️🌙 Système / ☀️ Clair / 🌙 Sombre) dans
  Paramètres pour forcer le thème plutôt que de suivre uniquement le
  système, sans flash du mauvais thème au chargement (`8da6a91`)
- Ajout d'un thème sombre suivant automatiquement le réglage système
  (`prefers-color-scheme`), sans réglage manuel pour l'instant : la
  palette de couleurs était déjà centralisée en variables CSS, donc
  aucun composant n'a eu besoin d'être modifié individuellement
  (`d8b8121`)
- Correction d'un off-by-one dans le calcul du quota annuel glissant
  (Belgique et France) : le quota faisait patienter le donneur un jour de
  trop lorsqu'il était la contrainte déterminante (plutôt qu'un délai de
  récupération entre deux dons) (`6bd3446`)
- Léger retour haptique Android à l'ajout réussi d'un don (formulaire
  complet et raccourci rapide "+"), ignoré silencieusement sur les
  plateformes qui ne le supportent pas (iOS, desktop) (`e4fe7d5`)
- Ajout d'écrans de lancement ("splash screens") iOS pour l'app installée
  ("Ajouter à l'écran d'accueil") : fond blanc + icône rouge centrée, comme
  ce qu'Android synthétise déjà tout seul (`9b4167e`)
- Correction de la suite de tests e2e, tombée à ~6/34 à cause d'un
  sélecteur `.dialog` obsolète (jamais existant sur le composant
  `BottomSheet.svelte` réellement utilisé) plus 3 échecs distincts sans
  rapport avec un sélecteur — suite complète verte (34/34) (`9e1aaf4`)
- Le bouton retour matériel Android (et le geste de retour de Chrome)
  ferme désormais la sheet ouverte (menu ou modale) au lieu de quitter
  l'app (`0f7eb2c`)
- Extraction des règles de don, icônes PWA et journal des changements
  d'`AGENTS.md` vers des skills chargées à la demande (`donation-rules`,
  `pwa-icons`, `changelog-entry`) et ajout d'un hook de rappel post-fusion
  (`b7a9bcc`)
- Documentation de la skill `verification` dans AGENTS.md (`ea48709`)
- Ajout du hash de commit dans `buildInfo` (footer + console `dev`/`build`)
  et création de ce journal des changements (`e4b53b4`)
- Ajout d'une modale "À propos" (description, contact, code source, lien
  vers les références officielles) (`9c78e7c`)
- Ajout d'un `README.md` minimal pour les développeurs (`1438b4b`)
- Correction de la modale "À propos"/"Références" impossible à fermer en
  PWA installée sur iOS Safari (titre/croix invisibles), et du rebond
  élastique de la page derrière la feuille pendant son ouverture (`d956291`)

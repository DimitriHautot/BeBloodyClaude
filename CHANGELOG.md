# Changelog

Historique des changements fusionnés dans `main`, du plus récent au plus
ancien. Voir la skill `changelog-entry`
(`.claude/skills/changelog-entry/SKILL.md`) pour la convention de mise à
jour de ce fichier.

## Non publié

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

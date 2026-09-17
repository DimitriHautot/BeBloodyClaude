# Changelog

Historique des changements fusionnés dans `main`, du plus récent au plus
ancien. Voir la skill `changelog-entry`
(`.claude/skills/changelog-entry/SKILL.md`) pour la convention de mise à
jour de ce fichier.

## Non publié

- Extraction des règles de don, icônes PWA et journal des changements
  d'`AGENTS.md` vers des skills chargées à la demande (`donation-rules`,
  `pwa-icons`, `changelog-entry`) et ajout d'un hook de rappel post-fusion
  (`b7a9bcc`)
- Ajout du hash de commit dans `buildInfo` (footer + console `dev`/`build`)
  et création de ce journal des changements (`e4b53b4`)
- Ajout d'une modale "À propos" (description, contact, code source, lien
  vers les références officielles) (`9c78e7c`)
- Ajout d'un `README.md` minimal pour les développeurs (`1438b4b`)
- Correction de la modale "À propos"/"Références" impossible à fermer en
  PWA installée sur iOS Safari (titre/croix invisibles), et du rebond
  élastique de la page derrière la feuille pendant son ouverture (`d956291`)

#!/usr/bin/env bash
# PostToolUse hook: fires right after a PR gets merged (mcp__github__merge_pull_request).
# Reminds the agent to add the CHANGELOG.md entry with the real squashed hash,
# per AGENTS.md's "Convention de branches Git" exception, before doing anything
# else on main.
echo "Rappel : la PR vient d'être fusionnée. Charge la skill \`changelog-entry\` et ajoute l'entrée CHANGELOG.md (avec le hash squashé réel) avant tout autre commit sur main."

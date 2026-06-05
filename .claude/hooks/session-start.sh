#!/bin/bash
set -euo pipefail

# Decode CODEX_AUTH_JSON env var → ~/.codex/auth.json
# Set CODEX_AUTH_JSON in your Claude Code environment settings (base64-encoded auth.json)
if [ -n "${CODEX_AUTH_JSON:-}" ]; then
  mkdir -p ~/.codex
  echo "$CODEX_AUTH_JSON" | base64 -d > ~/.codex/auth.json
  chmod 600 ~/.codex/auth.json
  echo "codex auth.json restored from CODEX_AUTH_JSON"
else
  echo "CODEX_AUTH_JSON not set — skipping codex auth restore"
fi

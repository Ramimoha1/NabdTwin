#!/usr/bin/env bash
# Helper: untrack local artifacts and commit .gitignore
set -euo pipefail
ROOT=$(git rev-parse --show-toplevel)
cd "$ROOT"

echo "Untracking .venv, .idea, and .env (if present)"
git rm --cached -r .venv || true
git rm --cached -r .idea || true
git rm --cached .env || true

git add .gitignore || true

git commit -m "chore: ignore local env, venv, IDE and build artifacts" || true

echo "Done. If you need to purge history, see CLEANUP.md for git-filter-repo steps." 

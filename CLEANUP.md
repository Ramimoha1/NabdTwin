# Repository Cleanup Guide

This guide contains safe steps to clean local artifacts, untrack sensitive files, and optionally rewrite git history to remove secrets.

1) Ensure you have a backup and coordinate with collaborators before rewriting history.

2) Untrack local files (run from repository root):

```bash
# Remove from git index but keep locally
git rm --cached -r .venv || true
git rm --cached -r .idea || true
git rm --cached .env || true

# Commit the .gitignore change so these files are no longer tracked
git add .gitignore
git commit -m "chore: ignore local env, venv, IDE and build artifacts"
```

3) If secrets were previously committed and you need to purge them from history, use `git-filter-repo` (recommended) or `git filter-branch`.

Example (rewrite history to remove any file named `.env`):

```bash
# Install: pip install git-filter-repo
git filter-repo --invert-paths --paths .env

# After rewrite, force-push to remote (coordinate with team):
git push --force --all
git push --force --tags
```

4) Run garbage collection locally:

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

5) Rotate any secrets that may have been exposed.

6) If you want, run the `scripts/cleanup-git.sh` helper added in this repo.

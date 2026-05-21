# Nabd Twin — Backend: Environment & Run Instructions

This document contains the minimal, exact steps needed to run the Nabd Twin backend locally and the essential related tasks (email setup, data population, and basic API tests).

Prerequisites
- Node.js 18+ and npm
- (Optional) PostgreSQL for production; the project runs with SQLite for quick local testing

1) Repo-level environment
- Copy the example env and edit required values (do NOT commit real values).

```bash
# From the repository root run:
cp .env.example .env
# Edit .env: set DATABASE_*, SMTP_*, VITE_*, GEMINI_API_KEY, etc.
```

2) Install and run backend

```bash
cd app/backend/be-nabdtwin-strapi
npm install
npm run develop
```

Default backend URL: http://localhost:3001

Note: If binding to port 1337 or `0.0.0.0` causes permission or port conflicts on your machine, set `HOST=127.0.0.1` and `PORT=3001` in the repo root `.env` before starting Strapi. This forces Strapi to bind to localhost only and avoids conflicts with system services (e.g., device SDKs).

3) Email quick setup (development)
- For Gmail: enable 2-Step Verification and create an App Password (https://myaccount.google.com/apppasswords)
- Add SMTP values to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=you@example.com
SMTP_PASSWORD=APP_PASSWORD_HERE
SMTP_DEFAULT_FROM=you@example.com
SMTP_DEFAULT_REPLY_TO=support@example.com
FRONTEND_URL=http://localhost:5174
```

4) Populate sample data (optional)

There are several helper scripts in `app/backend/be-nabdtwin-strapi` to populate or wipe development data. Only run these on local or disposable environments.

- Populate a small set of sample employees (safe for quick UI testing):

```bash
cd app/backend/be-nabdtwin-strapi
node populate-with-employees.js
```

- Full populate: inserts more extensive seed data used for demos or manual testing:

```bash
cd app/backend/be-nabdtwin-strapi
node populate.js
```

- Skip population: simply don't run the scripts — Strapi will start with an empty DB.

- Nuke / truncate the database (destructive):

```bash
cd app/backend/be-nabdtwin-strapi
# WARNING: removes development data. Use only on local/dev environments.
node nuke-database.js
# or use a lighter truncate option if available
node truncate-db.js
```

Notes:
- These scripts operate directly against the configured database. Back up any important data before running the nuke script.
- If your `.env` points to a production database, DO NOT run the nuke or full populate scripts.


5) Run basic API tests (optional)

```bash
node test-employee-api.js
```

6) Notes & Security
- Keep secrets out of git. Use `.env.example` for tracked placeholders.
- If you ever rewrite git history, rotate secrets that were previously exposed.
- The backend loads the repo root `.env` early to make `process.env` available for Strapi configs.

7) Related documentation
- Employee API implementation: `app/docs/backend/EMPLOYEE-DETAIL-API.md`
- Email configuration and troubleshooting: consolidated in this document (see the "Email quick setup" section above)

---

Last updated: 2026-05-17

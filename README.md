# Nabd Twin

Nabd Twin is a workforce management and 3D visualization platform that combines a Strapi backend with a React/Vite frontend to manage branches, employees, and floor visualizations. It provides role-based access, KPI dashboards, automated email notifications, Google Maps integration, and an AI advisory service for operational insights.

**Run Locally**

- **Prerequisites:** Node.js 18+, npm, (Postgres optional; Strapi can run with sqlite for quick testing).
- **Create env:** copy the repo example and edit values: [.env.example](.env.example)

```bash
cp .env.example .env
# Edit .env with real values (map keys, GEMINI_API_KEY, SMTP, DB)
```

**Backend (Strapi)**

```bash
cd app/backend/be-nabdtwin-strapi
npm install
npm run develop
```

Backend default: http://localhost:3001

**Frontend (Vite + React)**

```bash
cd app/frontend/fe-nabdtwinapp
npm install
npm run dev
```

Frontend default: http://localhost:5174

**Notes:** the repo root `.env` is used by both apps. Do not commit `.env` — use `.env.example` for placeholders.

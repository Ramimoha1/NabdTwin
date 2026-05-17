<!-- Moved from app/backend/be-nabdtwin-strapi/EMPLOYEE-DETAIL-API.md -->
# Employee Detail API Implementation Guide

This document explains the Employee Detail API endpoints, data population script, and how the frontend consumes the transformed data. It is identical to the original implementation guide but relocated for central project documentation.

See the original source under `app/backend/be-nabdtwin-strapi/src/api/employee-detail-api` for controllers, services and routes.

## Quick start

1. Ensure backend is running (`npm run develop`)
2. Populate data: `node populate-with-employees.js`
3. Test endpoints: `node test-employee-api.js`

## Endpoints
- `GET /api/employee/details/:id` — returns a single employee transformed for frontend usage
- `GET /api/employees/by-branch/:branchId` — returns employees for a branch

## Notes
- The controller flattens relations (department, team, supervisor) into simple fields the frontend expects.
- If relationships are missing, re-run the populate script.

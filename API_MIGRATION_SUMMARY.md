# API Migration: Mock Data to Real Backend

## Overview
Migrated the frontend from mock data to real API calls to your Strapi backend. All branch details (employees, teams, departments) are now fetched from the backend instead of hardcoded mock data.

---

## Backend Changes (Strapi)

### 1. New Custom Endpoint Created
**File:** `src/api/branch/controllers/branch.ts`

**Endpoint:** `GET /api/branches/:branchId/details`

**Functionality:**
- Fetches branch data with latest KPIs
- Fetches all employees for the branch with their departments, teams, and KPIs
- Fetches all teams with department associations and KPIs
- Fetches all departments with employee/team counts and KPIs
- Transforms database schema to match frontend interface requirements

**Response Format:**
```json
{
  "branch": {
    "id": "uuid",
    "name": "Branch Name",
    "location": {
      "address": "...",
      "city": "...",
      "country": "...",
      "latitude": 0,
      "longitude": 0
    },
    "kpis": {
      "revenue": 0,
      "growth": 0,
      "satisfaction": 0,
      "productivity": 0
    }
  },
  "employees": [...],
  "teams": [...],
  "departments": [...]
}
```

### 2. Route Configuration Updated
**File:** `src/api/branch/routes/branch.ts`

- Added custom route for `/branches/:branchId/details`
- Route requires authentication
- Properly configured with core routers

---

## Frontend Changes

### 1. Updated API Service
**File:** `src/services/API/detailsApi.ts`

**Changes:**
- Removed all mock data arrays
- Replaced with real API calls using axios instance
- Added `getBranchDetails()` function that calls the new backend endpoint
- Updated `getEmployeesByBranch()`, `getTeamsByBranch()`, `getDepartmentsByBranch()`
- Added proper Strapi response transformation (handles `data.attributes` structure)
- Includes fallback error handling

**Key Functions:**
```typescript
// Primary function - fetches everything in one call
export const getBranchDetails = async (branchId: string): Promise<BranchDetailsResponse>

// Individual fetch functions (for flexibility)
export const getEmployeesByBranch = async (branchId: string): Promise<EmployeeDetail[]>
export const getTeamsByBranch = async (branchId: string): Promise<TeamData[]>
export const getDepartmentsByBranch = async (branchId: string): Promise<DepartmentData[]>
```

### 2. Updated Hook
**File:** `src/hooks/useBranchData.ts`

**Changes:**
- Now uses single `getBranchDetails()` call instead of 4 separate calls
- More efficient - reduces API requests and network overhead
- Properly transforms API response to local types
- Better error handling with toast notifications

---

## Data Transformation

The backend transforms database columns to match frontend interfaces:

| Backend Column | Frontend Property | Example |
|---|---|---|
| `first_name` | `firstName` | "Ahmed" |
| `last_name` | `lastName` | "Hassan" |
| `job_title` | `role` | "Senior Developer" |
| `department.name` | `department` | "Engineering" |
| `team.name` | `team` | "Backend Team" |
| `kpis[0].performance_score` | `kpis.performanceScore` | 92 |

---

## Strapi Database Schema Used

- `employees` table: Contains all employee data
- `departments` table: Organizational structure
- `teams` table: Team groupings within departments
- `branch_kpis`, `employee_kpis`, `team_kpis`, `department_kpis`: KPI data (latest entry used)

---

## How It Works

1. **User navigates to DetailPage** with a `branchId`
2. **useBranchData hook** calls `getBranchDetails(branchId)`
3. **Backend endpoint** receives request and:
   - Queries branch with latest KPIs
   - Queries all employees, teams, departments for that branch
   - Transforms all data to match frontend interface
4. **Frontend receives** combined response with all data
5. **Components render** with real data

---

## Error Handling

- API calls include try/catch blocks
- Falls back to empty arrays on error
- Toast notifications show user-friendly error messages
- Console logging for debugging

---

## Benefits

✅ **Single API call** instead of 4 (improved performance)  
✅ **Real data** from database instead of hardcoded mock data  
✅ **Proper transformation** between Strapi format and frontend interface  
✅ **Scalable** - ready for pagination, filtering, sorting on backend  
✅ **Type-safe** - all TypeScript interfaces properly defined  
✅ **Error handling** - graceful failures with user feedback

---

## Next Steps

1. **Ensure Strapi running:** Start your Strapi backend
2. **Test the endpoint:** Call `GET http://localhost:1337/api/branches/:branchId/details`
3. **Populate data:** Ensure database has sample data
4. **Run frontend:** npm run dev
5. **Navigate to DetailPage:** Should load real data from backend

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/branches/:branchId/details` | Get all branch details (employees, teams, departments) |
| GET | `/api/employees` | Get employees (filtered by branch) |
| GET | `/api/teams` | Get teams (filtered by branch) |
| GET | `/api/departments` | Get departments (filtered by branch) |


# Floor Plan Editor - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐         ┌─────────────────────────┐    │
│  │   Sidebar.tsx       │         │  MainLayout.tsx         │    │
│  │  ┌───────────────┐  │         │                         │    │
│  │  │Edit           │  │────────▶│  <Outlet />             │    │
│  │  │Visualization  │  │         │                         │    │
│  │  └───────────────┘  │         └─────────────────────────┘    │
│  └─────────────────────┘                      │                 │
│                                                │                 │
│                                                ▼                 │
│         ┌───────────────────────────────────────────────┐       │
│         │    EditVisualizationPage.tsx                  │       │
│         ├───────────────────────────────────────────────┤       │
│         │  • Branch Selector (GET /api/branches)        │       │
│         │  • Floor List (GET /api/floors?filters[...])  │       │
│         │  • Add Floor (POST /api/floors)               │       │
│         │  • Delete Floor (DELETE /api/floors/:id)      │       │
│         └───────────────────────────────────────────────┘       │
│                                │                                 │
│                                │ Click "Edit Floor Plan"         │
│                                ▼                                 │
│         ┌───────────────────────────────────────────────┐       │
│         │    FloorPlanEditorPage.tsx                    │       │
│         ├───────────────────────────────────────────────┤       │
│         │  • Load Employees (GET /api/employees/...)    │       │
│         │  • Load Floor Data (GET /api/floors/:id)      │       │
│         │  • Save Floor (PUT /api/floors/:id)           │       │
│         │  • PostMessage Communication                  │       │
│         │                                               │       │
│         │  ┌─────────────────────────────────────────┐ │       │
│         │  │  <iframe src="/blueprint-editor/">      │ │       │
│         │  │                                         │ │       │
│         │  │     ┌───────────────────────────┐      │ │       │
│         │  │     │  Blueprint3D Editor       │      │ │       │
│         │  │     │  (index.html)             │      │ │       │
│         │  │     │                           │      │ │       │
│         │  │     │  • Floorplan Canvas       │      │ │       │
│         │  │     │  • 3D Viewer              │      │ │       │
│         │  │     │  • Item Catalog           │      │ │       │
│         │  │     │  • Employee Dropdown      │      │ │       │
│         │  │     │  • example.js (modified)  │      │ │       │
│         │  │     └───────────────────────────┘      │ │       │
│         │  │                                         │ │       │
│         │  └─────────────────────────────────────────┘ │       │
│         └───────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP + JWT
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Strapi)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │  Branch API      │    │  Employee API    │                   │
│  │  /api/branches   │    │  /api/employees  │                   │
│  └──────────────────┘    └──────────────────┘                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Floor API                                           │       │
│  │  /api/floors                                        │       │
│  │                                                      │       │
│  │  • GET    ?filters[branch][id][$eq]={id}           │       │
│  │  • GET    /:id                                      │       │
│  │  • POST   /                                         │       │
│  │  • PUT    /:id                                      │       │
│  │  • DELETE /:id                                      │       │
│  └──────────────────────────────────────────────────────┘       │
│                                  │                                │
└──────────────────────────────────┼────────────────────────────────┘
                                  │
                                  ▼
              ┌───────────────────────────────────┐
              │      PostgreSQL Database          │
              ├───────────────────────────────────┤
              │                                   │
              │  branches                         │
              │  ├─ id                            │
              │  ├─ name                          │
              │  └─ location                      │
              │                                   │
              │  floors                           │
              │  ├─ id                            │
              │  ├─ name                          │
              │  ├─ floorNumber                   │
              │  ├─ description                   │
              │  ├─ branch (FK)                   │
              │  └─ floors (JSON) ◄── Blueprint   │
              │                        Data       │
              │  employees                        │
              │  ├─ id                            │
              │  ├─ firstName                     │
              │  ├─ lastName                      │
              │  ├─ jobTitle                      │
              │  └─ branch (FK)                   │
              │                                   │
              └───────────────────────────────────┘
```

## Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Interaction Flow                        │
└─────────────────────────────────────────────────────────────────┘

1. Admin Login
   │
   ├─→ Navigate to Sidebar
   │   └─→ Click "Edit Visualization"
   │
2. EditVisualizationPage loads
   │
   ├─→ Fetch Branches (GET /api/branches)
   │   └─→ Populate dropdown
   │
   ├─→ Select Branch
   │   └─→ Fetch Floors (GET /api/floors?filters[...])
   │       └─→ Display floor list
   │
   ├─→ Option A: Create New Floor
   │   │
   │   ├─→ Click "Add Floor"
   │   ├─→ Fill form (name, number, description)
   │   └─→ Submit (POST /api/floors)
   │       └─→ Floor list refreshes
   │
   └─→ Option B: Edit Existing Floor
       │
       └─→ Click "Edit Floor Plan"
           │
3. FloorPlanEditorPage loads
   │
   ├─→ Load Employees (GET /api/employees/branch/:id)
   │
   ├─→ Load Floor Data (GET /api/floors/:id)
   │
   ├─→ Render iframe with Blueprint Editor
   │
   └─→ Send PostMessage: INIT_DATA
       │
4. Blueprint Editor receives data
   │
   ├─→ Load floor plan (if exists)
   │
   ├─→ Populate employee dropdown
   │
   └─→ Ready for editing
       │
5. User edits floor plan
   │
   ├─→ Draw walls (Floorplan tab)
   │
   ├─→ Add furniture (Design tab)
   │
   ├─→ Add employee model (Add Items tab)
   │   │
   │   └─→ Click employee model
   │       │
   │       └─→ Employee dropdown appears
   │           │
   │           └─→ Select employee
   │               │
   │               └─→ employeeId saved to item metadata
   │
   └─→ Click "Save Floor Plan"
       │
6. Save process
   │
   ├─→ React triggers save (PostMessage: TRIGGER_SAVE)
   │
   ├─→ Editor exports data (PostMessage: REQUEST_SAVE)
   │
   ├─→ React receives data
   │
   └─→ Save to API (PUT /api/floors/:id)
       │
       └─→ Success → Toast notification
           │
7. Continue editing or Go Back
   │
   └─→ Click "Go Back"
       │
       └─→ Confirm if unsaved changes
           │
           └─→ Return to EditVisualizationPage
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PostMessage Protocol                          │
└─────────────────────────────────────────────────────────────────┘

React (Parent Window)              Blueprint Editor (iframe)
      │                                     │
      │◄────────── READY ───────────────────┤
      │                                     │
      ├──────── INIT_DATA ────────────────►│
      │  { employees: [...],                │
      │    floorData: {...} }               │
      │                                     │
      │                                     │  User edits...
      │                                     │
      ├──────── TRIGGER_SAVE ─────────────►│
      │                                     │
      │◄──── REQUEST_SAVE ──────────────────┤
      │  { floorplan: {...},                │
      │    items: [...] }                   │
      │                                     │
      │  Save to API...                     │
      │                                     │
      ├──────── SAVE_SUCCESS ─────────────►│
      │                                     │
      │                                     │  Toast: Saved!
      │                                     │
```

## Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                      Authentication Flow                         │
└─────────────────────────────────────────────────────────────────┘

User Login
    │
    ├─→ POST /api/auth/local
    │   └─→ Returns JWT token
    │
    ├─→ Store token in localStorage
    │
    └─→ All subsequent requests include:
        Header: Authorization: Bearer {token}

Protected Routes:
    • /edit-visualization → requirePermission="admin"
    • /edit-visualization/editor/:branchId/:floorId → requirePermission="admin"

API Security:
    • Strapi validates JWT on every request
    • Role-based access control (RBAC)
    • Admin role required for Floor API mutations
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      Technology Overview                         │
└─────────────────────────────────────────────────────────────────┘

Frontend:
  • React 18+ (UI Framework)
  • TypeScript (Type Safety)
  • React Router (Routing)
  • TailwindCSS (Styling)
  • shadcn/ui (UI Components)
  • Sonner (Toast Notifications)
  • Vite (Build Tool)

Backend:
  • Strapi v4 (Headless CMS)
  • Node.js (Runtime)
  • TypeScript (Type Safety)
  • PostgreSQL (Database)
  • JWT (Authentication)

Blueprint Editor:
  • Blueprint3D (Floor Plan Library)
  • Three.js (3D Rendering)
  • jQuery (DOM Manipulation)
  • Canvas API (2D Drawing)

Integration:
  • PostMessage API (iframe Communication)
  • Fetch API (HTTP Requests)
  • LocalStorage (Token Storage)
```

## File Structure

```
Application-development/
│
├── app/
│   │
│   ├── frontend/fe-nabdtwinapp/
│   │   │
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── EditVisualizationPage.tsx ◄── NEW
│   │   │   │   └── FloorPlanEditorPage.tsx   ◄── NEW
│   │   │   │
│   │   │   ├── components/
│   │   │   │   └── SideBar.tsx               ◄── MODIFIED
│   │   │   │
│   │   │   └── services/
│   │   │       └── router.tsx                ◄── MODIFIED
│   │   │
│   │   └── public/
│   │       └── blueprint-editor/             ◄── NEW (COPIED)
│   │           ├── index.html
│   │           ├── js/
│   │           │   └── example.js            ◄── MODIFIED
│   │           ├── css/
│   │           └── models/
│   │
│   └── backend/be-nabdtwin-strapi/
│       │
│       └── src/
│           └── api/
│               ├── floor/
│               │   └── content-types/floor/
│               │       └── schema.json       ◄── MODIFIED
│               │
│               ├── employee/
│               │   └── controllers/
│               │       └── employee.ts
│               │
│               └── branch/
│
├── FLOOR_EDITOR_IMPLEMENTATION.md            ◄── NEW
├── EDIT_VISUALIZATION_GUIDE.md               ◄── NEW
├── DEPLOYMENT_INSTRUCTIONS.md                ◄── NEW
├── API_INTEGRATION_REFERENCE.md              ◄── NEW
└── ARCHITECTURE_OVERVIEW.md                  ◄── NEW (THIS FILE)
```

## Key Design Decisions

### 1. Iframe Isolation
**Decision**: Embed Blueprint3D editor in iframe
**Rationale**:
- Prevents CSS/JS conflicts with React
- Keeps legacy code separate
- Easy to maintain and update independently
- PostMessage provides clean API boundary

### 2. JSON Storage
**Decision**: Store floor data as JSON in database
**Rationale**:
- Flexible schema (Blueprint3D format can change)
- Easy to migrate/backup
- No need for complex relational structure
- Can add versioning later

### 3. API-First Employee Selection
**Decision**: Load employees from API, not hardcoded
**Rationale**:
- Real-time data sync
- Centralized employee management
- Supports branch-specific employees
- Enables future features (employee search, filters)

### 4. Admin-Only Access
**Decision**: Restrict to admin users only
**Rationale**:
- Floor plans affect entire organization
- Prevents accidental modifications
- Maintains data integrity
- Can add granular permissions later

### 5. PostMessage Protocol
**Decision**: Use PostMessage for React ↔ iframe communication
**Rationale**:
- Standard browser API
- Secure (origin validation)
- Async communication
- Doesn't require modifying Blueprint3D core

---

This architecture provides a scalable, maintainable solution for floor plan editing while keeping the Blueprint3D editor isolated and preserving all its functionality.

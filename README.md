# Nabd Twin

# Project Files

## Rami's Contributions

| Sprint | Module Name | Frontend | Backend | Database |
|---------|-------------|----------|---------|----------|
| Sprint 1 | Data Schema Management | **interfaces folder :** <br>- [Model Folder](/app/frontend/fe-nabdtwinapp/src/model) <br>*(defines how data will be presented in the front end)* | **Data Seeder:** <br>- [Populate.js](/app/backend/be-nabdtwin-strapi/populate.js) <br>*(A script or small App that is used to simulate incoming data from different data sources using our rest apis)* | **Database Schema:** <br>- [Database Folder](/app/backend/be-nabdtwin-strapi/database) <br>*(The whole Application Complex Data base Schema and relationships defined)* |
| Sprint 2 | API points created | - | **Api implementation:** <br>- [Api implementation Folder](/app/backend/be-nabdtwin-strapi/src/api) <br>*(The whole Application Default Apis and some custom Apis created by me, except the ones related to analytics)* | - |
| Sprint 3 | API points Integration | **Api Integration:** <br>- [Api Integration](/app/frontend/fe-nabdtwinapp/src/services/API) <br><br>**3d Visualization Editor Integration:** <br>- [3d legacy viewer editor](/app/frontend/fe-nabdtwinapp/public/blueprint-editor) <br>*(integrated the edit version of 3dblueprint project to create floors)* <br><br>**3d Visualization viewer Integration:** <br>- [3d legacy viewer](/app/frontend/fe-nabdtwinapp/public/legacy-viewer) <br>*(integrated the viewer version of 3dblueprint to help visualize floors by branch)* | **Floors api:** <br>- [Floor Api Folder](/app/backend/be-nabdtwin-strapi/src/api/floor) <br>*(api that handles floor creation, deletion and storage of 3d parts)* | - |

---

## Ammar's Contributions

| Sprint | Module Name | Frontend | Backend | Database |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **KPI and Metric Calculation** | **Page:**<br>- [MapViewPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/MapViewPage.tsx)<br>*(Consumes Employee & Floor Data)*|**Controller:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/controllers/analytics.ts)<br><br>**Routes:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/routes/analytics.ts)<br><br>**Service:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/services/analytics.ts)<br>*(Calculates Employee, Floor, and Branch KPIs)*| **Design Doc:**<br>- [Sprint1_Database_Design.md](/app/backend/be-nabdtwin-strapi/database/Ammar/Sprint1_Database.md)<br>*(Defines `branch-kpi` & `employee-kpi` schemas)* |
| **2** | **Performance Aggregation Module** |**Page:**<br>- [InsightsPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/InsightsPage.tsx)<br>*(Consumes Global Stats, Trend & History APIs)*|**Controller:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/controllers/analytics.ts)<br><br>**Routes:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/routes/analytics.ts)<br><br>**Service:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/services/analytics.ts)<br>*(Calculates Global Aggregates, Branch Benchmarking & History, Employee Performance History & Trends)*| **Design Doc:**<br>- [Sprint2_Database_Design.md](/app/backend/be-nabdtwin-strapi/database/Ammar/Sprint2_Database.md)<br>*(Aggregation Logic & Historical Data Structures)* |
| **3** | **Advisory/Analytics AI Module** | **UI Components:**<br>- [AdvisorPanel.tsx](/app/frontend/fe-nabdtwinapp/src/components/AdvisorPanel.tsx)<br>*(Chat UI, Markdown Rendering, Tool Visualization)*<br><br>**State Management:**<br>- [advisorSlice.ts](/app/frontend/fe-nabdtwinapp/src/store/slices/advisorSlice.ts)<br>*(**Redux Slice & Thunks**: Manages Async API Calls, Chat History, and Loading States)* | **Controller:**<br>- [advisory.ts](/app/backend/be-nabdtwin-strapi/src/api/advisory/controllers/advisory.ts)<br><br>**Routes:**<br>- [advisory.ts](/app/backend/be-nabdtwin-strapi/src/api/advisory/routes/advisory.ts)<br><br>**Service:**<br>- [advisory.ts](/app/backend/be-nabdtwin-strapi/src/api/advisory/services/advisory.ts)<br>*(AI Agent Logic, Tool Execution, Gemini API Integration, JSON Parsing)* | **Design Doc:**<br>- [Sprint3_Database_Design.md](/app/backend/be-nabdtwin-strapi/database/Ammar/Sprint3_Database.md)<br>*(Defines `advisory-log` schema for Audit Trails)* |

---

## Ali's Contributions

| Sprint  | Module Name | Frontend                                                            | Backend | Database |
|---------|-------------|---------------------------------------------------------------------|---------|----------|
| Sprint 1|Google Maps and Floor Visualization| [MapViewPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/MapViewPage.tsx)<br>*(google map view of branches)*  & [EditVisualizationPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/EditVisualizationPage.tsx)          |[blueprint-editor](/app/frontend/fe-nabdtwinapp/public/blueprint-editor)<br>*(Bluepirnt3d library for 3d visualization)*      | -        |
| Sprint 2|Workplace & Employee KPI Popup             |3D floor visualization frontend: [VisualizationPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/VisualizationPage.tsx) & [index.html](/app/frontend/fe-nabdtwinapp/public/blueprint-editor/index.html)<br>*(Added Employee popup upon 3d item selection)*                                                                  |3D floor visualization backend: [example.js](/app/frontend/fe-nabdtwinapp/public/blueprint-editor/js/example.js)<br>*(Added id generation for each 3d item in the room so it can easily be linked to an employee later on)*      | -        |
| Sprint 3|3D Floor Editor & Employee Management Interface             |[FloorPlanEditorPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/FloorPlanEditorPage.tsx)<br>*(Can now edit floor plan to have employee data linked to a 3d item(workplace))*                                                                    |[employee.ts](/app/frontend/fe-nabdtwinapp/src/model/employee.ts)<br>*(Employee interface)*       | -        |

---

### Amr's Contributions

| Sprint | Module Name | Frontend | Backend | Database |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Authentication & JWT | **Login Page:**<br>- [LoginPage.tsx](./frontend/src/pages/LoginPage.tsx)<br>*(User interface for credential entry and secure login)* | **Authentication:**<br>- [Auth Folder](./backend/src/api/auth)<br>*(Controllers for handling login logic and JWT generation)* | **User Schema:**<br>- [User.settings.json](./backend/src/content-types/user/schema.json)<br>*(Extended default schema to include auth-specific fields)* |
| 2 | Account Generation & Management | **Admin Page:**<br>- [AdminDashboard.tsx](./frontend/src/pages/AdminDashboard.tsx)<br>*(Interface for listing and managing user accounts)*<br><br>**Account Page:**<br>- [AccountProfile.tsx](./frontend/src/pages/AccountProfile.tsx)<br>*(Page for updating user profiles and account status)* | **Authorization:**<br>- [Account Folder](./backend/src/api/account)<br>*(Logic for creating users, updating profiles, and managing status)* | **Audit Schema:**<br>- [AuditLog.settings.json](./backend/database/AuditLog.settings.json)<br>*(Database definition for tracking account activity)* |
| 3 | Role Definition & Permissions | **Permission Hooks:**<br>- [usePermission.ts](./frontend/src/hooks/usePermission.ts)<br>*(Custom React hook to check user permissions dynamically)*<br><br>**APIs:**<br>- [api/roles.ts](./frontend/src/api/roles.ts)<br>*(Frontend API integration files for fetching and updating roles)* | **RBAC Policies:**<br>- [Policies Folder](./backend/src/policies)<br>*(Middleware logic to enforce Role-Based Access Control)* | **Role Schema:**<br>- [RolePermissions.settings.json](./backend/database/RolePermissions.settings.json)<br>*(Junction table linking Roles to specific Permissions)* |

---

## Nouredin's Contributions

| Sprint | Module Name | Frontend | Backend | Database |
| :--- | :--- | :--- | :--- | :--- |
| Sprint 1 | **Dashboard Visualization Module** | **Page:**<br>- [InsightsPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/InsightsPage.tsx)<br>*(Displays dashboard insights and KPI visualizations for executives)* | **Controller:**<br>- [insight.ts](/app/backend/be-nabdtwin-strapi/src/api/insight/controllers/insight.ts)<br><br>**Routes:**<br>- [insight.ts](/app/backend/be-nabdtwin-strapi/src/api/insight/routes/insight.ts)<br><br>**Service:**<br>- [insight.ts](/app/backend/be-nabdtwin-strapi/src/api/insight/services/insight.ts)<br>*(Provides insight data APIs consumed by the Insights dashboard)* | - |
| Sprint 2 | **Alert & Summary Module** | **Page:**<br>- [AlertsSummaryPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/AlertsSummaryPage.tsx)<br>*(Shows alerts and summarized notifications to users)* | **Controller:**<br>- [alert.ts](/app/backend/be-nabdtwin-strapi/src/api/alert/controllers/alert.ts)<br><br>**Routes:**<br>- [alert.ts](/app/backend/be-nabdtwin-strapi/src/api/alert/routes/alert.ts)<br><br>**Service:**<br>- [alert.ts](/app/backend/be-nabdtwin-strapi/src/api/alert/services/alert.ts)<br>*(Manages alert generation and retrieval for the Alerts page)* | - |
| Sprint 3 | **Report Generation (PDF/CSV)** | **Page:**<br>- [ReportsPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/ReportsPage.tsx)<br><br>**Constants:**<br>- [reportMetrics.ts](/app/frontend/fe-nabdtwinapp/src/constants/reportMetrics.ts)<br>*(Defines report metrics and enables exporting filtered reports)* | **Controller:**<br>- [report-generator.ts](/app/backend/be-nabdtwin-strapi/src/api/report-generator/controllers/report-generator.ts)<br><br>**Routes:**<br>- [report-generator.ts](/app/backend/be-nabdtwin-strapi/src/api/report-generator/routes/report-generator.ts)<br><br>**Service:**<br>- [report-generator.ts](/app/backend/be-nabdtwin-strapi/src/api/report-generator/services/report-generator.ts)<br>*(Generates report exports as PDF/CSV from selected KPIs and scope)* | - |


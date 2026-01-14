# Nabd Twin

# Project Files

## Rami's Contributions

| Sprint  | Module Name | Frontend                                                      | Backend | Database |
|---------|-------------|---------------------------------------------------------------|---------|----------|
| Sprint 1|Data Schema Management|   **interfaces folder :**<br>-[Model Folder](/app/frontend/fe-nabdtwinapp/src/model)<br>*(defines how data will be presented in the front end)* |  **Data Seeder:**<br> -[Populate.js](/app/backend/be-nabdtwin-strapi/populate.js)<br>*(A script or small App that is used to simulate incoming data from different data soucrs using our rest apis)*      | **Database Schema:**<br>  - [Database Folder](/app/backend/be-nabdtwin-strapi/database) <br>*(The whole Application Complex Data base Schema and rekationships defined )*|
| Sprint 2|API points created| -                                                             | **Api implementation:**<br>  -  [Api implementation Folder](/app/backend/be-nabdtwin-strapi/src/api) <br>*(The whole Application Default Apis and some custom Apis created by me , except the ones related to analytics   ) *  | -        |
| Sprint 3|API points Integeration| -[Api Integeration](/app/frontend/fe-nabdtwinapp/src/services/API) <br><br>
**3d Visualization Editor  Integration:**<br>  -  [3d legacy viewer editor](/app/frontend/fe-nabdtwinapp/public/blueprint-editor) <br>*(integrated the edit version of 3dblueprint project to create floors   ) *
<br><br>
**3d Visualization viewer  Integration:**<br>  -  [3d legacy viewer ](/app/frontend/fe-nabdtwinapp/public/legacy-viewer) <br>*(integrated the viewer version of 3dblueprint to help visualize floors by branch  ) *|**Floors api:**<br>  -  [Floor Api Folder](/app/backend/be-nabdtwin-strapi/src/api/floor  ) <br>*(api that handles floor creation , deletion and storage of 3d parts   ) *      | -        |

---

## Ammar's Contributions

| Sprint | Module Name | Frontend | Backend | Database |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **KPI and Metric Calculation** | **Page:**<br>- [MapViewPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/MapViewPage.tsx)<br>*(Consumes Employee & Floor Data)*|**Controller:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/controllers/analytics.ts)<br><br>**Routes:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/routes/analytics.ts)<br><br>**Service:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/services/analytics.ts)<br>*(Calculates Employee, Floor, and Branch KPIs)*| - |
| **2** | **Performance Aggregation Module** |**Page:**<br>- [InsightsPage.tsx](/app/frontend/fe-nabdtwinapp/src/pages/InsightsPage.tsx)<br>*(Consumes Global Stats, Trend & History APIs)*|**Controller:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/controllers/analytics.ts)<br><br>**Routes:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/routes/analytics.ts)<br><br>**Service:**<br>- [analytics.ts](/app/backend/be-nabdtwin-strapi/src/api/analytics/services/analytics.ts)<br>*(Calculates Global Aggregates, Branch Benchmarking & History, Employee Performance History & Trends)*| - |
| **3** | **Advisory/Analytics AI Module** | **Components:**<br>- [AdvisorPanel.tsx](/app/frontend/fe-nabdtwinapp/src/components/AdvisorPanel.tsx)<br>*(Chat UI, Markdown Rendering, Tool Visualization)*<br><br>**State:**<br>- [advisorSlice.ts](/app/frontend/fe-nabdtwinapp/src/store/slices/advisorSlice.ts)<br>*(Manages Chat History & API States)* | **Controller:**<br>- [advisory.ts](/app/backend/be-nabdtwin-strapi/src/api/advisory/controllers/advisory.ts)<br><br>**Routes:**<br>- [advisory.ts](/app/backend/be-nabdtwin-strapi/src/api/advisory/routes/advisory.ts)<br><br>**Service:**<br>- [advisory.ts](/app/backend/be-nabdtwin-strapi/src/api/advisory/services/advisory.ts)<br>*(AI Agent Logic, Tool Execution, Gemini API Integration, JSON Parsing)* | **Content Type:**<br>- [advisory-log](/app/backend/be-nabdtwin-strapi/src/api/advisory-log/content-types/advisory-log/schema.json)<br>*(Stores User Questions & AI Responses)* |

---

## Ali's Contributions

| Sprint  | Module Name | Frontend                                                            | Backend | Database |
|---------|-------------|---------------------------------------------------------------------|---------|----------|
| Sprint 1|Google Maps and Floor Visualization| [package.json](/app/frontend/fe-nabdtwinapp/package.json)          | -       | -        |
| Sprint 2|             | -                                                                   | -       | -        |
| Sprint 3|             | -                                                                   | -       | -        |

---

## Amr's Contributions

| Sprint  | Module Name | Frontend                                                            | Backend | Database |
|---------|-------------|---------------------------------------------------------------------|---------|----------|
| Sprint 1| Authentication & JWT| [tsconfig.json](/app/frontend/fe-nabdtwinapp/tsconfig.json)        | -       | -        |
| Sprint 2|             | -                                                                   | -       | -        |
| Sprint 3|             | -                                                                   | -       | -        |

---

## Nouredin's Contributions

| Sprint  | Module Name | Frontend                                                      | Backend | Database |
|---------|-------------|---------------------------------------------------------------|---------|----------|
| Sprint 1|Dashboard Visualization Module| View: [InsightsPage.tsx](app/frontend/fe-nabdtwinapp/src/pages/InsightsPage.tsx)            | -       | -        |
| Sprint 2|             | -                                                             | -       | -        |
| Sprint 3|     Report Generation (PDF/CSV)        |              View: [ReportsPage.tsx](app/frontend/fe-nabdtwinapp/src/pages/ReportsPage.tsx)                                               | -       | -        |

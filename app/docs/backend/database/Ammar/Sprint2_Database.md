# Sprint 2: Performance Aggregation & History

## Overview

Sprint 2 focuses on **Performance Insights and Trend Analysis** features within the Analytics service (`src/api/analytics/services/analytics.ts`). This sprint **does not introduce new database tables**. Instead, it leverages the KPI tables established in Sprint 1 (`branch_kpis`, `employee_kpis`, `floor_kpis`) to perform complex aggregations, time-series analysis, and cross-entity comparisons.

---

## 1. Database Architecture Decision

### ❌ No New Tables Were Created

After analyzing the codebase, Sprint 2 implements all insights and trends features through **runtime aggregation queries** rather than persisted summary tables.

## 2. Data Sources (Reused from Sprint 1)

Sprint 2 queries the following KPI tables as its **knowledge base**:

| Entity | Collection Name | Used For |
|--------|-----------------|----------|
| **Branch KPI** | `branch_kpis` | Global stats, trends, branch comparison, growth rates |
| **Employee KPI** | `employee_kpis` | Top performers, employee history, individual trends |
| **Floor KPI** | `floor_kpis` | Floor-level historical queries |
| **Task** | `tasks` | Late task counts, in-progress metrics |
| **Employee** | `employees` | Turnover tracking (hireDate, terminationDate) |

---

## 3. Aggregation Features & Query Logic

### 3.1 Global Insights (`getGlobalStats`)

**Purpose**: Provides high-level system health metrics for the executive dashboard.
**Output Schema** (Runtime Object - Not Persisted):

```json
[
  {
    "title": "Productivity",
    "value": 85,
    "target": 90,
    "unit": "%",
    "trend": "up",
    "trendValue": "+5.2%",
    "explanation": "Average efficiency across all branches.",
    "color": "bg-blue-600"
  },
  // ... (Total Revenue, Late Tasks, Tasks In Progress, Employees Joined, Employees Resigned)
]
```

---

### 3.2 30-Day Trends (`getTrends`)

**Purpose**: Time-series visualization of organizational performance over the last 30 days.
**Calculation Details**:

| Metric | Calculation | Description |
|--------|-------------|-------------|
| `revenue` | `SUM(branch_kpis.revenue)` per day | Total daily revenue across all branches |
| `productivity` | `AVG(branch_kpis.productivityScore)` per day | Organization-wide productivity average |
| `delivery` | `100 - (lateTasks / employeeCount × 5)` | Inverse of late tasks normalized per employee |
| `lateTasks` | `SUM(branch_kpis.overdueTaskCount)` per day | Total overdue tasks |

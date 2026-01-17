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

**Output Schema** (Runtime Array - Not Persisted):

```json
[
  {
    "date": "Jan 1",
    "revenue": 125000,
    "productivity": 78,
    "delivery": 92,
    "lateTasks": 12
  },
  // ... 29 more days
]
```

---

### 3.3 Branch Comparison (`getBranchComparison`)

**Purpose**: Side-by-side performance comparison of all branches for benchmarking.
**Output Schema**:

```json
[
  {
    "name": "Riyadh",
    "score": 87,
    "employees": 45,
    "tasks": 128,
    "color": "#10b981"
  }
]
```

---

### 3.4 Top Employees (`getTopEmployees`)

**Purpose**: Leaderboard of highest-performing employees based on productivity scores.
**Output Schema**:

```json
[
  {
    "id": 12,
    "name": "Ahmed Ali",
    "branch": "Riyadh",
    "score": 95,
    "tasks": 24,
    "avatar": "AA"
  }
]
```

---

### 3.5 Employee Turnover (`getEmployeeChanges`)

**Purpose**: Track hiring and resignation trends over the last 30 days.

**Output Schema**:

```json
{
  "joined": {
    "count": 12,
    "change": "+12",
    "trend": "up",
    "details": [
      { "branch": "Riyadh", "count": 5 },
      { "branch": "Jeddah", "count": 4 },
      { "branch": "Dammam", "count": 3 }
    ]
  },
  "resigned": {
    "count": 3,
    "change": "-3",
    "trend": "down",
    "details": [
      { "branch": "Riyadh", "count": 2 },
      { "branch": "Jeddah", "count": 1 }
    ]
  }
}
```

---

### 3.6 Task Metrics (`getTaskMetrics`)

**Purpose**: Real-time task status distribution and on-time delivery rate.

**Query Logic**:

```sql
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN status IN ('in-progress', 'todo') THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN dueDate < TODAY AND status != 'completed' THEN 1 ELSE 0 END) as late
FROM tasks
```

**Calculations**:

```
onTimeRate = ((totalTasks - lateTasks) / totalTasks) × 100
```

---

### 3.7 Historical Queries (History Methods)

**Purpose**: Retrieve KPI records for a specific entity over a date range.

| Method | Query Pattern |
|--------|---------------|
| `getBranchHistory(branchId, from, to)` | `SELECT * FROM branch_kpis WHERE branch = ? AND date BETWEEN ? AND ? ORDER BY date` |
| `getFloorHistory(floorId, from, to)` | `SELECT * FROM floor_kpis WHERE floor = ? AND date BETWEEN ? AND ? ORDER BY date` |
| `getEmployeeHistory(employeeId, from, to)` | `SELECT * FROM employee_kpis WHERE employee = ? AND date BETWEEN ? AND ? ORDER BY date` |

## 4. Aggregation Patterns Summary

| Feature | Aggregation Type | Source Table(s) | Key Operations |
|---------|------------------|-----------------|----------------|
| Global Stats | **Cross-Table Sum/Avg** | `branch_kpis`, `tasks` | SUM revenue, AVG productivity, COUNT tasks |
| Trends | **Time-Series Grouping** | `branch_kpis` | GROUP BY date, SUM/AVG per day |
| Branch Comparison | **Benchmark Ranking** | `branch_kpis`, `employees`, `tasks` | Current KPI + employee/task counts |
| Top Employees | **Leaderboard Sort** | `employee_kpis` | ORDER BY productivityScore DESC LIMIT 8 |
| Employee Changes | **Temporal Filtering** | `employees` | WHERE hireDate/terminationDate >= 30 days ago |
| Task Metrics | **Status Distribution** | `tasks` | COUNT by status, calculate on-time % |
| History Queries | **Range Retrieval** | `*_kpis` | WHERE date BETWEEN start AND end |
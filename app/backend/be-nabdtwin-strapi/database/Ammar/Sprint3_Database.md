# Sprint 3: AI Advisory Module

## Overview

Sprint 3 implements the **AI-Powered Advisory System** (`src/api/advisory/services/advisory.ts`) that provides conversational analytics and intelligent insights. This module uses Google's Gemini AI model with **function calling** capabilities to dynamically query the organization's performance data and generate contextual recommendations.

---

## 1. Architecture: LLM + Tool-Based RAG

The Advisory module implements a **Retrieval-Augmented Generation (RAG)** pattern where:

1. **Knowledge Base**: Sprint 1 & 2 KPI tables serve as the data source
2. **Retrieval Layer**: Custom tools allow the LLM to query specific metrics
3. **Generation Layer**: Gemini 2.5 Flash synthesizes insights from retrieved data

## 2. Database Entities

### 2.1 Input Entities (Knowledge Base)

The AI module treats Sprint 1 & 2 tables as its **read-only knowledge base**:

| Entity | Collection Name | Role in Advisory | Data Retrieved |
|--------|-----------------|------------------|----------------|
| **Branch KPI** | `branch_kpis` | Branch performance context | `revenue`, `productivityScore`, `satisfactionScore`, `growthRate`, `performanceRating` |
| **Employee KPI** | `employee_kpis` | Individual performance context | `tasksCompleted`, `attendanceRate`, `productivityScore` |
| **Floor KPI** | `floor_kpis` | Spatial analysis context | `occupancyRate`, `productivityScore` |
| **Branch** | `branches` | Entity lookup | `id`, `name` (for name-to-ID resolution) |
| **Employee** | `employees` | Entity lookup | `id`, `firstName`, `lastName` (for name-to-ID resolution) |
| **Task** | `tasks` | Operational context | Task counts, status distribution |

---

### 2.2 Output Entity: Advisory Log

The `advisory_logs` table stores all AI interactions for audit, analytics, and debugging.

#### Schema Definition

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | Integer | PK, Auto | Primary key |
| `user` | Relation | FK → users-permissions.user | The user who initiated the query |
| `timestamp` | DateTime | Auto | When the interaction occurred |
| `context_type` | String | - | Classification of the query type (e.g., "Agent Analysis") |
| `context_target` | String | - | Specific entity referenced (e.g., "Branch: Riyadh") |
| `ai_response` | Text | - | Full markdown response from the AI |
| `token_usage` | Integer | - | Token count for cost tracking (if implemented) |

#### JSON Schema (`src/api/advisory-log/content-types/advisory-log/schema.json`)

```json
{
  "kind": "collectionType",
  "collectionName": "advisory_logs",
  "info": {
    "singularName": "advisory-log",
    "pluralName": "advisory-logs",
    "displayName": "Advisory Log"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "user": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "plugin::users-permissions.user",
      "inversedBy": "advisory_logs"
    },
    "timestamp": {
      "type": "datetime"
    },
    "context_type": {
      "type": "string"
    },
    "context_target": {
      "type": "string"
    },
    "ai_response": {
      "type": "text"
    },
    "token_usage": {
      "type": "integer"
    }
  }
}
```

---

## 3. AI Tool Definitions

The Advisory service exposes the following tools to the Gemini model:

| Tool Name | Description | Parameters | Returns |
|-----------|-------------|------------|---------|
| `get_global_insights` | Get high-level system status, total revenue, and overall health | None | Array of metric objects |
| `get_branch_comparison` | Compare performance metrics across all branches | None | Array of branch performance objects |
| `get_trends` | Get historical trend data (last 30 days) | None | Array of daily data points |
| `get_top_employees` | Retrieve a list of the highest-performing staff | None | Array of top 8 employees |
| `get_branch_details` | Get deep KPI details for a specific branch | `id: string` (required) | Branch KPI object |
| `get_employee_details` | Get deep KPI details for a specific employee | `id: string` (required) | Employee KPI object |
| `lookup_entity_id` | Find the numeric ID of a Branch or Employee by name | `name: string`, `type: "branch" \| "employee"` | `{id, name}` or "Not found" |
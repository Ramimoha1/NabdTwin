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

... (content moved from original Sprint3 file)

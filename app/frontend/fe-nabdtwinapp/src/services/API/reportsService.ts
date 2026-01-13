import { api } from "./api";

/**
 * Reports Service - Strapi v5 Report Generator Integration
 * 
 * Handles all communication with the backend report-generator API
 * including branch reports, employee reports, and report history
 * 
 * ⚠️ IMPORTANT: Backend Permissions Setup Required
 * ================================================
 * For Report Templates to work correctly, you must configure permissions in Strapi:
 * 
 * 1. Login to Strapi Admin > Settings > Roles
 * 2. Edit the "Public" or "Authenticated" role (depending on your setup)
 * 3. Under "Report Template", enable:
 *    - ✅ create
 *    - ✅ find
 *    - ✅ findOne
 *    - ✅ update
 *    - ✅ delete
 * 
 * Without these permissions, template save/update/delete operations will fail.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Branch type
interface Branch {
  id: string;
  documentId?: string;  // Strapi v5 Documents API ID
  name: string;
}

// Employee type
interface Employee {
  id: string;
  documentId: string;  // Strapi v5 Documents API ID
  name: string;
  branch?: {
    id: string;
    documentId?: string;
    name: string;
  } | null;  // Employee's branch (can be null)
}
// TYPES & INTERFACES
// ============================================================================

/**
 * Backend Report History Response Format
 * This is exactly what the Strapi backend returns from GET /api/report-generator/history
 */
interface BackendReportHistoryItem {
  id: number;
  title: string;
  description: string;
  type: "performance" | "kpi" | "attendance" | "project" | "financial" | "custom";
  scope: "branch" | "employee" | "department" | "team" | "organization";
  generatedDate: string; // ISO string
  generatedBy: string; // Email or "System"
  dateRange: {
    from: string;
    to: string;
  };
  branch?: string;
  employees?: string[];
  kpis?: string[];
  format?: "PDF" | "CSV";
}

/**
 * Frontend Report History Format
 * This is what the React component expects
 */
interface FrontendReportHistoryItem {
  id: string;
  name: string; // Mapped from title
  type: "Branch" | "Employee"; // Mapped from scope
  generatedDate: string; // Stays the same
  generatedBy: string; // Stays the same
  format?: "PDF" | "CSV";
  branch?: string;
  employees?: string[];
  kpis?: string[];
  dateRange: string; // Formatted as "MM/DD/YYYY - MM/DD/YYYY"
}

/**
 * Branch Report Generation Request
 */
interface BranchReportRequest {
  branch: string;
  kpis: string[];
  dateRange: string;
  format: "PDF" | "CSV";
}

/**
 * Employee Report Generation Request
 */
interface EmployeeReportRequest {
  employees: string[];
  metrics: string[];
  dateRange: string;
  format: "PDF" | "CSV";
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse JWT token from multiple storage locations
 * Handles various token storage patterns in the app
 */
const resolveToken = (): string => {
  // Check direct token storage
  const direct =
    localStorage.getItem("jwt") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("jwt") ||
    sessionStorage.getItem("token");

  if (direct) return stripQuotes(direct);

  // Check user object
  const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
  const userParsed = parseJsonSafe(userRaw);
  if (userParsed?.jwt || userParsed?.token) {
    return stripQuotes(userParsed.jwt || userParsed.token);
  }

  // Check Redux persist
  const persistedRoot = parseJsonSafe(localStorage.getItem("persist:root"));
  if (persistedRoot) {
    const fromRoot = stripQuotes(
      persistedRoot.token || persistedRoot.jwt || persistedRoot.accessToken
    );
    if (fromRoot) return fromRoot;

    const authSliceRaw = persistedRoot?.auth;
    const authSlice =
      typeof authSliceRaw === "string" ? parseJsonSafe(authSliceRaw) : authSliceRaw;
    const fromPersist =
      authSlice?.jwt ||
      authSlice?.token ||
      authSlice?.accessToken ||
      authSlice?.user?.jwt ||
      authSlice?.user?.token;
    if (fromPersist) return stripQuotes(fromPersist);
  }

  return "";
};

const parseJsonSafe = (raw: string | null): any => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const stripQuotes = (val: unknown): string =>
  typeof val === "string" ? val.replace(/^"+|"+$/g, "") : "";

// ============================================================================
// DATA MAPPING FUNCTION
// ============================================================================

/**
 * Maps Backend Format to Frontend Format
 * 
 * Backend sends:
 *   - "type": "performance", "kpi", etc. (reportType)
 *   - "title": Report title
 *   - "scope": "branch" or "employee"
 * 
 * Frontend expects:
 *   - "type": "Branch" or "Employee" (capitalized)
 *   - "name": Report title
 *   - Uses scope to determine type
 */
const mapBackendReportToFrontend = (
  backendReport: BackendReportHistoryItem
): FrontendReportHistoryItem => {
  // Format dateRange object to string: "MM/DD/YYYY - MM/DD/YYYY"
  const formatDateRange = (range: { from: string; to: string }): string => {
    try {
      const fromDate = new Date(range.from).toLocaleDateString("en-US");
      const toDate = new Date(range.to).toLocaleDateString("en-US");
      return `${fromDate} - ${toDate}`;
    } catch (error) {
      console.warn("❌ Failed to format dateRange", error);
      return "Invalid date range";
    }
  };

  return {
    id: String(backendReport.id),
    name: backendReport.title,
    type: backendReport.scope === "branch" ? "Branch" : "Employee",
    generatedDate: backendReport.generatedDate,
    generatedBy: backendReport.generatedBy,
    format: backendReport.format,
    branch: backendReport.branch,
    employees: backendReport.employees,
    kpis: backendReport.kpis || [],
    dateRange: formatDateRange(backendReport.dateRange), // ✅ Convert object to string
  };
};

// ============================================================================
// No mock data - using real backend only
// ============================================================================

// ============================================================================
// API SERVICE FUNCTIONS
// ============================================================================

/**
 * Generate a Branch Performance Report
 * 
 * POST /api/report-generator/branch
 * Returns a binary file (PDF/CSV) for download
 */
export async function generateBranchReport(
  data: BranchReportRequest
): Promise<void> {
  try {
    console.log("🔄 Generating branch report:", data);

    const response = await api.post(
      "/api/report-generator/branch",
      data,
      {
        responseType: "blob", // CRITICAL: Must be 'blob' for file download
      }
    );

    // Create downloadable blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Determine file extension
    const extension = data.format.toLowerCase();
    const filename = `${data.branch}_report_${Date.now()}.${extension}`;

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    console.log("✅ Branch report downloaded:", filename);
  } catch (error) {
    console.error("❌ Error generating branch report:", error);
    throw new Error("Failed to generate branch report. Please try again.");
  }
}

/**
 * Generate an Employee KPI Report
 * 
 * POST /api/report-generator/employee
 * Returns a binary file (PDF/CSV) for download
 */
export async function generateEmployeeReport(
  data: EmployeeReportRequest
): Promise<void> {
  try {
    console.log("🔄 Generating employee report:", data);

    const response = await api.post(
      "/api/report-generator/employee",
      data,
      {
        responseType: "blob", // CRITICAL: Must be 'blob' for file download
      }
    );

    // Create downloadable blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Determine file extension
    const extension = data.format.toLowerCase();
    const filename = `employee_report_${Date.now()}.${extension}`;

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    console.log("✅ Employee report downloaded:", filename);
  } catch (error) {
    console.error("❌ Error generating employee report:", error);
    throw new Error("Failed to generate employee report. Please try again.");
  }
}

/**
 * Fetch Report Generation History
 * 
 * GET /api/report-generator/history
 * Returns array of previously generated reports with metadata
 * 
 * Features:
 * - Data mapping from backend to frontend format
 * - Error handling with fallback to mock data
 * - Proper type safety
 */
export async function fetchReportHistory(): Promise<FrontendReportHistoryItem[]> {
  const API = import.meta.env.VITE_API_BASE || "http://localhost:3001";
  const token = resolveToken();

  try {
    console.log("🔄 Fetching report history from:", `${API}/api/report-generator/history`);

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const requestInit: RequestInit = {
      headers,
      credentials: "include",
    };

    const response = await fetch(
      `${API}/api/report-generator/history`,
      requestInit
    );

    // Handle errors
    if (!response.ok) {
      console.warn(
        `⚠️ Reports endpoint failed with status ${response.status}`
      );
      return [];
    }

    const backendData = await response.json();
    console.log("📦 Raw backend data received:", backendData);

    // Ensure it's an array
    let backendReports = Array.isArray(backendData)
      ? backendData
      : backendData.data ?? backendData.reports ?? [];

    // Return empty array if no reports
    if (backendReports.length === 0) {
      console.log("ℹ️ No reports from API");
      return [];
    }

    // MAP backend format to frontend format
    const frontendReports = backendReports.map(mapBackendReportToFrontend);

    console.log("✅ Report history loaded:", frontendReports);
    return frontendReports;
  } catch (error) {
    console.error("❌ Error fetching report history:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error(`❌ Cannot connect to API at ${API}. Is the backend running?`);
    }

    return [];
  }
}

/**
 * Download a report by ID
 * Handles both PDF viewing and file downloads
 */
export async function downloadReportById(
  id: string,
  format: string,
  filename: string
): Promise<string> {
  try {
    console.log(`🔄 Downloading report ${id} as ${format}`);

    const response = await api.get(`/api/report-generator/download/${id}`, {
      responseType: "blob",
    });

    // ✅ Use correct MIME type based on format
    const mimeType = format === 'PDF' ? 'application/pdf' : 'text/csv';
    const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    console.log(`✅ Report downloaded: ${filename}`);
    return url;
  } catch (error) {
    console.error("❌ Download failed:", error);
    throw error;
  }
}

/**
 * Fetch all branches from the API
 */
export async function fetchBranches(): Promise<Branch[]> {
  try {
    console.log("🔄 Fetching branches...");

    const response = await api.get("/api/branches?pagination[pageSize]=1000");
    const branches = Array.isArray(response.data) ? response.data : response.data?.data ?? [];

    // Map to include documentId for Strapi v5
    const mappedBranches = branches.map((branch: any) => ({
      id: branch.id,
      documentId: branch.documentId || branch.id,  // Fallback to id if documentId missing
      name: branch.name || branch.branchName || `Branch ${branch.id}`,
    }));

    console.log(`✅ Fetched ${mappedBranches.length} branches`);
    return mappedBranches;
  } catch (error) {
    console.error("❌ Error fetching branches:", error);
    return [];
  }
}

/**
 * Fetch all employees from the API
 */
export async function fetchEmployees(): Promise<Employee[]> {
  try {
    console.log("🔄 Fetching employees...");

    // Populate branch relation for filtering, fetch all records
    const response = await api.get("/api/employees?populate=branch&pagination[pageSize]=1000");
    const employees = Array.isArray(response.data) ? response.data : response.data?.data ?? [];

    // Map to include documentId and branch (Strapi v5 identifier)
    const mappedEmployees = employees.map((employee: any) => ({
      id: employee.id,
      documentId: employee.documentId || employee.id,  // Fallback to id if documentId missing
      name: employee.name || employee.fullName || employee.firstName || `Employee ${employee.id}`,
      branch: employee.branch ? {
        id: employee.branch.id,
        documentId: employee.branch.documentId || employee.branch.id,
        name: employee.branch.name || employee.branch.branchName || 'Unknown Branch',
      } : null,
    }));

    console.log(`✅ Fetched ${mappedEmployees.length} employees with branches`);
    return mappedEmployees;
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    return [];
  }
}

// ============================================================================
// REPORT TEMPLATES - Persistent storage via backend
// ============================================================================

/**
 * Report Template Type for frontend
 */
export interface ReportTemplate {
  id: string;
  documentId?: string;  // Strapi v5 ID
  name: string;
  type: "Branch" | "Employee";
  metrics?: string[];
  kpis?: string[];  // Legacy support
  branches?: string[];
  employees?: string[];
  dateRange: string;
  createdDate: string;
}

/**
 * Fetch all saved report templates from backend
 */
export async function fetchReportTemplates(): Promise<ReportTemplate[]> {
  try {
    const response = await api.get('/api/report-templates');

    // Handle both paginated and direct array responses
    const templates = response.data.data || response.data;

    return (Array.isArray(templates) ? templates : []).map((t: any) => ({
      id: t.documentId, 
      documentId: t.documentId,
      name: t.name,
      type: t.type,
      metrics: t.metrics || [],
      kpis: t.kpis || [],  // Legacy support
      branches: t.branches || [],
      employees: t.employees || [],
      dateRange: t.dateRange || 'Last 30 days',
      createdDate: t.createdDate || new Date().toISOString().split('T')[0],
    }));
  } catch (error) {
    console.error("❌ Error fetching report templates:", error);
    return [];
  }
}

/**
 * Create a new report template
 */
export async function saveReportTemplate(template: Omit<ReportTemplate, 'id' | 'documentId'>): Promise<ReportTemplate | null> {
  try {
    const response = await api.post('/api/report-templates', {
      data: {
        name: template.name,
        type: template.type,
        metrics: template.metrics || [],
        branches: template.branches || [],
        employees: template.employees || [],
        dateRange: template.dateRange,
        createdDate: template.createdDate || new Date().toISOString().split('T')[0],
      }
    });

    const t = response.data.data;
    return {
      id: t.documentId,  // ✅ CRITICAL: Use documentId for Strapi v5 API compatibility
      documentId: t.documentId,
      name: t.name,
      type: t.type,
      metrics: t.metrics || [],
      branches: t.branches || [],
      employees: t.employees || [],
      dateRange: t.dateRange,
      createdDate: t.createdDate,
    };
  } catch (error) {
    console.error("❌ Error saving report template:", error);
    return null;
  }
}

/**
 * Update an existing report template
 */
export async function updateReportTemplate(id: string, template: Partial<ReportTemplate>): Promise<ReportTemplate | null> {
  try {
    const response = await api.put(`/api/report-templates/${id}`, {
      data: {
        name: template.name,
        type: template.type,
        metrics: template.metrics || [],
        branches: template.branches || [],
        employees: template.employees || [],
        dateRange: template.dateRange,
        createdDate: template.createdDate,
      }
    });

    const t = response.data.data;
    return {
      id: t.documentId,  // ✅ CRITICAL: Use documentId for Strapi v5 API compatibility
      documentId: t.documentId,
      name: t.name,
      type: t.type,
      metrics: t.metrics || [],
      branches: t.branches || [],
      employees: t.employees || [],
      dateRange: t.dateRange,
      createdDate: t.createdDate,
    };
  } catch (error) {
    console.error("❌ Error updating report template:", error);
    return null;
  }
}

/**
 * Delete a report template
 */
export async function deleteReportTemplate(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/report-templates/${id}`);
    return true;
  } catch (error) {
    console.error("❌ Error deleting report template:", error);
    return false;
  }
}


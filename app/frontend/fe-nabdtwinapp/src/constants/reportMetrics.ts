/**
 * Centralized source of truth for report metrics
 * These lists are used across the Reports page and Template system
 */

export const BRANCH_METRICS = [
    "Productivity Score",
    "Revenue",
    "Revenue Target",
    "Revenue Achievement %",
    "Satisfaction Score",
    "Growth Rate",
    "Employee Count",
    "Joined This Month",
    "Left This Month",
    "Overdue Tasks",
    "Performance Rating"
] as const;

export const EMPLOYEE_METRICS = [
    "Tasks Completed",
    "Tasks Total",
    "Task Completion Rate %",
    "Attendance Rate",
    "Productivity Score",
    "Performance Score",
    "Projects Completed",
    "Tasks In Progress",
    "Tasks Overdue"
] as const;

/**
 * Legacy metric name mappings for backward compatibility
 * Maps old metric names to new standardized names
 */
export const LEGACY_BRANCH_MAPPING: Record<string, string> = {
    "Productivity": "Productivity Score",
    "Quality Score": "Performance Rating",
    "On-time Delivery": "Productivity Score", // Best fit
    "Late Tasks": "Overdue Tasks",
    "Tasks In Progress": "Tasks In Progress",
    "Employee Utilization": "Employee Count",
    "Task Completion Rate": "Productivity Score",
    "Average Response Time": "Productivity Score",
};

export const LEGACY_EMPLOYEE_MAPPING: Record<string, string> = {
    "Task Completion %": "Task Completion Rate %",
    "Utilization": "Tasks In Progress",
    "Late Tasks": "Tasks Overdue",
    "Average Handling Time": "Tasks Total",
    "Quality Score": "Performance Score",
    "Response Time": "Tasks Completed",
    "Tasks Completed": "Tasks Completed", // Already correct
    "Active Projects": "Projects Completed",
};

/**
 * Normalize a string for case-insensitive comparison
 * Trim whitespace and convert to lowercase
 */
export function normalizeMetricName(name: string | unknown): string {
    return String(name ?? "").trim().toLowerCase();
}

/**
 * Map a legacy metric name to its new equivalent
 * Returns the metric if already in new list, maps if legacy, or null if unmappable
 */
export function mapLegacyMetric(
    metricName: string,
    reportType: "Branch" | "Employee"
): string | null {
    const normalized = normalizeMetricName(metricName);
    const metricsList = reportType === "Branch" ? BRANCH_METRICS : EMPLOYEE_METRICS;
    const legacyMapping = reportType === "Branch" ? LEGACY_BRANCH_MAPPING : LEGACY_EMPLOYEE_MAPPING;

    // Check if it's already in the new list (case-insensitive)
    const found = metricsList.find(m => normalizeMetricName(m) === normalized);
    if (found) return found;

    // Check legacy mapping
    const legacyKey = Object.keys(legacyMapping).find(k => normalizeMetricName(k) === normalized);
    if (legacyKey) {
        return legacyMapping[legacyKey];
    }

    return null; // Cannot map
}

/**
 * Migrate a template's metrics list from legacy to new format
 * Returns only valid metrics that could be found or mapped
 */
export function migrateTemplateMetrics(
    metrics: string[] | undefined,
    reportType: "Branch" | "Employee"
): string[] {
    if (!Array.isArray(metrics)) return [];

    const migrated: string[] = [];
    const seen = new Set<string>();

    for (const metric of metrics) {
        const mapped = mapLegacyMetric(metric, reportType);
        if (mapped && !seen.has(mapped)) {
            migrated.push(mapped);
            seen.add(mapped);
        }
    }

    return migrated;
}

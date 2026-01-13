/**
 * report-generator controller (Strapi v5 Compatible)
 * Uses Document Service API instead of deprecated entityService
 * Queries safe database fields from KPI Collections directly
 */

import path from 'path';
import fs from 'fs';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

/**
 * Render a Chart.js config to PNG buffer for employee reports
 * @param config - Chart.js configuration object
 * @returns Promise<Buffer> - PNG image buffer
 */
async function renderEmployeeChartPng(config: any): Promise<Buffer> {
    const chartJSNodeCanvas = new ChartJSNodeCanvas({
        width: 800,
        height: 400,
        backgroundColour: 'white'
    });
    return await chartJSNodeCanvas.renderToBuffer(config);
}

/**
 * DATA TEAM SAFE FIELDS METRIC CONFIG
 * Maps metric labels to specific database fields
 * Sources:
 *   - 'kpi': Fetch from api::branch-kpi.branch-kpi or api::employee-kpi.employee-kpi
 *   - 'entity': Fetch from api::employee.employee
 *   - 'computed': Calculate using the compute function
 */
interface MetricConfig {
    field?: string;
    source?: 'kpi' | 'entity';
    type?: 'computed';
    compute?: (data: any) => number;
    format?: 'currency';
    suffix?: string;
}

const METRIC_CONFIG: { [key: string]: MetricConfig } = {
    // ===== BRANCH METRICS (Source: api::branch-kpi.branch-kpi) =====
    // All field names use camelCase to match Strapi's return format
    'Productivity Score': { field: 'productivityScore', source: 'kpi' },
    'Revenue': { field: 'revenue', source: 'kpi', format: 'currency' },
    'Revenue Target': { field: 'revenueTarget', source: 'kpi', format: 'currency' },
    'Revenue Achievement %': {
        type: 'computed',
        compute: (kpi) => {
            if (kpi?.revenue && kpi?.revenueTarget) {
                return (kpi.revenue / kpi.revenueTarget) * 100;
            }
            return 0;
        }
    },
    'Satisfaction Score': { field: 'satisfactionScore', source: 'kpi' },
    'Growth Rate': { field: 'growthRate', source: 'kpi', suffix: '%' },
    'Employee Count': { field: 'employeeCount', source: 'kpi' },
    'Joined This Month': { field: 'joinedCount', source: 'kpi' },
    'Left This Month': { field: 'leftCount', source: 'kpi' },
    'Overdue Tasks': { field: 'overdueTaskCount', source: 'kpi' },
    'Performance Rating': { field: 'performanceRating', source: 'kpi' },

    // ===== EMPLOYEE METRICS (Source: api::employee-kpi.employee-kpi with camelCase fields) =====
    'Tasks Completed': { field: 'tasksCompleted', source: 'kpi' },
    'Tasks Total': { field: 'tasksTotal', source: 'kpi' },
    'Task Completion Rate %': {
        type: 'computed',
        compute: (kpi) => {
            if (kpi?.tasksCompleted && kpi?.tasksTotal) {
                return (kpi.tasksCompleted / kpi.tasksTotal) * 100;
            }
            return 0;
        }
    },
    'Attendance Rate': { field: 'attendanceRate', source: 'kpi', suffix: '%' },
    'Performance Score': { field: 'performanceScore', source: 'kpi' },
    'Projects Completed': { field: 'projectsCompleted', source: 'kpi' },
    'Tasks In Progress': { field: 'tasksInProgress', source: 'entity' },
    'Tasks Overdue': { field: 'tasksOverdue', source: 'entity' }
};

/**
 * Parse and standardize date range input
 * Supports multiple formats (in priority order):
 *   1. Object: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', label?: string } (PREFERRED - from frontend)
 *   2. String label: 'Last 7 days', 'Last 30 days', 'Last 90 days'
 *   3. Custom string: 'YYYY-MM-DD to YYYY-MM-DD' or formatted like 'Dec 15, 2025 - Jan 6, 2026'
 * @param dateRange - Input date range in various formats
 * @returns Standardized object with { from: Date, to: Date, label: string, fromStr: string, toStr: string }
 */
const parseDateRange = (dateRange: any): { from: Date; to: Date; label: string; fromStr: string; toStr: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let from: Date;
    let to: Date = new Date(today);
    let label: string;

    // Priority 1: Object format from frontend (most reliable)
    if (typeof dateRange === 'object' && dateRange !== null && 'from' in dateRange && 'to' in dateRange) {
        // Object format: { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', label?: string }
        from = new Date(dateRange.from);
        to = new Date(dateRange.to);
        label = dateRange.label || `${dateRange.from} to ${dateRange.to}`;
        console.log(`✅ Using object date range: ${label}`);
    } else if (typeof dateRange === 'string') {
        // Priority 2: String label like "Last X days"
        const lastDaysMatch = dateRange.match(/Last (\d+) days/i);
        if (lastDaysMatch) {
            const days = parseInt(lastDaysMatch[1], 10);
            from = new Date(today);
            from.setDate(from.getDate() - days);
            label = dateRange;
            console.log(`✅ Using preset date range: ${label}`);
        } else if (dateRange.includes(' - ')) {
            // Priority 3: Formatted string like "Dec 15, 2025 - Jan 6, 2026" or "Dec 15 - Jan 6"
            const parts = dateRange.split(' - ');
            if (parts.length === 2) {
                try {
                    from = new Date(parts[0].trim());
                    to = new Date(parts[1].trim());
                    label = dateRange;
                    console.log(`✅ Using formatted date range: ${label}`);
                } catch (e) {
                    console.warn(`⚠️ Failed to parse formatted range "${dateRange}". Defaulting to Last 30 days.`);
                    from = new Date(today);
                    from.setDate(from.getDate() - 30);
                    label = 'Last 30 days';
                }
            } else {
                from = new Date(today);
                from.setDate(from.getDate() - 30);
                label = 'Last 30 days';
            }
        } else if (dateRange.includes(' to ')) {
            // ISO format: 'YYYY-MM-DD to YYYY-MM-DD'
            const [fromStr, toStr] = dateRange.split(' to ').map(s => s.trim());
            from = new Date(fromStr);
            to = new Date(toStr);
            label = dateRange;
            console.log(`✅ Using ISO date range: ${label}`);
        } else {
            // Default to last 30 days
            from = new Date(today);
            from.setDate(from.getDate() - 30);
            label = 'Last 30 days';
        }
    } else {
        // Default: last 30 days
        from = new Date(today);
        from.setDate(from.getDate() - 30);
        label = 'Last 30 days';
    }

    // Ensure from <= to
    if (from > to) {
        const temp = from;
        from = to;
        to = temp;
    }

    // Convert to YYYY-MM-DD string format for filtering
    const fromStr = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`;
    const toStr = `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`;

    console.log(`📅 Parsed date range: "${label}" => ${fromStr} to ${toStr}`);

    return { from, to, label, fromStr, toStr };
};

/**
 * Get the latest KPI record from an array (by date, then createdAt)
 * @param records - Array of KPI records
 * @returns Latest record or null
 */
const getLatestRecord = (records: any[]): any | null => {
    if (!records || records.length === 0) return null;
    // Already sorted by date ASC, so take the last one
    return records[records.length - 1];
};

/**
 * Sum a numeric field across multiple KPI records safely
 * @param records - Array of KPI records
 * @param fieldName - Field name to sum
 * @returns Sum or 0 if no valid records
 */
const sumField = (records: any[], fieldName: string): number => {
    if (!records || records.length === 0) return 0;
    return records.reduce((sum, record) => {
        const value = record?.[fieldName];
        const numValue = typeof value === 'number' ? value : 0;
        return sum + numValue;
    }, 0);
};

/**
 * Safe number conversion with default
 * @param value - Value to convert
 * @param defaultValue - Default if conversion fails
 * @returns Number or default
 */
const safeNumber = (value: any, defaultValue: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

/**
 * Detect whether revenueTarget is daily, monthly-repeated, or static
 * Uses inspection of KPI history to determine aggregation strategy
 * @param kpiRecords - All available KPI records for a branch (sorted by date ASC)
 * @returns Object with detection mode and reason
 */
const detectRevenueTargetMode = (kpiRecords: any[]): { mode: 'daily' | 'monthly' | 'static'; reason: string } => {
    try {
        if (!kpiRecords || kpiRecords.length === 0) {
            return { mode: 'static', reason: 'No KPI records available' };
        }

        // Step 1: Extract up to 10 consecutive records with non-null revenueTarget
        const validRecords = kpiRecords.filter((r) => r?.revenueTarget != null).slice(0, 10);

        if (validRecords.length < 2) {
            return { mode: 'static', reason: 'Fewer than 2 records with valid revenueTarget' };
        }

        // Step 2: Count distinct target values in short window
        const targetValues = validRecords.map((r) => r.revenueTarget);
        const distinctTargets = new Set(targetValues).size;

        if (distinctTargets > 3) {
            strapi.log.info(`[revenueTarget mode] daily - found ${distinctTargets} distinct values in 10 consecutive records`);
            return { mode: 'daily', reason: `${distinctTargets} distinct target values in short window` };
        }

        if (distinctTargets === 1) {
            // Step 3: Check across wider sample (60-120 days) to distinguish monthly vs static
            const staticTarget = validRecords[0].revenueTarget;
            const monthlyTargets: { [key: string]: number } = {};

            // Group all records by month
            for (const record of kpiRecords) {
                if (record?.revenueTarget != null && record?.date) {
                    const dateStr = record.date; // Assuming 'YYYY-MM-DD' format
                    const monthKey = dateStr.substring(0, 7); // 'YYYY-MM'
                    // Take the last target of each month (or first; we pick last)
                    monthlyTargets[monthKey] = record.revenueTarget;
                }
            }

            const distinctMonthlyTargets = new Set(Object.values(monthlyTargets)).size;

            if (distinctMonthlyTargets > 1) {
                strapi.log.info(`[revenueTarget mode] monthly - target differs across ${distinctMonthlyTargets} months`);
                return { mode: 'monthly', reason: `Target changes across months (${distinctMonthlyTargets} distinct values)` };
            } else {
                strapi.log.info(`[revenueTarget mode] static - same target across all months`);
                return { mode: 'static', reason: 'Same target across all months' };
            }
        }

        // Step 4: 2-3 distinct values in short window → treat as daily (conservative)
        strapi.log.info(`[revenueTarget mode] daily - found ${distinctTargets} distinct values (2-3 range, conservative)`);
        return { mode: 'daily', reason: `${distinctTargets} distinct values in short window (conservative daily treatment)` };
    } catch (error) {
        strapi.log.warn(`[revenueTarget mode] Error detecting mode: ${(error as Error).message}, defaulting to static`);
        return { mode: 'static', reason: `Detection error: ${(error as Error).message}` };
    }
};

/**
 * Aggregate revenueTarget based on detected mode
 * @param kpiRecords - KPI records within the date range
 * @param allKpiRecords - All available KPI records for the branch (used for mode detection)
 * @param mode - Detected mode: 'daily', 'monthly', or 'static'
 * @returns Aggregated period target
 */
const aggregateRevenueTarget = (kpiRecords: any[], allKpiRecords: any[], mode: string): number => {
    if (!kpiRecords || kpiRecords.length === 0) {
        return 0;
    }

    try {
        if (mode === 'daily') {
            // Daily target: sum all targets in the range
            const sum = sumField(kpiRecords, 'revenueTarget');
            strapi.log.debug(`[revenueTarget daily] Summed ${kpiRecords.length} daily targets = ${sum}`);
            return sum;
        } else if (mode === 'monthly') {
            // Monthly target: sum unique targets per month in the range
            const monthlyTargets: { [key: string]: number } = {};

            for (const record of kpiRecords) {
                if (record?.revenueTarget != null && record?.date) {
                    const dateStr = record.date; // 'YYYY-MM-DD'
                    const monthKey = dateStr.substring(0, 7); // 'YYYY-MM'
                    // Take the last target of each month
                    monthlyTargets[monthKey] = record.revenueTarget;
                }
            }

            const monthlySum = Object.values(monthlyTargets).reduce((sum, val) => sum + val, 0);
            strapi.log.debug(`[revenueTarget monthly] Summed ${Object.keys(monthlyTargets).length} unique months = ${monthlySum}`);
            return monthlySum;
        } else {
            // Static target: use latest target in range
            const latestRecord = getLatestRecord(kpiRecords);
            const staticTarget = latestRecord?.revenueTarget || 0;
            strapi.log.debug(`[revenueTarget static] Using latest target = ${staticTarget}`);
            return staticTarget;
        }
    } catch (error) {
        strapi.log.warn(`[revenueTarget aggregation] Error aggregating target (mode=${mode}): ${(error as Error).message}`);
        return 0;
    }
};

/**
 * Scale revenue target based on date range
 * Treats KPI revenueTarget as a 7-day baseline, then scales to match the selected date range
 * @param fromDate - Start date of selected range
 * @param toDate - End date of selected range
 * @param baselineTarget - Target value from KPI (assumed to be 7-day baseline)
 * @returns Scaled target for the selected date range
 */
const computeScaledRevenueTarget = (fromDate: Date, toDate: Date, baselineTarget: number): number => {
    try {
        // Compute days in range (inclusive)
        const daysInRange = Math.floor((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        const safeDaysInRange = Math.max(daysInRange, 1); // Guard: minimum 1 day

        // Treat baseline as 7-day target
        const dailyTarget = baselineTarget / 7;
        const rangeTarget = dailyTarget * safeDaysInRange;

        strapi.log.info(
            `[target scaling] baseline=${baselineTarget} days=${safeDaysInRange} ` +
            `dailyTarget=${dailyTarget.toFixed(2)} rangeTarget=${rangeTarget.toFixed(2)}`
        );

        return rangeTarget;
    } catch (error) {
        strapi.log.warn(`[target scaling] Error computing scaled target: ${(error as Error).message}`);
        return 0;
    }
};

/**
 * Helper function to get metric value from KPI or Entity
 * Respects METRIC_CONFIG source directives and proper formatting:
 * - String values: returned as-is with unit: ''
 * - Count metrics: formatted as integers
 * - Numeric metrics: formatted with 2 decimals
 * - Currency: formatted with $ and commas
 * @param kpiData - The KPI object
 * @param entityData - The entity object (branch or employee)
 * @param metricLabel - Metric label from METRIC_CONFIG
 * @returns Object with { value, unit }
 */
const getMetricValue = (
    kpiData: any | null,
    entityData: any | null,
    metricLabel: string
): { value: string | number; unit: string } => {
    const config = METRIC_CONFIG[metricLabel];

    if (!config) {
        console.warn(`⚠️ Metric "${metricLabel}" not in METRIC_CONFIG. Returning 0.`);
        return { value: 0, unit: 'N/A' };
    }

    // Handle computed metrics (always use kpiData for computation)
    if (config.type === 'computed' && config.compute) {
        try {
            const computedValue = config.compute(kpiData || {});
            const suffix = config.suffix || '';
            return { value: Number(computedValue).toFixed(2), unit: suffix };
        } catch (error) {
            console.warn(`⚠️ Error computing metric "${metricLabel}":`, error);
            return { value: 0, unit: 'N/A' };
        }
    }

    // Handle direct field retrieval - source-driven
    if (config.field && config.source) {
        let sourceObject: any = null;

        if (config.source === 'kpi') {
            sourceObject = kpiData;
        } else if (config.source === 'entity') {
            sourceObject = entityData;
        }

        if (!sourceObject) {
            console.warn(`⚠️ No data available for ${config.source} source for metric "${metricLabel}". Defaulting to 0.`);
            return { value: 0, unit: 'N/A' };
        }

        const value = sourceObject[config.field];

        if (value === undefined || value === null) {
            console.warn(`⚠️ Field "${config.field}" not found in ${config.source} data. Defaulting to 0.`);
            return { value: 0, unit: 'N/A' };
        }

        // If value is a string, return as-is (e.g., performanceRating: "average")
        if (typeof value === 'string') {
            return { value, unit: '' };
        }

        // Format currency if needed
        if (config.format === 'currency') {
            return {
                value: `$${Number(value).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`,
                unit: ''
            };
        }

        // Check if this is a count metric (should be formatted as integer)
        const isCountMetric =
            metricLabel.includes('Count') ||
            metricLabel === 'Joined This Month' ||
            metricLabel === 'Left This Month' ||
            metricLabel === 'Overdue Tasks';

        if (isCountMetric) {
            return { value: Math.round(Number(value)), unit: '' };
        }

        // For regular numeric values, format with 2 decimals
        const suffix = config.suffix || '';
        return { value: Number(value).toFixed(2), unit: suffix };
    }

    return { value: 0, unit: 'N/A' };
};

/**
 * Helper function to resolve employee identifiers
 * Tries multiple stable identifier strategies before name matching
 * @param employees - Array of identifiers (documentId, employee_number, email, or name)
 * @returns Array of resolved employee records with fallback structure
 */
const resolveEmployees = async (strapi: any, employees: string[]): Promise<Array<{
    documentId: string;
    name: string;
    first_name?: string;
    last_name?: string;
    [key: string]: any;
}>> => {
    const resolved: Map<string, any> = new Map();

    // Strategy 1: Try documentId match
    try {
        const byDocId = await strapi.documents('api::employee.employee').findMany({
            filters: { documentId: { $in: employees } }
        });
        byDocId.forEach(emp => {
            resolved.set(emp.documentId, emp);
            console.log(`✅ Found employee by documentId: ${emp.name || emp.first_name + ' ' + emp.last_name} (${emp.documentId})`);
        });
    } catch (err) {
        console.warn('⚠️ Error querying by documentId:', (err as Error).message);
    }

    // Strategy 2: Try employee_number (numeric field)
    const employeeNumsToTry = employees.filter(e => /^\d+$/.test(e) && !resolved.has(e));
    if (employeeNumsToTry.length > 0) {
        try {
            const byEmpNum = await strapi.documents('api::employee.employee').findMany({
                filters: { employee_number: { $in: employeeNumsToTry } }
            });
            byEmpNum.forEach(emp => {
                if (emp.employee_number) {
                    resolved.set(emp.employee_number, emp);
                }
            });
        } catch (err) {
            console.warn('⚠️ Error querying by employee_number:', (err as Error).message);
        }
    }

    // Strategy 3: Try email match
    const emailsToTry = employees.filter(e => e.includes('@') && !resolved.has(e));
    if (emailsToTry.length > 0) {
        try {
            const byEmail = await strapi.documents('api::employee.employee').findMany({
                filters: { email: { $in: emailsToTry } }
            });
            byEmail.forEach(emp => {
                if (emp.email) {
                    resolved.set(emp.email, emp);
                }
            });
        } catch (err) {
            console.warn('⚠️ Error querying by email:', (err as Error).message);
        }
    }

    // Strategy 4: Try name matching (case-insensitive, partial match)
    const namesToTry = employees.filter(e => !resolved.has(e));
    if (namesToTry.length > 0) {
        try {
            const allEmployees = await strapi.documents('api::employee.employee').findMany({
                limit: 1000
            });

            namesToTry.forEach(nameQuery => {
                const lowerQuery = nameQuery.toLowerCase();
                const match = allEmployees.find(emp => {
                    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase().trim();
                    const empName = (emp.name || '').toLowerCase();
                    return fullName.includes(lowerQuery) || empName.includes(lowerQuery);
                });
                if (match) {
                    resolved.set(nameQuery, match);
                }
            });
        } catch (err) {
            console.warn('⚠️ Error querying by name:', (err as Error).message);
        }
    }

    // Build final array, include unmatched employees with placeholder
    return employees.map(identifier => {
        const resolved_emp = resolved.get(identifier);
        if (resolved_emp) {
            return resolved_emp;
        }
        // Return placeholder for unmatched employees
        return {
            documentId: `unmatched_${identifier}`,
            name: identifier,
            first_name: 'Unknown',
            last_name: 'Employee'
        };
    });
};

/**
 * Helper to resolve employee documentIds to numeric IDs
 * @param strapi - Strapi instance
 * @param employeeDocIds - Array of employee documentIds
 * @returns Map of documentId -> {id, documentId, firstName, lastName}
 */
const resolveEmployeeIds = async (
    strapi: any,
    employeeDocIds: string[]
): Promise<Map<string, any>> => {
    const idMap = new Map<string, any>();

    if (employeeDocIds.length === 0) {
        return idMap;
    }

    try {
        const employees = await strapi.documents('api::employee.employee').findMany({
            filters: { documentId: { $in: employeeDocIds } },
            fields: ['documentId', 'firstName', 'lastName']
        });

        employees.forEach((emp: any) => {
            if (emp.documentId) {
                idMap.set(emp.documentId, {
                    id: emp.id,
                    documentId: emp.documentId,
                    firstName: emp.firstName,
                    lastName: emp.lastName
                });
            }
        });

        console.log(`✅ Resolved ${idMap.size}/${employeeDocIds.length} employee documentIds to numeric IDs`);
    } catch (err) {
        console.error('❌ Error resolving employee IDs:', (err as Error).message);
        strapi.log.error(`[resolve employee IDs] Error: ${(err as Error).message}`);
    }

    return idMap;
};

/**
 * Helper to fetch latest KPI per employee within date range using numeric IDs
 * Uses strapi.db.query for reliability with Strapi v5
 * @param strapi - Strapi instance
 * @param numericEmployeeIds - Array of numeric employee IDs
 * @param fromStr - Start date in YYYY-MM-DD format
 * @param toStr - End date in YYYY-MM-DD format
 * @returns Map of numericId -> latestKpiRecord
 */
const getLatestKpisPerEmployee = async (
    strapi: any,
    numericEmployeeIds: number[],
    fromStr: string,
    toStr: string
): Promise<Map<number, any>> => {
    const kpiMap = new Map<number, any>();

    if (numericEmployeeIds.length === 0) {
        return kpiMap;
    }

    try {
        console.log(`📅 Querying KPIs with date range: ${fromStr} to ${toStr}, employees: ${numericEmployeeIds.length}`);

        // Use strapi.db.query for Strapi v5 compatibility and reliability
        const allKpis = await strapi.db.query('api::employee-kpi.employee-kpi').findMany({
            where: {
                employee: { id: { $in: numericEmployeeIds } },
                date: { $between: [fromStr, toStr] }
            },
            populate: { employee: { select: ['id', 'firstName', 'lastName', 'documentId'] } },
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
        });

        console.log(`📊 Fetched ${allKpis.length} KPI records for ${numericEmployeeIds.length} employee(s)`);

        // Map: first occurrence per employee ID (already sorted newest first)
        allKpis.forEach((kpi: any) => {
            const empId = kpi?.employee?.id;
            if (empId && !kpiMap.has(empId)) {
                kpiMap.set(empId, kpi);
                console.log(`  ✓ Employee ${empId}: tasksCompleted=${kpi.tasksCompleted}, tasksTotal=${kpi.tasksTotal}, date=${kpi.date}`);
            }
        });

        console.log(`✅ Built latest-KPI map for ${kpiMap.size}/${numericEmployeeIds.length} employees`);
    } catch (err) {
        console.error('❌ Error fetching employee KPIs:', (err as Error).message);
        strapi.log.error(`[employee-kpi fetch] Error: ${(err as Error).message}`);
    }

    return kpiMap;
};

export default ({ strapi }) => ({
    /**
     * Generate a branch performance report with REAL database data
     * Only accepts metrics from METRIC_CONFIG (Data Team safe fields)
     * Queries: api::branch.branch and api::branch-kpi.branch-kpi
     * POST /api/report-generator/branch
     */
    async generateBranchReport(ctx) {
        try {
            // Accept both 'kpis' and 'metrics' for backwards compatibility
            const body = ctx.request.body as any;
            const requestedMetrics = body.metrics || body.kpis || [];
            const { branch, dateRange, format } = body;

            // 1. Validation
            if (!branch || requestedMetrics.length === 0 || !dateRange || !format) {
                return ctx.badRequest(
                    'Missing required fields: branch, metrics (or kpis), dateRange, format'
                );
            }

            // Reject "All" branch - must select a specific branch for reporting
            // This prevents querying/aggregating all branches which is not supported
            if (typeof branch === 'string' && branch.toLowerCase() === 'all') {
                return ctx.badRequest(
                    'Branch is required. Please select a specific branch.'
                );
            }

            if (!Array.isArray(requestedMetrics)) {
                return ctx.badRequest('Metrics must be an array');
            }

            if (!['PDF', 'CSV'].includes(format)) {
                return ctx.badRequest('Invalid format. Must be PDF or CSV');
            }

            // Filter to only supported metrics (ignore unknown ones, don't crash)
            const supportedMetrics = requestedMetrics.filter(
                (m: string) => METRIC_CONFIG[m]
            );

            if (supportedMetrics.length === 0) {
                console.warn(
                    `⚠️ No supported metrics requested. Available: ${Object.keys(METRIC_CONFIG).join(', ')}`
                );
                return ctx.badRequest('No valid metrics requested');
            }

            if (supportedMetrics.length < requestedMetrics.length) {
                const unsupported = requestedMetrics.filter(
                    (m: string) => !METRIC_CONFIG[m]
                );
                console.warn(`⚠️ Ignoring unsupported metrics: ${unsupported.join(', ')}`);
            }

            console.log('🔄 Branch report request:', {
                branch,
                metrics: supportedMetrics,
                dateRange,
                format
            });

            // 2. Find the Branch to get its documentId
            let branchData: any = null;
            try {
                const branches = await strapi.documents('api::branch.branch').findMany({
                    filters: { name: { $eq: branch } },
                    limit: 1
                });

                if (branches.length > 0) {
                    branchData = branches[0];
                    console.log('✅ Found branch in database:', branchData.name);
                } else {
                    console.warn(`⚠️ Branch "${branch}" not found in database`);
                    // Return graceful degradation: branch not found but still generate report with N/A values
                    branchData = { name: branch, documentId: null };
                }
            } catch (queryError) {
                console.error('❌ Error querying branch:', (queryError as Error).message);
                return ctx.internalServerError('Failed to query branch data');
            }

            // 3. Parse date range and query Branch KPI data within that period
            let parsedRange = { from: new Date(), to: new Date(), label: '', fromStr: '', toStr: '' };
            let kpiRecords: any[] = [];
            let allBranchKpiRecords: any[] = []; // For mode detection

            try {
                parsedRange = parseDateRange(dateRange);

                if (branchData?.documentId) {
                    // Query all KPI records within the date range (for selected period)
                    kpiRecords = await strapi.documents('api::branch-kpi.branch-kpi').findMany({
                        filters: {
                            branch: { documentId: { $eq: branchData.documentId } },
                            date: { $gte: parsedRange.fromStr, $lte: parsedRange.toStr }
                        },
                        sort: [{ date: 'asc' }, { createdAt: 'asc' }],
                        limit: 5000
                    });

                    // Query ALL KPI records for the branch (for target mode detection)
                    // This helps us understand if targets are daily, monthly, or static
                    try {
                        allBranchKpiRecords = await strapi.documents('api::branch-kpi.branch-kpi').findMany({
                            filters: {
                                branch: { documentId: { $eq: branchData.documentId } }
                            },
                            sort: [{ date: 'asc' }, { createdAt: 'asc' }],
                            limit: 5000
                        });
                        console.log(`✅ Fetched ${allBranchKpiRecords.length} total KPI records for target mode detection`);
                    } catch (allKpiError) {
                        console.warn('⚠️ Failed to fetch all KPI records for mode detection, using range KPIs only:', (allKpiError as Error).message);
                        allBranchKpiRecords = kpiRecords; // Fallback to range KPIs
                    }

                    if (kpiRecords.length > 0) {
                        console.log(`✅ Found ${kpiRecords.length} KPI records for branch "${branch}" in date range ${parsedRange.fromStr} to ${parsedRange.toStr}`);
                        strapi.log.info(`[branch-kpi records] Date range: ${parsedRange.fromStr} to ${parsedRange.toStr}, Count: ${kpiRecords.length}`);
                    } else {
                        console.warn(`⚠️ No KPI records found for branch "${branch}" in range ${parsedRange.fromStr} to ${parsedRange.toStr}. Returning defaults.`);
                    }
                }
            } catch (dateError) {
                console.warn('⚠️ Error parsing date range or querying KPIs:', (dateError as Error).message);
                // Continue with empty records - will use defaults
            }

            // 4. Detect revenue target mode
            const targetModeDetection = detectRevenueTargetMode(allBranchKpiRecords);
            console.log(`📊 Target mode detection: ${targetModeDetection.mode} - ${targetModeDetection.reason}`);

            // 5. Get latest record for snapshot metrics
            const latestKpi = getLatestRecord(kpiRecords);

            // 6. Compute metrics with aggregation rules
            // Rules:
            //   - Snapshot metrics: use latest record in range
            //   - Summation metrics: sum across range
            //   - Computed metrics: use aggregated data
            //   - Revenue Target: aggregated based on detected mode
            const reportMetrics = supportedMetrics.map((metric: string) => {
                const config = METRIC_CONFIG[metric];
                let metricValue: { value: string | number; unit: string };

                // Define snapshot metrics (use latest record)
                const snapshotMetrics = [
                    'Productivity Score', 'Satisfaction Score', 'Growth Rate',
                    'Employee Count', 'Performance Rating', 'Overdue Tasks'
                ];

                // Define summation metrics (sum across range)
                const summationMetrics = [
                    'Revenue', 'Joined This Month', 'Left This Month'
                ];

                if (metric === 'Revenue Achievement %') {
                    // Special computed metric: total revenue (sum) / scaled period target
                    const totalRevenue = sumField(kpiRecords, 'revenue');

                    // Get baseline target from latest KPI in range, fallback to latest overall
                    let baselineTarget = latestKpi?.revenueTarget ?? 0;
                    if (baselineTarget === 0 && allBranchKpiRecords.length > 0) {
                        const latestOverall = getLatestRecord(allBranchKpiRecords);
                        baselineTarget = latestOverall?.revenueTarget ?? 0;
                        console.log(`ℹ️ Using latest overall baseline target: ${baselineTarget}`);
                    }

                    // Compute scaled target for the date range
                    const scaledTarget = computeScaledRevenueTarget(parsedRange.from, parsedRange.to, baselineTarget);
                    const achievement = scaledTarget > 0 ? (totalRevenue / scaledTarget) * 100 : 0;

                    console.log(`💰 Revenue Achievement: ${totalRevenue} / ${scaledTarget.toFixed(2)} = ${achievement.toFixed(2)}%`);
                    metricValue = { value: Number(achievement).toFixed(2), unit: '%' };
                } else if (metric === 'Revenue Target') {
                    // Scale target to match the date range
                    let baselineTarget = latestKpi?.revenueTarget ?? 0;
                    if (baselineTarget === 0 && allBranchKpiRecords.length > 0) {
                        const latestOverall = getLatestRecord(allBranchKpiRecords);
                        baselineTarget = latestOverall?.revenueTarget ?? 0;
                        console.log(`ℹ️ Using latest overall baseline target: ${baselineTarget}`);
                    }

                    // Compute scaled target for the date range
                    const scaledTarget = computeScaledRevenueTarget(parsedRange.from, parsedRange.to, baselineTarget);

                    metricValue = {
                        value: `$${Number(scaledTarget).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`,
                        unit: ''
                    };
                    console.log(`🎯 Scaled Revenue Target: ${scaledTarget.toFixed(2)}`);
                } else if (summationMetrics.includes(metric)) {
                    // Sum-based metrics
                    const fieldName = config?.field || '';
                    const sum = sumField(kpiRecords, fieldName);

                    // Format based on metric type
                    if (metric === 'Revenue') {
                        metricValue = {
                            value: `$${Number(sum).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}`,
                            unit: ''
                        };
                    } else if (metric === 'Joined This Month' || metric === 'Left This Month') {
                        // Count metrics - format as integers
                        metricValue = { value: Math.round(sum), unit: '' };
                    } else {
                        metricValue = { value: Number(sum).toFixed(2), unit: config?.suffix || '' };
                    }
                } else if (snapshotMetrics.includes(metric)) {
                    // Snapshot metrics use latest record
                    metricValue = getMetricValue(latestKpi, branchData, metric);
                } else if (config?.type === 'computed') {
                    // Computed metrics - use latest record for computation
                    metricValue = getMetricValue(latestKpi, branchData, metric);
                } else {
                    // Default: use latest record
                    metricValue = getMetricValue(latestKpi, branchData, metric);
                }

                return {
                    name: metric,
                    value: metricValue.value,
                    unit: metricValue.unit
                };
            });

            // 7. Build KPI time-series data for chart generation
            const series = {
                dates: kpiRecords.map((r) => r.date || ''),
                revenue: kpiRecords.map((r) => Number(r.revenue ?? 0)),
                productivityScore: kpiRecords.map((r) => Number(r.productivityScore ?? 0)),
                joinedCount: kpiRecords.map((r) => Number(r.joinedCount ?? 0)),
                leftCount: kpiRecords.map((r) => Number(r.leftCount ?? 0))
            };

            console.log(`📊 Time-series data: ${series.dates.length} data points for charts`);

            // 8. Prepare Report Data
            const reportData = {
                type: 'Branch',
                title: `Branch Performance Report - ${branch}`,
                branch: branchData?.name || branch,
                dateRange: parsedRange.label,
                generatedDate: new Date().toISOString(),
                generatedBy: ctx.state.user?.email || 'System',
                metrics: reportMetrics,
                targetMode: targetModeDetection.mode, // Include for debugging
                series: series // Include for chart generation
            };

            // 8. Generate File
            let fileBuffer: Buffer;
            let contentType = format === 'PDF' ? 'application/pdf' : 'text/csv';
            let filename = `branch_${branch.replace(/\s+/g, '_')}_${Date.now()}.${format.toLowerCase()}`;

            if (format === 'PDF') {
                fileBuffer = await strapi
                    .service('api::report-generator.report-generator')
                    .generatePDF(reportData);
            } else {
                fileBuffer = await strapi
                    .service('api::report-generator.report-generator')
                    .generateCSV(reportData);
            }

            // 9. Store Report Metadata
            try {
                // Build chartData for history re-rendering (saves the series data as JSON)
                const chartData = {
                    // Revenue chart data
                    revenue: {
                        labels: series.dates,
                        datasets: [{
                            label: 'Revenue',
                            data: series.revenue
                        }]
                    },
                    // Productivity chart data
                    productivity: {
                        labels: series.dates,
                        datasets: [{
                            label: 'Productivity Score',
                            data: series.productivityScore
                        }]
                    },
                    // Employee movement chart data
                    movement: {
                        labels: series.dates,
                        datasets: [
                            { label: 'Joined', data: series.joinedCount },
                            { label: 'Left', data: series.leftCount }
                        ]
                    }
                };

                await strapi.documents('api::report.report').create({
                    data: {
                        title: reportData.title,
                        description: `Branch report for ${branch}`,
                        reportType: 'performance',
                        scope: 'branch',
                        generatedBy: ctx.state.user?.id || null,
                        dateFrom: parsedRange.fromStr,
                        dateTo: parsedRange.toStr,
                        reportData: {
                            metrics: reportMetrics, // Store full metrics array with { name, value, unit }
                            requestedMetrics: supportedMetrics, // Also keep requested names for reference
                            dateRange: parsedRange.label, // Use parsed label for display
                            dateRangeFrom: parsedRange.fromStr, // Store exact date range used
                            dateRangeTo: parsedRange.toStr,
                            branch,
                            format,
                            series: series, // Store raw series for chart re-generation
                            chartData: chartData // Store structured chart data for history
                        }
                    }
                });
                console.log('✅ Report metadata stored in database (with chart data)');
            } catch (dbError) {
                console.warn('⚠️ Could not save report history (non-fatal):', (dbError as Error).message);
            }

            // 8. Send File Response
            ctx.set('Content-Type', contentType);
            ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
            ctx.body = fileBuffer;

            console.log(`✅ Branch report file generated: ${filename}`);
        } catch (error) {
            console.error('❌ Report Generation Error:', error);
            ctx.throw(500, 'Failed to generate branch report');
        }
    },

    /**
     * Generate an employee performance report with REAL database data
     * Only accepts metrics from METRIC_CONFIG (Data Team safe fields)
     * Queries: api::employee.employee and api::employee-kpi.employee-kpi
     * POST /api/report-generator/employee
     */
    async generateEmployeeReport(ctx) {
        try {
            // Accept both 'metrics' and 'kpis' for backwards compatibility
            const body = ctx.request.body as any;
            const employees = body.employees || [];
            const requestedMetrics = body.metrics || body.kpis || [];
            const { dateRange, format } = body;

            // 1. Validation
            if (employees.length === 0 || requestedMetrics.length === 0 || !dateRange || !format) {
                return ctx.badRequest(
                    'Missing required fields: employees, metrics (or kpis), dateRange, format'
                );
            }

            if (!Array.isArray(employees) || !Array.isArray(requestedMetrics)) {
                return ctx.badRequest('Employees and metrics must be arrays');
            }

            if (!['PDF', 'CSV'].includes(format)) {
                return ctx.badRequest('Invalid format. Must be PDF or CSV');
            }

            // Filter to only supported metrics (ignore unknown ones, don't crash)
            const supportedMetrics = requestedMetrics.filter(
                (m: string) => METRIC_CONFIG[m]
            );

            if (supportedMetrics.length === 0) {
                console.warn(
                    `⚠️ No supported metrics requested. Available: ${Object.keys(METRIC_CONFIG).join(', ')}`
                );
                return ctx.badRequest('No valid metrics requested');
            }

            if (supportedMetrics.length < requestedMetrics.length) {
                const unsupported = requestedMetrics.filter(
                    (m: string) => !METRIC_CONFIG[m]
                );
                console.warn(`⚠️ Ignoring unsupported metrics: ${unsupported.join(', ')}`);
            }

            console.log('🔄 Employee report request:', {
                employees: employees.map(e => `${e} (${typeof e})`),  // Log types for debugging
                metrics: supportedMetrics,
                dateRange,
                format
            });
            console.log(`📋 [employee-report] incoming employees=${JSON.stringify(employees)}`);

            // Strapi structured log
            strapi.log.info(`[employee-report] incoming request - employees=${JSON.stringify(employees)}, metrics=${supportedMetrics.length}`);

            // Normalize employee identifiers: convert numeric IDs to strings
            const normalizedEmployees = employees.map(e => String(e));
            console.log(`📋 Normalized employees: ${normalizedEmployees.join(', ')}`);

            // 2. Resolve employee identifiers using multiple strategies
            const resolvedEmployees = await resolveEmployees(strapi, normalizedEmployees);
            const matchedCount = resolvedEmployees.filter(
                emp => !emp.documentId.startsWith('unmatched_')
            ).length;

            console.log(`✅ Resolved ${matchedCount}/${employees.length} employees`);

            // Log resolved documentIds for verification
            const resolvedDocIds = resolvedEmployees
                .filter(e => !e.documentId.startsWith('unmatched_'))
                .map(e => e.documentId);
            console.log(`📋 [employee-report] resolved documentIds=${JSON.stringify(resolvedDocIds)}`);

            // Strapi structured log
            strapi.log.info(`[employee-report] resolution - matched=${matchedCount}/${employees.length}, documentIds=${JSON.stringify(resolvedDocIds)}`);

            const unmatchedCount = resolvedEmployees.filter(e => e.documentId.startsWith('unmatched_')).length;
            if (unmatchedCount > 0) {
                console.warn(`⚠️ [employee-report] ${unmatchedCount} employee(s) could not be resolved`);
                strapi.log.warn(`[employee-report] ${unmatchedCount} employee(s) could not be resolved`);
            }

            // ✅ FAIL FAST: If no employees matched, return error instead of generating "Unknown Employee" report
            if (matchedCount === 0) {
                console.error(`❌ [employee-report] CRITICAL: No employees could be resolved from input: ${JSON.stringify(employees)}`);
                strapi.log.error(`[employee-report] CRITICAL: No employees resolved from input=${JSON.stringify(employees)}`);
                return ctx.badRequest(
                    `Unable to resolve employees. Backend expected documentId strings (e.g., "q4y2r4xsqpt6goy015w6akfe"), but received: ${JSON.stringify(employees)}. Ensure frontend sends employee.documentId values, not numeric IDs.`
                );
            }

            // 3. Parse date range
            let parsedRange = { from: new Date(), to: new Date(), label: '', fromStr: '', toStr: '' };
            try {
                parsedRange = parseDateRange(dateRange);
                console.log(`✅ Parsed date range: "${parsedRange.label}" => ${parsedRange.fromStr} to ${parsedRange.toStr}`);
            } catch (dateError) {
                console.warn('⚠️ Error parsing date range:', (dateError as Error).message);
                parsedRange.label = 'Last 30 days (default)';
                strapi.log.warn(`[employee-report] Date parsing failed, using default: ${(dateError as Error).message}`);
            }

            // 4. Resolve employee documentIds to numeric IDs (required for KPI query in Strapi v5)
            const docIdToEmployee = await resolveEmployeeIds(strapi, resolvedDocIds);
            const numericEmployeeIds: number[] = [];

            resolvedDocIds.forEach(docId => {
                const emp = docIdToEmployee.get(docId);
                if (emp?.id) {
                    numericEmployeeIds.push(emp.id);
                }
            });

            if (numericEmployeeIds.length === 0) {
                console.warn('⚠️ No numeric employee IDs could be resolved');
                return ctx.badRequest('Could not resolve employee IDs for KPI query');
            }

            console.log(`🔢 Resolved numeric IDs: ${numericEmployeeIds.join(', ')}`);

            // 5. Fetch KPIs using numeric IDs (Strapi v5 Documents API rejects nested relation keys)
            const kpiMapByNumericId = await getLatestKpisPerEmployee(
                strapi,
                numericEmployeeIds,
                parsedRange.fromStr,
                parsedRange.toStr
            );

            // 6. Build report metrics for each employee
            const reportMetrics: any[] = [];

            resolvedEmployees.forEach((emp, empIdx) => {
                // Get numeric ID for this employee
                const empData = docIdToEmployee.get(emp.documentId);
                const numericId = empData?.id;

                // Look up KPI using numeric ID
                const kpiData = numericId ? kpiMapByNumericId.get(numericId) : null;

                // Build employee name from firstName + lastName (schema uses PascalCase)
                const employeeName = empData
                    ? `${empData.firstName || ''} ${empData.lastName || ''}`.trim()
                    : emp.name || emp.documentId;

                console.log(`🧑 Employee ${empIdx + 1}/${resolvedEmployees.length}: ${employeeName} (${emp.documentId}, id=${numericId})`);
                if (!kpiData) {
                    console.warn(`  ⚠️ No KPI data found`);
                }

                supportedMetrics.forEach((metric: string) => {
                    const metricValue = getMetricValue(kpiData, emp, metric);

                    if (empIdx === 0) {
                        console.log(`  🧮 "${metric}" => ${metricValue.value}${metricValue.unit}`);
                    }

                    reportMetrics.push({
                        employeeName,
                        name: metric,
                        value: metricValue.value,
                        unit: metricValue.unit
                    });
                });
            });

            // 7. Generate comparison chart for Employee PDF report
            const charts: Buffer[] = [];
            
            if (format === 'PDF') {
                try {
                    // Build data for bar chart comparing employees
                    // Use Productivity Score or Tasks Completed as the primary comparison metric
                    const chartMetric = supportedMetrics.includes('Productivity Score') 
                        ? 'Productivity Score' 
                        : supportedMetrics.includes('Tasks Completed')
                            ? 'Tasks Completed'
                            : supportedMetrics[0];

                    const employeeNames: string[] = [];
                    const employeeValues: number[] = [];

                    // Group metrics by employee and extract the chart metric value
                    const employeeMetricMap = new Map<string, number>();
                    reportMetrics.forEach((m: any) => {
                        if (m.name === chartMetric) {
                            employeeMetricMap.set(m.employeeName, parseFloat(m.value) || 0);
                        }
                    });

                    employeeMetricMap.forEach((value, name) => {
                        employeeNames.push(name);
                        employeeValues.push(value);
                    });

                    if (employeeNames.length > 0) {
                        // Generate bar chart
                        const chartConfig = {
                            type: 'bar' as const,
                            data: {
                                labels: employeeNames,
                                datasets: [{
                                    label: chartMetric,
                                    data: employeeValues,
                                    backgroundColor: [
                                        'rgba(99, 102, 241, 0.7)',
                                        'rgba(168, 85, 247, 0.7)',
                                        'rgba(236, 72, 153, 0.7)',
                                        'rgba(34, 197, 94, 0.7)',
                                        'rgba(234, 179, 8, 0.7)',
                                        'rgba(249, 115, 22, 0.7)',
                                        'rgba(14, 165, 233, 0.7)',
                                        'rgba(20, 184, 166, 0.7)'
                                    ],
                                    borderColor: [
                                        'rgba(99, 102, 241, 1)',
                                        'rgba(168, 85, 247, 1)',
                                        'rgba(236, 72, 153, 1)',
                                        'rgba(34, 197, 94, 1)',
                                        'rgba(234, 179, 8, 1)',
                                        'rgba(249, 115, 22, 1)',
                                        'rgba(14, 165, 233, 1)',
                                        'rgba(20, 184, 166, 1)'
                                    ],
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                responsive: false,
                                plugins: {
                                    legend: { display: true, position: 'top' as const },
                                    title: { 
                                        display: true, 
                                        text: `Employee Comparison: ${chartMetric}`,
                                        font: { size: 14 }
                                    }
                                },
                                scales: {
                                    y: { 
                                        beginAtZero: true,
                                        title: { display: true, text: chartMetric }
                                    },
                                    x: {
                                        title: { display: true, text: 'Employees' }
                                    }
                                }
                            }
                        };

                        const chartBuffer = await renderEmployeeChartPng(chartConfig);
                        charts.push(chartBuffer);
                        console.log(`📊 Generated employee comparison chart for "${chartMetric}"`);
                    }
                } catch (chartError) {
                    console.warn(`⚠️ Failed to generate employee chart: ${(chartError as Error).message}`);
                }
            }

            // 8. Prepare Report Data
            // Build chartData object for saving to database (enables chart re-rendering from history)
            let chartData: { labels: string[]; datasets: { label: string; data: number[] }[] } | null = null;
            
            // Use the same metric selection logic as chart generation
            const chartMetric = supportedMetrics.includes('Productivity Score') 
                ? 'Productivity Score' 
                : supportedMetrics.includes('Tasks Completed')
                    ? 'Tasks Completed'
                    : supportedMetrics[0];

            const chartLabels: string[] = [];
            const chartValues: number[] = [];

            // Group metrics by employee and extract the chart metric value
            const employeeMetricMap = new Map<string, number>();
            reportMetrics.forEach((m: any) => {
                if (m.name === chartMetric) {
                    employeeMetricMap.set(m.employeeName, parseFloat(m.value) || 0);
                }
            });

            employeeMetricMap.forEach((value, name) => {
                chartLabels.push(name);
                chartValues.push(value);
            });

            if (chartLabels.length > 0) {
                chartData = {
                    labels: chartLabels,
                    datasets: [{
                        label: chartMetric,
                        data: chartValues
                    }]
                };
            }

            const reportData = {
                type: 'Employee',
                title: 'Employee KPI Report',
                employees: resolvedEmployees.map(
                    emp =>
                        emp.name ||
                        `${emp.first_name || ''} ${emp.last_name || ''}`.trim()
                ),
                dateRange: parsedRange.label,  // Use parsed label instead of raw input
                generatedDate: new Date().toISOString(),
                generatedBy: ctx.state.user?.email || 'System',
                metrics: reportMetrics,
                charts: charts,  // Include chart buffers for PDF generation
                chartData: chartData  // Include chartData for saving to database
            };

            // 9. Generate File
            let fileBuffer: Buffer;
            let contentType = format === 'PDF' ? 'application/pdf' : 'text/csv';
            let filename = `employee_report_${Date.now()}.${format.toLowerCase()}`;

            if (format === 'PDF') {
                fileBuffer = await strapi
                    .service('api::report-generator.report-generator')
                    .generatePDF(reportData);
            } else {
                fileBuffer = await strapi
                    .service('api::report-generator.report-generator')
                    .generateCSV(reportData);
            }

            // 8. Store Report Metadata
            try {
                await strapi.documents('api::report.report').create({
                    data: {
                        title: reportData.title,
                        description: `Employee report for ${resolvedEmployees.length} staff`,
                        reportType: 'kpi',
                        scope: 'employee',
                        generatedBy: ctx.state.user?.id || null,
                        dateFrom: parsedRange.fromStr,
                        dateTo: parsedRange.toStr,
                        reportData: {
                            metrics: reportMetrics, // Store full metrics array with { employeeName, name, value, unit }
                            requestedMetrics: supportedMetrics, // Also keep requested names for reference
                            employees,
                            dateRange: parsedRange.label,  // Store parsed label
                            format,
                            chartData: chartData  // Store chart data for history re-rendering
                        }
                    }
                });
                console.log('✅ Report metadata stored in database');
            } catch (dbError) {
                console.warn('⚠️ Could not save report history (non-fatal):', (dbError as Error).message);
            }

            // 9. Send File Response
            ctx.set('Content-Type', contentType);
            ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
            ctx.body = fileBuffer;

            console.log(`✅ Employee report file generated: ${filename}`);
        } catch (error) {
            console.error('❌ Error generating employee report:', error);
            ctx.throw(500, 'Failed to generate employee report');
        }
    },
    /**
     * Get report generation history
     * GET /api/report-generator/history
     */
    async getReportHistory(ctx) {
        try {
            const { limit = 50 } = ctx.query;

            console.log('🔄 Fetching report history...');

            // Use Strapi v5 Documents API
            const reports = await strapi.documents('api::report.report').findMany({
                sort: { createdAt: 'desc' },
                limit: parseInt(limit as string) || 50
            });

            const formattedReports = reports.map(report => {
                // Safely extract the JSON data
                const data = report.reportData || {};

                return {
                    id: report.documentId || report.id,
                    title: report.title,
                    description: report.description,
                    type: report.reportType,
                    scope: report.scope,
                    generatedDate: report.createdAt,
                    generatedBy: report.generatedBy?.email || 'System',

                    // Ensure 'kpis' array is never undefined
                    kpis: data.kpis || data.metrics || [],
                    branch: data.branch,
                    employees: data.employees || [],
                    format: data.format || 'PDF',

                    dateRange: {
                        from: report.dateFrom || data.dateRangeFrom || data.from || new Date().toISOString(),
                        to: report.dateTo || data.dateRangeTo || data.to || new Date().toISOString()
                    }
                };
            });

            console.log(`✅ Fetched ${formattedReports.length} reports`);
            ctx.body = formattedReports;
        } catch (error) {
            console.error('❌ History Error:', error);
            ctx.throw(500, 'Failed to fetch history');
        }
    },

    /**
     * Download a previously generated report by ID
     * Supports both file-based downloads (if fileUrl exists) and regeneration from stored metrics
     * GET /api/report-generator/download/:documentId
     */
    async downloadReport(ctx) {
        try {
            const { documentId } = ctx.params;

            // 1. Find the report data
            const report = await strapi.documents('api::report.report').findOne({
                documentId: documentId,
            });

            if (!report) {
                return ctx.notFound('Report not found');
            }

            const data = report.reportData || {};
            const format = data.format || 'PDF';

            // 2. Check if file exists on disk (file-based download)
            // Strapi returns relative URLs like /uploads/file.pdf
            const fileUrl = data.fileUrl || report.fileUrl;
            if (fileUrl) {
                // Construct absolute path from relative URL
                const filePath = path.join(process.cwd(), 'public', fileUrl);
                
                // Verify file exists before streaming
                if (fs.existsSync(filePath)) {
                    const ext = path.extname(filePath).toLowerCase();
                    const contentType = ext === '.pdf' ? 'application/pdf' : 'text/csv';
                    const filename = path.basename(filePath);
                    
                    ctx.set('Content-Type', contentType);
                    ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
                    ctx.body = fs.createReadStream(filePath);
                    
                    console.log(`✅ Report streamed from file: ${filePath}`);
                    return;
                } else {
                    console.warn(`⚠️ File not found at path: ${filePath}. Falling back to regeneration.`);
                }
            }

            // 3. Fallback: Regenerate file using stored metrics (no KPI query regeneration)
            // Prepare Data for Service - use stored metrics directly
            const serviceData = {
                ...data,
                type: report.scope === 'branch' ? 'Branch' : 'Employee',
                title: report.title,
                generatedBy: 'System (History)',
                dateRange: data.dateRange || (report.dateFrom && report.dateTo ? `${report.dateFrom} - ${report.dateTo}` : 'N/A'),
                // metrics array is already in data from stored reportData
                metrics: data.metrics || [],
                employees: data.employees || [],
                // Include series data for Branch chart re-generation
                series: data.series || null,
                // Include chartData for both Branch and Employee chart re-generation
                chartData: data.chartData || null
            };

            let fileBuffer;
            let contentType;
            let filename;

            // 4. Generate file using stored metrics
            if (format === 'PDF') {
                fileBuffer = await strapi.service('api::report-generator.report-generator').generatePDF(serviceData);
                contentType = 'application/pdf';
                filename = `${report.title.replace(/\s+/g, '_')}_${documentId}.pdf`;
            } else {
                fileBuffer = await strapi.service('api::report-generator.report-generator').generateCSV(serviceData);
                contentType = 'text/csv';
                filename = `${report.title.replace(/\s+/g, '_')}_${documentId}.csv`;
            }

            // 5. Set Headers and Send
            ctx.set('Content-Type', contentType);
            ctx.set('Content-Disposition', `attachment; filename="${filename}"`);
            ctx.body = fileBuffer;

            console.log(`✅ Report regenerated and downloaded: ${filename}`);
        } catch (error) {
            console.error('❌ Download Error:', error);
            ctx.throw(500, 'Failed to download report');
        }
    },

    /**
     * Get KPI coverage range for a specific branch
     * Returns earliest and latest KPI dates plus record count
     * GET /api/report-generator/branch-kpi-range?branch=<branchName>
     */
    async getBranchKpiRange(ctx) {
        try {
            const { branch: branchName } = ctx.query;

            // 1. Validate branch query parameter
            if (!branchName) {
                return ctx.throw(400, 'Missing required query parameter: branch');
            }

            console.log(`📊 Fetching KPI range for branch: ${branchName}`);

            // 2. Resolve branch by name
            const branches = await strapi.documents('api::branch.branch').findMany({
                filters: {
                    name: { $eq: branchName }
                },
                limit: 1
            });

            if (!branches || branches.length === 0) {
                console.warn(`⚠️ Branch not found: ${branchName}`);
                return ctx.throw(404, `Branch not found: ${branchName}`);
            }

            const branchData = branches[0];
            const branchDocumentId = branchData.documentId;

            console.log(`✅ Branch resolved: ${branchName} (ID: ${branchDocumentId})`);

            // 3. Query earliest KPI date
            let earliestKpi = null;
            try {
                const earliestRecords = await strapi.documents('api::branch-kpi.branch-kpi').findMany({
                    filters: {
                        branch: { documentId: { $eq: branchDocumentId } }
                    },
                    sort: [{ date: 'asc' }, { createdAt: 'asc' }],
                    limit: 1
                });

                earliestKpi = earliestRecords?.[0] || null;
            } catch (e) {
                console.warn('⚠️ Error querying earliest KPI:', (e as Error).message);
            }

            // 4. Query latest KPI date
            let latestKpi = null;
            try {
                const latestRecords = await strapi.documents('api::branch-kpi.branch-kpi').findMany({
                    filters: {
                        branch: { documentId: { $eq: branchDocumentId } }
                    },
                    sort: [{ date: 'desc' }, { createdAt: 'desc' }],
                    limit: 1
                });

                latestKpi = latestRecords?.[0] || null;
            } catch (e) {
                console.warn('⚠️ Error querying latest KPI:', (e as Error).message);
            }

            // 5. Query count of all KPI records for branch
            let kpiCount = 0;
            try {
                // Use strapi.db.query to get count efficiently
                const countResult = await strapi.db.query('api::branch-kpi.branch-kpi').count({
                    where: {
                        branch: branchDocumentId
                    }
                });

                kpiCount = countResult || 0;
            } catch (e) {
                console.warn('⚠️ Error counting KPI records:', (e as Error).message);
                // Fallback: query with limit and assume there are at least that many
                try {
                    const fallbackRecords = await strapi.documents('api::branch-kpi.branch-kpi').findMany({
                        filters: {
                            branch: { documentId: { $eq: branchDocumentId } }
                        },
                        limit: 1000
                    });

                    kpiCount = fallbackRecords?.length || 0;
                } catch (fallbackError) {
                    console.warn('⚠️ Fallback count also failed:', (fallbackError as Error).message);
                    kpiCount = 0;
                }
            }

            console.log(`📅 KPI Range: ${earliestKpi?.date || 'N/A'} to ${latestKpi?.date || 'N/A'} (${kpiCount} records)`);

            // 6. Format response
            const response = {
                branch: branchName,
                from: earliestKpi?.date || null,
                to: latestKpi?.date || null,
                count: kpiCount
            };

            ctx.body = response;
            console.log(`✅ KPI range retrieved: ${JSON.stringify(response)}`);
        } catch (error) {
            console.error('❌ KPI Range Error:', error);
            ctx.throw(500, 'Failed to fetch KPI range');
        }
    }
});

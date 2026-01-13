/**
 * report-generator router
 * Custom routes for report generation functionality
 */

export default {
    routes: [
        {
            method: 'POST',
            path: '/report-generator/branch',
            handler: 'api::report-generator.report-generator.generateBranchReport',
            config: {
                auth: false,
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/report-generator/employee',
            handler: 'api::report-generator.report-generator.generateEmployeeReport',
            config: {
                auth: false,
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/report-generator/history',
            handler: 'api::report-generator.report-generator.getReportHistory',
            config: { auth: false, policies: [] },
        },
        {
            method: 'GET',
            path: '/report-generator/download/:documentId',
            handler: 'api::report-generator.report-generator.downloadReport',
            config: { auth: false, policies: [] },
        },
        {
            method: 'GET',
            path: '/report-generator/branch-kpi-range',
            handler: 'api::report-generator.report-generator.getBranchKpiRange',
            config: { auth: false, policies: [] },
        },
    ],
};

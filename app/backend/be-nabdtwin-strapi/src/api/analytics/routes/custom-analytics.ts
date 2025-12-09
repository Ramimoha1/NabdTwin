module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/insights', 
      handler: 'analytics.getGlobalInsights',
      config: { auth: false, prefix: '' },
    },
    {
      method: 'GET',
      path: '/analytics/trends',
      handler: 'analytics.getTrends',
      config: { auth: false, prefix: '' },
    },
    {
      method: 'GET',
      path: '/analytics/employee-changes',
      handler: 'analytics.getEmployeeChanges',
      config: { auth: false, prefix: '' },
    },
    {
      method: 'GET',
      path: '/analytics/task-metrics',
      handler: 'analytics.getTaskMetrics',
      config: { auth: false, prefix: '' },
    },
    {
      method: 'GET',
      path: '/analytics/branch-comparison',
      handler: 'analytics.getBranchComparison',
      config: { auth: false, prefix: '' },
    },
    {
      method: 'GET',
      path: '/analytics/top-employees',
      handler: 'analytics.getTopEmployees',
      config: { auth: false, prefix: '' },
    },
  ],
};
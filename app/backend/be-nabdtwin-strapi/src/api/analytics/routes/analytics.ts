export default {
  routes: [
    {
      method: 'GET',
      path: '/analytics/employee/:id',
      handler: 'analytics.getEmployeeKPI',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/analytics/floor/:id',
      handler: 'analytics.getFloorKPI',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/analytics/branch/:id',
      handler: 'analytics.getBranchKPI',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/analytics/branch/:id/history', 
      handler: 'analytics.getBranchHistory',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/analytics/floor/:id/history',
      handler: 'analytics.getFloorHistory',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/analytics/employee/:id/history',
      handler: 'analytics.getEmployeeHistory',
      config: {
        auth: false,
      },
    },
  ],
};
/**
 * Custom employee routes for detailed employee data
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/employees/details/:id',
      handler: 'api::employee.employee.getDetails',
      config: {
        auth: false, // Set to true in production
      },
    },
    {
      method: 'GET',
      path: '/employees/by-branch/:branchId',
      handler: 'api::employee.employee.getByBranch',
      config: {
        auth: false, // Set to true in production
      },
    },
  ],
};

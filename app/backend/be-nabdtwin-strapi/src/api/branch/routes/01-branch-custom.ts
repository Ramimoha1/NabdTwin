/**
 * Branch detail custom route
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/branches/:branchId/details',
      handler: 'api::branch.branch.details',
    },
  ],
};

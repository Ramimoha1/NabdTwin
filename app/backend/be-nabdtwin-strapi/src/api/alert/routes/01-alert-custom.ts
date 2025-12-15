/**
 * Custom alert routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/alerts/active',
      handler: 'api::alert.alert.active',
    },
    {
      method: 'DELETE',
      path: '/alerts/dismiss/:id',
      handler: 'api::alert.alert.dismiss',
    },
  ],
};

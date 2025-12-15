import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::alert.alert', ({ strapi }) => ({

  async active(ctx) {
    try {
      const alertService = strapi.service('api::alert.alert-evaluation');
      const alerts = await alertService.getActiveAlerts(ctx.query);

      ctx.body = {
        data: alerts,
        meta: {
          count: alerts.length,
        },
      };
    } catch (error) {
      strapi.log.error('Failed to fetch active alerts:', error);
      ctx.throw(500, 'Failed to fetch active alerts');
    }
  },

  async dismiss(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.throw(401, 'User authentication required to dismiss alerts');
      }

      const alertService = strapi.service('api::alert.alert-evaluation');
      const resolvedAlert = await alertService.resolveAlert(
        parseInt(id, 10),
        userId
      );

      ctx.body = {
        data: resolvedAlert,
      };
    } catch (error) {
      strapi.log.error('Error dismissing alert:', error);
      ctx.throw(500, 'Failed to dismiss alert');
    }
  },

}));
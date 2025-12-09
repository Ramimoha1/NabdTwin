/**
 * analytics controller
 */

export default {
  async getEmployeeKPI(ctx: any) {
    try {
      const { id } = ctx.params;
      if (!id) return ctx.badRequest('Missing Employee ID');

      const data = await strapi.service('api::analytics.analytics').getEmployeeKPI(id);
      ctx.body = data;
    } catch (err: any) {
      ctx.body = { error: err.message || 'Internal Server Error' };
    }
  },

  async getFloorKPI(ctx: any) {
    try {
      const { id } = ctx.params;
      if (!id) return ctx.badRequest('Missing Floor ID');

      const data = await strapi.service('api::analytics.analytics').getFloorKPI(id);
      ctx.body = data;
    } catch (err: any) {
      ctx.body = { error: err.message };
    }
  },

  async getBranchKPI(ctx: any) {
    try {
      const { id } = ctx.params;
      if (!id) return ctx.badRequest('Missing Branch ID');

      const data = await strapi.service('api::analytics.analytics').getBranchKPI(id);
      ctx.body = data;
    } catch (err: any) {
      ctx.body = { error: err.message };
    }
  }
};
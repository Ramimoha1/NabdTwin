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
  },

  async getBranchHistory(ctx: any) {
    try {
      const { id } = ctx.params;
      const { from, to } = ctx.query; // Get Dynamic Dates

      if (!from || !to) return ctx.badRequest('Please provide "from" and "to" dates');

      const data = await strapi.service('api::analytics.analytics').getBranchHistory(id, from, to);
      ctx.body = data;
    } catch (err: any) {
      ctx.body = { error: err.message };
    }
  },

  async getFloorHistory(ctx: any) {
    try {
      const { id } = ctx.params;
      const { from, to } = ctx.query;
      const data = await strapi.service('api::analytics.analytics').getFloorHistory(id, from, to);
      ctx.body = data;
    } catch (err: any) { ctx.body = { error: err.message }; }
  },

  async getEmployeeHistory(ctx: any) {
    try {
      const { id } = ctx.params;
      const { from, to } = ctx.query;

      const data = await strapi.service('api::analytics.analytics').getEmployeeHistory(id, from, to);
      ctx.body = data;
    } catch (err: any) {
      ctx.body = { error: err.message };
    }
  },
  async getGlobalInsights(ctx) {
    try {
      const data = await strapi.service('api::analytics.analytics').getGlobalStats();
      ctx.body = data;
    } catch (err) {
      ctx.body = { error: err.message };
    }
  },
  async getTrends(ctx) {
    ctx.body = await strapi.service('api::analytics.analytics').getTrends();
  },
  async getEmployeeChanges(ctx) {
    ctx.body = await strapi.service('api::analytics.analytics').getEmployeeChanges();
  },
  async getTaskMetrics(ctx) {
    ctx.body = await strapi.service('api::analytics.analytics').getTaskMetrics();
  },
  async getBranchComparison(ctx) {
    ctx.body = await strapi.service('api::analytics.analytics').getBranchComparison();
  },
  async getTopEmployees(ctx) {
    ctx.body = await strapi.service('api::analytics.analytics').getTopEmployees();
  },
  async getEmployeePerformance(ctx) {
    try {
      const { id } = ctx.params;
      if (!id) return ctx.badRequest('Missing Employee ID');

      const data = await strapi.service('api::analytics.analytics').getEmployeePerformance(id);
      ctx.body = data;
    } catch (err: any) {
      ctx.body = { error: err.message };
    }
  },
};
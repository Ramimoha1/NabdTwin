/**
 * branch controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::branch.branch', ({ strapi }) => ({
  /**
   * Get branch details with employees, teams, and departments
   */
  async details(ctx) {
    try {
      const { branchId } = ctx.params;
      const branchIdNum = parseInt(branchId, 10);

      // Fetch branch details
      const branch = await strapi.entityService.findOne('api::branch.branch', branchIdNum, {
        populate: ['branchKpis'],
      });

      if (!branch) {
        return ctx.notFound();
      }

      // Fetch related data using raw query for filtering
      const employees = await strapi.db.query('api::employee.employee').findMany({
        where: { branch: branchIdNum },
      });

      const teams = await strapi.db.query('api::team.team').findMany({
        where: { branch: branchIdNum },
      });

      const departments = await strapi.db.query('api::department.department').findMany({
        where: { branch: branchIdNum },
      });

      ctx.body = {
        data: {
          branch,
          employees,
          teams,
          departments,
        },
      };
    } catch (err) {
      console.error('Error in branch.details:', err);
      ctx.throw(500, `Error fetching branch details: ${err.message}`);
    }
  },
}));

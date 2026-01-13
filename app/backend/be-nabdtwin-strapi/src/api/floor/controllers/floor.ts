/**
 * floor controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::floor.floor', ({ strapi }) => ({
  /**
   * Custom delete method to ensure proper deletion of floors with related entities
   */
  async delete(ctx) {
    const { id } = ctx.params;

    try {
      // Delete the floor - Strapi will handle cascade deletion via the database constraints
      const deletedFloor = await strapi.entityService.delete('api::floor.floor', id);

      if (!deletedFloor) {
        return ctx.notFound('Floor not found');
      }

      // Return 204 No Content on successful deletion
      ctx.status = 204;
    } catch (error) {
      strapi.log.error('Error deleting floor:', error);
      return ctx.badRequest('Failed to delete floor');
    }
  },
}));

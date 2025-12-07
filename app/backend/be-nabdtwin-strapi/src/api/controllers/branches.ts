/**
 * A set of functions called "actions" for `Branches`
 */
const knex = strapi.db.connection;

export default {
    async getAllBranches(ctx) {
        try {
            const branches = await knex('branches').select('*');
            ctx.body = branches;
        } catch (err) {
            ctx.body = { error: err.message };
        }
    },
};

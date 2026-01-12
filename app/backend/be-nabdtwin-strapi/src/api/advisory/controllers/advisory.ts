module.exports = {
  async analyze(ctx) {
    try {
      const { userQuestion } = ctx.request.body;
      const userId = ctx.state.user?.id;

      if (!userQuestion || userQuestion.trim().length === 0) {
        return ctx.badRequest('User question is required');
      }

      if (!userId) {
        return ctx.badRequest('User ID is required');
      }

      const response = await strapi
        .service('api::advisory.advisory')
        .analyze(userQuestion, userId);

      ctx.body = { response };

    } catch (err) {
      console.error("Advisory Controller Error:", err);
      ctx.throw(500, 'Failed to generate advisory response');
    }
  }
};
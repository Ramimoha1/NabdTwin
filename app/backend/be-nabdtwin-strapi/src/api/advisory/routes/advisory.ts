export default {
  routes: [
    {
      method: 'POST',
      path: '/advisory/analyze',
      handler: 'advisory.analyze',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
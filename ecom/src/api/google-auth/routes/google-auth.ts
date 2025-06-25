export default {
  routes: [
    {
      method: 'POST',
      path: '/google-auth/login',
      handler: 'google-auth.login',
      config: {
        auth: false, // Public endpoint
        policies: [],
        middlewares: [],
      },
    },
  ],
};
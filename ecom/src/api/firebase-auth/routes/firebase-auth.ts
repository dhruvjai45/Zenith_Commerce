// File: ecom/src/api/firebase-auth/routes/firebase-auth.ts

export default {
  routes: [
    {
      method: 'POST',
      path: '/firebase-auth/login',
      handler: 'firebase-auth.login',
      config: {
        auth: false, // This route must be public and accessible without a token
        policies: [],
        middlewares: [],
      },
    },
  ],
};
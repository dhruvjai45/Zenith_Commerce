module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 10000),
  url: env('RENDER_EXTERNAL_URL', 'https://zenith-commerce.onrender.com'),

  proxy: true, // <-- required to tell Strapi that it's behind a proxy

  app: {
    keys: env.array('APP_KEYS'),
  },

  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
  },

  webhooks: {
    populateRelations: false,
  },

  // ✅ This ensures the session middleware uses correct proxy detection
  middleware: {
    settings: {
      session: {
        config: {
          proxy: true, // <-- tells koa-session to trust x-forwarded-proto
        },
      },
    },
  },
});

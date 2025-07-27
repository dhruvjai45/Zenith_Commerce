module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 10000),
  url: env('RENDER_EXTERNAL_URL', 'https://zenith-commerce.onrender.com'),
  proxy: env.bool('PROXY_ENABLED', true), // important when using HTTPS through Render/Vercel
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
});
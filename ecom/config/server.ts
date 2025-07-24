// config/server.ts

module.exports = ({ env }) => ({
  host: '0.0.0.0',
  port: env.int('PORT', 10000), // Render default port
  url: env('RENDER_EXTERNAL_URL', 'https://zenith-commerce.onrender.com'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: false,
  },
});

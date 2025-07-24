// config/server.ts

module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://zenith-commerce.onrender.com'), // Public URL for Render deployment
  app: {
    keys: env.array('APP_KEYS'), // Replace with your secure keys
  },
  webhooks: {
    populateRelations: false,
  },
});

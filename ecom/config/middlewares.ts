// config/middlewares.js
module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
      origin: [
        'http://localhost:1337', // Strapi admin
        'http://localhost:9002', // Next.js app
        'http://127.0.0.1:9002', // Fallback for localhost
        'https://controlled-preventing-diamond-aye.trycloudflare.com', // Strapi API
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      keepHeaderOnError: true,
    },
  },
  'strapi::security',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
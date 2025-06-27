// In your Strapi project: config/middlewares.ts

export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      // Ensure the origins array includes your Next.js app's URL
      origin: [
        'http://localhost:1337', // Strapi admin
        'http://localhost:9003', // Your Next.js app's local development URL
        'http://127.0.0.1:9003', // Alternative for localhost
        'http://localhost:3000',
        'https://studio.web.app', // For Firebase Studio environment
        'https://*.trycloudflare.com', // To allow requests from your public preview URL
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
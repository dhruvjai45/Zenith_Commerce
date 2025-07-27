
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'http:'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'market-assets.strapi.io', 'zenith-commerce.onrender.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com', 'market-assets.strapi.io', 'zenith-commerce.onrender.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:1337',
        'http://localhost:3000',
        'https://studio.web.app',
        'https://*.trycloudflare.com',
        'https://zenith-commerce.onrender.com',
        'https://zayvue-commerce.vercel.app',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

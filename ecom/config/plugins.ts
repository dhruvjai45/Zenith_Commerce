export default ({ env }) => ({
  // Cloudinary Upload Provider
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
    },
  },

  'users-permissions': {
    enabled: true,
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },

  documentation: {
    enabled: true,
  },

  email: {
    enabled: true,
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
          user: env('EMAIL_ADDRESS'),
          pass: env('EMAIL_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('EMAIL_ADDRESS'),
        defaultReplyTo: env('EMAIL_ADDRESS'),
      },
    },
  },
});

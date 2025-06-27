export default ({ env }) => ({
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
          user: env('EMAIL_ADDRESS', 'dhruvjain.gdsc@gmail.com'),
          pass: env('EMAIL_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: 'dhruvjain.gdsc@gmail.com',
        defaultReplyTo: 'dhruvjain.gdsc@gmail.com',
      },
    },
  },
});
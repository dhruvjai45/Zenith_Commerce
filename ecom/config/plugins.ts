// export default () => ({});

// config/plugins.ts
export default ({ env }) => ({
    documentation: {
        enabled: true,
    },
    email: {
        config: {
            provider: 'nodemailer',
            providerOptions: {
                host: 'smtp.gmail.com',
                port: 587,
                auth: {
                    user: env('EMAIL_ADDRESS', 'dhruvjain.gdsc@gmail.com'),
                    pass: env('EMAIL_PASSWORD'), // Use Gmail App Password
                },
            },
            settings: {
                defaultFrom: 'dhruvjain.gdsc@gmail.com',
                defaultReplyTo: 'dhruvjain.gdsc@gmail.com',
            },
        },
    },
});
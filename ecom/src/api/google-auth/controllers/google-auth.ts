import axios from 'axios';
import crypto from 'crypto';

const getGoogleUserInfo = async (accessToken: string) => {
  try {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('Google user info:', data); // Debug log
    return data;
  } catch (err) {
    console.error('Google API error:', err.response?.data || err.message);
    throw new Error('Failed to fetch Google user info');
  }
};

// Manual sanitization function to remove sensitive fields
const sanitizeUser = (user: any) => {
  const { password, resetPasswordToken, ...sanitizedUser } = user;
  return sanitizedUser;
};

export default {
  // In your Strapi project: src/api/google-auth/controllers/google-auth.ts

async login(ctx) {
    const { accessToken } = ctx.request.body as { accessToken: string };

    if (!accessToken) {
        return ctx.badRequest('Access token is required');
    }

    try {
        const googleUser = await getGoogleUserInfo(accessToken);
        const { email, name } = googleUser;

        const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
            filters: { email: { $eq: email } },
        });

        let user = users[0];

        if (!user) {
            const newUser = {
                username: name || email.split('@')[0],
                email,
                password: crypto.randomBytes(16).toString('hex'),
                provider: 'google',
                confirmed: true,
            };
            user = await strapi.entityService.create('plugin::users-permissions.user', {
                data: newUser,
            });
        }

        const jwt = strapi.service('plugin::users-permissions.jwt').issue({ id: user.id });

        const sanitizedUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            provider: user.provider,
            confirmed: user.confirmed,
            blocked: user.blocked,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        return ctx.send({
            jwt,
            user: sanitizedUser,
        });

    } catch (err) {
        console.error('Google auth error:', err.message);
        return ctx.badRequest('Google authentication failed', { details: err.message });
    }
},
};
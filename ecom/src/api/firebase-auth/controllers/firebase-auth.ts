// File: ecom/src/api/firebase-auth/controllers/firebase-auth.ts

import axios from 'axios';

const getGoogleUserInfo = async (accessToken: string) => {
  const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
};

export default {
  async login(ctx) {
    const { accessToken } = ctx.request.body as { accessToken: string };

    if (!accessToken) {
      return ctx.badRequest('Access token is required');
    }

    try {
      const googleUser = await getGoogleUserInfo(accessToken);
      const { email, name } = googleUser;

      const usersService = strapi.service('plugin::users-permissions.user');
      const jwtService = strapi.service('plugin::users-permissions.jwt');

      let user = await usersService.fetch({ email });

      if (!user) {
        // Create a new user if they don't exist
        const newUser = {
          username: name || email.split('@')[0], // Use name or part of email as username
          email,
          password: Math.random().toString(36).slice(-8), // Generate a random secure password
          provider: 'google',
          confirmed: true,
        };
        user = await usersService.add(newUser);
      }

      // Issue a Strapi JWT for the user
      const jwt = jwtService.issue({ id: user.id });

      // Return the JWT and the sanitized user info
      return ctx.send({
        jwt,
        user: await strapi.service('plugin::users-permissions.user').sanitizeUser(user, ctx),
      });

    } catch (err) {
      console.error("Google auth error", err);
      if (err.response) {
        console.error("Google API Error response:", err.response.data);
      }
      return ctx.badRequest('Google authentication failed', { details: err.message });
    }
  },
};
import type { AuthProvider } from './types';

export const createApiTokenAuthProvider = (username: string, token: string): AuthProvider => ({
  getAuthHeader: async () => ({
    Authorization: `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
  }),
});

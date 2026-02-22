import type { AuthProvider } from './types';

export const createBearerAuthProvider = (token: string): AuthProvider => ({
  getAuthHeader: async () => ({ Authorization: `Bearer ${token}` }),
});

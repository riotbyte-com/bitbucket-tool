import { createApiTokenAuthProvider } from './api-token';
import { createOAuthProvider } from './oauth';
import type { AuthConfig, AuthProvider } from './types';

export { createApiTokenAuthProvider } from './api-token';
export { createOAuthProvider } from './oauth';
export type { AuthConfig, AuthHeader, AuthProvider, StoredTokens } from './types';

export const resolveAuthConfig = (): AuthConfig => {
  if (process.env.BITBUCKET_USERNAME && process.env.BITBUCKET_TOKEN) {
    return {
      type: 'api-token',
      username: process.env.BITBUCKET_USERNAME,
      token: process.env.BITBUCKET_TOKEN,
    };
  }

  if (process.env.BITBUCKET_OAUTH_CLIENT_ID && process.env.BITBUCKET_OAUTH_CLIENT_SECRET) {
    return {
      type: 'oauth',
      clientId: process.env.BITBUCKET_OAUTH_CLIENT_ID,
      clientSecret: process.env.BITBUCKET_OAUTH_CLIENT_SECRET,
    };
  }

  throw new Error(
    'No Bitbucket auth configured. Set BITBUCKET_USERNAME + BITBUCKET_TOKEN, or BITBUCKET_OAUTH_CLIENT_ID + BITBUCKET_OAUTH_CLIENT_SECRET.'
  );
};

export const resolveAuth = (config?: AuthConfig): AuthProvider => {
  const resolved = config ?? resolveAuthConfig();

  return resolved.type === 'api-token'
    ? createApiTokenAuthProvider(resolved.username, resolved.token)
    : createOAuthProvider(resolved.clientId, resolved.clientSecret);
};

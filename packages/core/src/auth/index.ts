import { createBearerAuthProvider } from './bearer-token';
import { createOAuthProvider } from './oauth';
import { loadStoredTokens } from './token-store';
import type { AuthConfig, AuthProvider } from './types';

export { createBearerAuthProvider } from './bearer-token';
export { createOAuthProvider } from './oauth';
export type { AuthConfig, AuthHeader, AuthProvider, StoredTokens } from './types';

export const resolveAuthConfig = (): AuthConfig => {
  if (process.env.BITBUCKET_TOKEN) {
    return { type: 'bearer', token: process.env.BITBUCKET_TOKEN };
  }

  if (process.env.BITBUCKET_OAUTH_CLIENT_ID && process.env.BITBUCKET_OAUTH_CLIENT_SECRET) {
    return {
      type: 'oauth',
      clientId: process.env.BITBUCKET_OAUTH_CLIENT_ID,
      clientSecret: process.env.BITBUCKET_OAUTH_CLIENT_SECRET,
    };
  }

  const stored = loadStoredTokens();
  if (stored && stored.expires_at > Date.now()) {
    return { type: 'bearer', token: stored.access_token };
  }

  throw new Error(
    'No Bitbucket auth configured. Set BITBUCKET_TOKEN or BITBUCKET_OAUTH_CLIENT_ID + BITBUCKET_OAUTH_CLIENT_SECRET.'
  );
};

export const resolveAuth = (config?: AuthConfig): AuthProvider => {
  const resolved = config ?? resolveAuthConfig();

  return resolved.type === 'bearer'
    ? createBearerAuthProvider(resolved.token)
    : createOAuthProvider(resolved.clientId, resolved.clientSecret);
};

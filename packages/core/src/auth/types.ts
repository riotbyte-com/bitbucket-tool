export type AuthHeader = { Authorization: string };

export type AuthProvider = {
  getAuthHeader: () => Promise<AuthHeader>;
};

export type BearerAuthConfig = { type: 'bearer'; token: string };
export type OAuthConfig = { type: 'oauth'; clientId: string; clientSecret: string };
export type AuthConfig = BearerAuthConfig | OAuthConfig;

export type StoredTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

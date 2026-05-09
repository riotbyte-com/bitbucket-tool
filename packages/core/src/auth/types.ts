export type AuthHeader = { Authorization: string };

export type AuthProvider = {
  getAuthHeader: () => Promise<AuthHeader>;
};

export type ApiTokenConfig = { type: 'api-token'; username: string; token: string };
export type OAuthConfig = { type: 'oauth'; clientId: string; clientSecret: string };
export type AuthConfig = ApiTokenConfig | OAuthConfig;

export type StoredTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

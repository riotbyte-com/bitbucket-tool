import { createServer } from 'node:http';
import { loadStoredTokens, saveStoredTokens } from './token-store';
import type { AuthProvider, StoredTokens } from './types';

const AUTHORIZE_URL = 'https://bitbucket.org/site/oauth2/authorize';
const TOKEN_URL = 'https://bitbucket.org/site/oauth2/access_token';
const CALLBACK_PORT = 8976;
const REDIRECT_URI = `http://localhost:${CALLBACK_PORT}/callback`;

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

const exchangeCode = async (
  code: string,
  clientId: string,
  clientSecret: string
): Promise<StoredTokens> => {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as TokenResponse;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
};

const refreshAccessToken = async (
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<StoredTokens> => {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as TokenResponse;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
};

const authorizeViaBrowser = (clientId: string): Promise<string> => {
  const url = `${AUTHORIZE_URL}?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const reqUrl = new URL(req.url ?? '', `http://localhost:${CALLBACK_PORT}`);

      if (reqUrl.pathname !== '/callback') {
        res.writeHead(404);
        res.end();
        return;
      }

      const code = reqUrl.searchParams.get('code');
      const error = reqUrl.searchParams.get('error');

      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
          '<html><body><h1>Authorization failed</h1><p>You can close this tab.</p></body></html>'
        );
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>Missing code</h1></body></html>');
        server.close();
        reject(new Error('No authorization code received'));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body><h1>Authorized</h1><p>You can close this tab.</p></body></html>');
      server.close();
      resolve(code);
    });

    server.listen(CALLBACK_PORT, () => {
      console.error(`Open this URL to authorize:\n${url}`);

      import('node:child_process').then(({ exec }) => {
        exec(`open "${url}"`);
      });
    });

    server.on('error', reject);

    setTimeout(() => {
      server.close();
      reject(new Error('OAuth authorization timed out after 120 seconds'));
    }, 120_000);
  });
};

export const createOAuthProvider = (clientId: string, clientSecret: string): AuthProvider => {
  let currentTokens: StoredTokens | null = loadStoredTokens();

  const ensureValidToken = async (): Promise<string> => {
    if (currentTokens && currentTokens.expires_at > Date.now() + 60_000) {
      return currentTokens.access_token;
    }

    if (currentTokens?.refresh_token) {
      try {
        currentTokens = await refreshAccessToken(
          currentTokens.refresh_token,
          clientId,
          clientSecret
        );
        saveStoredTokens(currentTokens);
        return currentTokens.access_token;
      } catch {
        console.error('Token refresh failed, re-authorizing...');
      }
    }

    const code = await authorizeViaBrowser(clientId);
    currentTokens = await exchangeCode(code, clientId, clientSecret);
    saveStoredTokens(currentTokens);
    return currentTokens.access_token;
  };

  return {
    getAuthHeader: async () => ({
      Authorization: `Bearer ${await ensureValidToken()}`,
    }),
  };
};

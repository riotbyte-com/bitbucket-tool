import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { z } from 'zod';
import type { StoredTokens } from './types';

const StoredTokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
});

const TOKEN_PATH = join(process.env.HOME ?? '', '.bitbucket-oauth.json');

export const loadStoredTokens = (): StoredTokens | null => {
  if (!existsSync(TOKEN_PATH)) {
    return null;
  }

  const parsed = StoredTokensSchema.safeParse(JSON.parse(readFileSync(TOKEN_PATH, 'utf-8')));

  return parsed.success ? parsed.data : null;
};

export const saveStoredTokens = (tokens: StoredTokens): void => {
  mkdirSync(dirname(TOKEN_PATH), { recursive: true });
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf-8');
};

export const clearStoredTokens = (): void => {
  if (existsSync(TOKEN_PATH)) {
    writeFileSync(TOKEN_PATH, '', 'utf-8');
  }
};

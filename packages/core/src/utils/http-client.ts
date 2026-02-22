import type { AuthProvider } from '../auth/types';
import { client } from '../generated/bitbucket-client/client.gen';

export const configureClient = async (auth: AuthProvider): Promise<void> => {
  const header = await auth.getAuthHeader();

  client.setConfig({
    baseUrl: 'https://api.bitbucket.org/2.0',
    headers: {
      ...header,
      'Content-Type': 'application/json',
    },
  });
};

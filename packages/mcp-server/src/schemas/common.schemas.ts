import { z } from 'zod';

export const workspaceParam = z
  .string()
  .describe(
    'Bitbucket workspace slug. Falls back to BITBUCKET_WORKSPACE env var if empty string is provided.'
  );

export const repoSlugParam = z.string().describe('Repository slug');

export const paginationParams = {
  page: z.number().optional().describe('Page number (1-based)'),
  pagelen: z.number().optional().describe('Number of items per page (max 100)'),
};

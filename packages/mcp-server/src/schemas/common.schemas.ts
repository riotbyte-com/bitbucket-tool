import { z } from 'zod';

export const workspaceParam = z
  .string()
  .optional()
  .describe(
    'Bitbucket workspace slug. Falls back to BITBUCKET_WORKSPACE env var, then to the git remote of the server cwd.'
  );

export const repoSlugParam = z
  .string()
  .optional()
  .describe(
    'Repository slug. Falls back to BITBUCKET_REPO env var, then to the git remote of the server cwd.'
  );

export const paginationParams = {
  page: z.number().int().min(1).optional().describe('Page number (1-based)'),
  pagelen: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe('Number of items per page (max 100)'),
};

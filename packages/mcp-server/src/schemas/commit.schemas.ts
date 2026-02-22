import { z } from 'zod';
import { paginationParams, repoSlugParam, workspaceParam } from './common.schemas';

export const listCommitsSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  ...paginationParams,
};

export const getCommitSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  commit: z.string().describe('Commit hash (full or abbreviated)'),
};

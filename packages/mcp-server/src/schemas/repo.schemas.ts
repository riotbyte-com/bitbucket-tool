import { z } from 'zod';
import { paginationParams, repoSlugParam, workspaceParam } from './common.schemas';

export const listRepositoriesSchema = {
  workspace: workspaceParam,
  ...paginationParams,
};

export const listBranchesSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  ...paginationParams,
};

export const getBranchSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  name: z.string().describe('Branch name'),
};

export const createBranchSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  name: z.string().describe('New branch name'),
  target: z.string().describe('Commit hash or branch name to create the branch from'),
};

export const deleteBranchSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  name: z.string().describe('Branch name to delete'),
};

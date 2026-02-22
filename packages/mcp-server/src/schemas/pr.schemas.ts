import { z } from 'zod';
import { paginationParams, repoSlugParam, workspaceParam } from './common.schemas';

export const listPullRequestsSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  state: z
    .enum(['OPEN', 'MERGED', 'DECLINED', 'SUPERSEDED'])
    .optional()
    .describe('Filter by PR state. Defaults to OPEN.'),
  ...paginationParams,
};

export const getPullRequestSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  pull_request_id: z.number().describe('Pull request ID'),
};

export const createPullRequestSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  source_branch: z.string().describe('Source branch name'),
  destination_branch: z.string().optional().describe('Destination branch name. Defaults to main.'),
  title: z.string().describe('Pull request title'),
  description: z.string().optional().describe('Pull request description (Markdown supported)'),
};

export const updatePullRequestSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  pull_request_id: z.number().describe('Pull request ID'),
  title: z.string().optional().describe('New title'),
  description: z.string().optional().describe('New description'),
  destination_branch: z.string().optional().describe('New destination branch'),
};

export const declinePullRequestSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  pull_request_id: z.number().describe('Pull request ID to decline/close'),
};

export const getPullRequestCommentsSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  pull_request_id: z.number().describe('Pull request ID'),
  ...paginationParams,
};

export const addPullRequestCommentSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  pull_request_id: z.number().describe('Pull request ID'),
  content: z.string().describe('Comment text (Markdown supported)'),
};

export const getPullRequestDiffSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  pull_request_id: z.number().describe('Pull request ID'),
};

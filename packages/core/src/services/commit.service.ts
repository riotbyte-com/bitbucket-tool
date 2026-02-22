import {
  getRepositoriesByWorkspaceByRepoSlugCommitByCommit,
  getRepositoriesByWorkspaceByRepoSlugCommits,
} from '../generated/bitbucket-client/sdk.gen';
import type { BaseCommit, Commit } from '../generated/bitbucket-client/types.gen';
import type { PaginationParams } from '../types/pagination.types';
import { apiError, fail, ok, type Result } from '../types/result.types';

export type ListCommitsParams = {
  workspace: string;
  repoSlug: string;
  revision?: string;
} & PaginationParams;

export type GetCommitParams = {
  workspace: string;
  repoSlug: string;
  commit: string;
};

export const listCommits = async (params: ListCommitsParams): Promise<Result<BaseCommit[]>> => {
  const { workspace, repoSlug } = params;
  const response = await getRepositoriesByWorkspaceByRepoSlugCommits({
    path: { workspace, repo_slug: repoSlug },
  });

  if (response.error) {
    return fail(apiError(response.response.status, 'Failed to list commits', response.error));
  }

  return ok(response.data?.values ?? []);
};

export const getCommit = async (params: GetCommitParams): Promise<Result<Commit>> => {
  const { workspace, repoSlug, commit } = params;
  const response = await getRepositoriesByWorkspaceByRepoSlugCommitByCommit({
    path: { workspace, repo_slug: repoSlug, commit },
  });

  if (response.error) {
    return fail(apiError(response.response.status, `Commit '${commit}' not found`, response.error));
  }

  return response.data ? ok(response.data) : fail(apiError(404, `Commit '${commit}' not found`));
};

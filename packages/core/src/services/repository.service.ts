import {
  deleteRepositoriesByWorkspaceByRepoSlugRefsBranchesByName,
  getRepositoriesByWorkspace,
  getRepositoriesByWorkspaceByRepoSlugRefsBranches,
  getRepositoriesByWorkspaceByRepoSlugRefsBranchesByName,
  postRepositoriesByWorkspaceByRepoSlugRefsBranches,
} from '../generated/bitbucket-client/sdk.gen';
import type { Branch, Repository } from '../generated/bitbucket-client/types.gen';
import type { PaginationParams } from '../types/pagination.types';
import { apiError, fail, ok, type Result } from '../types/result.types';

export type ListRepositoriesParams = {
  workspace: string;
} & PaginationParams;

export type ListBranchesParams = {
  workspace: string;
  repoSlug: string;
} & PaginationParams;

export type GetBranchParams = {
  workspace: string;
  repoSlug: string;
  name: string;
};

export type CreateBranchParams = {
  workspace: string;
  repoSlug: string;
  name: string;
  target: string;
};

export type DeleteBranchParams = {
  workspace: string;
  repoSlug: string;
  name: string;
};

export const listRepositories = async (
  params: ListRepositoriesParams
): Promise<Result<Repository[]>> => {
  const { workspace } = params;
  const response = await getRepositoriesByWorkspace({
    path: { workspace },
  });

  if (response.error) {
    return fail(apiError(response.response.status, 'Failed to list repositories', response.error));
  }

  return ok(response.data?.values ?? []);
};

export const listBranches = async (params: ListBranchesParams): Promise<Result<Branch[]>> => {
  const { workspace, repoSlug } = params;
  const response = await getRepositoriesByWorkspaceByRepoSlugRefsBranches({
    path: { workspace, repo_slug: repoSlug },
  });

  if (response.error) {
    return fail(apiError(response.response.status, 'Failed to list branches', response.error));
  }

  return ok(response.data?.values ?? []);
};

export const getBranch = async (params: GetBranchParams): Promise<Result<Branch>> => {
  const { workspace, repoSlug, name } = params;
  const response = await getRepositoriesByWorkspaceByRepoSlugRefsBranchesByName({
    path: { workspace, repo_slug: repoSlug, name },
  });

  if (response.error) {
    return fail(apiError(response.response.status, `Branch '${name}' not found`, response.error));
  }

  return response.data ? ok(response.data) : fail(apiError(404, `Branch '${name}' not found`));
};

export const createBranch = async (params: CreateBranchParams): Promise<Result<Branch>> => {
  const { workspace, repoSlug, name, target } = params;
  const response = await postRepositoriesByWorkspaceByRepoSlugRefsBranches({
    path: { workspace, repo_slug: repoSlug },
    body: { name, target: { hash: target } } as never,
  });

  if (response.error) {
    return fail(apiError(response.response.status, 'Failed to create branch', response.error));
  }

  return response.data
    ? ok(response.data)
    : fail(apiError(500, 'No data returned from branch creation'));
};

export const deleteBranch = async (params: DeleteBranchParams): Promise<Result<void>> => {
  const { workspace, repoSlug, name } = params;
  const response = await deleteRepositoriesByWorkspaceByRepoSlugRefsBranchesByName({
    path: { workspace, repo_slug: repoSlug, name },
  });

  if (response.error) {
    return fail(
      apiError(response.response.status, `Failed to delete branch '${name}'`, response.error)
    );
  }

  return ok(undefined);
};

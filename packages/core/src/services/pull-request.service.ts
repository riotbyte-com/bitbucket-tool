import {
  getRepositoriesByWorkspaceByRepoSlugPullrequests,
  getRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestId,
  getRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestIdComments,
  getRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestIdDiff,
  postRepositoriesByWorkspaceByRepoSlugPullrequests,
  postRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestIdComments,
  postRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestIdDecline,
  putRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestId,
} from '../generated/bitbucket-client/sdk.gen';
import type { Pullrequest, PullrequestComment } from '../generated/bitbucket-client/types.gen';
import type { PaginationParams } from '../types/pagination.types';
import { apiError, fail, ok, type Result } from '../types/result.types';

export type RepositoryParams = {
  workspace: string;
  repoSlug: string;
};

export type PullRequestParams = RepositoryParams & {
  prId: number;
};

export type ListPullRequestsParams = RepositoryParams &
  PaginationParams & {
    state?: 'OPEN' | 'MERGED' | 'DECLINED' | 'SUPERSEDED';
  };

export type CreatePullRequestParams = RepositoryParams & {
  sourceBranch: string;
  destinationBranch: string;
  title: string;
  description?: string;
};

export type UpdatePullRequestParams = PullRequestParams & {
  updates: Partial<Pick<Pullrequest, 'title' | 'description' | 'destination'>>;
};

export type AddCommentParams = PullRequestParams & {
  content: string;
};

export const listPullRequests = async (
  params: ListPullRequestsParams
): Promise<Result<Pullrequest[]>> => {
  const { workspace, repoSlug, state = 'OPEN' } = params;
  const response = await getRepositoriesByWorkspaceByRepoSlugPullrequests({
    path: { workspace, repo_slug: repoSlug },
    query: { state },
  });

  if (response.error) {
    return fail(apiError(response.response.status, `Failed to list PRs`, response.error));
  }

  return ok(response.data?.values ?? []);
};

export const getPullRequest = async (params: PullRequestParams): Promise<Result<Pullrequest>> => {
  const { workspace, repoSlug, prId } = params;
  const response = await getRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestId({
    path: { workspace, repo_slug: repoSlug, pull_request_id: prId },
  });

  if (response.error) {
    return fail(apiError(response.response.status, `PR #${prId} not found`, response.error));
  }

  return response.data ? ok(response.data) : fail(apiError(404, `PR #${prId} not found`));
};

export const createPullRequest = async (
  params: CreatePullRequestParams
): Promise<Result<Pullrequest>> => {
  const { workspace, repoSlug, sourceBranch, destinationBranch, title, description } = params;
  const response = await postRepositoriesByWorkspaceByRepoSlugPullrequests({
    path: { workspace, repo_slug: repoSlug },
    body: {
      type: 'pullrequest',
      title,
      description: description ?? '',
      source: { branch: { name: sourceBranch } },
      destination: { branch: { name: destinationBranch } },
    },
  });

  if (response.error) {
    return fail(apiError(response.response.status, `Failed to create PR`, response.error));
  }

  return response.data
    ? ok(response.data)
    : fail(apiError(500, 'No data returned from PR creation'));
};

export const updatePullRequest = async (
  params: UpdatePullRequestParams
): Promise<Result<Pullrequest>> => {
  const { workspace, repoSlug, prId, updates } = params;
  const response = await putRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestId({
    path: { workspace, repo_slug: repoSlug, pull_request_id: prId },
    body: { type: 'pullrequest', ...updates },
  });

  if (response.error) {
    return fail(apiError(response.response.status, `Failed to update PR #${prId}`, response.error));
  }

  return response.data ? ok(response.data) : fail(apiError(500, 'No data returned from PR update'));
};

export const addComment = async (params: AddCommentParams): Promise<Result<void>> => {
  const { workspace, repoSlug, prId, content } = params;
  const response = await postRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestIdComments({
    path: { workspace, repo_slug: repoSlug, pull_request_id: prId },
    body: { type: 'pullrequest_comment', content: { raw: content } },
  });

  if (response.error) {
    return fail(apiError(response.response.status, `Failed to add comment`, response.error));
  }

  return ok(undefined);
};

export const getPullRequestComments = async (
  params: PullRequestParams & PaginationParams
): Promise<Result<PullrequestComment[]>> => {
  const { workspace, repoSlug, prId } = params;
  const response = await getRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestIdComments({
    path: { workspace, repo_slug: repoSlug, pull_request_id: prId },
  });

  if (response.error) {
    return fail(apiError(response.response.status, `Failed to get PR comments`, response.error));
  }

  return ok(response.data?.values ?? []);
};

export const declinePullRequest = async (params: PullRequestParams): Promise<Result<void>> => {
  const { workspace, repoSlug, prId } = params;
  const response = await postRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestIdDecline({
    path: { workspace, repo_slug: repoSlug, pull_request_id: prId },
  });

  if (response.error) {
    return fail(
      apiError(response.response.status, `Failed to decline PR #${prId}`, response.error)
    );
  }

  return ok(undefined);
};

export const getPullRequestDiff = async (params: PullRequestParams): Promise<Result<string>> => {
  const { workspace, repoSlug, prId } = params;
  const response = await getRepositoriesByWorkspaceByRepoSlugPullrequestsByPullRequestIdDiff({
    path: { workspace, repo_slug: repoSlug, pull_request_id: prId },
    parseAs: 'text',
  });

  if (response.error) {
    return fail(apiError(response.response.status, `Failed to get PR diff`, response.error));
  }

  return ok((response.data as unknown as string) ?? '');
};

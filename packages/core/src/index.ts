// Auth
export type { AuthConfig, AuthHeader, AuthProvider, StoredTokens } from './auth';
export {
  createBearerAuthProvider,
  createOAuthProvider,
  resolveAuth,
  resolveAuthConfig,
} from './auth';
// Re-export commonly used generated types
export type {
  BaseCommit,
  Branch,
  Commit,
  Pipeline,
  PipelineStep,
  Pullrequest,
  PullrequestComment,
  Repository,
} from './generated/bitbucket-client/types.gen';
// Services - Commits
export type { GetCommitParams, ListCommitsParams } from './services/commit.service';
export { getCommit, listCommits } from './services/commit.service';
// Services - Pipelines
export type {
  GetPipelineParams,
  GetPipelineStepLogParams,
  GetPipelineStepsParams,
  ListPipelinesParams,
  StopPipelineParams,
  TriggerPipelineParams,
} from './services/pipeline.service';
export {
  getPipeline,
  getPipelineStepLog,
  getPipelineSteps,
  listPipelines,
  stopPipelineExecution,
  triggerPipeline,
} from './services/pipeline.service';
// Services - Pull Requests
export type {
  AddCommentParams,
  CreatePullRequestParams,
  ListPullRequestsParams,
  PullRequestParams,
  RepositoryParams,
  UpdatePullRequestParams,
} from './services/pull-request.service';
export {
  addComment,
  createPullRequest,
  declinePullRequest,
  getPullRequest,
  getPullRequestComments,
  getPullRequestDiff,
  listPullRequests,
  updatePullRequest,
} from './services/pull-request.service';
// Services - Repositories
export type {
  CreateBranchParams,
  DeleteBranchParams,
  GetBranchParams,
  ListBranchesParams,
  ListRepositoriesParams,
} from './services/repository.service';
export {
  createBranch,
  deleteBranch,
  getBranch,
  listBranches,
  listRepositories,
} from './services/repository.service';
// Types
export type { BitbucketConfig } from './types/config.types';
export type { PaginatedResponse, PaginationParams } from './types/pagination.types';
export type { ApiError, Result } from './types/result.types';
export { apiError, fail, ok } from './types/result.types';
export {
  getCommentAuthor,
  getCommentContent,
  getCommentDate,
  getCommentInlineInfo,
} from './utils/comment-helpers';
// Utils
export { configureClient } from './utils/http-client';
export { fetchAllPages } from './utils/pagination';
export { detectFromGitRemote, resolveWorkspaceAndRepo } from './utils/workspace';

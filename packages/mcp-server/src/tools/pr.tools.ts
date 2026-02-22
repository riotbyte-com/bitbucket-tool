import {
  addComment,
  createPullRequest,
  declinePullRequest,
  getPullRequest,
  getPullRequestComments,
  getPullRequestDiff,
  listPullRequests,
  updatePullRequest,
} from '@bitbucket-tool/core';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  addPullRequestCommentSchema,
  createPullRequestSchema,
  declinePullRequestSchema,
  getPullRequestCommentsSchema,
  getPullRequestDiffSchema,
  getPullRequestSchema,
  listPullRequestsSchema,
  updatePullRequestSchema,
} from '../schemas/pr.schemas';
import { resolveWorkspace, resultToResponse } from './helpers';

export const registerPrTools = (server: McpServer): void => {
  // @ts-expect-error TS2589: MCP SDK overload resolution + transitive generated types exceed TypeScript recursion limit
  server.tool(
    'list_pull_requests',
    'List pull requests for a repository. Use state to filter by OPEN, MERGED, DECLINED, or SUPERSEDED. Returns PR IDs needed by other PR tools.',
    listPullRequestsSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, state, page, pagelen }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await listPullRequests({ workspace: w, repoSlug: repo_slug, state, page, pagelen })
      );
    }
  );

  // @ts-expect-error TS2589: MCP SDK overload resolution + transitive generated types exceed TypeScript recursion limit
  server.tool(
    'get_pull_request',
    'Get details of a specific pull request including title, description, source/destination branches, author, and status. Use list_pull_requests to find PR IDs.',
    getPullRequestSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, pull_request_id }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await getPullRequest({ workspace: w, repoSlug: repo_slug, prId: pull_request_id })
      );
    }
  );

  server.tool(
    'create_pull_request',
    'Create a new pull request. Requires source branch and title. Destination defaults to main.',
    createPullRequestSchema,
    { readOnlyHint: false },
    async ({ workspace, repo_slug, source_branch, destination_branch, title, description }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await createPullRequest({
          workspace: w,
          repoSlug: repo_slug,
          sourceBranch: source_branch,
          destinationBranch: destination_branch ?? 'main',
          title,
          description,
        })
      );
    }
  );

  server.tool(
    'update_pull_request',
    'Update an existing pull request. Can change title, description, or destination branch. Use get_pull_request to see current values first.',
    updatePullRequestSchema,
    { readOnlyHint: false, idempotentHint: true },
    async ({ workspace, repo_slug, pull_request_id, title, description, destination_branch }) => {
      const w = resolveWorkspace(workspace);
      const updates = {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(destination_branch !== undefined && {
          destination: { branch: { name: destination_branch } },
        }),
      };

      return resultToResponse(
        await updatePullRequest({
          workspace: w,
          repoSlug: repo_slug,
          prId: pull_request_id,
          updates,
        })
      );
    }
  );

  server.tool(
    'decline_pull_request',
    'Decline (close) a pull request. This is irreversible.',
    declinePullRequestSchema,
    { readOnlyHint: false, destructiveHint: true },
    async ({ workspace, repo_slug, pull_request_id }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await declinePullRequest({ workspace: w, repoSlug: repo_slug, prId: pull_request_id }),
        () => 'Pull request declined.'
      );
    }
  );

  server.tool(
    'get_pull_request_comments',
    'Get all comments on a pull request, including inline code review comments with file/line information.',
    getPullRequestCommentsSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, pull_request_id, page, pagelen }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await getPullRequestComments({
          workspace: w,
          repoSlug: repo_slug,
          prId: pull_request_id,
          page,
          pagelen,
        })
      );
    }
  );

  server.tool(
    'add_pull_request_comment',
    'Add a comment to a pull request. Supports Markdown formatting.',
    addPullRequestCommentSchema,
    { readOnlyHint: false },
    async ({ workspace, repo_slug, pull_request_id, content }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await addComment({
          workspace: w,
          repoSlug: repo_slug,
          prId: pull_request_id,
          content,
        }),
        () => 'Comment added.'
      );
    }
  );

  server.tool(
    'get_pull_request_diff',
    'Get the diff for a pull request. Returns raw unified diff text. Use get_pull_request for metadata.',
    getPullRequestDiffSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, pull_request_id }) => {
      const w = resolveWorkspace(workspace);
      const result = await getPullRequestDiff({
        workspace: w,
        repoSlug: repo_slug,
        prId: pull_request_id,
      });

      return resultToResponse(result, (diff) => diff);
    }
  );
};

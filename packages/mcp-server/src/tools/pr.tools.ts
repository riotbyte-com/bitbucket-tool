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
import { resolveRepo, resultToResponse } from './helpers';

export const registerPrTools = (server: McpServer): void => {
  // @ts-expect-error TS2589: deep Zod inference in MCP SDK's ShapeOutput exceeds recursion limit
  server.registerTool(
    'list_pull_requests',
    {
      description:
        'List pull requests for a repository. Use state to filter by OPEN, MERGED, DECLINED, or SUPERSEDED. Returns PR IDs needed by other PR tools.',
      inputSchema: listPullRequestsSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, state, page, pagelen }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(
        await listPullRequests({ workspace: w, repoSlug, state, page, pagelen })
      );
    }
  );

  // @ts-expect-error TS2589: deep Zod inference in MCP SDK's ShapeOutput exceeds recursion limit
  server.registerTool(
    'get_pull_request',
    {
      description:
        'Get details of a specific pull request including title, description, source/destination branches, author, and status. Use list_pull_requests to find PR IDs.',
      inputSchema: getPullRequestSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, pull_request_id }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(
        await getPullRequest({ workspace: w, repoSlug, prId: pull_request_id })
      );
    }
  );

  server.registerTool(
    'create_pull_request',
    {
      description:
        'Create a new pull request. Requires source branch and title. Destination defaults to main.',
      inputSchema: createPullRequestSchema,
    },
    async ({ workspace, repo_slug, source_branch, destination_branch, title, description }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(
        await createPullRequest({
          workspace: w,
          repoSlug,
          sourceBranch: source_branch,
          destinationBranch: destination_branch ?? 'main',
          title,
          description,
        })
      );
    }
  );

  server.registerTool(
    'update_pull_request',
    {
      description:
        'Update an existing pull request. Can change title, description, or destination branch. Only the provided fields are updated; other fields are preserved.',
      inputSchema: updatePullRequestSchema,
      annotations: { idempotentHint: true },
    },
    async ({ workspace, repo_slug, pull_request_id, title, description, destination_branch }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(
        await updatePullRequest({
          workspace: w,
          repoSlug,
          prId: pull_request_id,
          updates: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(destination_branch !== undefined && {
              destination: { branch: { name: destination_branch } },
            }),
          },
        })
      );
    }
  );

  server.registerTool(
    'decline_pull_request',
    {
      description: 'Decline (close) a pull request. This is irreversible.',
      inputSchema: declinePullRequestSchema,
      annotations: { destructiveHint: true },
    },
    async ({ workspace, repo_slug, pull_request_id }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(
        await declinePullRequest({ workspace: w, repoSlug, prId: pull_request_id }),
        () => 'Pull request declined.'
      );
    }
  );

  server.registerTool(
    'get_pull_request_comments',
    {
      description:
        'Get all comments on a pull request, including inline code review comments with file/line information.',
      inputSchema: getPullRequestCommentsSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, pull_request_id, page, pagelen }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(
        await getPullRequestComments({
          workspace: w,
          repoSlug,
          prId: pull_request_id,
          page,
          pagelen,
        })
      );
    }
  );

  server.registerTool(
    'add_pull_request_comment',
    {
      description: 'Add a comment to a pull request. Supports Markdown formatting.',
      inputSchema: addPullRequestCommentSchema,
    },
    async ({ workspace, repo_slug, pull_request_id, content }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(
        await addComment({
          workspace: w,
          repoSlug,
          prId: pull_request_id,
          content,
        }),
        () => 'Comment added.'
      );
    }
  );

  server.registerTool(
    'get_pull_request_diff',
    {
      description:
        'Get the diff for a pull request. Returns raw unified diff text. Use get_pull_request for metadata.',
      inputSchema: getPullRequestDiffSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, pull_request_id }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      const result = await getPullRequestDiff({
        workspace: w,
        repoSlug,
        prId: pull_request_id,
      });

      return resultToResponse(result, (diff) => diff);
    }
  );
};

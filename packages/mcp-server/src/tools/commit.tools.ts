import { getCommit, listCommits } from '@bitbucket-tool/core';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getCommitSchema, listCommitsSchema } from '../schemas/commit.schemas';
import { resolveRepo, resultToResponse } from './helpers';

export const registerCommitTools = (server: McpServer): void => {
  // @ts-expect-error TS2589: deep Zod inference in MCP SDK's ShapeOutput exceeds recursion limit
  server.registerTool(
    'list_commits',
    {
      description:
        'List recent commits in a repository. Returns commit hashes, messages, authors, and dates.',
      inputSchema: listCommitsSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, page, pagelen }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(await listCommits({ workspace: w, repoSlug, page, pagelen }));
    }
  );

  server.registerTool(
    'get_commit',
    {
      description:
        'Get details of a specific commit including message, author, date, and parent hashes.',
      inputSchema: getCommitSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, commit }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(await getCommit({ workspace: w, repoSlug, commit }));
    }
  );
};

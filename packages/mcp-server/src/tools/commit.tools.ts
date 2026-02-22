import { getCommit, listCommits } from '@bitbucket-tool/core';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getCommitSchema, listCommitsSchema } from '../schemas/commit.schemas';
import { resolveWorkspace, resultToResponse } from './helpers';

export const registerCommitTools = (server: McpServer): void => {
  // @ts-expect-error TS2589: MCP SDK overload resolution + transitive generated types exceed TypeScript recursion limit
  server.tool(
    'list_commits',
    'List recent commits in a repository. Returns commit hashes, messages, authors, and dates.',
    listCommitsSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, page, pagelen }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await listCommits({ workspace: w, repoSlug: repo_slug, page, pagelen })
      );
    }
  );

  server.tool(
    'get_commit',
    'Get details of a specific commit including message, author, date, and parent hashes.',
    getCommitSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, commit }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(await getCommit({ workspace: w, repoSlug: repo_slug, commit }));
    }
  );
};

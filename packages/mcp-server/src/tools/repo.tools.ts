import {
  createBranch,
  deleteBranch,
  getBranch,
  listBranches,
  listRepositories,
} from '@bitbucket-tool/core';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  createBranchSchema,
  deleteBranchSchema,
  getBranchSchema,
  listBranchesSchema,
  listRepositoriesSchema,
} from '../schemas/repo.schemas';
import { resolveRepo, resolveWorkspace, resultToResponse } from './helpers';

export const registerRepoTools = (server: McpServer): void => {
  server.registerTool(
    'list_repositories',
    {
      description:
        'List repositories in a workspace. Returns repo slugs needed by most other tools.',
      inputSchema: listRepositoriesSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, page, pagelen }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(await listRepositories({ workspace: w, page, pagelen }));
    }
  );

  server.registerTool(
    'list_branches',
    {
      description:
        'List branches in a repository. Use to find branch names for creating PRs or triggering pipelines.',
      inputSchema: listBranchesSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, page, pagelen }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(await listBranches({ workspace: w, repoSlug, page, pagelen }));
    }
  );

  server.registerTool(
    'get_branch',
    {
      description: 'Get details of a specific branch including latest commit hash.',
      inputSchema: getBranchSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, name }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(await getBranch({ workspace: w, repoSlug, name }));
    }
  );

  server.registerTool(
    'create_branch',
    {
      description:
        'Create a new branch from a commit hash or existing branch. Use get_branch to find the target commit hash.',
      inputSchema: createBranchSchema,
      annotations: { idempotentHint: true },
    },
    async ({ workspace, repo_slug, name, target }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(await createBranch({ workspace: w, repoSlug, name, target }));
    }
  );

  server.registerTool(
    'delete_branch',
    {
      description:
        'Delete a branch. This is irreversible. Use list_branches to verify the branch name first.',
      inputSchema: deleteBranchSchema,
      annotations: { destructiveHint: true },
    },
    async ({ workspace, repo_slug, name }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(
        await deleteBranch({ workspace: w, repoSlug, name }),
        () => 'Branch deleted.'
      );
    }
  );
};

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
import { resolveWorkspace, resultToResponse } from './helpers';

export const registerRepoTools = (server: McpServer): void => {
  server.tool(
    'list_repositories',
    'List repositories in a workspace. Returns repo slugs needed by most other tools.',
    listRepositoriesSchema,
    { readOnlyHint: true },
    async ({ workspace, page, pagelen }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(await listRepositories({ workspace: w, page, pagelen }));
    }
  );

  server.tool(
    'list_branches',
    'List branches in a repository. Use to find branch names for creating PRs or triggering pipelines.',
    listBranchesSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, page, pagelen }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await listBranches({ workspace: w, repoSlug: repo_slug, page, pagelen })
      );
    }
  );

  server.tool(
    'get_branch',
    'Get details of a specific branch including latest commit hash.',
    getBranchSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, name }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(await getBranch({ workspace: w, repoSlug: repo_slug, name }));
    }
  );

  server.tool(
    'create_branch',
    'Create a new branch from a commit hash or existing branch. Use get_branch to find the target commit hash.',
    createBranchSchema,
    { readOnlyHint: false, idempotentHint: true },
    async ({ workspace, repo_slug, name, target }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await createBranch({ workspace: w, repoSlug: repo_slug, name, target })
      );
    }
  );

  server.tool(
    'delete_branch',
    'Delete a branch. This is irreversible. Use list_branches to verify the branch name first.',
    deleteBranchSchema,
    { readOnlyHint: false, destructiveHint: true },
    async ({ workspace, repo_slug, name }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await deleteBranch({ workspace: w, repoSlug: repo_slug, name }),
        () => 'Branch deleted.'
      );
    }
  );
};

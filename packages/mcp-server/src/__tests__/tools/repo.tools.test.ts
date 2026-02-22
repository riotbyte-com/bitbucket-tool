import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerAllTools } from '../../tools';

vi.mock('@bitbucket-tool/core', () => ({
  listRepositories: vi.fn(),
  listBranches: vi.fn(),
  getBranch: vi.fn(),
  createBranch: vi.fn(),
  deleteBranch: vi.fn(),
}));

import {
  createBranch,
  deleteBranch,
  getBranch,
  listBranches,
  listRepositories,
} from '@bitbucket-tool/core';

const ws = 'test-workspace';
const repo = 'test-repo';

const callTool = async (client: Client, name: string, args: Record<string, unknown>) =>
  client.callTool({ name, arguments: args });

const textOf = (result: Awaited<ReturnType<Client['callTool']>>) =>
  (result.content as Array<{ type: string; text: string }>)[0].text;

describe('Repo tools', () => {
  let client: Client;
  let server: McpServer;

  beforeAll(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    server = new McpServer({ name: 'test', version: '0.0.1' });
    client = new Client({ name: 'test-client', version: '0.0.1' });

    registerAllTools(server);

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list_repositories', () => {
    it('passes params to core and returns JSON response', async () => {
      const repos = [{ slug: 'my-repo', full_name: 'ws/my-repo' }];
      vi.mocked(listRepositories).mockResolvedValue({ ok: true, data: repos as never });

      const result = await callTool(client, 'list_repositories', {
        workspace: ws,
        page: 1,
        pagelen: 50,
      });

      expect(listRepositories).toHaveBeenCalledWith({
        workspace: ws,
        page: 1,
        pagelen: 50,
      });
      expect(result.isError).toBeFalsy();
      expect(JSON.parse(textOf(result))).toEqual(repos);
    });

    it('returns error response on failure', async () => {
      vi.mocked(listRepositories).mockResolvedValue({
        ok: false,
        error: { status: 404, message: 'Workspace not found' },
      });

      const result = await callTool(client, 'list_repositories', { workspace: ws });

      expect(result.isError).toBe(true);
      expect(textOf(result)).toBe('Workspace not found (404)');
    });
  });

  describe('list_branches', () => {
    it('passes params to core and returns JSON response', async () => {
      const branches = [{ name: 'main', target: { hash: 'abc123' } }];
      vi.mocked(listBranches).mockResolvedValue({ ok: true, data: branches as never });

      const result = await callTool(client, 'list_branches', {
        workspace: ws,
        repo_slug: repo,
      });

      expect(listBranches).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        page: undefined,
        pagelen: undefined,
      });
      expect(JSON.parse(textOf(result))).toEqual(branches);
    });
  });

  describe('get_branch', () => {
    it('passes params to core and returns JSON response', async () => {
      const branch = { name: 'main', target: { hash: 'abc123' } };
      vi.mocked(getBranch).mockResolvedValue({ ok: true, data: branch as never });

      const result = await callTool(client, 'get_branch', {
        workspace: ws,
        repo_slug: repo,
        name: 'main',
      });

      expect(getBranch).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        name: 'main',
      });
      expect(JSON.parse(textOf(result))).toEqual(branch);
    });
  });

  describe('create_branch', () => {
    it('passes params to core and returns JSON response', async () => {
      const branch = { name: 'feat/new', target: { hash: 'def456' } };
      vi.mocked(createBranch).mockResolvedValue({ ok: true, data: branch as never });

      const result = await callTool(client, 'create_branch', {
        workspace: ws,
        repo_slug: repo,
        name: 'feat/new',
        target: 'abc123',
      });

      expect(createBranch).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        name: 'feat/new',
        target: 'abc123',
      });
      expect(JSON.parse(textOf(result))).toEqual(branch);
    });
  });

  describe('delete_branch', () => {
    it('passes params to core and returns response', async () => {
      vi.mocked(deleteBranch).mockResolvedValue({ ok: true, data: undefined as never });

      const result = await callTool(client, 'delete_branch', {
        workspace: ws,
        repo_slug: repo,
        name: 'feat/old',
      });

      expect(deleteBranch).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        name: 'feat/old',
      });
      expect(result.isError).toBeFalsy();
      expect(textOf(result)).toBe('Branch deleted.');
    });

    it('returns error on failure', async () => {
      vi.mocked(deleteBranch).mockResolvedValue({
        ok: false,
        error: { status: 403, message: 'Branch protection' },
      });

      const result = await callTool(client, 'delete_branch', {
        workspace: ws,
        repo_slug: repo,
        name: 'main',
      });

      expect(result.isError).toBe(true);
      expect(textOf(result)).toBe('Branch protection (403)');
    });
  });
});

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerAllTools } from '../../tools';

vi.mock('@bitbucket-tool/core', () => ({
  listCommits: vi.fn(),
  getCommit: vi.fn(),
}));

import { getCommit, listCommits } from '@bitbucket-tool/core';

const ws = 'test-workspace';
const repo = 'test-repo';

const callTool = async (client: Client, name: string, args: Record<string, unknown>) =>
  client.callTool({ name, arguments: args });

const textOf = (result: Awaited<ReturnType<Client['callTool']>>) =>
  (result.content as Array<{ type: string; text: string }>)[0].text;

describe('Commit tools', () => {
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

  describe('list_commits', () => {
    it('passes params to core and returns JSON response', async () => {
      const commits = [{ hash: 'abc123', message: 'initial commit' }];
      vi.mocked(listCommits).mockResolvedValue({ ok: true, data: commits as never });

      const result = await callTool(client, 'list_commits', {
        workspace: ws,
        repo_slug: repo,
        page: 1,
        pagelen: 30,
      });

      expect(listCommits).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        page: 1,
        pagelen: 30,
      });
      expect(result.isError).toBeFalsy();
      expect(JSON.parse(textOf(result))).toEqual(commits);
    });

    it('returns error response on failure', async () => {
      vi.mocked(listCommits).mockResolvedValue({
        ok: false,
        error: { status: 404, message: 'Repository not found' },
      });

      const result = await callTool(client, 'list_commits', {
        workspace: ws,
        repo_slug: repo,
      });

      expect(result.isError).toBe(true);
      expect(textOf(result)).toBe('Repository not found (404)');
    });
  });

  describe('get_commit', () => {
    it('passes params to core and returns JSON response', async () => {
      const commit = { hash: 'abc123', message: 'feat: add feature', author: { raw: 'Test' } };
      vi.mocked(getCommit).mockResolvedValue({ ok: true, data: commit as never });

      const result = await callTool(client, 'get_commit', {
        workspace: ws,
        repo_slug: repo,
        commit: 'abc123',
      });

      expect(getCommit).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        commit: 'abc123',
      });
      expect(JSON.parse(textOf(result))).toEqual(commit);
    });

    it('returns error on failure', async () => {
      vi.mocked(getCommit).mockResolvedValue({
        ok: false,
        error: { status: 404, message: 'Commit not found' },
      });

      const result = await callTool(client, 'get_commit', {
        workspace: ws,
        repo_slug: repo,
        commit: 'nonexistent',
      });

      expect(result.isError).toBe(true);
      expect(textOf(result)).toBe('Commit not found (404)');
    });
  });
});

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerAllTools } from '../../tools';

vi.mock('@bitbucket-tool/core', () => ({
  listPullRequests: vi.fn(),
  getPullRequest: vi.fn(),
  createPullRequest: vi.fn(),
  updatePullRequest: vi.fn(),
  declinePullRequest: vi.fn(),
  getPullRequestComments: vi.fn(),
  addComment: vi.fn(),
  getPullRequestDiff: vi.fn(),
}));

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

const ws = 'test-workspace';
const repo = 'test-repo';
const prId = 42;

const callTool = async (client: Client, name: string, args: Record<string, unknown>) =>
  client.callTool({ name, arguments: args });

const textOf = (result: Awaited<ReturnType<Client['callTool']>>) =>
  (result.content as Array<{ type: string; text: string }>)[0].text;

describe('PR tools', () => {
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

  describe('list_pull_requests', () => {
    it('passes params to core and returns JSON response', async () => {
      const prs = [{ id: 1, title: 'First PR' }];
      vi.mocked(listPullRequests).mockResolvedValue({ ok: true, data: prs as never });

      const result = await callTool(client, 'list_pull_requests', {
        workspace: ws,
        repo_slug: repo,
        state: 'OPEN',
      });

      expect(listPullRequests).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        state: 'OPEN',
        page: undefined,
        pagelen: undefined,
      });
      expect(result.isError).toBeFalsy();
      expect(JSON.parse(textOf(result))).toEqual(prs);
    });

    it('returns error response on failure', async () => {
      vi.mocked(listPullRequests).mockResolvedValue({
        ok: false,
        error: { status: 401, message: 'Unauthorized' },
      });

      const result = await callTool(client, 'list_pull_requests', {
        workspace: ws,
        repo_slug: repo,
      });

      expect(result.isError).toBe(true);
      expect(textOf(result)).toBe('Unauthorized (401)');
    });
  });

  describe('get_pull_request', () => {
    it('passes params to core and returns JSON response', async () => {
      const pr = { id: prId, title: 'My PR' };
      vi.mocked(getPullRequest).mockResolvedValue({ ok: true, data: pr as never });

      const result = await callTool(client, 'get_pull_request', {
        workspace: ws,
        repo_slug: repo,
        pull_request_id: prId,
      });

      expect(getPullRequest).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        prId,
      });
      expect(JSON.parse(textOf(result))).toEqual(pr);
    });
  });

  describe('create_pull_request', () => {
    it('passes params with default destination branch', async () => {
      const pr = { id: 1, title: 'New PR' };
      vi.mocked(createPullRequest).mockResolvedValue({ ok: true, data: pr as never });

      await callTool(client, 'create_pull_request', {
        workspace: ws,
        repo_slug: repo,
        source_branch: 'feat/cool',
        title: 'New PR',
      });

      expect(createPullRequest).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        sourceBranch: 'feat/cool',
        destinationBranch: 'main',
        title: 'New PR',
        description: undefined,
      });
    });

    it('uses custom destination branch when provided', async () => {
      vi.mocked(createPullRequest).mockResolvedValue({
        ok: true,
        data: { id: 1 } as never,
      });

      await callTool(client, 'create_pull_request', {
        workspace: ws,
        repo_slug: repo,
        source_branch: 'feat/cool',
        destination_branch: 'develop',
        title: 'New PR',
        description: 'Some description',
      });

      expect(createPullRequest).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        sourceBranch: 'feat/cool',
        destinationBranch: 'develop',
        title: 'New PR',
        description: 'Some description',
      });
    });
  });

  describe('update_pull_request', () => {
    it('builds updates object from optional fields', async () => {
      vi.mocked(updatePullRequest).mockResolvedValue({
        ok: true,
        data: { id: prId } as never,
      });

      await callTool(client, 'update_pull_request', {
        workspace: ws,
        repo_slug: repo,
        pull_request_id: prId,
        title: 'Updated title',
        destination_branch: 'develop',
      });

      expect(updatePullRequest).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        prId,
        updates: {
          title: 'Updated title',
          destination: { branch: { name: 'develop' } },
        },
      });
    });

    it('omits undefined fields from updates', async () => {
      vi.mocked(updatePullRequest).mockResolvedValue({
        ok: true,
        data: { id: prId } as never,
      });

      await callTool(client, 'update_pull_request', {
        workspace: ws,
        repo_slug: repo,
        pull_request_id: prId,
        title: 'Only title',
      });

      expect(updatePullRequest).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        prId,
        updates: { title: 'Only title' },
      });
    });
  });

  describe('decline_pull_request', () => {
    it('passes params to core', async () => {
      vi.mocked(declinePullRequest).mockResolvedValue({ ok: true, data: undefined as never });

      const result = await callTool(client, 'decline_pull_request', {
        workspace: ws,
        repo_slug: repo,
        pull_request_id: prId,
      });

      expect(declinePullRequest).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        prId,
      });
      expect(result.isError).toBeFalsy();
      expect(textOf(result)).toBe('Pull request declined.');
    });
  });

  describe('get_pull_request_comments', () => {
    it('passes params including pagination to core', async () => {
      const comments = [{ id: 1, content: { raw: 'LGTM' } }];
      vi.mocked(getPullRequestComments).mockResolvedValue({
        ok: true,
        data: comments as never,
      });

      const result = await callTool(client, 'get_pull_request_comments', {
        workspace: ws,
        repo_slug: repo,
        pull_request_id: prId,
        page: 2,
        pagelen: 10,
      });

      expect(getPullRequestComments).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        prId,
        page: 2,
        pagelen: 10,
      });
      expect(JSON.parse(textOf(result))).toEqual(comments);
    });
  });

  describe('add_pull_request_comment', () => {
    it('passes params to core', async () => {
      vi.mocked(addComment).mockResolvedValue({ ok: true, data: undefined as never });

      const result = await callTool(client, 'add_pull_request_comment', {
        workspace: ws,
        repo_slug: repo,
        pull_request_id: prId,
        content: 'Nice work!',
      });

      expect(addComment).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        prId,
        content: 'Nice work!',
      });
      expect(result.isError).toBeFalsy();
      expect(textOf(result)).toBe('Comment added.');
    });
  });

  describe('get_pull_request_diff', () => {
    it('returns raw text diff (not JSON)', async () => {
      const diff = '--- a/file.ts\n+++ b/file.ts\n@@ -1 +1 @@\n-old\n+new';
      vi.mocked(getPullRequestDiff).mockResolvedValue({ ok: true, data: diff });

      const result = await callTool(client, 'get_pull_request_diff', {
        workspace: ws,
        repo_slug: repo,
        pull_request_id: prId,
      });

      expect(textOf(result)).toBe(diff);
    });

    it('returns error on failure', async () => {
      vi.mocked(getPullRequestDiff).mockResolvedValue({
        ok: false,
        error: { status: 404, message: 'PR not found' },
      });

      const result = await callTool(client, 'get_pull_request_diff', {
        workspace: ws,
        repo_slug: repo,
        pull_request_id: 999,
      });

      expect(result.isError).toBe(true);
      expect(textOf(result)).toBe('PR not found (404)');
    });
  });
});

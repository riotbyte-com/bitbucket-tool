import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerAllTools } from '../../tools';

vi.mock('@bitbucket-tool/core', () => ({
  listPipelines: vi.fn(),
  getPipeline: vi.fn(),
  getPipelineStepLog: vi.fn(),
  triggerPipeline: vi.fn(),
}));

import {
  getPipeline,
  getPipelineStepLog,
  listPipelines,
  triggerPipeline,
} from '@bitbucket-tool/core';

const ws = 'test-workspace';
const repo = 'test-repo';

const callTool = async (client: Client, name: string, args: Record<string, unknown>) =>
  client.callTool({ name, arguments: args });

const textOf = (result: Awaited<ReturnType<Client['callTool']>>) =>
  (result.content as Array<{ type: string; text: string }>)[0].text;

describe('Pipeline tools', () => {
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

  describe('list_pipelines', () => {
    it('passes params to core and returns JSON response', async () => {
      const pipelines = [{ uuid: '{abc-123}', state: { name: 'COMPLETED' } }];
      vi.mocked(listPipelines).mockResolvedValue({ ok: true, data: pipelines as never });

      const result = await callTool(client, 'list_pipelines', {
        workspace: ws,
        repo_slug: repo,
        page: 1,
        pagelen: 25,
      });

      expect(listPipelines).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        page: 1,
        pagelen: 25,
      });
      expect(result.isError).toBeFalsy();
      expect(JSON.parse(textOf(result))).toEqual(pipelines);
    });

    it('returns error response on failure', async () => {
      vi.mocked(listPipelines).mockResolvedValue({
        ok: false,
        error: { status: 403, message: 'Forbidden' },
      });

      const result = await callTool(client, 'list_pipelines', {
        workspace: ws,
        repo_slug: repo,
      });

      expect(result.isError).toBe(true);
      expect(textOf(result)).toBe('Forbidden (403)');
    });
  });

  describe('get_pipeline', () => {
    it('passes params to core and returns JSON response', async () => {
      const pipeline = { uuid: '{abc-123}', state: { name: 'COMPLETED' } };
      vi.mocked(getPipeline).mockResolvedValue({ ok: true, data: pipeline as never });

      const result = await callTool(client, 'get_pipeline', {
        workspace: ws,
        repo_slug: repo,
        pipeline_uuid: '{abc-123}',
      });

      expect(getPipeline).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        pipelineUuid: '{abc-123}',
      });
      expect(JSON.parse(textOf(result))).toEqual(pipeline);
    });
  });

  describe('get_pipeline_step_log', () => {
    it('returns raw text log (not JSON)', async () => {
      const log = '+ npm install\n+ npm test\nAll tests passed';
      vi.mocked(getPipelineStepLog).mockResolvedValue({ ok: true, data: log });

      const result = await callTool(client, 'get_pipeline_step_log', {
        workspace: ws,
        repo_slug: repo,
        pipeline_uuid: '{abc-123}',
        step_uuid: '{step-456}',
      });

      expect(getPipelineStepLog).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        pipelineUuid: '{abc-123}',
        stepUuid: '{step-456}',
      });
      expect(textOf(result)).toBe(log);
    });

    it('returns error on failure', async () => {
      vi.mocked(getPipelineStepLog).mockResolvedValue({
        ok: false,
        error: { status: 404, message: 'Step not found' },
      });

      const result = await callTool(client, 'get_pipeline_step_log', {
        workspace: ws,
        repo_slug: repo,
        pipeline_uuid: '{abc-123}',
        step_uuid: '{nope}',
      });

      expect(result.isError).toBe(true);
      expect(textOf(result)).toBe('Step not found (404)');
    });
  });

  describe('trigger_pipeline', () => {
    it('passes params with default ref_type branch', async () => {
      const pipeline = { uuid: '{new-pipe}' };
      vi.mocked(triggerPipeline).mockResolvedValue({ ok: true, data: pipeline as never });

      const result = await callTool(client, 'trigger_pipeline', {
        workspace: ws,
        repo_slug: repo,
        ref_name: 'main',
      });

      expect(triggerPipeline).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        target: {
          type: 'pipeline_ref_target',
          ref_type: 'branch',
          ref_name: 'main',
        },
      });
      expect(JSON.parse(textOf(result))).toEqual(pipeline);
    });

    it('passes custom pattern for custom pipelines', async () => {
      vi.mocked(triggerPipeline).mockResolvedValue({
        ok: true,
        data: { uuid: '{custom}' } as never,
      });

      await callTool(client, 'trigger_pipeline', {
        workspace: ws,
        repo_slug: repo,
        ref_name: 'main',
        ref_type: 'tag',
        pattern: 'deploy-staging',
      });

      expect(triggerPipeline).toHaveBeenCalledWith({
        workspace: ws,
        repoSlug: repo,
        target: {
          type: 'pipeline_ref_target',
          ref_type: 'tag',
          ref_name: 'main',
          selector: { type: 'custom', pattern: 'deploy-staging' },
        },
      });
    });
  });
});

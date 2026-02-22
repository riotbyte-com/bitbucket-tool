import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { registerAllTools } from '../tools';

const EXPECTED_TOOLS = [
  'list_pull_requests',
  'get_pull_request',
  'create_pull_request',
  'update_pull_request',
  'decline_pull_request',
  'get_pull_request_comments',
  'add_pull_request_comment',
  'get_pull_request_diff',
  'list_pipelines',
  'get_pipeline',
  'get_pipeline_step_log',
  'trigger_pipeline',
  'list_repositories',
  'list_branches',
  'get_branch',
  'create_branch',
  'delete_branch',
  'list_commits',
  'get_commit',
] as const;

describe('MCP Server integration', () => {
  let client: Client;
  let server: McpServer;

  beforeAll(async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    server = new McpServer({ name: 'bitbucket-test', version: '0.0.1' });
    client = new Client({ name: 'test-client', version: '0.0.1' });

    registerAllTools(server);

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client.close();
    await server.close();
  });

  it('starts and responds to tool listing', async () => {
    const { tools } = await client.listTools();
    expect(tools.length).toBeGreaterThan(0);
  });

  it('registers exactly 19 tools', async () => {
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(19);
  });

  it('registers all expected tool names', async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual([...EXPECTED_TOOLS].sort());
  });

  it.each(EXPECTED_TOOLS)('tool "%s" has a description and input schema', async (toolName) => {
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === toolName);

    expect(tool).toBeDefined();
    expect(tool!.description).toBeTruthy();
    expect(tool!.inputSchema).toBeDefined();
    expect(tool!.inputSchema.type).toBe('object');
  });
});

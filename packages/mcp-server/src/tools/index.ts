import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCommitTools } from './commit.tools';
import { registerPipelineTools } from './pipeline.tools';
import { registerPrTools } from './pr.tools';
import { registerRepoTools } from './repo.tools';

export const registerAllTools = (server: McpServer): void => {
  registerPrTools(server);
  registerPipelineTools(server);
  registerRepoTools(server);
  registerCommitTools(server);
};

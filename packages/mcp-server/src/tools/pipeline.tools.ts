import {
  getPipeline,
  getPipelineStepLog,
  listPipelines,
  triggerPipeline,
} from '@bitbucket-tool/core';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  getPipelineSchema,
  getPipelineStepLogSchema,
  listPipelinesSchema,
  triggerPipelineSchema,
} from '../schemas/pipeline.schemas';
import { resolveWorkspace, resultToResponse } from './helpers';

export const registerPipelineTools = (server: McpServer): void => {
  server.tool(
    'list_pipelines',
    'List recent pipelines for a repository. Returns pipeline UUIDs, status, and trigger info.',
    listPipelinesSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, page, pagelen }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await listPipelines({ workspace: w, repoSlug: repo_slug, page, pagelen })
      );
    }
  );

  server.tool(
    'get_pipeline',
    'Get details of a specific pipeline including steps, status, and duration. Use list_pipelines to find pipeline UUIDs.',
    getPipelineSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, pipeline_uuid }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await getPipeline({ workspace: w, repoSlug: repo_slug, pipelineUuid: pipeline_uuid })
      );
    }
  );

  server.tool(
    'get_pipeline_step_log',
    'Get the log output of a specific pipeline step. Returns raw text. Use get_pipeline to find step UUIDs.',
    getPipelineStepLogSchema,
    { readOnlyHint: true },
    async ({ workspace, repo_slug, pipeline_uuid, step_uuid }) => {
      const w = resolveWorkspace(workspace);
      const result = await getPipelineStepLog({
        workspace: w,
        repoSlug: repo_slug,
        pipelineUuid: pipeline_uuid,
        stepUuid: step_uuid,
      });

      return resultToResponse(result, (log) => log);
    }
  );

  // @ts-expect-error TS2589: MCP SDK overload resolution + transitive generated types exceed TypeScript recursion limit
  server.tool(
    'trigger_pipeline',
    'Trigger a new pipeline run on a branch or tag. Optionally specify a custom pipeline pattern.',
    triggerPipelineSchema,
    { readOnlyHint: false },
    async ({ workspace, repo_slug, ref_name, ref_type, pattern }) => {
      const w = resolveWorkspace(workspace);
      return resultToResponse(
        await triggerPipeline({
          workspace: w,
          repoSlug: repo_slug,
          target: {
            type: 'pipeline_ref_target',
            ref_type: ref_type ?? 'branch',
            ref_name,
            ...(pattern ? { selector: { type: 'custom' as const, pattern } } : {}),
          },
        })
      );
    }
  );
};

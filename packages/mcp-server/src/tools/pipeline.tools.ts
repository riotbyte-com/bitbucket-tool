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
import { resolveRepo, resultToResponse } from './helpers';

export const registerPipelineTools = (server: McpServer): void => {
  server.registerTool(
    'list_pipelines',
    {
      description:
        'List recent pipelines for a repository. Returns pipeline UUIDs, status, and trigger info.',
      inputSchema: listPipelinesSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, page, pagelen }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(await listPipelines({ workspace: w, repoSlug, page, pagelen }));
    }
  );

  server.registerTool(
    'get_pipeline',
    {
      description:
        'Get details of a specific pipeline including steps, status, and duration. Use list_pipelines to find pipeline UUIDs.',
      inputSchema: getPipelineSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, pipeline_uuid }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(
        await getPipeline({ workspace: w, repoSlug, pipelineUuid: pipeline_uuid })
      );
    }
  );

  server.registerTool(
    'get_pipeline_step_log',
    {
      description:
        'Get the log output of a specific pipeline step. Returns raw text. Use get_pipeline to find step UUIDs.',
      inputSchema: getPipelineStepLogSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ workspace, repo_slug, pipeline_uuid, step_uuid }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      const result = await getPipelineStepLog({
        workspace: w,
        repoSlug,
        pipelineUuid: pipeline_uuid,
        stepUuid: step_uuid,
      });

      return resultToResponse(result, (log) => log);
    }
  );

  // @ts-expect-error TS2589: deep Zod inference in MCP SDK's ShapeOutput exceeds recursion limit
  server.registerTool(
    'trigger_pipeline',
    {
      description:
        'Trigger a new pipeline run on a branch or tag. Optionally specify a custom pipeline pattern.',
      inputSchema: triggerPipelineSchema,
    },
    async ({ workspace, repo_slug, ref_name, ref_type, pattern }) => {
      const { workspace: w, repoSlug } = resolveRepo(workspace, repo_slug);
      return resultToResponse(
        await triggerPipeline({
          workspace: w,
          repoSlug,
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

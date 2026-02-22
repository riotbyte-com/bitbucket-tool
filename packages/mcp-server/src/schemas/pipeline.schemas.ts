import { z } from 'zod';
import { paginationParams, repoSlugParam, workspaceParam } from './common.schemas';

export const listPipelinesSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  ...paginationParams,
};

export const getPipelineSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  pipeline_uuid: z.string().describe('Pipeline UUID'),
};

export const getPipelineStepLogSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  pipeline_uuid: z.string().describe('Pipeline UUID'),
  step_uuid: z.string().describe('Pipeline step UUID. Use get_pipeline to find step UUIDs.'),
};

export const triggerPipelineSchema = {
  workspace: workspaceParam,
  repo_slug: repoSlugParam,
  ref_name: z.string().describe('Branch or tag name to run the pipeline on'),
  ref_type: z.enum(['branch', 'tag']).optional().describe('Reference type. Defaults to branch.'),
  pattern: z
    .string()
    .optional()
    .describe('Custom pipeline pattern/name to run (for custom pipelines)'),
};

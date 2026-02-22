import {
  createPipelineForRepository,
  getPipelineForRepository,
  getPipelineStepLogForRepository,
  getPipelineStepsForRepository,
  getPipelinesForRepository,
  stopPipeline,
} from '../generated/bitbucket-client/sdk.gen';
import type {
  Pipeline,
  PipelineStep,
  PipelineTarget,
} from '../generated/bitbucket-client/types.gen';
import type { PaginationParams } from '../types/pagination.types';
import { apiError, fail, ok, type Result } from '../types/result.types';
import type { RepositoryParams } from './pull-request.service';

export type ListPipelinesParams = RepositoryParams & PaginationParams;

export type GetPipelineParams = RepositoryParams & {
  pipelineUuid: string;
};

export type GetPipelineStepsParams = RepositoryParams & {
  pipelineUuid: string;
};

export type GetPipelineStepLogParams = RepositoryParams & {
  pipelineUuid: string;
  stepUuid: string;
};

export type TriggerPipelineParams = RepositoryParams & {
  target: {
    type: 'pipeline_ref_target';
    ref_type: 'branch' | 'tag';
    ref_name: string;
    selector?: { type: 'custom'; pattern: string };
  };
};

export type StopPipelineParams = RepositoryParams & {
  pipelineUuid: string;
};

export const listPipelines = async (params: ListPipelinesParams): Promise<Result<Pipeline[]>> => {
  const { workspace, repoSlug, page, pagelen } = params;
  const response = await getPipelinesForRepository({
    path: { workspace, repo_slug: repoSlug },
    query: { page, pagelen },
  });

  if (response.error) {
    return fail(apiError(response.response.status, 'Failed to list pipelines', response.error));
  }

  return ok(response.data?.values ?? []);
};

export const getPipeline = async (params: GetPipelineParams): Promise<Result<Pipeline>> => {
  const { workspace, repoSlug, pipelineUuid } = params;
  const response = await getPipelineForRepository({
    path: { workspace, repo_slug: repoSlug, pipeline_uuid: pipelineUuid },
  });

  if (response.error) {
    return fail(apiError(response.response.status, 'Pipeline not found', response.error));
  }

  return response.data ? ok(response.data) : fail(apiError(404, 'Pipeline not found'));
};

export const getPipelineSteps = async (
  params: GetPipelineStepsParams
): Promise<Result<PipelineStep[]>> => {
  const { workspace, repoSlug, pipelineUuid } = params;
  const response = await getPipelineStepsForRepository({
    path: { workspace, repo_slug: repoSlug, pipeline_uuid: pipelineUuid },
  });

  if (response.error) {
    return fail(apiError(response.response.status, 'Failed to get pipeline steps', response.error));
  }

  return ok(response.data?.values ?? []);
};

export const getPipelineStepLog = async (
  params: GetPipelineStepLogParams
): Promise<Result<string>> => {
  const { workspace, repoSlug, pipelineUuid, stepUuid } = params;
  const response = await getPipelineStepLogForRepository({
    path: {
      workspace,
      repo_slug: repoSlug,
      pipeline_uuid: pipelineUuid,
      step_uuid: stepUuid,
    },
    parseAs: 'text',
  });

  if (response.error) {
    return fail(apiError(response.response.status, 'Failed to get step log', response.error));
  }

  return ok((response.data as unknown as string) ?? '');
};

export const triggerPipeline = async (params: TriggerPipelineParams): Promise<Result<Pipeline>> => {
  const { workspace, repoSlug, target } = params;
  const response = await createPipelineForRepository({
    path: { workspace, repo_slug: repoSlug },
    body: { type: 'pipeline', target: target as unknown as PipelineTarget },
  });

  if (response.error) {
    return fail(apiError(response.response.status, 'Failed to trigger pipeline', response.error));
  }

  return response.data
    ? ok(response.data)
    : fail(apiError(500, 'No data returned from pipeline trigger'));
};

export const stopPipelineExecution = async (params: StopPipelineParams): Promise<Result<void>> => {
  const { workspace, repoSlug, pipelineUuid } = params;
  const response = await stopPipeline({
    path: { workspace, repo_slug: repoSlug, pipeline_uuid: pipelineUuid },
  });

  if (response.error) {
    return fail(apiError(response.response.status, 'Failed to stop pipeline', response.error));
  }

  return ok(undefined);
};

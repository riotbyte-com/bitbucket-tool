#!/usr/bin/env tsx
/**
 * Post-download patch for the Bitbucket OpenAPI spec.
 *
 * The official spec is missing pagination query params on many list endpoints
 * and has incorrect body types on some POST endpoints. This script patches
 * those deficiencies so the generated client has correct types.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SPEC_PATH = process.argv[2];
if (!SPEC_PATH) {
  console.error('Usage: tsx scripts/patch-spec.ts <spec-path>');
  process.exit(1);
}

// biome-ignore lint/suspicious/noExplicitAny: JSON manipulation
const spec = JSON.parse(readFileSync(SPEC_PATH, 'utf-8')) as any;

const paginationParams = [
  { name: 'page', in: 'query', required: false, schema: { type: 'integer' }, description: 'Page number (1-based)' },
  { name: 'pagelen', in: 'query', required: false, schema: { type: 'integer', maximum: 100 }, description: 'Items per page' },
];

const endpointsNeedingPagination = [
  '/repositories/{workspace}',
  '/repositories/{workspace}/{repo_slug}/pullrequests',
  '/repositories/{workspace}/{repo_slug}/pullrequests/{pull_request_id}/comments',
  '/repositories/{workspace}/{repo_slug}/refs/branches',
  '/repositories/{workspace}/{repo_slug}/commits',
];

endpointsNeedingPagination.forEach((path) => {
  const endpoint = spec.paths?.[path]?.get;
  if (!endpoint) {
    return;
  }

  endpoint.parameters = endpoint.parameters ?? [];
  const existing = new Set(endpoint.parameters.map((p: { name: string }) => p.name));
  paginationParams.forEach((param) => {
    if (!existing.has(param.name)) {
      endpoint.parameters.push(param);
    }
  });
});

const branchCreatePath = '/repositories/{workspace}/{repo_slug}/refs/branches';
const branchPost = spec.paths?.[branchCreatePath]?.post;
if (branchPost) {
  branchPost.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Branch name' },
            target: {
              type: 'object',
              properties: {
                hash: { type: 'string', description: 'Commit hash to create the branch from' },
              },
              required: ['hash'],
            },
          },
          required: ['name', 'target'],
        },
      },
    },
  };
}

writeFileSync(SPEC_PATH, JSON.stringify(spec, null, 2));
console.log(`Patched spec at ${SPEC_PATH}`);

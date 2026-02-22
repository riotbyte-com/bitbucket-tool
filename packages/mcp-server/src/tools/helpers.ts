import type { Result } from '@bitbucket-tool/core';

type ToolResponse = { content: { type: 'text'; text: string }[]; isError?: boolean };

export const resolveWorkspace = (workspace: string): string => {
  const resolved = workspace || process.env.BITBUCKET_WORKSPACE;

  if (!resolved) {
    throw new Error(
      'workspace is required. Provide it as a parameter or set BITBUCKET_WORKSPACE env var.'
    );
  }

  return resolved;
};

export const jsonResponse = (data: unknown): ToolResponse => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data ?? null, null, 2) }],
});

export const textResponse = (text: string): ToolResponse => ({
  content: [{ type: 'text' as const, text }],
});

export const errorResponse = (message: string): ToolResponse => ({
  content: [{ type: 'text' as const, text: message }],
  isError: true,
});

export const resultToResponse = <T>(
  result: Result<T>,
  formatter?: (data: T) => string
): ToolResponse => {
  if (!result.ok) {
    return errorResponse(`${result.error.message} (${result.error.status})`);
  }

  return formatter ? textResponse(formatter(result.data)) : jsonResponse(result.data);
};

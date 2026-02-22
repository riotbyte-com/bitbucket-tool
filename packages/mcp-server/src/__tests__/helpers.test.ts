import type { Result } from '@bitbucket-tool/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  errorResponse,
  jsonResponse,
  resolveWorkspace,
  resultToResponse,
  textResponse,
} from '../tools/helpers';

describe('resolveWorkspace', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns workspace when provided directly', () => {
    expect(resolveWorkspace('my-ws')).toBe('my-ws');
  });

  it('falls back to BITBUCKET_WORKSPACE env var when empty string', () => {
    vi.stubEnv('BITBUCKET_WORKSPACE', 'env-ws');
    expect(resolveWorkspace('')).toBe('env-ws');
  });

  it('prefers direct value over env var', () => {
    vi.stubEnv('BITBUCKET_WORKSPACE', 'env-ws');
    expect(resolveWorkspace('direct-ws')).toBe('direct-ws');
  });

  it('throws when neither provided nor env var set', () => {
    vi.stubEnv('BITBUCKET_WORKSPACE', '');
    expect(() => resolveWorkspace('')).toThrow('workspace is required');
  });

  it('throws when workspace is empty and env var is undefined', () => {
    delete process.env.BITBUCKET_WORKSPACE;
    expect(() => resolveWorkspace('')).toThrow('workspace is required');
  });
});

describe('jsonResponse', () => {
  it('wraps data as JSON text content', () => {
    const result = jsonResponse({ id: 1, name: 'test' });

    expect(result).toEqual({
      content: [{ type: 'text', text: JSON.stringify({ id: 1, name: 'test' }, null, 2) }],
    });
  });

  it('does not set isError', () => {
    expect(jsonResponse({})).not.toHaveProperty('isError');
  });
});

describe('textResponse', () => {
  it('wraps string as text content', () => {
    const result = textResponse('hello world');

    expect(result).toEqual({
      content: [{ type: 'text', text: 'hello world' }],
    });
  });

  it('does not set isError', () => {
    expect(textResponse('x')).not.toHaveProperty('isError');
  });
});

describe('errorResponse', () => {
  it('wraps message as text content with isError', () => {
    const result = errorResponse('something broke');

    expect(result).toEqual({
      content: [{ type: 'text', text: 'something broke' }],
      isError: true,
    });
  });
});

describe('resultToResponse', () => {
  it('converts ok Result to JSON response', () => {
    const result: Result<{ id: number }> = { ok: true, data: { id: 42 } };
    const response = resultToResponse(result);

    expect(response).toEqual({
      content: [{ type: 'text', text: JSON.stringify({ id: 42 }, null, 2) }],
    });
  });

  it('converts ok Result with custom formatter to text response', () => {
    const result: Result<string> = { ok: true, data: 'raw diff output' };
    const response = resultToResponse(result, (d) => d);

    expect(response).toEqual({
      content: [{ type: 'text', text: 'raw diff output' }],
    });
  });

  it('converts error Result to error response with status', () => {
    const result: Result<never> = {
      ok: false,
      error: { status: 404, message: 'Not found' },
    };
    const response = resultToResponse(result);

    expect(response).toEqual({
      content: [{ type: 'text', text: 'Not found (404)' }],
      isError: true,
    });
  });
});

import type { PaginatedResponse } from '../types/pagination.types';
import type { ApiError, Result } from '../types/result.types';
import { ok } from '../types/result.types';

type FetchPage<T> = (url?: string) => Promise<Result<PaginatedResponse<T>>>;

export const fetchAllPages = async <T>(fetchPage: FetchPage<T>): Promise<Result<T[], ApiError>> => {
  const allValues: T[] = [];
  let nextUrl: string | undefined;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await fetchPage(nextUrl);

    if (!result.ok) {
      return result;
    }

    allValues.push(...result.data.values);
    nextUrl = result.data.next;

    if (!nextUrl) {
      break;
    }
  }

  return ok(allValues);
};

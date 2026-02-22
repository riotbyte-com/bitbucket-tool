export type ApiError = {
  status: number;
  message: string;
  detail?: unknown;
};

export type Result<T, E = ApiError> = { ok: true; data: T } | { ok: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });

export const fail = <E = ApiError>(error: E): Result<never, E> => ({ ok: false, error });

export const apiError = (status: number, message: string, detail?: unknown): ApiError => ({
  status,
  message,
  detail,
});

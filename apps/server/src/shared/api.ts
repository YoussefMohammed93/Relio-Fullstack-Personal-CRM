export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | string;

export type ApiSuccessEnvelope<T> = {
  success: true;
  data: T;
  error: null;
  meta?: Record<string, unknown>;
};

export type ApiErrorEnvelope = {
  success: false;
  data: null;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
};

export function successResponse<T>(
  data: T,
  meta?: Record<string, unknown>,
): ApiSuccessEnvelope<T> {
  return {
    success: true,
    data,
    error: null,
    ...(meta ? { meta } : {}),
  };
}

export function errorResponse(
  message: string,
  ...rest: [number?, ApiErrorCode?, unknown?]
): ApiErrorEnvelope {
  const [statusCode = 500, code = "INTERNAL_ERROR", details] = rest;
  void statusCode;

  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  };
}

export function buildPaginationMeta(args: {
  page: number;
  limit: number;
  total: number;
}): {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
} {
  const { page, limit, total } = args;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

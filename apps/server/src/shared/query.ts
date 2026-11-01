import { ValidationError } from "../errors/AppError.js";

type PaginationInput = {
  page?: number | string;
  limit?: number | string;
};

type PaginationOptions = {
  defaultLimit?: number;
  maxLimit?: number;
};

export function normalizePagination(
  input: PaginationInput,
  options: PaginationOptions = {},
): {
  page: number;
  limit: number;
  skip: number;
} {
  const defaultLimit = options.defaultLimit ?? 10;
  const maxLimit = options.maxLimit ?? 100;
  const parsedPage = Number(input.page ?? 1);
  const parsedLimit = Number(input.limit ?? defaultLimit);
  const page = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(1, parsedLimit), maxLimit)
    : defaultLimit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function normalizeSortDirection(direction?: string | null): "asc" | "desc" {
  return direction === "desc" ? "desc" : "asc";
}

export function buildSortQuery<T extends string>(
  field: T,
  allowedFields: readonly string[],
  direction?: string | null,
): Record<T, 1 | -1> {
  if (!allowedFields.includes(field)) {
    throw new ValidationError("Unsupported sort field");
  }

  return {
    [field]: normalizeSortDirection(direction) === "desc" ? -1 : 1,
  } as Record<T, 1 | -1>;
}

type FilterOptions = {
  allowedFields: readonly string[];
  searchFields?: readonly string[];
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildFilterQuery<T extends Record<string, unknown>>(
  filters: T,
  options: FilterOptions,
): Record<string, unknown> {
  const query: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (key === "search") {
      const keyword = String(value).trim();
      if (!keyword) {
        continue;
      }

      const escapedKeyword = escapeRegExp(keyword);
      const searchConditions = (options.searchFields ?? []).map((field) => ({
        [field]: new RegExp(escapedKeyword, "i"),
      }));
      if (searchConditions.length > 0) {
        query.$or = searchConditions;
      }
      continue;
    }

    if (
      options.allowedFields.includes(key) &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value instanceof Date)
    ) {
      query[key] = value;
    }
  }

  return query;
}

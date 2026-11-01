import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPaginationMeta, errorResponse, successResponse } from "./api.js";

describe("API helpers", () => {
  it("returns a consistent success envelope", () => {
    const payload = successResponse({ id: "contact-1" });

    assert.deepEqual(payload, {
      success: true,
      data: { id: "contact-1" },
      error: null,
    });
  });

  it("returns a consistent error envelope", () => {
    const payload = errorResponse("Missing email", 400, "VALIDATION_ERROR");

    assert.deepEqual(payload, {
      success: false,
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Missing email",
      },
    });
  });

  it("builds pagination metadata", () => {
    const meta = buildPaginationMeta({ page: 2, limit: 10, total: 55 });

    assert.deepEqual(meta, {
      page: 2,
      limit: 10,
      total: 55,
      totalPages: 6,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});

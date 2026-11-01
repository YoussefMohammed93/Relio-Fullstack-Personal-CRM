import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ValidationError } from "../errors/AppError.js";
import {
  buildFilterQuery,
  buildSortQuery,
  normalizePagination,
  normalizeSortDirection,
} from "./query.js";

describe("shared query utilities", () => {
  it("normalizes pagination input", () => {
    assert.deepEqual(
      normalizePagination({ page: "3", limit: "15" }, { defaultLimit: 10 }),
      {
        page: 3,
        limit: 15,
        skip: 30,
      },
    );
  });

  it("builds filter queries from request values", () => {
    assert.deepEqual(
      buildFilterQuery(
        {
          status: "active",
          search: "Alex.*",
          userId: "abc123",
          unexpected: { $ne: null },
        },
        {
          allowedFields: ["status"],
          searchFields: ["firstName", "lastName", "email"],
        },
      ),
      {
        status: "active",
        $or: [
          { firstName: /Alex\.\*/i },
          { lastName: /Alex\.\*/i },
          { email: /Alex\.\*/i },
        ],
      },
    );
  });

  it("builds sort queries and normalizes direction", () => {
    assert.equal(normalizeSortDirection("desc"), "desc");
    assert.deepEqual(buildSortQuery("createdAt", ["createdAt", "name"], "desc"), {
      createdAt: -1,
    });
  });

  it("rejects sort fields outside the endpoint allowlist", () => {
    assert.throws(
      () => buildSortQuery("password", ["createdAt", "name"], "desc"),
      ValidationError,
    );
  });
});

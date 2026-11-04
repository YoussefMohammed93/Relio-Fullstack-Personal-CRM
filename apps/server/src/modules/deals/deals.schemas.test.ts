import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bulkChangeDealStageSchema,
  bulkDeleteDealsSchema,
  createDealSchema,
  dealsQuerySchema,
  loseDealSchema,
  updateDealSchema,
} from "./deals.schemas.js";

const contactId = "64b000000000000000000001";
const stageId = "64b000000000000000000002";

describe("Deal request schemas", () => {
  it("accepts valid create input and rejects invalid business values", () => {
    const valid = createDealSchema.safeParse({
      name: "Website redesign",
      value: 2500,
      primaryContact: contactId,
      pipelineStage: stageId,
      probability: 50,
      expectedCloseDate: "2026-12-01",
    });
    assert.equal(valid.success, true);
    assert.equal(
      createDealSchema.safeParse({
        name: "",
        value: 0,
        primaryContact: contactId,
        pipelineStage: stageId,
        owner: contactId,
      }).success,
      false,
    );
  });

  it("requires a non-empty update and rejects unknown keys", () => {
    assert.equal(updateDealSchema.safeParse({}).success, false);
    assert.equal(updateDealSchema.safeParse({ status: "won" }).success, false);
    assert.equal(updateDealSchema.safeParse({ primaryContact: null }).success, false);
    assert.equal(updateDealSchema.safeParse({ probability: 100 }).success, true);
  });

  it("validates list ranges, allowlists sort fields, and rejects unknown filters", () => {
    assert.equal(
      dealsQuerySchema.safeParse({ valueMin: "100", valueMax: "500" }).success,
      true,
    );
    assert.equal(
      dealsQuerySchema.safeParse({ valueMin: 500, valueMax: 100 }).success,
      false,
    );
    assert.equal(dealsQuerySchema.safeParse({ sortBy: "owner" }).success, false);
    assert.equal(dealsQuerySchema.safeParse({ $where: "true" }).success, false);
  });

  it("requires unique IDs for bulk actions and accepts only PRD lost reasons", () => {
    assert.equal(
      bulkDeleteDealsSchema.safeParse({ ids: [contactId, contactId] }).success,
      false,
    );
    assert.equal(
      bulkChangeDealStageSchema.safeParse({ ids: [contactId], pipelineStage: stageId })
        .success,
      true,
    );
    assert.equal(loseDealSchema.safeParse({ lostReason: "competitor" }).success, true);
    assert.equal(loseDealSchema.safeParse({ lostReason: "timing" }).success, false);
  });
});

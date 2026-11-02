import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bulkDeleteContactsSchema,
  contactsQuerySchema,
  createContactSchema,
  updateContactSchema,
} from "./contacts.schemas.js";

describe("Contact request schemas", () => {
  it("requires names and rejects unknown create fields", () => {
    assert.equal(createContactSchema.safeParse({ firstName: "Sam" }).success, false);
    assert.equal(
      createContactSchema.safeParse({
        firstName: "Sam",
        lastName: "Rivers",
        owner: "507f1f77bcf86cd799439011",
      }).success,
      false,
    );
  });

  it("normalizes valid contact fields and enforces supported contact types", () => {
    const result = createContactSchema.safeParse({
      firstName: " Sam ",
      lastName: " Rivers ",
      email: "SAM@EXAMPLE.COM",
      contactType: "client",
      tags: [" design "],
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.firstName, "Sam");
      assert.equal(result.data.email, "sam@example.com");
      assert.equal(
        createContactSchema.safeParse({ ...result.data, contactType: "vendor" })
          .success,
        false,
      );
    }
  });

  it("requires non-empty updates and validates list allowlists and ranges", () => {
    assert.equal(updateContactSchema.safeParse({}).success, false);
    assert.equal(
      contactsQuerySchema.safeParse({
        sortBy: "owner",
        owner: "507f1f77bcf86cd799439011",
      }).success,
      false,
    );
    assert.equal(
      contactsQuerySchema.safeParse({ dateFrom: "2026-03-02", dateTo: "2026-03-01" })
        .success,
      false,
    );
    const query = contactsQuerySchema.parse({ page: "2", limit: "25" });
    assert.equal(query.page, 2);
    assert.equal(query.limit, 25);
  });

  it("requires unique, valid IDs for bulk deletion", () => {
    assert.equal(
      bulkDeleteContactsSchema.safeParse({
        ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439011"],
      }).success,
      false,
    );
  });
});

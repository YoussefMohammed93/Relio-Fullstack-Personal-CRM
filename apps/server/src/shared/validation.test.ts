import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors/AppError.js";
import {
  assertOwnership,
  parsePositiveInt,
  parseObjectId,
  sanitizeText,
} from "./validation.js";

describe("backend validation utilities", () => {
  it("sanitizes text input and parses positive integers", () => {
    assert.equal(sanitizeText("  Alice  "), "Alice");
    assert.equal(parsePositiveInt("7", 2), 7);
    assert.equal(parsePositiveInt("0", 2), 2);
  });

  it("validates object ids and throws validation errors", () => {
    assert.doesNotThrow(() => parseObjectId("507f1f77bcf86cd799439011"));
    assert.throws(() => parseObjectId("invalid-id"), ValidationError);
  });

  it("enforces ownership checks", () => {
    assert.doesNotThrow(() => assertOwnership("user-1", "user-1"));
    assert.throws(() => assertOwnership("user-1", "user-2"), ForbiddenError);
    assert.throws(() => assertOwnership(undefined, "user-2"), NotFoundError);
  });
});

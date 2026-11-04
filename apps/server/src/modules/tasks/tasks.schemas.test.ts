import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bulkChangeTaskPrioritySchema,
  createTaskSchema,
  tasksQuerySchema,
  updateTaskSchema,
} from "./tasks.schemas.js";

const taskId = "507f1f77bcf86cd799439011";

describe("Task request schemas", () => {
  it("applies task defaults and accepts a valid related follow-up", () => {
    const result = createTaskSchema.parse({
      title: "Send proposal",
      type: "follow_up",
      relatedEntityType: "Contact",
      relatedEntityId: taskId,
    });

    assert.equal(result.type, "follow_up");
    assert.equal(result.status, "todo");
    assert.equal(result.priority, "medium");
  });

  it("requires a related entity type and id together", () => {
    assert.equal(
      createTaskSchema.safeParse({
        title: "Incomplete relation",
        relatedEntityType: "Deal",
      }).success,
      false,
    );
    assert.equal(
      updateTaskSchema.safeParse({ relatedEntityId: taskId }).success,
      false,
    );
  });

  it("validates list filters, date ranges, and pagination", () => {
    assert.equal(
      tasksQuerySchema.safeParse({
        status: "in_progress",
        priority: "high",
        type: "follow_up",
        dueDateFilter: "overdue",
        relatedEntityType: "Company",
        sortBy: "priority",
        sortDirection: "desc",
      }).success,
      true,
    );
    assert.equal(
      tasksQuerySchema.safeParse({ dueDateFrom: "2026-12-10", dueDateTo: "2026-12-01" })
        .success,
      false,
    );
    assert.equal(tasksQuerySchema.safeParse({ owner: taskId }).success, false);
  });

  it("rejects duplicate IDs and invalid bulk priorities", () => {
    assert.equal(
      bulkChangeTaskPrioritySchema.safeParse({
        ids: [taskId, taskId],
        priority: "high",
      }).success,
      false,
    );
    assert.equal(
      bulkChangeTaskPrioritySchema.safeParse({ ids: [taskId], priority: "urgent" })
        .success,
      false,
    );
  });
});

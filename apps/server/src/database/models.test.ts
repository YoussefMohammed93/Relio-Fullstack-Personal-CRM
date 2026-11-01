import assert from "node:assert/strict";
import mongoose from "mongoose";
import { describe, it } from "node:test";

import {
  Activity,
  Company,
  Contact,
  DEFAULT_PIPELINE_STAGES,
  DEAL_LOST_REASONS,
  Deal,
  DealHistory,
  Notification,
  PipelineStage,
  Task,
  User,
} from "./models/index.js";

describe("Relio database models", () => {
  it("exposes the required domain models", () => {
    assert.equal(User.modelName, "User");
    assert.equal(Contact.modelName, "Contact");
    assert.equal(Company.modelName, "Company");
    assert.equal(PipelineStage.modelName, "PipelineStage");
    assert.equal(Deal.modelName, "Deal");
    assert.equal(Task.modelName, "Task");
    assert.equal(Activity.modelName, "Activity");
    assert.equal(DealHistory.modelName, "DealHistory");
    assert.equal(Notification.modelName, "Notification");
  });

  it("uses owner references and unique identity constraints for user-owned data", () => {
    assert.equal(User.schema.path("email").options.unique, true);
    assert.equal(User.schema.path("username").options.unique, true);
    assert.equal(Deal.schema.path("owner").options.ref, "User");
    assert.equal(Task.schema.path("owner").options.ref, "User");
    assert.equal(Activity.schema.path("owner").options.ref, "User");
  });

  it("defines the required user profile defaults and authentication fields", () => {
    const avatarDefault = User.schema.path("avatarUrl").options.default;
    const themeDefault = User.schema.path("themePreference").options.default;
    const passwordDefault = User.schema.path("passwordHash").options.default;
    const googleIndex = User.schema.path("googleId").options.index;

    assert.equal(avatarDefault, "");
    assert.equal(themeDefault, "system");
    assert.equal(passwordDefault, "");
    assert.equal(googleIndex, true);
    assert.equal(User.schema.path("isGoogleUser").options.default, false);
    assert.equal(User.schema.path("isActive").options.default, true);
    assert.equal(User.schema.path("lastLoginAt").options.default, null);
    assert.equal(User.schema.path("displayName").instance, "String");
  });

  it("defines the required contact profile fields and relationship rules", () => {
    const contactTypePath = Contact.schema.path("contactType") as unknown as {
      enumValues: string[];
    };

    assert.equal(Contact.schema.path("lastName").options.required, true);
    assert.equal(Contact.schema.path("owner").options.ref, "User");
    assert.equal(Contact.schema.path("company").options.ref, "Company");
    assert.equal(Contact.schema.path("jobTitle").instance, "String");
    assert.deepEqual(contactTypePath.enumValues, [
      "lead",
      "client",
      "former_client",
      "partner",
    ]);
    assert.equal(Contact.schema.path("tags").instance, "Array");
  });

  it("defines the required company fields and owner-scoped identity", () => {
    assert.equal(Company.schema.path("name").options.required, true);
    assert.equal(Company.schema.path("owner").options.ref, "User");
    assert.equal(Company.schema.path("website").instance, "String");
    assert.equal(Company.schema.path("industry").instance, "String");
    assert.equal(Company.schema.path("annualRevenue").instance, "Number");
    assert.equal(Company.schema.path("logoUrl").instance, "String");
    assert.equal(Company.schema.path("tags").instance, "Array");
    assert.equal(Company.schema.path("address").instance, "Embedded");
  });

  it("defines ordered default pipeline stages and keeps terminal states on deals", async () => {
    assert.deepEqual(
      DEFAULT_PIPELINE_STAGES.map(({ name, order }) => [name, order]),
      [
        ["New", 0],
        ["Qualified", 1],
        ["Proposal", 2],
        ["Negotiation", 3],
      ],
    );
    assert.ok(DEFAULT_PIPELINE_STAGES.every(({ isDefault }) => isDefault));
    assert.equal(PipelineStage.schema.path("owner").options.ref, "User");
    assert.equal(PipelineStage.schema.path("stageType"), undefined);
    const dealStatusPath = Deal.schema.path("status") as unknown as {
      enumValues: string[];
    };
    assert.deepEqual(dealStatusPath.enumValues, ["open", "won", "lost"]);
    assert.ok(
      PipelineStage.schema
        .indexes()
        .some(
          ([fields, options]) =>
            fields.owner === 1 && fields.order === 1 && options.unique === true,
        ),
    );

    const invalidColor = new PipelineStage({
      owner: new mongoose.Types.ObjectId(),
      name: "New",
      color: "blue",
      order: 0,
    });
    const fractionalOrder = new PipelineStage({
      owner: new mongoose.Types.ObjectId(),
      name: "Qualified",
      color: "#0ea5e9",
      order: 1.5,
    });

    await assert.rejects(invalidColor.validate(), /color/);
    await assert.rejects(fractionalOrder.validate(), /order/);
  });

  it("defines Deal fields and validates PRD business constraints", async () => {
    const dealStatusPath = Deal.schema.path("status") as unknown as {
      enumValues: string[];
    };
    const lostReasonPath = Deal.schema.path("lostReason") as unknown as {
      enumValues: string[];
    };
    const owner = new mongoose.Types.ObjectId();
    const contact = new mongoose.Types.ObjectId();
    const pipelineStage = new mongoose.Types.ObjectId();
    const dealFields = {
      owner,
      name: "Website redesign",
      value: 2500,
      primaryContact: contact,
      pipelineStage,
    };

    assert.equal(Deal.schema.path("owner").options.ref, "User");
    assert.equal(Deal.schema.path("name").options.required, true);
    assert.equal(Deal.schema.path("primaryContact").options.ref, "Contact");
    assert.equal(Deal.schema.path("company").options.ref, "Company");
    assert.equal(Deal.schema.path("pipelineStage").options.ref, "PipelineStage");
    assert.equal(Deal.schema.path("probability").options.min, 0);
    assert.equal(Deal.schema.path("probability").options.max, 100);
    assert.equal(Deal.schema.path("probability").options.default, undefined);
    assert.equal(Deal.schema.path("expectedCloseDate").options.default, null);
    assert.equal(Deal.schema.path("description").options.default, "");
    assert.equal(Deal.schema.path("status").options.default, "open");
    assert.equal(Deal.schema.path("lostReason").options.default, null);
    assert.equal(Deal.schema.path("actualCloseDate").options.default, null);
    assert.equal(Deal.schema.path("finalValue").options.default, null);
    assert.equal(Deal.schema.path("previousStage").options.ref, "PipelineStage");
    assert.deepEqual(dealStatusPath.enumValues, ["open", "won", "lost"]);
    assert.deepEqual(lostReasonPath.enumValues, DEAL_LOST_REASONS);
    assert.equal(Deal.schema.options.timestamps, true);
    assert.ok(
      Deal.schema
        .indexes()
        .some(
          ([fields, options]) =>
            fields.owner === 1 && fields.status === 1 && options.background === true,
        ),
    );

    const validDeal = new Deal(dealFields);
    const zeroValueDeal = new Deal({ ...dealFields, value: 0 });
    const invalidLostReasonDeal = new Deal({
      ...dealFields,
      lostReason: "timing",
    });
    const missingContactDeal = new Deal({ ...dealFields, primaryContact: null });
    const deletedContactDeal = new Deal({ ...dealFields, primaryContact: null });
    deletedContactDeal.isNew = false;

    await assert.doesNotReject(validDeal.validate());
    await assert.rejects(zeroValueDeal.validate(), /value/);
    await assert.rejects(invalidLostReasonDeal.validate(), /lostReason/);
    await assert.rejects(missingContactDeal.validate(), /primaryContact/);
    await assert.doesNotReject(deletedContactDeal.validate());
  });

  it("defines Task fields and validates PRD relationship and reminder rules", async () => {
    const taskTypePath = Task.schema.path("type") as unknown as {
      enumValues: string[];
    };
    const taskStatusPath = Task.schema.path("status") as unknown as {
      enumValues: string[];
    };
    const relatedEntityTypePath = Task.schema.path("relatedEntityType") as unknown as {
      enumValues: string[];
    };
    const owner = new mongoose.Types.ObjectId();
    const taskFields = { owner, title: "Prepare proposal" };
    const dueDate = new Date("2026-11-15T12:00:00.000Z");

    assert.equal(Task.schema.path("owner").options.ref, "User");
    assert.equal(Task.schema.path("title").options.required, true);
    assert.equal(Task.schema.path("description").options.default, "");
    assert.equal(Task.schema.path("type").options.default, "task");
    assert.equal(Task.schema.path("status").options.default, "todo");
    assert.equal(Task.schema.path("priority").options.default, "medium");
    assert.equal(Task.schema.path("dueDate").options.default, null);
    assert.equal(Task.schema.path("dueTime").instance, "String");
    assert.equal(
      Task.schema.path("relatedEntityId").options.refPath,
      "relatedEntityType",
    );
    assert.equal(Task.schema.path("reminderAt").options.default, null);
    assert.equal(Task.schema.path("completedAt").options.default, null);
    assert.deepEqual(taskTypePath.enumValues, ["task", "follow_up"]);
    assert.deepEqual(taskStatusPath.enumValues, [
      "todo",
      "in_progress",
      "completed",
      "cancelled",
    ]);
    assert.deepEqual(relatedEntityTypePath.enumValues, ["Contact", "Company", "Deal"]);
    assert.equal(Task.schema.options.timestamps, true);
    assert.ok(
      Task.schema
        .indexes()
        .some(([fields]) => fields.owner === 1 && fields.dueDate === 1),
    );

    const scheduledTask = new Task({ ...taskFields, dueDate });
    const unscheduledTask = new Task(taskFields);
    const completedTask = new Task({ ...taskFields, status: "completed" });
    const taskWithRelatedEntity = new Task({
      ...taskFields,
      relatedEntityType: "Contact",
      relatedEntityId: new mongoose.Types.ObjectId(),
    });
    const taskWithOnlyType = new Task({
      ...taskFields,
      relatedEntityType: "Contact",
    });
    const taskWithOnlyId = new Task({
      ...taskFields,
      relatedEntityId: new mongoose.Types.ObjectId(),
    });

    await scheduledTask.validate();
    assert.equal(scheduledTask.reminderAt?.toISOString(), "2026-11-14T12:00:00.000Z");
    await unscheduledTask.validate();
    assert.equal(unscheduledTask.reminderAt, null);
    await completedTask.validate();
    assert.ok(completedTask.completedAt instanceof Date);
    await assert.doesNotReject(taskWithRelatedEntity.validate());
    await assert.rejects(taskWithOnlyType.validate(), /relatedEntityId/);
    await assert.rejects(taskWithOnlyId.validate(), /relatedEntityId/);
  });

  it("defines Activity fields and owner-scoped timeline indexes", async () => {
    const activityTypePath = Activity.schema.path("type") as unknown as {
      enumValues: string[];
    };
    const owner = new mongoose.Types.ObjectId();
    const activityFields = { owner, type: "note", title: "Project update" };
    const scheduledAt = new Date("2026-11-15T12:00:00.000Z");
    const hasOwnerEntityTimelineIndex = (entity: "contact" | "company" | "deal") =>
      Activity.schema
        .indexes()
        .some(
          ([fields]) =>
            fields.owner === 1 && fields[entity] === 1 && fields.activityDate === -1,
        );

    assert.deepEqual(activityTypePath.enumValues, ["note", "call", "email", "meeting"]);
    assert.equal(Activity.schema.path("owner").options.ref, "User");
    assert.equal(Activity.schema.path("title").options.required, true);
    assert.equal(Activity.schema.path("content").options.required, undefined);
    assert.equal(Activity.schema.path("content").options.default, "");
    assert.equal(Activity.schema.path("contact").options.ref, "Contact");
    assert.equal(Activity.schema.path("company").options.ref, "Company");
    assert.equal(Activity.schema.path("deal").options.ref, "Deal");
    assert.equal(Activity.schema.path("activityDate").options.required, true);
    assert.equal(Activity.schema.path("scheduledAt").options.default, null);
    assert.equal(Activity.schema.options.timestamps, true);
    assert.ok(hasOwnerEntityTimelineIndex("contact"));
    assert.ok(hasOwnerEntityTimelineIndex("company"));
    assert.ok(hasOwnerEntityTimelineIndex("deal"));
    assert.ok(
      Activity.schema
        .indexes()
        .some(([fields]) => fields.owner === 1 && fields.scheduledAt === 1),
    );

    const note = new Activity(activityFields);
    const scheduledMeeting = new Activity({
      ...activityFields,
      type: "meeting",
      scheduledAt,
    });
    const activityWithoutTitle = new Activity({ owner, type: "note" });
    const invalidActivityType = new Activity({
      ...activityFields,
      type: "task",
    });

    await note.validate();
    assert.equal(note.content, "");
    await assert.doesNotReject(scheduledMeeting.validate());
    await assert.rejects(activityWithoutTitle.validate(), /title/);
    await assert.rejects(invalidActivityType.validate(), /type/);
  });
});

import assert from "node:assert/strict";
import mongoose from "mongoose";
import { describe, it } from "node:test";
import type { ClientSession } from "mongoose";

import {
  Activity,
  Company,
  Contact,
  DEFAULT_PIPELINE_STAGES,
  DEAL_HISTORY_EVENT_TYPES,
  DEAL_LOST_REASONS,
  Deal,
  DealHistory,
  NOTIFICATION_TYPES,
  Notification,
  PipelineStage,
  Task,
  User,
} from "./models/index.js";
import {
  createRelationshipIntegrityService,
  type IntegrityMutation,
  type RelationshipIntegrityStore,
} from "./relationship-integrity.js";
import { assertDevelopmentSeedEnvironment } from "./seed.js";

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

    assert.equal(Contact.schema.path("owner").options.ref, "User");
    assert.equal(Contact.schema.path("owner").options.required, true);
    assert.equal(Company.schema.path("owner").options.ref, "User");
    assert.equal(Company.schema.path("owner").options.required, true);
    assert.equal(PipelineStage.schema.path("owner").options.ref, "User");
    assert.equal(PipelineStage.schema.path("owner").options.required, true);
    assert.equal(Deal.schema.path("owner").options.ref, "User");
    assert.equal(Deal.schema.path("owner").options.required, true);
    assert.equal(Task.schema.path("owner").options.ref, "User");
    assert.equal(Task.schema.path("owner").options.required, true);
    assert.equal(Activity.schema.path("owner").options.ref, "User");
    assert.equal(Activity.schema.path("owner").options.required, true);
    assert.equal(DealHistory.schema.path("owner").options.ref, "User");
    assert.equal(DealHistory.schema.path("owner").options.required, true);
    assert.equal(Notification.schema.path("owner").options.ref, "User");
    assert.equal(Notification.schema.path("owner").options.required, true);
  });

  it("defines the required user profile defaults and authentication fields", () => {
    const avatarDefault = User.schema.path("avatarUrl").options.default;
    const themeDefault = User.schema.path("themePreference").options.default;
    const passwordDefault = User.schema.path("passwordHash").options.default;
    const googleIndex = User.schema
      .indexes()
      .find(([fields, options]) => "googleId" in fields && options.unique === true);

    assert.equal(avatarDefault, "");
    assert.equal(themeDefault, "system");
    assert.equal(passwordDefault, "");
    assert.equal(User.schema.path("defaultCurrency").options.default, "USD");
    assert.equal(
      User.schema.path("notificationPreferences.taskReminders")?.options.default,
      true,
    );
    assert.equal(User.schema.path("passwordResetTokenHash").options.select, false);
    assert.equal(User.schema.path("passwordResetExpiresAt").options.select, false);
    assert.equal(User.schema.path("sessionVersion").options.default, 0);
    assert.ok(googleIndex);
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
      DEFAULT_PIPELINE_STAGES.map(({ name, defaultProbability, order }) => [
        name,
        defaultProbability,
        order,
      ]),
      [
        ["New", 10, 0],
        ["Qualified", 25, 1],
        ["Proposal", 50, 2],
        ["Negotiation", 75, 3],
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
    const invalidProbability = new PipelineStage({
      owner: new mongoose.Types.ObjectId(),
      name: "Custom",
      color: "#0ea5e9",
      defaultProbability: 101,
      order: 2,
    });
    const customStage = new PipelineStage({
      owner: new mongoose.Types.ObjectId(),
      name: "Custom",
      color: "#0ea5e9",
      order: 2,
    });

    await assert.rejects(invalidColor.validate(), /color/);
    await assert.rejects(fractionalOrder.validate(), /order/);
    await assert.rejects(invalidProbability.validate(), /defaultProbability/);
    await customStage.validate();
    assert.equal(customStage.defaultProbability, null);
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
    assert.equal(Deal.schema.path("lostDate").options.default, null);
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

  it("defines DealHistory events and preserves history independently", async () => {
    const eventTypePath = DealHistory.schema.path("eventType") as unknown as {
      enumValues: string[];
    };
    const owner = new mongoose.Types.ObjectId();
    const deal = new mongoose.Types.ObjectId();
    const previousStage = new mongoose.Types.ObjectId();
    const newStage = new mongoose.Types.ObjectId();
    const historyFields = { owner, deal, eventType: "stage_changed" };

    assert.deepEqual(DEAL_HISTORY_EVENT_TYPES, [
      "created",
      "stage_changed",
      "value_changed",
      "won",
      "lost",
      "reopened",
    ]);
    assert.deepEqual(eventTypePath.enumValues, DEAL_HISTORY_EVENT_TYPES);
    assert.equal(DealHistory.schema.path("owner").options.ref, "User");
    assert.equal(DealHistory.schema.path("deal").options.ref, "Deal");
    assert.equal(DealHistory.schema.path("deal").options.required, true);
    assert.equal(DealHistory.schema.path("previousStage").options.ref, "PipelineStage");
    assert.equal(DealHistory.schema.path("newStage").options.ref, "PipelineStage");
    assert.equal(DealHistory.schema.path("previousValue").options.default, null);
    assert.equal(DealHistory.schema.path("newValue").options.default, null);
    assert.equal(DealHistory.schema.path("eventDate").options.required, true);
    assert.equal(
      typeof DealHistory.schema.path("eventDate").options.default,
      "function",
    );
    assert.equal(DealHistory.schema.path("contact"), undefined);
    assert.equal(DealHistory.schema.path("activity"), undefined);
    assert.equal(DealHistory.schema.options.timestamps, true);
    assert.ok(
      DealHistory.schema
        .indexes()
        .some(
          ([fields]) =>
            fields.owner === 1 && fields.deal === 1 && fields.eventDate === -1,
        ),
    );

    const stageHistory = new DealHistory({
      ...historyFields,
      previousStage,
      newStage,
    });
    const valueHistory = new DealHistory({
      ...historyFields,
      eventType: "value_changed",
      previousValue: 1000,
      newValue: 1500,
    });
    const historyWithoutDeal = new DealHistory({ owner, eventType: "created" });
    const invalidEvent = new DealHistory({ ...historyFields, eventType: "closed" });

    await assert.doesNotReject(stageHistory.validate());
    await assert.doesNotReject(valueHistory.validate());
    await assert.rejects(historyWithoutDeal.validate(), /deal/);
    await assert.rejects(invalidEvent.validate(), /eventType/);
  });

  it("defines Notification types and validates ownership, related entities, and read state", async () => {
    const notificationTypePath = Notification.schema.path("type") as unknown as {
      enumValues: string[];
    };
    const relatedEntityTypePath = Notification.schema.path(
      "relatedEntityType",
    ) as unknown as { enumValues: string[] };
    const owner = new mongoose.Types.ObjectId();
    const notificationFields = {
      owner,
      type: "overdue_task",
      title: "Task overdue",
      message: "Prepare proposal",
    };

    assert.deepEqual(NOTIFICATION_TYPES, [
      "upcoming_task_reminder",
      "overdue_task",
      "upcoming_follow_up",
      "deal_won",
      "deal_lost",
      "approaching_deal_closing_date",
    ]);
    assert.deepEqual(notificationTypePath.enumValues, NOTIFICATION_TYPES);
    assert.equal(Notification.schema.path("owner").options.ref, "User");
    assert.equal(Notification.schema.path("title").options.required, true);
    assert.equal(Notification.schema.path("message").options.required, true);
    assert.equal(
      Notification.schema.path("relatedEntityId").options.refPath,
      "relatedEntityType",
    );
    assert.equal(Notification.schema.path("isRead").options.default, false);
    assert.equal(Notification.schema.path("relatedEntityType").options.default, null);
    assert.deepEqual(relatedEntityTypePath.enumValues, [
      "Contact",
      "Company",
      "Deal",
      "Task",
    ]);
    assert.equal(Notification.schema.options.timestamps, true);
    assert.ok(
      Notification.schema
        .indexes()
        .some(
          ([fields]) =>
            fields.owner === 1 && fields.isRead === 1 && fields.createdAt === -1,
        ),
    );
    assert.ok(
      Notification.schema
        .indexes()
        .some(([fields]) => fields.owner === 1 && fields.type === 1),
    );

    const notification = new Notification(notificationFields);
    const taskNotification = new Notification({
      ...notificationFields,
      relatedEntityType: "Task",
      relatedEntityId: new mongoose.Types.ObjectId(),
    });
    const notificationWithoutTitle = new Notification({
      ...notificationFields,
      title: "",
    });
    const notificationWithoutMessage = new Notification({
      ...notificationFields,
      message: "",
    });
    const notificationWithOnlyType = new Notification({
      ...notificationFields,
      relatedEntityType: "Task",
    });
    const notificationWithOnlyId = new Notification({
      ...notificationFields,
      relatedEntityId: new mongoose.Types.ObjectId(),
    });
    const notificationRelatedToUser = new Notification({
      ...notificationFields,
      relatedEntityType: "User",
      relatedEntityId: new mongoose.Types.ObjectId(),
    });

    await notification.validate();
    assert.equal(notification.isRead, false);
    await assert.doesNotReject(taskNotification.validate());
    await assert.rejects(notificationWithoutTitle.validate(), /title/);
    await assert.rejects(notificationWithoutMessage.validate(), /message/);
    await assert.rejects(notificationWithOnlyType.validate(), /relatedEntityId/);
    await assert.rejects(notificationWithOnlyId.validate(), /relatedEntityId/);
    await assert.rejects(notificationRelatedToUser.validate(), /relatedEntityType/);
  });

  it("enforces owner-scoped relationships and transactional deletion policies", async () => {
    const owner = new mongoose.Types.ObjectId();
    const otherOwner = new mongoose.Types.ObjectId();
    const contactId = new mongoose.Types.ObjectId();
    const companyId = new mongoose.Types.ObjectId();
    const dealId = new mongoose.Types.ObjectId();
    const stageId = new mongoose.Types.ObjectId();
    const replacementStageId = new mongoose.Types.ObjectId();
    const taskId = new mongoose.Types.ObjectId();
    const activityId = new mongoose.Types.ObjectId();
    const dealHistoryId = new mongoose.Types.ObjectId();
    const notificationId = new mongoose.Types.ObjectId();
    const ownedReferences = [
      { type: "Contact", id: contactId },
      { type: "Company", id: companyId },
      { type: "Deal", id: dealId },
      { type: "PipelineStage", id: stageId },
      { type: "PipelineStage", id: replacementStageId },
      { type: "Task", id: taskId },
      { type: "Activity", id: activityId },
      { type: "DealHistory", id: dealHistoryId },
      { type: "Notification", id: notificationId },
    ] as const;
    const validIds = new Set([...ownedReferences.map(({ id }) => id.toString())]);
    const mutations: IntegrityMutation[] = [];
    const fakeSession = {} as ClientSession;

    async function runFakeTransaction<T>(
      work: (session: ClientSession) => Promise<T>,
    ): Promise<T> {
      return work(fakeSession);
    }

    const store: RelationshipIntegrityStore = {
      withTransaction: runFakeTransaction,
      isOwnedReference: async (_type, ownerId, recordId) =>
        ownerId.equals(owner) && validIds.has(recordId.toString()),
      countStageReferences: async (ownerId, referencedStageId) =>
        ownerId.equals(owner) && referencedStageId.equals(stageId) ? 1 : 0,
      countPipelineStages: async () => 2,
      apply: async (mutation) => {
        mutations.push(mutation);
      },
    };
    const integrity = createRelationshipIntegrityService(store);

    await integrity.assertOwnedReferences(owner, ownedReferences);
    for (const reference of ownedReferences) {
      await assert.rejects(
        integrity.assertOwnedReferences(otherOwner, [reference]),
        /not found/,
      );
    }
    await assert.rejects(integrity.deleteContact(otherOwner, contactId), /not found/);
    assert.equal(mutations.length, 0);

    await integrity.deleteContact(owner, contactId);
    assert.deepEqual(
      mutations.map(({ type }) => type),
      [
        "delete_contact_tasks",
        "delete_contact_activities",
        "unlink_contact_from_deals",
        "delete_contact",
      ],
    );

    await integrity.deleteCompany(owner, companyId);
    assert.deepEqual(
      mutations.slice(4).map(({ type }) => type),
      ["unlink_company_from_contacts", "unlink_company_from_deals", "delete_company"],
    );

    await assert.rejects(
      integrity.deletePipelineStage(owner, stageId),
      /replacement stage/,
    );
    assert.equal(mutations.length, 7);

    await integrity.deletePipelineStage(owner, stageId, replacementStageId);
    assert.deepEqual(
      mutations.slice(7).map(({ type }) => type),
      ["reassign_stage_deals", "reassign_previous_stage", "delete_pipeline_stage"],
    );

    await assert.rejects(integrity.deleteDeals(otherOwner, [dealId]), /not found/);
    assert.equal(mutations.length, 10);
    await integrity.deleteDeals(owner, [dealId]);
    assert.deepEqual(
      mutations.slice(10).map(({ type }) => type),
      [
        "unlink_deal_tasks",
        "unlink_deal_activities",
        "delete_deal_history",
        "delete_deal",
      ],
    );
    assert.ok(mutations.every((mutation) => mutation.ownerId.equals(owner)));
  });

  it("only allows database seeding in development", () => {
    assert.doesNotThrow(() => assertDevelopmentSeedEnvironment("development"));
    assert.throws(() => assertDevelopmentSeedEnvironment("test"), /development/);
    assert.throws(() => assertDevelopmentSeedEnvironment("production"), /development/);
    assert.throws(() => assertDevelopmentSeedEnvironment(undefined), /development/);
  });
});

import mongoose, { type Model } from "mongoose";

import {
  Activity,
  Company,
  Contact,
  DEFAULT_PIPELINE_STAGES,
  Deal,
  DealHistory,
  Notification,
  PipelineStage,
  Task,
  User,
} from "./models/index.js";
import {
  relationshipIntegrity,
  type OwnedRecordType,
  type OwnedReference,
} from "./relationship-integrity.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEVELOPMENT_OWNER_EMAIL = "relio-seed@example.test";
const UPSERT_OPTIONS = {
  upsert: true,
  new: true,
  setDefaultsOnInsert: true,
  runValidators: true,
} as const;

export function assertDevelopmentSeedEnvironment(nodeEnv: string | undefined): void {
  if (nodeEnv !== "development") {
    throw new Error("Database seeding is only allowed when NODE_ENV=development");
  }
}

function indexKeySignature(key: object): string {
  return Object.entries(key)
    .map(([field, direction]) => `${field}:${String(direction)}`)
    .join("|");
}

async function validateModelIndexes<T>(model: Model<T>): Promise<void> {
  await model.createIndexes();
  const actualIndexes = await model.collection.indexes();

  for (const [keys, options] of model.schema.indexes()) {
    const signature = indexKeySignature(keys);
    const actualIndex = actualIndexes.find(
      ({ key }) => indexKeySignature(key) === signature,
    );

    if (!actualIndex) {
      throw new Error(`Missing declared index on ${model.modelName}: ${signature}`);
    }
    if (options.unique === true && actualIndex.unique !== true) {
      throw new Error(`Expected unique index on ${model.modelName}: ${signature}`);
    }
    if (options.sparse === true && actualIndex.sparse !== true) {
      throw new Error(`Expected sparse index on ${model.modelName}: ${signature}`);
    }
  }
}

async function validateDatabaseIndexes(): Promise<void> {
  await validateModelIndexes(User);
  await validateModelIndexes(Contact);
  await validateModelIndexes(Company);
  await validateModelIndexes(PipelineStage);
  await validateModelIndexes(Deal);
  await validateModelIndexes(Task);
  await validateModelIndexes(Activity);
  await validateModelIndexes(DealHistory);
  await validateModelIndexes(Notification);
}

function addReference(
  references: OwnedReference[],
  type: OwnedRecordType,
  id: mongoose.Types.ObjectId | null | undefined,
): void {
  if (id) {
    references.push({ type, id });
  }
}

export async function seedDevelopmentData(nodeEnv: string | undefined): Promise<void> {
  assertDevelopmentSeedEnvironment(nodeEnv);

  if (mongoose.connection.readyState !== 1) {
    throw new Error("Connect to MongoDB before seeding development data");
  }

  await validateDatabaseIndexes();

  const owner = await User.findOneAndUpdate(
    { email: DEVELOPMENT_OWNER_EMAIL },
    {
      $setOnInsert: {
        username: "relio-seed",
        email: DEVELOPMENT_OWNER_EMAIL,
        displayName: "Sample Freelancer",
        firstName: "Jordan",
        lastName: "Taylor",
      },
    },
    UPSERT_OPTIONS,
  );
  if (!owner) throw new Error("Could not seed development owner");
  const ownerId = owner._id;

  const stageIds = new Map<string, mongoose.Types.ObjectId>();
  for (const stageDefinition of DEFAULT_PIPELINE_STAGES) {
    const stage = await PipelineStage.findOneAndUpdate(
      { owner: ownerId, order: stageDefinition.order },
      { $setOnInsert: { owner: ownerId, ...stageDefinition } },
      UPSERT_OPTIONS,
    );
    if (!stage)
      throw new Error(`Could not seed pipeline stage ${stageDefinition.name}`);
    stageIds.set(stageDefinition.name, stage._id);
  }

  const proposalStageId = stageIds.get("Proposal");
  if (!proposalStageId) {
    throw new Error("The Proposal pipeline stage was not seeded");
  }

  const company = await Company.findOneAndUpdate(
    { owner: ownerId, name: "Juniper Field Studio" },
    {
      $setOnInsert: {
        owner: ownerId,
        name: "Juniper Field Studio",
        website: "https://juniper-field.example",
        industry: "consulting",
        companySize: "1_10",
        description: "Development-only sample company.",
      },
    },
    UPSERT_OPTIONS,
  );
  if (!company) throw new Error("Could not seed sample company");

  const contact = await Contact.findOneAndUpdate(
    { owner: ownerId, email: "maya.chen@example.test" },
    {
      $setOnInsert: {
        owner: ownerId,
        firstName: "Maya",
        lastName: "Chen",
        email: "maya.chen@example.test",
        contactType: "client",
        jobTitle: "Operations Director",
        company: company._id,
        source: "Referral",
      },
    },
    UPSERT_OPTIONS,
  );
  if (!contact) throw new Error("Could not seed sample contact");

  const now = new Date();
  const dueDate = new Date(now.getTime() + 4 * DAY_MS);
  const expectedCloseDate = new Date(now.getTime() + 30 * DAY_MS);
  const deal = await Deal.findOneAndUpdate(
    { owner: ownerId, name: "Website refresh" },
    {
      $setOnInsert: {
        owner: ownerId,
        name: "Website refresh",
        value: 6800,
        primaryContact: contact._id,
        company: company._id,
        pipelineStage: proposalStageId,
        probability: 60,
        expectedCloseDate,
        description: "Development-only sample deal.",
      },
    },
    UPSERT_OPTIONS,
  );
  if (!deal) throw new Error("Could not seed sample deal");

  const task = await Task.findOneAndUpdate(
    { owner: ownerId, title: "Send website refresh proposal" },
    {
      $setOnInsert: {
        owner: ownerId,
        title: "Send website refresh proposal",
        type: "follow_up",
        status: "todo",
        priority: "high",
        dueDate,
        dueTime: "10:00",
        reminderAt: new Date(dueDate.getTime() - DAY_MS),
        relatedEntityType: "Deal",
        relatedEntityId: deal._id,
      },
    },
    UPSERT_OPTIONS,
  );
  if (!task) throw new Error("Could not seed sample follow-up");

  const activityDate = new Date(now.getTime() - DAY_MS);
  const activity = await Activity.findOneAndUpdate(
    { owner: ownerId, type: "note", title: "Discovery call notes" },
    {
      $setOnInsert: {
        owner: ownerId,
        type: "note",
        title: "Discovery call notes",
        content: "The client wants a clearer services overview and simpler navigation.",
        contact: contact._id,
        company: company._id,
        deal: deal._id,
        activityDate,
      },
    },
    UPSERT_OPTIONS,
  );
  if (!activity) throw new Error("Could not seed sample activity");

  const dealHistory = await DealHistory.findOneAndUpdate(
    { owner: ownerId, deal: deal._id, eventType: "created" },
    {
      $setOnInsert: {
        owner: ownerId,
        deal: deal._id,
        eventType: "created",
        newValue: deal.value,
        newStage: deal.pipelineStage,
        eventDate: deal.createdAt,
      },
    },
    UPSERT_OPTIONS,
  );
  if (!dealHistory) throw new Error("Could not seed sample deal history");

  const notification = await Notification.findOneAndUpdate(
    { owner: ownerId, type: "upcoming_task_reminder", title: task.title },
    {
      $setOnInsert: {
        owner: ownerId,
        type: "upcoming_task_reminder",
        title: task.title,
        message: "A follow-up is due soon.",
        relatedEntityType: "Task",
        relatedEntityId: task._id,
      },
    },
    UPSERT_OPTIONS,
  );
  if (!notification) throw new Error("Could not seed sample notification");

  await owner.validate();
  await company.validate();
  await contact.validate();
  await deal.validate();
  await task.validate();
  await activity.validate();
  await dealHistory.validate();
  await notification.validate();

  const references: OwnedReference[] = [
    { type: "Company", id: company._id },
    { type: "Contact", id: contact._id },
    { type: "Deal", id: deal._id },
    { type: "Task", id: task._id },
    { type: "Activity", id: activity._id },
    { type: "DealHistory", id: dealHistory._id },
    { type: "Notification", id: notification._id },
  ];

  for (const stageId of stageIds.values()) {
    references.push({ type: "PipelineStage", id: stageId });
  }

  addReference(references, "Company", contact.company);
  addReference(references, "Contact", deal.primaryContact);
  addReference(references, "Company", deal.company);
  addReference(references, "PipelineStage", deal.pipelineStage);
  addReference(references, "Deal", task.relatedEntityId);
  addReference(references, "Contact", activity.contact);
  addReference(references, "Company", activity.company);
  addReference(references, "Deal", activity.deal);
  addReference(references, "Deal", dealHistory.deal);
  addReference(references, "Task", notification.relatedEntityId);

  await relationshipIntegrity.assertOwnedReferences(ownerId, references);

  console.info(
    "Development database indexes, sample records, and owner references validated.",
  );
}

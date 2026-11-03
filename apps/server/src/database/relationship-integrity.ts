import mongoose, { type ClientSession } from "mongoose";

import { NotFoundError, ValidationError } from "../errors/AppError.js";
import { Activity } from "./models/activity.js";
import { Company } from "./models/company.js";
import { Contact } from "./models/contact.js";
import { Deal } from "./models/deal.js";
import { DealHistory } from "./models/deal-history.js";
import { Notification } from "./models/notification.js";
import { PipelineStage } from "./models/pipeline-stage.js";
import { Task } from "./models/task.js";

export type OwnedRecordType =
  | "Contact"
  | "Company"
  | "Deal"
  | "PipelineStage"
  | "Task"
  | "Activity"
  | "DealHistory"
  | "Notification";

export interface OwnedReference {
  type: OwnedRecordType;
  id: mongoose.Types.ObjectId;
}

export type IntegrityMutation =
  | {
      type: "delete_contact_tasks";
      ownerId: mongoose.Types.ObjectId;
      contactId: mongoose.Types.ObjectId;
    }
  | {
      type: "delete_contact_activities";
      ownerId: mongoose.Types.ObjectId;
      contactId: mongoose.Types.ObjectId;
    }
  | {
      type: "unlink_contact_from_deals";
      ownerId: mongoose.Types.ObjectId;
      contactId: mongoose.Types.ObjectId;
    }
  | {
      type: "delete_contact";
      ownerId: mongoose.Types.ObjectId;
      contactId: mongoose.Types.ObjectId;
    }
  | {
      type: "unlink_company_from_contacts";
      ownerId: mongoose.Types.ObjectId;
      companyId: mongoose.Types.ObjectId;
    }
  | {
      type: "unlink_company_from_deals";
      ownerId: mongoose.Types.ObjectId;
      companyId: mongoose.Types.ObjectId;
    }
  | {
      type: "delete_company";
      ownerId: mongoose.Types.ObjectId;
      companyId: mongoose.Types.ObjectId;
    }
  | {
      type: "reassign_stage_deals";
      ownerId: mongoose.Types.ObjectId;
      stageId: mongoose.Types.ObjectId;
      replacementStageId: mongoose.Types.ObjectId;
    }
  | {
      type: "reassign_previous_stage";
      ownerId: mongoose.Types.ObjectId;
      stageId: mongoose.Types.ObjectId;
      replacementStageId: mongoose.Types.ObjectId;
    }
  | {
      type: "delete_pipeline_stage";
      ownerId: mongoose.Types.ObjectId;
      stageId: mongoose.Types.ObjectId;
    };

export interface RelationshipIntegrityStore {
  withTransaction<T>(work: (session: ClientSession) => Promise<T>): Promise<T>;
  isOwnedReference(
    type: OwnedRecordType,
    ownerId: mongoose.Types.ObjectId,
    recordId: mongoose.Types.ObjectId,
    session?: ClientSession,
  ): Promise<boolean>;
  countStageReferences(
    ownerId: mongoose.Types.ObjectId,
    stageId: mongoose.Types.ObjectId,
    session: ClientSession,
  ): Promise<number>;
  apply(mutation: IntegrityMutation, session: ClientSession): Promise<void>;
}

async function withMongooseTransaction<T>(
  work: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();
  let result!: T;

  try {
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

async function existsForOwner(
  type: OwnedRecordType,
  ownerId: mongoose.Types.ObjectId,
  recordId: mongoose.Types.ObjectId,
  session?: ClientSession,
): Promise<boolean> {
  switch (type) {
    case "Contact": {
      const query = Contact.exists({ _id: recordId, owner: ownerId });
      if (session) query.session(session);
      return (await query) !== null;
    }
    case "Company": {
      const query = Company.exists({ _id: recordId, owner: ownerId });
      if (session) query.session(session);
      return (await query) !== null;
    }
    case "Deal": {
      const query = Deal.exists({ _id: recordId, owner: ownerId });
      if (session) query.session(session);
      return (await query) !== null;
    }
    case "PipelineStage": {
      const query = PipelineStage.exists({ _id: recordId, owner: ownerId });
      if (session) query.session(session);
      return (await query) !== null;
    }
    case "Task": {
      const query = Task.exists({ _id: recordId, owner: ownerId });
      if (session) query.session(session);
      return (await query) !== null;
    }
    case "Activity": {
      const query = Activity.exists({ _id: recordId, owner: ownerId });
      if (session) query.session(session);
      return (await query) !== null;
    }
    case "DealHistory": {
      const query = DealHistory.exists({ _id: recordId, owner: ownerId });
      if (session) query.session(session);
      return (await query) !== null;
    }
    case "Notification": {
      const query = Notification.exists({ _id: recordId, owner: ownerId });
      if (session) query.session(session);
      return (await query) !== null;
    }
  }
}

async function applyMongooseMutation(
  mutation: IntegrityMutation,
  session: ClientSession,
): Promise<void> {
  const { ownerId } = mutation;

  switch (mutation.type) {
    case "delete_contact_tasks":
      await Task.deleteMany(
        {
          owner: ownerId,
          relatedEntityType: "Contact",
          relatedEntityId: mutation.contactId,
        },
        { session },
      );
      return;
    case "delete_contact_activities":
      await Activity.deleteMany(
        { owner: ownerId, contact: mutation.contactId },
        { session },
      );
      return;
    case "unlink_contact_from_deals":
      await Deal.updateMany(
        { owner: ownerId, primaryContact: mutation.contactId },
        { $set: { primaryContact: null } },
        { session },
      );
      return;
    case "delete_contact":
      await Contact.deleteOne({ _id: mutation.contactId, owner: ownerId }, { session });
      return;
    case "unlink_company_from_contacts":
      await Contact.updateMany(
        { owner: ownerId, company: mutation.companyId },
        { $set: { company: null } },
        { session },
      );
      return;
    case "unlink_company_from_deals":
      await Deal.updateMany(
        { owner: ownerId, company: mutation.companyId },
        { $set: { company: null } },
        { session },
      );
      return;
    case "delete_company":
      await Company.deleteOne({ _id: mutation.companyId, owner: ownerId }, { session });
      return;
    case "reassign_stage_deals":
      await Deal.updateMany(
        { owner: ownerId, pipelineStage: mutation.stageId },
        { $set: { pipelineStage: mutation.replacementStageId } },
        { session },
      );
      return;
    case "reassign_previous_stage":
      await Deal.updateMany(
        { owner: ownerId, previousStage: mutation.stageId },
        { $set: { previousStage: mutation.replacementStageId } },
        { session },
      );
      return;
    case "delete_pipeline_stage":
      await PipelineStage.deleteOne(
        { _id: mutation.stageId, owner: ownerId },
        { session },
      );
  }
}

const mongooseStore: RelationshipIntegrityStore = {
  withTransaction: withMongooseTransaction,
  isOwnedReference: existsForOwner,
  async countStageReferences(ownerId, stageId, session) {
    return Deal.countDocuments({
      owner: ownerId,
      $or: [{ pipelineStage: stageId }, { previousStage: stageId }],
    }).session(session);
  },
  apply: applyMongooseMutation,
};

export function createRelationshipIntegrityService(
  store: RelationshipIntegrityStore = mongooseStore,
) {
  async function assertOwnedReferences(
    ownerId: mongoose.Types.ObjectId,
    references: readonly OwnedReference[],
    session?: ClientSession,
  ): Promise<void> {
    for (const reference of references) {
      if (
        !(await store.isOwnedReference(reference.type, ownerId, reference.id, session))
      ) {
        throw new NotFoundError("Referenced record not found");
      }
    }
  }

  return {
    assertOwnedReferences,

    async deleteContact(
      ownerId: mongoose.Types.ObjectId,
      contactId: mongoose.Types.ObjectId,
    ) {
      await this.deleteContacts(ownerId, [contactId]);
    },

    async deleteContacts(
      ownerId: mongoose.Types.ObjectId,
      contactIds: readonly mongoose.Types.ObjectId[],
    ) {
      await store.withTransaction(async (session) => {
        await assertOwnedReferences(
          ownerId,
          contactIds.map((id) => ({ type: "Contact" as const, id })),
          session,
        );
        for (const contactId of contactIds) {
          await store.apply(
            { type: "delete_contact_tasks", ownerId, contactId },
            session,
          );
          await store.apply(
            { type: "delete_contact_activities", ownerId, contactId },
            session,
          );
          await store.apply(
            { type: "unlink_contact_from_deals", ownerId, contactId },
            session,
          );
          await store.apply({ type: "delete_contact", ownerId, contactId }, session);
        }
      });
    },

    async deleteCompany(
      ownerId: mongoose.Types.ObjectId,
      companyId: mongoose.Types.ObjectId,
    ) {
      await this.deleteCompanies(ownerId, [companyId]);
    },

    async deleteCompanies(
      ownerId: mongoose.Types.ObjectId,
      companyIds: readonly mongoose.Types.ObjectId[],
    ) {
      await store.withTransaction(async (session) => {
        await assertOwnedReferences(
          ownerId,
          companyIds.map((id) => ({ type: "Company" as const, id })),
          session,
        );
        for (const companyId of companyIds) {
          await store.apply(
            { type: "unlink_company_from_contacts", ownerId, companyId },
            session,
          );
          await store.apply(
            { type: "unlink_company_from_deals", ownerId, companyId },
            session,
          );
          await store.apply({ type: "delete_company", ownerId, companyId }, session);
        }
      });
    },

    async deletePipelineStage(
      ownerId: mongoose.Types.ObjectId,
      stageId: mongoose.Types.ObjectId,
      replacementStageId?: mongoose.Types.ObjectId,
    ) {
      await store.withTransaction(async (session) => {
        await assertOwnedReferences(
          ownerId,
          [{ type: "PipelineStage", id: stageId }],
          session,
        );

        if (replacementStageId?.equals(stageId)) {
          throw new ValidationError(
            "Replacement stage must be different from the deleted stage",
          );
        }

        if (replacementStageId) {
          await assertOwnedReferences(
            ownerId,
            [{ type: "PipelineStage", id: replacementStageId }],
            session,
          );
        }

        const referenceCount = await store.countStageReferences(
          ownerId,
          stageId,
          session,
        );
        if (referenceCount > 0 && !replacementStageId) {
          throw new ValidationError(
            "A replacement stage is required while deals reference this stage",
          );
        }

        if (replacementStageId) {
          await store.apply(
            { type: "reassign_stage_deals", ownerId, stageId, replacementStageId },
            session,
          );
          await store.apply(
            { type: "reassign_previous_stage", ownerId, stageId, replacementStageId },
            session,
          );
        }

        await store.apply({ type: "delete_pipeline_stage", ownerId, stageId }, session);
      });
    },
  };
}

export const relationshipIntegrity = createRelationshipIntegrityService();

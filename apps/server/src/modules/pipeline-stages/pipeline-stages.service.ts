import mongoose from "mongoose";
import {
  DEFAULT_PIPELINE_STAGES,
  PipelineStage,
  type IPipelineStage,
} from "../../database/models/pipeline-stage.js";
import { relationshipIntegrity } from "../../database/relationship-integrity.js";
import { NotFoundError, ValidationError } from "../../errors/AppError.js";
import type {
  CreatePipelineStageInput,
  ReorderPipelineStagesInput,
  UpdatePipelineStageInput,
} from "./pipeline-stages.schemas.js";

const legacyDefaultProbability = Object.fromEntries(
  DEFAULT_PIPELINE_STAGES.map(({ name, defaultProbability }) => [
    name,
    defaultProbability,
  ]),
);

export interface PipelineStageView {
  id: string;
  name: string;
  color: string;
  defaultProbability: number | null;
  order: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toPipelineStageView(
  stage: IPipelineStage & { _id: mongoose.Types.ObjectId },
): PipelineStageView {
  const legacyDefaultProbability: Record<string, number> = {
    New: 10,
    Qualified: 25,
    Proposal: 50,
    Negotiation: 75,
  };
  return {
    id: String(stage._id),
    name: stage.name,
    color: stage.color,
    defaultProbability:
      stage.defaultProbability ??
      (stage.isDefault ? (legacyDefaultProbability[stage.name] ?? null) : null),
    order: stage.order,
    isDefault: stage.isDefault,
    createdAt: stage.createdAt,
    updatedAt: stage.updatedAt,
  };
}

function objectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

async function ensureDefaultPipelineStages(ownerId: mongoose.Types.ObjectId) {
  const stages = await PipelineStage.find({ owner: ownerId }).sort({ order: 1 });
  if (stages.length) return stages;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const currentStages = await PipelineStage.find({ owner: ownerId }).session(
        session,
      );
      if (currentStages.length) return;
      await PipelineStage.insertMany(
        DEFAULT_PIPELINE_STAGES.map((stage) => ({ ...stage, owner: ownerId })),
        { session },
      );
    });
  } catch (error) {
    const initialized = await PipelineStage.exists({ owner: ownerId });
    if (!initialized) throw error;
  } finally {
    await session.endSession();
  }

  return PipelineStage.find({ owner: ownerId }).sort({ order: 1 });
}

export async function listPipelineStages(owner: string): Promise<PipelineStageView[]> {
  const stages = await ensureDefaultPipelineStages(objectId(owner));
  return stages.map(toPipelineStageView);
}

export async function createPipelineStage(
  owner: string,
  input: CreatePipelineStageInput,
): Promise<PipelineStageView> {
  const ownerId = objectId(owner);
  const stages = await ensureDefaultPipelineStages(ownerId);
  const stage = await PipelineStage.create({
    ...input,
    owner: ownerId,
    order:
      stages.reduce((maxOrder, current) => Math.max(maxOrder, current.order), -1) + 1,
    isDefault: false,
  });
  return toPipelineStageView(stage);
}

export async function updatePipelineStage(
  owner: string,
  id: string,
  input: UpdatePipelineStageInput,
): Promise<PipelineStageView> {
  const ownerId = objectId(owner);
  const current = await PipelineStage.findOne({ _id: objectId(id), owner: ownerId });
  if (!current) throw new NotFoundError("Pipeline stage not found");
  const probability =
    current.defaultProbability ??
    (current.isDefault ? (legacyDefaultProbability[current.name] ?? null) : null);
  const stage = await PipelineStage.findOneAndUpdate(
    { _id: objectId(id), owner: ownerId },
    {
      $set: {
        ...input,
        ...(probability !== null ? { defaultProbability: probability } : {}),
      },
    },
    { new: true, runValidators: true },
  );
  if (!stage) throw new NotFoundError("Pipeline stage not found");
  return toPipelineStageView(stage);
}

export async function reorderPipelineStages(
  owner: string,
  input: ReorderPipelineStagesInput,
): Promise<PipelineStageView[]> {
  const ownerId = objectId(owner);
  const stageIds = input.stageIds.map(objectId);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const stages = await PipelineStage.find({ owner: ownerId }).session(session);
      if (
        stages.length !== stageIds.length ||
        !stageIds.every((id) => stages.some((stage) => stage._id.equals(id)))
      ) {
        throw new ValidationError(
          "Reorder must include every owned pipeline stage once",
        );
      }

      const offset =
        stages.reduce((maxOrder, stage) => Math.max(maxOrder, stage.order), 0) +
        stages.length +
        1;
      for (const [index, stageId] of stageIds.entries()) {
        await PipelineStage.updateOne(
          { _id: stageId, owner: ownerId },
          { $set: { order: offset + index } },
          { session },
        );
      }
      for (const [order, stageId] of stageIds.entries()) {
        await PipelineStage.updateOne(
          { _id: stageId, owner: ownerId },
          { $set: { order } },
          { session },
        );
      }
    });
  } finally {
    await session.endSession();
  }

  const stages = await PipelineStage.find({ owner: ownerId }).sort({ order: 1 });
  return stages.map(toPipelineStageView);
}

export async function deletePipelineStage(
  owner: string,
  id: string,
  replacementStageId?: string,
): Promise<{ id: string }> {
  await relationshipIntegrity.deletePipelineStage(
    objectId(owner),
    objectId(id),
    replacementStageId ? objectId(replacementStageId) : undefined,
  );
  return { id };
}

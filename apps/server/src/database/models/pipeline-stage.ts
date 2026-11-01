import mongoose, { Schema, type Model } from "mongoose";

export interface IPipelineStage {
  owner: mongoose.Types.ObjectId;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_PIPELINE_STAGES = [
  { name: "New", color: "#64748b", order: 0, isDefault: true },
  { name: "Qualified", color: "#0ea5e9", order: 1, isDefault: true },
  { name: "Proposal", color: "#2563eb", order: 2, isDefault: true },
  { name: "Negotiation", color: "#f59e0b", order: 3, isDefault: true },
] as const satisfies readonly Pick<
  IPipelineStage,
  "name" | "color" | "order" | "isDefault"
>[];

const pipelineStageSchema = new Schema<IPipelineStage>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      required: true,
      default: "#3b82f6",
      match: /^#[0-9a-fA-F]{6}$/,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isInteger,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

pipelineStageSchema.index({ owner: 1, order: 1 }, { unique: true });

export const PipelineStage: Model<IPipelineStage> = mongoose.model<IPipelineStage>(
  "PipelineStage",
  pipelineStageSchema,
);

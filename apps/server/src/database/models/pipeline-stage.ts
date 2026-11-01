import mongoose, { Schema, type Model } from "mongoose";

export interface IPipelineStage {
  owner: mongoose.Types.ObjectId;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  stageType: "standard" | "won" | "lost";
  createdAt: Date;
  updatedAt: Date;
}

const pipelineStageSchema = new Schema<IPipelineStage>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    stageType: {
      type: String,
      enum: ["standard", "won", "lost"],
      default: "standard",
    },
  },
  { timestamps: true },
);

pipelineStageSchema.index({ owner: 1, order: 1 }, { unique: true });

export const PipelineStage: Model<IPipelineStage> = mongoose.model<IPipelineStage>(
  "PipelineStage",
  pipelineStageSchema,
);

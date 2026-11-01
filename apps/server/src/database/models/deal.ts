import mongoose, { Schema, type Model } from "mongoose";

export interface IDeal {
  owner: mongoose.Types.ObjectId;
  name: string;
  value: number;
  currency: string;
  primaryContact: mongoose.Types.ObjectId;
  company?: mongoose.Types.ObjectId | null;
  pipelineStage: mongoose.Types.ObjectId;
  probability: number;
  expectedCloseDate?: Date | null;
  description?: string;
  status: "open" | "won" | "lost";
  lostReason?: string;
  actualCloseDate?: Date | null;
  finalValue?: number | null;
  previousStage?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const dealSchema = new Schema<IDeal>(
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
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    primaryContact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    pipelineStage: {
      type: Schema.Types.ObjectId,
      ref: "PipelineStage",
      required: true,
      index: true,
    },
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    expectedCloseDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "won", "lost"],
      default: "open",
    },
    lostReason: {
      type: String,
      default: "",
    },
    actualCloseDate: {
      type: Date,
      default: null,
    },
    finalValue: {
      type: Number,
      min: 0,
      default: null,
    },
    previousStage: {
      type: Schema.Types.ObjectId,
      ref: "PipelineStage",
      default: null,
    },
  },
  { timestamps: true },
);

dealSchema.index({ owner: 1, status: 1 });
dealSchema.index({ owner: 1, expectedCloseDate: 1 });

export const Deal: Model<IDeal> = mongoose.model<IDeal>("Deal", dealSchema);

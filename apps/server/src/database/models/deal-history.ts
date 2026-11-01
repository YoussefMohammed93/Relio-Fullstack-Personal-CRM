import mongoose, { Schema, type Model } from "mongoose";

export interface IDealHistory {
  owner: mongoose.Types.ObjectId;
  deal: mongoose.Types.ObjectId;
  eventType:
    | "created"
    | "stage_changed"
    | "value_changed"
    | "status_changed"
    | "reopened"
    | "closed";
  previousValue?: number | null;
  newValue?: number | null;
  previousStage?: mongoose.Types.ObjectId | null;
  newStage?: mongoose.Types.ObjectId | null;
  eventDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dealHistorySchema = new Schema<IDealHistory>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    deal: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        "created",
        "stage_changed",
        "value_changed",
        "status_changed",
        "reopened",
        "closed",
      ],
      required: true,
    },
    previousValue: {
      type: Number,
      min: 0,
      default: null,
    },
    newValue: {
      type: Number,
      min: 0,
      default: null,
    },
    previousStage: {
      type: Schema.Types.ObjectId,
      ref: "PipelineStage",
      default: null,
    },
    newStage: {
      type: Schema.Types.ObjectId,
      ref: "PipelineStage",
      default: null,
    },
    eventDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true },
);

dealHistorySchema.index({ deal: 1, eventDate: -1 });

export const DealHistory: Model<IDealHistory> = mongoose.model<IDealHistory>(
  "DealHistory",
  dealHistorySchema,
);

import mongoose, { Schema, type Model } from "mongoose";

export const DEAL_HISTORY_EVENT_TYPES = [
  "created",
  "stage_changed",
  "value_changed",
  "won",
  "lost",
  "reopened",
] as const;

export type DealHistoryEventType = (typeof DEAL_HISTORY_EVENT_TYPES)[number];

export interface IDealHistory {
  owner: mongoose.Types.ObjectId;
  deal: mongoose.Types.ObjectId;
  eventType: DealHistoryEventType;
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
    },
    deal: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
    },
    eventType: {
      type: String,
      enum: DEAL_HISTORY_EVENT_TYPES,
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

dealHistorySchema.index({ owner: 1, deal: 1, eventDate: -1 });

export const DealHistory: Model<IDealHistory> = mongoose.model<IDealHistory>(
  "DealHistory",
  dealHistorySchema,
);

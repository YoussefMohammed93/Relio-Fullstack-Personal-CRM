import mongoose, { Schema, type Model } from "mongoose";

export interface IActivity {
  owner: mongoose.Types.ObjectId;
  type: "note" | "call" | "email" | "meeting";
  title: string;
  content: string;
  contact?: mongoose.Types.ObjectId | null;
  company?: mongoose.Types.ObjectId | null;
  deal?: mongoose.Types.ObjectId | null;
  activityDate: Date;
  scheduledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["note", "call", "email", "meeting"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      default: "",
    },
    contact: {
      type: Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    deal: {
      type: Schema.Types.ObjectId,
      ref: "Deal",
      default: null,
    },
    activityDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

activitySchema.index({ owner: 1, activityDate: -1 });
activitySchema.index({ owner: 1, contact: 1 });

export const Activity: Model<IActivity> = mongoose.model<IActivity>(
  "Activity",
  activitySchema,
);

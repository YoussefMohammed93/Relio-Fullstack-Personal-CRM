import mongoose, { Schema, type Model } from "mongoose";

export interface ITask {
  owner: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: "follow_up" | "call" | "email" | "meeting" | "admin";
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  dueDate?: Date | null;
  dueTime?: string;
  relatedEntityType?: "Contact" | "Company" | "Deal" | "User" | null;
  relatedEntityId?: mongoose.Types.ObjectId | null;
  reminderAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["follow_up", "call", "email", "meeting", "admin"],
      default: "follow_up",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "done", "cancelled"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    dueTime: {
      type: String,
      trim: true,
      default: "",
    },
    relatedEntityType: {
      type: String,
      enum: ["Contact", "Company", "Deal", "User"],
      default: null,
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
      refPath: "relatedEntityType",
      default: null,
    },
    reminderAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

taskSchema.index({ owner: 1, dueDate: 1 });
taskSchema.index({ owner: 1, status: 1 });

export const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);

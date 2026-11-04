import mongoose, { Schema, type Model } from "mongoose";

export interface ITask {
  owner: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: "task" | "follow_up";
  status: "todo" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  dueDate?: Date | null;
  dueTime?: string;
  relatedEntityType?: "Contact" | "Company" | "Deal" | null;
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
      enum: ["task", "follow_up"],
      default: "task",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed", "cancelled"],
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
      enum: ["Contact", "Company", "Deal"],
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

taskSchema.pre("validate", function () {
  const hasRelatedEntityType = this.relatedEntityType != null;
  const hasRelatedEntityId = this.relatedEntityId != null;

  if (hasRelatedEntityType !== hasRelatedEntityId) {
    this.invalidate(
      "relatedEntityId",
      "Related entity type and ID must be set together",
    );
  }

  this.reminderAt = this.dueDate
    ? new Date(this.dueDate.getTime() - 24 * 60 * 60 * 1000)
    : null;
  this.completedAt =
    this.status === "completed" ? (this.completedAt ?? new Date()) : null;
});

taskSchema.index({ owner: 1, dueDate: 1 });
taskSchema.index({ owner: 1, status: 1 });
taskSchema.index({ owner: 1, priority: 1 });
taskSchema.index({ owner: 1, type: 1 });
taskSchema.index({ owner: 1, relatedEntityType: 1, relatedEntityId: 1 });

export const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);

import mongoose, { Schema, type Model } from "mongoose";

export interface INotification {
  owner: mongoose.Types.ObjectId;
  type: "follow_up" | "deal" | "task" | "system";
  title: string;
  message: string;
  relatedEntityType?: "Contact" | "Company" | "Deal" | "Task" | "User" | null;
  relatedEntityId?: mongoose.Types.ObjectId | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["follow_up", "deal", "task", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      default: "",
    },
    relatedEntityType: {
      type: String,
      enum: ["Contact", "Company", "Deal", "Task", "User"],
      default: null,
    },
    relatedEntityId: {
      type: Schema.Types.ObjectId,
      refPath: "relatedEntityType",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ owner: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ owner: 1, type: 1 });

export const Notification: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);

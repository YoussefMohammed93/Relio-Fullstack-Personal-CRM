import mongoose, { Schema, type Model } from "mongoose";

export const NOTIFICATION_TYPES = [
  "upcoming_task_reminder",
  "overdue_task",
  "upcoming_follow_up",
  "deal_won",
  "deal_lost",
  "approaching_deal_closing_date",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification {
  owner: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: "Contact" | "Company" | "Deal" | "Task" | null;
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
      enum: NOTIFICATION_TYPES,
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
      trim: true,
    },
    relatedEntityType: {
      type: String,
      enum: ["Contact", "Company", "Deal", "Task"],
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

notificationSchema.pre("validate", function () {
  const hasRelatedEntityType = this.relatedEntityType != null;
  const hasRelatedEntityId = this.relatedEntityId != null;

  if (hasRelatedEntityType !== hasRelatedEntityId) {
    this.invalidate(
      "relatedEntityId",
      "Related entity type and ID must be set together",
    );
  }
});

notificationSchema.index({ owner: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ owner: 1, type: 1 });

export const Notification: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);

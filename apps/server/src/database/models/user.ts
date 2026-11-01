import mongoose, { Schema, type Model } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  themePreference: "light" | "dark" | "system";
  notificationPreferences: {
    taskReminders: boolean;
    overdueTasks: boolean;
    upcomingFollowUps: boolean;
    dealWon: boolean;
    dealLost: boolean;
    approachingDealClosingDates: boolean;
  };
  defaultCurrency: "USD";
  isGoogleUser: boolean;
  googleId?: string;
  isActive: boolean;
  sessionVersion: number;
  lastLoginAt?: Date | null;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      default: "",
      select: false,
    },
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    themePreference: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    notificationPreferences: {
      taskReminders: { type: Boolean, default: true },
      overdueTasks: { type: Boolean, default: true },
      upcomingFollowUps: { type: Boolean, default: true },
      dealWon: { type: Boolean, default: true },
      dealLost: { type: Boolean, default: true },
      approachingDealClosingDates: { type: Boolean, default: true },
    },
    defaultCurrency: {
      type: String,
      enum: ["USD"],
      default: "USD",
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      default: undefined,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sessionVersion: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.index(
  { googleId: 1 },
  {
    unique: true,
    partialFilterExpression: { googleId: { $gt: "" } },
    name: "googleId_unique",
  },
);

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

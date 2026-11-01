import { randomBytes } from "node:crypto";
import mongoose, { type HydratedDocument } from "mongoose";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";
import { AppError } from "../../errors/AppError.js";
import {
  Activity,
  Company,
  Contact,
  Deal,
  DealHistory,
  Notification,
  PipelineStage,
  Task,
  User,
} from "../../database/models/index.js";
import type { IUser } from "../../database/models/user.js";
import type {
  ChangePasswordInput,
  DeleteAccountInput,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "./auth.schemas.js";
import {
  isPasswordResetEmailConfigured,
  sendPasswordResetEmail,
} from "./auth.email.js";
import {
  hashPassword,
  hashResetToken,
  verifyPassword,
  type SessionClaims,
} from "./auth.tokens.js";

const googleClient = new OAuth2Client();
const defaultNotificationPreferences: IUser["notificationPreferences"] = {
  taskReminders: true,
  overdueTasks: true,
  upcomingFollowUps: true,
  dealWon: true,
  dealLost: true,
  approachingDealClosingDates: true,
};

export interface PublicUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatarUrl: string;
  themePreference: IUser["themePreference"];
  notificationPreferences: IUser["notificationPreferences"];
  defaultCurrency: "USD";
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicUser(user: HydratedDocument<IUser>): PublicUser {
  return {
    id: String(user._id),
    username: user.username,
    email: user.email,
    displayName: user.displayName ?? "",
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    bio: user.bio ?? "",
    avatarUrl: user.avatarUrl ?? "",
    themePreference: user.themePreference,
    notificationPreferences:
      user.notificationPreferences ?? defaultNotificationPreferences,
    defaultCurrency: "USD",
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function defaultAvatar(username: string): string {
  const initial = [...username.trim()][0]?.toUpperCase() ?? "R";
  const escapedInitial = initial.replace(/[&<>"']/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#2563eb"/><text x="32" y="42" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="600" fill="#fff">${escapedInitial}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

function duplicateAccountError(): AppError {
  return new AppError("An account with that username or email already exists", 409);
}

function updateLastLogin(user: HydratedDocument<IUser>): void {
  user.lastLoginAt = new Date();
}

export async function register(input: RegisterInput): Promise<HydratedDocument<IUser>> {
  const passwordHash = await hashPassword(input.password);
  try {
    const user = await User.create({
      username: input.username,
      email: input.email,
      passwordHash,
      displayName: input.username,
      avatarUrl: defaultAvatar(input.username),
      lastLoginAt: new Date(),
    });
    return user;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw duplicateAccountError();
    }
    throw error;
  }
}

export async function login(input: LoginInput): Promise<HydratedDocument<IUser>> {
  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  if (
    !user ||
    !user.isActive ||
    !user.passwordHash ||
    !(await verifyPassword(input.password, user.passwordHash))
  ) {
    throw new AppError("Invalid email or password", 401);
  }

  updateLastLogin(user);
  await user.save();
  return user;
}

function createGoogleUsername(email: string): string {
  const base = email
    .split("@", 1)[0]!
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 40);
  const username = base.length >= 3 ? base : `user${base}`;
  return `${username}-${randomBytes(3).toString("hex")}`.slice(0, 50);
}

export async function loginWithGoogle(
  input: GoogleLoginInput,
): Promise<HydratedDocument<IUser>> {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError("Google sign-in is not configured", 503);
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: input.credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new AppError("Google sign-in could not be verified", 401);
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new AppError("Google sign-in could not be verified", 401);
  }

  let user = await User.findOne({ googleId: payload.sub });
  if (!user) {
    user = await User.findOne({ email: payload.email.toLowerCase() });
    if (user?.googleId && user.googleId !== payload.sub) {
      throw new AppError("Google sign-in could not be verified", 401);
    }
  }

  if (!user) {
    const nameParts = (payload.name ?? "").trim().split(/\s+/);
    try {
      user = await User.create({
        username: createGoogleUsername(payload.email),
        email: payload.email,
        googleId: payload.sub,
        isGoogleUser: true,
        displayName: payload.name ?? "",
        firstName: payload.given_name ?? nameParts[0] ?? "",
        lastName: payload.family_name ?? nameParts.slice(1).join(" "),
        avatarUrl: payload.picture ?? defaultAvatar(payload.email),
        lastLoginAt: new Date(),
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw duplicateAccountError();
      }
      throw error;
    }
    return user;
  }

  if (!user.isActive) {
    throw new AppError("Invalid Google account", 401);
  }
  user.googleId = payload.sub;
  user.isGoogleUser = true;
  updateLastLogin(user);
  await user.save();
  return user;
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!isPasswordResetEmailConfigured()) {
    throw new AppError("Password reset email is not configured", 503);
  }

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    return;
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashResetToken(token);
  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, token);
  } catch {
    await User.updateOne(
      { _id: user._id, passwordResetTokenHash: tokenHash },
      { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } },
    );
    console.error("Password reset email delivery failed");
  }
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  const passwordHash = await hashPassword(input.password);
  const result = await User.updateOne(
    {
      passwordResetTokenHash: hashResetToken(input.token),
      passwordResetExpiresAt: { $gt: new Date() },
      isActive: true,
    },
    {
      $set: { passwordHash },
      $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
      $inc: { sessionVersion: 1 },
    },
  );

  if (result.modifiedCount !== 1) {
    throw new AppError("Reset link is invalid or expired", 400);
  }
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw new AppError("User not found", 404);
  }
  return toPublicUser(user);
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<PublicUser> {
  try {
    const updates: Record<string, unknown> = { ...input };
    if (input.notificationPreferences) {
      const current = await User.findById(userId).select("notificationPreferences");
      updates.notificationPreferences = {
        ...defaultNotificationPreferences,
        ...current?.notificationPreferences,
        ...input.notificationPreferences,
      };
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true },
    );
    if (!user || !user.isActive) {
      throw new AppError("User not found", 404);
    }
    return toPublicUser(user);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw duplicateAccountError();
    }
    throw error;
  }
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<number> {
  const user = await User.findById(userId).select("+passwordHash");
  if (
    !user ||
    !user.passwordHash ||
    !(await verifyPassword(input.currentPassword, user.passwordHash))
  ) {
    throw new AppError("Current password is incorrect", 400);
  }

  const passwordHash = await hashPassword(input.newPassword);
  const result = await User.updateOne(
    { _id: userId, passwordHash: user.passwordHash },
    {
      $set: { passwordHash },
      $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
      $inc: { sessionVersion: 1 },
    },
  );
  if (result.modifiedCount !== 1) {
    throw new AppError("Password changed in another session; please try again", 409);
  }

  const updatedUser = await User.findById(userId).select("sessionVersion");
  return updatedUser?.sessionVersion ?? user.sessionVersion + 1;
}

export async function invalidateSession(claims: SessionClaims): Promise<void> {
  await User.updateOne(
    { _id: claims.sub, sessionVersion: claims.sv },
    { $inc: { sessionVersion: 1 } },
  );
}

export async function deleteAccount(
  userId: string,
  input: DeleteAccountInput,
): Promise<void> {
  const user = await User.findById(userId).select("+passwordHash");
  if (!user || !user.isActive) {
    throw new AppError("User not found", 404);
  }

  if (user.passwordHash) {
    if (
      !input.currentPassword ||
      !(await verifyPassword(input.currentPassword, user.passwordHash))
    ) {
      throw new AppError("Current password is required", 400);
    }
  } else if (input.confirmEmail?.toLowerCase() !== user.email) {
    throw new AppError("Email confirmation is required", 400);
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const owner = user._id;
      await Contact.deleteMany({ owner }, { session });
      await Company.deleteMany({ owner }, { session });
      await Deal.deleteMany({ owner }, { session });
      await PipelineStage.deleteMany({ owner }, { session });
      await Task.deleteMany({ owner }, { session });
      await Activity.deleteMany({ owner }, { session });
      await DealHistory.deleteMany({ owner }, { session });
      await Notification.deleteMany({ owner }, { session });
      await User.deleteOne({ _id: owner }, { session });
    });
  } finally {
    await session.endSession();
  }
}

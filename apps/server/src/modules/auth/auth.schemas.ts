import { z } from "zod";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
const passwordSchema = z.string().min(8).max(128);

export const registerSchema = z
  .object({
    username: z.string().trim().min(3).max(50),
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(128),
  })
  .strict();

export const googleLoginSchema = z
  .object({ credential: z.string().min(1).max(8192) })
  .strict();

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32).max(256),
    password: passwordSchema,
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: passwordSchema,
  })
  .strict();

const notificationPreferencesSchema = z
  .object({
    taskReminders: z.boolean(),
    overdueTasks: z.boolean(),
    upcomingFollowUps: z.boolean(),
    dealWon: z.boolean(),
    dealLost: z.boolean(),
    approachingDealClosingDates: z.boolean(),
  })
  .partial()
  .strict();

export const updateProfileSchema = z
  .object({
    username: z.string().trim().min(3).max(50).optional(),
    displayName: z.string().trim().max(100).optional(),
    firstName: z.string().trim().max(80).optional(),
    lastName: z.string().trim().max(80).optional(),
    bio: z.string().trim().max(500).optional(),
    avatarUrl: z
      .string()
      .max(2048)
      .refine(
        (value) =>
          value === "" ||
          /^https:\/\/\S+$/i.test(value) ||
          value.startsWith("data:image/svg+xml,"),
      )
      .optional(),
    themePreference: z.enum(["light", "dark", "system"]).optional(),
    notificationPreferences: notificationPreferencesSchema.optional(),
    defaultCurrency: z.literal("USD").optional(),
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    "At least one profile field is required",
  );

export const deleteAccountSchema = z
  .object({
    currentPassword: z.string().min(1).max(128).optional(),
    confirmEmail: emailSchema.optional(),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

import nodemailer from "nodemailer";
import { AppError } from "../../errors/AppError.js";
import { env } from "../../config/env.js";

export function isPasswordResetEmailConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD && env.SMTP_FROM);
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
): Promise<void> {
  if (!isPasswordResetEmailConfigured()) {
    throw new AppError("Password reset email is not configured", 503);
  }

  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
  const clientOrigin = env.CLIENT_ORIGIN.split(",")[0]?.trim() ?? env.CLIENT_ORIGIN;
  const resetUrl = new URL("/auth/reset-password", clientOrigin);
  resetUrl.searchParams.set("token", token);

  await transport.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Reset your Relio password",
    text: `Use this link to reset your Relio password. It expires in 30 minutes: ${resetUrl.toString()}`,
  });
}

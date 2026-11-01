import "dotenv/config";
import { z } from "zod";

const nullableString = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().trim().min(1).optional());

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
    MONGODB_URI: nullableString,
    JWT_SECRET: nullableString.pipe(z.string().min(32).optional()),
    JWT_EXPIRES_IN: z
      .string()
      .regex(/^[1-9]\d*[smhd]$/)
      .default("15m"),
    GOOGLE_CLIENT_ID: nullableString,
    SMTP_HOST: nullableString,
    SMTP_PORT: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.coerce.number().int().min(1).max(65535).optional(),
    ),
    SMTP_USER: nullableString,
    SMTP_PASSWORD: nullableString,
    SMTP_FROM: nullableString,
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
    CLOUDINARY_CLOUD_NAME: nullableString,
    CLOUDINARY_API_KEY: nullableString,
    CLOUDINARY_API_SECRET: nullableString,
  })
  .refine(
    ({ CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET }) =>
      [CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET].every(
        Boolean,
      ) ||
      [CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET].every(
        (value) => !value,
      ),
    {
      message:
        "Cloudinary configuration must include cloud name, API key, and API secret",
      path: ["CLOUDINARY_CLOUD_NAME"],
    },
  )
  .refine(
    ({ SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM }) =>
      [SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM].every(Boolean) ||
      [SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM].every((value) => !value),
    {
      message: "SMTP configuration must include host, user, password, and from address",
      path: ["SMTP_HOST"],
    },
  );

export const env = envSchema.parse(process.env);

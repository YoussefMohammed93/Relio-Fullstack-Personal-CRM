import "dotenv/config";
import { z } from "zod";

const nullableString = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().trim().min(1).optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_ORIGIN: z.string().default("http://localhost:3000"),
  MONGODB_URI: nullableString,
  JWT_SECRET: nullableString.pipe(z.string().min(32).optional()),
  JWT_EXPIRES_IN: z.string().default("15m"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

export const env = envSchema.parse(process.env);

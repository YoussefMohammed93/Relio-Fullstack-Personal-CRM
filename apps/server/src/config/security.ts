import type { CookieOptions } from "express";
import { env } from "./env.js";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

export function getJwtSecret(): string {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured before signing or verifying tokens");
  }

  return env.JWT_SECRET;
}

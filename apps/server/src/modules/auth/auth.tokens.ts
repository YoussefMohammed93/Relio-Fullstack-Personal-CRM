import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import type { Response } from "express";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";
import { authCookieOptions, getJwtSecret } from "../../config/security.js";

export const AUTH_COOKIE_NAME = "relio_session";
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_SALT_LENGTH = 16;
const PASSWORD_HASH_PREFIX = "scrypt$16384$8$1";

function derivePasswordKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(
      password,
      salt,
      PASSWORD_KEY_LENGTH,
      { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(PASSWORD_SALT_LENGTH);
  const key = await derivePasswordKey(password, salt);
  return `${PASSWORD_HASH_PREFIX}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelism, saltValue, keyValue, extra] =
    storedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    cost !== "16384" ||
    blockSize !== "8" ||
    parallelism !== "1" ||
    !saltValue ||
    !keyValue ||
    extra !== undefined
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expectedKey = Buffer.from(keyValue, "base64url");
    if (
      salt.length !== PASSWORD_SALT_LENGTH ||
      expectedKey.length !== PASSWORD_KEY_LENGTH
    ) {
      return false;
    }

    const actualKey = await derivePasswordKey(password, salt);
    return timingSafeEqual(actualKey, expectedKey);
  } catch {
    return false;
  }
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface SessionClaims {
  sub: string;
  sv: number;
}

export function signSessionToken(claims: SessionClaims): string {
  return jwt.sign(claims, getJwtSecret(), {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    issuer: "relio",
  });
}

export function verifySessionToken(token: string): SessionClaims {
  const payload = jwt.verify(token, getJwtSecret(), { issuer: "relio" }) as JwtPayload;
  if (
    typeof payload.sub !== "string" ||
    !Number.isInteger(payload.sv) ||
    (payload.sv as number) < 0
  ) {
    throw new Error("Invalid session token");
  }

  return { sub: payload.sub, sv: payload.sv as number };
}

function getCookieMaxAge(): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(env.JWT_EXPIRES_IN);
  if (!match) {
    return 15 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unitMilliseconds: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * unitMilliseconds[match[2]!];
}

export function setSessionCookie(response: Response, token: string): void {
  response.cookie(AUTH_COOKIE_NAME, token, {
    ...authCookieOptions,
    maxAge: getCookieMaxAge(),
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
}

import mongoose from "mongoose";
import { ForbiddenError, NotFoundError, ValidationError } from "../errors/AppError.js";

export function sanitizeText(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

export function parsePositiveInt(
  value: string | number | undefined,
  fallback: number,
): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function parseObjectId(value: string | undefined, fieldName = "id"): string {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw new ValidationError(`${fieldName} must be a valid MongoDB ObjectId`);
  }

  return value;
}

export function assertOwnership(
  resourceOwnerId: string | undefined,
  currentUserId: string | undefined,
  fieldName = "resource",
): void {
  if (!resourceOwnerId) {
    throw new NotFoundError(`${fieldName} was not found`);
  }

  if (!currentUserId || resourceOwnerId !== currentUserId) {
    throw new ForbiddenError(`You do not have permission to access this ${fieldName}`);
  }
}

import type { Request, Response } from "express";
import { getAuthContext } from "./auth.middleware.js";
import type {
  ChangePasswordInput,
  DeleteAccountInput,
  UpdateProfileInput,
} from "./auth.schemas.js";
import {
  changePassword,
  deleteAccount,
  getProfile,
  updateProfile,
} from "./auth.service.js";
import {
  clearSessionCookie,
  setSessionCookie,
  signSessionToken,
} from "./auth.tokens.js";
import { successResponse } from "../../shared/api.js";

function validatedBody<T>(request: Request): T {
  return (request as Request & { validated: { body: T } }).validated.body;
}

export async function getCurrentUserController(
  request: Request,
  response: Response,
): Promise<void> {
  const { userId } = getAuthContext(request);
  response.status(200).json(successResponse(await getProfile(userId)));
}

export async function updateCurrentUserController(
  request: Request,
  response: Response,
): Promise<void> {
  const { userId } = getAuthContext(request);
  const profile = await updateProfile(
    userId,
    validatedBody<UpdateProfileInput>(request),
  );
  response.status(200).json(successResponse(profile));
}

export async function changePasswordController(
  request: Request,
  response: Response,
): Promise<void> {
  const { userId } = getAuthContext(request);
  const sessionVersion = await changePassword(
    userId,
    validatedBody<ChangePasswordInput>(request),
  );
  setSessionCookie(response, signSessionToken({ sub: userId, sv: sessionVersion }));
  response.status(200).json(successResponse({ message: "Password changed" }));
}

export async function deleteAccountController(
  request: Request,
  response: Response,
): Promise<void> {
  const { userId } = getAuthContext(request);
  await deleteAccount(userId, validatedBody<DeleteAccountInput>(request));
  clearSessionCookie(response);
  response.status(200).json(successResponse({ message: "Account deleted" }));
}

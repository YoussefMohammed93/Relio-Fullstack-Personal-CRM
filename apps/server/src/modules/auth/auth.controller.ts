import type { Request, Response } from "express";
import { successResponse } from "../../shared/api.js";
import type {
  ForgotPasswordInput,
  GoogleLoginInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "./auth.schemas.js";
import {
  invalidateSession,
  login,
  loginWithGoogle,
  register,
  requestPasswordReset,
  resetPassword,
  toPublicUser,
} from "./auth.service.js";
import {
  AUTH_COOKIE_NAME,
  clearSessionCookie,
  setSessionCookie,
  signSessionToken,
  verifySessionToken,
} from "./auth.tokens.js";

function validatedBody<T>(request: Request): T {
  return (request as Request & { validated: { body: T } }).validated.body;
}

function startSession(
  response: Response,
  user: Awaited<ReturnType<typeof register>>,
): void {
  setSessionCookie(
    response,
    signSessionToken({ sub: String(user._id), sv: user.sessionVersion }),
  );
}

export async function registerController(
  request: Request,
  response: Response,
): Promise<void> {
  const user = await register(validatedBody<RegisterInput>(request));
  startSession(response, user);
  response.status(201).json(successResponse(toPublicUser(user)));
}

export async function loginController(
  request: Request,
  response: Response,
): Promise<void> {
  const user = await login(validatedBody<LoginInput>(request));
  startSession(response, user);
  response.status(200).json(successResponse(toPublicUser(user)));
}

export async function googleLoginController(
  request: Request,
  response: Response,
): Promise<void> {
  const user = await loginWithGoogle(validatedBody<GoogleLoginInput>(request));
  startSession(response, user);
  response.status(200).json(successResponse(toPublicUser(user)));
}

export async function logoutController(
  request: Request,
  response: Response,
): Promise<void> {
  clearSessionCookie(response);
  const token: unknown = request.cookies?.[AUTH_COOKIE_NAME];
  if (typeof token === "string" && token) {
    let claims;
    try {
      claims = verifySessionToken(token);
    } catch {
      claims = undefined;
    }
    if (claims) {
      await invalidateSession(claims);
    }
  }

  response.status(200).json(successResponse({ message: "Logged out" }));
}

export async function forgotPasswordController(
  request: Request,
  response: Response,
): Promise<void> {
  const { email } = validatedBody<ForgotPasswordInput>(request);
  await requestPasswordReset(email);
  response
    .status(202)
    .json(
      successResponse({ message: "If an account exists, a reset link will be sent" }),
    );
}

export async function resetPasswordController(
  request: Request,
  response: Response,
): Promise<void> {
  await resetPassword(validatedBody<ResetPasswordInput>(request));
  response.status(200).json(successResponse({ message: "Password has been reset" }));
}

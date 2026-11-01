import type { Request, RequestHandler } from "express";
import { User } from "../../database/models/user.js";
import { errorResponse } from "../../shared/api.js";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./auth.tokens.js";

export interface AuthContext {
  userId: string;
}

type AuthenticatedRequest = Request & { auth?: AuthContext };

export function getAuthContext(request: Request): AuthContext {
  const auth = (request as AuthenticatedRequest).auth;
  if (!auth) {
    throw new Error("Authenticated request context is unavailable");
  }
  return auth;
}

export const requireAuthentication: RequestHandler = async (
  request,
  response,
  next,
) => {
  const token: unknown = request.cookies?.[AUTH_COOKIE_NAME];
  if (typeof token !== "string" || !token) {
    response
      .status(401)
      .json(errorResponse("Authentication required", 401, "UNAUTHORIZED"));
    return;
  }

  let claims;
  try {
    claims = verifySessionToken(token);
  } catch {
    response
      .status(401)
      .json(errorResponse("Authentication required", 401, "UNAUTHORIZED"));
    return;
  }

  try {
    const user = await User.findById(claims.sub).select("sessionVersion isActive");
    if (!user || !user.isActive || user.sessionVersion !== claims.sv) {
      response
        .status(401)
        .json(errorResponse("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }

    (request as AuthenticatedRequest).auth = { userId: String(user._id) };
    next();
  } catch (error) {
    next(error);
  }
};

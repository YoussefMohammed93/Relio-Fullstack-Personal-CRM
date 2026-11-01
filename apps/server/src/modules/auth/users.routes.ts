import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "../../middleware/validate-request.js";
import { requireAuthentication } from "./auth.middleware.js";
import {
  changePasswordSchema,
  deleteAccountSchema,
  updateProfileSchema,
} from "./auth.schemas.js";
import {
  changePasswordController,
  deleteAccountController,
  getCurrentUserController,
  updateCurrentUserController,
} from "./users.controller.js";

const emptyRequestParts = {
  query: z.unknown(),
  params: z.unknown(),
};

function validateBody(schema: z.ZodType): ReturnType<typeof validateRequest> {
  return validateRequest(z.object({ body: schema, ...emptyRequestParts }));
}

export const usersRouter = Router();
usersRouter.use(requireAuthentication);
usersRouter.get("/me", getCurrentUserController);
usersRouter.patch(
  "/me",
  validateBody(updateProfileSchema),
  updateCurrentUserController,
);
usersRouter.patch(
  "/me/password",
  validateBody(changePasswordSchema),
  changePasswordController,
);
usersRouter.delete("/me", validateBody(deleteAccountSchema), deleteAccountController);

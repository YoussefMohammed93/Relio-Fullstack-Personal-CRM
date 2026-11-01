import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { validateRequest } from "../../middleware/validate-request.js";
import {
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.schemas.js";
import {
  forgotPasswordController,
  googleLoginController,
  loginController,
  logoutController,
  registerController,
  resetPasswordController,
} from "./auth.controller.js";

const emptyRequestParts = {
  query: z.unknown(),
  params: z.unknown(),
};

function validateBody(schema: z.ZodType): ReturnType<typeof validateRequest> {
  return validateRequest(z.object({ body: schema, ...emptyRequestParts }));
}

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: { code: "RATE_LIMITED", message: "Too many authentication attempts" },
  },
});

export const authRouter = Router();
authRouter.use(authRateLimit);
authRouter.post("/register", validateBody(registerSchema), registerController);
authRouter.post("/login", validateBody(loginSchema), loginController);
authRouter.post("/google", validateBody(googleLoginSchema), googleLoginController);
authRouter.post("/logout", logoutController);
authRouter.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  forgotPasswordController,
);
authRouter.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  resetPasswordController,
);

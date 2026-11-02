import multer from "multer";
import { Router, type RequestHandler } from "express";
import { getAuthContext } from "../auth/auth.middleware.js";
import { ValidationError } from "../../errors/AppError.js";
import { successResponse } from "../../shared/api.js";
import { MAX_COMPANY_LOGO_SIZE_BYTES, uploadUserAvatar } from "./company-logo.js";

const parseAvatar = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_COMPANY_LOGO_SIZE_BYTES,
    files: 1,
    fields: 0,
    parts: 1,
  },
}).single("avatar");

export function createProfileAvatarRouter(authenticate: RequestHandler): Router {
  const router = Router();

  router.post("/", authenticate, parseAvatar, async (request, response, next) => {
    try {
      if (!request.file) throw new ValidationError("Profile image file is required");
      const result = await uploadUserAvatar(
        request.file.buffer,
        getAuthContext(request).userId,
      );
      response.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

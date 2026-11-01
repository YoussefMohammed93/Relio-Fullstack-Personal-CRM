import { Router, type RequestHandler } from "express";
import { successResponse } from "../../shared/api.js";
import {
  parseCompanyLogoUpload,
  validateUploadedCompanyLogo,
} from "./company-logo-upload.js";
import { uploadCompanyLogo } from "./company-logo.js";

export function createCompanyLogoRouter(authenticate: RequestHandler): Router {
  const router = Router();

  router.post(
    "/",
    authenticate,
    parseCompanyLogoUpload,
    validateUploadedCompanyLogo,
    async (request, response, next) => {
      try {
        const result = await uploadCompanyLogo(request.file!.buffer);
        response.status(201).json(successResponse(result));
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}

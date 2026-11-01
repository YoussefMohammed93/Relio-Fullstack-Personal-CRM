import multer from "multer";
import { ValidationError } from "../../errors/AppError.js";
import type { RequestHandler } from "express";
import {
  validateCompanyLogoBuffer,
  MAX_COMPANY_LOGO_SIZE_BYTES,
} from "./company-logo.js";

export const parseCompanyLogoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_COMPANY_LOGO_SIZE_BYTES,
    files: 1,
    fields: 0,
    parts: 1,
  },
}).single("logo");

export const validateUploadedCompanyLogo: RequestHandler = (
  request,
  _response,
  next,
) => {
  void _response;

  if (!request.file) {
    next(new ValidationError("Company logo file is required"));
    return;
  }

  void validateCompanyLogoBuffer(request.file.buffer).then(
    () => next(),
    (error: unknown) => next(error),
  );
};

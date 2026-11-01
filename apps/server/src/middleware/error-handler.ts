import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { errorResponse } from "../shared/api.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  const isMulterError = error instanceof multer.MulterError;
  const statusCode =
    error instanceof AppError
      ? error.statusCode
      : isMulterError
        ? error.code === "LIMIT_FILE_SIZE"
          ? 413
          : 400
        : 500;
  const message =
    error instanceof AppError
      ? error.message
      : isMulterError
        ? error.code === "LIMIT_FILE_SIZE"
          ? "Uploaded file exceeds the 5 MB limit"
          : "Invalid file upload"
        : "Internal server error";
  const errorCode =
    statusCode === 404
      ? "NOT_FOUND"
      : statusCode === 413
        ? "PAYLOAD_TOO_LARGE"
        : statusCode === 400
          ? "BAD_REQUEST"
          : "INTERNAL_ERROR";
  const details =
    env.NODE_ENV === "development" && error instanceof Error
      ? { stack: error.stack }
      : undefined;

  if (statusCode >= 500) {
    console.error(error);
  }

  response
    .status(statusCode)
    .json(errorResponse(message, statusCode, errorCode, details));
};

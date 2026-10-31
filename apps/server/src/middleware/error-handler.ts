import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
import { env } from "../config/env.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error instanceof AppError ? error.message : "Internal server error";

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    error: {
      message,
      ...(env.NODE_ENV === "development" && error instanceof Error
        ? { stack: error.stack }
        : {}),
    },
  });
};

import type { Request, RequestHandler, Response } from "express";
import type { ZodTypeAny } from "zod";
import { errorResponse } from "../shared/api.js";

export function validateRequest<T extends ZodTypeAny>(schema: T): RequestHandler {
  return (request: Request, response: Response, next) => {
    const payload = {
      body: request.body,
      query: request.query,
      params: request.params,
    };

    const result = schema.safeParse(payload);

    if (!result.success) {
      response
        .status(400)
        .json(
          errorResponse(
            "Validation failed",
            400,
            "VALIDATION_ERROR",
            result.error.issues,
          ),
        );
      return;
    }

    const validatedRequest = request as Request & { validated?: unknown };
    validatedRequest.validated = result.data;
    next();
  };
}

import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { validateRequest } from "../../middleware/validate-request.js";
import {
  createPipelineStageSchema,
  deletePipelineStageSchema,
  pipelineStageIdSchema,
  reorderPipelineStagesSchema,
  updatePipelineStageSchema,
} from "./pipeline-stages.schemas.js";
import {
  createPipelineStageController,
  deletePipelineStageController,
  listPipelineStagesController,
  reorderPipelineStagesController,
  updatePipelineStageController,
} from "./pipeline-stages.controller.js";

const emptyBody = z.unknown();
const emptyParams = z.unknown();
const emptyQuery = z.object({}).strict();

export function createPipelineStagesRouter(requireAuthentication: RequestHandler) {
  const router = Router();
  router.use(requireAuthentication);

  router.get(
    "/",
    validateRequest(
      z.object({ body: emptyBody, query: emptyQuery, params: emptyParams }),
    ),
    listPipelineStagesController,
  );
  router.post(
    "/",
    validateRequest(
      z.object({
        body: createPipelineStageSchema,
        query: emptyQuery,
        params: emptyParams,
      }),
    ),
    createPipelineStageController,
  );
  router.post(
    "/reorder",
    validateRequest(
      z.object({
        body: reorderPipelineStagesSchema,
        query: emptyQuery,
        params: emptyParams,
      }),
    ),
    reorderPipelineStagesController,
  );

  const stageRequest = (body: z.ZodType = emptyBody) =>
    validateRequest(
      z.object({ body, query: emptyQuery, params: pipelineStageIdSchema }),
    );
  router.patch(
    "/:id",
    stageRequest(updatePipelineStageSchema),
    updatePipelineStageController,
  );
  router.delete(
    "/:id",
    stageRequest(deletePipelineStageSchema),
    deletePipelineStageController,
  );

  return router;
}

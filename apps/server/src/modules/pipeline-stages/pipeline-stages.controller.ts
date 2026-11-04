import type { Request, Response } from "express";
import { successResponse } from "../../shared/api.js";
import { getAuthContext } from "../auth/auth.middleware.js";
import {
  createPipelineStage,
  deletePipelineStage,
  listPipelineStages,
  reorderPipelineStages,
  updatePipelineStage,
} from "./pipeline-stages.service.js";
import type {
  CreatePipelineStageInput,
  DeletePipelineStageInput,
  ReorderPipelineStagesInput,
  UpdatePipelineStageInput,
} from "./pipeline-stages.schemas.js";

type ValidatedRequest = Request & {
  validated: { body?: unknown; params?: unknown };
};

const validated = (request: Request) => (request as ValidatedRequest).validated;
const ownerId = (request: Request) => getAuthContext(request).userId;
const recordId = (request: Request) => (validated(request).params as { id: string }).id;

export async function listPipelineStagesController(
  request: Request,
  response: Response,
) {
  response.json(successResponse(await listPipelineStages(ownerId(request))));
}

export async function createPipelineStageController(
  request: Request,
  response: Response,
) {
  const stage = await createPipelineStage(
    ownerId(request),
    validated(request).body as CreatePipelineStageInput,
  );
  response.status(201).json(successResponse(stage));
}

export async function updatePipelineStageController(
  request: Request,
  response: Response,
) {
  const stage = await updatePipelineStage(
    ownerId(request),
    recordId(request),
    validated(request).body as UpdatePipelineStageInput,
  );
  response.json(successResponse(stage));
}

export async function reorderPipelineStagesController(
  request: Request,
  response: Response,
) {
  response.json(
    successResponse(
      await reorderPipelineStages(
        ownerId(request),
        validated(request).body as ReorderPipelineStagesInput,
      ),
    ),
  );
}

export async function deletePipelineStageController(
  request: Request,
  response: Response,
) {
  const body = validated(request).body as DeletePipelineStageInput;
  response.json(
    successResponse(
      await deletePipelineStage(
        ownerId(request),
        recordId(request),
        body.replacementStageId,
      ),
    ),
  );
}

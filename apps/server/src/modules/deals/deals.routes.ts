import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { validateRequest } from "../../middleware/validate-request.js";
import {
  bulkChangeDealStageSchema,
  bulkDeleteDealsSchema,
  createDealSchema,
  dealIdSchema,
  dealsQuerySchema,
  emptyDealActionSchema,
  loseDealSchema,
  updateDealSchema,
} from "./deals.schemas.js";
import {
  bulkChangeDealStageController,
  bulkDeleteDealsController,
  createDealController,
  deleteDealController,
  getDealActivitiesController,
  getDealController,
  getDealHistoryController,
  getDealStatsController,
  getDealTasksController,
  listDealBoardController,
  listDealsController,
  loseDealController,
  reopenDealController,
  updateDealController,
  winDealController,
} from "./deals.controller.js";

const emptyBody = z.unknown();
const emptyParams = z.unknown();
const emptyQuery = z.object({}).strict();

export function createDealsRouter(requireAuthentication: RequestHandler) {
  const router = Router();
  router.use(requireAuthentication);

  router.get(
    "/stats",
    validateRequest(
      z.object({ body: emptyBody, query: emptyQuery, params: emptyParams }),
    ),
    getDealStatsController,
  );
  router.get(
    "/board",
    validateRequest(
      z.object({ body: emptyBody, query: dealsQuerySchema, params: emptyParams }),
    ),
    listDealBoardController,
  );
  router.post(
    "/bulk-delete",
    validateRequest(
      z.object({ body: bulkDeleteDealsSchema, query: emptyQuery, params: emptyParams }),
    ),
    bulkDeleteDealsController,
  );
  router.post(
    "/bulk-stage",
    validateRequest(
      z.object({
        body: bulkChangeDealStageSchema,
        query: emptyQuery,
        params: emptyParams,
      }),
    ),
    bulkChangeDealStageController,
  );
  router.get(
    "/",
    validateRequest(
      z.object({ body: emptyBody, query: dealsQuerySchema, params: emptyParams }),
    ),
    listDealsController,
  );
  router.post(
    "/",
    validateRequest(
      z.object({ body: createDealSchema, query: emptyQuery, params: emptyParams }),
    ),
    createDealController,
  );

  const dealRequest = (body: z.ZodType = emptyBody) =>
    validateRequest(z.object({ body, query: emptyQuery, params: dealIdSchema }));
  router.get("/:id/activities", dealRequest(), getDealActivitiesController);
  router.get("/:id/tasks", dealRequest(), getDealTasksController);
  router.get("/:id/history", dealRequest(), getDealHistoryController);
  router.post("/:id/won", dealRequest(emptyDealActionSchema), winDealController);
  router.post("/:id/lost", dealRequest(loseDealSchema), loseDealController);
  router.post("/:id/reopen", dealRequest(emptyDealActionSchema), reopenDealController);
  router.get("/:id", dealRequest(), getDealController);
  router.patch("/:id", dealRequest(updateDealSchema), updateDealController);
  router.delete("/:id", dealRequest(), deleteDealController);

  return router;
}

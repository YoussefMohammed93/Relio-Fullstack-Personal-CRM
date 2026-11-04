import type { Request, Response } from "express";
import { successResponse } from "../../shared/api.js";
import { getAuthContext } from "../auth/auth.middleware.js";
import {
  changeDealsStage,
  closeDeal,
  createDeal,
  deleteDeals,
  getDeal,
  getDealActivities,
  getDealHistory,
  getDealStats,
  getDealTasks,
  listDealBoard,
  listDeals,
  reopenDeal,
  updateDeal,
} from "./deals.service.js";
import type {
  BulkChangeDealStageInput,
  BulkDeleteDealsInput,
  CreateDealInput,
  DealsQuery,
  LoseDealInput,
  UpdateDealInput,
} from "./deals.schemas.js";

type ValidatedRequest = Request & {
  validated: { body?: unknown; params?: unknown; query?: unknown };
};

const validated = (request: Request) => (request as ValidatedRequest).validated;
const ownerId = (request: Request) => getAuthContext(request).userId;
const recordId = (request: Request) => (validated(request).params as { id: string }).id;

export async function listDealsController(request: Request, response: Response) {
  const result = await listDeals(
    ownerId(request),
    validated(request).query as DealsQuery,
  );
  response.json(successResponse(result.deals, result.meta));
}

export async function listDealBoardController(request: Request, response: Response) {
  response.json(
    successResponse(
      await listDealBoard(ownerId(request), validated(request).query as DealsQuery),
    ),
  );
}

export async function getDealStatsController(request: Request, response: Response) {
  response.json(successResponse(await getDealStats(ownerId(request))));
}

export async function createDealController(request: Request, response: Response) {
  const deal = await createDeal(
    ownerId(request),
    validated(request).body as CreateDealInput,
  );
  response.status(201).json(successResponse(deal));
}

export async function getDealController(request: Request, response: Response) {
  response.json(successResponse(await getDeal(ownerId(request), recordId(request))));
}

export async function updateDealController(request: Request, response: Response) {
  const deal = await updateDeal(
    ownerId(request),
    recordId(request),
    validated(request).body as UpdateDealInput,
  );
  response.json(successResponse(deal));
}

export async function deleteDealController(request: Request, response: Response) {
  response.json(
    successResponse(await deleteDeals(ownerId(request), [recordId(request)])),
  );
}

export async function bulkDeleteDealsController(request: Request, response: Response) {
  const input = validated(request).body as BulkDeleteDealsInput;
  response.json(successResponse(await deleteDeals(ownerId(request), input.ids)));
}

export async function bulkChangeDealStageController(
  request: Request,
  response: Response,
) {
  response.json(
    successResponse(
      await changeDealsStage(
        ownerId(request),
        validated(request).body as BulkChangeDealStageInput,
      ),
    ),
  );
}

export async function winDealController(request: Request, response: Response) {
  response.json(
    successResponse(await closeDeal(ownerId(request), recordId(request), "won")),
  );
}

export async function loseDealController(request: Request, response: Response) {
  response.json(
    successResponse(
      await closeDeal(
        ownerId(request),
        recordId(request),
        "lost",
        validated(request).body as LoseDealInput,
      ),
    ),
  );
}

export async function reopenDealController(request: Request, response: Response) {
  response.json(successResponse(await reopenDeal(ownerId(request), recordId(request))));
}

async function relatedController(
  request: Request,
  response: Response,
  lookup: (owner: string, id: string) => Promise<unknown>,
) {
  response.json(successResponse(await lookup(ownerId(request), recordId(request))));
}

export const getDealActivitiesController = (request: Request, response: Response) =>
  relatedController(request, response, getDealActivities);

export const getDealTasksController = (request: Request, response: Response) =>
  relatedController(request, response, getDealTasks);

export const getDealHistoryController = (request: Request, response: Response) =>
  relatedController(request, response, getDealHistory);

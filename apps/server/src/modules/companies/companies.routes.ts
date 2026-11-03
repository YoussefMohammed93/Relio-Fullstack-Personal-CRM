import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { validateRequest } from "../../middleware/validate-request.js";
import {
  bulkDeleteCompaniesSchema,
  companiesQuerySchema,
  companyDuplicateQuerySchema,
  companyIdSchema,
  createCompanyNoteSchema,
  createCompanySchema,
  updateCompanySchema,
} from "./companies.schemas.js";
import {
  bulkDeleteCompaniesController,
  createCompanyController,
  createCompanyNoteController,
  deleteCompanyController,
  findCompanyDuplicatesController,
  getCompanyActivitiesController,
  getCompanyContactsController,
  getCompanyController,
  getCompanyDealsController,
  getCompanyNotesController,
  getCompanyStatsController,
  listCompaniesController,
  updateCompanyController,
} from "./companies.controller.js";

const emptyBody = z.unknown();
const emptyParams = z.unknown();
const emptyQuery = z.object({}).strict();

export function createCompaniesRouter(requireAuthentication: RequestHandler) {
  const router = Router();
  router.use(requireAuthentication);

  router.get(
    "/stats",
    validateRequest(
      z.object({ body: emptyBody, query: emptyQuery, params: emptyParams }),
    ),
    getCompanyStatsController,
  );
  router.get(
    "/duplicate-check",
    validateRequest(
      z.object({
        body: emptyBody,
        query: companyDuplicateQuerySchema,
        params: emptyParams,
      }),
    ),
    findCompanyDuplicatesController,
  );
  router.post(
    "/bulk-delete",
    validateRequest(
      z.object({
        body: bulkDeleteCompaniesSchema,
        query: emptyQuery,
        params: emptyParams,
      }),
    ),
    bulkDeleteCompaniesController,
  );
  router.get(
    "/",
    validateRequest(
      z.object({ body: emptyBody, query: companiesQuerySchema, params: emptyParams }),
    ),
    listCompaniesController,
  );
  router.post(
    "/",
    validateRequest(
      z.object({ body: createCompanySchema, query: emptyQuery, params: emptyParams }),
    ),
    createCompanyController,
  );

  const companyRequest = validateRequest(
    z.object({ body: emptyBody, query: emptyQuery, params: companyIdSchema }),
  );
  router.get("/:id/contacts", companyRequest, getCompanyContactsController);
  router.get("/:id/deals", companyRequest, getCompanyDealsController);
  router.get("/:id/activities", companyRequest, getCompanyActivitiesController);
  router.get("/:id/notes", companyRequest, getCompanyNotesController);
  router.post(
    "/:id/notes",
    validateRequest(
      z.object({
        body: createCompanyNoteSchema,
        query: emptyQuery,
        params: companyIdSchema,
      }),
    ),
    createCompanyNoteController,
  );
  router.get("/:id", companyRequest, getCompanyController);
  router.patch(
    "/:id",
    validateRequest(
      z.object({
        body: updateCompanySchema,
        query: emptyQuery,
        params: companyIdSchema,
      }),
    ),
    updateCompanyController,
  );
  router.delete("/:id", companyRequest, deleteCompanyController);

  return router;
}

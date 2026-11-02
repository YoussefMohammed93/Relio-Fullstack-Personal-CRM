import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { validateRequest } from "../../middleware/validate-request.js";
import {
  bulkDeleteContactsSchema,
  contactIdSchema,
  contactsQuerySchema,
  companyOptionsQuerySchema,
  createContactSchema,
  updateContactSchema,
} from "./contacts.schemas.js";
import {
  bulkDeleteContactsController,
  createContactController,
  deleteContactController,
  getContactActivitiesController,
  getContactController,
  getContactDealsController,
  getContactStatsController,
  getContactTasksController,
  listCompanyOptionsController,
  listContactsController,
  updateContactController,
} from "./contacts.controller.js";

const emptyBody = z.unknown();
const emptyParams = z.unknown();

export function createContactsRouter(requireAuthentication: RequestHandler) {
  const router = Router();
  router.use(requireAuthentication);

  router.get(
    "/stats",
    validateRequest(
      z.object({ body: emptyBody, query: z.object({}).strict(), params: emptyParams }),
    ),
    getContactStatsController,
  );
  router.get(
    "/company-options",
    validateRequest(
      z.object({
        body: emptyBody,
        query: companyOptionsQuerySchema,
        params: emptyParams,
      }),
    ),
    listCompanyOptionsController,
  );
  router.post(
    "/bulk-delete",
    validateRequest(
      z.object({
        body: bulkDeleteContactsSchema,
        query: z.object({}).strict(),
        params: emptyParams,
      }),
    ),
    bulkDeleteContactsController,
  );
  router.get(
    "/",
    validateRequest(
      z.object({ body: emptyBody, query: contactsQuerySchema, params: emptyParams }),
    ),
    listContactsController,
  );
  router.post(
    "/",
    validateRequest(
      z.object({
        body: createContactSchema,
        query: z.object({}).strict(),
        params: emptyParams,
      }),
    ),
    createContactController,
  );

  const contactRequest = validateRequest(
    z.object({
      body: emptyBody,
      query: z.object({}).strict(),
      params: contactIdSchema,
    }),
  );
  router.get("/:id/deals", contactRequest, getContactDealsController);
  router.get("/:id/tasks", contactRequest, getContactTasksController);
  router.get("/:id/activities", contactRequest, getContactActivitiesController);
  router.get("/:id", contactRequest, getContactController);
  router.patch(
    "/:id",
    validateRequest(
      z.object({
        body: updateContactSchema,
        query: z.object({}).strict(),
        params: contactIdSchema,
      }),
    ),
    updateContactController,
  );
  router.delete("/:id", contactRequest, deleteContactController);

  return router;
}

import type { Request, Response } from "express";
import { successResponse } from "../../shared/api.js";
import { getAuthContext } from "../auth/auth.middleware.js";
import {
  createContact,
  deleteContacts,
  getContact,
  getContactActivities,
  getContactDeals,
  getContactStats,
  getContactTasks,
  listCompanyOptions,
  listContacts,
  updateContact,
} from "./contacts.service.js";
import type {
  BulkDeleteContactsInput,
  CompanyOptionsQuery,
  ContactsQuery,
  CreateContactInput,
  UpdateContactInput,
} from "./contacts.schemas.js";

type ValidatedRequest = Request & {
  validated: {
    body?: unknown;
    params?: unknown;
    query?: unknown;
  };
};

const validated = (request: Request) => (request as ValidatedRequest).validated;
const ownerId = (request: Request) => getAuthContext(request).userId;
const recordId = (request: Request) => (validated(request).params as { id: string }).id;

export async function listContactsController(request: Request, response: Response) {
  const result = await listContacts(
    ownerId(request),
    validated(request).query as ContactsQuery,
  );
  response.json(successResponse(result.contacts, result.meta));
}

export async function getContactStatsController(request: Request, response: Response) {
  response.json(successResponse(await getContactStats(ownerId(request))));
}

export async function listCompanyOptionsController(
  request: Request,
  response: Response,
) {
  response.json(
    successResponse(
      await listCompanyOptions(
        ownerId(request),
        validated(request).query as CompanyOptionsQuery,
      ),
    ),
  );
}

export async function createContactController(request: Request, response: Response) {
  const contact = await createContact(
    ownerId(request),
    validated(request).body as CreateContactInput,
  );
  response.status(201).json(successResponse(contact));
}

export async function getContactController(request: Request, response: Response) {
  response.json(successResponse(await getContact(ownerId(request), recordId(request))));
}

export async function updateContactController(request: Request, response: Response) {
  const contact = await updateContact(
    ownerId(request),
    recordId(request),
    validated(request).body as UpdateContactInput,
  );
  response.json(successResponse(contact));
}

export async function deleteContactController(request: Request, response: Response) {
  const result = await deleteContacts(ownerId(request), [recordId(request)]);
  response.json(successResponse(result));
}

export async function bulkDeleteContactsController(
  request: Request,
  response: Response,
) {
  const input = validated(request).body as BulkDeleteContactsInput;
  const result = await deleteContacts(ownerId(request), input.ids);
  response.json(successResponse(result));
}

async function relatedController(
  request: Request,
  response: Response,
  lookup: (owner: string, id: string) => Promise<unknown>,
) {
  response.json(successResponse(await lookup(ownerId(request), recordId(request))));
}

export const getContactDealsController = (request: Request, response: Response) =>
  relatedController(request, response, getContactDeals);

export const getContactTasksController = (request: Request, response: Response) =>
  relatedController(request, response, getContactTasks);

export const getContactActivitiesController = (request: Request, response: Response) =>
  relatedController(request, response, getContactActivities);

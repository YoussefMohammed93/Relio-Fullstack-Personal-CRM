import type { Request, Response } from "express";
import { successResponse } from "../../shared/api.js";
import { getAuthContext } from "../auth/auth.middleware.js";
import {
  createCompany,
  createCompanyNote,
  deleteCompanies,
  findCompanyDuplicates,
  getCompany,
  getCompanyActivities,
  getCompanyContacts,
  getCompanyDeals,
  getCompanyNotes,
  getCompanyStats,
  listCompanies,
  updateCompany,
} from "./companies.service.js";
import type {
  BulkDeleteCompaniesInput,
  CompaniesQuery,
  CompanyDuplicateQuery,
  CreateCompanyInput,
  CreateCompanyNoteInput,
  UpdateCompanyInput,
} from "./companies.schemas.js";

type ValidatedRequest = Request & {
  validated: { body?: unknown; params?: unknown; query?: unknown };
};

const validated = (request: Request) => (request as ValidatedRequest).validated;
const ownerId = (request: Request) => getAuthContext(request).userId;
const recordId = (request: Request) => (validated(request).params as { id: string }).id;

export async function listCompaniesController(request: Request, response: Response) {
  const result = await listCompanies(
    ownerId(request),
    validated(request).query as CompaniesQuery,
  );
  response.json(successResponse(result.companies, result.meta));
}

export async function getCompanyStatsController(request: Request, response: Response) {
  response.json(successResponse(await getCompanyStats(ownerId(request))));
}

export async function findCompanyDuplicatesController(
  request: Request,
  response: Response,
) {
  response.json(
    successResponse(
      await findCompanyDuplicates(
        ownerId(request),
        validated(request).query as CompanyDuplicateQuery,
      ),
    ),
  );
}

export async function createCompanyController(request: Request, response: Response) {
  const company = await createCompany(
    ownerId(request),
    validated(request).body as CreateCompanyInput,
  );
  response.status(201).json(successResponse(company));
}

export async function getCompanyController(request: Request, response: Response) {
  response.json(successResponse(await getCompany(ownerId(request), recordId(request))));
}

export async function updateCompanyController(request: Request, response: Response) {
  const company = await updateCompany(
    ownerId(request),
    recordId(request),
    validated(request).body as UpdateCompanyInput,
  );
  response.json(successResponse(company));
}

export async function deleteCompanyController(request: Request, response: Response) {
  response.json(
    successResponse(await deleteCompanies(ownerId(request), [recordId(request)])),
  );
}

export async function bulkDeleteCompaniesController(
  request: Request,
  response: Response,
) {
  const input = validated(request).body as BulkDeleteCompaniesInput;
  response.json(successResponse(await deleteCompanies(ownerId(request), input.ids)));
}

async function relatedController(
  request: Request,
  response: Response,
  lookup: (owner: string, id: string) => Promise<unknown>,
) {
  response.json(successResponse(await lookup(ownerId(request), recordId(request))));
}

export const getCompanyContactsController = (request: Request, response: Response) =>
  relatedController(request, response, getCompanyContacts);
export const getCompanyDealsController = (request: Request, response: Response) =>
  relatedController(request, response, getCompanyDeals);
export const getCompanyActivitiesController = (request: Request, response: Response) =>
  relatedController(request, response, getCompanyActivities);
export const getCompanyNotesController = (request: Request, response: Response) =>
  relatedController(request, response, getCompanyNotes);

export async function createCompanyNoteController(
  request: Request,
  response: Response,
) {
  const note = await createCompanyNote(
    ownerId(request),
    recordId(request),
    validated(request).body as CreateCompanyNoteInput,
  );
  response.status(201).json(successResponse(note));
}

import { z } from "zod";
import { DEAL_LOST_REASONS } from "../../database/models/deal.js";

const objectIdSchema = z.string().regex(/^[\da-f]{24}$/i, "Invalid record ID");
const dealNameSchema = z.string().trim().min(1, "Deal name is required").max(160);
const dealValueSchema = z.number().finite().positive();
const probabilitySchema = z.number().finite().min(0).max(100);
const expectedDateSchema = z.iso.date().or(z.iso.datetime());

export const createDealSchema = z
  .object({
    name: dealNameSchema,
    value: dealValueSchema,
    primaryContact: objectIdSchema,
    company: objectIdSchema.nullable().optional(),
    pipelineStage: objectIdSchema,
    probability: probabilitySchema.optional(),
    expectedCloseDate: expectedDateSchema.nullable().optional(),
    description: z.string().trim().max(5000).optional(),
  })
  .strict();

export const updateDealSchema = z
  .object({
    name: dealNameSchema.optional(),
    value: dealValueSchema.optional(),
    primaryContact: objectIdSchema.optional(),
    company: objectIdSchema.nullable().optional(),
    pipelineStage: objectIdSchema.optional(),
    probability: probabilitySchema.optional(),
    expectedCloseDate: expectedDateSchema.nullable().optional(),
    description: z.string().trim().max(5000).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const dealsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
    status: z.enum(["open", "won", "lost"]).optional(),
    pipelineStage: objectIdSchema.optional(),
    primaryContact: objectIdSchema.optional(),
    company: objectIdSchema.optional(),
    valueMin: z.coerce.number().finite().min(0).optional(),
    valueMax: z.coerce.number().finite().min(0).optional(),
    dateFrom: z.iso.date().optional(),
    dateTo: z.iso.date().optional(),
    probabilityMin: z.coerce.number().finite().min(0).max(100).optional(),
    probabilityMax: z.coerce.number().finite().min(0).max(100).optional(),
    sortBy: z
      .enum(["name", "value", "createdAt", "expectedCloseDate", "probability"])
      .default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict()
  .refine(
    ({ valueMin, valueMax }) =>
      valueMin === undefined || valueMax === undefined || valueMin <= valueMax,
    "valueMin must be less than or equal to valueMax",
  )
  .refine(
    ({ dateFrom, dateTo }) => !dateFrom || !dateTo || dateFrom <= dateTo,
    "dateFrom must be before or equal to dateTo",
  )
  .refine(
    ({ probabilityMin, probabilityMax }) =>
      probabilityMin === undefined ||
      probabilityMax === undefined ||
      probabilityMin <= probabilityMax,
    "probabilityMin must be less than or equal to probabilityMax",
  );

export const dealIdSchema = z.object({ id: objectIdSchema }).strict();

const uniqueDealIds = z
  .array(objectIdSchema)
  .min(1)
  .max(100)
  .refine((ids) => new Set(ids).size === ids.length, "IDs must be unique");

export const bulkDeleteDealsSchema = z.object({ ids: uniqueDealIds }).strict();

export const bulkChangeDealStageSchema = z
  .object({ ids: uniqueDealIds, pipelineStage: objectIdSchema })
  .strict();

export const loseDealSchema = z
  .object({ lostReason: z.enum(DEAL_LOST_REASONS).optional() })
  .strict()
  .default({});

export const emptyDealActionSchema = z.object({}).strict().default({});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type DealsQuery = z.infer<typeof dealsQuerySchema>;
export type BulkDeleteDealsInput = z.infer<typeof bulkDeleteDealsSchema>;
export type BulkChangeDealStageInput = z.infer<typeof bulkChangeDealStageSchema>;
export type LoseDealInput = z.infer<typeof loseDealSchema>;

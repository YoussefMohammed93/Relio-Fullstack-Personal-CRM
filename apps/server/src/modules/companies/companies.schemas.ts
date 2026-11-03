import { z } from "zod";

const objectIdSchema = z.string().regex(/^[\da-f]{24}$/i, "Invalid record ID");

export const COMPANY_INDUSTRIES = [
  "technology",
  "finance",
  "healthcare",
  "education",
  "marketing",
  "e_commerce",
  "real_estate",
  "manufacturing",
  "consulting",
  "other",
] as const;

export const COMPANY_SIZES = [
  "self_employed",
  "1_10",
  "11_50",
  "51_200",
  "201_500",
  "501_1000",
  "1000_plus",
] as const;

const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .max(2048)
    .refine(
      (value) => !value || /^https?:\/\/\S+$/i.test(value),
      `${label} must be an HTTP or HTTPS URL`,
    );

const addressSchema = z
  .object({
    street: z.string().trim().max(160).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    postalCode: z.string().trim().max(30).optional(),
    country: z.string().trim().max(100).optional(),
  })
  .strict();

const companyFields = {
  name: z.string().trim().min(1, "Company name is required").max(160),
  website: optionalUrl("Website"),
  industry: z.enum(COMPANY_INDUSTRIES).or(z.literal("")),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .refine((value) => !value || z.email().safeParse(value).success, "Invalid email"),
  phone: z.string().trim().max(40),
  address: addressSchema,
  description: z.string().trim().max(5000),
  companySize: z.enum(COMPANY_SIZES).or(z.literal("")),
  annualRevenue: z.number().finite().nonnegative().nullable(),
  linkedInUrl: optionalUrl("LinkedIn URL"),
  logoUrl: optionalUrl("Logo URL"),
};

export const createCompanySchema = z
  .object({
    name: companyFields.name,
    website: companyFields.website.optional(),
    industry: companyFields.industry.optional(),
    email: companyFields.email.optional(),
    phone: companyFields.phone.optional(),
    address: companyFields.address.optional(),
    description: companyFields.description.optional(),
    companySize: companyFields.companySize.optional(),
    annualRevenue: companyFields.annualRevenue.optional(),
    linkedInUrl: companyFields.linkedInUrl.optional(),
    logoUrl: companyFields.logoUrl.optional(),
  })
  .strict();

export const updateCompanySchema = createCompanySchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const companiesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
    industry: z.enum(COMPANY_INDUSTRIES).optional(),
    companySize: z.enum(COMPANY_SIZES).optional(),
    minContacts: z.coerce.number().int().min(0).optional(),
    maxContacts: z.coerce.number().int().min(0).optional(),
    dateFrom: z.iso.date().optional(),
    dateTo: z.iso.date().optional(),
    sortBy: z.enum(["name", "recentlyAdded", "dealValue"]).default("recentlyAdded"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict()
  .refine(
    ({ dateFrom, dateTo }) => !dateFrom || !dateTo || dateFrom <= dateTo,
    "dateFrom must be before or equal to dateTo",
  )
  .refine(
    ({ minContacts, maxContacts }) =>
      minContacts === undefined ||
      maxContacts === undefined ||
      minContacts <= maxContacts,
    "minContacts must be less than or equal to maxContacts",
  );

export const companyIdSchema = z.object({ id: objectIdSchema }).strict();

export const companyDuplicateQuerySchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    excludeId: objectIdSchema.optional(),
  })
  .strict();

export const bulkDeleteCompaniesSchema = z
  .object({ ids: z.array(objectIdSchema).min(1).max(100) })
  .strict()
  .refine(
    (value) => new Set(value.ids).size === value.ids.length,
    "IDs must be unique",
  );

export const createCompanyNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    content: z.string().trim().max(5000).optional(),
  })
  .strict();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CompaniesQuery = z.infer<typeof companiesQuerySchema>;
export type CompanyDuplicateQuery = z.infer<typeof companyDuplicateQuerySchema>;
export type BulkDeleteCompaniesInput = z.infer<typeof bulkDeleteCompaniesSchema>;
export type CreateCompanyNoteInput = z.infer<typeof createCompanyNoteSchema>;

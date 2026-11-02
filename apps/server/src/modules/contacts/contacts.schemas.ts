import { z } from "zod";

const objectIdSchema = z.string().regex(/^[\da-f]{24}$/i, "Invalid record ID");
const contactTypes = ["lead", "client", "former_client", "partner"] as const;

const contactFields = {
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .refine((value) => !value || z.email().safeParse(value).success, "Invalid email"),
  phone: z.string().trim().max(40),
  company: z.union([objectIdSchema, z.null()]),
  contactType: z.enum(contactTypes),
  jobTitle: z.string().trim().max(120),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  website: z
    .string()
    .trim()
    .max(2048)
    .refine(
      (value) => !value || /^https?:\/\/\S+$/i.test(value),
      "Website must be an HTTP or HTTPS URL",
    ),
  notes: z.string().trim().max(5000),
};

export const createContactSchema = z
  .object({
    firstName: contactFields.firstName,
    lastName: contactFields.lastName,
    email: contactFields.email.optional(),
    phone: contactFields.phone.optional(),
    company: contactFields.company.optional(),
    contactType: contactFields.contactType.optional(),
    jobTitle: contactFields.jobTitle.optional(),
    tags: contactFields.tags.optional(),
    website: contactFields.website.optional(),
    notes: contactFields.notes.optional(),
  })
  .strict();

export const updateContactSchema = z
  .object({
    firstName: contactFields.firstName.optional(),
    lastName: contactFields.lastName.optional(),
    email: contactFields.email.optional(),
    phone: contactFields.phone.optional(),
    company: contactFields.company.optional(),
    contactType: contactFields.contactType.optional(),
    jobTitle: contactFields.jobTitle.optional(),
    tags: contactFields.tags.optional(),
    website: contactFields.website.optional(),
    notes: contactFields.notes.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const contactsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
    contactType: z.enum(contactTypes).optional(),
    company: objectIdSchema.optional(),
    tag: z.string().trim().min(1).max(40).optional(),
    dateFrom: z.iso.date().optional(),
    dateTo: z.iso.date().optional(),
    sortBy: z.enum(["name", "recentlyAdded", "lastActivity"]).default("recentlyAdded"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict()
  .refine(
    ({ dateFrom, dateTo }) => !dateFrom || !dateTo || dateFrom <= dateTo,
    "dateFrom must be before or equal to dateTo",
  );

export const contactIdSchema = z.object({ id: objectIdSchema }).strict();

export const companyOptionsQuerySchema = z
  .object({ search: z.string().trim().max(100).optional() })
  .strict();

export const bulkDeleteContactsSchema = z
  .object({ ids: z.array(objectIdSchema).min(1).max(100) })
  .strict()
  .refine(
    (value) => new Set(value.ids).size === value.ids.length,
    "IDs must be unique",
  );

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactsQuery = z.infer<typeof contactsQuerySchema>;
export type CompanyOptionsQuery = z.infer<typeof companyOptionsQuerySchema>;
export type BulkDeleteContactsInput = z.infer<typeof bulkDeleteContactsSchema>;

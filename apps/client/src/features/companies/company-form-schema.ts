import { z } from "zod";
import { COMPANY_INDUSTRIES, COMPANY_SIZES } from "./companies.api";

export const companyFormSchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(160),
  website: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https?:\/\/\S+$/i.test(value),
      "Use an HTTP or HTTPS URL",
    )
    .max(2048),
  industry: z
    .enum(COMPANY_INDUSTRIES.map(({ value }) => value) as [string, ...string[]])
    .or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address").or(z.literal("")),
  phone: z.string().trim().max(40),
  address: z.object({
    street: z.string().trim().max(160),
    city: z.string().trim().max(100),
    state: z.string().trim().max(100),
    postalCode: z.string().trim().max(30),
    country: z.string().trim().max(100),
  }),
  description: z.string().trim().max(5000),
  companySize: z
    .enum(COMPANY_SIZES.map(({ value }) => value) as [string, ...string[]])
    .or(z.literal("")),
  annualRevenue: z.number().finite().nonnegative().nullable(),
  linkedInUrl: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https?:\/\/\S+$/i.test(value),
      "Use an HTTP or HTTPS URL",
    )
    .max(2048),
  logoUrl: z.string(),
});

export type CompanyFormValues = z.infer<typeof companyFormSchema>;

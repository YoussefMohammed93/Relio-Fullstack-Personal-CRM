import { z } from "zod";
import type { ContactType } from "./contacts.api";

export const contactFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().email("Enter a valid email address").or(z.literal("")),
  phone: z.string().trim().max(40),
  company: z.string().nullable(),
  contactType: z.enum(["lead", "client", "former_client", "partner"]),
  jobTitle: z.string().trim().max(120),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  website: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https?:\/\/\S+$/i.test(value),
      "Use an HTTP or HTTPS URL",
    )
    .max(2048),
  notes: z.string().trim().max(5000),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const CONTACT_TYPE_OPTIONS: { value: ContactType; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "client", label: "Client" },
  { value: "former_client", label: "Former client" },
  { value: "partner", label: "Partner" },
];

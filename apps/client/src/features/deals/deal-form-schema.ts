import { z } from "zod";

export const dealFormSchema = z.object({
  name: z.string().trim().min(1, "Deal name is required.").max(160),
  value: z.number().finite().positive("Deal value must be greater than zero."),
  primaryContact: z.string().min(1, "Choose a primary contact."),
  company: z.string().nullable(),
  pipelineStage: z.string().min(1, "Choose a pipeline stage."),
  probability: z
    .number()
    .finite()
    .min(0, "Probability must be at least 0%.")
    .max(100, "Probability cannot exceed 100%.")
    .optional(),
  expectedCloseDate: z.string(),
  description: z.string().trim().max(5000),
});

export type DealFormValues = z.infer<typeof dealFormSchema>;

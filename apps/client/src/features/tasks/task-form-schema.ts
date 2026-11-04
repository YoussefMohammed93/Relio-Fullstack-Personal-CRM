import { z } from "zod";

export const taskFormSchema = z
  .object({
    title: z.string().trim().min(1, "A title is required.").max(160),
    description: z.string().trim().max(5000),
    type: z.enum(["task", "follow_up"]),
    status: z.enum(["todo", "in_progress", "completed", "cancelled"]),
    priority: z.enum(["low", "medium", "high"]),
    dueDate: z.string(),
    dueTime: z.string(),
    relatedEntityType: z.enum(["", "Contact", "Company", "Deal"]),
    relatedEntityId: z.string(),
  })
  .superRefine((values, context) => {
    if (Boolean(values.relatedEntityType) !== Boolean(values.relatedEntityId)) {
      context.addIssue({
        code: "custom",
        path: ["relatedEntityId"],
        message: "Choose both a related entity and record, or clear both.",
      });
    }
  });

export type TaskFormValues = z.infer<typeof taskFormSchema>;

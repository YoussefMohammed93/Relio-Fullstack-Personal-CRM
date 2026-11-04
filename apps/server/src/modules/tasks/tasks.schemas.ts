import { z } from "zod";

const objectIdSchema = z.string().regex(/^[\da-f]{24}$/i, "Invalid record ID");
const taskTitleSchema = z.string().trim().min(1, "Task title is required").max(160);
const taskTypeSchema = z.enum(["task", "follow_up"]);
const taskStatusSchema = z.enum(["todo", "in_progress", "completed", "cancelled"]);
const taskPrioritySchema = z.enum(["low", "medium", "high"]);
const dueDateSchema = z.iso.date().or(z.iso.datetime());

export const createTaskSchema = z
  .object({
    title: taskTitleSchema,
    description: z.string().trim().max(5000).optional(),
    type: taskTypeSchema.default("task"),
    status: taskStatusSchema.default("todo"),
    priority: taskPrioritySchema.default("medium"),
    dueDate: dueDateSchema.nullable().optional(),
    dueTime: z
      .string()
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:MM time")
      .nullable()
      .optional(),
    relatedEntityType: z.enum(["Contact", "Company", "Deal"]).nullable().optional(),
    relatedEntityId: objectIdSchema.nullable().optional(),
  })
  .strict()
  .refine(
    (task) =>
      ((task.relatedEntityType ?? null) === null) ===
      ((task.relatedEntityId ?? null) === null),
    {
      path: ["relatedEntityId"],
      message: "Choose both a related entity type and record",
    },
  );

export const updateTaskSchema = z
  .object({
    title: taskTitleSchema.optional(),
    description: z.string().trim().max(5000).optional(),
    type: taskTypeSchema.optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: dueDateSchema.nullable().optional(),
    dueTime: z
      .string()
      .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:MM time")
      .nullable()
      .optional(),
    relatedEntityType: z.enum(["Contact", "Company", "Deal"]).nullable().optional(),
    relatedEntityId: objectIdSchema.nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required")
  .refine(
    (value) =>
      (value.relatedEntityType === undefined) === (value.relatedEntityId === undefined),
    {
      path: ["relatedEntityId"],
      message: "Update the related entity type and record together",
    },
  );

export const tasksQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).max(100_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    type: taskTypeSchema.optional(),
    dueDateFilter: z.enum(["overdue", "today", "upcoming", "no_date"]).optional(),
    dueDateFrom: z.iso.date().optional(),
    dueDateTo: z.iso.date().optional(),
    relatedEntityType: z.enum(["Contact", "Company", "Deal"]).optional(),
    relatedEntityId: objectIdSchema.optional(),
    sortBy: z.enum(["dueDate", "priority", "createdAt"]).default("dueDate"),
    sortDirection: z.enum(["asc", "desc"]).default("asc"),
  })
  .strict()
  .refine(
    ({ dueDateFrom, dueDateTo }) =>
      !dueDateFrom || !dueDateTo || dueDateFrom <= dueDateTo,
    "dueDateFrom must be before or equal to dueDateTo",
  )
  .refine(
    ({ relatedEntityId, relatedEntityType }) => !relatedEntityId || !!relatedEntityType,
    "relatedEntityType is required with relatedEntityId",
  );

export const taskIdSchema = z.object({ id: objectIdSchema }).strict();

const uniqueTaskIds = z
  .array(objectIdSchema)
  .min(1)
  .max(100)
  .refine((ids) => new Set(ids).size === ids.length, "IDs must be unique");

export const bulkDeleteTasksSchema = z.object({ ids: uniqueTaskIds }).strict();
export const bulkCompleteTasksSchema = z.object({ ids: uniqueTaskIds }).strict();
export const bulkChangeTaskPrioritySchema = z
  .object({ ids: uniqueTaskIds, priority: taskPrioritySchema })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TasksQuery = z.infer<typeof tasksQuerySchema>;
export type BulkDeleteTasksInput = z.infer<typeof bulkDeleteTasksSchema>;
export type BulkCompleteTasksInput = z.infer<typeof bulkCompleteTasksSchema>;
export type BulkChangeTaskPriorityInput = z.infer<typeof bulkChangeTaskPrioritySchema>;

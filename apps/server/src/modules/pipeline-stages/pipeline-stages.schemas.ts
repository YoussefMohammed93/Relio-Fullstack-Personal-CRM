import { z } from "zod";

const objectIdSchema = z.string().regex(/^[\da-f]{24}$/i, "Invalid record ID");
const stageNameSchema = z.string().trim().min(1, "Stage name is required").max(60);
const stageColorSchema = z
  .string()
  .regex(/^#[\da-fA-F]{6}$/, "Use a six-digit hex color");

export const createPipelineStageSchema = z
  .object({ name: stageNameSchema, color: stageColorSchema })
  .strict();

export const updatePipelineStageSchema = z
  .object({ name: stageNameSchema.optional(), color: stageColorSchema.optional() })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export const reorderPipelineStagesSchema = z
  .object({ stageIds: z.array(objectIdSchema).min(1).max(100) })
  .strict()
  .refine(
    ({ stageIds }) => new Set(stageIds).size === stageIds.length,
    "Stage IDs must be unique",
  );

export const deletePipelineStageSchema = z
  .object({ replacementStageId: objectIdSchema.optional() })
  .strict()
  .default({});

export const pipelineStageIdSchema = z.object({ id: objectIdSchema }).strict();

export type CreatePipelineStageInput = z.infer<typeof createPipelineStageSchema>;
export type UpdatePipelineStageInput = z.infer<typeof updatePipelineStageSchema>;
export type ReorderPipelineStagesInput = z.infer<typeof reorderPipelineStagesSchema>;
export type DeletePipelineStageInput = z.infer<typeof deletePipelineStageSchema>;

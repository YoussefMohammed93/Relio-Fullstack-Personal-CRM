import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { validateRequest } from "../../middleware/validate-request.js";
import {
  bulkChangeTaskPrioritySchema,
  bulkCompleteTasksSchema,
  bulkDeleteTasksSchema,
  createTaskSchema,
  taskIdSchema,
  tasksQuerySchema,
  updateTaskSchema,
} from "./tasks.schemas.js";
import {
  bulkChangeTaskPriorityController,
  bulkCompleteTasksController,
  bulkDeleteTasksController,
  createTaskController,
  deleteTaskController,
  getTaskController,
  listTasksController,
  updateTaskController,
} from "./tasks.controller.js";

const emptyBody = z.unknown();
const emptyParams = z.unknown();
const emptyQuery = z.object({}).strict();

export function createTasksRouter(requireAuthentication: RequestHandler) {
  const router = Router();
  router.use(requireAuthentication);

  router.post(
    "/bulk-delete",
    validateRequest(
      z.object({ body: bulkDeleteTasksSchema, query: emptyQuery, params: emptyParams }),
    ),
    bulkDeleteTasksController,
  );
  router.post(
    "/bulk-complete",
    validateRequest(
      z.object({
        body: bulkCompleteTasksSchema,
        query: emptyQuery,
        params: emptyParams,
      }),
    ),
    bulkCompleteTasksController,
  );
  router.post(
    "/bulk-priority",
    validateRequest(
      z.object({
        body: bulkChangeTaskPrioritySchema,
        query: emptyQuery,
        params: emptyParams,
      }),
    ),
    bulkChangeTaskPriorityController,
  );
  router.get(
    "/",
    validateRequest(
      z.object({ body: emptyBody, query: tasksQuerySchema, params: emptyParams }),
    ),
    listTasksController,
  );
  router.post(
    "/",
    validateRequest(
      z.object({ body: createTaskSchema, query: emptyQuery, params: emptyParams }),
    ),
    createTaskController,
  );

  const taskRequest = (body: z.ZodType = emptyBody) =>
    validateRequest(z.object({ body, query: emptyQuery, params: taskIdSchema }));
  router.get("/:id", taskRequest(), getTaskController);
  router.patch("/:id", taskRequest(updateTaskSchema), updateTaskController);
  router.delete("/:id", taskRequest(), deleteTaskController);

  return router;
}

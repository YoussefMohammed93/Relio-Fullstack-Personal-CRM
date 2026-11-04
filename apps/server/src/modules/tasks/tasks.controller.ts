import type { Request, Response } from "express";
import { successResponse } from "../../shared/api.js";
import { getAuthContext } from "../auth/auth.middleware.js";
import {
  changeTasksPriority,
  completeTasks,
  createTask,
  deleteTasks,
  getTask,
  listTasks,
  updateTask,
} from "./tasks.service.js";
import type {
  BulkChangeTaskPriorityInput,
  BulkCompleteTasksInput,
  BulkDeleteTasksInput,
  CreateTaskInput,
  TasksQuery,
  UpdateTaskInput,
} from "./tasks.schemas.js";

type ValidatedRequest = Request & {
  validated: { body?: unknown; params?: unknown; query?: unknown };
};

const validated = (request: Request) => (request as ValidatedRequest).validated;
const ownerId = (request: Request) => getAuthContext(request).userId;
const recordId = (request: Request) => (validated(request).params as { id: string }).id;

export async function listTasksController(request: Request, response: Response) {
  const result = await listTasks(
    ownerId(request),
    validated(request).query as TasksQuery,
  );
  response.json(successResponse(result.tasks, result.meta));
}

export async function createTaskController(request: Request, response: Response) {
  const task = await createTask(
    ownerId(request),
    validated(request).body as CreateTaskInput,
  );
  response.status(201).json(successResponse(task));
}

export async function getTaskController(request: Request, response: Response) {
  response.json(successResponse(await getTask(ownerId(request), recordId(request))));
}

export async function updateTaskController(request: Request, response: Response) {
  const task = await updateTask(
    ownerId(request),
    recordId(request),
    validated(request).body as UpdateTaskInput,
  );
  response.json(successResponse(task));
}

export async function deleteTaskController(request: Request, response: Response) {
  response.json(
    successResponse(await deleteTasks(ownerId(request), [recordId(request)])),
  );
}

export async function bulkDeleteTasksController(request: Request, response: Response) {
  response.json(
    successResponse(
      await deleteTasks(
        ownerId(request),
        (validated(request).body as BulkDeleteTasksInput).ids,
      ),
    ),
  );
}

export async function bulkCompleteTasksController(
  request: Request,
  response: Response,
) {
  response.json(
    successResponse(
      await completeTasks(
        ownerId(request),
        (validated(request).body as BulkCompleteTasksInput).ids,
      ),
    ),
  );
}

export async function bulkChangeTaskPriorityController(
  request: Request,
  response: Response,
) {
  const input = validated(request).body as BulkChangeTaskPriorityInput;
  response.json(
    successResponse(
      await changeTasksPriority(ownerId(request), input.ids, input.priority),
    ),
  );
}

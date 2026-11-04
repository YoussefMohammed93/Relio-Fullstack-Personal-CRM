import mongoose from "mongoose";
import { Company } from "../../database/models/company.js";
import { Contact } from "../../database/models/contact.js";
import { Deal } from "../../database/models/deal.js";
import { Task, type ITask } from "../../database/models/task.js";
import { relationshipIntegrity } from "../../database/relationship-integrity.js";
import { NotFoundError, ValidationError } from "../../errors/AppError.js";
import { buildPaginationMeta } from "../../shared/api.js";
import { buildFilterQuery } from "../../shared/query.js";
import type { CreateTaskInput, TasksQuery, UpdateTaskInput } from "./tasks.schemas.js";

type RelatedEntityType = NonNullable<ITask["relatedEntityType"]>;
type TaskRecord = Record<string, unknown>;
type RelatedEntityView = { type: RelatedEntityType; id: string; label: string };

function objectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function dateRange(from?: string, to?: string) {
  if (!from && !to) return undefined;
  const until = to ? new Date(`${to}T00:00:00.000Z`) : undefined;
  until?.setUTCDate(until.getUTCDate() + 1);
  return {
    ...(from ? { $gte: new Date(`${from}T00:00:00.000Z`) } : {}),
    ...(until ? { $lt: until } : {}),
  };
}

function taskFilters(ownerId: mongoose.Types.ObjectId, filters: TasksQuery) {
  const match: Record<string, unknown> = {
    owner: ownerId,
    ...buildFilterQuery(
      {
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        type: filters.type,
        relatedEntityType: filters.relatedEntityType,
        relatedEntityId: filters.relatedEntityId
          ? objectId(filters.relatedEntityId)
          : undefined,
      },
      {
        allowedFields: [
          "status",
          "priority",
          "type",
          "relatedEntityType",
          "relatedEntityId",
        ],
        searchFields: ["title", "description"],
      },
    ),
  };
  const dueDate = dateRange(filters.dueDateFrom, filters.dueDateTo);
  if (dueDate) match.dueDate = dueDate;
  if (filters.dueDateFilter) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    if (filters.dueDateFilter === "overdue") {
      match.dueDate = { $lt: today };
      match.status = { $in: ["todo", "in_progress"] };
    } else if (filters.dueDateFilter === "today") {
      match.dueDate = { $gte: today, $lt: tomorrow };
    } else if (filters.dueDateFilter === "upcoming") {
      match.dueDate = { $gte: tomorrow };
    } else {
      match.dueDate = null;
    }
  }
  return match;
}

function toTaskView(task: TaskRecord, relatedEntity: RelatedEntityView | null) {
  return {
    id: String(task._id),
    title: String(task.title ?? ""),
    description: String(task.description ?? ""),
    type: task.type as ITask["type"],
    status: task.status as ITask["status"],
    priority: task.priority as ITask["priority"],
    dueDate: (task.dueDate as Date | null | undefined) ?? null,
    dueTime: String(task.dueTime ?? ""),
    relatedEntity,
    reminderAt: (task.reminderAt as Date | null | undefined) ?? null,
    completedAt: (task.completedAt as Date | null | undefined) ?? null,
    createdAt: task.createdAt as Date,
    updatedAt: task.updatedAt as Date,
  };
}

async function relatedEntityViews(
  tasks: readonly TaskRecord[],
  ownerId: mongoose.Types.ObjectId,
) {
  const references = tasks.flatMap((task) =>
    task.relatedEntityType && task.relatedEntityId
      ? [
          {
            type: task.relatedEntityType as RelatedEntityType,
            id: String(task.relatedEntityId),
          },
        ]
      : [],
  );
  const idsFor = (type: RelatedEntityType) =>
    references
      .filter((reference) => reference.type === type)
      .map(({ id }) => objectId(id));
  const [contacts, companies, deals] = await Promise.all([
    Contact.find({ owner: ownerId, _id: { $in: idsFor("Contact") } })
      .select("firstName lastName")
      .lean(),
    Company.find({ owner: ownerId, _id: { $in: idsFor("Company") } })
      .select("name")
      .lean(),
    Deal.find({ owner: ownerId, _id: { $in: idsFor("Deal") } })
      .select("name")
      .lean(),
  ]);
  const labels = new Map<string, string>();
  for (const contact of contacts) {
    labels.set(
      `Contact:${String(contact._id)}`,
      `${contact.firstName} ${contact.lastName}`.trim(),
    );
  }
  for (const company of companies)
    labels.set(`Company:${String(company._id)}`, company.name);
  for (const deal of deals) labels.set(`Deal:${String(deal._id)}`, deal.name);
  return tasks.map((task) => {
    const type = task.relatedEntityType as RelatedEntityType | null | undefined;
    const id = task.relatedEntityId ? String(task.relatedEntityId) : "";
    const label = type && id ? labels.get(`${type}:${id}`) : undefined;
    return toTaskView(task, type && id && label ? { type, id, label } : null);
  });
}

function taskInputToDocument(input: CreateTaskInput | UpdateTaskInput) {
  return {
    ...input,
    ...(input.dueDate !== undefined
      ? { dueDate: input.dueDate ? new Date(input.dueDate) : null }
      : {}),
    ...(input.dueTime !== undefined ? { dueTime: input.dueTime ?? "" } : {}),
    ...(input.relatedEntityType !== undefined
      ? { relatedEntityType: input.relatedEntityType }
      : {}),
    ...(input.relatedEntityId !== undefined
      ? {
          relatedEntityId: input.relatedEntityId
            ? objectId(input.relatedEntityId)
            : null,
        }
      : {}),
  };
}

async function assertTaskReferences(
  ownerId: mongoose.Types.ObjectId,
  type: RelatedEntityType | null | undefined,
  id: mongoose.Types.ObjectId | null | undefined,
) {
  if (!type && !id) return;
  if (!type || !id) {
    throw new ValidationError(
      "Related entity type and record must be provided together",
    );
  }
  await relationshipIntegrity.assertOwnedReferences(ownerId, [{ type, id }]);
}

async function loadOwnedTasks(ownerId: mongoose.Types.ObjectId, ids: string[]) {
  const taskIds = ids.map(objectId);
  const tasks = await Task.find({ owner: ownerId, _id: { $in: taskIds } });
  if (tasks.length !== taskIds.length) throw new NotFoundError("Task not found");
  return tasks;
}

export async function listTasks(owner: string, filters: TasksQuery) {
  const ownerId = objectId(owner);
  const match = taskFilters(ownerId, filters);
  const direction: 1 | -1 = filters.sortDirection === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> =
    filters.sortBy === "priority"
      ? { priorityOrder: direction, _id: 1 as const }
      : { [filters.sortBy]: direction, _id: 1 as const };
  const pipeline: mongoose.PipelineStage[] = [
    { $match: match },
    ...(filters.sortBy === "priority"
      ? [
          {
            $addFields: {
              priorityOrder: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$priority", "low"] }, then: 0 },
                    { case: { $eq: ["$priority", "medium"] }, then: 1 },
                    { case: { $eq: ["$priority", "high"] }, then: 2 },
                  ],
                  default: 3,
                },
              },
            },
          } satisfies mongoose.PipelineStage,
        ]
      : []),
    { $sort: sort },
    { $skip: (filters.page - 1) * filters.limit },
    { $limit: filters.limit },
  ];
  const [tasks, total] = await Promise.all([
    Task.aggregate<TaskRecord>(pipeline),
    Task.countDocuments(match),
  ]);
  return {
    tasks: await relatedEntityViews(tasks, ownerId),
    meta: buildPaginationMeta({ page: filters.page, limit: filters.limit, total }),
  };
}

export async function getTask(owner: string, id: string) {
  const ownerId = objectId(owner);
  const task = await Task.findOne({ _id: objectId(id), owner: ownerId }).lean();
  if (!task) throw new NotFoundError("Task not found");
  const [view] = await relatedEntityViews([task as unknown as TaskRecord], ownerId);
  return view;
}

export async function createTask(owner: string, input: CreateTaskInput) {
  const ownerId = objectId(owner);
  const relatedEntityId = input.relatedEntityId
    ? objectId(input.relatedEntityId)
    : null;
  await assertTaskReferences(ownerId, input.relatedEntityType, relatedEntityId);
  const task = new Task({ owner: ownerId, ...taskInputToDocument(input) });
  await task.save();
  return getTask(owner, String(task._id));
}

export async function updateTask(owner: string, id: string, input: UpdateTaskInput) {
  const ownerId = objectId(owner);
  const task = await Task.findOne({ _id: objectId(id), owner: ownerId });
  if (!task) throw new NotFoundError("Task not found");
  const nextType =
    input.relatedEntityType ??
    (input.relatedEntityType === null ? null : task.relatedEntityType);
  const nextId =
    input.relatedEntityId === undefined
      ? task.relatedEntityId
      : input.relatedEntityId
        ? objectId(input.relatedEntityId)
        : null;
  await assertTaskReferences(ownerId, nextType, nextId);
  task.set(taskInputToDocument(input));
  await task.save();
  return getTask(owner, id);
}

export async function deleteTasks(owner: string, ids: string[]) {
  const ownerId = objectId(owner);
  const tasks = await loadOwnedTasks(ownerId, ids);
  await Task.deleteMany({
    _id: { $in: tasks.map((task) => task._id) },
    owner: ownerId,
  });
  return { deletedCount: tasks.length };
}

export async function completeTasks(owner: string, ids: string[]) {
  const tasks = await loadOwnedTasks(objectId(owner), ids);
  for (const task of tasks) {
    task.status = "completed";
    await task.save();
  }
  return { completedCount: tasks.length };
}

export async function changeTasksPriority(
  owner: string,
  ids: string[],
  priority: ITask["priority"],
) {
  const tasks = await loadOwnedTasks(objectId(owner), ids);
  for (const task of tasks) {
    task.priority = priority;
    await task.save();
  }
  return { changedCount: tasks.length };
}

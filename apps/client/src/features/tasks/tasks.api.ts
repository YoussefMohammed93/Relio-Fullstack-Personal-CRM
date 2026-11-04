export type TaskType = "task" | "follow_up";
export type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";
export type RelatedEntityType = "Contact" | "Company" | "Deal";

export interface TaskInput {
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  dueTime: string | null;
  relatedEntityType: RelatedEntityType | null;
  relatedEntityId: string | null;
}

export interface TaskRecord extends TaskInput {
  id: string;
  relatedEntity: { type: RelatedEntityType; id: string; label: string } | null;
  reminderAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListParams {
  page: number;
  limit: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  dueDateFilter?: "overdue" | "today" | "upcoming" | "no_date";
  dueDateFrom?: string;
  dueDateTo?: string;
  relatedEntityType?: RelatedEntityType;
  sortBy: "dueDate" | "priority" | "createdAt";
  sortDirection: "asc" | "desc";
}

export interface TaskPage {
  data: TaskRecord[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: { message: string } | null;
  meta?: TaskPage["meta"];
}

export class TaskApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "TaskApiError";
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const envelope = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !envelope.success || envelope.data === null) {
    throw new TaskApiError(
      envelope.error?.message ?? "The request could not be completed.",
      response.status,
    );
  }
  return envelope.data;
}

function queryString(params: object) {
  const query = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(params)) {
    const value = rawValue as string | number | undefined;
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return query.toString();
}

function sendJson<T>(path: string, method: string, body: unknown) {
  return request<T>(path, { method, body: JSON.stringify(body) });
}

export const tasksApi = {
  async list(params: TaskListParams): Promise<TaskPage> {
    const response = await fetch(`${apiBaseUrl}/tasks?${queryString(params)}`, {
      credentials: "include",
    });
    const envelope = (await response.json()) as ApiEnvelope<TaskRecord[]>;
    if (!response.ok || !envelope.success || !envelope.data) {
      throw new TaskApiError(
        envelope.error?.message ?? "Tasks could not be loaded.",
        response.status,
      );
    }
    return {
      data: envelope.data,
      meta: envelope.meta ?? {
        page: params.page,
        limit: params.limit,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  },
  get: (id: string) => request<TaskRecord>(`/tasks/${id}`),
  create: (input: TaskInput) => sendJson<TaskRecord>("/tasks", "POST", input),
  update: (id: string, input: Partial<TaskInput>) =>
    sendJson<TaskRecord>(`/tasks/${id}`, "PATCH", input),
  delete: (id: string) =>
    sendJson<{ deletedCount: number }>(`/tasks/${id}`, "DELETE", {}),
  bulkDelete: (ids: string[]) =>
    sendJson<{ deletedCount: number }>("/tasks/bulk-delete", "POST", { ids }),
  bulkComplete: (ids: string[]) =>
    sendJson<{ completedCount: number }>("/tasks/bulk-complete", "POST", { ids }),
  bulkPriority: (ids: string[], priority: TaskPriority) =>
    sendJson<{ changedCount: number }>("/tasks/bulk-priority", "POST", {
      ids,
      priority,
    }),
};

import type { Contact, ContactInput } from "@/features/contacts/contacts.api";
import { contactsApi } from "@/features/contacts/contacts.api";

export const DEAL_LOST_REASONS = [
  { value: "price", label: "Price" },
  { value: "competitor", label: "Competitor" },
  { value: "no_response", label: "No response" },
  { value: "not_interested", label: "Not interested" },
  { value: "budget_issues", label: "Budget issues" },
  { value: "other", label: "Other" },
] as const;

export type DealLostReason = (typeof DEAL_LOST_REASONS)[number]["value"];
export type DealStatus = "open" | "won" | "lost";

export interface DealStage {
  id: string;
  name: string;
  color: string;
  defaultProbability: number | null;
  order: number;
  isDefault: boolean;
}

export interface DealInput {
  name: string;
  value: number;
  primaryContact: string;
  company: string | null;
  pipelineStage: string;
  probability?: number;
  expectedCloseDate: string | null;
  description: string;
}

export interface Deal extends Omit<
  DealInput,
  "primaryContact" | "company" | "pipelineStage" | "probability"
> {
  id: string;
  currency: string;
  primaryContact: {
    id: string;
    name: string;
    email: string;
  } | null;
  company: { id: string; name: string } | null;
  pipelineStage: DealStage | null;
  probability: number | null;
  status: DealStatus;
  lostReason: DealLostReason | null;
  actualCloseDate: string | null;
  lostDate: string | null;
  finalValue: number | null;
  previousStage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealListParams {
  page: number;
  limit: number;
  search?: string;
  status?: DealStatus;
  pipelineStage?: string;
  primaryContact?: string;
  company?: string;
  valueMin?: number;
  valueMax?: number;
  dateFrom?: string;
  dateTo?: string;
  probabilityMin?: number;
  probabilityMax?: number;
  sortBy: "name" | "value" | "createdAt" | "expectedCloseDate" | "probability";
  sortDirection: "asc" | "desc";
}

export interface DealPage {
  data: Deal[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface DealStats {
  totalDeals: number;
  activeDeals: number;
  pipelineValue: number;
  wonRevenue: number;
  lostDeals: number;
}

export interface DealActivity {
  id: string;
  type: "note" | "call" | "email" | "meeting";
  title: string;
  content: string;
  activityDate: string;
  scheduledAt: string | null;
  source: "Deal" | "Primary Contact" | "Deal and Primary Contact";
}

export interface DealTask {
  id: string;
  title: string;
  type: "task" | "follow_up";
  status: "todo" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  dueTime: string;
  createdAt: string;
}

export interface DealHistoryEvent {
  id: string;
  eventType:
    "created" | "stage_changed" | "value_changed" | "won" | "lost" | "reopened";
  previousValue: number | null;
  newValue: number | null;
  previousStage: string | null;
  newStage: string | null;
  eventDate: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: { message: string } | null;
  meta?: DealPage["meta"];
}

export class DealApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "DealApiError";
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
    throw new DealApiError(
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

export const dealsApi = {
  async list(params: DealListParams): Promise<DealPage> {
    const response = await fetch(`${apiBaseUrl}/deals?${queryString(params)}`, {
      credentials: "include",
    });
    const envelope = (await response.json()) as ApiEnvelope<Deal[]>;
    if (!response.ok || !envelope.success || !envelope.data) {
      throw new DealApiError(
        envelope.error?.message ?? "Deals could not be loaded.",
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
  board: (params: DealListParams) =>
    request<Deal[]>(`/deals/board?${queryString(params)}`),
  stats: () => request<DealStats>("/deals/stats"),
  stages: () => request<DealStage[]>("/pipeline-stages"),
  get: (id: string) => request<Deal>(`/deals/${id}`),
  activities: (id: string) => request<DealActivity[]>(`/deals/${id}/activities`),
  tasks: (id: string) => request<DealTask[]>(`/deals/${id}/tasks`),
  history: (id: string) => request<DealHistoryEvent[]>(`/deals/${id}/history`),
  create: (input: DealInput) => sendJson<Deal>("/deals", "POST", input),
  update: (id: string, input: Partial<DealInput>) =>
    sendJson<Deal>(`/deals/${id}`, "PATCH", input),
  delete: (id: string) =>
    sendJson<{ deletedCount: number }>(`/deals/${id}`, "DELETE", {}),
  bulkDelete: (ids: string[]) =>
    sendJson<{ deletedCount: number }>("/deals/bulk-delete", "POST", { ids }),
  bulkStage: (ids: string[], pipelineStage: string) =>
    sendJson<{ changedCount: number }>("/deals/bulk-stage", "POST", {
      ids,
      pipelineStage,
    }),
  stage: (id: string, pipelineStage: string) =>
    sendJson<Deal>(`/deals/${id}`, "PATCH", { pipelineStage }),
  win: (id: string) => sendJson<Deal>(`/deals/${id}/won`, "POST", {}),
  lose: (id: string, lostReason?: DealLostReason) =>
    sendJson<Deal>(`/deals/${id}/lost`, "POST", lostReason ? { lostReason } : {}),
  reopen: (id: string) => sendJson<Deal>(`/deals/${id}/reopen`, "POST", {}),
  contactOptions: async (search: string, signal?: AbortSignal) => {
    const result = await contactsApi.list(
      {
        page: 1,
        limit: 20,
        search,
        sortBy: "name",
        sortDirection: "asc",
      },
      signal,
    );
    return result.data;
  },
  companyOptions: contactsApi.companyOptions,
  createContact: (input: ContactInput): Promise<Contact> => contactsApi.create(input),
};

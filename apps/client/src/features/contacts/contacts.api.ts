export type ContactType = "lead" | "client" | "former_client" | "partner";

export interface ContactInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string | null;
  contactType?: ContactType;
  jobTitle?: string;
  tags?: string[];
  website?: string;
  notes?: string;
}

export interface Contact extends Required<Omit<ContactInput, "company">> {
  id: string;
  company: { id: string; name: string } | null;
  dealsCount: number;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactListParams {
  page: number;
  limit: number;
  search?: string;
  contactType?: ContactType;
  company?: string;
  tag?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy: "name" | "recentlyAdded" | "lastActivity";
  sortDirection: "asc" | "desc";
}

export interface ContactPage {
  data: Contact[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ContactStats {
  total: number;
  byType: Record<ContactType, number>;
}

export interface ContactDeal {
  id: string;
  name: string;
  value: number;
  status: "open" | "won" | "lost";
  expectedCloseDate: string | null;
  createdAt: string;
  company: { id: string; name: string } | null;
}

export interface ContactTask {
  id: string;
  title: string;
  type: "task" | "follow_up";
  status: "todo" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  dueTime: string;
  createdAt: string;
}

export interface ContactActivity {
  id: string;
  type: "note" | "call" | "email" | "meeting";
  title: string;
  content: string;
  activityDate: string;
  scheduledAt: string | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: { message: string } | null;
  meta?: ContactPage["meta"];
}

export class ContactApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ContactApiError";
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
    throw new ContactApiError(
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

export const contactsApi = {
  async list(params: ContactListParams): Promise<ContactPage> {
    const query = queryString(params);
    const response = await fetch(`${apiBaseUrl}/contacts?${query}`, {
      credentials: "include",
    });
    const envelope = (await response.json()) as ApiEnvelope<Contact[]>;
    if (!response.ok || !envelope.success || !envelope.data) {
      throw new ContactApiError(
        envelope.error?.message ?? "Contacts could not be loaded.",
        response.status,
      );
    }
    return { data: envelope.data, meta: envelope.meta ?? emptyMeta(params) };
  },
  stats: () => request<ContactStats>("/contacts/stats"),
  companyOptions: (search: string, signal?: AbortSignal) =>
    request<{ id: string; name: string }[]>(
      `/contacts/company-options?${queryString({ search })}`,
      { signal },
    ),
  get: (id: string) => request<Contact>(`/contacts/${id}`),
  deals: (id: string) => request<ContactDeal[]>(`/contacts/${id}/deals`),
  tasks: (id: string) => request<ContactTask[]>(`/contacts/${id}/tasks`),
  activities: (id: string) => request<ContactActivity[]>(`/contacts/${id}/activities`),
  create: (input: ContactInput) => sendJson<Contact>("/contacts", "POST", input),
  update: (id: string, input: ContactInput) =>
    sendJson<Contact>(`/contacts/${id}`, "PATCH", input),
  delete: (id: string) =>
    sendJson<{ deletedCount: number }>(`/contacts/${id}`, "DELETE", {}),
  bulkDelete: (ids: string[]) =>
    sendJson<{ deletedCount: number }>("/contacts/bulk-delete", "POST", { ids }),
};

function emptyMeta(params: ContactListParams): ContactPage["meta"] {
  return {
    page: params.page,
    limit: params.limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };
}

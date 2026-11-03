export const COMPANY_INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "marketing", label: "Marketing" },
  { value: "e_commerce", label: "E-commerce" },
  { value: "real_estate", label: "Real Estate" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
] as const;

export const COMPANY_SIZES = [
  { value: "self_employed", label: "Self-employed" },
  { value: "1_10", label: "1–10 Employees" },
  { value: "11_50", label: "11–50 Employees" },
  { value: "51_200", label: "51–200 Employees" },
  { value: "201_500", label: "201–500 Employees" },
  { value: "501_1000", label: "501–1000 Employees" },
  { value: "1000_plus", label: "1000+ Employees" },
] as const;

export type CompanyIndustry = (typeof COMPANY_INDUSTRIES)[number]["value"];
export type CompanySize = (typeof COMPANY_SIZES)[number]["value"];

export interface CompanyInput {
  name: string;
  website: string;
  industry: CompanyIndustry | "";
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  description: string;
  companySize: CompanySize | "";
  annualRevenue: number | null;
  linkedInUrl: string;
  logoUrl: string;
}

export interface Company extends CompanyInput {
  id: string;
  contactsCount: number;
  activeDeals: number;
  totalDealValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyListParams {
  page: number;
  limit: number;
  search?: string;
  industry?: CompanyIndustry;
  companySize?: CompanySize;
  minContacts?: number;
  maxContacts?: number;
  dateFrom?: string;
  dateTo?: string;
  sortBy: "name" | "recentlyAdded" | "dealValue";
  sortDirection: "asc" | "desc";
}

export interface CompanyPage {
  data: Company[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CompanyStats {
  totalCompanies: number;
  totalContacts: number;
  activeDeals: number;
  totalDealValue: number;
}

export interface CompanyContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactType: "lead" | "client" | "former_client" | "partner";
  jobTitle: string;
  createdAt: string;
}

export interface CompanyDeal {
  id: string;
  name: string;
  value: number;
  status: "open" | "won" | "lost";
  expectedCloseDate: string | null;
  createdAt: string;
  primaryContact: { id: string; name: string } | null;
}

export interface CompanyActivity {
  id: string;
  type: "note" | "call" | "email" | "meeting";
  title: string;
  content: string;
  activityDate: string;
  source: { type: "Company" | "Contact" | "Deal"; name: string };
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: { message: string } | null;
  meta?: CompanyPage["meta"];
}

export class CompanyApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CompanyApiError";
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api/v1";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "content-type": "application/json" }
        : {}),
      ...init.headers,
    },
  });
  const envelope = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !envelope.success || envelope.data === null) {
    throw new CompanyApiError(
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

export const companiesApi = {
  async list(params: CompanyListParams): Promise<CompanyPage> {
    const response = await fetch(`${apiBaseUrl}/companies?${queryString(params)}`, {
      credentials: "include",
    });
    const envelope = (await response.json()) as ApiEnvelope<Company[]>;
    if (!response.ok || !envelope.success || !envelope.data) {
      throw new CompanyApiError(
        envelope.error?.message ?? "Companies could not be loaded.",
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
  stats: () => request<CompanyStats>("/companies/stats"),
  duplicates: (name: string, excludeId?: string) =>
    request<{ id: string; name: string; logoUrl: string }[]>(
      `/companies/duplicate-check?${queryString({ name, excludeId })}`,
    ),
  get: (id: string) => request<Company>(`/companies/${id}`),
  contacts: (id: string) => request<CompanyContact[]>(`/companies/${id}/contacts`),
  deals: (id: string) => request<CompanyDeal[]>(`/companies/${id}/deals`),
  activities: (id: string) => request<CompanyActivity[]>(`/companies/${id}/activities`),
  notes: (id: string) => request<CompanyActivity[]>(`/companies/${id}/notes`),
  create: (input: CompanyInput) => sendJson<Company>("/companies", "POST", input),
  update: (id: string, input: CompanyInput) =>
    sendJson<Company>(`/companies/${id}`, "PATCH", input),
  delete: (id: string) =>
    sendJson<{ deletedCount: number }>(`/companies/${id}`, "DELETE", {}),
  bulkDelete: (ids: string[]) =>
    sendJson<{ deletedCount: number }>("/companies/bulk-delete", "POST", { ids }),
  createNote: (id: string, input: { title: string; content: string }) =>
    sendJson<CompanyActivity>(`/companies/${id}/notes`, "POST", input),
  async uploadLogo(file: File) {
    const body = new FormData();
    body.append("logo", file);
    return request<{ secureUrl: string }>("/uploads/company-logo", {
      method: "POST",
      body,
    });
  },
};

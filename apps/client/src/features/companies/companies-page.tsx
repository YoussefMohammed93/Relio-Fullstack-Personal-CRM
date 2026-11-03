import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CalendarDays,
  Download,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  UsersRound,
  BriefcaseBusiness,
  DollarSign,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@/components/data-table";
import { DropdownMenu } from "@/components/dropdown-menu";
import type { MenuEntry } from "@/components/menu-list";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { PillSelect } from "@/components/pill-select";
import { SearchInput } from "@/components/search-input";
import { Skeleton } from "@/components/skeleton";
import { useNotifications } from "@/providers/notification-provider";
import { CompanyFormSheet } from "./company-form-sheet";
import {
  COMPANY_INDUSTRIES,
  COMPANY_SIZES,
  companiesApi,
  CompanyApiError,
  type Company,
  type CompanyIndustry,
  type CompanyInput,
  type CompanyListParams,
  type CompanySize,
} from "./companies.api";

const industryLabel = Object.fromEntries(
  COMPANY_INDUSTRIES.map(({ value, label }) => [value, label]),
);
const sizeLabel = Object.fromEntries(
  COMPANY_SIZES.map(({ value, label }) => [value, label]),
);
const industryOptions = [
  { value: "all", label: "All industries" },
  ...COMPANY_INDUSTRIES,
];
const sizeOptions = [{ value: "all", label: "All sizes" }, ...COMPANY_SIZES];
const sortFields: Record<string, CompanyListParams["sortBy"]> = {
  name: "name",
  added: "recentlyAdded",
  dealValue: "dealValue",
};

function formattedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function currency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function downloadSelectedCsv(companies: Company[]) {
  const headers = [
    "Company",
    "Industry",
    "Company Size",
    "Contacts",
    "Active Deals",
    "Total Deal Value USD",
    "Added Date",
    "Website",
    "Email",
    "Phone",
  ];
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = companies.map((company) => [
    company.name,
    industryLabel[company.industry] ?? company.industry,
    sizeLabel[company.companySize] ?? company.companySize,
    company.contactsCount,
    company.activeDeals,
    company.totalDealValue,
    company.createdAt,
    company.website,
    company.email,
    company.phone,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "relio-companies.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function CompanyLogo({
  company,
  size = "md",
}: {
  company: Company;
  size?: "sm" | "md";
}) {
  const name = company.name.trim();
  return (
    <Avatar
      name={`${name.slice(0, 1)} ${name.slice(1, 2)}`.trim().toUpperCase()}
      aria-label={company.name}
      src={company.logoUrl || undefined}
      size={size}
      shape="square"
    />
  );
}

function CompaniesLoading({ view }: { view: "table" | "grid" }) {
  return (
    <section
      role="status"
      aria-label="Loading companies"
      aria-busy="true"
      className="flex min-w-0 flex-col gap-5"
    >
      <header className="mb-1 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton width={150} height={30} />
          <Skeleton width={240} height={14} />
        </div>
        <Skeleton shape="block" width={132} height={38} className="rounded-md" />
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex min-h-24 min-w-0 items-center gap-3 rounded-md border border-border bg-card p-3.5"
          >
            <Skeleton shape="block" width={36} height={36} className="rounded-md" />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton width="45%" height={18} />
              <Skeleton width="75%" height={12} />
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton shape="block" width={240} height={36} className="rounded-md" />
          <Skeleton shape="block" width={122} height={32} className="rounded-full" />
          <Skeleton shape="block" width={126} height={32} className="rounded-full" />
          <Skeleton shape="block" width={176} height={36} className="rounded-md" />
          <Skeleton shape="block" width={108} height={36} className="rounded-md" />
          <Skeleton shape="block" width={76} height={36} className="rounded-full" />
        </div>
        <Skeleton width={210} height={12} />
      </div>
      {view === "table" ? (
        <div className="@container min-w-0 overflow-hidden rounded-md border border-border">
          <div className="hidden h-10 items-center gap-4 border-b border-border bg-muted/40 px-3 @min-[34rem]:grid @min-[34rem]:grid-cols-[32px_minmax(150px,1.5fr)_minmax(90px,1fr)_minmax(80px,1fr)_64px_80px_96px_80px_32px]">
            {Array.from({ length: 9 }, (_, index) => (
              <Skeleton key={index} width={index === 1 ? "65%" : "75%"} height={12} />
            ))}
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="border-b border-border px-3 last:border-b-0">
              <div className="hidden min-h-12 items-center gap-4 @min-[34rem]:grid @min-[34rem]:grid-cols-[32px_minmax(150px,1.5fr)_minmax(90px,1fr)_minmax(80px,1fr)_64px_80px_96px_80px_32px]">
                <Skeleton shape="block" width={16} height={16} className="rounded-sm" />
                <span className="flex min-w-0 items-center gap-3">
                  <Skeleton
                    shape="block"
                    width={30}
                    height={30}
                    className="rounded-md"
                  />
                  <Skeleton width="65%" height={14} />
                </span>
                {Array.from({ length: 7 }, (_, cell) => (
                  <Skeleton
                    key={cell}
                    width={cell === 6 ? 20 : "70%"}
                    height={13}
                    className={cell === 6 ? "justify-self-end" : ""}
                  />
                ))}
              </div>
              <div className="flex min-h-20 items-center gap-3 @min-[34rem]:hidden">
                <Skeleton shape="block" width={16} height={16} className="rounded-sm" />
                <Skeleton shape="block" width={40} height={40} className="rounded-md" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton width="55%" height={14} />
                  <Skeleton width="35%" height={12} />
                </span>
                <Skeleton width={48} height={14} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="flex min-h-36 items-start gap-3 border-b border-border p-4 sm:rounded-md sm:border sm:bg-card"
            >
              <Skeleton shape="block" width={16} height={16} className="rounded-sm" />
              <Skeleton shape="block" width={40} height={40} className="rounded-md" />
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton width="60%" height={14} />
                <Skeleton width="40%" height={12} />
                <Skeleton width="80%" height={12} className="mt-3" />
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <Skeleton width={120} height={12} />
        <span className="flex gap-2">
          <Skeleton shape="block" width={32} height={32} className="rounded-md" />
          <Skeleton shape="block" width={32} height={32} className="rounded-md" />
        </span>
      </div>
    </section>
  );
}

export function CompaniesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [companySize, setCompanySize] = useState("all");
  const [minContacts, setMinContacts] = useState("");
  const [maxContacts, setMaxContacts] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<DataTableSort>({ key: "added", dir: "desc" });
  const [view, setView] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const params: CompanyListParams = {
    page,
    limit: 10,
    ...(search ? { search } : {}),
    ...(industry !== "all" ? { industry: industry as CompanyIndustry } : {}),
    ...(companySize !== "all" ? { companySize: companySize as CompanySize } : {}),
    ...(minContacts !== "" ? { minContacts: Number(minContacts) } : {}),
    ...(maxContacts !== "" ? { maxContacts: Number(maxContacts) } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    sortBy: sortFields[sort.key] ?? "recentlyAdded",
    sortDirection: sort.dir,
  };
  const companiesQuery = useQuery({
    queryKey: ["companies", params],
    queryFn: () => companiesApi.list(params),
  });
  const statsQuery = useQuery({
    queryKey: ["companies", "stats"],
    queryFn: companiesApi.stats,
  });
  const companies = companiesQuery.data?.data ?? [];
  const meta = companiesQuery.data?.meta;

  useEffect(
    () => setSelectedIds([]),
    [
      page,
      search,
      industry,
      companySize,
      minContacts,
      maxContacts,
      dateFrom,
      dateTo,
      sort,
    ],
  );

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CompanyInput }) =>
      id ? companiesApi.update(id, input) : companiesApi.create(input),
    onSuccess: async (_company, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      setFormOpen(false);
      setEditing(null);
      notify({
        title: variables.id ? "Company updated" : "Company created",
        variant: "success",
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      ids.length === 1 ? companiesApi.delete(ids[0]) : companiesApi.bulkDelete(ids),
    onSuccess: async (_result, ids) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companies"] }),
        queryClient.invalidateQueries({ queryKey: ["contacts"] }),
      ]);
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      setDeleteIds([]);
      notify({
        title: ids.length === 1 ? "Company deleted" : `${ids.length} companies deleted`,
        variant: "success",
      });
    },
  });

  const openEdit = (company: Company) => {
    setEditing(company);
    setFormOpen(true);
  };
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const onSortChange = (next: DataTableSort | null) => {
    if (next) {
      setSort(next);
      setPage(1);
    }
  };

  if (companiesQuery.isLoading) return <CompaniesLoading view={view} />;

  const columns: DataTableColumn<Company>[] = [
    {
      key: "name",
      header: "Company",
      sortable: true,
      searchable: true,
      width: "minmax(210px,1.5fr)",
      value: (company) => company.name,
      cell: (company) => (
        <span className="flex min-w-0 items-center gap-3">
          <CompanyLogo company={company} size="sm" />
          <span className="min-w-0 truncate font-medium">{company.name}</span>
        </span>
      ),
      card: "title",
    },
    {
      key: "industry",
      header: "Industry",
      value: (company) => industryLabel[company.industry] ?? company.industry,
      cell: (company) => industryLabel[company.industry] ?? "—",
      card: "subtitle",
    },
    {
      key: "size",
      header: "Company size",
      value: (company) => sizeLabel[company.companySize] ?? company.companySize,
      cell: (company) => sizeLabel[company.companySize] ?? "—",
      card: "hidden",
    },
    {
      key: "contacts",
      header: "Contacts",
      value: (company) => company.contactsCount,
      cell: (company) => company.contactsCount,
      align: "right",
      card: "hidden",
    },
    {
      key: "activeDeals",
      header: "Active deals",
      value: (company) => company.activeDeals,
      cell: (company) => company.activeDeals,
      align: "right",
      card: "trailing",
    },
    {
      key: "dealValue",
      header: "Deal value",
      sortable: true,
      value: (company) => company.totalDealValue,
      cell: (company) => currency(company.totalDealValue),
      align: "right",
      card: "hidden",
    },
    {
      key: "added",
      header: "Added",
      sortable: true,
      value: (company) => company.createdAt,
      cell: (company) => formattedDate(company.createdAt),
      card: "hidden",
    },
    {
      key: "actions",
      header: "Actions",
      width: "64px",
      cell: (company) => {
        const actions: MenuEntry[] = [
          {
            id: "open",
            label: "Open profile",
            icon: <Building2 aria-hidden="true" />,
            onSelect: () => navigate(`/app/companies/${company.id}`),
          },
          {
            id: "edit",
            label: "Edit company",
            icon: <Pencil aria-hidden="true" />,
            onSelect: () => openEdit(company),
          },
          {
            id: "delete",
            label: "Delete company",
            icon: <Trash2 aria-hidden="true" />,
            onSelect: () => setDeleteIds([company.id]),
          },
        ];
        return (
          <DropdownMenu
            label={`Actions for ${company.name}`}
            items={actions}
            trigger={
              <button
                type="button"
                aria-label={`Actions for ${company.name}`}
                title="Company actions"
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <MoreHorizontal className="size-4" />
              </button>
            }
          />
        );
      },
      card: "hidden",
    },
  ];

  const stats = statsQuery.data;
  const statCards = [
    {
      label: "Total companies",
      value: stats?.totalCompanies,
      icon: Building2,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Total contacts",
      value: stats?.totalContacts,
      icon: UsersRound,
      tone: "bg-info/10 text-info",
    },
    {
      label: "Active deals",
      value: stats?.activeDeals,
      icon: BriefcaseBusiness,
      tone: "bg-success/10 text-success",
    },
    {
      label: "Total deal value",
      value: stats ? currency(stats.totalDealValue) : undefined,
      icon: DollarSign,
      tone: "bg-warning/20 text-warning-foreground",
    },
  ];
  const hasFilters =
    industry !== "all" ||
    companySize !== "all" ||
    minContacts ||
    maxContacts ||
    dateFrom ||
    dateTo;

  return (
    <section className="flex min-w-0 flex-col gap-5">
      <PageHeader title="Companies" description="The organizations behind your work.">
        <Button onClick={openCreate} icon={<Plus />}>
          Add company
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex min-h-24 min-w-0 items-center gap-3 rounded-md border border-border bg-card p-3.5"
          >
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-md ${tone}`}
            >
              <Icon aria-hidden="true" className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-lg font-semibold tabular-nums">
                {statsQuery.isLoading ? "—" : (value ?? 0)}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {label}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-52 flex-1 sm:max-w-sm">
            <SearchInput
              aria-label="Search companies"
              placeholder="Search companies"
              onSearch={(value) => {
                setSearch(value.trim());
                setPage(1);
              }}
            />
          </div>
          <PillSelect
            label="Filter by industry"
            options={industryOptions}
            value={industry}
            onValueChange={(value) => {
              setIndustry(value);
              setPage(1);
            }}
            size="sm"
          />
          <PillSelect
            label="Filter by company size"
            options={sizeOptions}
            value={companySize}
            onValueChange={(value) => {
              setCompanySize(value);
              setPage(1);
            }}
            size="sm"
          />
          <div className="flex items-center gap-1.5">
            <Input
              aria-label="Minimum contacts"
              type="number"
              min={0}
              size="sm"
              value={minContacts}
              onValueChange={(value) => {
                setMinContacts(value);
                setPage(1);
              }}
              placeholder="Min contacts"
              inputClassName="w-20"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              aria-label="Maximum contacts"
              type="number"
              min={0}
              size="sm"
              value={maxContacts}
              onValueChange={(value) => {
                setMaxContacts(value);
                setPage(1);
              }}
              placeholder="Max contacts"
              inputClassName="w-20"
            />
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <label className="sr-only" htmlFor="company-date-from">
              Added from
            </label>
            <input
              id="company-date-from"
              type="date"
              aria-label="Added from"
              max={dateTo || undefined}
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="h-9 w-full min-w-0 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-36"
            />
            <span className="hidden text-xs text-muted-foreground sm:inline">to</span>
            <label className="sr-only" htmlFor="company-date-to">
              Added to
            </label>
            <input
              id="company-date-to"
              type="date"
              aria-label="Added to"
              min={dateFrom || undefined}
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              className="h-9 w-full min-w-0 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-36"
            />
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full border border-border p-0.5">
            <button
              type="button"
              aria-label="Table view"
              aria-pressed={view === "table"}
              title="Table view"
              onClick={() => setView("table")}
              className={`grid size-8 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${view === "table" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              title="Grid view"
              onClick={() => setView("grid")}
              className={`grid size-8 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${view === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          <span>Added date and contact count</span>
          {hasFilters ? (
            <button
              type="button"
              className="ml-1 font-medium text-primary hover:underline"
              onClick={() => {
                setIndustry("all");
                setCompanySize("all");
                setMinContacts("");
                setMaxContacts("");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {selectedIds.length ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/50 px-3 py-2">
          <p className="text-sm font-medium">{selectedIds.length} selected</p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Download />}
              onClick={() =>
                downloadSelectedCsv(
                  companies.filter((company) => selectedIds.includes(company.id)),
                )
              }
            >
              Export selected
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              icon={<Trash2 />}
              onClick={() => setDeleteIds(selectedIds)}
            >
              Delete selected
            </Button>
          </div>
        </div>
      ) : null}

      {companiesQuery.isError ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-md border border-destructive/30 p-4"
        >
          <p className="text-sm text-destructive">
            {companiesQuery.error instanceof CompanyApiError &&
            companiesQuery.error.status === 401
              ? "Your session has expired. Sign in again to view companies."
              : "Companies could not be loaded."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void companiesQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          scene={search ? "search" : "inbox"}
          title={
            search || hasFilters ? "No matching companies" : "Your companies start here"
          }
          description={
            search || hasFilters
              ? "Try a different search or clear the filters."
              : "Add the organizations you work with to keep their people and opportunities connected."
          }
          action={
            search || hasFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setIndustry("all");
                  setCompanySize("all");
                  setMinContacts("");
                  setMaxContacts("");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button onClick={openCreate} icon={<Plus />}>
                Add company
              </Button>
            )
          }
        />
      ) : view === "table" ? (
        <DataTable
          label="Companies"
          noun={["company", "companies"]}
          columns={columns}
          rows={companies}
          getRowId={(company) => company.id}
          rowLabel={(company) => company.name}
          searchable={false}
          selectable
          selected={selectedIds}
          onSelectedChange={setSelectedIds}
          sort={sort}
          onSortChange={onSortChange}
          pageSize={100}
          renderDetail={(company) => (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {company.contactsCount} contacts · {company.activeDeals} active deals ·{" "}
                {currency(company.totalDealValue)}
              </span>
              <Link
                to={`/app/companies/${company.id}`}
                className="inline-flex min-h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Open profile
              </Link>
            </div>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => {
            const selected = selectedIds.includes(company.id);
            const actions: MenuEntry[] = [
              {
                id: "edit",
                label: "Edit company",
                icon: <Pencil />,
                onSelect: () => openEdit(company),
              },
              {
                id: "delete",
                label: "Delete company",
                icon: <Trash2 />,
                onSelect: () => setDeleteIds([company.id]),
              },
            ];
            return (
              <article
                key={company.id}
                className="min-w-0 border-b border-border p-4 sm:rounded-md sm:border sm:bg-card"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${company.name}`}
                    checked={selected}
                    onChange={() =>
                      setSelectedIds((current) =>
                        selected
                          ? current.filter((id) => id !== company.id)
                          : [...current, company.id],
                      )
                    }
                    className="mt-1 size-4 accent-primary"
                  />
                  <CompanyLogo company={company} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/app/companies/${company.id}`}
                      className="block truncate font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {company.name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {industryLabel[company.industry] ?? "Industry not set"}
                    </p>
                  </div>
                  <DropdownMenu
                    label={`Actions for ${company.name}`}
                    items={actions}
                    trigger={
                      <button
                        type="button"
                        aria-label={`Actions for ${company.name}`}
                        title="Company actions"
                        className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    }
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 pl-7">
                  {company.companySize ? (
                    <Badge tone="neutral" size="sm">
                      {sizeLabel[company.companySize] ?? company.companySize}
                    </Badge>
                  ) : null}
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-xs text-primary hover:underline"
                    >
                      Website
                    </a>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-3 pl-7 text-xs">
                  <div>
                    <p className="text-muted-foreground">Contacts</p>
                    <p className="mt-1 font-medium">{company.contactsCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Active deals</p>
                    <p className="mt-1 font-medium">{company.activeDeals}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deal value</p>
                    <p className="mt-1 truncate font-medium">
                      {currency(company.totalDealValue)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {meta && meta.total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Showing {(meta.page - 1) * meta.limit + 1}–
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
          </p>
          <Pagination
            page={meta.page}
            pageCount={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      ) : null}

      <CompanyFormSheet
        open={formOpen}
        company={editing}
        onOpenChange={setFormOpen}
        onSave={async (input) => {
          await saveMutation.mutateAsync({ id: editing?.id, input });
        }}
      />
      <ConfirmationDialog
        open={deleteIds.length > 0}
        onOpenChange={(open) => {
          if (!open) setDeleteIds([]);
        }}
        title={
          deleteIds.length > 1 ? "Delete selected companies?" : "Delete this company?"
        }
        description="Contacts and deals will be retained and unlinked. Historical activities and deal history will remain."
        confirmLabel="Delete"
        tone="destructive"
        errorMessage="The selected companies could not be deleted."
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(deleteIds);
          } catch (error) {
            notify({
              title: error instanceof Error ? error.message : "Delete failed",
              variant: "error",
            });
            throw error;
          }
        }}
      />
    </section>
  );
}

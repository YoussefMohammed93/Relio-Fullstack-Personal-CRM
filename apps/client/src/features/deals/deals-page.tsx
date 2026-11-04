import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Download,
  DollarSign,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Trophy,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Combobox, type ComboboxOption } from "@/components/combobox";
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
import {
  KanbanBoard,
  type KanbanCard,
  type KanbanColumn,
} from "@/components/kanban-board";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { PillSelect } from "@/components/pill-select";
import { SearchInput } from "@/components/search-input";
import { Skeleton } from "@/components/skeleton";
import { useNotifications } from "@/providers/notification-provider";
import {
  dealsApi,
  DealApiError,
  type Deal,
  type DealListParams,
  type DealLostReason,
  type DealStage,
} from "./deals.api";
import { DEAL_LOST_REASONS } from "./deals.api";
import { DealFormSheet } from "./deal-form-sheet";

type BoardDeal = Deal & KanbanCard;

const sortFields: Record<string, DealListParams["sortBy"]> = {
  name: "name",
  value: "value",
  added: "createdAt",
  expectedCloseDate: "expectedCloseDate",
  probability: "probability",
};

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

function currency(value: number, currencyCode = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}

function formattedDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function downloadDealsCsv(deals: Deal[]) {
  const headers = [
    "Deal",
    "Primary Contact",
    "Company",
    "Value USD",
    "Stage",
    "Probability",
    "Expected Close Date",
    "Status",
  ];
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const rows = deals.map((deal) => [
    deal.name,
    deal.primaryContact?.name ?? "",
    deal.company?.name ?? "",
    deal.value,
    deal.pipelineStage?.name ?? "",
    deal.probability ?? "",
    deal.expectedCloseDate ?? "",
    deal.status,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "relio-deals.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function DealsLoading({ view }: { view: "table" | "board" }) {
  return (
    <section
      role="status"
      aria-label="Loading deals"
      aria-busy="true"
      className="flex min-w-0 flex-col gap-5"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton width={112} height={30} />
          <Skeleton width={250} height={14} />
        </div>
        <Skeleton shape="block" width={122} height={36} className="rounded-md" />
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex min-h-20 items-center gap-3 border-b border-border p-3 sm:rounded-md sm:border sm:bg-card"
          >
            <Skeleton shape="block" width={34} height={34} className="rounded-md" />
            <span className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton width="44%" height={17} />
              <Skeleton width="72%" height={12} />
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton shape="block" width={250} height={36} className="rounded-md" />
        <Skeleton shape="block" width={116} height={28} className="rounded-full" />
        <Skeleton shape="block" width={110} height={28} className="rounded-full" />
        <Skeleton shape="block" width={72} height={32} className="rounded-full" />
      </div>
      {view === "table" ? (
        <div className="overflow-hidden rounded-md border border-border">
          <div className="grid h-10 grid-cols-[minmax(160px,1.4fr)_minmax(120px,1fr)_minmax(100px,1fr)_90px_90px] items-center gap-4 border-b border-border px-3">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} width="68%" height={12} />
            ))}
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="grid min-h-14 grid-cols-[minmax(160px,1.4fr)_minmax(120px,1fr)_minmax(100px,1fr)_90px_90px] items-center gap-4 border-b border-border px-3 last:border-0"
            >
              {Array.from({ length: 5 }, (_, cell) => (
                <Skeleton key={cell} width={cell === 0 ? "72%" : "52%"} height={13} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-w-0 gap-3 overflow-hidden">
          {Array.from({ length: 4 }, (_, column) => (
            <div
              key={column}
              className="flex min-w-60 flex-1 flex-col gap-3 rounded-md border border-border bg-muted/30 p-3"
            >
              <Skeleton width="55%" height={16} />
              <Skeleton width="36%" height={12} />
              {Array.from({ length: 3 }, (_, card) => (
                <Skeleton
                  key={card}
                  shape="block"
                  width="100%"
                  height={92}
                  className="rounded-md"
                />
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <Skeleton width={120} height={12} />
        <Skeleton shape="block" width={100} height={32} className="rounded-md" />
      </div>
    </section>
  );
}

function statCards(stats: {
  totalDeals: number;
  activeDeals: number;
  pipelineValue: number;
  wonRevenue: number;
  lostDeals: number;
}) {
  return [
    {
      label: "Total deals",
      value: stats.totalDeals,
      icon: BriefcaseBusiness,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Active deals",
      value: stats.activeDeals,
      icon: TrendingUp,
      tone: "bg-info/10 text-info",
    },
    {
      label: "Pipeline value",
      value: currency(stats.pipelineValue),
      icon: DollarSign,
      tone: "bg-warning/20 text-warning-foreground",
    },
    {
      label: "Won revenue",
      value: currency(stats.wonRevenue),
      icon: Trophy,
      tone: "bg-success/10 text-success",
    },
    {
      label: "Lost deals",
      value: stats.lostDeals,
      icon: XCircle,
      tone: "bg-destructive/10 text-destructive",
    },
  ];
}

export function DealsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [stageId, setStageId] = useState("all");
  const [contact, setContact] = useState<ComboboxOption | null>(null);
  const [company, setCompany] = useState<ComboboxOption | null>(null);
  const [valueMin, setValueMin] = useState("");
  const [valueMax, setValueMax] = useState("");
  const [probabilityMin, setProbabilityMin] = useState("");
  const [probabilityMax, setProbabilityMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<DataTableSort>({ key: "added", dir: "desc" });
  const [view, setView] = useState<"table" | "board">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [initialStage, setInitialStage] = useState<DealStage | null>(null);
  const [initialName, setInitialName] = useState("");
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [closeTarget, setCloseTarget] = useState<{
    deal: Deal;
    status: "won" | "lost";
  } | null>(null);
  const [lostReason, setLostReason] = useState<DealLostReason | "none">("none");
  const [bulkStage, setBulkStage] = useState("");
  const [boardCards, setBoardCards] = useState<BoardDeal[]>([]);
  const pendingBoardClose = useRef<{
    deal: Deal;
    status: "won" | "lost";
    resolve: () => void;
    reject: (error: Error) => void;
  } | null>(null);

  const params = {
    page,
    limit: 10,
    ...(search ? { search } : {}),
    ...(status !== "all" ? { status: status as Deal["status"] } : {}),
    ...(stageId !== "all" ? { pipelineStage: stageId } : {}),
    ...(contact ? { primaryContact: contact.value } : {}),
    ...(company ? { company: company.value } : {}),
    ...(valueMin ? { valueMin: Number(valueMin) } : {}),
    ...(valueMax ? { valueMax: Number(valueMax) } : {}),
    ...(probabilityMin ? { probabilityMin: Number(probabilityMin) } : {}),
    ...(probabilityMax ? { probabilityMax: Number(probabilityMax) } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    sortBy: sortFields[sort.key] ?? "createdAt",
    sortDirection: sort.dir,
  } as const;
  const boardParams = { ...params, page: 1, limit: 100 };
  const dealsQuery = useQuery({
    queryKey: ["deals", "list", params],
    queryFn: () => dealsApi.list(params),
    enabled: view === "table",
  });
  const boardQuery = useQuery({
    queryKey: ["deals", "board", boardParams],
    queryFn: () => dealsApi.board(boardParams),
    enabled: view === "board",
  });
  const statsQuery = useQuery({
    queryKey: ["deals", "stats"],
    queryFn: dealsApi.stats,
  });
  const stagesQuery = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: dealsApi.stages,
  });
  const deals = dealsQuery.data?.data ?? [];
  const meta = dealsQuery.data?.meta;
  const stages = [...(stagesQuery.data ?? [])].sort((a, b) => a.order - b.order);

  useEffect(() => {
    setSelectedIds([]);
  }, [
    page,
    search,
    status,
    stageId,
    contact,
    company,
    valueMin,
    valueMax,
    probabilityMin,
    probabilityMax,
    dateFrom,
    dateTo,
    sort,
  ]);

  useEffect(() => {
    const boardDeals = boardQuery.data ?? [];
    setBoardCards(
      boardDeals.map((deal) => ({
        ...deal,
        column: deal.status === "open" ? (deal.pipelineStage?.id ?? "") : deal.status,
      })),
    );
  }, [boardQuery.data]);

  const invalidateDeals = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["deals"] }),
      queryClient.invalidateQueries({ queryKey: ["companies"] }),
      queryClient.invalidateQueries({ queryKey: ["contacts"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id?: string;
      input: Parameters<typeof dealsApi.create>[0];
    }) => (id ? dealsApi.update(id, input) : dealsApi.create(input)),
    onSuccess: async (_deal, variables) => {
      await invalidateDeals();
      setFormOpen(false);
      setEditing(null);
      notify({
        title: variables.id ? "Deal updated" : "Deal created",
        variant: "success",
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      ids.length === 1 ? dealsApi.delete(ids[0]) : dealsApi.bulkDelete(ids),
    onSuccess: async (_result, ids) => {
      await invalidateDeals();
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      setDeleteIds([]);
      notify({
        title: ids.length === 1 ? "Deal deleted" : `${ids.length} deals deleted`,
        variant: "success",
      });
    },
  });
  const closeMutation = useMutation({
    mutationFn: ({ dealId, outcome }: { dealId: string; outcome: "won" | "lost" }) =>
      outcome === "won"
        ? dealsApi.win(dealId)
        : dealsApi.lose(dealId, lostReason === "none" ? undefined : lostReason),
    onSuccess: async (_deal, variables) => {
      await invalidateDeals();
      setCloseTarget(null);
      setLostReason("none");
      notify({
        title: variables.outcome === "won" ? "Deal marked won" : "Deal marked lost",
        variant: "success",
      });
    },
  });
  const reopenMutation = useMutation({
    mutationFn: dealsApi.reopen,
    onSuccess: async () => {
      await invalidateDeals();
      notify({ title: "Deal reopened", variant: "success" });
    },
  });
  const bulkStageMutation = useMutation({
    mutationFn: ({ ids, target }: { ids: string[]; target: string }) =>
      dealsApi.bulkStage(ids, target),
    onSuccess: async () => {
      await invalidateDeals();
      setSelectedIds([]);
      setBulkStage("");
      notify({ title: "Selected deals moved", variant: "success" });
    },
  });

  const openCreate = (stage?: DealStage | null, name = "") => {
    setEditing(null);
    setInitialStage(stage ?? null);
    setInitialName(name);
    setFormOpen(true);
  };
  const openEdit = (deal: Deal) => {
    setEditing(deal);
    setInitialStage(null);
    setInitialName("");
    setFormOpen(true);
  };
  const changeFilter = (callback: () => void) => {
    callback();
    setPage(1);
  };
  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setStageId("all");
    setContact(null);
    setCompany(null);
    setValueMin("");
    setValueMax("");
    setProbabilityMin("");
    setProbabilityMax("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const requestBoardClose = (deal: Deal, outcome: "won" | "lost") =>
    new Promise<void>((resolve, reject) => {
      pendingBoardClose.current = { deal, status: outcome, resolve, reject };
      setLostReason("none");
      setCloseTarget({ deal, status: outcome });
    });

  const boardColumns: KanbanColumn[] = [
    ...stages.map((stage, index) => ({
      id: stage.id,
      title: stage.name,
      tone: ((index % 5) + 1) as 1 | 2 | 3 | 4 | 5,
    })),
    { id: "won", title: "Won", tone: 3, done: true },
    { id: "lost", title: "Lost", tone: 4 },
  ];
  const boardMove = async (card: BoardDeal, to: KanbanColumn) => {
    if (card.status !== "open" && to.id !== card.status) {
      throw new Error("Reopen a closed Deal from its details before moving it.");
    }
    if (to.id === "won" || to.id === "lost") {
      if (card.status === to.id) return;
      await requestBoardClose(card, to.id);
      return;
    }
    if (to.id !== card.pipelineStage?.id) {
      await dealsApi.stage(card.id, to.id);
      await invalidateDeals();
    }
  };
  const boardAdd = (column: KanbanColumn, name: string) => {
    const stage = stages.find((item) => item.id === column.id);
    if (stage) openCreate(stage, name);
  };

  const columns: DataTableColumn<Deal>[] = [
    {
      key: "name",
      header: "Deal",
      value: (deal) => deal.name,
      cell: (deal) => (
        <Link
          to={`/app/deals/${deal.id}`}
          className="font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {deal.name}
        </Link>
      ),
      sortable: true,
      searchable: true,
      width: "minmax(180px,1.5fr)",
      card: "title",
    },
    {
      key: "contact",
      header: "Primary contact",
      value: (deal) => deal.primaryContact?.name ?? "",
      cell: (deal) =>
        deal.primaryContact ? (
          <Link
            to={`/app/contacts/${deal.primaryContact.id}`}
            className="hover:text-primary hover:underline"
          >
            {deal.primaryContact.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">Contact removed</span>
        ),
      width: "minmax(130px,1fr)",
      card: "subtitle",
    },
    {
      key: "company",
      header: "Company",
      value: (deal) => deal.company?.name ?? "",
      cell: (deal) =>
        deal.company ? (
          <Link
            to={`/app/companies/${deal.company.id}`}
            className="hover:text-primary hover:underline"
          >
            {deal.company.name}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
      width: "minmax(110px,1fr)",
    },
    {
      key: "value",
      header: "Value",
      value: (deal) => deal.value,
      cell: (deal) => (
        <span className="tabular-nums">{currency(deal.value, deal.currency)}</span>
      ),
      align: "right",
      sortable: true,
      width: "100px",
      card: "trailing",
    },
    {
      key: "stage",
      header: "Stage",
      value: (deal) =>
        deal.status === "open" ? (deal.pipelineStage?.name ?? "—") : deal.status,
      cell: (deal) => (
        <Badge
          tone={
            deal.status === "won"
              ? "success"
              : deal.status === "lost"
                ? "danger"
                : "primary"
          }
        >
          {deal.status === "open"
            ? (deal.pipelineStage?.name ?? "—")
            : deal.status === "won"
              ? "Won"
              : "Lost"}
        </Badge>
      ),
      width: "minmax(92px,0.8fr)",
    },
    {
      key: "probability",
      header: "Probability",
      value: (deal) => deal.probability,
      cell: (deal) => (deal.probability == null ? "—" : `${deal.probability}%`),
      align: "right",
      sortable: true,
      width: "96px",
    },
    {
      key: "expectedCloseDate",
      header: "Expected close",
      value: (deal) =>
        deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : null,
      cell: (deal) => formattedDate(deal.expectedCloseDate),
      sortable: true,
      width: "118px",
    },
    {
      key: "actions",
      header: "",
      width: "44px",
      cell: (deal) => {
        const actions: MenuEntry[] = [
          {
            id: "open",
            label: "Open details",
            onSelect: () => navigate(`/app/deals/${deal.id}`),
          },
          {
            id: "edit",
            label: "Edit deal",
            icon: <Pencil />,
            onSelect: () => openEdit(deal),
          },
          ...(deal.status === "open"
            ? [
                {
                  id: "won",
                  label: "Mark as won",
                  icon: <Check />,
                  onSelect: () => setCloseTarget({ deal, status: "won" }),
                },
                {
                  id: "lost",
                  label: "Mark as lost",
                  icon: <XCircle />,
                  onSelect: () => setCloseTarget({ deal, status: "lost" }),
                },
              ]
            : [
                {
                  id: "reopen",
                  label: "Reopen deal",
                  icon: <TrendingUp />,
                  onSelect: () => reopenMutation.mutate(deal.id),
                },
              ]),
          {
            id: "delete",
            label: "Delete deal",
            icon: <Trash2 />,
            onSelect: () => setDeleteIds([deal.id]),
          },
        ];
        return (
          <DropdownMenu
            label={`Actions for ${deal.name}`}
            items={actions}
            trigger={
              <button
                type="button"
                aria-label={`Actions for ${deal.name}`}
                title="Deal actions"
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent"
              >
                <MoreHorizontal className="size-4" />
              </button>
            }
          />
        );
      },
    },
  ];

  const hasFilters =
    status !== "all" ||
    stageId !== "all" ||
    contact ||
    company ||
    valueMin ||
    valueMax ||
    probabilityMin ||
    probabilityMax ||
    dateFrom ||
    dateTo;
  const listError = view === "table" ? dealsQuery.error : boardQuery.error;
  const selectedDealsAreOpen = selectedIds.every(
    (id) => deals.find((deal) => deal.id === id)?.status === "open",
  );

  if (
    (view === "table" && dealsQuery.isLoading) ||
    (view === "board" && boardQuery.isLoading) ||
    stagesQuery.isLoading
  ) {
    return <DealsLoading view={view} />;
  }

  return (
    <section className="flex min-w-0 flex-col gap-5">
      <PageHeader
        title="Deals"
        description="Track opportunities from first conversation to close."
      >
        <Button onClick={() => openCreate(stages[0] ?? null)} icon={<Plus />}>
          Add deal
        </Button>
      </PageHeader>

      {statsQuery.isError ? (
        <p role="alert" className="text-sm text-destructive">
          Deal statistics could not be loaded.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {statCards(
            statsQuery.data ?? {
              totalDeals: 0,
              activeDeals: 0,
              pipelineValue: 0,
              wonRevenue: 0,
              lostDeals: 0,
            },
          ).map(({ label, value, icon: Icon, tone }) => (
            <div
              key={label}
              className="flex min-h-20 min-w-0 items-center gap-3 rounded-md border border-border bg-card p-3"
            >
              <span
                className={`grid size-8 shrink-0 place-items-center rounded-md ${tone}`}
              >
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold tabular-nums">
                  {statsQuery.isLoading ? "—" : value}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {label}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-52 flex-1 sm:max-w-sm">
            <SearchInput
              aria-label="Search deals"
              placeholder="Search deals"
              onSearch={(value) => changeFilter(() => setSearch(value.trim()))}
            />
          </div>
          <PillSelect
            label="Filter by status"
            options={statusOptions}
            value={status}
            onValueChange={(value) => changeFilter(() => setStatus(value))}
          />
          <PillSelect
            label="Filter by stage"
            options={[
              { value: "all", label: "All stages" },
              ...stages.map((stage) => ({ value: stage.id, label: stage.name })),
            ]}
            value={stageId}
            onValueChange={(value) => changeFilter(() => setStageId(value))}
          />
          <div className="min-w-52 flex-1 sm:max-w-64">
            <Combobox
              label="Filter by contact"
              placeholder="All contacts"
              searchPlaceholder="Search contacts"
              clearable
              value={contact}
              onValueChange={(value) => changeFilter(() => setContact(value))}
              search={async (query, { signal }) =>
                (await dealsApi.contactOptions(query, signal)).map((item) => ({
                  value: item.id,
                  label: `${item.firstName} ${item.lastName}`.trim(),
                  description: item.email || undefined,
                }))
              }
              emptyMessage={(query) => (query ? "No matching contacts" : "No contacts")}
            />
          </div>
          <div className="min-w-52 flex-1 sm:max-w-64">
            <Combobox
              label="Filter by company"
              placeholder="All companies"
              searchPlaceholder="Search companies"
              clearable
              value={company}
              onValueChange={(value) => changeFilter(() => setCompany(value))}
              search={async (query, { signal }) =>
                (await dealsApi.companyOptions(query, signal)).map((item) => ({
                  value: item.id,
                  label: item.name,
                }))
              }
              emptyMessage={(query) =>
                query ? "No matching companies" : "No companies"
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Input
              aria-label="Minimum deal value"
              type="number"
              min="0"
              size="sm"
              value={valueMin}
              onValueChange={(value) => changeFilter(() => setValueMin(value))}
              placeholder="Value from"
              inputClassName="w-24"
            />
            <Input
              aria-label="Maximum deal value"
              type="number"
              min="0"
              size="sm"
              value={valueMax}
              onValueChange={(value) => changeFilter(() => setValueMax(value))}
              placeholder="Value to"
              inputClassName="w-24"
            />
            <Input
              aria-label="Minimum probability"
              type="number"
              min="0"
              max="100"
              size="sm"
              value={probabilityMin}
              onValueChange={(value) => changeFilter(() => setProbabilityMin(value))}
              placeholder="Probability %"
              inputClassName="w-24"
            />
            <Input
              aria-label="Maximum probability"
              type="number"
              min="0"
              max="100"
              size="sm"
              value={probabilityMax}
              onValueChange={(value) => changeFilter(() => setProbabilityMax(value))}
              placeholder="to %"
              inputClassName="w-24"
            />
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <input
              aria-label="Expected close from"
              type="date"
              max={dateTo || undefined}
              value={dateFrom}
              onChange={(event) => changeFilter(() => setDateFrom(event.target.value))}
              className="h-9 w-full min-w-0 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-36"
            />
            <input
              aria-label="Expected close to"
              type="date"
              min={dateFrom || undefined}
              value={dateTo}
              onChange={(event) => changeFilter(() => setDateTo(event.target.value))}
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
              aria-label="Kanban view"
              aria-pressed={view === "board"}
              title="Kanban view"
              onClick={() => setView("board")}
              className={`grid size-8 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${view === "board" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-3.5" />
          <span>Value, probability, and expected closing date</span>
          {hasFilters ? (
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {view === "table" && selectedIds.length ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/50 px-3 py-2">
          <p className="text-sm font-medium">{selectedIds.length} selected</p>
          <div className="flex flex-wrap items-center gap-2">
            <PillSelect
              label="Move selected deals to stage"
              options={stages.map((stage) => ({ value: stage.id, label: stage.name }))}
              value={bulkStage}
              onValueChange={setBulkStage}
              size="sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!bulkStage || !selectedDealsAreOpen}
              onClick={() =>
                bulkStageMutation.mutate({ ids: selectedIds, target: bulkStage })
              }
            >
              Change stage
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Download />}
              onClick={() =>
                downloadDealsCsv(deals.filter((deal) => selectedIds.includes(deal.id)))
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

      {(view === "table" ? dealsQuery.isError : boardQuery.isError) ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 p-4"
        >
          <p className="text-sm text-destructive">
            {listError instanceof DealApiError && listError.status === 401
              ? "Your session has expired. Sign in again to view deals."
              : "Deals could not be loaded."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              void (view === "table" ? dealsQuery.refetch() : boardQuery.refetch())
            }
          >
            Try again
          </Button>
        </div>
      ) : stagesQuery.isError ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 p-4"
        >
          <p className="text-sm text-destructive">
            Pipeline stages could not be loaded.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void stagesQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : view === "table" && deals.length === 0 ? (
        <EmptyState
          scene={search || hasFilters ? "search" : "inbox"}
          title={
            search || hasFilters ? "No matching deals" : "Your pipeline starts here"
          }
          description={
            search || hasFilters
              ? "Try a different search or clear the filters."
              : "Add an opportunity and move it through your pipeline."
          }
          action={
            search || hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button onClick={() => openCreate(stages[0] ?? null)} icon={<Plus />}>
                Add deal
              </Button>
            )
          }
        />
      ) : view === "board" ? (
        <div className="min-w-0 overflow-x-clip pb-2">
          <KanbanBoard
            label="Deal pipeline"
            columns={boardColumns}
            cards={boardCards}
            onCardsChange={setBoardCards}
            cardLabel={(deal) => deal.name}
            value={(deal) =>
              deal.status === "won" ? (deal.finalValue ?? deal.value) : deal.value
            }
            valueFormat={{
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            }}
            refuse={(deal, column) =>
              deal.status !== "open" && column.id !== deal.status
                ? "Reopen this Deal from its details first"
                : null
            }
            onMove={boardMove}
            onAdd={boardAdd}
            addLabel="deal"
            renderCard={(deal) => (
              <div className="min-w-0">
                <Link
                  to={`/app/deals/${deal.id}`}
                  onClick={(event) => event.stopPropagation()}
                  className="block truncate text-[13px] font-medium text-foreground hover:text-primary"
                >
                  {deal.name}
                </Link>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {deal.primaryContact?.name ?? "Contact removed"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {deal.company?.name ?? "No company"}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span>
                    {deal.probability == null
                      ? "No probability"
                      : `${deal.probability}%`}
                  </span>
                  <span>{formattedDate(deal.expectedCloseDate)}</span>
                </div>
              </div>
            )}
          />
        </div>
      ) : (
        <DataTable
          label="Deals"
          noun={["deal", "deals"]}
          columns={columns}
          rows={deals}
          getRowId={(deal) => deal.id}
          rowLabel={(deal) => deal.name}
          searchable={false}
          selectable
          selected={selectedIds}
          onSelectedChange={setSelectedIds}
          sort={sort}
          onSortChange={(next) => {
            if (next) {
              setSort(next);
              setPage(1);
            }
          }}
          pageSize={100}
          renderDetail={(deal) => (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {deal.probability ?? "—"}% probability ·{" "}
                {deal.status === "open" ? deal.pipelineStage?.name : deal.status}
              </span>
              <Link
                to={`/app/deals/${deal.id}`}
                className="inline-flex min-h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Open deal
              </Link>
            </div>
          )}
        />
      )}

      {view === "table" && meta && meta.total > 0 ? (
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

      <DealFormSheet
        open={formOpen}
        deal={editing}
        stages={stages}
        initialStage={initialStage}
        initialName={initialName}
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
        title={deleteIds.length > 1 ? "Delete selected deals?" : "Delete this deal?"}
        description="Linked tasks and activities will be kept and unlinked. Deal history will be removed."
        confirmLabel="Delete"
        tone="destructive"
        errorMessage="The selected deals could not be deleted."
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
      <ConfirmationDialog
        open={Boolean(closeTarget)}
        onOpenChange={(open) => {
          if (!open && closeTarget) {
            pendingBoardClose.current?.reject(new Error("Deal transition cancelled"));
            pendingBoardClose.current = null;
            setCloseTarget(null);
            setLostReason("none");
          }
        }}
        title={
          closeTarget?.status === "won"
            ? "Mark this deal as won?"
            : "Mark this deal as lost?"
        }
        description={
          closeTarget?.status === "won"
            ? "The current deal value will be recorded as final revenue."
            : "This opportunity will be recorded as lost. You can reopen it later."
        }
        confirmLabel={closeTarget?.status === "won" ? "Mark as won" : "Mark as lost"}
        errorMessage="The deal outcome could not be saved."
        onConfirm={async () => {
          if (!closeTarget) return;
          try {
            if (pendingBoardClose.current) {
              const { deal, status: outcome, resolve } = pendingBoardClose.current;
              await (outcome === "won"
                ? dealsApi.win(deal.id)
                : dealsApi.lose(
                    deal.id,
                    lostReason === "none" ? undefined : lostReason,
                  ));
              await invalidateDeals();
              resolve();
              pendingBoardClose.current = null;
              setCloseTarget(null);
              notify({
                title: outcome === "won" ? "Deal marked won" : "Deal marked lost",
                variant: "success",
              });
            } else {
              await closeMutation.mutateAsync({
                dealId: closeTarget.deal.id,
                outcome: closeTarget.status,
              });
            }
          } catch (error) {
            pendingBoardClose.current?.reject(
              error instanceof Error ? error : new Error("Deal transition failed"),
            );
            pendingBoardClose.current = null;
            notify({
              title: error instanceof Error ? error.message : "Deal transition failed",
              variant: "error",
            });
            throw error;
          }
        }}
      >
        {closeTarget?.status === "lost" ? (
          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-foreground">
              Lost reason (optional)
            </span>
            <PillSelect
              label="Lost reason"
              options={[
                { value: "none", label: "Not specified" },
                ...DEAL_LOST_REASONS,
              ]}
              value={lostReason}
              onValueChange={(value) => setLostReason(value as DealLostReason | "none")}
              size="md"
              block
            />
          </div>
        ) : null}
      </ConfirmationDialog>
    </section>
  );
}

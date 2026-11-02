import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  ContactRound,
  Handshake,
  LayoutGrid,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  UserRoundPlus,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { PillSelect } from "@/components/pill-select";
import { SearchInput } from "@/components/search-input";
import { Skeleton } from "@/components/skeleton";
import { DropdownMenu } from "@/components/dropdown-menu";
import type { MenuEntry } from "@/components/menu-list";
import { useNotifications } from "@/providers/notification-provider";
import { ContactFormSheet } from "./contact-form-sheet";
import {
  ContactApiError,
  contactsApi,
  type Contact,
  type ContactInput,
  type ContactListParams,
  type ContactType,
} from "./contacts.api";
import { CONTACT_TYPE_OPTIONS } from "./contact-form-schema";

const typeOptions = [{ value: "all", label: "All types" }, ...CONTACT_TYPE_OPTIONS];
const sortFields: Record<string, ContactListParams["sortBy"]> = {
  name: "name",
  added: "recentlyAdded",
  lastActivity: "lastActivity",
};
const typeTone: Record<ContactType, "primary" | "success" | "neutral" | "warning"> = {
  lead: "primary",
  client: "success",
  former_client: "neutral",
  partner: "warning",
};
const typeLabel: Record<ContactType, string> = {
  lead: "Lead",
  client: "Client",
  former_client: "Former client",
  partner: "Partner",
};
const contactMetrics = [
  {
    value: "all",
    label: "Total contacts",
    icon: UsersRound,
    iconTone: "bg-primary/10 text-primary",
  },
  {
    value: "lead",
    label: "Leads",
    icon: UserRoundPlus,
    iconTone: "bg-info/10 text-info",
  },
  {
    value: "client",
    label: "Clients",
    icon: BriefcaseBusiness,
    iconTone: "bg-success/10 text-success",
  },
  {
    value: "former_client",
    label: "Former clients",
    icon: UserRoundX,
    iconTone: "bg-muted text-muted-foreground",
  },
  {
    value: "partner",
    label: "Partners",
    icon: Handshake,
    iconTone: "bg-warning/20 text-warning-foreground",
  },
] as const;

function displayDate(value: string | null) {
  if (!value) return "No activity";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function CompanyFilter({
  value,
  onChange,
}: {
  value?: string;
  onChange: (id?: string) => void;
}) {
  const [selected, setSelected] = useState<ComboboxOption | null>(null);

  useEffect(() => {
    if (!value) setSelected(null);
  }, [value]);

  return (
    <div className="min-w-44">
      <Combobox
        label="Filter by company"
        placeholder="Company"
        searchPlaceholder="Search companies"
        variant="pill"
        clearable
        value={selected}
        onValueChange={(option) => {
          setSelected(option);
          onChange(option?.value);
        }}
        search={async (query, { signal }) => {
          const options = await contactsApi.companyOptions(query, signal);
          return options.map((option) => ({
            value: option.id,
            label: option.name,
          }));
        }}
      />
    </div>
  );
}

function ContactsPageSkeleton({ view }: { view: "table" | "grid" }) {
  return (
    <section
      role="status"
      aria-label="Loading contacts"
      aria-busy="true"
      className="min-w-0 space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton width={150} height={30} />
          <Skeleton width="min(280px, 85%)" height={14} />
        </div>
        <Skeleton shape="block" width={132} height={40} className="rounded-md" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex min-h-28 min-w-0 flex-col justify-between rounded-lg border border-border bg-card p-3.5"
          >
            <Skeleton shape="block" width={36} height={36} className="rounded-md" />
            <div className="mt-3 space-y-2">
              <Skeleton width={48} height={26} />
              <Skeleton width="72%" height={12} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-56 flex-1 sm:max-w-sm">
            <Skeleton shape="block" height={36} className="rounded-md" />
          </div>
          <Skeleton shape="block" width={104} height={34} className="rounded-full" />
          <div className="min-w-44">
            <Skeleton shape="block" height={34} className="rounded-full" />
          </div>
          <Skeleton shape="block" width={144} height={34} className="rounded-md" />
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <Skeleton shape="block" height={36} className="rounded-md sm:w-36" />
            <Skeleton shape="block" height={36} className="rounded-md sm:w-36" />
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-full border border-border p-0.5">
            <Skeleton shape="block" width={32} height={32} className="rounded-full" />
            <Skeleton shape="block" width={32} height={32} className="rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton shape="circle" width={14} />
          <Skeleton width={74} height={12} />
        </div>
      </div>

      {view === "table" ? (
        <div className="@container overflow-hidden rounded-md border border-border">
          <div className="hidden h-10 items-center gap-3 border-b border-border bg-muted/40 px-3 @min-[34.01rem]:grid @min-[34.01rem]:grid-cols-[36px_minmax(180px,1.5fr)_minmax(100px,1fr)_70px_90px_110px_100px_40px]">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} width={index === 1 ? "55%" : "65%"} height={12} />
            ))}
          </div>
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="border-b border-border last:border-b-0">
              <div className="hidden min-h-14 items-center gap-3 px-3 @min-[34.01rem]:grid @min-[34.01rem]:grid-cols-[36px_minmax(180px,1.5fr)_minmax(100px,1fr)_70px_90px_110px_100px_40px]">
                <Skeleton shape="block" width={16} height={16} className="rounded-sm" />
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton shape="circle" width={32} />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton width="62%" height={13} />
                    <Skeleton width="82%" height={11} />
                  </div>
                </div>
                <Skeleton width="70%" height={13} />
                <Skeleton width={54} height={20} className="rounded-full" />
                <Skeleton width={30} height={13} />
                <Skeleton width="68%" height={13} />
                <Skeleton width="68%" height={13} />
                <Skeleton shape="circle" width={28} />
              </div>
              <div className="flex min-h-[60px] items-center gap-3 py-2.5 pr-3 @min-[34.01rem]:hidden">
                <Skeleton shape="block" width={16} height={16} className="rounded-sm" />
                <Skeleton shape="circle" width={36} />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton width="55%" height={13} />
                  <Skeleton width="75%" height={11} />
                </div>
                <Skeleton width={54} height={20} className="rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="min-w-0 border-b border-border p-4 sm:rounded-md sm:border sm:bg-card"
            >
              <div className="flex items-start gap-3">
                <Skeleton
                  shape="block"
                  width={16}
                  height={16}
                  className="mt-1 rounded-sm"
                />
                <Skeleton shape="circle" width={40} />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton width="68%" height={14} />
                  <Skeleton width="90%" height={11} />
                </div>
                <Skeleton shape="circle" width={32} />
              </div>
              <div className="mt-4 flex gap-2 pl-7">
                <Skeleton width={56} height={20} className="rounded-full" />
                <Skeleton width={92} height={20} className="rounded-full" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 pl-7">
                <div className="space-y-2">
                  <Skeleton width={44} height={11} />
                  <Skeleton width={24} height={13} />
                </div>
                <div className="space-y-2">
                  <Skeleton width={78} height={11} />
                  <Skeleton width={70} height={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <Skeleton width={150} height={12} />
        <div className="flex gap-2">
          <Skeleton shape="block" width={32} height={32} className="rounded-md" />
          <Skeleton shape="block" width={32} height={32} className="rounded-md" />
          <Skeleton shape="block" width={32} height={32} className="rounded-md" />
        </div>
      </div>
    </section>
  );
}

export function ContactsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { notify } = useNotifications();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [contactType, setContactType] = useState("all");
  const [company, setCompany] = useState<string>();
  const [tagSearch, setTagSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<DataTableSort>({ key: "added", dir: "desc" });
  const [view, setView] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);

  const params: ContactListParams = {
    page,
    limit: 10,
    ...(search ? { search } : {}),
    ...(contactType !== "all" ? { contactType: contactType as ContactType } : {}),
    ...(company ? { company } : {}),
    ...(tagSearch ? { tag: tagSearch.trim() } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    sortBy: sortFields[sort.key] ?? "recentlyAdded",
    sortDirection: sort.dir,
  };
  const contactsQuery = useQuery({
    queryKey: ["contacts", params],
    queryFn: () => contactsApi.list(params),
  });
  const statsQuery = useQuery({
    queryKey: ["contacts", "stats"],
    queryFn: contactsApi.stats,
  });
  const contacts = contactsQuery.data?.data ?? [];
  const meta = contactsQuery.data?.meta;

  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: ContactInput }) =>
      id ? contactsApi.update(id, input) : contactsApi.create(input),
    onSuccess: async (_contact, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setSelectedIds([]);
      setFormOpen(false);
      setEditing(null);
      notify({
        title: variables.id ? "Contact updated" : "Contact created",
        variant: "success",
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      ids.length === 1 ? contactsApi.delete(ids[0]) : contactsApi.bulkDelete(ids),
    onSuccess: async (_result, ids) => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      setDeleteIds([]);
      notify({
        title: ids.length === 1 ? "Contact deleted" : `${ids.length} contacts deleted`,
        variant: "success",
      });
    },
  });

  const openEdit = (contact: Contact) => {
    setEditing(contact);
    setFormOpen(true);
  };
  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const onSortChange = (next: DataTableSort | null) => {
    if (!next) return;
    setSort(next);
    setPage(1);
  };

  if (contactsQuery.isLoading) return <ContactsPageSkeleton view={view} />;

  const columns: DataTableColumn<Contact>[] = [
    {
      key: "name",
      header: "Contact",
      sortable: true,
      searchable: true,
      width: "minmax(220px,1.5fr)",
      value: (contact) => `${contact.lastName} ${contact.firstName}`,
      cell: (contact) => {
        const name = `${contact.firstName} ${contact.lastName}`;
        return (
          <span className="flex min-w-0 items-center gap-3">
            <Avatar name={name} size="sm" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-foreground">{name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {contact.email || "No email"}
              </span>
            </span>
          </span>
        );
      },
      card: "title",
    },
    {
      key: "company",
      header: "Company",
      searchable: true,
      value: (contact) => contact.company?.name,
      cell: (contact) => contact.company?.name ?? "—",
      card: "subtitle",
    },
    {
      key: "type",
      header: "Type",
      cell: (contact) => (
        <Badge tone={typeTone[contact.contactType]} size="sm">
          {typeLabel[contact.contactType]}
        </Badge>
      ),
      card: "trailing",
    },
    {
      key: "deals",
      header: "Deals",
      value: (contact) => contact.dealsCount,
      cell: (contact) => contact.dealsCount,
      align: "right",
      card: "hidden",
    },
    {
      key: "lastActivity",
      header: "Last activity",
      sortable: true,
      value: (contact) => contact.lastActivityAt,
      cell: (contact) => displayDate(contact.lastActivityAt),
      card: "hidden",
    },
    {
      key: "added",
      header: "Added",
      sortable: true,
      value: (contact) => contact.createdAt,
      cell: (contact) => displayDate(contact.createdAt),
      card: "hidden",
    },
    {
      key: "actions",
      header: "Actions",
      width: "64px",
      cell: (contact) => {
        const actions: MenuEntry[] = [
          {
            id: "open",
            label: "Open profile",
            icon: <ContactRound aria-hidden="true" />,
            onSelect: () => navigate(`/app/contacts/${contact.id}`),
          },
          {
            id: "edit",
            label: "Edit contact",
            icon: <Pencil aria-hidden="true" />,
            onSelect: () => openEdit(contact),
          },
          {
            id: "delete",
            label: "Delete contact",
            icon: <Trash2 aria-hidden="true" />,
            onSelect: () => setDeleteIds([contact.id]),
          },
        ];
        return (
          <DropdownMenu
            label={`Actions for ${contact.firstName} ${contact.lastName}`}
            items={actions}
            trigger={
              <button
                type="button"
                aria-label={`Actions for ${contact.firstName} ${contact.lastName}`}
                title="Contact actions"
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

  const queryError = contactsQuery.error;
  const total = statsQuery.data?.total ?? 0;

  return (
    <section className="min-w-0 space-y-5">
      <PageHeader title="Contacts" description="The people behind your work.">
        <Button onClick={openCreate} icon={<Plus />}>
          Add contact
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {contactMetrics.map(({ value, label, icon: Icon, iconTone }) => {
          const active =
            value === "all" ? contactType === "all" : contactType === value;
          const count = value === "all" ? total : (statsQuery.data?.byType[value] ?? 0);

          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              aria-label={`${label}: ${statsQuery.isLoading ? "loading" : count}. Filter contacts`}
              onClick={() => {
                setContactType(value);
                setPage(1);
              }}
              className={`group relative flex min-h-28 min-w-0 flex-col justify-between overflow-hidden rounded-lg border p-3.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 motion-reduce:transition-none ${
                active
                  ? "border-primary/45 bg-primary/[0.035] shadow-sm"
                  : "border-border bg-card hover:border-foreground/20 hover:shadow-sm"
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 top-0 h-0.5 transition-colors ${active ? "bg-primary" : "bg-transparent group-hover:bg-primary/40"}`}
              />
              <span className="flex w-full items-center justify-between gap-2">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-md ${iconTone}`}
                >
                  <Icon aria-hidden="true" className="size-4.5" />
                </span>
                {active ? (
                  <span
                    className="size-1.5 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                ) : null}
              </span>
              <span className="mt-3 block min-w-0">
                <span className="block text-2xl font-semibold leading-7 tabular-nums text-foreground">
                  {statsQuery.isLoading ? "—" : count}
                </span>
                <span className="mt-1 block truncate text-xs font-medium text-muted-foreground">
                  {label}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-56 flex-1 sm:max-w-sm">
            <SearchInput
              aria-label="Search contacts"
              placeholder="Search people"
              onSearch={(value) => {
                setSearch(value.trim());
                setPage(1);
              }}
            />
          </div>
          <PillSelect
            label="Filter by contact type"
            options={typeOptions}
            value={contactType}
            onValueChange={(value) => {
              setContactType(value);
              setPage(1);
            }}
            size="sm"
          />
          <CompanyFilter
            value={company}
            onChange={(value) => {
              setCompany(value);
              setPage(1);
            }}
          />
          <div className="w-36">
            <label htmlFor="contact-tag-filter" className="sr-only">
              Filter by tag
            </label>
            <Input
              id="contact-tag-filter"
              size="sm"
              value={tagSearch}
              onValueChange={(value) => {
                setTagSearch(value);
                setPage(1);
              }}
              placeholder="Tag"
            />
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <label className="sr-only" htmlFor="contact-date-from">
              Added from
            </label>
            <input
              id="contact-date-from"
              aria-label="Added from"
              type="date"
              max={dateTo || undefined}
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="h-9 w-full min-w-0 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-36"
            />
            <span className="hidden text-xs text-muted-foreground sm:inline">to</span>
            <label className="sr-only" htmlFor="contact-date-to">
              Added to
            </label>
            <input
              id="contact-date-to"
              aria-label="Added to"
              type="date"
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
          <span>Added date</span>
          {(dateFrom || dateTo || tagSearch || company || contactType !== "all") && (
            <button
              type="button"
              className="ml-1 font-medium text-primary hover:underline"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setTagSearch("");
                setCompany(undefined);
                setContactType("all");
                setPage(1);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/50 px-3 py-2">
          <p className="text-sm font-medium">{selectedIds.length} selected</p>
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
      ) : null}

      {queryError ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-md border border-destructive/30 p-4"
        >
          <p className="text-sm text-destructive">
            {queryError instanceof ContactApiError && queryError.status === 401
              ? "Your session has expired. Sign in again to view contacts."
              : "Contacts could not be loaded."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void contactsQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          scene={search ? "search" : "inbox"}
          title={search ? "No matching contacts" : "Your contacts start here"}
          description={
            search
              ? "Try a different search or clear the filters."
              : "Add the people you work with to keep their details and history together."
          }
          action={
            search ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            ) : (
              <Button onClick={openCreate} icon={<Plus />}>
                Add contact
              </Button>
            )
          }
        />
      ) : view === "table" ? (
        <DataTable
          label="Contacts"
          noun={["contact", "contacts"]}
          columns={columns}
          rows={contacts}
          getRowId={(contact) => contact.id}
          rowLabel={(contact) => `${contact.firstName} ${contact.lastName}`}
          searchable={false}
          selectable
          selected={selectedIds}
          onSelectedChange={setSelectedIds}
          sort={sort}
          onSortChange={onSortChange}
          pageSize={100}
          renderDetail={(contact) => (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {contact.phone || contact.jobTitle || "Contact profile"}
              </span>
              <Link
                to={`/app/contacts/${contact.id}`}
                className="inline-flex min-h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Open profile
              </Link>
            </div>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {contacts.map((contact) => {
            const name = `${contact.firstName} ${contact.lastName}`;
            const selected = selectedIds.includes(contact.id);
            const menuItems: MenuEntry[] = [
              {
                id: "edit",
                label: "Edit contact",
                icon: <Pencil />,
                onSelect: () => openEdit(contact),
              },
              {
                id: "delete",
                label: "Delete contact",
                icon: <Trash2 />,
                onSelect: () => setDeleteIds([contact.id]),
              },
            ];
            return (
              <article
                key={contact.id}
                className="min-w-0 border-b border-border p-4 sm:rounded-md sm:border sm:bg-card"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${name}`}
                    checked={selected}
                    onChange={() =>
                      setSelectedIds((current) =>
                        selected
                          ? current.filter((id) => id !== contact.id)
                          : [...current, contact.id],
                      )
                    }
                    className="mt-1 size-4 accent-primary"
                  />
                  <Avatar name={name} size="md" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/app/contacts/${contact.id}`}
                      className="block truncate font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {name}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {contact.email || "No email"}
                    </p>
                  </div>
                  <DropdownMenu
                    label={`Actions for ${name}`}
                    items={menuItems}
                    trigger={
                      <button
                        type="button"
                        aria-label={`Actions for ${name}`}
                        title="Contact actions"
                        className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    }
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 pl-7">
                  <Badge tone={typeTone[contact.contactType]} size="sm">
                    {typeLabel[contact.contactType]}
                  </Badge>
                  {contact.company ? (
                    <Badge tone="neutral" size="sm" icon={<Building2 />}>
                      {contact.company.name}
                    </Badge>
                  ) : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3 pl-7 text-xs">
                  <div>
                    <p className="text-muted-foreground">Deals</p>
                    <p className="mt-1 font-medium">{contact.dealsCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last activity</p>
                    <p className="mt-1 font-medium">
                      {displayDate(contact.lastActivityAt)}
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

      <ContactFormSheet
        open={formOpen}
        contact={editing}
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
          deleteIds.length > 1 ? "Delete selected contacts?" : "Delete this contact?"
        }
        description="Related tasks and activities will be removed. Deals and Deal History will be retained."
        confirmLabel="Delete"
        tone="destructive"
        errorMessage="The selected contacts could not be deleted."
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

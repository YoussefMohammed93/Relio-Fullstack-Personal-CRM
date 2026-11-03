import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Globe2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/input";
import { Skeleton } from "@/components/skeleton";
import { Tabs, type TabItem } from "@/components/tabs";
import { Textarea } from "@/components/textarea";
import { useNotifications } from "@/providers/notification-provider";
import { ContactFormSheet } from "@/features/contacts/contact-form-sheet";
import { contactsApi, type ContactInput } from "@/features/contacts/contacts.api";
import { CompanyFormSheet } from "./company-form-sheet";
import {
  COMPANY_INDUSTRIES,
  COMPANY_SIZES,
  companiesApi,
  type Company,
  type CompanyInput,
} from "./companies.api";

const industryLabel = Object.fromEntries(
  COMPANY_INDUSTRIES.map(({ value, label }) => [value, label]),
);
const sizeLabel = Object.fromEntries(
  COMPANY_SIZES.map(({ value, label }) => [value, label]),
);

function formattedDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
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

function CompanyLoading() {
  return (
    <section
      role="status"
      aria-label="Loading company"
      aria-busy="true"
      className="flex min-w-0 flex-col gap-5"
    >
      <Skeleton width={84} height={14} />
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex min-w-0 items-center gap-4">
          <Skeleton shape="block" width={56} height={56} className="rounded-md" />
          <div className="flex min-w-0 flex-col gap-3">
            <Skeleton width={220} height={28} />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton shape="block" width={92} height={22} className="rounded-full" />
              <Skeleton
                shape="block"
                width={118}
                height={22}
                className="rounded-full"
              />
              <Skeleton width={78} height={14} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton shape="block" width={82} height={36} className="rounded-md" />
          <Skeleton shape="block" width={36} height={36} className="rounded-md" />
        </div>
      </header>
      <nav
        aria-label="Company detail sections"
        className="flex min-w-0 gap-5 overflow-hidden border-b border-border"
      >
        {[74, 66, 52, 86, 48].map((width, index) => (
          <span key={index} className="flex h-10 shrink-0 items-center">
            <Skeleton width={width} height={14} />
          </span>
        ))}
      </nav>
      <section aria-label="Company information loading" className="flex flex-col gap-6">
        <div>
          <Skeleton width={156} height={16} />
          <div className="mt-3 divide-y divide-border border-y border-border">
            {Array.from({ length: 7 }, (_, index) => (
              <div
                key={index}
                className="grid min-h-11 grid-cols-[minmax(8rem,0.65fr)_minmax(0,1.35fr)] items-center gap-3 py-3"
              >
                <Skeleton width={index % 2 === 0 ? 104 : 84} height={13} />
                <Skeleton
                  width={`${[72, 48, 82, 56, 68, 42, 76][index]}%`}
                  height={13}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton width={82} height={16} />
          <Skeleton width="92%" height={13} />
          <Skeleton width="68%" height={13} />
        </div>
      </section>
    </section>
  );
}

function Overview({ company }: { company: Company }) {
  const address = [
    company.address.street,
    company.address.city,
    company.address.state,
    company.address.postalCode,
    company.address.country,
  ]
    .filter(Boolean)
    .join(", ");
  const items = [
    {
      label: "Industry",
      value: industryLabel[company.industry] ?? company.industry,
      icon: Building2,
    },
    {
      label: "Company size",
      value: sizeLabel[company.companySize] ?? company.companySize,
      icon: BriefcaseBusiness,
    },
    { label: "Email", value: company.email, icon: Mail },
    { label: "Phone", value: company.phone, icon: Phone },
    { label: "Website", value: company.website, icon: Globe2, href: company.website },
    {
      label: "LinkedIn",
      value: company.linkedInUrl,
      icon: Globe2,
      href: company.linkedInUrl,
    },
    { label: "Address", value: address, icon: MapPin },
    {
      label: "Annual revenue",
      value: company.annualRevenue == null ? "" : currency(company.annualRevenue),
      icon: BriefcaseBusiness,
    },
    { label: "Added", value: formattedDate(company.createdAt), icon: CalendarDays },
  ].filter((item) => item.value);

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="company-info-heading">
        <h2 id="company-info-heading" className="text-sm font-semibold">
          Company information
        </h2>
        <dl className="mt-3 divide-y divide-border border-y border-border">
          {items.map(({ label, value, icon: Icon, href }) => (
            <div
              key={label}
              className="grid grid-cols-[minmax(8rem,0.65fr)_minmax(0,1.35fr)] items-center gap-3 py-3 text-sm"
            >
              <dt className="flex items-center gap-2 text-muted-foreground">
                <Icon aria-hidden="true" className="size-4" />
                {label}
              </dt>
              <dd className="min-w-0 wrap-break-word text-foreground">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {value}
                  </a>
                ) : label === "Email" ? (
                  <a href={`mailto:${value}`} className="hover:text-primary">
                    {value}
                  </a>
                ) : label === "Phone" ? (
                  <a href={`tel:${value}`} className="hover:text-primary">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      {company.description ? (
        <section aria-labelledby="company-description-heading">
          <h2 id="company-description-heading" className="text-sm font-semibold">
            Description
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {company.description}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function RelatedError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 py-6"
    >
      <p className="text-sm text-destructive">This section could not be loaded.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function CompanyDetailsPage() {
  const { companyId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const companyQuery = useQuery({
    queryKey: ["company", companyId],
    queryFn: () => companiesApi.get(companyId),
    enabled: Boolean(companyId),
  });
  const contactsQuery = useQuery({
    queryKey: ["company", companyId, "contacts"],
    queryFn: () => companiesApi.contacts(companyId),
    enabled: Boolean(companyId && activeTab === "contacts"),
  });
  const dealsQuery = useQuery({
    queryKey: ["company", companyId, "deals"],
    queryFn: () => companiesApi.deals(companyId),
    enabled: Boolean(companyId && activeTab === "deals"),
  });
  const activitiesQuery = useQuery({
    queryKey: ["company", companyId, "activities"],
    queryFn: () => companiesApi.activities(companyId),
    enabled: Boolean(companyId && activeTab === "activities"),
  });
  const notesQuery = useQuery({
    queryKey: ["company", companyId, "notes"],
    queryFn: () => companiesApi.notes(companyId),
    enabled: Boolean(companyId && activeTab === "notes"),
  });

  const updateMutation = useMutation({
    mutationFn: (input: CompanyInput) => companiesApi.update(companyId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["company", companyId] }),
        queryClient.invalidateQueries({ queryKey: ["companies"] }),
        queryClient.invalidateQueries({ queryKey: ["contacts"] }),
      ]);
      setEditOpen(false);
      notify({ title: "Company updated", variant: "success" });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => companiesApi.delete(companyId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companies"] }),
        queryClient.invalidateQueries({ queryKey: ["contacts"] }),
      ]);
      notify({ title: "Company deleted", variant: "success" });
      navigate("/app/companies", { replace: true });
    },
  });
  const contactMutation = useMutation({
    mutationFn: (input: ContactInput) =>
      contactsApi.create({ ...input, company: companyId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["company", companyId] }),
        queryClient.invalidateQueries({ queryKey: ["company", companyId, "contacts"] }),
        queryClient.invalidateQueries({ queryKey: ["companies"] }),
        queryClient.invalidateQueries({ queryKey: ["contacts"] }),
      ]);
      setContactFormOpen(false);
      notify({ title: "Contact added to company", variant: "success" });
    },
  });
  const noteMutation = useMutation({
    mutationFn: () =>
      companiesApi.createNote(companyId, {
        title: noteTitle.trim(),
        content: noteContent.trim(),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["company", companyId, "notes"] }),
        queryClient.invalidateQueries({
          queryKey: ["company", companyId, "activities"],
        }),
      ]);
      setNoteTitle("");
      setNoteContent("");
      notify({ title: "Note added", variant: "success" });
    },
    onError: (error) =>
      notify({
        title: error.message || "The note could not be saved",
        variant: "error",
      }),
  });

  if (companyQuery.isLoading) return <CompanyLoading />;
  if (companyQuery.isError || !companyQuery.data) {
    return (
      <section className="flex flex-col gap-4">
        <Link
          to="/app/companies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Companies
        </Link>
        <EmptyState
          scene="offline"
          title="Company unavailable"
          description="This company may have been deleted, or you may not have access to it."
          action={
            <Button variant="outline" onClick={() => void companyQuery.refetch()}>
              Try again
            </Button>
          }
        />
      </section>
    );
  }

  const company = companyQuery.data;
  const relatedStates = <T,>(
    query: UseQueryResult<T, Error>,
    retry: () => void,
    label: string,
  ) =>
    query.isLoading ? (
      <div role="status" aria-label={label} className="flex flex-col gap-3">
        <Skeleton height={44} />
        <Skeleton height={44} />
        <Skeleton width="80%" height={44} />
      </div>
    ) : query.isError ? (
      <RelatedError onRetry={retry} />
    ) : null;
  const contactContent =
    relatedStates(
      contactsQuery,
      () => void contactsQuery.refetch(),
      "Loading company contacts",
    ) ??
    (contactsQuery.data?.length ? (
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-140 text-left text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 font-medium">Contact</th>
              <th className="px-3 py-2.5 font-medium">Type</th>
              <th className="px-3 py-2.5 font-medium">Job title</th>
              <th className="px-3 py-2.5 font-medium">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contactsQuery.data.map((contact) => (
              <tr key={contact.id} className="hover:bg-muted/30">
                <td className="px-3 py-2.5">
                  <Link
                    to={`/app/contacts/${contact.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {contact.firstName} {contact.lastName}
                  </Link>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {contact.email || "No email"}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <Badge tone="neutral" size="sm">
                    {contact.contactType.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {contact.jobTitle || "—"}
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {formattedDate(contact.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState
        scene="inbox"
        title="No contacts yet"
        description="Add people to this organization to keep the relationship connected."
        action={
          <Button onClick={() => setContactFormOpen(true)} icon={<Plus />}>
            Add contact
          </Button>
        }
      />
    ));

  const dealContent =
    relatedStates(
      dealsQuery,
      () => void dealsQuery.refetch(),
      "Loading company deals",
    ) ??
    (dealsQuery.data?.length ? (
      <ul className="divide-y divide-border border-y border-border">
        {dealsQuery.data.map((deal) => (
          <li
            key={deal.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="font-medium">{deal.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {deal.primaryContact?.name ?? "No primary contact"} · Added{" "}
                {formattedDate(deal.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tabular-nums">
                {currency(deal.value)}
              </span>
              <Badge
                tone={
                  deal.status === "won"
                    ? "success"
                    : deal.status === "lost"
                      ? "neutral"
                      : "primary"
                }
                size="sm"
              >
                {deal.status}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <EmptyState
        scene="inbox"
        title="No deals yet"
        description="Deals associated with this company will appear here."
      />
    ));

  const activityList = (activities: NonNullable<typeof activitiesQuery.data>) =>
    activities.length ? (
      <ol className="divide-y divide-border border-y border-border">
        {activities.map((activity) => (
          <li key={activity.id} className="relative py-4 ps-8">
            <span
              aria-hidden="true"
              className="absolute inset-s-1 top-5 size-2 rounded-full bg-primary ring-4 ring-primary/10"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{activity.title}</p>
              <Badge tone="neutral" size="sm">
                {activity.type}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formattedDate(activity.activityDate)} · From {activity.source.type}:{" "}
              {activity.source.name}
            </p>
            {activity.content ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {activity.content}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    ) : (
      <EmptyState
        scene="inbox"
        title="No activity recorded"
        description="Notes, calls, emails, and meetings for this company and its relationships will appear here."
      />
    );

  const notesContent = relatedStates(
    notesQuery,
    () => void notesQuery.refetch(),
    "Loading company notes",
  ) ?? (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-3 rounded-md border border-border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          noteMutation.mutate();
        }}
      >
        <Input
          label="Note title"
          required
          value={noteTitle}
          onValueChange={setNoteTitle}
          maxLength={160}
        />
        <Textarea
          label="Note"
          value={noteContent}
          onValueChange={setNoteContent}
          maxLength={5000}
          minRows={3}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            loading={noteMutation.isPending}
            disabled={!noteTitle.trim()}
          >
            Add note
          </Button>
        </div>
      </form>
      {notesQuery.data?.length ? (
        <ol className="divide-y divide-border border-y border-border">
          {notesQuery.data.map((note) => (
            <li key={note.id} className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{note.title}</p>
                <span className="text-xs text-muted-foreground">
                  {formattedDate(note.activityDate)} · {note.source.type}
                </span>
              </div>
              {note.content ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {note.content}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          scene="inbox"
          title="No notes yet"
          description="Keep important context attached to this company."
        />
      )}
    </div>
  );

  const tabItems: TabItem[] = [
    { value: "overview", label: "Overview", content: <Overview company={company} /> },
    {
      value: "contacts",
      label: "Contacts",
      count: company.contactsCount,
      content: (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setContactFormOpen(true)} icon={<Plus />}>
              Add contact
            </Button>
          </div>
          {contactContent}
        </div>
      ),
    },
    {
      value: "deals",
      label: "Deals",
      count: company.activeDeals,
      content: dealContent,
    },
    {
      value: "activities",
      label: "Activities",
      content: activitiesQuery.isLoading ? (
        <div
          role="status"
          aria-label="Loading company activity"
          className="flex flex-col gap-3"
        >
          <Skeleton height={48} />
          <Skeleton height={48} />
          <Skeleton width="80%" height={48} />
        </div>
      ) : activitiesQuery.isError ? (
        <RelatedError onRetry={() => void activitiesQuery.refetch()} />
      ) : (
        activityList(activitiesQuery.data ?? [])
      ),
    },
    { value: "notes", label: "Notes", content: notesContent },
  ];

  return (
    <section className="flex min-w-0 flex-col gap-5">
      <Link
        to="/app/companies"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Companies
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar
            name={`${company.name.trim().slice(0, 1)} ${company.name.trim().slice(1, 2)}`
              .trim()
              .toUpperCase()}
            aria-label={company.name}
            src={company.logoUrl || undefined}
            size="lg"
            shape="square"
          />
          <div className="min-w-0">
            <h1 className="truncate text-page-title">{company.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {company.industry ? (
                <Badge tone="primary" size="sm">
                  {industryLabel[company.industry] ?? company.industry}
                </Badge>
              ) : null}
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
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Globe2 className="size-3.5" /> Website
                </a>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" icon={<Pencil />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete company"
            title="Delete company"
            icon={<Trash2 />}
            onClick={() => setDeleteOpen(true)}
          />
        </div>
      </header>
      <Tabs
        label={`${company.name} details`}
        value={activeTab}
        onValueChange={setActiveTab}
        items={tabItems}
      />

      <CompanyFormSheet
        open={editOpen}
        company={company}
        onOpenChange={setEditOpen}
        onSave={async (input) => {
          await updateMutation.mutateAsync(input);
        }}
      />
      <ContactFormSheet
        open={contactFormOpen}
        defaultCompany={{ id: company.id, name: company.name }}
        companyLocked
        onOpenChange={setContactFormOpen}
        onSave={async (input) => {
          await contactMutation.mutateAsync(input);
        }}
      />
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this company?"
        description="Contacts and deals will be retained and unlinked. Historical activities and deal history will remain."
        confirmLabel="Delete company"
        tone="destructive"
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync();
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

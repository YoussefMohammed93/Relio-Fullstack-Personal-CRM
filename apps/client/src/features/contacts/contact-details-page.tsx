import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/skeleton";
import { Tabs, type TabItem } from "@/components/tabs";
import { useNotifications } from "@/providers/notification-provider";
import { ContactFormSheet } from "./contact-form-sheet";
import { contactsApi, type Contact, type ContactInput } from "./contacts.api";
import { CONTACT_TYPE_OPTIONS } from "./contact-form-schema";

const typeLabels = Object.fromEntries(
  CONTACT_TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

function formattedDate(value: string | null | undefined) {
  if (!value) return "Not set";
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      <Skeleton height={48} />
      <Skeleton height={48} />
      <Skeleton width="80%" height={48} />
    </div>
  );
}

function ContactDetailsSkeleton() {
  return (
    <section
      role="status"
      aria-label="Loading contact"
      aria-busy="true"
      className="min-w-0 space-y-5"
    >
      <Skeleton width={84} height={14} />

      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex min-w-0 items-center gap-4">
          <Skeleton shape="circle" width={56} />
          <div className="min-w-0 space-y-3">
            <Skeleton width="min(260px, 58vw)" height={28} />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton width={74} height={22} className="rounded-full" />
              <Skeleton width={112} height={14} />
              <Skeleton width={126} height={22} className="rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton shape="block" width={88} height={36} className="rounded-md" />
          <Skeleton shape="block" width={36} height={36} className="rounded-md" />
        </div>
      </header>

      <div className="min-w-0 overflow-hidden shadow-[inset_0_-1px_0_var(--border)]">
        <div className="flex w-max items-center gap-5">
          <Skeleton width={68} height={40} className="rounded-md" />
          <Skeleton width={42} height={40} className="rounded-md" />
          <Skeleton width={112} height={40} className="rounded-md" />
          <Skeleton width={108} height={40} className="rounded-md" />
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <Skeleton width={142} height={15} />
          <div className="mt-3 divide-y divide-border border-y border-border">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="grid grid-cols-[minmax(8rem,0.65fr)_minmax(0,1.35fr)] items-center gap-3 py-3"
              >
                <Skeleton width="68%" height={13} />
                <Skeleton width={index % 2 === 0 ? "72%" : "52%"} height={13} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <Skeleton width={48} height={15} />
          <div className="mt-3 flex flex-wrap gap-2">
            <Skeleton width={62} height={22} className="rounded-full" />
            <Skeleton width={78} height={22} className="rounded-full" />
            <Skeleton width={54} height={22} className="rounded-full" />
          </div>
        </section>

        <section>
          <Skeleton width={52} height={15} />
          <div className="mt-3 space-y-2">
            <Skeleton height={13} />
            <Skeleton width="86%" height={13} />
            <Skeleton width="64%" height={13} />
          </div>
        </section>
      </div>
    </section>
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

function Overview({ contact }: { contact: Contact }) {
  const details = [
    { label: "Email", value: contact.email, icon: Mail },
    { label: "Phone", value: contact.phone, icon: Phone },
    { label: "Job title", value: contact.jobTitle, icon: null },
    { label: "Company", value: contact.company?.name, icon: Building2 },
    { label: "Website", value: contact.website, icon: null, href: contact.website },
    { label: "Added", value: formattedDate(contact.createdAt), icon: CalendarDays },
  ].filter((detail) => detail.value);

  return (
    <div className="space-y-6">
      <section aria-labelledby="contact-info-heading">
        <h2 id="contact-info-heading" className="text-sm font-semibold">
          Contact information
        </h2>
        <dl className="mt-3 divide-y divide-border border-y border-border">
          {details.map(({ label, value, icon: Icon, href }) => (
            <div
              key={label}
              className="grid grid-cols-[minmax(8rem,0.65fr)_minmax(0,1.35fr)] items-center gap-3 py-3 text-sm"
            >
              <dt className="flex items-center gap-2 text-muted-foreground">
                {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
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
      {contact.tags.length ? (
        <section aria-labelledby="contact-tags-heading">
          <h2 id="contact-tags-heading" className="text-sm font-semibold">
            Tags
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {contact.tags.map((tag) => (
              <Badge key={tag} tone="neutral" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      ) : null}
      {contact.notes ? (
        <section aria-labelledby="contact-notes-heading">
          <h2 id="contact-notes-heading" className="text-sm font-semibold">
            Notes
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {contact.notes}
          </p>
        </section>
      ) : null}
    </div>
  );
}

export function ContactDetailsPage() {
  const { contactId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const [activeTab, setActiveTab] = useState("overview");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const contactQuery = useQuery({
    queryKey: ["contacts", contactId],
    queryFn: () => contactsApi.get(contactId),
    enabled: Boolean(contactId),
  });
  const dealsQuery = useQuery({
    queryKey: ["contacts", contactId, "deals"],
    queryFn: () => contactsApi.deals(contactId),
    enabled: Boolean(contactId && activeTab === "deals"),
  });
  const tasksQuery = useQuery({
    queryKey: ["contacts", contactId, "tasks"],
    queryFn: () => contactsApi.tasks(contactId),
    enabled: Boolean(contactId && activeTab === "tasks"),
  });
  const activitiesQuery = useQuery({
    queryKey: ["contacts", contactId, "activities"],
    queryFn: () => contactsApi.activities(contactId),
    enabled: Boolean(contactId && activeTab === "activities"),
  });
  const updateMutation = useMutation({
    mutationFn: (input: ContactInput) => contactsApi.update(contactId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setFormOpen(false);
      notify({ title: "Contact updated", variant: "success" });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => contactsApi.delete(contactId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["contacts"] });
      notify({ title: "Contact deleted", variant: "success" });
      navigate("/app/contacts", { replace: true });
    },
  });

  if (contactQuery.isLoading) return <ContactDetailsSkeleton />;
  if (contactQuery.isError || !contactQuery.data) {
    return (
      <section className="space-y-4">
        <Link
          to="/app/contacts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Contacts
        </Link>
        <EmptyState
          scene="offline"
          title="Contact unavailable"
          description="This contact may have been deleted, or you may not have access to it."
          action={
            <Button variant="outline" onClick={() => void contactQuery.refetch()}>
              Try again
            </Button>
          }
        />
      </section>
    );
  }

  const contact = contactQuery.data;
  const contactName = `${contact.firstName} ${contact.lastName}`;

  const tabItems: TabItem[] = [
    {
      value: "overview",
      label: "Overview",
      content: <Overview contact={contact} />,
    },
    {
      value: "deals",
      label: "Deals",
      count: contact.dealsCount,
      content: dealsQuery.isLoading ? (
        <LoadingPanel label="Loading contact deals" />
      ) : dealsQuery.isError ? (
        <RelatedError onRetry={() => void dealsQuery.refetch()} />
      ) : dealsQuery.data?.length ? (
        <ul className="divide-y divide-border border-y border-border">
          {dealsQuery.data.map((deal) => (
            <li
              key={deal.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <Link
                  to={`/app/deals/${deal.id}`}
                  className="font-medium hover:text-primary"
                >
                  {deal.name}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {deal.company?.name ?? "No company"} · Expected close{" "}
                  {formattedDate(deal.expectedCloseDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium tabular-nums">
                  ${deal.value.toLocaleString()}
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
          description="Deals linked to this contact will appear here."
        />
      ),
    },
    {
      value: "tasks",
      label: "Tasks & follow-ups",
      content: tasksQuery.isLoading ? (
        <LoadingPanel label="Loading contact tasks" />
      ) : tasksQuery.isError ? (
        <RelatedError onRetry={() => void tasksQuery.refetch()} />
      ) : tasksQuery.data?.length ? (
        <ul className="divide-y divide-border border-y border-border">
          {tasksQuery.data.map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="font-medium">{task.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {task.type === "follow_up" ? "Follow-up" : "Task"} · Due{" "}
                  {formattedDate(task.dueDate)}
                  {task.dueTime ? ` at ${task.dueTime}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    task.priority === "high"
                      ? "danger"
                      : task.priority === "medium"
                        ? "warning"
                        : "neutral"
                  }
                  size="sm"
                >
                  {task.priority}
                </Badge>
                <Badge
                  tone={task.status === "completed" ? "success" : "neutral"}
                  size="sm"
                >
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          scene="inbox"
          title="No tasks or follow-ups"
          description="Tasks associated with this contact will appear here."
        />
      ),
    },
    {
      value: "activities",
      label: "Activity timeline",
      content: activitiesQuery.isLoading ? (
        <LoadingPanel label="Loading contact activity" />
      ) : activitiesQuery.isError ? (
        <RelatedError onRetry={() => void activitiesQuery.refetch()} />
      ) : activitiesQuery.data?.length ? (
        <ol className="divide-y divide-border border-y border-border">
          {activitiesQuery.data.map((activity) => (
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
                {formattedDate(activity.activityDate)}
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
          description="Calls, emails, meetings, and notes for this contact will show up here."
        />
      ),
    },
  ];

  return (
    <section className="min-w-0 space-y-5">
      <Link
        to="/app/contacts"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Contacts
      </Link>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={contactName} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-page-title">{contactName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="primary" size="sm">
                {typeLabels[contact.contactType]}
              </Badge>
              {contact.jobTitle ? (
                <span className="text-sm text-muted-foreground">
                  {contact.jobTitle}
                </span>
              ) : null}
              {contact.company ? (
                <Badge tone="neutral" size="sm" icon={<Building2 />}>
                  {contact.company.name}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" icon={<Pencil />} onClick={() => setFormOpen(true)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete contact"
            title="Delete contact"
            icon={<Trash2 />}
            onClick={() => setDeleteOpen(true)}
          />
        </div>
      </header>
      <Tabs
        label={`${contactName} details`}
        value={activeTab}
        onValueChange={setActiveTab}
        items={tabItems}
      />

      <ContactFormSheet
        open={formOpen}
        contact={contact}
        onOpenChange={setFormOpen}
        onSave={async (input) => {
          await updateMutation.mutateAsync(input);
        }}
      />
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this contact?"
        description="Related tasks and activities will be deleted. Deals and Deal History will be retained."
        confirmLabel="Delete contact"
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

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  DollarSign,
  Pencil,
  RotateCcw,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { PillSelect } from "@/components/pill-select";
import { Skeleton } from "@/components/skeleton";
import { Tabs } from "@/components/tabs";
import { useNotifications } from "@/providers/notification-provider";
import { DealFormSheet } from "./deal-form-sheet";
import { dealsApi, DEAL_LOST_REASONS, type DealLostReason } from "./deals.api";

function currency(value: number, currencyCode = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

function dateLabel(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
  }).format(new Date(value));
}

function DealLoading() {
  return (
    <section
      role="status"
      aria-label="Loading deal"
      aria-busy="true"
      className="flex min-w-0 flex-col gap-5"
    >
      <Skeleton width={98} height={14} />
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div className="flex min-w-0 flex-col gap-3">
          <Skeleton width={250} height={28} />
          <div className="flex flex-wrap gap-2">
            <Skeleton shape="block" width={78} height={22} className="rounded-full" />
            <Skeleton shape="block" width={104} height={22} className="rounded-full" />
            <Skeleton width={105} height={14} />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton shape="block" width={80} height={36} className="rounded-md" />
          <Skeleton shape="block" width={36} height={36} className="rounded-md" />
        </div>
      </header>
      <nav
        className="flex gap-5 overflow-hidden border-b border-border py-3"
        aria-label="Deal detail sections"
      >
        {[74, 82, 64, 76].map((width, index) => (
          <Skeleton key={index} width={width} height={14} />
        ))}
      </nav>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(250px,0.7fr)]">
        <section className="flex flex-col gap-5">
          <Skeleton width={150} height={16} />
          <div className="divide-y divide-border border-y border-border">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="grid min-h-12 grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] items-center gap-3 py-3"
              >
                <Skeleton width={92} height={13} />
                <Skeleton width={`${[72, 48, 82, 56, 68, 42][index]}%`} height={13} />
              </div>
            ))}
          </div>
          <Skeleton width={98} height={16} />
          <Skeleton width="90%" height={13} />
          <Skeleton width="62%" height={13} />
        </section>
        <aside className="flex flex-col gap-4 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <Skeleton width={120} height={16} />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              shape="block"
              width="100%"
              height={64}
              className="rounded-md"
            />
          ))}
        </aside>
      </div>
    </section>
  );
}

function LoadingError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 p-4"
    >
      <p className="text-sm text-destructive">Deal details could not be loaded.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function DealDetailsPage() {
  const { dealId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const [activeTab, setActiveTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [closeStatus, setCloseStatus] = useState<"won" | "lost" | null>(null);
  const [lostReason, setLostReason] = useState<DealLostReason | "none">("none");
  const dealQuery = useQuery({
    queryKey: ["deal", dealId],
    queryFn: () => dealsApi.get(dealId),
    enabled: Boolean(dealId),
  });
  const activitiesQuery = useQuery({
    queryKey: ["deal", dealId, "activities"],
    queryFn: () => dealsApi.activities(dealId),
    enabled: Boolean(dealId),
  });
  const tasksQuery = useQuery({
    queryKey: ["deal", dealId, "tasks"],
    queryFn: () => dealsApi.tasks(dealId),
    enabled: Boolean(dealId),
  });
  const historyQuery = useQuery({
    queryKey: ["deal", dealId, "history"],
    queryFn: () => dealsApi.history(dealId),
    enabled: Boolean(dealId),
  });
  const deal = dealQuery.data;
  const stagesQuery = useQuery({
    queryKey: ["pipeline-stages"],
    queryFn: dealsApi.stages,
    enabled: Boolean(deal),
  });

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["deal", dealId] }),
      queryClient.invalidateQueries({ queryKey: ["deals"] }),
      queryClient.invalidateQueries({ queryKey: ["companies"] }),
      queryClient.invalidateQueries({ queryKey: ["contacts"] }),
    ]);
  };
  const closeMutation = useMutation({
    mutationFn: (status: "won" | "lost") =>
      status === "won"
        ? dealsApi.win(dealId)
        : dealsApi.lose(dealId, lostReason === "none" ? undefined : lostReason),
    onSuccess: async (_result, status) => {
      await invalidate();
      setCloseStatus(null);
      setLostReason("none");
      notify({
        title: status === "won" ? "Deal marked won" : "Deal marked lost",
        variant: "success",
      });
    },
  });
  const reopenMutation = useMutation({
    mutationFn: () => dealsApi.reopen(dealId),
    onSuccess: async () => {
      await invalidate();
      notify({ title: "Deal reopened", variant: "success" });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: () => dealsApi.delete(dealId),
    onSuccess: async () => {
      await invalidate();
      notify({ title: "Deal deleted", variant: "success" });
      navigate("/app/deals");
    },
  });

  if (dealQuery.isLoading || stagesQuery.isLoading) return <DealLoading />;
  if (dealQuery.isError || !deal)
    return <LoadingError onRetry={() => void dealQuery.refetch()} />;
  const stages = stagesQuery.data ?? [];

  const overview = (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(250px,0.7fr)]">
      <div className="flex min-w-0 flex-col gap-6">
        <section aria-labelledby="deal-overview-heading">
          <h2 id="deal-overview-heading" className="text-sm font-semibold">
            Deal overview
          </h2>
          <dl className="mt-3 divide-y divide-border border-y border-border">
            <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] items-center gap-3 py-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <DollarSign aria-hidden="true" className="size-4" />
                Deal value
              </dt>
              <dd className="font-medium tabular-nums">
                {currency(deal.value, deal.currency)}
              </dd>
            </div>
            {deal.status === "won" && deal.finalValue != null ? (
              <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] items-center gap-3 py-3 text-sm">
                <dt className="text-muted-foreground">Final value</dt>
                <dd className="font-medium tabular-nums">
                  {currency(deal.finalValue, deal.currency)}
                </dd>
              </div>
            ) : null}
            <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] items-center gap-3 py-3 text-sm">
              <dt className="text-muted-foreground">Probability</dt>
              <dd>{deal.probability == null ? "Not set" : `${deal.probability}%`}</dd>
            </div>
            <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] items-center gap-3 py-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <BriefcaseBusiness aria-hidden="true" className="size-4" />
                Pipeline stage
              </dt>
              <dd>
                {deal.status === "open"
                  ? (deal.pipelineStage?.name ?? "Stage unavailable")
                  : deal.status === "won"
                    ? "Won"
                    : "Lost"}
              </dd>
            </div>
            <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] items-center gap-3 py-3 text-sm">
              <dt className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays aria-hidden="true" className="size-4" />
                Expected close
              </dt>
              <dd>{dateLabel(deal.expectedCloseDate)}</dd>
            </div>
            {deal.actualCloseDate ? (
              <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] items-center gap-3 py-3 text-sm">
                <dt className="text-muted-foreground">Closed won</dt>
                <dd>{dateLabel(deal.actualCloseDate)}</dd>
              </div>
            ) : null}
            {deal.lostDate ? (
              <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] items-center gap-3 py-3 text-sm">
                <dt className="text-muted-foreground">Closed lost</dt>
                <dd>{dateLabel(deal.lostDate)}</dd>
              </div>
            ) : null}
            {deal.lostReason ? (
              <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] items-center gap-3 py-3 text-sm">
                <dt className="text-muted-foreground">Lost reason</dt>
                <dd>
                  {DEAL_LOST_REASONS.find(({ value }) => value === deal.lostReason)
                    ?.label ?? deal.lostReason}
                </dd>
              </div>
            ) : null}
            <div className="grid grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] items-center gap-3 py-3 text-sm">
              <dt className="text-muted-foreground">Created</dt>
              <dd>{dateLabel(deal.createdAt)}</dd>
            </div>
          </dl>
        </section>
        {deal.description ? (
          <section aria-labelledby="deal-description-heading">
            <h2 id="deal-description-heading" className="text-sm font-semibold">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {deal.description}
            </p>
          </section>
        ) : null}
      </div>
      <aside className="flex min-w-0 flex-col gap-5 border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <section aria-labelledby="primary-contact-heading">
          <h2 id="primary-contact-heading" className="text-sm font-semibold">
            Primary contact
          </h2>
          {deal.primaryContact ? (
            <Link
              to={`/app/contacts/${deal.primaryContact.id}`}
              className="mt-3 flex min-w-0 items-center gap-3 rounded-md border border-border p-3 hover:bg-accent"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <UserRound aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {deal.primaryContact.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {deal.primaryContact.email || "Open contact profile"}
                </span>
              </span>
            </Link>
          ) : (
            <p className="mt-3 rounded-md border border-border p-3 text-sm text-muted-foreground">
              This contact was removed. Deal history is retained.
            </p>
          )}
        </section>
        <section aria-labelledby="company-heading">
          <h2 id="company-heading" className="text-sm font-semibold">
            Company
          </h2>
          {deal.company ? (
            <Link
              to={`/app/companies/${deal.company.id}`}
              className="mt-3 flex min-w-0 items-center gap-3 rounded-md border border-border p-3 hover:bg-accent"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                <BriefcaseBusiness aria-hidden="true" className="size-4" />
              </span>
              <span className="min-w-0 truncate text-sm font-medium">
                {deal.company.name}
              </span>
            </Link>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No company linked.</p>
          )}
        </section>
        <section aria-labelledby="deal-quick-actions-heading">
          <h2 id="deal-quick-actions-heading" className="text-sm font-semibold">
            Quick actions
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {deal.status === "open" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Check />}
                  onClick={() => setCloseStatus("won")}
                >
                  Mark won
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<XCircle />}
                  onClick={() => setCloseStatus("lost")}
                >
                  Mark lost
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                icon={<RotateCcw />}
                loading={reopenMutation.isPending}
                onClick={() => reopenMutation.mutate()}
              >
                Reopen
              </Button>
            )}
          </div>
        </section>
      </aside>
    </div>
  );

  const activities = (
    <section aria-label="Deal activity timeline" className="flex flex-col gap-3">
      {activitiesQuery.isError ? (
        <LoadingError onRetry={() => void activitiesQuery.refetch()} />
      ) : activitiesQuery.isLoading ? (
        Array.from({ length: 3 }, (_, index) => (
          <Skeleton
            key={index}
            shape="block"
            width="100%"
            height={74}
            className="rounded-md"
          />
        ))
      ) : activitiesQuery.data?.length ? (
        activitiesQuery.data.map((activity) => (
          <article
            key={activity.id}
            className="flex min-w-0 gap-3 border-b border-border pb-4 last:border-0"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
              <Clock3 aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium">{activity.title}</h3>
                <Badge tone="neutral" size="sm">
                  {activity.type}
                </Badge>
                <Badge tone="primary" size="sm">
                  {activity.source}
                </Badge>
              </div>
              {activity.content ? (
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {activity.content}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {dateLabel(activity.activityDate)}
              </p>
            </div>
          </article>
        ))
      ) : (
        <EmptyState
          scene="inbox"
          title="No activities yet"
          description="Activities recorded on this Deal or its primary Contact will appear here."
        />
      )}
    </section>
  );

  const tasks = (
    <section aria-label="Related Deal tasks" className="flex flex-col gap-3">
      {tasksQuery.isError ? (
        <LoadingError onRetry={() => void tasksQuery.refetch()} />
      ) : tasksQuery.isLoading ? (
        Array.from({ length: 3 }, (_, index) => (
          <Skeleton
            key={index}
            shape="block"
            width="100%"
            height={62}
            className="rounded-md"
          />
        ))
      ) : tasksQuery.data?.length ? (
        tasksQuery.data.map((task) => (
          <article
            key={task.id}
            className="flex min-w-0 items-start justify-between gap-4 border-b border-border pb-3 last:border-0"
          >
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium">{task.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {task.type === "follow_up" ? "Follow-up" : "Task"} · {task.priority}{" "}
                priority · {task.status.replaceAll("_", " ")}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {dateLabel(task.dueDate)}
            </span>
          </article>
        ))
      ) : (
        <EmptyState
          scene="inbox"
          title="No related tasks"
          description="Tasks linked to this Deal will appear here."
        />
      )}
    </section>
  );

  const history = (
    <section aria-label="Deal history" className="flex flex-col gap-3">
      {historyQuery.isError ? (
        <LoadingError onRetry={() => void historyQuery.refetch()} />
      ) : historyQuery.isLoading ? (
        Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            key={index}
            shape="block"
            width="100%"
            height={56}
            className="rounded-md"
          />
        ))
      ) : historyQuery.data?.length ? (
        historyQuery.data.map((event) => (
          <article
            key={event.id}
            className="flex min-w-0 items-start gap-3 border-b border-border pb-3 last:border-0"
          >
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Clock3 aria-hidden="true" className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium">
                {event.eventType.replaceAll("_", " ")}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {event.previousStage && event.newStage
                  ? `${event.previousStage} to ${event.newStage}`
                  : (event.newStage ?? event.previousStage ?? "")}
                {event.previousValue != null || event.newValue != null
                  ? ` · ${event.previousValue == null ? "" : currency(event.previousValue)}${event.previousValue != null && event.newValue != null ? " to " : ""}${event.newValue == null ? "" : currency(event.newValue)}`
                  : ""}
              </p>
            </div>
            <time className="shrink-0 text-xs text-muted-foreground">
              {dateLabel(event.eventDate)}
            </time>
          </article>
        ))
      ) : (
        <EmptyState
          scene="inbox"
          title="No deal history"
          description="Commercial changes will be recorded here."
        />
      )}
    </section>
  );

  const tabs = [
    { value: "overview", label: "Overview", count: undefined, content: overview },
    {
      value: "activities",
      label: "Activities",
      count: activitiesQuery.data?.length,
      content: activities,
    },
    { value: "tasks", label: "Tasks", count: tasksQuery.data?.length, content: tasks },
    {
      value: "history",
      label: "History",
      count: historyQuery.data?.length,
      content: history,
    },
  ];

  return (
    <section className="flex min-w-0 flex-col gap-5">
      <Link
        to="/app/deals"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Deals
      </Link>
      <PageHeader title={deal.name} description="Deal details and commercial history.">
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={<Pencil />} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete deal"
            title="Delete deal"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
          </Button>
        </div>
      </PageHeader>
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <Badge
          tone={
            deal.status === "won"
              ? "success"
              : deal.status === "lost"
                ? "danger"
                : "primary"
          }
          dot
        >
          {deal.status === "open"
            ? (deal.pipelineStage?.name ?? "Open")
            : deal.status === "won"
              ? "Won"
              : "Lost"}
        </Badge>
        <Badge tone="neutral" icon={<DollarSign />}>
          {currency(deal.value, deal.currency)}
        </Badge>
        {deal.company ? (
          <Link
            to={`/app/companies/${deal.company.id}`}
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            {deal.company.name}
          </Link>
        ) : null}
        {deal.primaryContact ? (
          <Link
            to={`/app/contacts/${deal.primaryContact.id}`}
            className="text-sm text-muted-foreground hover:text-primary hover:underline"
          >
            {deal.primaryContact.name}
          </Link>
        ) : null}
      </div>
      <Tabs
        items={tabs}
        value={activeTab}
        onValueChange={setActiveTab}
        label="Deal sections"
      />

      <DealFormSheet
        open={editOpen}
        deal={deal}
        stages={stages}
        onOpenChange={setEditOpen}
        onSave={async (input) => {
          await dealsApi.update(dealId, input);
          await invalidate();
          setEditOpen(false);
          notify({ title: "Deal updated", variant: "success" });
        }}
      />
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this deal?"
        description="Linked tasks and activities will be kept and unlinked. Deal history will be removed."
        confirmLabel="Delete deal"
        tone="destructive"
        errorMessage="The deal could not be deleted."
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
      />
      <ConfirmationDialog
        open={closeStatus !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCloseStatus(null);
            setLostReason("none");
          }
        }}
        title={
          closeStatus === "won" ? "Mark this deal as won?" : "Mark this deal as lost?"
        }
        description={
          closeStatus === "won"
            ? "The current deal value will be recorded as final revenue."
            : "This opportunity will be recorded as lost. You can reopen it later."
        }
        confirmLabel={closeStatus === "won" ? "Mark as won" : "Mark as lost"}
        errorMessage="The deal outcome could not be saved."
        onConfirm={async () => {
          if (closeStatus) await closeMutation.mutateAsync(closeStatus);
        }}
      >
        {closeStatus === "lost" ? (
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

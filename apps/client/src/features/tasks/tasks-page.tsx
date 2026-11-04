import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Columns3,
  List,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/input";
import { KanbanBoard, type KanbanColumn } from "@/components/kanban-board";
import { PageHeader } from "@/components/page-header";
import { PillSelect } from "@/components/pill-select";
import { Skeleton } from "@/components/skeleton";
import { Tabs } from "@/components/tabs";
import { useNotifications } from "@/providers/notification-provider";
import { TaskDetailsSheet } from "./task-details-sheet";
import { TaskFormSheet } from "./task-form-sheet";
import type {
  RelatedEntityType,
  TaskInput,
  TaskListParams,
  TaskPriority,
  TaskRecord,
  TaskStatus,
  TaskType,
} from "./tasks.api";
import { tasksApi } from "./tasks.api";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
const priorityOptions = [
  { value: "", label: "All priorities" },
  { value: "low", label: "Low priority" },
  { value: "medium", label: "Medium priority" },
  { value: "high", label: "High priority" },
];
const typeOptions = [
  { value: "", label: "All types" },
  { value: "task", label: "Tasks" },
  { value: "follow_up", label: "Follow-ups" },
];
const dueDateOptions = [
  { value: "", label: "Any due date" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "upcoming", label: "Upcoming" },
  { value: "no_date", label: "No due date" },
];
const relatedTypeOptions = [
  { value: "", label: "Any record" },
  { value: "Contact", label: "Contacts" },
  { value: "Company", label: "Companies" },
  { value: "Deal", label: "Deals" },
];
const sortOptions = [
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "createdAt", label: "Recently created" },
];
const taskColumns: KanbanColumn[] = [
  { id: "todo", title: "To do", tone: 1 },
  { id: "in_progress", title: "In progress", tone: 2 },
  { id: "completed", title: "Completed", tone: 3, done: true },
  { id: "cancelled", title: "Cancelled", tone: 4 },
];

type TaskBoardCard = TaskRecord & { column: TaskStatus };
const EMPTY_TASKS: TaskRecord[] = [];

function dateKey(value: string | null) {
  return value?.slice(0, 10) ?? "";
}

function displayDate(value: string | null) {
  if (!value) return "No due date";
  const [year, month, day] = dateKey(value).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(task: TaskRecord) {
  return (
    Boolean(task.dueDate) &&
    (task.status === "todo" || task.status === "in_progress") &&
    dateKey(task.dueDate) < new Date().toLocaleDateString("en-CA")
  );
}

function TaskListSkeleton() {
  return (
    <div role="status" aria-label="Loading tasks" className="space-y-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-border py-4"
        >
          <Skeleton shape="block" width={18} height={18} />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton width="42%" height={15} />
            <Skeleton width="68%" height={12} />
          </div>
          <Skeleton width={78} height={20} />
          <Skeleton width={62} height={20} />
        </div>
      ))}
    </div>
  );
}

function TaskBoardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading task board"
      className="flex gap-3 overflow-hidden"
    >
      {taskColumns.map((column) => (
        <section
          key={column.id}
          className="w-67 shrink-0 rounded-[18px] border border-border p-3"
        >
          <Skeleton width="45%" height={16} />
          <div className="mt-4 space-y-2">
            <Skeleton shape="block" height={88} />
            <Skeleton shape="block" height={88} />
          </div>
        </section>
      ))}
    </div>
  );
}

export function TasksPage() {
  const queryClient = useQueryClient();
  const { notify } = useNotifications();
  const [view, setView] = useState<"list" | "board">("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [relatedEntityType, setRelatedEntityType] = useState("");
  const [sortBy, setSortBy] = useState<TaskListParams["sortBy"]>("dueDate");
  const [sortDirection, setSortDirection] =
    useState<TaskListParams["sortDirection"]>("asc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [listError, setListError] = useState("");
  const [boardCards, setBoardCards] = useState<TaskBoardCard[]>([]);

  const params: TaskListParams = {
    page: view === "board" ? 1 : page,
    limit: view === "board" ? 100 : 10,
    search,
    ...(status ? { status: status as TaskStatus } : {}),
    ...(priority ? { priority: priority as TaskPriority } : {}),
    ...(type ? { type: type as TaskType } : {}),
    ...(dueDateFilter
      ? { dueDateFilter: dueDateFilter as NonNullable<TaskListParams["dueDateFilter"]> }
      : {}),
    ...(relatedEntityType
      ? { relatedEntityType: relatedEntityType as RelatedEntityType }
      : {}),
    sortBy,
    sortDirection,
  };
  const tasksQuery = useQuery({
    queryKey: ["tasks", params],
    queryFn: () => tasksApi.list(params),
  });
  const detailsQuery = useQuery({
    queryKey: ["tasks", "detail", detailsId],
    queryFn: () => tasksApi.get(detailsId as string),
    enabled: Boolean(detailsId),
  });
  const tasks = tasksQuery.data?.data ?? EMPTY_TASKS;
  const meta = tasksQuery.data?.meta;
  const allVisibleSelected =
    tasks.length > 0 && tasks.every((task) => selectedIds.includes(task.id));

  useEffect(() => {
    setBoardCards(tasks.map((task) => ({ ...task, column: task.status })));
  }, [tasks]);

  const refreshTasks = async () => {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleError = (error: unknown, fallback: string) => {
    notify({
      title: error instanceof Error ? error.message : fallback,
      variant: "error",
    });
  };

  const saveTask = async (input: TaskInput) => {
    try {
      if (editingTask) await tasksApi.update(editingTask.id, input);
      else await tasksApi.create(input);
      await refreshTasks();
      setEditingTask(null);
      notify({
        title: editingTask ? "Task updated" : "Task created",
        variant: "success",
      });
    } catch (error) {
      handleError(error, "Task could not be saved.");
      throw error;
    }
  };

  const updateStatus = async (task: TaskRecord, nextStatus: TaskStatus) => {
    try {
      await tasksApi.update(task.id, { status: nextStatus });
      await refreshTasks();
      await detailsQuery.refetch();
      notify({
        title: nextStatus === "completed" ? "Task completed" : "Task status updated",
        variant: "success",
      });
    } catch (error) {
      handleError(error, "Task status could not be updated.");
    }
  };

  const moveTask = async (task: TaskBoardCard, column: KanbanColumn) => {
    if (task.status === column.id) return;
    try {
      await tasksApi.update(task.id, { status: column.id as TaskStatus });
      await refreshTasks();
      notify({ title: `Moved to ${column.title}`, variant: "success" });
    } catch (error) {
      handleError(error, "Task status could not be updated.");
      throw error;
    }
  };

  const deleteTask = async (task: TaskRecord) => {
    try {
      await tasksApi.delete(task.id);
      setDetailsId(null);
      setSelectedIds((ids) => ids.filter((id) => id !== task.id));
      await refreshTasks();
      notify({ title: "Task deleted", variant: "success" });
    } catch (error) {
      handleError(error, "Task could not be deleted.");
      throw error;
    }
  };

  const runBulk = async (action: "complete" | "delete" | TaskPriority) => {
    if (!selectedIds.length) return;
    try {
      if (action === "complete") await tasksApi.bulkComplete(selectedIds);
      else if (action === "delete") await tasksApi.bulkDelete(selectedIds);
      else await tasksApi.bulkPriority(selectedIds, action);
      setSelectedIds([]);
      setDeleteSelectedOpen(false);
      await refreshTasks();
      notify({
        title:
          action === "complete"
            ? "Selected tasks completed"
            : action === "delete"
              ? "Selected tasks deleted"
              : "Priority updated",
        variant: "success",
      });
    } catch (error) {
      handleError(error, "The selected tasks could not be updated.");
      throw error;
    }
  };

  const updateFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & follow-ups"
        description="Keep planned work and relationship follow-ups moving."
      >
        {
          <Button
            icon={<Plus />}
            onClick={() => {
              setEditingTask(null);
              setFormOpen(true);
            }}
          >
            Add task
          </Button>
        }
      </PageHeader>

      <section aria-label="Task filters" className="space-y-3">
        <Tabs
          label="Tasks view"
          value={view}
          onValueChange={(value) => {
            setView(value as "list" | "board");
            setPage(1);
            setSelectedIds([]);
          }}
          variant="pills"
          className="w-fit"
          items={[
            { value: "list", label: "List", icon: <List /> },
            { value: "board", label: "Board", icon: <Columns3 /> },
          ]}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Input
            placeholder="Search title or description"
            value={search}
            clearable
            onChange={(event) => updateFilter(setSearch, event.currentTarget.value)}
          />
          <PillSelect
            label="Status"
            options={statusOptions}
            value={status}
            block
            size="md"
            onValueChange={(value) => updateFilter(setStatus, value)}
          />
          <PillSelect
            label="Priority"
            options={priorityOptions}
            value={priority}
            block
            size="md"
            onValueChange={(value) => updateFilter(setPriority, value)}
          />
          <PillSelect
            label="Type"
            options={typeOptions}
            value={type}
            block
            size="md"
            onValueChange={(value) => updateFilter(setType, value)}
          />
          <PillSelect
            label="Due date"
            options={dueDateOptions}
            value={dueDateFilter}
            block
            size="md"
            onValueChange={(value) => updateFilter(setDueDateFilter, value)}
          />
          <PillSelect
            label="Related record"
            options={relatedTypeOptions}
            value={relatedEntityType}
            block
            size="md"
            onValueChange={(value) => updateFilter(setRelatedEntityType, value)}
          />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-end gap-3">
            <PillSelect
              label="Sort by"
              options={sortOptions}
              value={sortBy}
              size="md"
              onValueChange={(value) => {
                setSortBy(value as TaskListParams["sortBy"]);
                setPage(1);
              }}
            />
            <PillSelect
              label="Direction"
              options={[
                { value: "asc", label: "Ascending" },
                { value: "desc", label: "Descending" },
              ]}
              value={sortDirection}
              size="md"
              onValueChange={(value) => {
                setSortDirection(value as TaskListParams["sortDirection"]);
                setPage(1);
              }}
            />
          </div>
          {meta ? (
            <p className="pb-2 text-xs text-muted-foreground" aria-live="polite">
              {meta.total} {meta.total === 1 ? "task" : "tasks"}
            </p>
          ) : null}
        </div>
      </section>

      {selectedIds.length ? (
        <div className="flex flex-wrap items-center gap-2 border-y border-border py-3">
          <span className="mr-1 text-sm font-medium">
            {selectedIds.length} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            icon={<CheckCheck />}
            onClick={() => void runBulk("complete").catch(() => undefined)}
          >
            Complete
          </Button>
          <PillSelect
            label="Change selected priority"
            placeholder="Change priority"
            options={priorityOptions.slice(1)}
            value={null}
            size="sm"
            onValueChange={(value) =>
              void runBulk(value as TaskPriority).catch(() => undefined)
            }
          />
          <ConfirmationDialog
            open={deleteSelectedOpen}
            onOpenChange={setDeleteSelectedOpen}
            title="Delete selected tasks?"
            description={`${selectedIds.length} tasks and their reminder schedules will be permanently removed.`}
            confirmLabel="Delete tasks"
            tone="destructive"
            onConfirm={() => runBulk("delete")}
            trigger={
              <Button size="sm" variant="destructive" icon={<Trash2 />}>
                Delete
              </Button>
            }
          />
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
            Clear selection
          </Button>
        </div>
      ) : null}

      {tasksQuery.isLoading ? (
        view === "board" ? (
          <TaskBoardSkeleton />
        ) : (
          <TaskListSkeleton />
        )
      ) : tasksQuery.isError ? (
        <div className="border-y border-border py-8">
          <EmptyState
            scene="offline"
            title="Tasks could not be loaded"
            description="Check your connection and try again."
            action={
              <Button
                variant="outline"
                onClick={() =>
                  void tasksQuery.refetch().catch((error: unknown) => {
                    setListError(
                      error instanceof Error
                        ? error.message
                        : "Tasks could not be loaded.",
                    );
                  })
                }
              >
                Try again
              </Button>
            }
          />
          {listError ? (
            <p role="alert" className="sr-only">
              {listError}
            </p>
          ) : null}
        </div>
      ) : tasks.length ? (
        view === "board" ? (
          <div className="min-w-0 overflow-x-clip pb-2">
            <KanbanBoard
              label="Task status board"
              columns={taskColumns}
              cards={boardCards}
              onCardsChange={setBoardCards}
              cardLabel={(task) => task.title}
              onMove={moveTask}
              renderCard={(task) => {
                const overdue = isOverdue({ ...task, status: task.column });
                return (
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDetailsId(task.id);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      className={`block max-w-full truncate text-left text-[13px] font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${task.column === "completed" ? "text-muted-foreground line-through" : ""}`}
                    >
                      {task.title}
                    </button>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {task.type === "follow_up" ? "Follow-up" : "Task"}
                      {task.relatedEntity ? ` · ${task.relatedEntity.label}` : ""}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
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
                      <span
                        className={`truncate text-[11px] ${overdue ? "font-medium text-destructive" : "text-muted-foreground"}`}
                      >
                        {overdue ? "Overdue · " : ""}
                        {displayDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 border-y border-border py-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                aria-label="Select all tasks on this page"
                checked={allVisibleSelected}
                onChange={(event) =>
                  setSelectedIds((ids) =>
                    event.currentTarget.checked
                      ? [...new Set([...ids, ...tasks.map((task) => task.id)])]
                      : ids.filter((id) => !tasks.some((task) => task.id === id)),
                  )
                }
                className="size-4 accent-primary"
              />
              <span>Task</span>
            </div>
            <ul className="divide-y divide-border">
              {tasks.map((task) => {
                const overdue = isOverdue(task);
                return (
                  <li key={task.id} className="flex min-w-0 items-center gap-3 py-4">
                    <input
                      type="checkbox"
                      aria-label={`Select ${task.title}`}
                      checked={selectedIds.includes(task.id)}
                      onChange={(event) =>
                        setSelectedIds((ids) =>
                          event.currentTarget.checked
                            ? [...ids, task.id]
                            : ids.filter((id) => id !== task.id),
                        )
                      }
                      className="size-4 shrink-0 accent-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        className={`max-w-full truncate text-left text-sm font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${task.status === "completed" ? "text-muted-foreground line-through" : ""}`}
                        onClick={() => setDetailsId(task.id)}
                      >
                        {task.title}
                      </button>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{task.type === "follow_up" ? "Follow-up" : "Task"}</span>
                        <span aria-hidden="true">·</span>
                        <span className={overdue ? "font-medium text-destructive" : ""}>
                          {overdue ? "Overdue · " : ""}
                          {displayDate(task.dueDate)}
                          {task.dueTime ? ` at ${task.dueTime}` : ""}
                        </span>
                        {task.relatedEntity ? (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">
                              {task.relatedEntity.type}: {task.relatedEntity.label}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="hidden shrink-0 items-center gap-2 sm:flex">
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
                        tone={
                          task.status === "completed"
                            ? "success"
                            : task.status === "in_progress"
                              ? "primary"
                              : "neutral"
                        }
                        size="sm"
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                    {task.status !== "completed" && task.status !== "cancelled" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        icon={<Check />}
                        aria-label={`Complete ${task.title}`}
                        title="Complete task"
                        onClick={() => void updateStatus(task, "completed")}
                      />
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {meta ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                  Page {meta.page} of {Math.max(1, meta.totalPages)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    icon={<ChevronLeft />}
                    aria-label="Previous page"
                    disabled={!meta.hasPreviousPage}
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    icon={<ChevronRight />}
                    aria-label="Next page"
                    disabled={!meta.hasNextPage}
                    onClick={() => setPage((value) => value + 1)}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )
      ) : (
        <EmptyState
          scene={
            search || status || priority || type || dueDateFilter || relatedEntityType
              ? "search"
              : "inbox"
          }
          title={
            search || status || priority || type || dueDateFilter || relatedEntityType
              ? "No matching tasks"
              : "Nothing on your list yet"
          }
          description={
            search || status || priority || type || dueDateFilter || relatedEntityType
              ? "Try changing the search or filters."
              : "Create a task or follow-up to keep the next action visible."
          }
          action={
            search ||
            status ||
            priority ||
            type ||
            dueDateFilter ||
            relatedEntityType ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPriority("");
                  setType("");
                  setDueDateFilter("");
                  setRelatedEntityType("");
                  setPage(1);
                }}
              >
                Clear filters
              </Button>
            ) : (
              <Button icon={<Plus />} onClick={() => setFormOpen(true)}>
                Add task
              </Button>
            )
          }
        />
      )}

      <TaskFormSheet
        open={formOpen}
        task={editingTask}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        onSave={saveTask}
      />
      <TaskDetailsSheet
        open={Boolean(detailsId)}
        task={detailsQuery.data ?? tasks.find((task) => task.id === detailsId) ?? null}
        loading={detailsQuery.isLoading}
        error={detailsQuery.isError}
        onOpenChange={(open) => {
          if (!open) setDetailsId(null);
        }}
        onRetry={() => void detailsQuery.refetch()}
        onEdit={(task) => {
          setEditingTask(task);
          setDetailsId(null);
          setFormOpen(true);
        }}
        onComplete={(task) => void updateStatus(task, "completed")}
        onCancel={(task) => void updateStatus(task, "cancelled")}
        onDelete={deleteTask}
      />
    </div>
  );
}

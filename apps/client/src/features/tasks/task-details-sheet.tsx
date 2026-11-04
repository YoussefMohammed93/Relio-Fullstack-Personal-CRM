import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { EmptyState } from "@/components/empty-state";
import { Sheet } from "@/components/sheet";
import { Skeleton } from "@/components/skeleton";
import type { TaskRecord } from "./tasks.api";

function displayDate(value: string | null) {
  if (!value) return "No due date";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TaskDetailsSheet({
  open,
  task,
  loading,
  error,
  onOpenChange,
  onRetry,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
}: {
  open: boolean;
  task: TaskRecord | null;
  loading: boolean;
  error: boolean;
  onOpenChange: (open: boolean) => void;
  onRetry: () => void;
  onEdit: (task: TaskRecord) => void;
  onComplete: (task: TaskRecord) => void;
  onCancel: (task: TaskRecord) => void;
  onDelete: (task: TaskRecord) => Promise<void>;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const completed = task?.status === "completed";

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={task?.title ?? "Task details"}
      description={task?.type === "follow_up" ? "Follow-up" : "Task"}
      width={520}
      fitContent
    >
      {loading ? (
        <div role="status" aria-label="Loading task details" className="space-y-4 py-2">
          <Skeleton height={18} width="42%" />
          <Skeleton height={72} />
          <Skeleton height={18} width="65%" />
          <Skeleton height={18} width="50%" />
        </div>
      ) : error || !task ? (
        <EmptyState
          scene="offline"
          title="Task details unavailable"
          description="The task could not be loaded."
          action={
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge tone={task.status === "completed" ? "success" : "neutral"}>
              {task.status.replace("_", " ")}
            </Badge>
            <Badge
              tone={
                task.priority === "high"
                  ? "danger"
                  : task.priority === "medium"
                    ? "warning"
                    : "neutral"
              }
            >
              {`${task.priority} priority`}
            </Badge>
            {task.type === "follow_up" ? <Badge tone="primary">Follow-up</Badge> : null}
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Description</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
              {task.description || "No description"}
            </p>
          </div>
          <dl className="grid gap-x-6 gap-y-4 border-y border-border py-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Due</dt>
              <dd className="mt-1 text-sm font-medium">
                {displayDate(task.dueDate)}
                {task.dueTime ? ` at ${task.dueTime}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Reminder</dt>
              <dd className="mt-1 text-sm font-medium">
                {task.reminderAt ? "One day before due date" : "Not scheduled"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Related record</dt>
              <dd className="mt-1 text-sm font-medium">
                {task.relatedEntity
                  ? `${task.relatedEntity.type}: ${task.relatedEntity.label}`
                  : "None"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Completed</dt>
              <dd className="mt-1 text-sm font-medium">
                {task.completedAt
                  ? new Date(task.completedAt).toLocaleString()
                  : "Not completed"}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-2">
            {!completed && task.status !== "cancelled" ? (
              <Button icon={<Check />} onClick={() => onComplete(task)}>
                Complete
              </Button>
            ) : null}
            {task.status === "todo" || task.status === "in_progress" ? (
              <Button variant="outline" icon={<X />} onClick={() => onCancel(task)}>
                Cancel task
              </Button>
            ) : null}
            <Button variant="outline" icon={<Pencil />} onClick={() => onEdit(task)}>
              Edit
            </Button>
            <ConfirmationDialog
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              title="Delete task?"
              description="This task and its reminder schedule will be permanently removed."
              confirmLabel="Delete task"
              tone="destructive"
              onConfirm={() => onDelete(task)}
              trigger={
                <Button variant="destructive" icon={<Trash2 />}>
                  Delete
                </Button>
              }
            />
          </div>
        </div>
      )}
    </Sheet>
  );
}

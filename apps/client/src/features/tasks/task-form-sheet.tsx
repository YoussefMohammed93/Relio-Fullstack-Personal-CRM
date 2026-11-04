import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Handshake, UserRound } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/button";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { Input } from "@/components/input";
import { PillSelect } from "@/components/pill-select";
import { Sheet } from "@/components/sheet";
import { Textarea } from "@/components/textarea";
import { companiesApi } from "@/features/companies/companies.api";
import { contactsApi } from "@/features/contacts/contacts.api";
import { dealsApi } from "@/features/deals/deals.api";
import type { RelatedEntityType, TaskInput, TaskRecord } from "./tasks.api";
import { taskFormSchema, type TaskFormValues } from "./task-form-schema";

const typeOptions = [
  { value: "task", label: "Task" },
  { value: "follow_up", label: "Follow-up" },
];
const statusOptions = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];
const relatedTypeOptions = [
  { value: "", label: "No related record" },
  { value: "Contact", label: "Contact" },
  { value: "Company", label: "Company" },
  { value: "Deal", label: "Deal" },
];

function valuesFor(task?: TaskRecord | null): TaskFormValues {
  return {
    title: task?.title ?? "",
    description: task?.description ?? "",
    type: task?.type ?? "task",
    status: task?.status ?? "todo",
    priority: task?.priority ?? "medium",
    dueDate: task?.dueDate?.slice(0, 10) ?? "",
    dueTime: task?.dueTime ?? "",
    relatedEntityType: task?.relatedEntityType ?? "",
    relatedEntityId: task?.relatedEntity?.id ?? "",
  };
}

function entityIcon(type: RelatedEntityType) {
  if (type === "Contact") return <UserRound aria-hidden="true" className="size-4" />;
  if (type === "Company") return <Building2 aria-hidden="true" className="size-4" />;
  return <Handshake aria-hidden="true" className="size-4" />;
}

export function TaskFormSheet({
  open,
  task,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  task?: TaskRecord | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: TaskInput) => Promise<void>;
}) {
  const [selectedEntity, setSelectedEntity] = useState<ComboboxOption | null>(null);
  const [saveError, setSaveError] = useState("");
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: valuesFor(task),
  });
  const relatedEntityType = form.watch("relatedEntityType");

  useEffect(() => {
    if (!open) return;
    form.reset(valuesFor(task));
    setSelectedEntity(
      task?.relatedEntity
        ? {
            value: task.relatedEntity.id,
            label: task.relatedEntity.label,
            icon: entityIcon(task.relatedEntity.type),
          }
        : null,
    );
    setSaveError("");
  }, [form, open, task]);

  const searchEntities = async (query: string, signal: AbortSignal) => {
    if (relatedEntityType === "Contact") {
      const result = await contactsApi.list(
        { page: 1, limit: 20, search: query, sortBy: "name", sortDirection: "asc" },
        signal,
      );
      return result.data.map((contact) => ({
        value: contact.id,
        label: `${contact.firstName} ${contact.lastName}`.trim(),
        description: contact.email || undefined,
        icon: entityIcon("Contact"),
      }));
    }
    if (relatedEntityType === "Company") {
      const result = await companiesApi.list({
        page: 1,
        limit: 20,
        search: query,
        sortBy: "name",
        sortDirection: "asc",
      });
      return result.data.map((company) => ({
        value: company.id,
        label: company.name,
        icon: entityIcon("Company"),
      }));
    }
    if (relatedEntityType === "Deal") {
      const result = await dealsApi.list({
        page: 1,
        limit: 20,
        search: query,
        sortBy: "name",
        sortDirection: "asc",
      });
      return result.data.map((deal) => ({
        value: deal.id,
        label: deal.name,
        description: deal.company?.name || undefined,
        icon: entityIcon("Deal"),
      }));
    }
    return [];
  };

  const submit = form.handleSubmit(async (values) => {
    setSaveError("");
    try {
      await onSave({
        title: values.title,
        description: values.description,
        type: values.type,
        status: values.status,
        priority: values.priority,
        dueDate: values.dueDate || null,
        dueTime: values.dueTime || null,
        relatedEntityType: values.relatedEntityType
          ? (values.relatedEntityType as RelatedEntityType)
          : null,
        relatedEntityId: values.relatedEntityId || null,
      });
      onOpenChange(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Task could not be saved.");
    }
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={task ? "Edit task" : "Add task"}
      description="Plan the next action and keep every follow-up tied to the right record."
      width={560}
      fitContent
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" loading={form.formState.isSubmitting}>
            {task ? "Save changes" : "Create task"}
          </Button>
        </div>
      }
    >
      <form
        id="task-form"
        className="space-y-5"
        onSubmit={(event) => void submit(event)}
      >
        <Input
          label="Title"
          required
          autoFocus
          maxLength={160}
          error={form.formState.errors.title?.message}
          {...form.register("title")}
        />
        <Textarea
          label="Description"
          maxLength={5000}
          minRows={2}
          maxRows={5}
          error={form.formState.errors.description?.message}
          {...form.register("description")}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <PillSelect
                label="Type"
                block
                size="md"
                options={typeOptions}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <PillSelect
                label="Status"
                block
                size="md"
                options={statusOptions}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
          <Controller
            control={form.control}
            name="priority"
            render={({ field }) => (
              <PillSelect
                label="Priority"
                block
                size="md"
                options={priorityOptions}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Due date" type="date" {...form.register("dueDate")} />
          <Input label="Due time" type="time" {...form.register("dueTime")} />
        </div>
        <Controller
          control={form.control}
          name="relatedEntityType"
          render={({ field }) => (
            <PillSelect
              label="Related record type"
              block
              size="md"
              options={relatedTypeOptions}
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("relatedEntityId", "", { shouldValidate: true });
                setSelectedEntity(null);
              }}
            />
          )}
        />
        {relatedEntityType ? (
          <Controller
            control={form.control}
            name="relatedEntityId"
            render={({ field }) => (
              <div className="space-y-1.5">
                <Combobox
                  label={relatedEntityType}
                  placeholder={`Search ${relatedEntityType.toLowerCase()}s`}
                  searchPlaceholder="Search records"
                  value={selectedEntity}
                  onValueChange={(option) => {
                    setSelectedEntity(option);
                    field.onChange(option?.value ?? "");
                  }}
                  search={(query, { signal }) => searchEntities(query, signal)}
                  emptyMessage={(query) =>
                    query
                      ? "No matching records"
                      : `No ${relatedEntityType.toLowerCase()}s found`
                  }
                />
                {form.formState.errors.relatedEntityId?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.relatedEntityId.message}
                  </p>
                ) : null}
              </div>
            )}
          />
        ) : null}
        {saveError ? (
          <p role="alert" className="text-sm text-destructive">
            {saveError}
          </p>
        ) : null}
      </form>
    </Sheet>
  );
}

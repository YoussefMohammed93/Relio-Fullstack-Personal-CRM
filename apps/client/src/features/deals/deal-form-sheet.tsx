import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, UserRoundPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/button";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { Input } from "@/components/input";
import { PillSelect } from "@/components/pill-select";
import { Sheet } from "@/components/sheet";
import { Textarea } from "@/components/textarea";
import { ContactFormSheet } from "@/features/contacts/contact-form-sheet";
import type { Contact, ContactInput } from "@/features/contacts/contacts.api";
import type { Deal, DealInput, DealStage } from "./deals.api";
import { dealsApi } from "./deals.api";
import { dealFormSchema, type DealFormValues } from "./deal-form-schema";

const sortStages = (stages: DealStage[]) =>
  [...stages].sort((a, b) => a.order - b.order);

function valuesFor(
  deal?: Deal | null,
  initialStage?: DealStage | null,
  initialName = "",
): DealFormValues {
  return {
    name: deal?.name ?? initialName,
    value: deal?.value ?? 0,
    primaryContact: deal?.primaryContact?.id ?? "",
    company: deal?.company?.id ?? null,
    pipelineStage: deal?.pipelineStage?.id ?? initialStage?.id ?? "",
    probability: deal?.probability ?? initialStage?.defaultProbability ?? undefined,
    expectedCloseDate: deal?.expectedCloseDate?.slice(0, 10) ?? "",
    description: deal?.description ?? "",
  };
}

function contactOption(contact: Contact): ComboboxOption {
  return {
    value: contact.id,
    label: `${contact.firstName} ${contact.lastName}`.trim(),
    description: contact.email || undefined,
    keywords: contact.company ? [contact.company.name] : [],
  };
}

export function DealFormSheet({
  open,
  deal,
  stages,
  initialStage,
  initialName = "",
  onOpenChange,
  onSave,
}: {
  open: boolean;
  deal?: Deal | null;
  stages: DealStage[];
  initialStage?: DealStage | null;
  initialName?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (input: DealInput) => Promise<unknown>;
}) {
  const queryClient = useQueryClient();
  const [selectedContact, setSelectedContact] = useState<ComboboxOption | null>(
    deal?.primaryContact
      ? {
          value: deal.primaryContact.id,
          label: deal.primaryContact.name,
          description: deal.primaryContact.email || undefined,
        }
      : null,
  );
  const [selectedCompany, setSelectedCompany] = useState<ComboboxOption | null>(
    deal?.company ? { value: deal.company.id, label: deal.company.name } : null,
  );
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const pendingContact = useRef<{
    resolve: (option: ComboboxOption) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const [saveError, setSaveError] = useState("");
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: valuesFor(deal, initialStage, initialName),
  });
  const selectedStageId = form.watch("pipelineStage");
  const selectedStage = stages.find((stage) => stage.id === selectedStageId);
  const isClosed = deal != null && deal.status !== "open";

  useEffect(() => {
    if (!open) return;
    form.reset(valuesFor(deal, initialStage, initialName));
    setSelectedContact(
      deal?.primaryContact
        ? {
            value: deal.primaryContact.id,
            label: deal.primaryContact.name,
            description: deal.primaryContact.email || undefined,
          }
        : null,
    );
    setSelectedCompany(
      deal?.company ? { value: deal.company.id, label: deal.company.name } : null,
    );
    setSaveError("");
  }, [deal, form, initialName, initialStage, open]);

  const submit = form.handleSubmit(async (values) => {
    setSaveError("");
    if (selectedStage?.defaultProbability == null && values.probability == null) {
      form.setError("probability", {
        type: "required",
        message: "Enter a probability for this custom stage.",
      });
      return;
    }
    try {
      await onSave({
        name: values.name,
        value: values.value,
        primaryContact: values.primaryContact,
        company: values.company,
        pipelineStage: values.pipelineStage,
        ...(values.probability !== undefined
          ? { probability: values.probability }
          : {}),
        expectedCloseDate: values.expectedCloseDate || null,
        description: values.description,
      });
      onOpenChange(false);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "The Deal could not be saved.",
      );
    }
  });

  const createContactOption = () =>
    new Promise<ComboboxOption>((resolve, reject) => {
      pendingContact.current = { resolve, reject };
      setContactFormOpen(true);
    });

  const saveNewContact = async (input: ContactInput) => {
    const contact = await dealsApi.createContact(input);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["contacts"] }),
      queryClient.invalidateQueries({ queryKey: ["companies"] }),
    ]);
    const option = contactOption(contact);
    const company = contact.company;
    setSelectedContact(option);
    form.setValue("primaryContact", contact.id, { shouldValidate: true });
    if (company) {
      setSelectedCompany({ value: company.id, label: company.name });
      form.setValue("company", company.id);
    } else {
      setSelectedCompany(null);
      form.setValue("company", null);
    }
    pendingContact.current?.resolve(option);
    pendingContact.current = null;
  };

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            pendingContact.current?.reject(new Error("Contact creation cancelled"));
            pendingContact.current = null;
            setSaveError("");
          }
          onOpenChange(next);
        }}
        title={deal ? "Edit deal" : "Add deal"}
        description="Track the opportunity, its value, and the next step."
        width={560}
        fitContent
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="deal-form"
              loading={form.formState.isSubmitting}
            >
              {deal ? "Save changes" : "Create deal"}
            </Button>
          </div>
        }
      >
        <form
          id="deal-form"
          className="space-y-5"
          onSubmit={(event) => void submit(event)}
        >
          <Input
            label="Deal name"
            required
            autoFocus
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Deal value (USD)"
              type="number"
              min="0.01"
              step="0.01"
              required
              disabled={deal?.status === "won"}
              error={form.formState.errors.value?.message}
              {...form.register("value", { valueAsNumber: true })}
            />
            <Controller
              control={form.control}
              name="probability"
              render={({ field }) => (
                <Input
                  label="Probability (%)"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  disabled={isClosed}
                  hint={
                    selectedStage?.defaultProbability == null
                      ? "Custom stages require a probability."
                      : `Stage default: ${selectedStage.defaultProbability}%.`
                  }
                  error={form.formState.errors.probability?.message}
                  value={field.value ?? ""}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  onChange={(event) =>
                    field.onChange(
                      event.currentTarget.value === ""
                        ? undefined
                        : Number(event.currentTarget.value),
                    )
                  }
                />
              )}
            />
          </div>
          <Controller
            control={form.control}
            name="primaryContact"
            render={({ field }) => (
              <div className="space-y-1.5">
                <Combobox
                  label="Primary contact"
                  placeholder="Search contacts"
                  searchPlaceholder="Search by name or email"
                  emptyMessage={(query) =>
                    query ? "No matching contacts" : "No contacts yet"
                  }
                  createLabel={(query) => `Add contact “${query}”`}
                  onCreate={createContactOption}
                  value={selectedContact}
                  onValueChange={(option) => {
                    setSelectedContact(option);
                    field.onChange(option?.value ?? "");
                    if (!option) return;
                    void dealsApi.contactOptions(option.label).then((contacts) => {
                      const contact = contacts.find((item) => item.id === option.value);
                      if (contact?.company) {
                        setSelectedCompany({
                          value: contact.company.id,
                          label: contact.company.name,
                        });
                        form.setValue("company", contact.company.id);
                      } else {
                        setSelectedCompany(null);
                        form.setValue("company", null);
                      }
                    });
                  }}
                  search={async (query, { signal }) =>
                    (await dealsApi.contactOptions(query, signal)).map(contactOption)
                  }
                />
                {form.formState.errors.primaryContact?.message ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.primaryContact.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={form.control}
            name="company"
            render={({ field }) => (
              <Combobox
                label="Company"
                placeholder="Search companies"
                searchPlaceholder="Search your companies"
                clearable
                value={selectedCompany}
                onValueChange={(option) => {
                  setSelectedCompany(option);
                  field.onChange(option?.value ?? null);
                }}
                search={async (query, { signal }) => {
                  const companies = await dealsApi.companyOptions(query, signal);
                  return companies.map((company) => ({
                    value: company.id,
                    label: company.name,
                    icon: <Building2 aria-hidden="true" className="size-4" />,
                  }));
                }}
                emptyMessage={(query) =>
                  query ? "No matching companies" : "No companies yet"
                }
              />
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={form.control}
              name="pipelineStage"
              render={({ field }) => (
                <div className="space-y-1.5">
                  <span className="block text-xs font-medium text-foreground">
                    Pipeline stage
                  </span>
                  <PillSelect
                    label="Pipeline stage"
                    options={sortStages(stages).map((stage) => ({
                      value: stage.id,
                      label: stage.name,
                      description:
                        stage.defaultProbability == null
                          ? "Probability required"
                          : `${stage.defaultProbability}% default probability`,
                    }))}
                    value={field.value}
                    disabled={isClosed}
                    onValueChange={(value) => {
                      field.onChange(value);
                      const stage = stages.find((item) => item.id === value);
                      if (stage?.defaultProbability != null) {
                        form.setValue("probability", stage.defaultProbability, {
                          shouldValidate: true,
                        });
                      } else if (!deal) {
                        form.setValue("probability", undefined, {
                          shouldValidate: true,
                        });
                      }
                    }}
                    size="md"
                    block
                  />
                  {form.formState.errors.pipelineStage?.message ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.pipelineStage.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
            <Input
              label="Expected close date"
              type="date"
              {...form.register("expectedCloseDate")}
            />
          </div>
          <Textarea
            label="Description"
            maxLength={5000}
            error={form.formState.errors.description?.message}
            {...form.register("description")}
            minRows={3}
          />
          {saveError ? (
            <p role="alert" className="text-sm text-destructive">
              {saveError}
            </p>
          ) : null}
        </form>
      </Sheet>
      <ContactFormSheet
        open={contactFormOpen}
        onOpenChange={(next) => {
          setContactFormOpen(next);
          if (!next && pendingContact.current) {
            pendingContact.current.reject(new Error("Contact creation cancelled"));
            pendingContact.current = null;
          }
        }}
        onSave={saveNewContact}
      />
      <span className="sr-only" aria-hidden="true">
        <UserRoundPlus />
      </span>
    </>
  );
}

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/button";
import { Combobox, type ComboboxOption } from "@/components/combobox";
import { Input } from "@/components/input";
import { PillSelect } from "@/components/pill-select";
import { Sheet } from "@/components/sheet";
import { Textarea } from "@/components/textarea";
import type { Contact, ContactInput } from "./contacts.api";
import { contactsApi } from "./contacts.api";
import {
  CONTACT_TYPE_OPTIONS,
  contactFormSchema,
  type ContactFormValues,
} from "./contact-form-schema";

const emptyValues: ContactFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: null,
  contactType: "lead",
  jobTitle: "",
  tags: [],
  website: "",
  notes: "",
};

function contactToValues(
  contact?: Contact | null,
  defaultCompany?: { id: string; name: string } | null,
): ContactFormValues {
  if (!contact) return { ...emptyValues, company: defaultCompany?.id ?? null };
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    company: contact.company?.id ?? null,
    contactType: contact.contactType,
    jobTitle: contact.jobTitle,
    tags: contact.tags,
    website: contact.website,
    notes: contact.notes,
  };
}

export function ContactFormSheet({
  open,
  contact,
  defaultCompany,
  companyLocked = false,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  contact?: Contact | null;
  defaultCompany?: { id: string; name: string } | null;
  companyLocked?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: ContactInput) => Promise<void>;
}) {
  const [selectedCompany, setSelectedCompany] = useState<ComboboxOption | null>(
    contact?.company
      ? { value: contact.company.id, label: contact.company.name }
      : defaultCompany
        ? { value: defaultCompany.id, label: defaultCompany.name }
        : null,
  );
  const [saveError, setSaveError] = useState("");
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactToValues(contact, defaultCompany),
  });

  useEffect(() => {
    if (open) {
      reset(contactToValues(contact, defaultCompany));
      setSelectedCompany(
        contact?.company
          ? { value: contact.company.id, label: contact.company.name }
          : defaultCompany
            ? { value: defaultCompany.id, label: defaultCompany.name }
            : null,
      );
      setSaveError("");
    }
  }, [contact, defaultCompany, open, reset]);

  const submit = handleSubmit(async (values) => {
    setSaveError("");
    try {
      await onSave({
        ...values,
        ...(values.email ? { email: values.email } : { email: "" }),
        company: values.company,
      });
      reset(contactToValues(contact, defaultCompany));
      onOpenChange(false);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "The contact could not be saved.",
      );
    }
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset(contactToValues(contact));
          setSaveError("");
          setSelectedCompany(
            contact?.company
              ? { value: contact.company.id, label: contact.company.name }
              : defaultCompany
                ? { value: defaultCompany.id, label: defaultCompany.name }
                : null,
          );
        }
        onOpenChange(next);
      }}
      title={contact ? "Edit contact" : "Add contact"}
      description="Keep the details you need to manage this relationship."
      width={520}
      fitContent
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="contact-form" loading={isSubmitting}>
            {contact ? "Save changes" : "Create contact"}
          </Button>
        </div>
      }
    >
      <form
        id="contact-form"
        className="space-y-5"
        onSubmit={(event) => void submit(event)}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="First name"
            required
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            label="Last name"
            required
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Job title"
            error={errors.jobTitle?.message}
            {...register("jobTitle")}
          />
          <Controller
            control={control}
            name="contactType"
            render={({ field }) => (
              <div className="space-y-1.5">
                <span className="block text-xs font-medium text-foreground">
                  Contact type
                </span>
                <PillSelect
                  label="Contact type"
                  options={CONTACT_TYPE_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                  size="md"
                  block
                />
              </div>
            )}
          />
        </div>

        <Controller
          control={control}
          name="company"
          render={({ field }) => (
            <div className="space-y-1.5">
              {companyLocked && defaultCompany ? (
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-foreground">
                    Company
                  </span>
                  <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm">
                    <Building2
                      aria-hidden="true"
                      className="size-4 text-muted-foreground"
                    />
                    <span className="truncate">{defaultCompany.name}</span>
                  </div>
                </div>
              ) : (
                <Combobox
                  label="Company"
                  placeholder="Search your companies"
                  searchPlaceholder="Search companies"
                  emptyMessage={(query) =>
                    query
                      ? "No matching companies"
                      : "No companies yet. Add a company first."
                  }
                  clearable
                  value={selectedCompany}
                  onValueChange={(option) => {
                    setSelectedCompany(option);
                    field.onChange(option?.value ?? null);
                  }}
                  search={async (query, { signal }) => {
                    const options = await contactsApi.companyOptions(query, signal);
                    return options.map((option) => ({
                      value: option.id,
                      label: option.name,
                    }));
                  }}
                />
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="tags"
          render={({ field }) => (
            <Input
              label="Tags"
              hint="Separate tags with commas."
              error={errors.tags?.message}
              value={field.value.join(", ")}
              onValueChange={(value) =>
                field.onChange(
                  value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                )
              }
              placeholder="Design, Referral"
            />
          )}
        />
        <Input
          label="Website"
          type="url"
          placeholder="https://example.com"
          error={errors.website?.message}
          {...register("website")}
        />
        <Textarea
          label="Notes"
          maxLength={5000}
          error={errors.notes?.message}
          {...register("notes")}
          minRows={3}
        />
        {saveError ? (
          <p role="alert" className="text-sm text-destructive">
            {saveError}
          </p>
        ) : null}
      </form>
    </Sheet>
  );
}

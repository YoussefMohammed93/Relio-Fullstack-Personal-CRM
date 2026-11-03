import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { PillSelect } from "@/components/pill-select";
import { Sheet } from "@/components/sheet";
import { Textarea } from "@/components/textarea";
import {
  COMPANY_INDUSTRIES,
  COMPANY_SIZES,
  companiesApi,
  type Company,
  type CompanyInput,
} from "./companies.api";
import { companyFormSchema, type CompanyFormValues } from "./company-form-schema";

const emptyValues: CompanyFormValues = {
  name: "",
  website: "",
  industry: "",
  email: "",
  phone: "",
  address: { street: "", city: "", state: "", postalCode: "", country: "" },
  description: "",
  companySize: "",
  annualRevenue: null,
  linkedInUrl: "",
  logoUrl: "",
};

function companyToValues(company?: Company | null): CompanyFormValues {
  if (!company) return { ...emptyValues, address: { ...emptyValues.address } };
  return {
    ...company,
    address: { ...emptyValues.address, ...company.address },
  };
}

function companyInitials(name: string) {
  const trimmed = name.trim();
  return `${trimmed.slice(0, 1)} ${trimmed.slice(1, 2)}`.trim().toUpperCase();
}

export function CompanyFormSheet({
  open,
  company,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  company?: Company | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: CompanyInput) => Promise<void>;
}) {
  const [duplicateMatches, setDuplicateMatches] = useState<
    { id: string; name: string }[]
  >([]);
  const [duplicateFor, setDuplicateFor] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [uploading, setUploading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: companyToValues(company),
  });
  const name = watch("name");
  const logoUrl = watch("logoUrl");

  useEffect(() => {
    if (!open) return;
    reset(companyToValues(company));
    setDuplicateMatches([]);
    setDuplicateFor("");
    setUploadError("");
    setSaveError("");
  }, [company, open, reset]);

  const checkDuplicates = async () => {
    const value = name.trim();
    if (!value) return;
    setDuplicateFor(value);
    try {
      setDuplicateMatches(await companiesApi.duplicates(value, company?.id));
    } catch {
      setDuplicateMatches([]);
    }
  };

  const submit = handleSubmit(async (values) => {
    setSaveError("");
    try {
      await onSave(values as CompanyInput);
      onOpenChange(false);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "The company could not be saved.",
      );
    }
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset(companyToValues(company));
          setDuplicateMatches([]);
          setSaveError("");
        }
        onOpenChange(next);
      }}
      title={company ? "Edit company" : "Add company"}
      description="Keep the organization details and relationships together."
      width={560}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="company-form" loading={isSubmitting}>
            {company ? "Save changes" : "Create company"}
          </Button>
        </div>
      }
    >
      <form
        id="company-form"
        className="flex flex-col gap-5"
        onSubmit={(event) => void submit(event)}
      >
        <div className="flex items-center gap-4">
          <Avatar
            name={companyInitials(name || company?.name || "Company")}
            src={logoUrl || undefined}
            size="lg"
            shape="square"
          />
          <div className="min-w-0 flex-1">
            <label
              htmlFor="company-logo"
              className="text-xs font-medium text-foreground"
            >
              Company logo
            </label>
            <input
              id="company-logo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setUploadError("");
                setUploading(true);
                try {
                  const uploaded = await companiesApi.uploadLogo(file);
                  setValue("logoUrl", uploaded.secureUrl, { shouldDirty: true });
                } catch (error) {
                  setUploadError(
                    error instanceof Error ? error.message : "Logo upload failed.",
                  );
                } finally {
                  setUploading(false);
                  event.target.value = "";
                }
              }}
              className="mt-1 block w-full min-w-0 text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-xs file:font-medium file:text-foreground hover:file:bg-accent"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {uploading ? "Uploading…" : "JPEG, PNG, or WebP; up to 5 MB."}
            </p>
            {uploadError ? (
              <p role="alert" className="mt-1 text-xs text-destructive">
                {uploadError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Company name"
            required
            autoComplete="organization"
            error={errors.name?.message}
            {...register("name", {
              onChange: () => {
                setDuplicateMatches([]);
                setDuplicateFor("");
              },
              onBlur: () => void checkDuplicates(),
            })}
          />
          <Controller
            control={control}
            name="industry"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <span className="block text-xs font-medium text-foreground">
                  Industry
                </span>
                <PillSelect
                  label="Industry"
                  options={[
                    { value: "", label: "Select industry" },
                    ...COMPANY_INDUSTRIES,
                  ]}
                  value={field.value}
                  onValueChange={field.onChange}
                  size="md"
                  block
                />
              </div>
            )}
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
            label="Website"
            type="url"
            placeholder="https://example.com"
            error={errors.website?.message}
            {...register("website")}
          />
          <Input
            label="LinkedIn URL"
            type="url"
            placeholder="https://linkedin.com/company/..."
            error={errors.linkedInUrl?.message}
            {...register("linkedInUrl")}
          />
          <Controller
            control={control}
            name="companySize"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <span className="block text-xs font-medium text-foreground">
                  Company size
                </span>
                <PillSelect
                  label="Company size"
                  options={[
                    { value: "", label: "Select company size" },
                    ...COMPANY_SIZES,
                  ]}
                  value={field.value}
                  onValueChange={field.onChange}
                  size="md"
                  block
                />
              </div>
            )}
          />
          <Controller
            control={control}
            name="annualRevenue"
            render={({ field }) => (
              <Input
                label="Annual revenue (USD)"
                type="number"
                min={0}
                step="1"
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(value === "" ? null : Number(value))
                }
                error={errors.annualRevenue?.message}
                trailing={<span>USD</span>}
              />
            )}
          />
        </div>

        {duplicateFor === name.trim() && duplicateMatches.length ? (
          <div
            role="status"
            className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm"
          >
            <p className="font-medium">A company with this name may already exist.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {duplicateMatches.map((match) => match.name).join(", ")}. You can still
              continue.
            </p>
          </div>
        ) : null}

        <fieldset className="flex flex-col gap-3">
          <legend className="text-xs font-semibold">Address</legend>
          <Input
            label="Street"
            autoComplete="street-address"
            error={errors.address?.street?.message}
            {...register("address.street")}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="City"
              autoComplete="address-level2"
              {...register("address.city")}
            />
            <Input
              label="State / region"
              autoComplete="address-level1"
              {...register("address.state")}
            />
            <Input
              label="Postal code"
              autoComplete="postal-code"
              {...register("address.postalCode")}
            />
            <Input
              label="Country"
              autoComplete="country-name"
              {...register("address.country")}
            />
          </div>
        </fieldset>
        <Textarea
          label="Description"
          maxLength={5000}
          error={errors.description?.message}
          {...register("description")}
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

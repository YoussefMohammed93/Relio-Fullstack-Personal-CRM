import { useState } from "react";
import { Ellipsis, Info, PanelRight, Search } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Dialog } from "@/components/dialog";
import { DropdownMenu } from "@/components/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import {
  FilterBar,
  matchFilters,
  type Filter,
  type FilterField,
} from "@/components/filter-bar";
import { Input } from "@/components/input";
import { Pagination } from "@/components/pagination";
import { PillSelect } from "@/components/pill-select";
import { Popover } from "@/components/popover";
import { RadioGroup } from "@/components/radio-group";
import { SearchInput } from "@/components/search-input";
import { Sheet } from "@/components/sheet";
import { Skeleton } from "@/components/skeleton";
import { Spinner } from "@/components/spinner";
import { Switch } from "@/components/switch";
import { Tabs } from "@/components/tabs";
import { Textarea } from "@/components/textarea";
import { Tooltip } from "@/components/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNotifications } from "@/providers/notification-provider";

interface PreviewRecord {
  id: string;
  contact: string;
  stage: string;
  value: number;
}

const previewRows: PreviewRecord[] = [
  { id: "record-1", contact: "Maya Chen", stage: "Proposal", value: 8400 },
  { id: "record-2", contact: "Theo Martin", stage: "Qualified", value: 5200 },
  { id: "record-3", contact: "Amara Okafor", stage: "Negotiation", value: 11600 },
];

const stageOptions = [
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
];

const filterFields: FilterField<PreviewRecord>[] = [
  {
    id: "stage",
    label: "Stage",
    type: "option",
    options: stageOptions,
    get: (record) => record.stage.toLowerCase(),
  },
  { id: "contact", label: "Contact", type: "text" },
  { id: "value", label: "Deal value", type: "number", unit: ["dollar", "dollars"] },
];

const columns: DataTableColumn<PreviewRecord>[] = [
  {
    key: "contact",
    header: "Contact",
    sortable: true,
    searchable: true,
    card: "title",
  },
  { key: "stage", header: "Stage", sortable: true, card: "subtitle" },
  {
    key: "value",
    header: "Value",
    align: "right",
    sortable: true,
    card: "trailing",
    cell: (record) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(record.value),
  },
];

export function ComponentSurfacePreview() {
  const [checked, setChecked] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [selectValue, setSelectValue] = useState("proposal");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [page, setPage] = useState(2);
  const { notify } = useNotifications();
  const filteredRows = matchFilters(previewRows, filters, filterFields).filter(
    (record) => record.contact.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-label font-semibold text-primary">
              RELIO · UI FOUNDATION
            </p>
            <h1 className="mt-2 text-page-title">Reusable component surface</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Local fixture state only. Nothing here reads or changes workspace records.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            icon={<Search />}
            onClick={() =>
              notify({ title: "Toast notification preview", variant: "success" })
            }
          >
            Show toast
          </Button>
        </header>

        <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Form controls</CardTitle>
              <CardDescription>
                Labels, helper text, validation surfaces, and native inputs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input
                label="Contact name"
                placeholder="Name"
                hint="Shown on the record."
              />
              <Textarea
                label="Notes"
                placeholder="Add a note"
                maxLength={180}
                minRows={2}
                maxRows={4}
              />
              <Checkbox
                checked={checked}
                onCheckedChange={setChecked}
                label="Keep this preference"
                description="A native checkbox with a mixed state supported."
              />
              <RadioGroup
                label="Default view"
                showLabel
                orientation="horizontal"
                options={[
                  { value: "table", label: "Table" },
                  { value: "grid", label: "Grid" },
                ]}
                defaultValue="table"
              />
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
                label="Enable reminders"
                description="Local preview state only."
                labelPosition="start"
              />
              <PillSelect
                label="Pipeline stage"
                value={selectValue}
                onValueChange={setSelectValue}
                options={stageOptions}
                block
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search and filters</CardTitle>
              <CardDescription>
                Debounced search and editable local filters.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <SearchInput
                placeholder="Search preview contacts"
                shortcut={null}
                onSearch={setSearch}
              />
              <FilterBar
                fields={filterFields}
                value={filters}
                onValueChange={setFilters}
                count={filteredRows.length}
                total={previewRows.length}
                noun={["record", "records"]}
                hotkey={null}
              />
              <DataTable
                aria-label="Local component preview records"
                columns={columns}
                rows={filteredRows}
                pageSize={3}
                noun={["record", "records"]}
              />
              <Pagination page={page} pageCount={5} onPageChange={setPage} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>State and identity</CardTitle>
              <CardDescription>
                Status markers, avatars, and loading placeholders.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">Lead</Badge>
                <Badge tone="primary" dot>
                  Open
                </Badge>
                <Badge tone="success" dot="pulse">
                  Won
                </Badge>
                <Badge tone="warning" outline>
                  Follow-up
                </Badge>
                <Badge tone="danger" count={3} />
              </div>
              <div className="flex items-center gap-3">
                <Avatar name="Maya Chen" status="online" />
                <Avatar name="Theo Martin" size="sm" shape="square" />
                <span className="text-sm text-muted-foreground">
                  Maya Chen and Theo Martin
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Spinner size="md" />
                <Spinner variant="dots" label="Loading preview" />
                <Spinner variant="bars" size="sm" />
              </div>
              <div className="flex flex-col gap-2" aria-label="Loading preview">
                <Skeleton width="45%" />
                <Skeleton width="78%" />
                <Skeleton shape="block" height={44} />
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Status colors use the shared semantic tokens.
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overlays</CardTitle>
              <CardDescription>
                Tooltips, popovers, menus, dialogs, and sheets.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Tooltip content="More details" shortcut="I">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="More details"
                  icon={<Info />}
                />
              </Tooltip>
              <Popover
                label="Quick note"
                trigger={
                  <Button type="button" variant="outline">
                    Open popover
                  </Button>
                }
              >
                {({ close }) => (
                  <div className="flex flex-col gap-3">
                    <Input label="Short note" placeholder="Write a note" />
                    <Button type="button" size="sm" onClick={close}>
                      Done
                    </Button>
                  </div>
                )}
              </Popover>
              <DropdownMenu
                label="Preview actions"
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Preview actions"
                    icon={<Ellipsis />}
                  />
                }
                items={[
                  { type: "label", label: "Actions" },
                  { id: "open", label: "Open preview", onSelect: () => undefined },
                  { type: "separator" },
                  {
                    type: "checkbox",
                    id: "checked",
                    label: "Keep enabled",
                    checked,
                    onCheckedChange: setChecked,
                  },
                ]}
              />
              <Dialog
                trigger={
                  <Button type="button" variant="outline">
                    Dialog
                  </Button>
                }
                title="Dialog preview"
                description="The existing dialog primitive remains the base overlay."
                footer={({ close }) => (
                  <Button type="button" onClick={close}>
                    Close
                  </Button>
                )}
              >
                <p className="text-sm text-muted-foreground">
                  Dialog content uses the active theme.
                </p>
              </Dialog>
              <ConfirmationDialog
                trigger={
                  <Button type="button" variant="destructive">
                    Confirm action
                  </Button>
                }
                title="Confirm preview action?"
                description="This only changes local preview state."
                confirmLabel="Confirm"
                tone="destructive"
                onConfirm={() => {
                  notify({ title: "Confirmation preview", variant: "success" });
                }}
              />
              <Sheet
                trigger={
                  <Button type="button" variant="outline" icon={<PanelRight />}>
                    Side sheet
                  </Button>
                }
                title="Side sheet preview"
                description="A reusable panel that leaves the page context in place."
              >
                <p className="text-sm text-muted-foreground">
                  No workspace data is loaded.
                </p>
              </Sheet>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tabs</CardTitle>
              <CardDescription>Local panels with keyboard navigation.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                label="Preview sections"
                items={[
                  {
                    value: "overview",
                    label: "Overview",
                    count: 3,
                    content: (
                      <p className="text-sm text-muted-foreground">
                        Three illustrative records.
                      </p>
                    ),
                  },
                  {
                    value: "activity",
                    label: "Activity",
                    content: (
                      <p className="text-sm text-muted-foreground">
                        No activity in this preview.
                      </p>
                    ),
                  },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Empty state</CardTitle>
              <CardDescription>
                Reusable illustration and recovery action.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState
                scene="search"
                title="No matching records"
                description="The local preview has no records for this query."
                secondaryAction={{
                  label: "Clear search",
                  onAction: () => setSearch(""),
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

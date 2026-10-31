import { useState } from "react";
import { Ellipsis, Eye, PanelRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/button";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Dialog } from "@/components/dialog";
import { DropdownMenu } from "@/components/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import { Sheet } from "@/components/sheet";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { TrendChart } from "@/components/trend-chart";

interface PreviewRecord {
  id: string;
  contact: string;
  company: string;
  stage: string;
  value: number;
}

const previewRows: PreviewRecord[] = [
  {
    id: "sample-1",
    contact: "Maya Chen",
    company: "Northstar Studio",
    stage: "Proposal",
    value: 8400,
  },
  {
    id: "sample-2",
    contact: "Theo Martin",
    company: "Fieldwork Co.",
    stage: "Qualified",
    value: 5200,
  },
  {
    id: "sample-3",
    contact: "Amara Okafor",
    company: "Juniper Works",
    stage: "Negotiation",
    value: 11600,
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const columns: DataTableColumn<PreviewRecord>[] = [
  {
    key: "contact",
    header: "Contact",
    width: "minmax(0, 1fr)",
    sortable: true,
    searchable: true,
    card: "title",
  },
  {
    key: "company",
    header: "Company",
    width: "minmax(0, 1fr)",
    sortable: true,
    searchable: true,
    card: "subtitle",
  },
  { key: "stage", header: "Stage", width: "120px", sortable: true, card: "trailing" },
  {
    key: "value",
    header: "Pipeline value",
    width: "130px",
    align: "right",
    sortable: true,
    card: "trailing",
    cell: (record) => currency.format(record.value),
  },
];

const day = 86_400_000;
const chartNow = Date.now();
const chartBuckets = Array.from(
  { length: 7 },
  (_, index) => chartNow - (6 - index) * day,
);
const chartValues = [1800, 2450, 2100, 3300, 2850, 3900, 4300];
const previousValues = [1500, 2200, 1900, 2700, 2600, 3100, 3500];

export function ThemeSurfacePreview() {
  const [showComparison, setShowComparison] = useState(true);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-label font-semibold text-primary">
              RELIO · UI FOUNDATION
            </p>
            <h1 className="mt-2 text-page-title">Theme surface verification</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Illustrative fixture data only. This page is available in development and
              is not connected to Relio records.
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-sm font-medium text-muted-foreground">
              Appearance
            </span>
            <ThemeSwitcher />
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
          <section
            aria-labelledby="chart-heading"
            className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5"
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="chart-heading" className="text-section-title">
                  Pipeline trend
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Illustrative weekly values · USD
                </p>
              </div>
              <DropdownMenu
                label="Chart options"
                trigger={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Chart options"
                    icon={<Ellipsis />}
                  />
                }
                items={[
                  { type: "label", label: "Chart options" },
                  {
                    type: "checkbox",
                    id: "compare",
                    label: "Compare previous period",
                    checked: showComparison,
                    onCheckedChange: setShowComparison,
                  },
                ]}
              />
            </div>
            <TrendChart
              label="Illustrative pipeline value by day"
              buckets={chartBuckets}
              values={chartValues}
              previous={showComparison ? previousValues : null}
              interval="day"
              kind="count"
              format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
              unit="in pipeline"
            />
          </section>

          <section
            aria-labelledby="empty-heading"
            className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5"
          >
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              <h2 id="empty-heading" className="text-sm font-semibold text-foreground">
                Illustration and empty state
              </h2>
            </div>
            <EmptyState
              scene="chart"
              title="No activity in this view"
              description="The illustration should follow the selected theme without losing its accent or contrast."
            />
          </section>
        </div>

        <section
          aria-labelledby="table-heading"
          className="mt-6 min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5"
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="table-heading" className="text-section-title">
                Table and menu
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Search, sort, and open a row to inspect focused states.
              </p>
            </div>
            <DropdownMenu
              label="Preview actions"
              trigger={
                <Button variant="outline" size="sm" icon={<Ellipsis />}>
                  Actions
                </Button>
              }
              items={[
                { type: "label", label: "Preview actions" },
                {
                  id: "inspect",
                  label: "Inspect surface",
                  icon: <Eye />,
                  onSelect: () => undefined,
                },
              ]}
            />
          </div>
          <DataTable
            aria-label="Illustrative theme preview records"
            columns={columns}
            rows={previewRows}
            noun={["record", "records"]}
            defaultSort={{ key: "contact", dir: "asc" }}
            renderDetail={() => (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                Illustrative detail content. No workspace record is loaded or changed.
              </p>
            )}
          />
        </section>

        <section
          aria-labelledby="overlays-heading"
          className="mt-6 rounded-lg border border-border bg-card p-4 sm:p-5"
        >
          <h2 id="overlays-heading" className="text-section-title">
            Dialog and side sheet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Open each surface to check its backdrop, border, focus, and content colors
            in this theme.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Dialog
              trigger={
                <Button variant="outline" icon={<Eye />}>
                  Open dialog
                </Button>
              }
              title="Surface preview"
              description="A short modal body for checking foreground, muted text, borders, and overlay colors."
              footer={({ close }) => (
                <Button variant="primary" onClick={close}>
                  Close dialog
                </Button>
              )}
            >
              <div className="rounded-md border border-border bg-muted p-4">
                <p className="font-medium text-foreground">Semantic surface</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This content uses the shared background, muted, and border tokens.
                </p>
              </div>
            </Dialog>
            <Sheet
              trigger={
                <Button variant="outline" icon={<PanelRight />}>
                  Open side sheet
                </Button>
              }
              title="Details panel"
              description="A side sheet for verifying the same semantic token contract."
              footer={({ close }) => (
                <Button variant="outline" onClick={close}>
                  Close panel
                </Button>
              )}
            >
              <dl className="divide-y divide-border rounded-md border border-border">
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 p-3">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-medium text-foreground">Preview only</dd>
                </div>
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 p-3">
                  <dt className="text-muted-foreground">Data source</dt>
                  <dd className="font-medium text-foreground">Illustrative fixture</dd>
                </div>
              </dl>
            </Sheet>
          </div>
        </section>
      </div>
    </main>
  );
}

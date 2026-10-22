---
legacy_path: learn/add_interactivity/on_export_ready
title: onExportReady
category: Integrations / Interactivity
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:OnExportReady"
  - "@gooddata/sdk-ui:IExtendedExportConfig"
source_files:
  - src/workspace/execution/export.ts
  - src/insightView/InsightView.tsx
related_pages:
  - /docs/data-layer/use-data-export
  - /docs/dashboard-plugins/customize-dashboard-export
  - /docs/visualisations/charts-and-plots
  - /docs/visualisations/insightview
description: Capture the export function through onExportReady, configure CSV, XLSX, or PDF output, and call it to obtain the exported file.
ai_generated_description: true
type: docs
weight: 92
section: Integrations
subsection: Interactivity
aliases:
  - "../../learn/add_interactivity/on_export_ready/"
---

The `onExportReady` callback hands you an export function (`IExportFunction`) that exports the data of a rendered visualization into CSV, XLSX, or PDF. The function accepts one parameter, the `exportConfig` object (`IExtendedExportConfig`), and resolves to an `IExportResult` that describes the exported file.

The `onExportReady` callback is available on all visualization components, including `InsightView`.

## Structure

```tsx
import { InsightView } from "@gooddata/sdk-ui-ext";

<InsightView
    insight="<visualization-id>"
    onExportReady={(exportFunction) => {
        /* hold onto the function and call it to export as needed */
    }}
/>;
```

### exportConfig

The `exportConfig` object includes the following properties:

- `format` (optional, string) specifies the format of the exported data. Can be set to `csv` (default), `xlsx`, `raw`, or `pdf`.
- `title` (optional, string) becomes the file name of the export. When you omit it, `InsightView` uses the title of the saved visualization; other components use their `exportTitle` prop, then `Untitled`. Characters that aren't allowed in file names are stripped.
- `delimiter` (only when `format` is `csv`; optional, string) is the field delimiter.
- `showFilters` (only when `format` is `xlsx` or `pdf`; optional, boolean) specifies whether the applied filters are included in the export as human-readable context (`true`) or not (`false`; default). For PDF, this requires `visualizationObjectId`.
- `includeFilterContext` (optional, boolean) is an alias of `showFilters`; setting either to `true` includes the filters.
- `mergeHeaders` (only when `format` is `xlsx`; optional, boolean) specifies whether repeating header cells are merged (`true`) or not (`false`; default).
- `pdfConfiguration` (only when `format` is `pdf`; optional, `IExportPdfConfig`) sets `pageSize` (`A3`, `A4`, or `LETTER`), `pageOrientation` (`PORTRAIT` or `LANDSCAPE`), and `showInfoPage`.
- `visualizationObjectId` (only when `format` is `pdf`; optional, string) exports the saved visualization with this identifier instead of the component's execution result.
- `visualizationObjectCustomFilters` (only with `visualizationObjectId`; optional, `IFilter[]`) applies these filters to the exported visualization object without changing the one being displayed.
- `grandTotalsPosition` (optional, `pinnedTop`, `pinnedBottom`, `top`, or `bottom`) sets where grand totals appear in the export and takes precedence over the position stored in the visualization object.
- `timeout` (optional, number) overrides the default polling timeout for the export result, in milliseconds. Don't set it below 5000; a shorter timeout allows only one polling attempt.

### Export result

The export function resolves to an `IExportResult` object:

- `uri` (string) is the API URI from which you can fetch the exported file again.
- `objectUrl` (string) is a browser object URL pointing at the downloaded file in memory. Use it to offer an immediate download without another network round-trip, and call `URL.revokeObjectURL()` when you no longer need it to release the memory.
- `fileName` (optional, string) is the file name provided by the export service.

## Example

```tsx
import { useRef } from "react";
import { type IExportFunction } from "@gooddata/sdk-ui";
import { InsightView } from "@gooddata/sdk-ui-ext";

export function Example() {
    const exportFunctionRef = useRef<IExportFunction | null>(null);

    const onExportReady = (exportFunction: IExportFunction) => {
        exportFunctionRef.current = exportFunction;
    };

    const doExport = async () => {
        if (!exportFunctionRef.current) {
            return; // the visualization has not loaded yet
        }
        try {
            const result = await exportFunctionRef.current({
                format: "xlsx",
                showFilters: true,
                mergeHeaders: true,
                title: "CustomTitle",
            });
            console.log("Export succeeded: ", result.uri);
        } catch (error) {
            console.log("Export error: ", error);
        }
    };

    return (
        <div style={{ height: 367 }}>
            <InsightView insight="<visualization-id>" onExportReady={onExportReady} />
            <button className="button button-secondary" onClick={doExport}>
                Export
            </button>
        </div>
    );
}
```

## Notes

- The callback fires each time the component finishes loading data. If the execution fails, the export function it receives rejects with the same `GoodDataSdkError`.
- The `Kpi` component doesn't support export.
- `onExportReady` is for exporting a visualization component you render yourself, such as a standalone `InsightView`. If you're building a dashboard plugin that replaces a widget's visualization renderer, forward `pushData` instead so the Dashboard component's own Export popup can offer CSV and XLSX for that widget — see [Enable CSV and XLSX export for custom visualization renderers](../../../dashboard-plugins/dashboard-plugins-api/#enable-csv-and-xlsx-export-for-custom-visualization-renderers).

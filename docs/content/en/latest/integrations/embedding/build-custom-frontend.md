---
title: Build a fully custom frontend
category: Integrations / Embedding
diataxis_type: tutorial
api_symbols:
  - "@gooddata/sdk-ui:useExecutionDataView"
  - "@gooddata/sdk-ui-filters:useAttributeFilterController"
  - "@gooddata/sdk-ui:useDataExport"
  - "@gooddata/sdk-ui-ext:InsightView"
  - "@gooddata/sdk-ui:BackendProvider"
related_pages:
  - /docs/integrations/embedding/custom-visualizations
  - /docs/data-layer/use-execution-data-view
  - /docs/filters/use-attribute-filter-controller
  - /docs/data-layer/use-data-export
  - /docs/getting-started/quickstart
type: docs
ai_generated_body: true
description: Build an analytics screen with no GoodData visual components, only your own markup, by driving an execution, a headless attribute filter, a date filter, and a CSV export through GoodData.UI hooks.
weight: 80
section: Integrations
subsection: Embedding
---

Sometimes nothing GoodData.UI draws should be visible: the charts come from your design system, the filters are your own controls, and the layout is yours. GoodData.UI still knows the semantic model, runs the executions, loads attribute values, caches, and exports. You only render.

In this tutorial you build a "Revenue by category" screen with a bar list drawn in plain HTML, a region filter rendered as checkboxes, a period dropdown, and a CSV download. No `@gooddata/sdk-ui-charts` or `@gooddata/sdk-ui-filters` component is involved, only hooks.

You need the project from the [Quick start](../../../getting-started/quickstart/), or any React app with `BackendProvider`, `WorkspaceProvider`, and a generated catalog, as set up in [Installation](../../../getting-started/installation/).

You'll use these APIs:

| To | Use | From |
| :-- | :-- | :-- |
| Run a query and read the result | `useExecutionDataView` | `@gooddata/sdk-ui` |
| Load attribute values and manage a selection | `useAttributeFilterController` | `@gooddata/sdk-ui-filters` |
| Define filters in code | `newNegativeAttributeFilter`, `newRelativeDateFilter`, `newAllTimeFilter` | `@gooddata/sdk-model` |
| Export the same query | `useDataExport` with `useBackendStrict` and `useWorkspaceStrict` | `@gooddata/sdk-ui` |
| Refer to workspace objects by name | the generated catalog | `@gooddata/catalog-export` |

The code below uses the demo workspace's catalog constants: `Revenue`, `Category_1` (the product category; the catalog adds `_1` because the workspace has two attributes titled Category), `Region`, and `DateDatasets.Date`. In your own workspace, pick the equivalents from your `catalog.ts`.

## Draw the data yourself

Create `src/RevenueByCategory.tsx`. The hook runs one execution: the measure in `seriesBy`, the attribute to break it down by in `slicesBy`, and whatever filters the parent passes. The result has one slice per category with a single data point. `rawValue` is the number you compute with, `formattedValue()` the string to show, formatted the way the measure is defined in the workspace.

```tsx
import type { IFilter } from "@gooddata/sdk-model";
import { useExecutionDataView } from "@gooddata/sdk-ui";

import { Category_1, Revenue } from "./catalog.js";

interface IRevenueByCategoryProps {
    filters: IFilter[];
}

export function RevenueByCategory({ filters }: IRevenueByCategoryProps) {
    const { result, status, error } = useExecutionDataView(
        {
            execution: {
                seriesBy: [Revenue],
                slicesBy: [Category_1],
                filters,
            },
        },
        [filters],
    );

    if (status === "error") {
        return <p role="alert">Could not load revenue: {error?.message}</p>;
    }

    if (status !== "success" || !result) {
        return <p>Loading…</p>;
    }

    const slices = result.data().slices().toArray();
    const values = slices.map((slice) => Number(slice.dataPoints()[0]?.rawValue ?? 0));
    const max = Math.max(0, ...values);

    return (
        <ol style={{ listStyle: "none", padding: 0 }}>
            {slices.map((slice, index) => (
                <li key={slice.id} style={{ display: "grid", gridTemplateColumns: "8rem 1fr 6rem", gap: "1rem" }}>
                    <span>{slice.sliceTitles().join(" / ")}</span>
                    <div style={{ background: "#14b2e2", width: `${max ? (values[index] / max) * 100 : 0}%` }} />
                    <span>{slice.dataPoints()[0]?.formattedValue()}</span>
                </li>
            ))}
        </ol>
    );
}
```

The second argument, `[filters]`, is the dependency list. The hook runs again when a value in it changes, compared by reference, so the parent has to memoize the array. Render the component from `App.tsx` in place of the sample `InsightView`:

```diff
- import { InsightView } from "@gooddata/sdk-ui-ext";
+ import { RevenueByCategory } from "./RevenueByCategory.js";
```

```diff
-   <InsightView insight={Insights.ProductCategoriesPieChart} showTitle />
+   <RevenueByCategory filters={[]} />
```

Four bars appear, one per category, with revenue formatted as currency. Read more about [useExecutionDataView](../../../data-layer/use-execution-data-view/) and the [series and slices](../custom-visualizations/#access-custom-visualization-data) behind `slices()`.

## Add a headless attribute filter

An attribute filter needs the attribute's values, paging for long lists, a selection the user is editing, and the selection they last applied. `useAttributeFilterController` manages all of that and leaves the rendering to you. Create `src/RegionFilter.tsx`:

```tsx
import { useAttributeFilterController } from "@gooddata/sdk-ui-filters";
import { type IAttributeElement, type IAttributeFilter, newNegativeAttributeFilter } from "@gooddata/sdk-model";

import { Region } from "./catalog.js";

interface IRegionFilterProps {
    onApply: (filter: IAttributeFilter) => void;
}

export function RegionFilter({ onApply }: IRegionFilterProps) {
    const {
        isInitializing,
        elements,
        workingSelectionElements,
        isWorkingSelectionInverted,
        onSelect,
        onApply: applySelection,
    } = useAttributeFilterController({
        // A negative filter with nothing excluded means "all regions".
        filter: newNegativeAttributeFilter(Region, []),
        onApply: (filter) => onApply(filter),
    });

    if (isInitializing) {
        return <p>Loading regions…</p>;
    }

    const isChecked = (element: IAttributeElement) => {
        const inWorkingSelection = workingSelectionElements.some((el) => el.uri === element.uri);
        return isWorkingSelectionInverted ? !inWorkingSelection : inWorkingSelection;
    };

    const toggle = (element: IAttributeElement) => {
        // Keep the selection mode and add or remove the value from the working list.
        const inWorkingSelection = workingSelectionElements.some((el) => el.uri === element.uri);
        const next = inWorkingSelection
            ? workingSelectionElements.filter((el) => el.uri !== element.uri)
            : [...workingSelectionElements, element];
        onSelect(next, isWorkingSelectionInverted);
    };

    return (
        <fieldset>
            <legend>Region</legend>
            {elements.map((element) => (
                <label key={element.uri} style={{ display: "block" }}>
                    <input type="checkbox" checked={isChecked(element)} onChange={() => toggle(element)} />{" "}
                    {element.title}
                </label>
            ))}
            <button type="button" onClick={() => applySelection()}>
                Apply
            </button>
        </fieldset>
    );
}
```

Two details matter here. The initial filter is a negative filter with an empty list, which GoodData.UI reads as "everything selected", and the controller reports it as an inverted selection: the working list holds the excluded values. The `toggle` function keeps that mode and only adds or removes the clicked value from the list, so values on pages you haven't loaded yet stay selected. Calling the controller's `onApply` commits the working selection and calls your `onApply` with an `IAttributeFilter` that executions understand. The controller loads elements in pages; for attributes with many values, call `onLoadNextElementsPage` when the user scrolls, as described in [useAttributeFilterController](../../../filters/use-attribute-filter-controller/).

## Wire the filters into the execution

Now hold the filters in state and pass them down. A period dropdown adds a date filter built in code. `newRelativeDateFilter` takes the date dataset, a granularity, and a range of periods where `0` is the current one, so `-11` to `0` is the last 12 months and `-1` to `-1` is last year. `newAllTimeFilter` removes the date restriction. Replace `App.tsx`:

```tsx
import { type IAttributeFilter, type IDateFilter, newAllTimeFilter, newRelativeDateFilter } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider } from "@gooddata/sdk-ui";
import { useMemo, useState } from "react";

import { backend } from "./backend.js";
import { DateDatasets } from "./catalog.js";
import { RegionFilter } from "./RegionFilter.js";
import { RevenueByCategory } from "./RevenueByCategory.js";

// WORKSPACE_ID is the global that the Quick start project injects with Vite's `define`.
// In another app, use your workspace ID string.
const workspaceId = WORKSPACE_ID;

const periods = {
    all: newAllTimeFilter(DateDatasets.Date.ref),
    last12Months: newRelativeDateFilter(DateDatasets.Date.ref, "GDC.time.month", -11, 0),
    lastYear: newRelativeDateFilter(DateDatasets.Date.ref, "GDC.time.year", -1, -1),
} satisfies Record<string, IDateFilter>;

export function App() {
    const [regionFilter, setRegionFilter] = useState<IAttributeFilter | undefined>();
    const [period, setPeriod] = useState<keyof typeof periods>("all");

    const filters = useMemo(
        () => [periods[period], ...(regionFilter ? [regionFilter] : [])],
        [period, regionFilter],
    );

    return (
        <BackendProvider backend={backend}>
            <WorkspaceProvider workspace={workspaceId}>
                <main className="app">
                    <h1 className="app-title">Revenue by category</h1>
                    <label>
                        Period{" "}
                        <select value={period} onChange={(e) => setPeriod(e.target.value as keyof typeof periods)}>
                            <option value="all">All time</option>
                            <option value="last12Months">Last 12 months</option>
                            <option value="lastYear">Last year</option>
                        </select>
                    </label>
                    <RegionFilter onApply={setRegionFilter} />
                    <RevenueByCategory filters={filters} />
                </main>
            </WorkspaceProvider>
        </BackendProvider>
    );
}
```

Uncheck a region and click **Apply**, or pick a period, and the bars update. The `useMemo` around `filters` is what makes that efficient: the array only changes when a filter changes, so the execution runs exactly then. Every filter you can build in code is listed in [Filters](../../../filters/), and the [execution model](../../../data-layer/execution/execution-model/) explains how filters, measures, and attributes combine.

## Export the same data

Export reuses the execution definition rather than the rendered result. Build an `IPreparedExecution` from the same items and filters, and hand it to `useDataExport`, which runs it, asks the backend for a CSV, and returns the download URI. Render the URI as a link rather than opening it from a callback: the export can take longer than the browser's window for user-initiated popups. Create `src/ExportButton.tsx`:

```tsx
import type { IFilter } from "@gooddata/sdk-model";
import { useBackendStrict, useDataExport, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useMemo, useState } from "react";

import { Category_1, Revenue } from "./catalog.js";

interface IExportButtonProps {
    filters: IFilter[];
}

export function ExportButton({ filters }: IExportButtonProps) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const [requestCount, setRequestCount] = useState(0);

    // Build the execution only after the first click; useDataExport stays "pending" while it is null.
    const execution = useMemo(
        () =>
            requestCount > 0
                ? backend.workspace(workspace).execution().forItems([Revenue, Category_1], filters)
                : null,
        [requestCount, backend, workspace, filters],
    );

    const {
        status,
        result: downloadUri,
        error,
    } = useDataExport(
        {
            execution,
            exportConfig: { format: "csv", title: "revenue-by-category" },
        },
        [execution],
    );

    return (
        <>
            <button type="button" disabled={status === "loading"} onClick={() => setRequestCount((n) => n + 1)}>
                {status === "loading" ? "Exporting…" : "Export CSV"}
            </button>
            {status === "success" && downloadUri ? <a href={downloadUri}>Download the CSV</a> : null}
            {status === "error" ? <p role="alert">{error?.message}</p> : null}
        </>
    );
}
```

Render `<ExportButton filters={filters} />` under the bars in `App.tsx`. `useBackendStrict` and `useWorkspaceStrict` read the providers at the top of the app, so the button needs no props beyond the filters.

## Where to go next

The screen is yours end to end, and the pattern scales: one hook per query, filters in state, memoized arrays as dependencies.

- [How custom visualizations get data](../custom-visualizations/) explains series and slices for shapes beyond one measure by one attribute, and the `Execute` components when you prefer render props to hooks.
- [Result structure](../../../data-layer/execution/result-structure/) and [Run a custom execution](../../../data-layer/execution/custom-executions/) cover dimensions, totals, sorting, and running executions outside React.
- [useAttributeFilterHandler](../../../filters/use-attribute-filter-handler/) is the lower-level API under the controller, for filter UIs with their own state management.
- The hooks and the ready-made components share the same providers, so you can mix them. An [InsightView](../../../visualisations/insightview/) next to your bars reads the same `filters` array.
- Before you ship, replace the development token with a [sign-in flow](../../authentication/).

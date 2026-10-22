---
title: useCustomWidgetExecutionDataView and useCustomWidgetInsightDataView
linkTitle: Custom widget data view hooks
description: Load execution or visualization data inside a custom dashboard widget with the dashboard filters applied automatically.
category: Dashboard & plugins
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-dashboard:useCustomWidgetExecutionDataView"
  - "@gooddata/sdk-ui-dashboard:useCustomWidgetInsightDataView"
source_files:
  - src/presentation/widget/common/useCustomWidgetExecutionDataView.ts
  - src/presentation/widget/common/useCustomWidgetInsightDataView.ts
related_pages:
  - /docs/dashboard-plugins/customize-widgets
  - /docs/dashboard-plugins/use-widget-filters
  - /docs/data-layer/use-execution-data-view
  - /docs/data-layer/use-insight-data-view
  - /docs/dashboard-plugins/dashboard-plugins-api
ai_generated_description: true
type: docs
weight: 44
section: Dashboard & plugins
---

`useCustomWidgetExecutionDataView` and `useCustomWidgetInsightDataView` load data for a custom dashboard widget and apply the filters currently set on the dashboard automatically.

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

## Basic usage

### useCustomWidgetExecutionDataView

Run your own execution definition with the dashboard filters applied:

```tsx
import { type ICustomWidget, useCustomWidgetExecutionDataView } from "@gooddata/sdk-ui-dashboard";
import * as Md from "./catalog.js";

export function MyCustomWidget({ widget }: { widget: ICustomWidget }) {
    const { result, status, error } = useCustomWidgetExecutionDataView({
        widget,
        execution: {
            seriesBy: [Md.Revenue],
            slicesBy: [Md.Region],
        },
    });

    if (status === "loading" || status === "pending") {
        return <div>Loading...</div>;
    }

    if (status === "error") {
        return <div>Error: {error?.message}</div>;
    }

    const slices = result?.data().slices().toArray() ?? [];
    return <div>{slices.length} rows</div>;
}
```

### useCustomWidgetInsightDataView

Load the data of a saved visualization with the dashboard filters merged in:

```tsx
import { useMemo } from "react";
import { idRef } from "@gooddata/sdk-model";
import { type ICustomWidget, useCustomWidgetInsightDataView } from "@gooddata/sdk-ui-dashboard";

export function MyVisualizationWidget({ widget, visualizationId }: { widget: ICustomWidget; visualizationId: string }) {
    const insight = useMemo(() => idRef(visualizationId, "insight"), [visualizationId]);
    const { result, status, error } = useCustomWidgetInsightDataView({
        widget,
        insight,
    });

    if (status === "loading" || status === "pending") {
        return <div>Loading...</div>;
    }

    if (status === "error") {
        return <div>Error: {error?.message}</div>;
    }

    const slices = result?.data().slices().toArray() ?? [];
    return <div>{slices.length} rows</div>;
}
```

## Parameters

### useCustomWidgetExecutionDataView

| Property | Type | Description |
|----------|------|-------------|
| `widget` | `ICustomWidget` | The custom widget. Determines which dashboard filters apply. |
| `execution` | `IExecutionConfiguration` (without `filters`) | Execution definition. The dashboard filters are added automatically. |
| `enableExecutionCancelling` | `boolean` | Cancel in-flight requests when the execution changes. |

### useCustomWidgetInsightDataView

| Property | Type | Description |
|----------|------|-------------|
| `widget` | `ICustomWidget` | The custom widget. Determines which dashboard filters apply. |
| `insight` | `IInsightDefinition \| ObjRef` | The visualization to execute, or a reference to it. When not provided, the hook stays in the `"pending"` state. |
| `enableExecutionCancelling` | `boolean` | Cancel in-flight requests when the execution changes. |

Both hooks also take the callbacks `onSuccess`, `onError`, `onLoading`, `onPending`, and `onCancel`.

## Return value

Both hooks return `UseCancelablePromiseState<DataViewFacade, GoodDataSdkError>`.

### States

| status | result | error | When |
|--------|--------|-------|------|
| `"pending"` | `undefined` | `undefined` | `execution` or `insight` is not provided, or the widget filters are not resolved yet (for example, right after `widget` changes). |
| `"loading"` | `undefined` | `undefined` | The visualization is being resolved (`useCustomWidgetInsightDataView`; loaded from the backend when `insight` is an `ObjRef`), the widget filter query is running, or the execution is running. |
| `"success"` | `DataViewFacade` | `undefined` | The widget filters are resolved and all data of the execution is loaded. In `useCustomWidgetInsightDataView`, a rejected widget filter query also ends here, with the visualization executed without dashboard filters. |
| `"error"` | `undefined` | `GoodDataSdkError` | Loading the visualization, the widget filter query, or the execution failed. In `useCustomWidgetExecutionDataView`, a rejected filter query also ends in this state with an `UnexpectedSdkError` ("The widget filter query was rejected"). |

## Notes

- Use the hooks inside a dashboard (for example, in a custom widget component). They read the dashboard filters and settings from the dashboard store.
- `enableExecutionCancelling` defaults to the dashboard setting `enableExecutionCancelling`, which is `false` when not set.
- Both hooks take the backend and workspace from `BackendProvider` and `WorkspaceProvider`; there is no prop to pass them. Without a provider, they throw an error such as `IAnalyticalBackend must be defined. Either pass it as a parameter or make sure there is a BackendProvider up the component tree.`, prefixed with `useExecutionDataView:` or `useBackendStrict:`.
- Pass a stable `insight` to `useCustomWidgetInsightDataView`, for example by wrapping `idRef(...)` in `useMemo`. A new `ObjRef` or visualization definition object on every render counts as a changed input, so the hook resets to `"loading"` and loads the visualization again on every render. Because each load re-renders your component, the hook never settles in `"success"`.
- In `useCustomWidgetInsightDataView`, `onLoading` and `onPending` fire only for the visualization loading phase. `onSuccess` fires when the data view is loaded.
- `onError` also fires when the widget filter query fails. In `useCustomWidgetExecutionDataView`, it also fires when the filter query is rejected.
- The hooks read all data of the execution. There is no paging window.
- `useCustomWidgetExecutionDataView` passes the filters available at the moment to the execution, so an execution can start before the widget filters are resolved. The returned state stays `"pending"` or `"loading"` until the filter query succeeds and the data view for those filters is loaded.

### When they re-run

- The widget filters are re-queried when the widget `ref`, its `ignoreDashboardFilters`, its `dateDataSet`, or the dashboard filters (including their selected values) change.
- `useCustomWidgetExecutionDataView` re-executes when `backend`, `workspace`, `enableExecutionCancelling`, or the execution fingerprint changes. The fingerprint includes the resolved filters, so a new `execution` object with the same content does not trigger a new execution.
- `useCustomWidgetInsightDataView` reloads the visualization when `backend`, `workspace`, or `insight` changes. `insight` is compared by reference. It re-executes when the visualization or the serialized widget filters change.
- When the inputs change before the previous load finishes, the previous result is discarded and `onCancel` is called. The underlying execution request is aborted only when execution cancelling is enabled. The same happens on unmount.

## Props

{{% props %}}

---
title: useExecutionDataView
category: Data layer
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:useExecutionDataView"
source_files:
  - src/execution/useExecutionDataView.ts
related_pages:
  - /docs/data-layer/execute
  - /docs/data-layer/use-insight-data-view
  - /docs/integrations/embedding/custom-visualizations
  - /docs/data-layer/execution/result-structure
  - /docs/data-layer/use-data-export
description: Fetch execution data as a DataViewFacade from a prepared execution or inline seriesBy/slicesBy configuration.
ai_generated_description: true
type: docs
weight: 60
section: Data layer
---

React hook to get data for a specific execution. Use it for ad-hoc executions; to load the data of a saved visualization, use [useInsightDataView](../use-insight-data-view/).

Accepts either a prepared execution or an execution configuration with measures, attributes, filters, and sorting. Returns a `DataViewFacade` wrapping the execution result.

## Basic usage

```tsx
import { useExecutionDataView } from "@gooddata/sdk-ui";
import * as Md from "./catalog.js";

function MyDataComponent() {
    const { result, status, error } = useExecutionDataView({
        execution: {
            seriesBy: [Md.Revenue, Md.Region],
            slicesBy: [Md.DateMonth],
            filters: [],
        },
    });

    if (status === "loading" || status === "pending") {
        return <div>Loading...</div>;
    }

    if (status === "error") {
        return <div>Error: {error?.message}</div>;
    }

    // result is a DataViewFacade
    const data = result?.data().slices().toArray();
    // ...
}
```

## Parameters

| Property | Type | Description |
|----------|------|-------------|
| `execution` | `IPreparedExecution \| IExecutionConfiguration` | Either a prepared execution or inline config with `seriesBy`, `slicesBy`, etc. |
| `execution.seriesBy` | `AttributesMeasuresOrPlaceholders` | Measures and scoping attributes for data series. |
| `execution.slicesBy` | `AttributesOrPlaceholders` | Attributes to slice data series by. |
| `execution.filters` | `NullableFiltersOrPlaceholders` | Server-side filters. |
| `execution.sortBy` | `SortsOrPlaceholders` | Server-side sorting. |
| `window` | `DataViewWindow` | Load only a specific window of data (for paging). |
| `backend` | `IAnalyticalBackend` | Backend override (defaults to `BackendProvider` context). |
| `workspace` | `string` | Workspace override (defaults to `WorkspaceProvider` context). |

## Return value

`UseCancelablePromiseState<DataViewFacade, GoodDataSdkError>`, the same shape as [useCancelablePromise](../use-cancelable-promise/) returns.

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"pending" \| "loading" \| "success" \| "error"` | Current state of the load. |
| `result` | `DataViewFacade \| undefined` | The loaded data view. Set only in the `"success"` state. |
| `error` | `GoodDataSdkError \| undefined` | The error. Set only in the `"error"` state. |

## States

| `status` | `result` | `error` | When |
|----------|----------|---------|------|
| `"pending"` | `undefined` | `undefined` | `execution` is not provided. |
| `"loading"` | `undefined` | `undefined` | The execution is running or its data is being read. |
| `"success"` | `DataViewFacade` | `undefined` | The data view for `window` (or all data when `window` is not set) was read. |
| `"error"` | `undefined` | `GoodDataSdkError` | The execution or data read failed. The error is converted to a `GoodDataSdkError` subtype. |

## When it re-runs

The hook starts a new load when any of these change:

- `backend` or `workspace` (the effective values, including context values). `backend` is compared by reference, `workspace` by value.
- The fingerprint of the prepared execution. An inline `execution` configuration is compared by its content, not by object identity.
- `window.offset` or `window.size`, compared by reference.
- `enableExecutionCancelling`.
- Any item in the optional second argument, `deps`.

When a load is superseded or the component unmounts before it finishes, its result is ignored and `onCancel` is called. The request itself keeps running unless `enableExecutionCancelling` is `true`; then the hook aborts the execution's signal and the request is canceled.

## Notes

- Without a `backend` prop or a `BackendProvider`, the hook throws: "useExecutionDataView: IAnalyticalBackend must be defined. Either pass it as a parameter or make sure there is a BackendProvider up the component tree." A missing workspace throws the matching `WorkspaceProvider` error.
- The `backend` and `workspace` props take precedence over the context values.
- `seriesBy`, `slicesBy`, `totals`, `filters`, and `sortBy` in an execution configuration can contain placeholders. Pass `placeholdersResolutionContext` for composed placeholders. The object is treated as a configuration only when it has `seriesBy`.
- `window.offset` and `window.size` are arrays compared by reference. Keep them stable (for example with `useMemo`); a new array on every render starts a new load on every render.
- Unlike [Execute](../execute/), the hook does not turn a no-data error into an empty result. It returns the `"error"` state with the converted error.
- The callbacks `onLoading`, `onPending`, `onSuccess`, `onError`, and `onCancel` are passed to `useCancelablePromise`. Changing them does not start a new load.

## Props

{{% props %}}

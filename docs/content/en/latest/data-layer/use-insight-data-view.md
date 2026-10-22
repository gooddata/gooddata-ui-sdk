---
title: useInsightDataView
category: Data layer
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:useInsightDataView"
source_files:
  - src/execution/useInsightDataView.ts
related_pages:
  - /docs/data-layer/execute-insight
  - /docs/data-layer/use-execution-data-view
  - /docs/data-layer/data-model/insights
  - /docs/visualisations/insightview
  - /docs/data-layer/use-data-export
description: Load a saved visualization by reference and return its execution result as a DataViewFacade with optional filters and sorting.
ai_generated_description: true
type: docs
weight: 59
section: Data layer
---

React hook that loads a saved visualization by reference and returns its execution result as a `DataViewFacade`. For ad-hoc executions, use [useExecutionDataView](../use-execution-data-view/).

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

## Basic usage

```tsx
import { useInsightDataView } from "@gooddata/sdk-ui";
import { idRef } from "@gooddata/sdk-model";

function VisualizationData({ visualizationId }: { visualizationId: string }) {
    const { result, status, error } = useInsightDataView({
        insight: idRef(visualizationId),
    });

    if (status === "loading" || status === "pending") {
        return <div>Loading...</div>;
    }

    if (status === "error") {
        return <div>Error: {error?.message}</div>;
    }

    const data = result?.data().slices().toArray();
    // ...
}
```

## Parameters

| Property | Type | Description |
|----------|------|-------------|
| `insight` | `ObjRef` | Reference to the saved visualization. When not provided, the hook stays in `"pending"` state. |
| `filters` | `INullableFilter[]` | Additional filters to merge with the visualization's own filters. |
| `sorts` | `ISortItem[] \| (def: IExecutionDefinition) => ISortItem[]` | Custom sorting for the execution. |
| `window` | `DataViewWindow` | Load only a specific data window (for paging). |
| `executeByReference` | `boolean` | Execute by reference to the saved visualization instead of sending the full execution definition. Required by some backends. |
| `backend` | `IAnalyticalBackend` | Backend override (defaults to `BackendProvider` context). |
| `workspace` | `string` | Workspace override (defaults to `WorkspaceProvider` context). |

## Return value

`UseCancelablePromiseState<DataViewFacade, GoodDataSdkError>`, the same shape as [useCancelablePromise](../use-cancelable-promise/) returns.

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"pending" \| "loading" \| "success" \| "error"` | Combined state of the visualization load and the execution. |
| `result` | `DataViewFacade \| undefined` | The loaded data view. Set only in the `"success"` state. |
| `error` | `GoodDataSdkError \| undefined` | The first error: from the visualization load, otherwise from the execution. |

## States

The hook works in two steps: it loads the visualization, then executes it through `useExecutionDataView`. The returned `status` is the status of the first step that has not succeeded yet.

| `status` | `result` | `error` | When |
|----------|----------|---------|------|
| `"pending"` | `undefined` | `undefined` | `insight` is not provided. |
| `"loading"` | `undefined` | `undefined` | The visualization is being loaded, or it is loaded and its execution is running. |
| `"success"` | `DataViewFacade` | `undefined` | The visualization loaded and its data view was read. |
| `"error"` | `undefined` | The visualization-load error or a `GoodDataSdkError` | Loading the visualization or executing it failed. |

## When it re-runs

- The visualization is loaded again when `backend`, `workspace`, the `insight` reference (compared by its string form, so a new `idRef()` object with the same identifier does not reload), or an item in `deps` changes.
- The hook rebuilds the prepared execution on every render from the loaded visualization, `filters`, `sorts`, `dimensions`, `dateFormat`, and `executeByReference`. The execution runs again when the fingerprint of that prepared execution changes, and when `backend`, `workspace`, `window.offset`, `window.size` (by reference), `enableExecutionCancelling`, or an item in `deps` changes.
- A superseded or unmounted load is canceled the same way as in [useExecutionDataView](../use-execution-data-view/#when-it-re-runs): its result is ignored, and the execution request is aborted only when `enableExecutionCancelling` is `true`.

## Notes

- Without a `backend` prop or a `BackendProvider`, the hook throws: "useInsightDataView: IAnalyticalBackend must be defined. Either pass it as a parameter or make sure there is a BackendProvider up the component tree." A missing workspace throws the matching `WorkspaceProvider` error.
- The `backend` and `workspace` props take precedence over the context values.
- `sorts`, `dimensions`, and `dateFormat` accept either a value or a function. The function receives the execution definition of the visualization and returns the value to apply.
- The callbacks `onLoading`, `onPending`, `onSuccess`, `onError`, and `onCancel` track only the execution step. While the visualization is loading, `onPending` is called, not `onLoading`. A failed visualization load is returned in `error` but does not call `onError`.
- Errors from the visualization load are returned as the backend rejects them. Only execution errors are converted to a `GoodDataSdkError` subtype.
- `window.offset` and `window.size` are arrays compared by reference. Keep them stable; a new array on every render starts a new execution on every render.

## Props

{{% props %}}

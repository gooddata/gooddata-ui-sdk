---
title: ExecuteInsight
category: Data layer
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:ExecuteInsight"
  - "@gooddata/sdk-ui:IExecuteInsightProps"
source_files:
  - src/execution/ExecuteInsight.tsx
props_interfaces:
  - IExecuteInsightProps
  - IWithLoadingEvents<IExecuteInsightProps>
related_pages:
  - /docs/data-layer/use-insight-data-view
  - /docs/data-layer/execute
  - /docs/data-layer/raw-execute
  - /docs/visualisations/insightview
description: Run a saved visualization and pass the resulting data view to a render-prop child.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 58
section: Data layer
---

The `ExecuteInsight` component loads a visualization saved in the workspace (referenced by `ObjRef`), runs its execution, and passes the loading state, error, and data view to its `children` render function. Use it to render the data of a saved visualization with your own code instead of [`InsightView`](../../visualisations/insightview/).

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

## Basic usage

```tsx
import { ExecuteInsight } from "@gooddata/sdk-ui";
import { idRef } from "@gooddata/sdk-model";

export const Example = () => (
    <ExecuteInsight insight={idRef("<visualization-id>")}>
        {({ isLoading, error, result }) => {
            if (isLoading) {
                return <div>Loading...</div>;
            }
            if (error) {
                return <div>Error: {error.message}</div>;
            }
            return <pre>{JSON.stringify(result?.dataView.data, null, 2)}</pre>;
        }}
    </ExecuteInsight>
);
```

## States

The `children` function receives a `WithLoadingResult` in one of these states.

| `isLoading` | `result` | `error` | When |
|-------------|----------|---------|------|
| `false` | `undefined` | `undefined` | Before the first load starts: on the first render and, when `loadOnMount` is `false`, until you call `reload()` or a prop change triggers a new execution. |
| `true` | `undefined` | `undefined` | The visualization is loading or its execution is running. |
| `false` | `DataViewFacade` | `undefined` | The data was loaded. An empty result is returned here, not as a `NoDataError`. |
| `false` | `undefined` | `GoodDataSdkError` | Loading the visualization, the execution, or the data read failed. |

`reload` is available in every state and starts a new execution.

## Rendering

`ExecuteInsight` picks what to render in this order:

| Condition | Renders |
|-----------|---------|
| `ErrorComponent` is set and there is an `error` | `ErrorComponent` with the `error` prop. |
| `LoadingComponent` is set and `isLoading` is `true` | `LoadingComponent`. |
| Both `LoadingComponent` and `ErrorComponent` are set and there is no `result` | Nothing (`null`). |
| Otherwise | The `children` function. |

When you set both `LoadingComponent` and `ErrorComponent`, `children` is called only with a successful result.

## When it re-runs

- `ExecuteInsight` starts a new execution when `insight`, `filters`, or `window` changes by deep comparison.
- It also starts a new execution when `onError`, `onLoadingChanged`, `onLoadingFinish`, or `onLoadingStart` changes by reference. Memoize these callbacks.
- Changing `sorts`, `dimensions`, or `dateFormat` alone does not start a new execution. Call `reload()` to apply them.
- When a new execution starts before the running one finishes, the running one is canceled. The request itself keeps running unless `enableExecutionCancelling` is `true`; then its signal is aborted.

## Notes

- `backend` and `workspace` props take precedence over `BackendProvider` and `WorkspaceProvider`. If neither is available, the load fails with an error.
- `filters` are added to the filters saved in the visualization. `sorts`, `dimensions`, and `dateFormat` override the saved ones; each also accepts a function that receives the execution definition and returns the value.
- Set `executeByReference` to run the saved visualization by reference instead of sending its full definition. Use it only when your backend requires executions tied to stored visualizations.
- Set `loadOnMount={false}` to skip the initial run, and call `reload()` to start it.
- Without `window`, `ExecuteInsight` reads all data. Pass `window` with `offset` and `size` arrays to read one page.
- `exportTitle` defaults to `componentName`, which defaults to `"ExecuteInsight"`.

## Props

{{% props %}}

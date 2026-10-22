---
title: Execute
category: Data layer
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:Execute"
  - "@gooddata/sdk-ui:IExecuteProps"
source_files:
  - src/execution/Execute.tsx
props_interfaces:
  - IExecuteProps
  - IWithLoadingEvents<IExecuteProps>
related_pages:
  - /docs/data-layer/use-execution-data-view
  - /docs/data-layer/raw-execute
  - /docs/data-layer/execute-insight
  - /docs/integrations/embedding/custom-visualizations
  - /docs/data-layer/execution/result-structure
description: Fetch and render backend data with the Execute component using series, slices, filters, and a render-prop child.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 56
section: Data layer
---

The `Execute` component builds an execution from measures and attributes, runs it, and passes the result to its `children` render function as data series (built from measures, optionally scoped by attribute elements) sliced by additional attributes. Either `seriesBy` or `slicesBy` must contain at least one item.

## Basic usage

```tsx
import { Execute } from "@gooddata/sdk-ui";
import * as Md from "./catalog.js";

export const Example = () => (
    <Execute
        seriesBy={[Md.Amount, Md.Won]}
        slicesBy={[Md.Product.Name]}
        filters={[]}
    >
        {({ result, error, isLoading }) => {
            if (isLoading) {
                return <div>Loading...</div>;
            }
            if (error) {
                return <div>Error: {error.message}</div>;
            }
            const data = result?.data();
            return <pre>{JSON.stringify(data?.series().toArray(), null, 2)}</pre>;
        }}
    </Execute>
);
```

## States

The `children` function receives a `WithLoadingResult` in one of these states.

| `isLoading` | `result` | `error` | When |
|-------------|----------|---------|------|
| `false` | `undefined` | `undefined` | Before the first load starts: on the first render and, when `loadOnMount` is `false`, until you call `reload()` or a prop change triggers a new execution. |
| `true` | `undefined` | `undefined` | The execution is running. If a previous load succeeded, also on the render right after a prop change that triggers a new execution, so `children` never receives a stale result. |
| `false` | `DataViewFacade` | `undefined` | The data was loaded. A no-data result that includes a data view is returned here, not as an error. |
| `false` | `undefined` | `GoodDataSdkError` | The execution or data read failed. The error is converted to a `GoodDataSdkError` subtype. |

`reload` is available in every state and starts a new execution.

## Rendering

`Execute` picks what to render in this order:

| Condition | Renders |
|-----------|---------|
| `ErrorComponent` is set and there is an `error` | `ErrorComponent` with the `error` prop. |
| `LoadingComponent` is set and `isLoading` is `true` | `LoadingComponent`. |
| Both `LoadingComponent` and `ErrorComponent` are set and there is no `result` | Nothing (`null`). |
| Otherwise | The `children` function. |

When you set both `LoadingComponent` and `ErrorComponent`, `children` is called only with a successful result.

## When it re-runs

- `Execute` starts a new execution when any of `seriesBy`, `slicesBy`, `totals`, `filters`, `sortBy`, `window`, or `workspace` changes by deep comparison. Placeholders are resolved before the comparison, so a change of a placeholder value also triggers a new execution.
- It also starts a new execution when `onError`, `onLoadingChanged`, `onLoadingFinish`, or `onLoadingStart` changes by reference. If you pass inline functions, each render of the parent starts a new execution.
- Changing `backend` alone does not start a new execution.
- Calling `reload()` starts a new execution at any time.
- When a new execution starts or the component unmounts before the running one finishes, the running one is canceled and `onError` is called with a `CancelledSdkError`. The request itself keeps running unless `enableExecutionCancelling` is `true`; then its signal is aborted.

## Notes

- `backend` and `workspace` props take precedence over `BackendProvider` and `WorkspaceProvider`. If neither is available, `Execute` does not throw during render: the load fails and the error is passed in `error` and to `onError`.
- If both `seriesBy` and `slicesBy` are empty, the load fails with an `UnexpectedSdkError`: "In the Execute component, either seriesBy or slicesBy must be defined and must contain at least one item".
- `seriesBy`, `slicesBy`, `totals`, `filters`, and `sortBy` can contain placeholders. Pass `placeholdersResolutionContext` for composed placeholders.
- An empty result is not a `NoDataError`. Handle the zero-row case in `children`.
- After each load, `onExportReady` is called with an export function, or, after a failure, with a function that rejects with the error. `exportTitle` defaults to `componentName`, which defaults to `"Execute"`.

## Props

{{% props %}}

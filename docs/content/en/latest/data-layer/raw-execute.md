---
title: RawExecute
category: Data layer
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:RawExecute"
  - "@gooddata/sdk-ui:IRawExecuteProps"
source_files:
  - src/execution/RawExecute.tsx
props_interfaces:
  - IRawExecuteProps
  - IWithLoadingEvents<IRawExecuteProps>
related_pages:
  - /docs/data-layer/execute
  - /docs/data-layer/execution/custom-executions
  - /docs/data-layer/use-execution-data-view
  - /docs/data-layer/execute-insight
description: Run a prepared execution and pass the resulting data view to a render-prop child.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 57
section: Data layer
---

The `RawExecute` component runs an execution that you have already prepared (`IPreparedExecution`) and passes the loading state, error, and data view to its `children` render function. Build the prepared execution yourself, for example with `backend.workspace(workspace).execution().forItems([...])`; to run a saved visualization, use [`ExecuteInsight`](../execute-insight/) instead.

## Basic usage

```tsx
import { RawExecute, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import * as Md from "./catalog.js";

export const Example = () => {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const execution = backend.workspace(workspace).execution().forItems([Md.Amount, Md.Product.Name]);

    return (
        <RawExecute execution={execution}>
            {({ isLoading, error, result }) => {
                if (isLoading) {
                    return <div>Loading...</div>;
                }
                if (error) {
                    return <div>Error: {error.message}</div>;
                }
                return <pre>{JSON.stringify(result?.dataView.data, null, 2)}</pre>;
            }}
        </RawExecute>
    );
};
```

## States

The `children` function receives a `WithLoadingResult` in one of these states.

| `isLoading` | `result` | `error` | When |
|-------------|----------|---------|------|
| `false` | `undefined` | `undefined` | Before the first load starts: on the first render and, when `loadOnMount` is `false`, until you call `reload()` or a prop change triggers a new execution. |
| `true` | `undefined` | `undefined` | The execution is running. |
| `false` | `DataViewFacade` | `undefined` | The data was loaded. An empty result is returned here, not as a `NoDataError`. |
| `false` | `undefined` | `GoodDataSdkError` | The execution or data read failed. |

`reload` is available in every state and starts a new execution.

## Rendering

`RawExecute` picks what to render in this order:

| Condition | Renders |
|-----------|---------|
| `ErrorComponent` is set and there is an `error` | `ErrorComponent` with the `error` prop. |
| `LoadingComponent` is set and `isLoading` is `true` | `LoadingComponent`. |
| Both `LoadingComponent` and `ErrorComponent` are set and there is no `result` | Nothing (`null`). |
| Otherwise | The `children` function. |

When you set both `LoadingComponent` and `ErrorComponent`, `children` is called only with a successful result.

## When it re-runs

- `RawExecute` starts a new execution when `execution.fingerprint()` changes. A prepared execution rebuilt with the same definition on every render does not start a new one.
- It also starts a new execution when `window` changes by deep comparison, or when `onError`, `onLoadingChanged`, `onLoadingFinish`, or `onLoadingStart` changes by reference. Memoize these callbacks.
- Calling `reload()` starts a new execution at any time.
- When a new execution starts before the running one finishes, the running one is canceled. The request itself keeps running unless `enableExecutionCancelling` is `true`; then its signal is aborted.

## Notes

- Set `loadOnMount={false}` to skip the initial run, and call `reload()` to start it, for example after a user action.
- Without `window`, `RawExecute` reads all data. Pass `window` with `offset` and `size` arrays to read one page of a large result.
- `exportTitle` defaults to `"RawExecute"`.

## Props

{{% props %}}

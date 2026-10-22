---
title: useCancelablePromise
category: Data layer
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:useCancelablePromise"
source_files:
  - src/base/react/useCancelablePromise.ts
related_pages:
  - /docs/data-layer/execution/custom-executions
  - /docs/data-layer/data-model/workspace-catalog
  - /docs/integrations/interactivity/handle-errors
  - /docs/data-layer/use-paged-resource
  - /docs/data-layer/use-execution-data-view
description: Track promise status in React with automatic cancellation of stale results when dependencies change.
ai_generated_description: true
type: docs
weight: 61
section: Data layer
---

Hook for working with Promises in React components. It is the state machine behind [useExecutionDataView](../use-execution-data-view/) and [useInsightDataView](../use-insight-data-view/), which return the same `UseCancelablePromiseState` shape.

Tracks promise status (`pending` / `loading` / `success` / `error`), provides the result or error, supports callbacks, and automatically cancels stale promises when dependencies change.

## Basic usage

```tsx
import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { useCancelablePromise } from "@gooddata/sdk-ui";

function CatalogSummary({ backend, workspace }: { backend: IAnalyticalBackend; workspace: string }) {
    const { result, error, status } = useCancelablePromise(
        {
            promise: () => backend.workspace(workspace).catalog().load(),
            onSuccess: (catalog) => {
                console.log("Catalog loaded", catalog);
            },
            onError: (err) => {
                console.error("Failed to load catalog", err);
            },
        },
        [backend, workspace],
    );

    if (status === "pending" || status === "loading") {
        return <div>Loading...</div>;
    }

    if (status === "error") {
        return <div>Error: {error?.message}</div>;
    }

    return <div>Loaded {result?.measures().length} measures</div>;
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.promise` | `((signal: AbortSignal) => Promise<TResult>) \| undefined \| null` | Promise factory. When `undefined` or `null`, hook stays in `"pending"` state. |
| `options.enableAbortController` | `boolean` | Enable AbortController that aborts when dependencies change. The promise must handle the AbortSignal. |
| `options.onLoading` | `() => void` | Called when promise loading starts. |
| `options.onPending` | `() => void` | Called when promise is not provided. |
| `options.onCancel` | `() => void` | Called when dependency list changes before promise resolves. |
| `options.onSuccess` | `(result: TResult) => void` | Called when promise fulfills. |
| `options.onError` | `(err: TError) => void` | Called when promise rejects. |
| `deps` | `DependencyList` | Dependency list that triggers re-execution. |

## Return value

`UseCancelablePromiseState<TResult, TError>` — one of:
- `{ status: "pending", result: undefined, error: undefined }`
- `{ status: "loading", result: undefined, error: undefined }`
- `{ status: "success", result: TResult, error: undefined }`
- `{ status: "error", result: undefined, error: TError }`

## States

| `status` | `result` | `error` | When |
|----------|----------|---------|------|
| `"pending"` | `undefined` | `undefined` | `promise` is `undefined` or `null`. `onPending` is called. |
| `"loading"` | `undefined` | `undefined` | `promise` is set and has not settled yet, including the first render. `onLoading` is called when the load starts. |
| `"success"` | `TResult` | `undefined` | The promise fulfilled. `onSuccess` is called with the result. |
| `"error"` | `undefined` | `TError` | The promise rejected. `onError` is called with the rejection value as is; the hook does not convert it. |

## When it re-runs

- The effect that calls `promise` uses `deps` as its React dependency list. When you pass `deps`, it runs again only when an item in `deps` changes by reference (`!==`). Changes to `promise` or to the callbacks alone do not start a new load.
- On the render in which `deps` change, the hook returns a fresh `"loading"` (or `"pending"`) state right away, so you never get the previous result together with the new dependencies.
- When `deps` change or the component unmounts before the promise settles, the hook cancels it and calls `onCancel`. A canceled promise's result or error is ignored and does not change the state.
- Cancellation only ignores the result. With `enableAbortController: true`, the hook also aborts the `AbortSignal` passed to `promise`; the underlying request stops only if your promise honors that signal.
- If you omit `deps`, React runs the effect after every render, so a new promise starts on each render.

## Notes

- The length of `deps` must stay constant between renders. Otherwise the hook throws an `UnexpectedSdkError`: "The final argument passed to useCancelablePromise changed size between renders."
- The callbacks used for a load are the ones from the render that started it.
- `TError` defaults to `any`. To combine several of these states into one, as `useInsightDataView` does, use `resolveUseCancelablePromisesStatus` and `resolveUseCancelablePromisesError`.
- Don't use the hook to write data to the backend. It does not cancel the underlying HTTP requests, only ignores stale results, unless `enableAbortController` is set and your promise honors the signal. Requests can also resolve in any order.

---
title: usePagedResource
category: Data layer
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui:usePagedResource"
source_files:
  - src/base/react/usePagedResource.ts
related_pages:
  - /docs/data-layer/use-cancelable-promise
  - /docs/data-layer/data-model/workspace-catalog
  - /docs/data-layer/use-execution-data-view
description: Fetch and accumulate items from a paginated SDK resource, with fetch and reset dependency lists.
ai_generated_description: true
type: docs
weight: 63
section: Data layer
---

Hook for getting data from a paged resource.

Manages loading state and item accumulation across multiple pages of a paginated API resource.

## Basic usage

```tsx
import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { usePagedResource } from "@gooddata/sdk-ui";

function WorkspaceList({ backend }: { backend: IAnalyticalBackend }) {
    const { items, totalItemsCount, isLoading } = usePagedResource(
        ({ offset, limit }: { offset: number; limit: number }) =>
            backend.workspaces().forCurrentUser().withOffset(offset).withLimit(limit).queryDescriptors(),
        [{ offset: 0, limit: 50 }],
        [backend], // fetchDeps
        [backend], // resetDeps
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <p>Total: {totalItemsCount}</p>
            <ul>
                {items.map((item) => (item ? <li key={item.id}>{item.title}</li> : null))}
            </ul>
        </div>
    );
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `resourceFactory` | `(params: TParams) => Promise<IPagedResource<TItem>>` | Factory function returning a paged resource promise. |
| `fetchParams` | `TParams[]` | Array of parameter objects, one per page to fetch. |
| `fetchDeps` | `DependencyList` | Dependencies that trigger re-fetching. |
| `resetDeps` | `DependencyList` | Dependencies that reset the accumulated items. |
| `getCacheKey` | `(params: TParams) => string` | Optional cache key function for deduplication. |
| `initialState` | `IUsePagedResourceState<TItem>` | Initial accumulated state. Defaults to `{ totalItemsCount: undefined, items: [] }`. |
| `preventResetPromises` | `boolean` | If `true`, in-flight promises are not reset when `resetDeps` change. |

## Return value

`IUsePagedResourceResult<TItem>`:
- `items`: `Array<TItem | undefined>` — accumulated items across pages
- `totalItemsCount`: `number | undefined` — total count from the paged resource
- `isLoading`: `boolean` — whether any page is currently loading

## When it re-runs

| Trigger | Effect |
|---------|--------|
| Mount, or a change in `fetchDeps` | Loads every entry in `fetchParams` that has no cached result yet. Pages already loaded are not requested again. |
| A change in `fetchParams` only | Nothing. The fetch runs only when `fetchDeps` change, so include whatever drives `fetchParams` in `fetchDeps`. |
| A change in `resetDeps` | Clears cached results and resets `items`, `totalItemsCount`, and `isLoading` to their initial values. Loads already in flight are not canceled: if one resolves after the reset, its page is still merged into `items`. With `preventResetPromises` set to `true`, the cache is not cleared if a `fetchDeps` change happened since the last successful load. |
| Unmount | Same cleanup as a `resetDeps` change. |

Dependencies are compared by reference, as in any React dependency list.

When `preventResetPromises` cancels a load, only the result is discarded. The underlying request keeps running.

## Notes

- `items` is a sparse array. The first page allocates an array of length `totalCount`, and each page is written at its `offset`. Positions that are not loaded yet are `undefined`, which is why the example skips them.
- A page counts as "first" while `totalItemsCount` is `undefined`. If you pass an `initialState` with a defined `totalItemsCount`, pages are written into a copy of `initialState.items` instead.
- The cache key for each entry in `fetchParams` is `getCacheKey(params)`, or `JSON.stringify(params)` if you omit `getCacheKey`.
- `resourceFactory` and `getCacheKey` are read once, on the first render. Passing a different function later has no effect.
- All new pages from one run load in parallel. Their results are merged only after every one of them resolves.
- The hook doesn't return errors. If a page request fails, `isLoading` returns to `false`, no page from that run is merged, and the failed parameters are not requested again until `resetDeps` change. Pages from that run that did succeed are not merged either, and are not requested again until `resetDeps` change.
- With `preventResetPromises` set to `true`, a `fetchDeps` change (or unmount) cancels the pending load for the first new entry of the previous run. The next `resetDeps` change then keeps the promise cache instead of clearing it, unless a load has succeeded in between.

## Props

{{% props %}}

---
title: useAttributeFilterHandler
description: Access the IMultiSelectAttributeFilterHandler Core API directly for low-level attribute filter control.
category: Filters
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-filters:useAttributeFilterHandler"
source_files:
  - src/AttributeFilter/hooks/useAttributeFilterHandler.ts
related_pages:
  - /docs/filters/use-attribute-filter-controller
  - /docs/filters/attribute-filter
  - /docs/filters/inspecting-filters
ai_generated_description: true
type: docs
weight: 50
section: Filters
---

Lower-level hook for accessing the `IMultiSelectAttributeFilterHandler` Core API directly. This is `@beta`.

Use this when you need direct access to the handler instance rather than the higher-level controller. For most custom filter UIs, prefer `useAttributeFilterController` which provides a more convenient interface.

## Basic usage

```tsx
import { useAttributeFilterHandler } from "@gooddata/sdk-ui-filters";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

function MyFilterHandler({ filter }) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const handler = useAttributeFilterHandler({
        backend,
        workspace,
        filter,
    });

    if (!handler) {
        return <div>Text (arbitrary or match) filters are not supported by this hook.</div>;
    }

    // Use handler's Core API directly
    // See IMultiSelectAttributeFilterHandler for available methods
    return <div>{/* Custom filter UI using handler */}</div>;
}
```

## Parameters

The hook takes one `IUseAttributeFilterHandlerProps` object, listed under [Props](#props). `backend`, `workspace`, and `filter` are required.

- `displayAsLabel` sets the label to display the elements as.
- `hiddenElements` lists elements to hide from the filter, in the same form as the filter elements: values for a value-based filter. On GoodData Cloud and GoodData.CN, a value is the element's primary key.
- `staticElements` replaces the elements loaded from the backend.
- `withoutApply` applies changes immediately, without confirmation.

## Return value

`IMultiSelectAttributeFilterHandler | null`

| Value | When |
|-------|------|
| `IMultiSelectAttributeFilterHandler` | `filter` is a positive or negative (elements) attribute filter. The hook creates the handler synchronously during the first render. |
| `null` | `filter` is an arbitrary or match (text) attribute filter when the handler is created. The hook creates no handler for these filter types. |

The hook does not load any data. Call `handler.init()` to load the attribute, the selected elements, and the initial elements page. `init()` cancels a running initialization, if any, and starts it again.

## Notes

- `backend` and `workspace` are required. The hook does not read them from `BackendProvider` or `WorkspaceProvider`. Use `useBackendStrict` and `useWorkspaceStrict`, as in the example, to take them from context.
- The handler always uses the `"multi"` selection mode.
- `withoutApply` defaults to `false`.
- `useAttributeFilterController` uses this hook internally and calls `init()` for you. It also handles parent filters, element limits, placeholders, and text filters.

### When it re-runs

The hook re-creates the handler (a new instance, which you must initialize again) when any of these change:

| Input | Compared by |
|-------|-------------|
| `backend` | Reference |
| `workspace` | Value |
| `filter` | Display form only. The handler is re-created when the `filter` display form differs from both the handler's current filter and the filter it was initialized with. A change of the selected elements alone does not re-create the handler. |
| `staticElements` | Deep equality |
| `hiddenElements` | Deep equality |

Changes of `displayAsLabel` or `withoutApply` alone do not re-create the handler.

The hook subscribes to `handler.onUpdate` and re-renders your component on every handler update. The subscription is removed when the handler changes and on unmount.

## Props

{{% props %}}

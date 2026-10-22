---
title: useAttributeFilterController
description: Build fully custom attribute filter UIs with SDK-managed state, elements loading, and apply callbacks.
category: Filters
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-filters:useAttributeFilterController"
source_files:
  - src/AttributeFilter/hooks/useAttributeFilterController.ts
related_pages:
  - /docs/filters/use-attribute-filter-handler
  - /docs/filters/attribute-filter
  - /docs/filters/attribute-filter-button
  - /docs/integrations/embedding/build-custom-frontend
ai_generated_description: true
type: docs
weight: 49
section: Filters
---

Hook for building fully custom attribute filter UIs.

Initializes the `AttributeFilterHandler` and provides the same state and callbacks available inside the `AttributeFilter` component. This is the best option when you need full control over the filter UI while leveraging the SDK's filter logic.

Works out of the box with `BackendProvider`, `WorkspaceProvider`, and visualization definition placeholders.

## Basic usage

```tsx
import { useAttributeFilterController } from "@gooddata/sdk-ui-filters";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";

function MyCustomAttributeFilter({ displayForm }) {
    const controller = useAttributeFilterController({
        filter: newPositiveAttributeFilter(displayForm, []),
    });

    const {
        isInitializing,
        elements,
        workingSelectionElements,
        committedSelectionElements,
        onSelect,
        onApply,
    } = controller;

    if (isInitializing) {
        return <div>Initializing filter...</div>;
    }

    const isSelected = (uri) =>
        workingSelectionElements.some((el) => el.uri === uri);

    const toggle = (element) => {
        const next = isSelected(element.uri)
            ? workingSelectionElements.filter((el) => el.uri !== element.uri)
            : [...workingSelectionElements, element];
        // onSelect(selectedItems, isInverted)
        onSelect(next, false);
    };

    return (
        <div>
            <ul>
                {elements?.map((element) => (
                    <li key={element.uri} onClick={() => toggle(element)}>
                        {isSelected(element.uri) ? "✓ " : ""}
                        {element.title}
                    </li>
                ))}
            </ul>
            <button onClick={() => onApply()}>
                Apply ({committedSelectionElements.length} applied)
            </button>
        </div>
    );
}
```

## Parameters

The hook takes one `IUseAttributeFilterControllerProps` object: the core props of `AttributeFilter` (`IAttributeFilterCoreProps`) without `fullscreenOnMobile`, `locale`, and `title`, plus the two props marked below. The most used ones:

| Prop | Type | Description |
|------|------|-------------|
| `filter` | `IAttributeFilter` | Initial attribute filter definition. |
| `connectToPlaceholder` | `IPlaceholder<IAttributeFilter>` | Optional placeholder to sync the filter with. |
| `parentFilters` | `AttributeFiltersOrPlaceholders` | Parent filters for dependent filtering. Accepts filters or placeholders. |
| `elementsOptions` | `{ limit: number }` | Limit the number of loaded attribute elements. Controller only. |
| `resetOnParentFilterChange` | `boolean` | Reset selection when parent filters change. Controller only. |

## Return value

`AttributeFilterController` — provides the filter state and callbacks needed to render a custom attribute filter UI. See the API reference for the full interface.

`isInitializing` is `true` while the handler initialization is pending or loading. After a failed initialization, `initError` holds the error. In `"single"` selection mode, `initError` is also set to an `UnexpectedSdkError` when the filter is not a positive filter with at most one selected element, or when parent filters are used with a backend that does not support single-select dependent filters.

When the current selection type is `"text"` (arbitrary or match filter), the elements-selection fields are inert: `workingSelectionElements` and `committedSelectionElements` are empty arrays, and `onSelect`, `onLoadNextElementsPage`, and `onOpen` do nothing. `elements` and `onSearch` stay available for autocomplete.

`onSelectionTypeChange` is `undefined` unless `menuConfig.availableSelectionTypes` includes both `"elements"` and a text type (`"arbitrary"` or `"match"`). The default is `["elements"]`.

## Notes

- `backend` and `workspace` props take precedence over `BackendProvider` and `WorkspaceProvider`. Without the prop or the provider, the hook throws `AttributeFilter: IAnalyticalBackend must be defined. Either pass it as a parameter or make sure there is a BackendProvider up the component tree.` (or the equivalent `workspace must be defined` message).
- Without a `filter`, a `connectToPlaceholder` value, and a `displayAsLabel`, the hook throws `AttributeFilter: filter's displayForm must be defined. Provide a filter with displayForm or displayAsLabel prop.`
- When `connectToPlaceholder` has a value, it takes precedence over `filter`. Don't combine the two props. With a placeholder, you don't need `onApply`: the hook writes the new filter to the placeholder.
- `resetOnParentFilterChange` defaults to `true`. If the backend supports circular dependencies in filters and parent filters are set, automatic reset is not possible and the hook throws `It is not possible to automatically reset dependent filters with current backend. Please set attribute filter to not reset on parent filter change (resetOnParentFilterChange prop).` Set `resetOnParentFilterChange` to `false` in that case.
- `selectionMode` defaults to `"multi"`; `selectFirst` and `withoutApply` default to `false`.

### When it re-runs

- The controller runs the first initialization of each new handler instance. `elementsOptions.limit` is read only at that point: it stays in effect for later loads, but later changes of `elementsOptions.limit` are ignored until a new handler is created.
- A new handler, and a new initialization, is created when `backend`, `workspace`, `hiddenElements` (deep equality), `staticElements` (deep equality), or the display form of `filter` changes.
- When `filter` changes in any other way (for example, its selected elements) or the resolved `parentFilters` change, the controller updates the existing handler and, depending on the change, re-initializes it or reloads the initial elements page. Changes of dependent date filters and `validateElementsBy` are applied only when `resetOnParentFilterChange` is `false`. A change of `displayAsLabel` re-initializes the handler.
- With `resetOnParentFilterChange` set to `true`, a parent filter change resets the selection (to all elements in `"multi"` mode), commits it, and calls `onChange` and `onApply` with the new filter.
- The selection type (elements or text) is re-derived only when the type of the resolved filter changes, not on every new `filter` object with the same type. `onReset` (closing without applying) also sets the selection type back to the type of the resolved filter.

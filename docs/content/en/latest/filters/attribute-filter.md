---
legacy_path: references/filters/attribute_filter
title: Attribute filter
category: Filters
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-filters:AttributeFilter"
  - "@gooddata/sdk-ui-filters:IAttributeFilterProps"
source_files:
  - src/AttributeFilter/AttributeFilter.tsx
props_interfaces:
  - IAttributeFilterProps
  - IAttributeFilterBaseProps
  - IAttributeFilterCoreProps
  - IAttributeFilterCustomComponentProps
related_pages:
  - /docs/filters/attribute-filter-button
  - /docs/filters/use-attribute-filter-controller
  - /docs/filters/use-attribute-filter-handler
  - /docs/filters/filter-visual-components
  - /docs/data-layer/data-model/visualization-placeholders
type: docs
description: Configure AttributeFilter with a filter definition or placeholder, handle selection changes, choose selection behavior, and replace its UI components.
weight: 43
section: Filters
aliases:
  - "../references/filters/attribute_filter/"
---

`AttributeFilter` is a dropdown that lists the values of an attribute and lets users pick the ones to filter by.

{{< figure src="/gd-ui/attribute_filter_new.png" alt="AttributeFilter dropdown open with a searchable list of attribute values and Apply and Cancel buttons" >}}

You can connect the component in one of two ways:

- Pass a `filter` and an `onApply` callback. The callback receives the updated filter when a user clicks **Apply**.
- Pass a [visualization definition placeholder](../../data-layer/data-model/visualization-placeholders/) in `connectToPlaceholder`. The component reads and writes the placeholder value itself, so `onApply` is optional.

{{% alert color="info" title="Identify elements by value" %}}
GoodData Cloud and GoodData.CN identify attribute elements by their primary key, which equals the element title. Pass element values, for example `newPositiveAttributeFilter(Md.Product.Name, ["Product A"])`. The `{ uris: [...] }` form is a legacy form: these backends treat its items as primary key values too.
{{% /alert %}}

## Structure

```tsx
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";

<AttributeFilter
    filter={<attribute-filter>}
    onApply={<on-apply-callback>}
    selectionMode={<"multi" | "single">}
    parentFilters={<parent-filters>}
    parentFilterOverAttribute={<connecting-attribute>}
/>;
```

## Example

The filter starts with nothing excluded. When a user clicks **Apply**, `onApply` receives the new filter definition, which you can pass to the `filters` prop of a chart.

```tsx
import { useState } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-filters/styles/css/main.css";

import * as Md from "./catalog.js";

const defaultFilter = newNegativeAttributeFilter(Md.EmployeeName.Default, []);

export const AttributeFilterExample = () => {
    const [filter, setFilter] = useState(defaultFilter);

    return (
        <AttributeFilter
            filter={filter}
            onApply={(updatedFilter) => {
                console.log("Applying updated filter:", updatedFilter);
                setFilter(updatedFilter);
            }}
        />
    );
};
```

## AttributeFilter vs. AttributeFilterButton

`AttributeFilter` works the same way as [`AttributeFilterButton`](../attribute-filter-button/). The two differ only in the look of the dropdown button.

{{< figure src="/gd-ui/attribute_filter_new_top_visual.png" alt="AttributeFilter dropdown button showing only the attribute name, Employee Name" >}}

## Default selection

To select values by default, include them in the `filter` prop.

```tsx
<AttributeFilter
    filter={newPositiveAttributeFilter(Md.EmployeeName.Default, ["Abbie Adams"])}
    onApply={setFilter}
/>
```

## Hidden and static elements

- `hiddenElements` removes elements from the list and from the resulting filter. Give the items in the same form as the filter elements: values for a value-based filter. Make sure your input filter is consistent with them: a positive filter must not contain any hidden element, and a negative filter must contain all of them.
- `staticElements` shows a fixed list of elements instead of loading them from the backend.

## Parent-child relationships between filters

To make one attribute filter depend on another, pass `parentFilters` and `parentFilterOverAttribute` to the child filter.

`parentFilterOverAttribute` defines how the parent and child filters are connected. Reference an attribute of the parent filter, or an attribute that both filters share.

The parent filter can be an attribute filter definition or a visualization definition placeholder.

```tsx
<div>
    <AttributeFilter filter={parentFilter} onApply={setParentFilter} />
    <AttributeFilter
        filter={filter}
        parentFilters={parentFilter ? [parentFilter] : []}
        parentFilterOverAttribute={idRef("attr.restaurantlocation.locationid")}
        onApply={setFilter}
    />
</div>
```

```tsx
<div>
    <AttributeFilter connectToPlaceholder={parentFilterPlaceholder} />
    <AttributeFilter
        connectToPlaceholder={filterPlaceholder}
        parentFilters={parentFilterPlaceholder ? [parentFilterPlaceholder] : []}
        parentFilterOverAttribute={idRef("attr.restaurantlocation.locationid")}
    />
</div>
```

### Dependent date filters

You can make an attribute filter depend on date filters (beta). The attribute filter then shows only the elements that are relevant for the specified date range. The `dependentDateFilters` prop takes dashboard date filters (`IDashboardDateFilter`), not the `IDateFilter` objects you pass to visualizations.

```tsx
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { idRef, type IDashboardDateFilter } from "@gooddata/sdk-model";

// Last 6 months including the current one
const dateFilter: IDashboardDateFilter = {
    dateFilter: {
        type: "relative",
        granularity: "GDC.time.month",
        from: -5,
        to: 0,
        dataSet: idRef("date.dataset", "dataSet"),
    },
};

<AttributeFilter filter={filter} dependentDateFilters={[dateFilter]} onApply={setFilter} />;
```

## Single value selection

To let users select only one value at a time, set `selectionMode` to `"single"`.

```tsx
import { useState } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-filters/styles/css/main.css";
import * as Md from "./catalog.js";

// Single selection filter must be a positive filter with at most one element
const singleValueFilter = newPositiveAttributeFilter(Md.Product.Name, ["Product A"]);

export const SingleSelectionAttributeFilterExample = () => {
    const [filter, setFilter] = useState(singleValueFilter);

    return (
        <AttributeFilter
            filter={filter}
            selectionMode="single"
            onApply={(updatedFilter) => {
                console.log("Applying updated single-value filter:", updatedFilter);
                setFilter(updatedFilter);
            }}
        />
    );
};
```

In single selection mode:

- The filter must be a positive filter with at most one selected element.
- If you use parent filters, the backend must support single-select dependent filters (the `supportsSingleSelectDependentFilters` capability).
- The component uses UI parts built for selecting one value.

### Automatic first item selection

To select the first available item when the filter is empty, set `selectFirst` to `true`. This works only in single selection mode.

```tsx
<AttributeFilter
    filter={newPositiveAttributeFilter(Md.Product.Name, [])}
    selectionMode="single"
    selectFirst={true}
    onApply={setFilter}
/>
```

## Filter the list by measures, facts, or attributes

To list only the elements that are compatible with specific measures, facts, or attributes, pass their object references (`ObjRef`) in `validateElementsBy`.

```tsx
import { useState } from "react";
import { AttributeFilter } from "@gooddata/sdk-ui-filters";
import { attributeDisplayFormRef, idRef, newNegativeAttributeFilter } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-filters/styles/css/main.css";
import * as Md from "./catalog.js";

const defaultFilter = newNegativeAttributeFilter(Md.Product.Name, []);

export const ValidatedAttributeFilterExample = () => {
    const [filter, setFilter] = useState(defaultFilter);

    return (
        <AttributeFilter
            filter={filter}
            validateElementsBy={[
                idRef("total_sales", "measure"), // Validate by measure
                idRef("fact.sales.amount", "fact"), // Validate by fact
                attributeDisplayFormRef(Md.Product.Category), // Validate by attribute label
            ]}
            onApply={setFilter}
        />
    );
};
```

`validateElementsBy` accepts references to:

- **Measures:** only elements that have data for these measures are listed.
- **Facts:** only elements connected to these facts are listed.
- **Attributes and labels:** only elements related to these attributes are listed.

For example, list only the territories that have sales for a product, or only the product categories that have revenue and orders:

```tsx
<AttributeFilter
    filter={categoryFilter}
    validateElementsBy={[idRef("revenue", "measure"), idRef("order_count", "measure")]}
    onApply={setCategoryFilter}
/>
```

{{% alert color="info" title="Backend support" %}}
Element validation needs the `supportsAttributeFilterElementsLimiting` backend capability. Backends without it ignore `validateElementsBy`.
{{% /alert %}}

## Customizing AttributeFilter components

{{% alert color="warning" title="Beta" %}}
`AttributeFilter` component customizations are in beta.
{{% /alert %}}

To change the look of `AttributeFilter`, pass your own components for specific parts of it.

```tsx
<AttributeFilter
    filter={newNegativeAttributeFilter(Md.EmployeeName.Default, [])}
    onApply={setFilter}
    // Your own component for the "Apply" and "Cancel" buttons
    DropdownActionsComponent={CustomActions}
    // Your own component for each attribute element
    ElementsSelectItemComponent={CustomItem}
/>
```

If the props passed to a custom component aren't enough, call the `useAttributeFilterContext` hook inside it to read the full internal state of the filter.

```tsx
const { attribute } = useAttributeFilterContext();
```

Use customizations for small changes to the `AttributeFilter` UI. For a UI that differs a lot, build your own with the [`useAttributeFilterController`](../use-attribute-filter-controller/) hook.

### Customizable parts

Each `*Component` prop replaces one part of the filter. `ErrorComponent` renders when the filter fails to initialize, and `LoadingComponent` renders while it initializes. The other parts:

- `DropdownButtonComponent`: the dropdown button.
  {{< figure src="/gd-ui/attribute_filter_dropdown_button.png" alt="Dropdown button of the attribute filter" >}}
- `DropdownBodyComponent`: the dropdown body.
  {{< figure src="/gd-ui/attribute_filter_dropdown_body.png" alt="Dropdown body with the search bar, the element list, and the action buttons" >}}
- `DropdownActionsComponent`: the Apply and Cancel buttons.
  {{< figure src="/gd-ui/attribute_filter_dropdown_actions.png" alt="Apply and Cancel buttons at the bottom of the dropdown" >}}
- `ElementsSearchBarComponent`: the search bar.
  {{< figure src="/gd-ui/attribute_filter_elements_search_bar.png" alt="Search bar above the element list" >}}
- `ElementsSelectComponent`: the element list.
  {{< figure src="/gd-ui/attribute_filter_elements_select.png" alt="List of attribute elements with checkboxes" >}}
- `ElementsSelectLoadingComponent`: the element list while it loads.
  {{< figure src="/gd-ui/attribute_filter_elements_select_loading.png" alt="Loading indicator in place of the element list" >}}
- `ElementsSelectItemComponent`: one element in the list.
  {{< figure src="/gd-ui/attribute_filter_elements_select_item.png" alt="A single attribute element row with a checkbox" >}}
- `ElementsSelectActionsComponent`: the select all control above the list.
  {{< figure src="/gd-ui/attribute_filter_elements_select_actions.png" alt="Checked All checkbox with the element count" >}}
- `ElementsSelectErrorComponent`: the error shown when elements fail to load.
  {{< figure src="/gd-ui/attribute_filter_elements_select_error.png" alt="Error loading list items message in place of the element list" >}}
- `EmptyResultComponent`: the message shown when no element matches.
  {{< figure src="/gd-ui/attribute_filter_empty_result.png" alt="No results match message in the dropdown" >}}
- `StatusBarComponent`: the status bar that summarizes the selection.
  {{< figure src="/gd-ui/attribute_filter_status_bar.png" alt="Status bar reading is All except followed by the excluded values" >}}

## Props

{{% props %}}

---
legacy_path: references/filters/attribute_filter_button_component
title: Attribute filter button
category: Filters
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-filters:AttributeFilterButton"
  - "@gooddata/sdk-ui-filters:IAttributeFilterBaseProps"
source_files:
  - src/AttributeFilter/AttributeFilterButton.tsx
props_interfaces:
  - IAttributeFilterButtonProps
related_pages:
  - /docs/filters/attribute-filter
  - /docs/filters/use-attribute-filter-controller
  - /docs/filters/filter-visual-components
  - /docs/filters/date-filter
  - /docs/data-layer/data-model/visualization-placeholders
type: docs
description: Configure AttributeFilterButton with a filter definition or placeholder, handle selected values, choose single or multiple selection, and replace its UI components.
weight: 44
section: Filters
aliases:
  - "../references/filters/attribute_filter_button_component/"
---

`AttributeFilterButton` is a dropdown that lists the values of an attribute. Its button shows the attribute name together with the current selection.

{{< figure src="/gd-ui/attribute_filter_button_new.png" alt="AttributeFilterButton dropdown open with a searchable list of attribute values and Apply and Cancel buttons" >}}

You can connect the component in one of two ways:

- Pass a `filter` and an `onApply` callback. The callback receives the updated filter when a user clicks **Apply**.
- Pass a [visualization definition placeholder](../../data-layer/data-model/visualization-placeholders/) in `connectToPlaceholder`. The component reads and writes the placeholder value itself, so `onApply` is optional.

{{% alert color="info" title="Identify elements by value" %}}
GoodData Cloud and GoodData.CN identify attribute elements by their primary key, which equals the element title. Pass element values, for example `newPositiveAttributeFilter(Md.EmployeeName.Default, ["Abbie Adams"])`. The `{ uris: [...] }` form is a legacy form: these backends treat its items as primary key values too.
{{% /alert %}}

## Structure

```tsx
import "@gooddata/sdk-ui-filters/styles/css/main.css";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";

<AttributeFilterButton
    filter={<attribute-filter>}
    onApply={<on-apply-callback>}
    selectionMode={<"multi" | "single">}
    attributeFilterMode={<"active" | "readonly" | "hidden">}
    parentFilters={<parent-filters>}
    parentFilterOverAttribute={<connecting-attribute>}
/>;
```

## Example

The filter starts with nothing excluded. When a user clicks **Apply**, `onApply` receives the new filter definition, which you can pass to the `filters` prop of a chart.

```tsx
import { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { newNegativeAttributeFilter } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-filters/styles/css/main.css";

import * as Md from "./catalog.js";

const defaultFilter = newNegativeAttributeFilter(Md.EmployeeName.Default, []);

export const AttributeFilterButtonExample = () => {
    const [filter, setFilter] = useState(defaultFilter);

    return (
        <AttributeFilterButton
            filter={filter}
            onApply={(updatedFilter) => {
                console.log("Applying updated filter:", updatedFilter);
                setFilter(updatedFilter);
            }}
        />
    );
};
```

## AttributeFilterButton vs. AttributeFilter

`AttributeFilterButton` works the same way as [`AttributeFilter`](../attribute-filter/). The differences:

- The button shows the attribute name and the current selection.
- `attributeFilterMode` sets the filter to `active`, `readonly`, or `hidden`.
- `AttributeFilterButton` has no `disabled` prop. Use `attributeFilterMode="readonly"` instead.

{{< figure src="/gd-ui/attribute_filter_button_new_top_visual.png" alt="AttributeFilterButton dropdown button showing the attribute name, Employee Name, and the selection, All" >}}

## Default selection

To select values by default, include them in the `filter` prop.

```tsx
<AttributeFilterButton
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

The parent filter can be an attribute filter definition or a [visualization definition placeholder](../../data-layer/data-model/visualization-placeholders/).

```tsx
<div>
    <AttributeFilterButton filter={parentFilter} onApply={setParentFilter} />
    <AttributeFilterButton
        filter={filter}
        parentFilters={parentFilter ? [parentFilter] : []}
        parentFilterOverAttribute={idRef("attr.restaurantlocation.locationid")}
        onApply={setFilter}
    />
</div>
```

```tsx
<div>
    <AttributeFilterButton connectToPlaceholder={parentFilterPlaceholder} />
    <AttributeFilterButton
        connectToPlaceholder={filterPlaceholder}
        parentFilters={parentFilterPlaceholder ? [parentFilterPlaceholder] : []}
        parentFilterOverAttribute={idRef("attr.restaurantlocation.locationid")}
    />
</div>
```

### Multiple parent filters

```tsx
<AttributeFilterButton
    filter={childFilter}
    parentFilters={[parentFilter1, parentFilter2]}
    parentFilterOverAttribute={idRef("attr.common.connectionid")}
    onApply={setChildFilter}
/>
```

### Connecting attribute per parent filter

`parentFilterOverAttribute` can also be a function. It's called for every parent filter and returns the connecting attribute for it.

```tsx
<AttributeFilterButton
    filter={childFilter}
    parentFilters={[parentFilter]}
    parentFilterOverAttribute={(parentFilter) => {
        // Return different connection attributes based on parent filter
        if (isRegionFilter(parentFilter)) {
            return idRef("attr.region.id");
        }
        return idRef("attr.country.id");
    }}
    onApply={setChildFilter}
/>
```

### Dependent date filters

You can make an attribute filter depend on date filters (beta). The attribute filter then shows only the elements that are relevant for the specified date range. The `dependentDateFilters` prop takes dashboard date filters (`IDashboardDateFilter`), not the `IDateFilter` objects you pass to visualizations.

```tsx
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

<AttributeFilterButton
    filter={attributeFilter}
    dependentDateFilters={[dateFilter]}
    onApply={setAttributeFilter}
/>;
```

## Single value selection

To let users select only one value at a time, set `selectionMode` to `"single"`.

```tsx
import { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-filters/styles/css/main.css";
import * as Md from "./catalog.js";

const singleValueFilter = newPositiveAttributeFilter(Md.Region.Default, []);

export const SingleSelectionExample = () => {
    const [filter, setFilter] = useState(singleValueFilter);

    return (
        <AttributeFilterButton
            filter={filter}
            selectionMode="single"
            selectFirst={true} // Automatically select first available element
            onApply={(updatedFilter) => {
                console.log("Single selection applied:", updatedFilter);
                setFilter(updatedFilter);
            }}
        />
    );
};
```

In single selection mode:

- The filter must be a positive filter with at most one selected element.
- The dropdown closes after a user selects a value.
- `selectFirst` selects the first available element when the filter is empty.

## Filter the list by measures, facts, or attributes

To list only the elements that are compatible with specific measures, facts, or attributes, pass their object references (`ObjRef`) in `validateElementsBy`. For example, list only products that have sales, or only regions with active customers.

```tsx
import { useState } from "react";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
import { attributeDisplayFormRef, idRef, newNegativeAttributeFilter } from "@gooddata/sdk-model";

import "@gooddata/sdk-ui-filters/styles/css/main.css";
import * as Md from "./catalog.js";

const defaultFilter = newNegativeAttributeFilter(Md.Product.Name, []);

export const ValidatedFilterExample = () => {
    const [filter, setFilter] = useState(defaultFilter);

    return (
        <AttributeFilterButton
            filter={filter}
            validateElementsBy={[
                idRef("revenue", "measure"), // Measure
                attributeDisplayFormRef(Md.Product.Category), // Attribute label
                idRef("fact.sales.amount", "fact"), // Fact
            ]}
            onApply={setFilter}
        />
    );
};
```

{{% alert color="info" title="Backend support" %}}
Element validation needs the `supportsAttributeFilterElementsLimiting` backend capability. Backends without it ignore `validateElementsBy`.
{{% /alert %}}

## Customizing AttributeFilterButton components

{{% alert color="warning" title="Beta" %}}
`AttributeFilterButton` component customizations are in beta.
{{% /alert %}}

To change the look of `AttributeFilterButton`, pass your own components for specific parts of it.

```tsx
<AttributeFilterButton
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

Use customizations for small changes to the `AttributeFilterButton` UI. For a UI that differs a lot, build your own with the [`useAttributeFilterController`](../use-attribute-filter-controller/) hook.

The `*Component` props and the parts of the UI they replace are the same as for `AttributeFilter`, see [Customizable parts](../attribute-filter/#customizable-parts). Only the dropdown button looks different:

{{< figure src="/gd-ui/attribute_filter_button_dropdown_button.png" alt="Dropdown button of AttributeFilterButton with the attribute name and the selection" >}}

## Props

`AttributeFilterButton` takes the props below except `disabled`, plus `attributeFilterMode` (`VisibilityMode`: `"active"`, `"readonly"`, or `"hidden"`).

{{% props %}}

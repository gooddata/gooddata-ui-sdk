---
title: Inspect filter objects
category: Filters
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-model:IFilter"
  - "@gooddata/sdk-model:isAttributeFilter"
  - "@gooddata/sdk-model:filterObjRef"
  - "@gooddata/sdk-model:filterAttributeElements"
  - "@gooddata/sdk-model:filterIsEmpty"
source_files:
  - src/execution/filter/index.ts
  - src/execution/filter/factory.ts
related_pages:
  - /docs/filters/filter-visual-components
  - /docs/data-layer/data-model/object-references
  - /docs/dashboard-plugins/use-widget-filters
  - /docs/filters/attribute-filter
  - /docs/filters/use-attribute-filter-controller
description: Split an IFilter array by kind, find the filter for a display form, read or replace the selected elements, and detect an empty selection without reading filter internals.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 48
section: Filters
---

Filters reach your code as `IFilter[]` from `useWidgetFilters`, `insightFilters`, the `onApply` callback of `AttributeFilter`, or a drill event. `IFilter` is a union, and each member wraps its data in a differently named body, such as `positiveAttributeFilter` or `relativeDateFilter`. Read them with the accessors below instead of opening those bodies.

## Split filters by kind

Pass the type guards straight to `filter`, `find`, or `some`. TypeScript narrows the result for you.

```ts
import { isAttributeFilter, isDateFilter, type IFilter } from "@gooddata/sdk-model";

function splitFilters(filters: IFilter[]) {
    return {
        attributeFilters: filters.filter(isAttributeFilter),
        dateFilters: filters.filter(isDateFilter),
    };
}
```

For a finer split, use `isAbsoluteDateFilter`, `isRelativeDateFilter`, `isAllTimeDateFilter`, `isMeasureValueFilter`, and `isRankingFilter`.

## Find the filter for a display form

`filterObjRef` returns the display form of an attribute filter and the dataset of a date filter. Compare it with `areObjRefsEqual`, never by reading `identifier` fields. See [Working with object references](../../data-layer/data-model/object-references/).

```ts
import {
    areObjRefsEqual,
    attributeDisplayFormRef,
    filterObjRef,
    isAttributeFilter,
    type IAttributeFilter,
    type IFilter,
    type ObjRef,
} from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

function attributeFilterFor(filters: IFilter[], displayForm: ObjRef): IAttributeFilter | undefined {
    return filters
        .filter(isAttributeFilter)
        .find((filter) => areObjRefsEqual(filterObjRef(filter), displayForm));
}

const productFilter = attributeFilterFor(filters, attributeDisplayFormRef(Md.Product.Name));
```

To find a date filter for a dataset, compare `filterObjRef(dateFilter)` with the dataset reference, for example `Md.DateDatasets.Closed.ref`.

## Read the selected elements

`filterAttributeElements` works for positive and negative filters (`IAttributeFilterWithSelection`). The result is `{ values }` for filters created from element values, which is the usual case on GoodData Cloud and GoodData.CN. Filters created with the legacy `{ uris }` form return `{ uris }`, so narrow the result before you read it.

```ts
import {
    filterAttributeElements,
    isAttributeElementsByRef,
    type IAttributeFilterWithSelection,
} from "@gooddata/sdk-model";

function selectedElements(filter: IAttributeFilterWithSelection): Array<string | null> {
    const selection = filterAttributeElements(filter);

    return isAttributeElementsByRef(selection) ? selection.uris : selection.values;
}
```

A `null` element stands for the empty value. Filter it out only when your UI has no way to show it.

You don't need to read `.positiveAttributeFilter.in` or `.negativeAttributeFilter.notIn` yourself; `filterAttributeElements` handles both. Check the polarity only to label the selection, for example "excludes" instead of "includes", with `isNegativeAttributeFilter(filter)`.

## Detect an empty selection

`filterIsEmpty` returns `true` when an attribute filter selects no elements. A negative filter with an empty selection excludes nothing; that is how the SDK represents a filter set to "All". A positive filter with an empty selection matches nothing.

```ts
import { filterIsEmpty, isAttributeFilter, type IFilter } from "@gooddata/sdk-model";

const activeAttributeFilters = filters.filter(isAttributeFilter).filter((filter) => !filterIsEmpty(filter));
```

## Replace the selection

Filters are immutable. Build a new one with the same display form, polarity, and local identifier. Keeping the local identifier matters when other parts of the execution definition refer to the filter.

```ts
import {
    filterLocalIdentifier,
    filterObjRef,
    isNegativeAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    type IAttributeElements,
    type INegativeAttributeFilter,
    type IPositiveAttributeFilter,
} from "@gooddata/sdk-model";

function withElements(
    filter: IPositiveAttributeFilter | INegativeAttributeFilter,
    elements: IAttributeElements,
): IPositiveAttributeFilter | INegativeAttributeFilter {
    const displayForm = filterObjRef(filter);

    return isNegativeAttributeFilter(filter)
        ? newNegativeAttributeFilter(displayForm, elements, filterLocalIdentifier(filter))
        : newPositiveAttributeFilter(displayForm, elements, filterLocalIdentifier(filter));
}
```

Both factories accept the `IAttributeElements` object you got from `filterAttributeElements`, so you can copy a selection from one filter to another without unpacking it.

## Notes

- `filterAttributeElements(filter)` returns `undefined` when you pass a filter that has no element selection, such as a date filter or a text-based attribute filter. Narrow with `isAttributeFilterWithSelection` first to get the non-optional overload; `isAttributeFilter` alone also matches `IArbitraryAttributeFilter` and `IMatchAttributeFilter`.
- `filterObjRef(filter)` is `undefined` for measure value and ranking filters, which have no single object reference.
- When you pass plain values instead of an `IAttributeElements` object, `newPositiveAttributeFilter` accepts `(string | null)[]` but `newNegativeAttributeFilter` accepts only `string[]`. Pass the `IAttributeElements` object to sidestep the difference.
- Dashboard-level filters (`FilterContextItem`) have a different shape from `IFilter`. Read them with the selectors described in [useDashboardSelector](../../dashboard-plugins/use-dashboard-selector/), and use `useWidgetFilters` to get the effective `IFilter[]` for a widget.

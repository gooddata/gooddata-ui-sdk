---
title: Working with attributes
category: Data layer / Data model
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-model:newAttribute"
  - "@gooddata/sdk-model:IAttribute"
  - "@gooddata/sdk-model:newAttributeSort"
  - "@gooddata/sdk-model:IAttributeElement"
  - "@gooddata/sdk-backend-spi:IElementsQuery"
source_files:
  - src/execution/attribute/factory.ts
  - src/execution/attribute/index.ts
  - src/execution/base/sort.ts
props_interfaces:
  - IAttribute
related_pages:
  - /docs/data-layer/data-model/measures
  - /docs/data-layer/data-model/workspace-catalog
  - /docs/data-layer/data-model/export-catalog
  - /docs/data-layer/data-model/object-references
  - /docs/filters/filter-visual-components
description: Create and modify IAttribute objects with newAttribute, apply optional local identifiers and alias overrides.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 72
section: Data layer
subsection: Data model
---

Create `IAttribute` objects with `newAttribute`, and adjust existing ones with `modifyAttribute`. An attribute in an execution always references a display form (label), not the attribute itself, because the display form decides which values appear in the result.

`newAttribute` takes a display form identifier (treated as `idRef(id, "displayForm")`) or an `ObjRef`, and an optional callback that receives an `AttributeBuilder`:

| Builder method | Effect |
|----------------|--------|
| `alias(text)` | Overrides the display label. |
| `localId(id)` | Sets the local identifier that other parts of the execution use to reference the attribute. Without it, the builder derives a stable one from the alias and the display form. |
| `showAllValues(true)` | Returns all values, also those without data. |
| `displayForm(ref)` | Switches to another display form. |

## Basic usage

```ts
import { newAttribute, idRef } from "@gooddata/sdk-model";

// Create an attribute from a display form identifier
const region = newAttribute("region.displayform.id");

// Customize with the builder (alias, localId, etc.)
const regionWithAlias = newAttribute(
    idRef("region.displayform.id", "displayForm"),
    (b) => b.alias("Sales Region").localId("region"),
);
```

## Attribute fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `attribute` | `IAttributeBody` | Yes | Body of the attribute, wrapping the display form ref, optional alias, and `localIdentifier`. |

## Notes

Use `modifyAttribute` instead of `newAttribute` when you already have an `IAttribute` and want to tweak it — it preserves the original `localIdentifier` by default, which is important because executions cross-reference measures and attributes by that id. All local identifiers inside a single execution definition must be unique; supply an explicit `localId` when your execution references the same attribute twice with different aliases or sorts. Refer to display forms by identifier: GoodData Cloud and GoodData.CN do not support URI references.

## Load attribute values

The `AttributeFilter` component loads the values it offers for you. To load them yourself, for example for a custom
picker, a saved-selection check, or a server-side search, use the attributes service.

```ts
import { type IAnalyticalBackend, type IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { attributeDisplayFormRef } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

const productDisplayForm = attributeDisplayFormRef(Md.Product.Name);

export function searchProducts(
    backend: IAnalyticalBackend,
    workspace: string,
    text: string,
): Promise<IElementsQueryResult> {
    return backend
        .workspace(workspace)
        .attributes()
        .elements()
        .forDisplayForm(productDisplayForm)
        .withLimit(50)
        .withOffset(0)
        .withOptions({ filter: text })
        .query();
}
```

The result is an `IPagedResource` of `IAttributeElement`. Read the first page from `items`, the total from
`totalCount`, and call `next()` or `all()` for more. Each element has a `title` and a `uri`, which on GoodData Cloud
and GoodData.CN holds the value of the primary label. Both are `null` for the empty value.

| Method | Effect |
|--------|--------|
| [`withLimit(n)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.ielementsquery.withlimit.md" >}}), [`withOffset(n)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.ielementsquery.withoffset.md" >}}) | Page size and start. The analytics engine caps the page size. |
| [`withOptions({ filter })`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.ielementsquery.withoptions.md" >}}) | Server-side substring match on the title. |
| [`withOptions({ order })`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.ielementsquery.withoptions.md" >}}) | `"asc"` or `"desc"` by title. |
| [`withOptions({ elements })`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.ielementsquery.withoptions.md" >}}) | Load specific values only: `{ values: [...] }` (values of this display form) or `{ primaryValues: [...] }` (values of the primary label). `{ uris: [...] }` is not supported. |
| [`withOptions({ complement: true })`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.ielementsquery.withoptions.md" >}}) | Return every value except those in `elements`. |
| [`withAttributeFilters([{ attributeFilter, overAttribute }])`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.ielementsquery.withattributefilters.md" >}}) | Restrict to values that exist with the given parent selection. This is how dependent filters work. |
| [`withDateFilters(filters)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.ielementsquery.withdatefilters.md" >}}) | Restrict to values that have data in the date range. |
| [`withMeasures(measures)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.ielementsquery.withmeasures.md" >}}) | Not supported on GoodData Cloud and GoodData.CN; it throws `NotSupported`. Use `withAvailableElementsOnly` instead. |
| [`withAvailableElementsOnly(refs)`]({{< relref "/latest/api-reference/sdk-backend-spi/sdk-backend-spi.ielementsquery.withavailableelementsonly.md" >}}) | Restrict to values valid for the objects in `refs`. |
| `withSignal(signal)` | Cancel through an `AbortSignal`. |

Load only what you show. Every call is a round trip, and the caching decorator sends a request that carries a
`filter` to the analytics engine unless it already holds the complete element list for that display form; see [Improve dashboard performance](../../../dashboard-plugins/dashboard-performance/).

In React, drive the query with [usePagedResource](../../use-paged-resource/) to accumulate pages, or with
[useCancelablePromise](../../use-cancelable-promise/) for a single page. To build a filter from the loaded
elements, pass their titles as `{ values: [element.title] }` to `newPositiveAttributeFilter`; see
[Inspect filter objects](../../../filters/inspecting-filters/).

### Check a saved selection

Values stored in a URL or in user preferences can disappear from the data. Ask for exactly those values and compare
what came back:

```ts
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { attributeDisplayFormRef } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

export async function stillValid(backend: IAnalyticalBackend, workspace: string, saved: string[]): Promise<string[]> {
    const result = await backend
        .workspace(workspace)
        .attributes()
        .elements()
        .forDisplayForm(attributeDisplayFormRef(Md.Region.Default))
        .withOptions({ elements: { values: saved } })
        .query();

    const found = new Set(result.items.map((element) => element.title));

    return saved.filter((value) => found.has(value));
}
```

## Props

{{% props %}}

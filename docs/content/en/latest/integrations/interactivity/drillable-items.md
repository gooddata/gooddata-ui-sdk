---
legacy_path: learn/add_interactivity/drillable_items
title: Make visualizations drillable
linkTitle: Drillable items
category: Integrations / Interactivity
diataxis_type: howto
api_symbols:
  - "@gooddata/sdk-ui:HeaderPredicates"
  - "@gooddata/sdk-ui:IHeaderPredicate"
source_files:
  - src/insightView/InsightView.tsx
props_interfaces:
  - IInsightViewProps
  - Partial<IVisualizationCallbacks>
related_pages:
  - /docs/integrations/interactivity/on-drill
  - /docs/integrations/interactivity/predicates
  - /docs/data-layer/data-model/export-catalog
  - /docs/dashboard-plugins/customize-widgets
  - /docs/data-layer/data-model/attribute-hierarchies
type: docs
description: Configure drillableItems with header predicates to make visualization measures or attributes interactive and receive drill event context.
weight: 89
section: Integrations
subsection: Interactivity
aliases:
  - "../../learn/add_interactivity/drillable_items/"
---

Drilling is "zooming in" on a single measure value: filtering out all other data and breaking that value down by a new attribute of interest. To make a visualization drillable, pass at least one predicate function in the `drillableItems` prop. Clicks on the matching items then call your [`onDrill`](../on-drill/) callback.

Drillable items can consist of the following entities:
- Measures
- Attribute display forms (labels), defined by their identifier

    A display form, or attribute label, is a different way of representing an attribute. For example, the `Name` attribute might have labels for `Firstname` and `Lastname`. See [Attributes](https://www.gooddata.ai/docs/cloud/model-data/concepts/attribute/).
- Attribute values

Visualization points that intersect any defined measures, attributes, or attribute values become drillable and emit events when the user clicks them.

Ad-hoc measures (measures created from attributes or other measures, for example with `computeRatio`) are matched
by the identifier they use in the execution. To make one drillable, pass the same identifier you used to build it.

## Structure

```ts
drillableItems: [
    (header: IMappingHeader, context: IMappingHeaderContext) => boolean, // Type: IHeaderPredicate
    ...
]
```

`IHeaderPredicate` defines the function that accepts `IMappingHeader` and `context` as its parameters and returns
a boolean value. This function is executed against every measure and attribute in a visualization. If the function
returns `true`, the measure or attribute is drillable. If the function returns `false`, the measure or attribute is
not drillable.

You can write any logic to decide whether a measure or attribute is drillable, though you rarely need to. See [Predicates](../predicates/).

### Predicate factory helpers

`HeaderPredicates` from `@gooddata/sdk-ui` builds the predicate functions for the most common drilling use cases.

`HeaderPredicates` provides the following predicate factory functions:

- `identifierMatch("<measure-or-attribute-identifier>")`

    The helper builds a predicate function that matches any measure or attribute in a visualization to the provided identifier.
- `composedFromIdentifier("<measure-or-attribute-identifier>")`

    The helper builds a predicate function that matches any arithmetic measure in a visualization containing measures to the provided identifier in its tree of measures that the arithmetic measure is built from.

{{% alert color="info" title="Legacy URI helpers" %}}
`uriMatch` and `composedFromUri` match objects referenced by URI, which only GoodData Legacy uses. On GoodData Cloud and GoodData.CN, use the identifier helpers.
{{% /alert %}}

## Set up drilling

Pass an array of `IHeaderPredicate` functions in the `drillableItems` prop. The measures and attributes they match are highlighted and become drillable.

This example makes the measure with the identifier `revenue` and the attribute label with the identifier `region` drillable:

```tsx
import { HeaderPredicates, type IDrillEvent } from "@gooddata/sdk-ui";
import { InsightView } from "@gooddata/sdk-ui-ext";

function onDrillHandler(event: IDrillEvent) {
    // handle drill
}

export function RevenueVisualization() {
    return (
        <InsightView
            insight="<visualization-id>"
            drillableItems={[HeaderPredicates.identifierMatch("revenue"), HeaderPredicates.identifierMatch("region")]}
            onDrill={onDrillHandler}
        />
    );
}
```

This example makes every arithmetic measure drillable whose tree of source measures contains the measure with the identifier `revenue`:

```tsx
<InsightView
    insight="<visualization-id>"
    drillableItems={[HeaderPredicates.composedFromIdentifier("revenue")]}
    onDrill={onDrillHandler}
/>
```

Each event contains an object consisting of `dataView` and `drillContext`. `dataView` contains the underlying data used
to render the chart from which the drill event originates. `drillContext` contains full context of which element the
user clicked.

### Use the generated catalog

With the catalog that [catalog-export](../../../data-layer/data-model/export-catalog/) generates, pass catalog constants to `HeaderPredicates.objMatch`, so you don't need to look up identifiers.

`objMatch` first compares the `localIdentifier` of the measure or attribute. If that doesn't match, it compares the `objRef`, and then every instance of that measure or attribute becomes drillable.

```tsx
import { HeaderPredicates } from "@gooddata/sdk-ui";
import * as Md from "./catalog.js";

<InsightView
    insight="<visualization-id>"
    drillableItems={[HeaderPredicates.objMatch(Md.Region.Default)]}
    onDrill={onDrillHandler}
/>;
```

For drilling in embedded GoodData Cloud dashboards, see [Embedding and drilling in GoodData Cloud](https://www.gooddata.ai/docs/cloud/embed-visualizations/).

---
title: Working with visualization objects
category: Data layer / Data model
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-model:IInsight"
  - "@gooddata/sdk-model:IInsightDefinition"
  - "@gooddata/sdk-model:insightMeasures"
  - "@gooddata/sdk-model:insightFilters"
  - "@gooddata/sdk-model:insightSetFilters"
source_files:
  - src/insight/index.ts
related_pages:
  - /docs/visualisations/insightview
  - /docs/data-layer/use-insight-data-view
  - /docs/data-layer/data-model/measures
  - /docs/data-layer/data-model/attributes
  - /docs/dashboard-plugins/use-widget-filters
description: Read measures, attributes, filters, and identity from IInsight with the insight* accessors, and derive copies with insightSet*.
ai_generated_description: true
ai_generated_body: true
type: docs
weight: 75
section: Data layer
subsection: Data model
---

{{% alert %}} The term 'insight' is an obsolete expression for 'visualizations' but is still employed within the SDK's components and functions.
{{% /alert %}}

A saved visualization is an `IInsight`. Read it with the accessors below, and derive a changed copy with the setters.

## Concepts

`IInsightDefinition` holds what the visualization shows: buckets of measures and attributes, filters, sorts, visualization properties, a title, and a `visualizationUrl` naming the visualization type. `IInsight` extends it with identity: the object reference, identifier, URI, and audit fields.

You get an `IInsight` from `backend.workspace(workspace).insights().getInsight(ref)`, from the `selectInsights` selector in the `Dashboard` component, or as the `insight` prop of a custom visualization component registered by a dashboard plugin.

All data sits under `insight.insight`. Don't read that body directly: the accessors validate their input and keep working when the internal layout changes.

## Read the definition

| Accessor | Returns |
|----------|---------|
| [`insightTitle(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insighttitle.md" >}}) | `string` |
| [`insightVisualizationUrl(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightvisualizationurl.md" >}}) | `string`, for example `"local:column"` or `"local:table"` |
| [`insightBuckets(insight, ...ids)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightbuckets.md" >}}) | `IBucket[]`, optionally only the buckets with the given local identifiers |
| [`insightBucket(insight, id)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightbucket.md" >}}) | `IBucket \| undefined` |
| [`insightMeasures(insight, predicate?)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightmeasures.md" >}}) | `IMeasure[]` across all buckets |
| [`insightAttributes(insight, predicate?)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightattributes.md" >}}) | `IAttribute[]` across all buckets |
| [`insightFilters(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightfilters.md" >}}) | `IFilter[]` |
| [`insightSorts(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightsorts.md" >}}) | `ISortItem[]` |
| [`insightProperties(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightproperties.md" >}}) | `VisualizationProperties` |
| [`insightTags(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insighttags.md" >}}) | `string[]` |

Combine them with the measure and attribute accessors:

```ts
import {
    attributeDisplayFormRef,
    insightAttributes,
    insightFilters,
    insightMeasures,
    insightTitle,
    measureIdentifier,
    type IInsight,
} from "@gooddata/sdk-model";

function summarize(insight: IInsight) {
    return {
        title: insightTitle(insight),
        measureIdentifiers: insightMeasures(insight).map(measureIdentifier),
        displayForms: insightAttributes(insight).map(attributeDisplayFormRef),
        filterCount: insightFilters(insight).length,
    };
}
```

To read one bucket, ask for it by local identifier. The identifiers depend on the visualization type. For example, a column chart uses `measures`, `view`, and `stack`.

```ts
import { bucketMeasures, insightBucket, type IInsight } from "@gooddata/sdk-model";

function primaryMeasures(insight: IInsight) {
    const measuresBucket = insightBucket(insight, "measures");

    if (!measuresBucket) {
        return [];
    }

    return bucketMeasures(measuresBucket);
}
```

Tags are the usual way to group saved visualizations. `insightTags` returns an empty array when there are none, so `insightTags(insight).includes("featured")` needs no guard.

## Read the identity

| Accessor | Returns |
|----------|---------|
| [`insightRef(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightref.md" >}}) | `ObjRef` |
| [`insightId(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightid.md" >}}) | `string` |
| [`insightUri(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insighturi.md" >}}) | `string` |
| [`insightCreated(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightcreated.md" >}}) | `string \| undefined` |
| [`insightUpdated(insight)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightupdated.md" >}}) | `string \| undefined` |

Compare references with `areObjRefsEqual`, not by identifier string. See [Working with object references](../object-references/).

## Derive a modified copy

The setters return a new object and leave the input unchanged. When you pass an `IInsight`, you get an `IInsight` back with the identity intact.

| Setter | Replaces |
|--------|----------|
| [`insightSetFilters(insight, filters)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightsetfilters.md" >}}) | the filters |
| [`insightSetSorts(insight, sorts)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightsetsorts.md" >}}) | the sorts |
| [`insightSetProperties(insight, properties)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightsetproperties.md" >}}) | the visualization properties |
| [`insightSetBuckets(insight, buckets)`]({{< relref "/latest/api-reference/sdk-model/sdk-model.insightsetbuckets.md" >}}) | the buckets |

The common case is adding filters before execution:

```ts
import { insightFilters, insightSetFilters, type IFilter, type IInsight } from "@gooddata/sdk-model";

function withExtraFilters(insight: IInsight, extraFilters: IFilter[]): IInsight {
    return insightSetFilters(insight, [...insightFilters(insight), ...extraFilters]);
}
```

Execute the copy with `backend.workspace(workspace).execution().forInsight(copy)`; see [ExecuteInsight](../../execute-insight/). Inside a dashboard, `useWidgetFilters` gives you the filters to pass here; see [useWidgetFilters](../../../dashboard-plugins/use-widget-filters/).

## Notes

- `insightMeasures` and `insightAttributes` accept a predicate to pick items, for example `insightMeasures(insight, isSimpleMeasure)`.
- `insightVisualizationUrl` is the stable way to learn the visualization type. Compare the whole string; do not parse it.

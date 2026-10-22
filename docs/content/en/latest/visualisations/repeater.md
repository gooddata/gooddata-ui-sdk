---
legacy_path: references/visual_components/repeater_chart
title: Repeater
description: Render repeated inline visualizations for each data row with the Repeater component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:Repeater"
  - "@gooddata/sdk-ui-charts:IRepeaterProps"
source_files:
  - src/charts/repeater/Repeater.tsx
props_interfaces:
  - IRepeaterProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IRepeaterBucketProps
related_pages:
  - /docs/visualisations/pivot-table
  - /docs/visualisations/headline
  - /docs/visualisations/line-chart
  - /docs/visualisations/charts-and-plots
type: docs
weight: 25
section: Visualisations
aliases:
  - "../references/visual_components/repeater_chart/"
---

The Repeater component in GoodData.UI, similar to sparklines, displays one visualization in each of several rows, with each row varying by a key attribute. Use it to compare trends across many items in one grid, for example, one line chart of monthly franchise fees per state.

{{% alert color="warning" %}}
Repeater is currently in the **beta** stage.
{{% /alert %}}

{{< figure src="/gd-ui/repeater_chart.png" alt="Repeater with one row per product category, showing revenue as a line chart, average unit price as a number, and units returned as a column chart" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `attribute` | Yes | One attribute | Sets the rows, one row per attribute value. |
| `columns` | No | Attributes and measures | Sets the columns. Attributes show as text, or as images and links when their label type is Image or Hyperlink. Measures show as numbers or inline charts (see [Example](#example)). Without at least one column, the repeater shows an error. |
| `viewBy` | No | One attribute | Slices the measures in inline charts, one data point per value. |
| `filters` | No | Filters | Limits the data the repeater shows. |

## Sorting

`Repeater` applies no sorting and has no `sortBy` prop.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the inline charts, one per measure. |
| `separators` | Thousands and decimal separators in the number format. |

## Limits

- Only attributes in `columns` can be drilled into.
- With `viewBy`, the repeater loads at most 1,000 values per row, counted as `viewBy` values times measures. It doesn't show the rest.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Repeater } from "@gooddata/sdk-ui-charts";

<Repeater
    attribute={<primaryAttribute>}
    columns={<attributesOrMeasures>}
    viewBy={<viewByAttribute>}
    config={<chart-config>}
    …
/>
```

## Example

The following code sample shows an arrangement for a typical repeater:

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Repeater } from "@gooddata/sdk-ui-charts";
import { measureLocalId } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <Repeater
        attribute={Md.LocationState}
        columns={[Md.LocationState, Md.$FranchiseFees]}
        viewBy={Md.DateDatasets.OrderDate.OrderDateMonthYear.Default}
        config={{
            inlineVisualizations: {
                [measureLocalId(Md.$FranchiseFees)]: {
                    type: "line",
                },
            },
        }}
    />
</div>;
```

The following code sample shows an arrangement for a repeater with advanced configuration

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Repeater } from "@gooddata/sdk-ui-charts";
import { attributeLocalId, measureLocalId } from "@gooddata/sdk-model";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <Repeater
        attribute={Md.LocationState}
        columns={[Md.LocationHyperlink, Md.$FranchiseFees]}
        viewBy={Md.DateDatasets.OrderDate.OrderDateMonthYear.Default}
        config={{
            hyperLinks: {
                [attributeLocalId(Md.LocationHyperlink)]: {
                    // Configure custom text to show for the hyperlink label
                    staticElementsText: "See location details",
                },
            },
            inlineVisualizations: {
                [measureLocalId(Md.$FranchiseFees)]: {
                    // Configure inline visualization type
                    type: "line",
                },
            },
            // Configure image sizing
            cellImageSizing: "fill",
            // Configure text wrapping
            cellTextWrapping: "wrap",
            // Configure vertical alignment of the repeater cells
            cellVerticalAlign: "middle",
        }}
    />
</div>;
```

## Props

{{% props %}}

---
title: Mekko chart
description: Compare two measures across variable-width stacked columns with the Mekko component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:Mekko"
  - "@gooddata/sdk-ui-charts:IMekkoProps"
source_files:
  - src/charts/mekko/Mekko.tsx
props_interfaces:
  - IMekkoProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IMekkoBucketProps
related_pages:
  - /docs/visualisations/column-chart
  - /docs/visualisations/treemap
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 20
section: Visualisations
---

A **Mekko chart** (also known as a Marimekko or mosaic chart) shows two measures at once as stacked columns: `widthMeasure` sets each column's width, and `heightMeasure` sets the height of the segments stacked inside it. Use it to compare the size and the composition of categories at the same time — for example, market share by width and product mix by height.

{{% alert color="warning" title="Beta API" %}}
`Mekko` is `@beta`: it's mostly stable, but details may still change outside of the usual SemVer guarantees. See [API maturity](../../integrations/platform/api-maturity/) before you depend on it.
{{% /alert %}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `widthMeasure` | No | One measure | Sets the width of each column, proportional to its value. With `stackBy`, a column's width is the sum of its segments' `widthMeasure` values. Without `widthMeasure`, all columns are equally wide. |
| `heightMeasure` | No | One measure | Sets the height of each column, or of each segment with `stackBy`, read off the Y axis. |
| `viewBy` | No | One attribute | Draws one column per attribute value. |
| `stackBy` | No | One attribute | Splits each column into segments, one per attribute value. |
| `filters` | No | Filters | Limits the data the Mekko chart shows. |

## Sorting

`Mekko` applies no default sorting. To sort the data, pass sort items in the `sortBy` prop. With `stackBy` set, measure sorts don't go to the execution. The chart applies the first measure sort in `sortBy` in the browser, provided it sorts by `widthMeasure` or `heightMeasure`, and orders the columns by their total value of that measure. Other measure sorts are ignored. Attribute sorts go to the execution.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the segments, one per `stackBy` value. Without `stackBy`, all columns share one color. |
| `legend` | Whether the legend shows and where. |
| `dataLabels` | `visible` shows or hides the labels. `totalsVisible` shows or hides the totals of stacked columns. `style: "backplate"` adds a background behind the labels. |
| `stackMeasuresToPercent` | With `stackBy`, stacks the segments of each column to 100%. If any `heightMeasure` value is negative, the chart falls back to regular stacking. |
| `xaxis`, `yaxis` | Visibility, labels, rotation, and name of the axes. `yaxis.min` and `yaxis.max` set the scale of the height axis. |
| `grid` | `enabled` shows or hides the grid lines. |
| `separators` | Thousands and decimal separators in the number format. |
| `zoomInsight` | Lets users zoom and pan along the axis with the `viewBy` values. |
| `enableCompactSize` | Hides axis labels and names when the chart is too small for them. Has no effect when `zoomInsight` is on. |

## Limits

- A column can't have a negative width. If a column's `widthMeasure` value is negative, the chart shows an error and `onError` receives a `NegativeValuesSdkError`. With `stackBy`, the check uses the sum of the column's segments. Negative `heightMeasure` values are allowed.
- Columns whose `widthMeasure` value (with `stackBy`, the sum of their segments) is zero or empty aren't drawn.
- Without `heightMeasure` and `stackBy`, the chart draws flat columns, labels them with their `widthMeasure` values when data labels are on, and hides the Y axis. With `stackBy`, it stacks each column's segments to 100% by their `widthMeasure` values instead.
- A Mekko chart renders up to 10,000 columns and up to 10,000 `stackBy` values. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- Mekko charts work best with a moderate number of `viewBy` and `stackBy` values — too many columns or segments make the relative widths and heights hard to compare.

## Usage patterns

### Width and height measures

`widthMeasure` controls how wide each column is relative to the others, and `heightMeasure` controls how tall the stacked segments inside it are. `viewBy` creates one column per attribute value, and `stackBy` splits each column into segments:

```tsx
<Mekko
    widthMeasure={Md.$MarketSize}
    heightMeasure={Md.$Revenue}
    viewBy={Md.Segment}
    stackBy={Md.ProductLine}
/>
```

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Mekko } from "@gooddata/sdk-ui-charts";

<Mekko
    widthMeasure={<measure>}
    heightMeasure={<measure>}
    viewBy={<attribute>}
    stackBy={<attribute>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Mekko } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <Mekko
        widthMeasure={Md.$TotalRevenue}
        heightMeasure={Md.$NrOfOrders}
        viewBy={Md.Region}
        stackBy={Md.Product.Name}
    />
</div>
```

## Props

{{% props %}}

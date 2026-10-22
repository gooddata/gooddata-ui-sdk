---
legacy_path: references/visual_components/bar_chart
title: Bar chart
description: Display horizontal bar comparisons with the BarChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:BarChart"
  - "@gooddata/sdk-ui-charts:IBarChartProps"
source_files:
  - src/charts/barChart/BarChart.tsx
props_interfaces:
  - IBarChartProps
  - IBarChartBucketProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
related_pages:
  - /docs/visualisations/column-chart
  - /docs/visualisations/combo-chart
  - /docs/visualisations/bullet-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 6
section: Visualisations
aliases:
  - "../references/visual_components/bar_chart/"
---

A **bar chart** shows data in horizontal bars. Bar charts can display one or multiple measures side by side divided by attribute values or a single measure stacked by attribute values. Use it to compare values across categories, for example, sales by product.

{{< figure src="/gd-ui/bar_chart.png" alt="Bar chart of total sales by location resort, one horizontal bar per resort" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | Yes | One or more measures | Sets the length of the bars, one bar per measure. |
| `viewBy` | No | One or two attributes | Slices the measures by the attribute values along the Y axis. With two attributes, the values of the second attribute are grouped under each value of the first. Extra attributes are ignored. |
| `stackBy` | No | One attribute | Splits each bar into segments, one per attribute value. Works only with a single measure. |
| `filters` | No | Filters | Limits the data the bar chart shows. |

## Sorting

`BarChart` applies no default sorting. To sort the data, pass sort items in the `sortBy` prop. To sort stacked bars by their totals, use an attribute area sort (`newAttributeAreaSort`) on the `viewBy` attribute. See [Sort items](../../data-layer/execution/execution-model/#sort-items).

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the bars: one per measure, or one per `stackBy` value. |
| `legend` | Whether the legend shows and where. |
| `dataLabels` | `visible` shows or hides the labels. `totalsVisible` shows or hides the totals of stacked bars, which are hidden by default. `style: "backplate"` adds a background behind the labels. |
| `stackMeasures`, `stackMeasuresToPercent` | `stackMeasures` stacks the measures into one bar. `stackMeasuresToPercent` stacks the measures, or the `stackBy` segments, to 100% and overrides `stackMeasures`. |
| `enableReversedStacking` | Reverses the order of the segments in stacked bars. |
| `xaxis`, `yaxis` | Visibility, labels, rotation, and name of the axes. `xaxis` is the horizontal value axis, where `min` and `max` set the scale. `yaxis` is the vertical axis with the `viewBy` values. |
| `secondary_xaxis` | Shows the measures listed in `measures` (local identifiers) on a secondary axis at the top. Takes the same options as `xaxis`. |
| `enableJoinedAttributeAxisName` | With two `viewBy` attributes, their axis has no name by default. This option shows the attribute names joined by `›` as the name. |
| `grid` | `enabled` shows or hides the grid lines. |
| `chartFill` | `type` sets how bars are filled: `"solid"`, `"pattern"`, or `"outline"`. |
| `separators` | Thousands and decimal separators in the number format. |
| `zoomInsight` | Lets users zoom and pan along the axis with the `viewBy` values. |
| `enableCompactSize` | Hides axis labels and names when the chart is too small for them. Has no effect when `zoomInsight` is on. |

## Limits

- A bar chart renders up to 6,000 data points, counted as the number of `viewBy` values times the number of series (measures or `stackBy` values), including empty combinations. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- A stacked bar chart renders up to 1,000 series: `stackBy` values, or measures stacked with `stackMeasures` or `stackMeasuresToPercent`. With more, the chart shows the same error.
- A measure shown in % (`computeRatio`) works only when it's the only measure. With two or more measures, the chart turns `computeRatio` off on all of them. See [Show a measure as a percentage](../../data-layer/execution/execution-model/#show-a-measure-as-a-percentage).

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { BarChart } from "@gooddata/sdk-ui-charts";

<BarChart
    measures={<measures>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { BarChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <BarChart
        measures={[Md.$TotalSales]}
        viewBy={Md.DateMonth.Short}
    />
</div>
```

## Props

{{% props %}}

---
legacy_path: references/visual_components/column_chart
title: Column chart
description: Display vertical bar comparisons with the ColumnChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:ColumnChart"
  - "@gooddata/sdk-ui-charts:IColumnChartProps"
source_files:
  - src/charts/columnChart/ColumnChart.tsx
props_interfaces:
  - IColumnChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IColumnChartBucketProps
related_pages:
  - /docs/visualisations/bar-chart
  - /docs/visualisations/combo-chart
  - /docs/visualisations/line-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 9
section: Visualisations
aliases:
  - "../references/visual_components/column_chart/"
---

A **column chart** shows data in vertical columns. Column charts can display one or multiple measures side by side, divided by either attribute values or by a single measure stacked by attribute values. Use it to compare values across categories or over time, for example, revenue by month.

{{< figure src="/gd-ui/column_chart.png" alt="Column chart of total sales by month" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | Yes | One or more measures | Sets the height of the columns, one column per measure. |
| `viewBy` | No | One or two attributes | Slices the measures by the attribute values along the X axis. With two attributes, the values of the second attribute are grouped under each value of the first. Extra attributes are ignored. |
| `stackBy` | No | One attribute | Splits each column into segments, one per attribute value. Works only with a single measure. |
| `filters` | No | Filters | Limits the data the column chart shows. |

## Sorting

`ColumnChart` applies no default sorting. To sort the data, pass sort items in the `sortBy` prop. To sort stacked columns by their totals, use an attribute area sort (`newAttributeAreaSort`) on the `viewBy` attribute. See [Sort items](../../data-layer/execution/execution-model/#sort-items).

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the columns: one per measure, or one per `stackBy` value. |
| `legend` | Whether the legend shows and where. |
| `dataLabels` | `visible` shows or hides the labels. `totalsVisible` shows or hides the totals of stacked columns. `style: "backplate"` adds a background behind the labels. |
| `stackMeasures`, `stackMeasuresToPercent` | `stackMeasures` stacks the measures into one column. `stackMeasuresToPercent` stacks the measures, or the `stackBy` segments, to 100% and overrides `stackMeasures`. |
| `xaxis`, `yaxis` | Visibility, labels, rotation, and name of the axes. `yaxis.min` and `yaxis.max` set the scale of the value axis. |
| `secondary_yaxis` | Shows the measures listed in `measures` (local identifiers) on a secondary axis on the right. Takes the same options as `yaxis`. |
| `enableJoinedAttributeAxisName` | With two `viewBy` attributes, their axis has no name by default. This option shows the attribute names joined by `›` as the name. |
| `grid` | `enabled` shows or hides the grid lines. |
| `chartFill` | `type` sets how columns are filled: `"solid"`, `"pattern"`, or `"outline"`. |
| `separators` | Thousands and decimal separators in the number format. |
| `zoomInsight` | Lets users zoom and pan along the axis with the `viewBy` values. |
| `enableCompactSize` | Hides axis labels and names when the chart is too small for them. Has no effect when `zoomInsight` is on. |

## Limits

- A column chart renders up to 6,000 data points, counted as the number of `viewBy` values times the number of series (measures or `stackBy` values), including empty combinations. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- A stacked column chart renders up to 1,000 series: `stackBy` values, or measures stacked with `stackMeasures` or `stackMeasuresToPercent`. With more, the chart shows the same error.
- A measure shown in % (`computeRatio`) works only when it's the only measure. With two or more measures, the chart turns `computeRatio` off on all of them. See [Show a measure as a percentage](../../data-layer/execution/execution-model/#show-a-measure-as-a-percentage).

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ColumnChart } from "@gooddata/sdk-ui-charts";

<ColumnChart
    measures={<measures>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ColumnChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <ColumnChart
        measures={[Md.$TotalSales]}
        viewBy={Md.DateMonth.Short}
    />
</div>
```

## Props

{{% props %}}

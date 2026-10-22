---
legacy_path: references/visual_components/pie_chart
title: Pie chart
description: Show proportions of a whole with the PieChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:PieChart"
  - "@gooddata/sdk-ui-charts:IPieChartProps"
source_files:
  - src/charts/pieChart/PieChart.tsx
props_interfaces:
  - IPieChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IPieChartBucketProps
related_pages:
  - /docs/visualisations/donut-chart
  - /docs/visualisations/treemap
  - /docs/visualisations/funnel-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 21
section: Visualisations
aliases:
  - "../references/visual_components/pie_chart/"
---

A **pie chart** shows data as proportional segments of a disc. Pie charts can be segmented by either multiple measures or an attribute. Use it to show how parts make up a whole, for example, the share of sales by product category.

{{< figure src="/gd-ui/pie_chart.png" alt="Pie chart of three franchise fee measures" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | Yes | One or more measures | Sets the size of the slices. With more than one measure, each measure is a slice. |
| `viewBy` | No | One attribute | Draws one slice per attribute value. Works only with a single measure. |
| `filters` | No | Filters | Limits the data the pie chart shows. |

## Sorting

By default, the pie chart sorts the slices by value in descending order. `PieChart` has a `sortBy` prop. For the slices to follow `sortBy`, also set `enableChartSorting: true` in `config`. Otherwise, the chart re-sorts them by value.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the slices: one per `viewBy` value, or one per measure without `viewBy`. |
| `legend` | Whether the legend shows and where. `position` defaults to `"top"`. The legend appears only with `viewBy` or more than one measure. |
| `dataLabels` | `visible` shows or hides the labels. `style: "backplate"` adds a background behind them. `position` places them `"inside"` or `"outside"` the slices; the default, `"auto"`, puts all labels outside when the smallest slice is 5% or less of the total, and inside otherwise. `position` needs `enableDonutDataLabels`. |
| `enableDonutDataLabels` | Turns on `dataLabels.position`. Without it, labels sit inside the slices. Despite its name, it applies to pie charts too. |
| `enableChartSorting` | Keeps the slice order that `sortBy` sets. See [Sorting](#sorting). |
| `enableCompactSize` | Hides overlapping data labels in small containers, and all data labels in very small ones. |
| `chartFill` | `type` sets how slices are filled: `"solid"`, `"pattern"`, or `"outline"`. |
| `separators` | Thousands and decimal separators in the number format. |

## Limits

- A pie chart can't show negative values. If the data contains any, the chart shows an error and `onError` receives a `NegativeValuesSdkError`.
- A pie chart renders up to 10,000 slices. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- `viewBy` works only with a single measure. With `viewBy` and more than one measure, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { PieChart } from "@gooddata/sdk-ui-charts";

<PieChart
    measures={<measures>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { PieChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <PieChart
        measures={[Md.$FranchiseFeesAdRoyalty, Md.$FranchiseFeesInitialFranchiseFee, Md.$FranchiseFeesOngoingRoyalty]}
    />
</div>
```

## Props

{{% props %}}

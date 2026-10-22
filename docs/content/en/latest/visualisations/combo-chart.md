---
legacy_path: references/visual_components/combo_chart
title: Combo chart
description: Combine bars and lines in a single visualization with the ComboChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:ComboChart"
  - "@gooddata/sdk-ui-charts:IComboChartProps"
source_files:
  - src/charts/comboChart/ComboChart.tsx
props_interfaces:
  - IComboChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IComboChartBucketProps
related_pages:
  - /docs/visualisations/column-chart
  - /docs/visualisations/line-chart
  - /docs/visualisations/area-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 10
section: Visualisations
aliases:
  - "../references/visual_components/combo_chart/"
---

A **combo chart** combines two types of visualizations, for example, a column chart and a line chart.

A combo chart can have one or two axes. If a combo chart has two axes, it is often referred to as a dual axis chart.

By default, a combo chart is displayed as a combination of a column chart and a line chart, with the secondary axis enabled (you can [disable it](#disable-the-secondary-axis)).

{{< figure src="/gd-ui/combochart.png" alt="Combo chart with columns for one franchise fee measure on the left axis and a line for another on the right axis, by location resort" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `primaryMeasures` | No | One or more measures | Drawn with the primary chart type. See [Customize the type of a combo chart](#customize-the-type-of-a-combo-chart). |
| `secondaryMeasures` | No | One or more measures | Drawn with the secondary chart type, on the secondary Y axis unless `dualAxis` is `false`. See [Disable the secondary axis](#disable-the-secondary-axis). |
| `viewBy` | No | One attribute | Slices the measures along the X axis. If you pass an array, the chart uses only the first attribute. |
| `filters` | No | Filters | Limits the data the combo chart shows. |

## Sorting

`ComboChart` applies no default sorting. To sort the data, pass sort items in the `sortBy` prop. See [Sort items](../../data-layer/execution/execution-model/#sort-items).

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the series, one per measure. |
| `chartFill` | `type` sets how columns and areas are filled: `"solid"`, `"pattern"`, or `"outline"`. Lines keep a solid color. |
| `legend` | Whether the legend shows and where. |
| `primaryChartType`, `secondaryChartType` | Chart type of the primary and secondary measures. See [Customize the type of a combo chart](#customize-the-type-of-a-combo-chart). |
| `dualAxis` | Whether the secondary measures get their own Y axis. See [Disable the secondary axis](#disable-the-secondary-axis). |
| `xaxis`, `yaxis`, `secondary_yaxis` | Axis visibility, labels, label rotation, and axis name. `min` and `max` set the range of a Y axis. `secondary_yaxis` applies to the Y axis of the secondary measures. Ignored when `dualAxis` is `false`. |
| `stackMeasures`, `stackMeasuresToPercent` | `stackMeasures: true` stacks the columns or areas of the measures on the primary Y axis. `stackMeasuresToPercent: true` stacks them to 100%. Lines don't stack. |
| `dataLabels` | `visible` shows or hides the labels. `style: "backplate"` adds a background behind them. |
| `dataPoints` | `visible` shows or hides the dots on lines and areas. |
| `grid` | `enabled` shows or hides the horizontal grid lines. |
| `continuousLine` | `enabled: true` connects lines and areas across missing values. Ignored when `stackMeasures` is `true`. |
| `lineShape` (beta) | How lines and the top of areas run between data points: `"linear"` (default), `"spline"` for a smooth curve, or `"stepped"` for steps. |
| `lineStyleMapping` (beta) | Dash style and width of the line and area series; columns ignore it. Each item has an `id` (the measure local identifier), `lineStyle` (`"solid"`, `"dashed"`, or `"dotted"`), and `lineWidth` (1–4 pixels, default 3). |
| `thresholdMeasures`, `thresholdExcludedMeasures` | `thresholdMeasures` takes the local identifier of one measure that isn't drawn but sets the style of the others: where its value is empty or `0`, line and area series are dashed and columns are hatched. The measures in `thresholdExcludedMeasures` keep their style. |
| `zoomInsight` | `true` lets you drag across the chart to zoom in on the X axis. Hold Shift while dragging to pan. |
| `separators` | Thousands and decimal separators in the number format. |

### Customize the type of a combo chart

A combo chart combines any two of the following chart types:
* Column chart
* Line chart
* Area chart

To change the chart type for primary measures, set the `config.primaryChartType` property.

To change the chart type for secondary measures, set the `config.secondaryChartType` property.

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ComboChart } from "@gooddata/sdk-ui-charts";

<ComboChart
    primaryMeasures={<primaryMeasures>}
    secondaryMeasures={<secondaryMeasures>}
    config={{
        primaryChartType: "column", // string
        secondaryChartType: "area" // string
    }}
    viewBy={<attribute>}
/>
```

### Disable the secondary axis

To disable the secondary axis, set the `config.dualAxis` property to `false`.

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ComboChart } from "@gooddata/sdk-ui-charts";

<ComboChart
    primaryMeasures={<primaryMeasures>}
    secondaryMeasures={<secondaryMeasures>}
    config={{
        dualAxis: false // boolean
    }}
    viewBy={<attribute>}
/>
```

## Limits

- A combo chart renders up to 10,000 measures and up to 10,000 `viewBy` values. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- If all measures are on the primary Y axis and any of them is a line, the chart doesn't stack to 100%, even with `stackMeasuresToPercent: true`.
- A measure shown as a percentage (`computeRatio`) stays a percentage only when it's the only measure in `primaryMeasures` or in `secondaryMeasures`. With `dualAxis: false`, it must be the only measure in the chart. Otherwise, the chart shows raw values. See [Show a measure as a percentage](../../data-layer/execution/execution-model/#show-a-measure-as-a-percentage).

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ComboChart } from "@gooddata/sdk-ui-charts";

<ComboChart
    primaryMeasures={<primaryMeasures>}
    secondaryMeasures={<secondaryMeasures>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ComboChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <ComboChart
        primaryMeasures={Md.$FranchiseFeesInitialFranchiseFee}
        secondaryMeasures={Md.$FranchiseFeesAdRoyalty}
        viewBy={Md.LocationResort}
    />
</div>
```

## Props

{{% props %}}

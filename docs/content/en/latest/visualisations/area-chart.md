---
legacy_path: references/visual_components/area_chart
title: Area chart
description: Display trends over time with filled areas using the AreaChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:AreaChart"
  - "@gooddata/sdk-ui-charts:IAreaChartProps"
source_files:
  - src/charts/areaChart/AreaChart.tsx
props_interfaces:
  - IAreaChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IAreaChartBucketProps
related_pages:
  - /docs/visualisations/line-chart
  - /docs/visualisations/column-chart
  - /docs/visualisations/combo-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 5
section: Visualisations
aliases:
  - "../references/visual_components/area_chart/"
---

An **area chart** shows data as an area under a line intersecting dots. It can display either multiple measures as different areas or a single measure split by one attribute into multiple areas with points intersecting attribute values. Use it to show how parts add up to a whole over time, for example, the market share of several companies in an industry.

Areas stack by default. Alternatively, the areas can overlap if `{ stackMeasures: false }` is set in the chart config.

{{< figure src="/gd-ui/area_chart.png" alt="Area chart with four franchise fee measures stacked by month" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | Yes | One or more measures | Draws one area per measure. |
| `viewBy` | No | One or two attributes | Slices the areas along the X axis. With two attributes, the second one splits the first measure into areas, as `stackBy` does, and the areas overlap instead of stacking. The chart then ignores the other measures and `stackBy`. Attributes after the second are ignored. |
| `stackBy` | No | One attribute | Splits the measure into one area per attribute value. Works only with a single measure and at most one `viewBy` attribute. |
| `filters` | No | Filters | Limits the data the area chart shows. |

## Sorting

`AreaChart` applies no default sorting. To sort the data, pass sort items in the `sortBy` prop. To sort the `viewBy` values by the total of the stacked areas, use an attribute area sort (`newAttributeAreaSort`) on the `viewBy` attribute. See [Sort items](../../data-layer/execution/execution-model/#sort-items).

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the areas, one per measure or per `stackBy` value. |
| `chartFill` | `type` sets how the areas are filled: `"solid"`, `"pattern"`, or `"outline"`. The line on top of each area keeps its solid color. |
| `legend` | Whether the legend shows and where. |
| `xaxis`, `yaxis` | Axis visibility, labels, label rotation, and axis name. `yaxis.min` and `yaxis.max` set the Y axis range. |
| `secondary_yaxis` | `measures` takes the local identifiers of the measures to show on a second Y axis on the right. The other options work as in `yaxis`. |
| `stackMeasuresToPercent` | `true` stacks the areas on the primary Y axis to 100%, so each area shows its share of the total. Takes precedence over `stackMeasures`. Ignored with two `viewBy` attributes. |
| `dataLabels` | `visible` shows or hides the labels. `style: "backplate"` adds a background behind them. |
| `dataPoints` | `visible` shows or hides the dot at each data point. |
| `grid` | `enabled` shows or hides the horizontal grid lines. |
| `continuousLine` | `enabled: true` connects the areas across missing values. The areas then overlap instead of stacking. Ignored when `stackMeasures` is `true`. |
| `lineShape` (beta) | How the top line of each area runs between data points: `"linear"` (default), `"spline"` for a smooth curve, or `"stepped"` for steps. |
| `lineStyleMapping` (beta) | Dash style and width of the top line of each area. Each item has an `id`, `lineStyle` (`"solid"`, `"dashed"`, or `"dotted"`), and `lineWidth` (1–4 pixels, default 3). The `id` is the measure local identifier, or the attribute element URI with `stackBy`. |
| `zoomInsight` | `true` lets you drag across the chart to zoom in on the X axis. Hold Shift while dragging to pan. |
| `separators` | Thousands and decimal separators in the number format. |

## Limits

- An area chart renders up to 10,000 areas and up to 10,000 `viewBy` values. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- A measure shown as a percentage (`computeRatio`) stays a percentage only when the chart uses a single measure. With more measures, the chart shows raw values. See [Show a measure as a percentage](../../data-layer/execution/execution-model/#show-a-measure-as-a-percentage).

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { AreaChart } from "@gooddata/sdk-ui-charts";

<AreaChart
    measures={<measures>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { AreaChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <AreaChart
        measures={[Md.$FranchiseFees]}
        viewBy={Md.DateMonth.Short}
    />
</div>
```

## Props

{{% props %}}

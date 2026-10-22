---
legacy_path: references/visual_components/line_chart
title: Line chart
description: Display data trends as connected points with the LineChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:LineChart"
  - "@gooddata/sdk-ui-charts:ILineChartProps"
source_files:
  - src/charts/lineChart/LineChart.tsx
props_interfaces:
  - ILineChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - ILineChartBucketProps
related_pages:
  - /docs/visualisations/area-chart
  - /docs/visualisations/combo-chart
  - /docs/visualisations/column-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 19
section: Visualisations
aliases:
  - "../references/visual_components/line_chart/"
---

A **line chart** shows data as line-connected dots. Line charts can display either multiple measures as individual lines or a single measure split by one attribute into multiple lines with points intersecting attribute values. Use it to show how a measure changes over time or across a series of stages, for example, the monthly sales of a product.

{{< figure src="/gd-ui/line_chart.png" alt="Line chart of four franchise fee measures by month" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | Yes | One or more measures | Draws one line per measure. |
| `trendBy` | No | One attribute | Slices the lines along the X axis, one point per attribute value. |
| `segmentBy` | No | One attribute | Splits the measure into one line per attribute value. Use it with a single measure, plus an optional threshold measure (see `thresholdMeasures`). |
| `filters` | No | Filters | Limits the data the line chart shows. |

## Sorting

`LineChart` applies no default sorting. To sort the data, pass sort items in the `sortBy` prop. See [Sort items](../../data-layer/execution/execution-model/#sort-items).

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the lines, one per measure or per `segmentBy` value. |
| `legend` | Whether the legend shows and where. The legend shows only with two or more lines or with `segmentBy`. |
| `xaxis`, `yaxis` | Axis visibility, labels, label rotation, and axis name. `yaxis.min` and `yaxis.max` set the Y axis range. |
| `secondary_yaxis` | `measures` takes the local identifiers of the measures to show on a second Y axis on the right. The other options work as in `yaxis`. |
| `dataLabels` | `visible` shows or hides the labels. `style: "backplate"` adds a background behind them. |
| `dataPoints` | `visible` shows or hides the dot at each data point. |
| `grid` | `enabled` shows or hides the horizontal grid lines. |
| `continuousLine` | `enabled: true` connects the line across missing values. |
| `lineShape` (beta) | How the line runs between data points: `"linear"` (default), `"spline"` for a smooth curve, or `"stepped"` for steps. |
| `lineStyleMapping` (beta) | Dash style and width per line. Each item has an `id`, `lineStyle` (`"solid"`, `"dashed"`, or `"dotted"`), and `lineWidth` (1–4 pixels, default 3). The `id` is the measure local identifier, or the attribute element URI with `segmentBy`. |
| `thresholdMeasures`, `thresholdExcludedMeasures` | `thresholdMeasures` takes the local identifier of one measure that isn't drawn but sets the line style: where its value is empty or `0`, the other lines are dashed. Lines of the measures in `thresholdExcludedMeasures` stay solid. With `segmentBy`, `thresholdExcludedMeasures` has no effect. |
| `enableCompactSize` | Hides axis labels and axis names in small containers. Has no effect with `zoomInsight`. |
| `zoomInsight` | `true` lets you drag across the chart to zoom in on the X axis. Hold Shift while dragging to pan. |
| `separators` | Thousands and decimal separators in the number format. |

## Forecast and anomalies

`LineChart` can ask GoodData to forecast the next values of a measure and to find anomalies in it. Both work on a
chart with one line: one measure, one date attribute in `trendBy`, and no `segmentBy`.

{{% alert color="warning" title="Beta" %}}
`forecastConfig`, `outliersConfig`, and the `anomalies` chart option are `@beta`. See
[API maturity](../../integrations/platform/api-maturity/).
{{% /alert %}}

| Prop | Takes | What it does |
| --- | --- | --- |
| `forecastConfig` | `forecastPeriod` (number of periods), `confidenceLevel` (between 0 and 1, for example `0.95`), `seasonal` | Continues the line with a dashed forecast and a shaded confidence band. |
| `outliersConfig` | `sensitivity` (`"low"`, `"medium"`, or `"high"`) | Highlights the points that GoodData detects as anomalies and adds an Anomalies legend item. |

The `anomalies` option in `config` styles those points: `color` (red by default) and `size` (`"small"`,
`"medium"`, or `"big"`).

```tsx
<LineChart
    measures={[Md.$FranchiseFees]}
    trendBy={Md.DateMonth.Short}
    forecastConfig={{ forecastPeriod: 3, confidenceLevel: 0.95, seasonal: false }}
    outliersConfig={{ sensitivity: "medium" }}
/>
```

GoodData Cloud calls these smart functions; see [Use Smart Functions](https://www.gooddata.ai/docs/cloud/create-visualizations/smart-functions/).

## Limits

- A line chart renders up to 10,000 lines and up to 10,000 `trendBy` values. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { LineChart } from "@gooddata/sdk-ui-charts";

<LineChart
    measures={<measures>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { LineChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <LineChart
        measures={[Md.$FranchiseFees]}
        trendBy={Md.DateMonth.Short}
    />
</div>
```

## Props

{{% props %}}

---
legacy_path: references/visual_components/bubble_chart
title: Bubble chart
description: Show three-dimensional data relationships using the BubbleChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:BubbleChart"
  - "@gooddata/sdk-ui-charts:IBubbleChartProps"
source_files:
  - src/charts/bubbleChart/BubbleChart.tsx
props_interfaces:
  - IBubbleChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IBubbleChartBucketProps
related_pages:
  - /docs/visualisations/scatter-plot
  - /docs/visualisations/heatmap
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 7
section: Visualisations
aliases:
  - "../references/visual_components/bubble_chart/"
---

A **bubble chart** shows data as bubbles using Cartesian coordinates.
Bubble charts typically have three measures, one for the X axis, one for the Y axis, and one that determines the size of each bubble.
The data is sliced by an attribute, with each bubble (an attribute item) noted with a different color.
Use a bubble chart to show relationships and patterns among data points, for example, cities positioned by their coordinates, with the bubble size showing each city's GDP.

{{< figure src="/gd-ui/bubble_chart.png" alt="Bubble chart of franchise fees against franchised sales, one bubble per location resort" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `xAxisMeasure` | No | One measure | Positions the bubbles on the X axis. |
| `yAxisMeasure` | No | One measure | Positions the bubbles on the Y axis. |
| `size` | No | One measure | Sets the size of the bubbles. Without it, the bubbles have a default size. |
| `viewBy` | No | One attribute | Creates one bubble per attribute value, each in its own color. |
| `filters` | No | Filters | Limits the data the bubble chart shows. |

## Sorting

`BubbleChart` applies no default sorting. You can pass `sortBy` to sort the data.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the bubbles. With `viewBy`, each bubble gets its own color. |
| `legend` | Whether the legend shows and where. The legend lists the `viewBy` values. |
| `dataLabels` | `visible` shows or hides the labels, which show the `size` value of each bubble. `style: "backplate"` adds a background behind them. |
| `xaxis`, `yaxis` | The X axis (`xAxisMeasure`) and the Y axis (`yAxisMeasure`). `visible`, `labelsEnabled`, `rotation`, and `name` set how the axis, its labels, and its name show. `min` and `max` set the axis range. `format: "inherit"` formats the axis labels with the measure format. |
| `grid` | `enabled` shows or hides the grid lines on both axes. |
| `zoomInsight` | `true` lets you zoom in along the X axis and pan while holding Shift. |
| `separators` | Thousands and decimal separators in the number format. |

## Limits

- A bubble chart renders up to 10,000 bubbles. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- A bubble with an empty value in any of its measures isn't drawn.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { BubbleChart } from "@gooddata/sdk-ui-charts";

<BubbleChart
    xAxisMeasure={<measure>}
    yAxisMeasure={<measure>}
    size={<measure>}
    viewBy={<attribute>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { BubbleChart } from "@gooddata/sdk-ui-charts";

import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <BubbleChart
        xAxisMeasure={Md.$FranchiseFees}
        yAxisMeasure={Md.$FranchisedSales}
        size={Md.$AvgDailyTotalSalesByServer}
        viewBy={Md.LocationResort}
    />
</div>
```

## Props

{{% props %}}

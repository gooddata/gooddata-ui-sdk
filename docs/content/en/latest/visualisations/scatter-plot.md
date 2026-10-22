---
legacy_path: references/visual_components/scatter_plot
title: Scatter plot
description: Show correlation between two measures with the ScatterPlot component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:ScatterPlot"
  - "@gooddata/sdk-ui-charts:IScatterPlotProps"
source_files:
  - src/charts/scatterPlot/ScatterPlot.tsx
props_interfaces:
  - IScatterPlotProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IScatterPlotBucketProps
related_pages:
  - /docs/visualisations/bubble-chart
  - /docs/visualisations/heatmap
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 27
section: Visualisations
aliases:
  - "../references/visual_components/scatter_plot/"
---

A **scatter plot** shows data as points using Cartesian coordinates. Scatter plots typically have a minimum of two measures, one for the X axis and the other for the Y axis, and one attribute, which determines the meaning of each data point.
Scatter plots are useful for analyzing trends between two measures, such as age and income, or for tracking the magnitude of two measures from the same chart.
Advanced configuration allows segmentation of the data by specified attribute and [clustering](#with-clustering).

{{< figure src="/gd-ui/scatter_plot.png" alt="Scatter plot of franchise fees against franchised sales" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `xAxisMeasure` | No | One measure | Positions the points on the X axis. |
| `yAxisMeasure` | No | One measure | Positions the points on the Y axis. |
| `attribute` | No | One attribute | Creates one point per attribute value. |
| `segmentBy` | No | One attribute | Splits the points into segments, each in its own color. |
| `filters` | No | Filters | Limits the data the scatter plot shows. |

## Sorting

`ScatterPlot` applies no default sorting. You can pass `sortBy` to sort the data.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the points. With `segmentBy`, each segment gets its own color. |
| `legend` | Whether the legend shows and where. With `segmentBy`, the legend lists the segments. |
| `dataLabels` | `visible` shows or hides the labels, which show the `attribute` value of each point. `style: "backplate"` adds a background behind them. |
| `xaxis`, `yaxis` | The X axis (`xAxisMeasure`) and the Y axis (`yAxisMeasure`). `visible`, `labelsEnabled`, `rotation`, and `name` set how the axis, its labels, and its name show. `min` and `max` set the axis range. `format: "inherit"` formats the axis labels with the measure format. |
| `grid` | `enabled` shows or hides the grid lines on both axes. |
| `zoomInsight` | `true` lets you zoom in along the X axis and pan while holding Shift. |
| `separators` | Thousands and decimal separators in the number format. |

## Limits

- With `segmentBy` set, a scatter plot renders up to 10,000 data points. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ScatterPlot } from "@gooddata/sdk-ui-charts";

<ScatterPlot
    xAxisMeasure={<measure>}
    yAxisMeasure={<measure>}
    attribute={<attribute>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ScatterPlot } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <ScatterPlot
        xAxisMeasure={Md.$FranchiseFees}
        yAxisMeasure={Md.$FranchisedSales}
        attribute={Md.DateMonth.Short}
    />
</div>;
```

### With clustering

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ScatterPlot } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <ScatterPlot
        xAxisMeasure={Md.$FranchiseFees}
        yAxisMeasure={Md.$FranchisedSales}
        attribute={Md.DateMonth.Short}
        config={{
            clustering: {
                enabled: true,
                numberOfClusters: 3,
                threshold: 0.03,
            },
        }}
    />
</div>;
```

## Props

{{% props %}}

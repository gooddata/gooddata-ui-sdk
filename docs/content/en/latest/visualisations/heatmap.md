---
legacy_path: references/visual_components/heatmap
title: Heatmap
description: Visualize data density across two dimensions with the Heatmap component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:Heatmap"
  - "@gooddata/sdk-ui-charts:IHeatmapProps"
source_files:
  - src/charts/heatmap/Heatmap.tsx
props_interfaces:
  - IHeatmapProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IHeatmapBucketProps
related_pages:
  - /docs/visualisations/pivot-table
  - /docs/visualisations/scatter-plot
  - /docs/visualisations/treemap
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 18
section: Visualisations
aliases:
  - "../references/visual_components/heatmap/"
---

A **heatmap** represents data as a matrix where individual values are represented as colors. Heatmaps can help you discover trends and understand complex datasets, for example, website traffic by page and time.

{{< figure src="/gd-ui/heatmap.png" alt="Heatmap of sales by menu category and location state, darker cells for higher values" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measure` | Yes | One measure | Sets the value, and so the color, of each cell. |
| `rows` | No | One attribute | Creates one row per attribute value. |
| `columns` | No | One attribute | Creates one column per attribute value. |
| `filters` | No | Filters | Limits the data the heatmap shows. |

## Sorting

Without `sortBy`, the heatmap sorts the data by the `rows` attribute in descending order. You can pass `sortBy` to sort the data differently.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Base color of the cells. The heatmap takes the first color, or the color that `colorMapping` assigns to the measure, splits the values into seven equal ranges, and gives each range a shade of that color. |
| `legend` | Whether the legend shows and where. The legend shows the value range of each shade. |
| `dataLabels` | `visible` shows or hides the cell values. `style: "backplate"` adds a background behind them. |
| `xaxis`, `yaxis` | The X axis (`columns`) and the Y axis (`rows`). `visible`, `labelsEnabled`, `rotation`, and `name` set how the axis, its labels, and its name show. |
| `zoomInsight` | `true` lets you zoom in along the X axis and pan while holding Shift. |
| `separators` | Thousands and decimal separators in the number format. |

The following example shows the `config` structure with sample values:

```ts
import type { IChartConfig } from "@gooddata/sdk-ui-charts";

const config: IChartConfig = {
    xaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto"
    },
    yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto"
    },
    legend: {
        enabled: true,
        position: "top"
    },
    dataLabels: {
        visible: "auto"
    },
    separators: {
        thousand: ",",
        decimal: "."
    }
};
```

## Limits

- A heatmap renders up to 10,000 cells. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- With 150 or more cells, the heatmap hides the data labels, even if `dataLabels.visible` is `true`.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Heatmap } from "@gooddata/sdk-ui-charts";

<Heatmap
    measure={<measure>}
    rows={<attribute>}
    columns={<attribute>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Heatmap } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

<div style={{ height: 300 }}>
    <Heatmap
        measure={Md.$TotalSales}
        rows={Md.LocationState}
        columns={Md.MenuCategory}
    />
</div>
```

## Props

{{% props %}}

---
legacy_path: references/visual_components/treemap
title: Treemap
description: Display hierarchical data as nested rectangles with the Treemap component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:Treemap"
  - "@gooddata/sdk-ui-charts:ITreemapProps"
source_files:
  - src/charts/treemap/Treemap.tsx
props_interfaces:
  - ITreemapProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - ITreemapBucketProps
related_pages:
  - /docs/visualisations/pie-chart
  - /docs/visualisations/mekko-chart
  - /docs/visualisations/heatmap
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 28
section: Visualisations
aliases:
  - "../references/visual_components/treemap/"
---

A **treemap** presents data hierarchically as nested rectangles. The size of each rectangle follows its measure value, so a treemap compares proportions within a hierarchy, for example, the share of product categories within each region.

{{< figure src="/gd-ui/treemap.png" alt="Treemap of a measure by location state and location city, with rectangle size proportional to the value" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | Yes | One or more measures | Sets the size of the rectangles. |
| `viewBy` | No | One attribute | Draws one rectangle per attribute value. Works only with a single measure. |
| `segmentBy` | No | One attribute | Splits each rectangle into a second level. The largest segment takes the parent's color, and each smaller segment a lighter shade of it. |
| `filters` | No | Filters | Limits the data the treemap shows. |

## Sorting

The treemap places the rectangles at each level by size, largest first. With both `viewBy` and `segmentBy` set, it requests the data sorted by the `viewBy` attribute in ascending order, then by the measures in descending order, so the legend lists the `viewBy` values in ascending order. `Treemap` has no `sortBy` prop.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the top-level rectangles. With `segmentBy`, the largest segment takes its parent's color and smaller segments lighter shades of it. |
| `legend` | Whether the legend shows and where. |
| `dataLabels` | `visible` shows or hides the labels. `style: "backplate"` adds a background behind them. |
| `chartFill` | `type` sets how rectangles are filled: `"solid"`, `"pattern"`, or `"outline"`. With `segmentBy` set, the segments stay solid. |
| `separators` | Thousands and decimal separators in the number format. |

## Limits

- A treemap can't show negative values. If the data contains any, the chart shows an error and `onError` receives a `NegativeValuesSdkError`.
- A treemap renders up to 10,000 data points. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Treemap } from "@gooddata/sdk-ui-charts";

<Treemap
    measures={<measures>}
    viewBy={<attribute>}
    segmentBy={<attribute>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Treemap } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <Treemap
        measures={[Md.NrChecks]}
        viewBy={Md.LocationState}
        segmentBy={Md.LocationCity}
    />
</div>
```

## Props

{{% props %}}

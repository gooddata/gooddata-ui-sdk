---
title: Radar chart
description: Compare measure values across categories on radial axes with the RadarChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:RadarChart"
  - "@gooddata/sdk-ui-charts:IRadarChartProps"
source_files:
  - src/charts/radarChart/RadarChart.tsx
props_interfaces:
  - IRadarChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IRadarChartBucketProps
related_pages:
  - /docs/visualisations/column-chart
  - /docs/visualisations/line-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 24
section: Visualisations
---

A **radar chart** (also known as a spider chart or web chart) displays measure values on radial axes that radiate from a common center point. Each value of the `trendBy` attribute becomes a spoke, and each measure — or each value of the `segmentBy` attribute — is drawn as a polygon connecting the points along those spokes. Use it to compare profiles across several categories, for example, scores across competencies.

{{% alert color="warning" title="Alpha API" %}}
`RadarChart` is `@alpha`: its shape is likely to change outside of the usual SemVer guarantees. See [API maturity](../../integrations/platform/api-maturity/) before you depend on it.
{{% /alert %}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | Yes | One or more measures | Draws one polygon per measure. |
| `trendBy` | No | One attribute | Creates one spoke per attribute value. |
| `segmentBy` | No | One attribute | Splits the measure into one polygon per attribute value. Use it with a single measure. |
| `filters` | No | Filters | Limits the data the radar chart shows. |

For code samples of both layouts, see [Usage patterns](#usage-patterns).

## Sorting

`RadarChart` applies no default sorting. To sort the data, pass sort items in the `sortBy` prop. See [Sort items](../../data-layer/execution/execution-model/#sort-items).

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the polygons, one per measure or per `segmentBy` value. |
| `chartFill` | `type` sets how the polygons are filled: `"solid"`, `"pattern"`, or `"outline"`. The polygon borders keep their solid color. |
| `legend` | Whether the legend shows and where. The legend shows only with two or more polygons. |
| `xaxis`, `yaxis` | `xaxis.labelsEnabled` shows or hides the `trendBy` value labels around the chart. `yaxis.labelsEnabled` shows or hides the labels of the value scale, and `yaxis.min` and `yaxis.max` set its range. |
| `grid` | `enabled` shows or hides the grid lines of the value scale. |
| `dataLabels` | `visible` shows or hides the labels. `style: "backplate"` adds a background behind them. |
| `dataPoints` | `visible` shows or hides the dot at each data point. |
| `continuousLine` | `enabled: true` connects the polygon across missing values. |
| `enableCompactSize` | Hides the spoke and scale labels in small containers. |
| `separators` | Thousands and decimal separators in the number format. |

## Limits

- A radar chart renders up to 10,000 polygons and up to 10,000 `trendBy` values. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- A radar chart doesn't show axis names, even with `xaxis.name.visible` or `yaxis.name.visible` set to `true`.
- Radar charts are easiest to read with a small number of spokes, typically three to eight. Too many `trendBy` values make the polygons hard to read.

## Usage patterns

### Multiple measures

When you specify two or more measures, the radar chart draws one polygon per measure, all sharing the same spokes:

```tsx
<RadarChart
    measures={[Md.$Revenue, Md.$Costs]}
    trendBy={Md.Quarter}
/>
```

### Single measure segmented by attribute

When you specify a single measure together with `segmentBy`, the radar chart draws one polygon per value of the `segmentBy` attribute instead:

```tsx
<RadarChart
    measures={[Md.$Revenue]}
    trendBy={Md.Quarter}
    segmentBy={Md.Region}
/>
```

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { RadarChart } from "@gooddata/sdk-ui-charts";

<RadarChart
    measures={<measures>}
    trendBy={<attribute>}
    segmentBy={<attribute>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { RadarChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <RadarChart
        measures={[Md.$NrOfOpportunities, Md.$NrOfWonOpportunities]}
        trendBy={Md.Region}
    />
</div>
```

## Props

{{% props %}}

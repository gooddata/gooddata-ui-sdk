---
legacy_path: references/visual_components/bullet_chart
title: Bullet chart
description: Compare measures against targets using the BulletChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:BulletChart"
  - "@gooddata/sdk-ui-charts:IBulletChartProps"
source_files:
  - src/charts/bulletChart/BulletChart.tsx
props_interfaces:
  - IBulletChartProps
  - IBulletChartBucketProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
related_pages:
  - /docs/visualisations/bar-chart
  - /docs/visualisations/headline
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 8
section: Visualisations
aliases:
  - "../references/visual_components/bullet_chart/"
---

A **bullet chart** is a variation of a bar chart that displays performance of a measure (primary measure) and its progress towards a goal (target measure). Optionally, the primary measure can also be compared to another measure (comparative measure). Use it to track results against a goal, for example, actual sales against the sales target.

{{< figure src="/gd-ui/bullet_chart.png" alt="Bullet chart with a primary measure bar, a target marker, and a comparative gray bar for each location resort" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `primaryMeasure` | Yes | One measure | Draws the primary bar. |
| `targetMeasure` | No | One measure | Draws the target value as a thick line to reach. Empty target values aren't drawn. |
| `comparativeMeasure` | No | One measure | Draws a secondary bar to compare the primary measure against. |
| `viewBy` | No | One or two attributes | Draws one bullet per attribute value along the Y axis. With two attributes, the values of the second attribute are grouped under each value of the first. Extra attributes are ignored. |
| `filters` | No | Filters | Limits the data the bullet chart shows. |

## Sorting

`BulletChart` applies no default sorting. To sort the data, pass sort items in the `sortBy` prop. See [Sort items](../../data-layer/execution/execution-model/#sort-items).

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the measures. See [Colors](#colors). |
| `legend` | Whether the legend shows and where. |
| `xaxis`, `yaxis` | Visibility, labels, rotation, and name of the axes. `xaxis` is the horizontal value axis, where `min` and `max` set the scale. `yaxis` is the vertical axis with the `viewBy` values. |
| `enableJoinedAttributeAxisName` | With two `viewBy` attributes, their axis has no name by default. This option shows the attribute names joined by `›` as the name. |
| `grid` | `enabled` shows or hides the grid lines. |
| `chartFill` | `type` sets how bars are filled: `"solid"`, `"pattern"`, or `"outline"`. |
| `separators` | Thousands and decimal separators in the number format. |
| `zoomInsight` | Lets users zoom and pan along the axis with the `viewBy` values. |
| `enableCompactSize` | Hides axis labels and names when the chart is too small for them. Has no effect when `zoomInsight` is on. |

### Colors

To appropriately visualize the displayed data, bullet charts use colors provided by a color array or a palette in the [config](../../visualisations/chart-config/#configure-colors) in the following way:
* For the **primary** measure, the first color from the color array/palette is used.
* For the **target** measure, a darker shade of the first color is used.
* For the **comparative** measure, gray is used.

To override the default coloring scheme and set a custom color for each measure, use [color mapping](../../visualisations/chart-config/#color-mapping).

## Limits

- A bullet chart renders up to 10,000 bullets. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- `BulletChart` doesn't show measures in % (`computeRatio`). It turns `computeRatio` off on all three measures.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { BulletChart } from "@gooddata/sdk-ui-charts";

<BulletChart
    primaryMeasure={<primaryMeasure>}
    targetMeasure={<targetMeasure>}
    comparativeMeasure={<comparativeMeasure>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { BulletChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <BulletChart
        primaryMeasure={Md.$FranchiseFeesAdRoyalty}
        targetMeasure={Md.$FranchiseFees}
        comparativeMeasure={Md.$FranchiseFeesOngoingRoyalty}
        viewBy={Md.LocationResort}
    />
</div>
```

## Props

{{% props %}}

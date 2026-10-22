---
legacy_path: references/visual_components/funnel_chart
title: Funnel chart
description: Display sequential stages of a process with the FunnelChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:FunnelChart"
  - "@gooddata/sdk-ui-charts:IFunnelChartProps"
source_files:
  - src/charts/funnelChart/FunnelChart.tsx
props_interfaces:
  - IFunnelChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IFunnelChartBucketProps
related_pages:
  - /docs/visualisations/pyramid-chart
  - /docs/visualisations/waterfall-chart
  - /docs/visualisations/donut-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 13
section: Visualisations
aliases:
  - "../references/visual_components/funnel_chart/"
---

A **funnel chart** shows data as parts of a funnel. Funnel charts can be segmented by either multiple measures or a single attribute.
A funnel chart displays values as progressively decreasing proportions.

{{< figure src="/gd-ui/funnel_chart.png" alt="Funnel chart of three franchise fee measures, each stage labeled with its value and percentage of the first" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | Yes | One or more measures | Sets the size of the segments. With more than one measure, each measure is a segment. |
| `viewBy` | No | One attribute | Draws one segment per attribute value. Works only with a single measure. |
| `filters` | No | Filters | Limits the data the funnel chart shows. |

## Sorting

By default, the funnel chart sorts the segments by value in descending order, so the largest value sits in the broadest part of the funnel. `FunnelChart` has a `sortBy` prop. For the segments to follow `sortBy`, also set `enableChartSorting: true` in `config`. Otherwise, the chart re-sorts them by value.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the segments: one per `viewBy` value, or one per measure without `viewBy`. |
| `legend` | Whether the legend shows and where. `position` defaults to `"right"`. The legend appears only with `viewBy` or more than one measure. |
| `dataLabels` | `visible` shows or hides the labels. `style: "backplate"` adds a background behind them. By default, each label shows the value and its percentage of the first segment's value; `percentsVisible: false` hides the percentage. |
| `enableChartSorting` | Keeps the segment order that `sortBy` sets. See [Sorting](#sorting). |
| `chartFill` | `type` sets how segments are filled: `"solid"`, `"pattern"`, or `"outline"`. |
| `separators` | Thousands and decimal separators in the number format. |

## Limits

- A funnel chart can't show negative values. If the data contains any, the chart shows an error and `onError` receives a `NegativeValuesSdkError`.
- A funnel chart renders up to 10,000 segments. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- `viewBy` works only with a single measure. With `viewBy` and more than one measure, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`.
- The funnel chart leaves out empty values and leading zero values.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { FunnelChart } from "@gooddata/sdk-ui-charts";

<FunnelChart
    measures={<measures>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { FunnelChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <FunnelChart
        measures={[Md.$FranchiseFeesAdRoyalty, Md.$FranchiseFeesInitialFranchiseFee, Md.$FranchiseFeesOngoingRoyalty]}
    />
</div>
```

## Props

{{% props %}}

---
legacy_path: references/visual_components/pyramid_chart
title: Pyramid chart
description: Show hierarchical data as stacked layers with the PyramidChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:PyramidChart"
  - "@gooddata/sdk-ui-charts:IPyramidChartProps"
source_files:
  - src/charts/pyramidChart/PyramidChart.tsx
props_interfaces:
  - IPyramidChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IPyramidChartBucketProps
related_pages:
  - /docs/visualisations/funnel-chart
  - /docs/visualisations/bar-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 23
section: Visualisations
aliases:
  - "../references/visual_components/pyramid_chart/"
---

A **pyramid chart** displays values as proportional segments in a triangular shape, showing hierarchical structures and relative proportions. Pyramid charts are typically used for displaying demographic data, market segmentation, organizational structures, or workflows.

{{< figure src="/gd-ui/pyramid_chart.png" alt="Pyramid chart with one layer per franchise fee measure" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | Yes | One or more measures | Sets the size of the segments. With more than one measure, each measure is a segment. |
| `viewBy` | No | One attribute | Draws one segment per attribute value. Works only with a single measure. |
| `filters` | No | Filters | Limits the data the pyramid chart shows. |

For code samples of both setups, see [Usage patterns](#usage-patterns).

## Sorting

With `viewBy` set, the pyramid chart sorts the segments by value in descending order. With several measures and no `viewBy`, the segments keep the order of `measures`. `PyramidChart` has a `sortBy` prop. For the segments to follow `sortBy` when `viewBy` is set, also set `enableChartSorting: true` in `config`. Otherwise, the chart re-sorts them by value.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the segments: one per `viewBy` value, or one per measure without `viewBy`. |
| `legend` | Whether the legend shows and where. `position` defaults to `"right"`. The legend appears only with `viewBy` or more than one measure. |
| `dataLabels` | `visible` shows or hides the labels. `style: "backplate"` adds a background behind them. |
| `enableChartSorting` | With `viewBy` set, keeps the segment order that `sortBy` sets. See [Sorting](#sorting). |
| `chartFill` | `type` sets how segments are filled: `"solid"`, `"pattern"`, or `"outline"`. |
| `separators` | Thousands and decimal separators in the number format. |

The following example shows the `config` structure with sample values for pyramid charts:

```ts
import type { IChartConfig } from "@gooddata/sdk-ui-charts";

const config: IChartConfig = {
    colors: ["rgb(195, 49, 73)", "rgb(168, 194, 86)"],
    colorPalette: [{
        guid: "01",
        fill: {
            r: 195,
            g: 49,
            b: 73
        }
    }, {
        guid: "02",
        fill: {
            r: 168,
            g: 194,
            b: 86
        }
    }],
    colorMapping: [{
        predicate: (headerItem) => {
            return headerItem.measureHeaderItem && (headerItem.measureHeaderItem.localIdentifier === "m1_localIdentifier")
        },
        color: {
            type: "guid",
            value: "02"
        }
    }],
    legend: {
        enabled: true,
        position: "top",
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

- A pyramid chart can't show negative values. If the data contains any, the chart shows an error and `onError` receives a `NegativeValuesSdkError`.
- A pyramid chart renders up to 10,000 segments. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.
- `viewBy` works only with a single measure. With `viewBy` and more than one measure, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`.
- Pyramid charts are easiest to read with a small number of segments, typically three to ten.

## Usage patterns

### Single measure with a viewBy attribute

When using a single measure with a viewBy attribute, each attribute value creates a segment in the pyramid:

```tsx
<PyramidChart
    measures={[Md.$Revenue]}
    viewBy={Md.Region}
/>
```

### Multiple measures

When using multiple measures, each measure creates a segment in the pyramid. The viewBy attribute cannot be used in this case:

```tsx
<PyramidChart
    measures={[Md.$Revenue, Md.$Profit, Md.$Costs]}
/>
```

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { PyramidChart } from "@gooddata/sdk-ui-charts";

<PyramidChart
    measures={<measures>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { PyramidChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <PyramidChart
        measures={[Md.$TotalSales]}
        viewBy={Md.Product.Name}
    />
</div>
```

## Props

{{% props %}}

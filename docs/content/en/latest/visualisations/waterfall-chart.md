---
legacy_path: references/visual_components/waterfall_chart
title: Waterfall chart
description: Show cumulative contributions to a total with the WaterfallChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:WaterfallChart"
  - "@gooddata/sdk-ui-charts:IWaterfallChartProps"
source_files:
  - src/charts/waterfallChart/WaterfallChart.tsx
props_interfaces:
  - IWaterfallChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IWaterfallChartBucketProps
related_pages:
  - /docs/visualisations/column-chart
  - /docs/visualisations/funnel-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 29
section: Visualisations
aliases:
  - "../references/visual_components/waterfall_chart/"
---

A **waterfall chart** shows the cumulative impact of sequentially introduced positive or negative values. Use it for financial data such as profit and loss statements or budget analysis, or wherever you want to show how a starting value changes step by step.

{{< figure src="/gd-ui/waterfall_chart.png" alt="Waterfall chart where revenue items add up and cost items subtract, ending with a total column" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measures` | Yes | One or more measures | With one measure, each `viewBy` value is a column. With more measures, each measure is a column. |
| `viewBy` | No | One attribute | Splits a single measure into one column per attribute value. Not used with multiple measures. |
| `filters` | No | Filters | Limits the data the chart shows. |

## Sorting

To sort the data, pass sort items in the `sortBy` prop. See [Sort items](../../data-layer/execution/execution-model/#sort-items).

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../chart-config/) for the shared options. The following example shows the `config` structure with sample values for waterfall charts:

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
        // waterfall colors are assigned to the "total", "positive", and "negative" bars,
        // not to measures; the available ids are "properties.color.total",
        // "properties.color.positive", and "properties.color.negative"
        predicate: (headerItem) => {
            return headerItem.colorHeaderItem && (headerItem.colorHeaderItem.id === "properties.color.negative")
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
    total: {
        enabled: true, // default; set to false to hide the computed total column
        name: "Total", // custom title of the computed total column
        measures: ["measure_localIdentifier"] // render these measures as total columns instead
    },
    separators: {
        thousand: ",",
        decimal: "."
    }
};
```

### Total columns

The `total` option controls the total columns:

```ts
const config: IChartConfig = {
    total: {
        enabled: true,
        name: "Total",
        measures: ["revenue_total", "profit_total"]
    }
};
```

- `total.enabled` (default `true`) appends a computed total column that sums all the other columns. Set it to `false` to hide it.
- `total.name` sets the title of the computed total column. The default is the localized "Total".
- `total.measures` lists the local identifiers of measures that should be rendered as total columns (bars that start from zero) rather than as increments. This only makes sense with multiple measures. When `total.measures` is not empty, the computed total column is not added.

## Usage patterns

A waterfall chart reads best with a small number of columns (typically 3 to 15) that represent sequential changes from a starting value to a final value.

### Single measure with a viewBy attribute

When using a single measure with a `viewBy` attribute, each attribute value creates a column showing the incremental change. The chart appends a computed total column; use `total.enabled` and `total.name` to hide or rename it:

```tsx
<WaterfallChart
    measures={[Md.$MonthlyRevenue]}
    viewBy={Md.Month}
    config={{
        total: {
            name: "Yearly total"
        }
    }}
/>
```

### Multiple measures

When using multiple measures, each measure creates a column in the waterfall. The `viewBy` attribute cannot be used in this case. `total.measures` takes the measures' local identifiers, so read them with `measureLocalId`:

```tsx
import { measureLocalId } from "@gooddata/sdk-model";

<WaterfallChart
    measures={[Md.$StartingBalance, Md.$Income, Md.$Expenses, Md.$EndingBalance]}
    config={{
        total: {
            measures: [measureLocalId(Md.$EndingBalance)]
        }
    }}
/>
```

### With total columns

You can mark specific measures as totals so that they render as total columns instead of increments:

```tsx
import { newMeasure } from "@gooddata/sdk-model";

// Define a total measure with an explicit local identifier
const totalRevenue = newMeasure("total_revenue", (m) => m.title("Total Revenue").localId("total_revenue"));

<WaterfallChart
    measures={[Md.$Q1Revenue, Md.$Q2Revenue, Md.$Q3Revenue, Md.$Q4Revenue, totalRevenue]}
    config={{
        total: {
            measures: ["total_revenue"]
        }
    }}
/>
```

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { WaterfallChart } from "@gooddata/sdk-ui-charts";

<WaterfallChart
    measures={<measures>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { WaterfallChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };

<div style={style}>
    <WaterfallChart
        measures={[Md.$Revenue]}
        viewBy={Md.Quarter}
    />
</div>
```

## Props

{{% props %}}

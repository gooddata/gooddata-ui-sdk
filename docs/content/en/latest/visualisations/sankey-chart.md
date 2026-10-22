---
legacy_path: references/visual_components/sankey_chart
title: Sankey chart
description: Visualize flow quantities between nodes with the SankeyChart component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:SankeyChart"
  - "@gooddata/sdk-ui-charts:ISankeyChartProps"
source_files:
  - src/charts/sankeyChart/SankeyChart.tsx
props_interfaces:
  - ISankeyChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - ISankeyChartBucketProps
related_pages:
  - /docs/visualisations/dependency-wheel
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 26
section: Visualisations
aliases:
  - "../references/visual_components/sankey_chart/"
---

A **Sankey chart** is a type of flow diagram, in which the width of the link between two nodes is shown proportionally to the flow quantity. Use it to show how a quantity flows from sources to targets, for example, how the sales of each product category split across regions.

{{< figure src="/gd-ui/sankey_chart.png" alt="Sankey chart of flows from menu categories to location states" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measure` | Yes | One measure | Sets the width of the links. |
| `attributeFrom` | No | One attribute | Sets the source nodes of the links, one node per value. |
| `attributeTo` | No | One attribute | Sets the target nodes of the links. A value that also appears in `attributeFrom` shares its node. |
| `filters` | No | Filters | Limits the data the Sankey chart shows. |

## Sorting

The Sankey chart applies no default sorting. `SankeyChart` accepts a `sortBy` prop but doesn't add it to the execution, so the prop has no effect.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the nodes, one per value of `attributeFrom` and `attributeTo`. |
| `legend` | Whether the legend shows and where. The legend is hidden unless you set `enabled: true`, and it lists the nodes. `position` defaults to `"right"`. |
| `dataLabels` | `visible` shows or hides the node labels. `style: "backplate"` adds a background behind them. |
| `separators` | Thousands and decimal separators in the tooltip values. |

## Limits

- A Sankey chart can't show negative values. If the data contains any, the chart shows an error and `onError` receives a `NegativeValuesSdkError`.
- A Sankey chart renders up to 10,000 nodes and 10,000 links. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { SankeyChart } from "@gooddata/sdk-ui-charts";

<SankeyChart
    measure={<measure>}
    attributeFrom={<attribute>}
    attributeTo={<attribute>}
    config={<chart-config>}
    …
/>
```

## Example

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { SankeyChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };
const config = {
    separators: { decimal: ".", thousand: "," },
    legend: { position: "auto", enabled: true },
    dataLabels: { visible: "auto" },
};

<div style={style}>
    <SankeyChart
        measure={Md.TotalSales}
        attributeFrom={Md.MenuCategory}
        attributeTo={Md.LocationState}
        config={config}
    />
</div>
```

## Props

{{% props %}}

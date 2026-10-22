---
legacy_path: references/visual_components/dependency_wheel_chart
title: Dependency wheel chart
description: Visualize flows and relationships between categories with the DependencyWheel component.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:DependencyWheelChart"
  - "@gooddata/sdk-ui-charts:IDependencyWheelChartProps"
source_files:
  - src/charts/dependencyWheelChart/DependencyWheelChart.tsx
props_interfaces:
  - IDependencyWheelChartProps
  - IBucketChartProps
  - ICommonChartProps
  - IVisualizationProps
  - IChartCallbacks
  - IVisualizationCallbacks
  - IDependencyWheelChartBucketProps
related_pages:
  - /docs/visualisations/sankey-chart
  - /docs/visualisations/chart-config
  - /docs/visualisations/charts-and-plots
type: docs
weight: 11
section: Visualisations
aliases:
  - "../references/visual_components/dependency_wheel_chart/"
---

A **dependency wheel chart** is a type of flow diagram, where nodes are laid out in a circle, and links are drawn between them. The width of the link and size of the nodes are proportional to the flow quantity or weight of each link. Use it to show the relationships among entities, for example, the dependencies between tasks in a project.

{{< figure src="/gd-ui/dependency_wheel_chart.png" alt="Dependency wheel chart with chords connecting menu categories to location states" >}}

## Buckets

| Prop | Required | Takes | What it does |
| --- | --- | --- | --- |
| `measure` | Yes | One measure | Sets the width of the links. |
| `attributeFrom` | No | One attribute | Sets the source nodes of the links, one node per value. |
| `attributeTo` | No | One attribute | Sets the target nodes of the links. A value that also appears in `attributeFrom` shares its node. |
| `filters` | No | Filters | Limits the data the dependency wheel shows. |

## Sorting

The dependency wheel applies no default sorting. `DependencyWheelChart` accepts a `sortBy` prop but doesn't add it to the execution, so the prop has no effect.

## Configuration

Pass these options in the `config` prop. See [Chart configuration](../../visualisations/chart-config/) for details.

| Option | What it changes |
| --- | --- |
| `colors`, `colorPalette`, `colorMapping` | Colors of the nodes, one per value of `attributeFrom` and `attributeTo`. |
| `legend` | Whether the legend shows and where. The legend is hidden unless you set `enabled: true`, and it lists the nodes. `position` defaults to `"right"`. |
| `dataLabels` | `visible` shows or hides the node labels. |
| `separators` | Thousands and decimal separators in the tooltip values. |

## Limits

- A dependency wheel can't show negative values. If the data contains any, the chart shows an error and `onError` receives a `NegativeValuesSdkError`.
- A dependency wheel renders up to 10,000 nodes and 10,000 links. With more, the chart shows an error and `onError` receives a `DataTooLargeToDisplaySdkError`. Filter the data to fit.

## Structure

```tsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { DependencyWheelChart } from "@gooddata/sdk-ui-charts";

<DependencyWheelChart
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
import { DependencyWheelChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./catalog.js";

const style = { height: 300 };
const config = {
    separators: { decimal: ".", thousand: "," },
    legend: { position: "auto", enabled: true },
    dataLabels: { visible: false },
};

<div style={style}>
    <DependencyWheelChart
        measure={Md.TotalSales}
        attributeFrom={Md.MenuCategory}
        attributeTo={Md.LocationState}
        config={config}
    />
</div>
```

## Props

{{% props %}}

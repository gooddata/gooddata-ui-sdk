---
legacy_path: references/visual_components/chart_config
title: Chart configuration
description: Configure chart appearance, axes, legends, colors, and data labels.
category: Visualisations
diataxis_type: reference
api_symbols:
  - "@gooddata/sdk-ui-charts:IChartConfig"
  - "@gooddata/sdk-ui-ext:InsightView"
source_files:
  - src/interfaces/chartConfig.ts
props_interfaces:
  - IChartConfig
related_pages:
  - /docs/visualisations/charts-and-plots
  - /docs/integrations/embedding/apply-theming
  - /docs/visualisations/insightview
  - /docs/integrations/interactivity/on-legend-ready
type: docs
weight: 3
section: Visualisations
aliases:
  - "../references/visual_components/chart_config/"
---

Pass these options to a chart component, or to `InsightView`, in the `config` prop. Its type is `IChartConfig`.

## Structure

```ts
import type { IChartConfig } from "@gooddata/sdk-ui-charts";

const config: IChartConfig = {
    chart: {
        verticalAlign: "top" // "top" | "middle" | "bottom"
    },
    colors: ["rgb(195, 49, 73)", "rgb(168, 194, 86)"], // array of strings
    xaxis: {
        visible: true, // boolean
        labelsEnabled: true, // boolean
        rotation: "auto", // "auto" or numeral string
        min: "10", // numeral string
        max: "20" // numeral string
    },
    yaxis: {
        visible: true, // boolean
        labelsEnabled: true, // boolean
        rotation: "auto", // string
        min: "30", // numeral string
        max: "40", // numeral string
        format: "auto" // "auto" | "inherit"
    },
    secondary_yaxis: {
        visible: true, // boolean
        labelsEnabled: true, // boolean
        rotation: "auto", // string
        min: "300", // numeral string
        max: "400", // numeral string
        format: "inherit", // "auto" | "inherit"
        measures: ["measureLocalIdentifier"]
    },
    legend: {
        enabled: true, // boolean
        position: "bottom", // "top" | "left" | "right" | "bottom"
        responsive: "autoPositionWithPopup" // "autoPositionWithPopup" | true | false
    },
    dataLabels: {
        visible: "auto", // "auto" | true | false
        percentsVisible: false // true | false, applies for funnel chart only
    },
    dataPoints: {
        visible: true // "auto" | true | false
    },
    grid: {
        enabled: true // boolean
    },
    separators: {
        thousand: ",",
        decimal: "."
    },
    stackMeasures: true, // boolean
    stackMeasuresToPercent: true, // boolean
    primaryChartType: "column", // string
    secondaryChartType: "area", // string
    dualAxis: false, // boolean
    tooltip: {
        enabled: true, // boolean
        zIndex: 3005 // number
    },
    enableCompactSize: true, // boolean
    forceDisableDrillOnAxes: false, // boolean
    enableJoinedAttributeAxisName: false // boolean
};
```

`primaryChartType`, `secondaryChartType`, and `dualAxis` are available only for [combo charts](../combo-chart/).

## Custom sorting

To use the `sortBy` prop in a chart, for example `PieChart`, set `config.enableChartSorting` to `true`.

## Align a chart vertically

You can configure a vertical alignment for [pie charts](../pie-chart/) and [donut charts](../donut-chart/).

To align a chart vertically, set `config.chart.verticalAlign` to one of the possible values: `top`, `middle`, or `bottom`. If not set, it defaults to `middle`.

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with a custom chart alignment
<InsightView
    insight="<visualization-id>"
    config={{
        chart: {
            verticalAlign: "bottom"
        }
    }}
/>
```

## Configure colors

To configure colors, use the following options:
* [Color array (the `colors` property)](#color-array)
* [Custom color palette (the `colorPalette` property)](#custom-color-palette)
* [Color mapping (the `colorMapping` property)](#color-mapping)

If you have more than one option configured for a visualization, the following rules apply:
* The `colors` property overrides a custom color palette uploaded through the API.
* The `colorPalette` property overrides the `colors` property and the custom color palette uploaded through the API.
* The `colorMapping` property overrides the `colorPalette` property, the `colors` property, and the custom color palette uploaded through the API.

### Color array

The following are examples of a color array:

```ts
const rgbColors = ["rgb(195, 49, 73)", "rgb(168, 194, 86)"];
const hexColors = ["#fa0510", "#AA2030"];
```

If there are fewer colors than data points, then the colors are repeated. For example, here is how colors will be used for two colors and three data points:

```ts
["rgb(195, 49, 73)", "rgb(168, 194, 86)", "rgb(195, 49, 73)"];
```

To change colors in a chart, provide a `config` for each component where you want to change colors, or create a wrapper component with a `config` baked in.

Heatmaps use only the first color as the base color and generate the other shades themselves.

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with custom colors and palette options
<InsightView
    insight="<visualization-id>"
    config={{
        colors: ["rgb(195, 49, 73)", "rgb(168, 194, 86)"]
    }}
/>
```

Within one visualization:
* The `colors` property overrides a custom color palette uploaded through the API.
* The `colors` property can be overridden by the [`colorPalette` property](#custom-color-palette) or the [`colorMapping` property](#color-mapping).

### Custom color palette

If you [created a custom color palette](https://www.gooddata.ai/docs/cloud/customize-appearance/create-custom-color-palettes/) for your workspace, the visualizations use this palette instead of the default colors.

To override the uploaded custom color palette for a specific visualization, define the `colorPalette` property for this visualization.

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with a custom palette
<InsightView
   insight="<visualization-id>"
   colorPalette={[
       {
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
       }, {
           guid: "03",
           fill: {
               r: 243,
               g: 217,
               b: 177
           }
       }
   ]}
/>
```

Within one visualization:
* The `colorPalette` property overrides the custom color palette uploaded through the API and the `colors` property.
* The `colorPalette` property can be overridden by the `colorMapping` property.

### Color mapping

Color mapping allows you to assign colors to individual measures or attribute elements. To set up color mapping, set the `colorMapping` property.

The `colorMapping` property contains an array of objects. Each object is represented by a pair of a mapping predicate and a color (color GUID or color value).

* A **mapping predicate** is a function that takes a result header as the first argument and returns a Boolean value indicating whether the color will be assigned to a particular measure or attribute element.
* A **color** is an object that contains two keys, `type` and `value`.
    * To assign a color from a color palette (either the custom color palette uploaded through the API or the palette defined by the `colorPalette` property), set `type` to `guid`, and set `value` to the GUID of the color from the palette.
    * To assign a custom color, set `type` to `rgb`, and set `value` to an object containing the keys `r`, `g`, and `b` with numerical values.

The following example shows how to assign the color with GUID `02` to the measure with the local identifier `m1_localIdentifier`, and the black color to the measure with the local identifier `m2_localIdentifier`:

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with custom color mapping
<InsightView
    insight="<visualization-id>"
    config={{
        colorMapping: [{
            predicate: (headerItem) => {
                return headerItem.measureHeaderItem && (headerItem.measureHeaderItem.localIdentifier === "m1_localIdentifier")
            },
            color: {
                type: "guid",
                value: "02"
            }
        }, {
            predicate: (headerItem) => {
                return headerItem.measureHeaderItem && (headerItem.measureHeaderItem.localIdentifier === "m2_localIdentifier")
            },
            color: {
                type: "rgb",
                value: {
                    r: 0,
                    g: 0,
                    b: 0
                }
            }
        }]
    }}
/>
```

Within one visualization, the `colorMapping` property overrides the `colorPalette` property (while still can use its colors), the `colors` property, and the custom color palette uploaded through the API.

## Change legend properties

* To change the legend position, set the `config.legend.position` property to one of the possible values: `"left"`, `"right"`, `"top"`, or `"bottom"`.
* To make the legend responsive, set `config.legend.responsive` to `true`.
* To make the legend appear as a popup in too small containers, set `config.legend.responsive` to `"autoPositionWithPopup"`.

    The popup legend works best together with [compact size](#enable-a-compact-size).

    {{< figure src="/gd-ui/top_legend.png" alt="Stacked column chart with a collapsed legend at the top and the full legend opened in a popup" >}}

    When `config.legend.responsive` is `"autoPositionWithPopup"`, small containers can ignore `config.legend.position` and place the legend automatically.
* To hide the legend, set `config.legend.enabled` to `false`.

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with a custom legend position and responsive legend
<InsightView
    insight="<visualization-id>"
    config={{
        legend: {
            enabled: true,
            position: "bottom", // "left", "right", "top"
            responsive: "autoPositionWithPopup", // true, false
        }
    }}
/>
```

## Change a separator in the number format

* To change the thousands separator, adjust the `config.separators.thousand` property.
* To change the decimal separator, adjust the `config.separators.decimal` property.

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with a custom separator in the number format
<InsightView
    insight="<visualization-id>"
    config={{
        separators: {
            thousand: ",",
            decimal: "."
        }
    }}
/>
```

## Configure axes

The properties listed in this section are specific to the **X** axis. To get the properties for the **Y** axis, replace `xaxis` with `yaxis` in a property's name.

* To hide the axis, set `config.xaxis.visible` to `false`. If not set, it defaults to `true` (the axis is visible).
* To hide axis labels, set `config.xaxis.labelsEnabled` to `false`. If not set, it defaults to `true` (the axis labels are visible).

    When `config.xaxis.visible` is `false`, the axis labels are hidden regardless of `config.xaxis.labelsEnabled`.
* To rotate axis labels, set `config.xaxis.rotation` to a desired value.
* To set the axis scale, set `config.xaxis.min` and `config.xaxis.max` to desired values.
* To show measures on a secondary axis, set `config.secondary_xaxis.measures` to the measures that you want to display. If `config.secondary_xaxis.measures` is not set, all measures are displayed on the main axis by default.
* To hide the axis name, set `config.xaxis.name.visible` to `false`. If not set, it defaults to `true` (the axis name is visible).
* To set the axis name position, set `config.xaxis.name.position` to one of the possible values: `low`, `middle`, `high`.

    If an axis represents more than one attribute or measure, the `config.xaxis.name.visible` and `config.xaxis.name.position` properties are both ignored, and the axis name is hidden. However, you can override this behavior for an axis that represents two attributes (see [Display the name for an axis with two attributes](#display-the-name-for-an-axis-with-two-attributes)). You cannot override this behavior for an axis that represents two measures.

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with settings for the X axis
<InsightView
    insight="<visualization-id>"
    config={{
        xaxis: {
            visible: false,
            labelsEnabled: false,
            rotation: "-90",
            min: "150",
            max: "440",
            name: {
                position: "low", // "low", "middle", "high"
            }
        },
        secondary_xaxis: {
            visible: true,
            labelsEnabled: true,
            rotation: "-90",
            min: "1500",
            max: "4400",
            name: {
                visible: false
            },
            measures: ["measureLocalIdentifier1", "measureLocalIdentifier2"]
        }
    }}
/>
```

### Disable drilling on axis labels

To disable drilling on the labels of both axes, set `config.forceDisableDrillOnAxes` to `true`.

### Display the name for an axis with two attributes

In [column charts](../column-chart/), [bullet charts](../bullet-chart/), and [bar charts](../bar-chart/), if an axis represents two attributes, the axis name is hidden by default. To make the axis name visible, set `config.enableJoinedAttributeAxisName` to `true`. The axis name is generated as the attribute names joined by `›` (for example, `Year › Quarter/Year`).

{{< figure src="/gd-ui/axis_two_attributes.png" alt="Column chart with year and quarter on the X axis and the joined axis name Year › Quarter/Year" >}}

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with the name visible for an axis with two attributes
<InsightView
    insight="<visualization-id>"
    config={{
        enableJoinedAttributeAxisName: true
    }}
/>
```

## Configure canvases

* To configure data labels, set the `config.dataLabels` property.
* To hide data points from a chart, set `config.dataPoints.visible` to `false`. This applies to the following types of charts:
    * [Line charts](../line-chart/)
    * [Area charts](../area-chart/)
    * [Combo charts](../combo-chart/) with at least one of the combined charts being a [line chart](../line-chart/) or an [area chart](../area-chart/).

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with settings for the canvas
<InsightView
    insight="<visualization-id>"
    config={{
        dataLabels: {
            visible: true
        },
        dataPoints: {
            visible: false
        },
        grid: {
            enabled: false
        }
    }}
/>
```

## Configure stacking

* You can configure stacking for the following types of charts:
    * [Area charts](../area-chart/)
    * [Bar charts](../bar-chart/)
    * [Column charts](../column-chart/)
    * [Combo charts](../combo-chart/)

         In combo charts using column or area charts, stacking is applied only to the measures shown on the left axis.
    * Charts with the [secondary axis](#configure-axes)
* To display the total contribution of each measure, set `config.stackMeasures` to `true`.
    * For area charts, `config.stackMeasures` is set to `true` by default.
    * For bar charts, column charts, and charts with the secondary axis, `config.stackMeasures` is ignored when the chart has only one measure.
* To display the percentage contribution of each measure, set `config.stackMeasuresToPercent` to `true`.
    * If both `config.stackMeasuresToPercent` and `config.stackMeasures` are present, `config.stackMeasuresToPercent` overwrites `config.stackMeasures`.
    * For charts with the secondary axis, `config.stackMeasuresToPercent` is applied only to the left axis.

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with stacking
<InsightView
    insight="<visualization-id>"
    config={{
        stackMeasures: false,
        stackMeasuresToPercent: true
    }}
/>
```

## Configure tooltip visibility

To hide a tooltip, set `config.tooltip.enabled` to `false`.

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with hidden tooltips
<InsightView
    insight="<visualization-id>"
    config={{
        tooltip: {
            enabled: false
        }
    }}
/>
```

## Configure tooltip stacking

Chart tooltips are attached to the end of the page `body`, outside the chart element. By default, a tooltip uses
`z-index` 3005. A chart rendered inside a GoodData.UI overlay or dialog places its tooltip above that overlay on its
own.

If your application shows the chart inside its own layer with a higher `z-index`, set `config.tooltip.zIndex` to a
value above that layer. This value takes precedence over both the default and the automatic value.

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

<InsightView
    insight="<visualization-id>"
    config={{
        tooltip: {
            zIndex: 10001
        }
    }}
/>
```

## Enable a compact size

To allow the charts to be rendered in small containers by hiding less important parts, set `config.enableCompactSize` to `true`.

```tsx
import "@gooddata/sdk-ui-ext/styles/css/main.css";
import { InsightView } from "@gooddata/sdk-ui-ext";

// Example of embedding a visualization with the enabled compact size
<InsightView
    insight="<visualization-id>"
    config={{
        enableCompactSize: true
    }}
/>
```

Compact size works best together with a [popup legend](#change-legend-properties).

### Minimum height

The following table shows the minimum height (in pixels) for each chart type:

| Visualization                          | Min height (px) |
| :------------------------------------- | :-------------- |
| Area chart                             | 334px           |
| Bar chart                              | 134px           |
| Bubble chart                           | 334px           |
| Bullet chart                           | 134px           |
| Column chart                           | 134px           |
| Combo chart                            | 334px           |
| Donut chart                            | 134px           |
| Geo pushpin chart                      | 334px           |
| Headline (primary measure)             | 34px            |
| Headline (primary + secondary measure) | 94px            |
| Heatmap                                | 334px           |
| Line chart                             | 134px           |
| Pie chart                              | 134px           |
| Pivot table                            | 134px           |
| Scatter plot                           | 334px           |
| Treemap                                | 334px           |

### Chart responsiveness

Small charts with a compact size disabled take on a small area and cannot identify the items properly.

{{< figure src="/gd-ui/chart_responsive_off.png" alt="Small stacked column chart with compact size disabled, where the legend takes most of the space" >}}

Once `config.enableCompactSize` is set to `true`, the axis labels are hidden, and the chart becomes more readable.

{{< figure src="/gd-ui/chart_responsive_on.png" alt="The same small stacked column chart with compact size enabled, showing only the chart and axes" >}}

A headline chart with `config.enableCompactSize` set to `true` adjusts its content responsively to fit small containers. Otherwise, it may not be able to fit small containers.

{{< figure src="/gd-ui/headline_compactSize.png" alt="Headline in a small container with compact size enabled, next to the same headline with compact size disabled" >}}

### Responsive legend

For configuring a responsive legend, see [Change legend properties](#change-legend-properties).

## Props

{{% props %}}

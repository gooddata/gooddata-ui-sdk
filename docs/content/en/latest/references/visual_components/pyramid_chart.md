---
title: Pyramid Chart
sidebar_label: Pyramid Chart
copyright: (C) 2007-2023 GoodData Corporation
id: pyramid_chart_component
---

A **pyramid chart** displays values as proportional segments in a triangular shape, perfect for showing hierarchical structures and relative proportions. Pyramid charts are typically used for displaying demographic data, market segmentation, organizational structures, or workflows.

{{< embedded-image alt="Pyramid Chart" src="/gd-ui/pyramid_chart.png" >}}

## Structure

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { PyramidChart } from "@gooddata/sdk-ui-charts";

<PyramidChart
    measures={<measures>}
    config={<chart-config>}
    …
/>
```

## Example

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { PyramidChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./md/full";

const style = { height: 300 };

<div style={style}>
    <PyramidChart
        measures={[Md.$TotalSales]}
        viewBy={Md.Product.Name}
    />
</div>
```

## Properties

| Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| measures | true | IMeasure[] | An array of measure definitions. If you specify single measure, then you can also specify the viewBy attribute. If you specify multiple measures, then those measure values will be charted into a pyramid. |
| viewBy | false | IAttribute | The attribute definition that will be used to slice the single measure into multiple pieces that will be charted into a pyramid. |
| filters | false | IFilter[] | An array of filter definitions |
| sortBy | false | ISortItem[] | An array of sort definitions |
| config | false | IChartConfig | The chart configuration object |
| backend | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace | false | string | The workspace ID |
| locale | false | string | The localization of the chart. Defaults to `en-US`. |
| drillableItems | false | IDrillableItem[] | An array of points and attribute values to be drillable |
| ErrorComponent | false | Component | A component to be rendered if this component is in error state  |
| LoadingComponent | false | Component | A component to be rendered if this component is in loading state  |
| onError | false | Function | A callback when the component updates its error state |
| onExportReady | false | Function | A callback when the component is ready for exporting its data |
| onLoadingChanged | false | Function | A callback when the component updates its loading state |
| onDrill | false | Function | A callback when a drill is triggered on the component |

## Configuration

The following example shows the supported `config` structure with sample values for pyramid charts.

```javascript
{
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
}
```

## Usage Patterns

### Single Measure with ViewBy Attribute

When using a single measure with a viewBy attribute, each attribute value creates a segment in the pyramid:

```jsx
<PyramidChart
    measures={[Md.$Revenue]}
    viewBy={Md.Region}
/>
```

### Multiple Measures

When using multiple measures, each measure creates a segment in the pyramid. The viewBy attribute cannot be used in this case:

```jsx
<PyramidChart
    measures={[Md.$Revenue, Md.$Profit, Md.$Costs]}
/>
```

## Limits

Pyramid charts work best with a reasonable number of segments (typically 3-10) to maintain readability and visual impact. 
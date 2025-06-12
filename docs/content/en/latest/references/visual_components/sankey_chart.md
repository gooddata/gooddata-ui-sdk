---
title: Sankey Chart
copyright: (C) 2007-2023 GoodData Corporation
id: sankey_chart_component
---

A **Sankey chart** is a type of flow diagram, in which the width of the link between two nodes is shown proportionally to the flow quantity.


![Sankey Chart Component](gd-ui/sankey_chart.png "Sankey Chart Component")

## Structure

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { SankeyChart } from "@gooddata/sdk-ui-charts";

<SankeyChart
    measures={<measures>}
    attributeFrom={<attribute>}
    attributeTo={<attribute>}
    config={<chart-config>}
    …
/>
```

## Example

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { SankeyChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./md/full";

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

## Properties

| Name             | Required? | Type | Description |
|:-----------------| :--- | :--- | :--- |
| measure          | true | IMeasure | The measure definition |
| attributeFrom    | false | IAttribute | The attribute definition |
| attributeTo      | false | IAttribute | The attribute definition |
| filters          | false | IFilter[] | An array of filter definitions |
| config           | false | IChartConfig | The chart configuration object |
| backend          | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace        | false | string | The workspace ID |
| locale           | false | string | The localization of the chart. Defaults to `en-US`. For other languages, see the full list of available localizations. |
| drillableItems   | false | IDrillableItem[]  | An array of points and attribute values to be drillable |
| ErrorComponent   | false | Component | A component to be rendered if this component is in error state  |
| LoadingComponent | false | Component | A component to be rendered if this component is in loading state |
| onError          | false | Function | A callback when the component updates its error state |
| onExportReady    | false | Function | A callback when the component is ready for exporting its data |
| onLoadingChanged | false | Function | A callback when the component updates its loading state |
| onDrill          | false | Function | A callback when a drill is triggered on the component |

The following example shows the supported `config` structure with sample values. For the descriptions of the individual options, see [ChartConfig](../chart_config/).

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
            return headerItem.attributeHeaderItem && (headerItem.attributeHeaderItem.uri === "Coffee")
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
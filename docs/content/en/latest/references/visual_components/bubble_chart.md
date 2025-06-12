---
title: Bubble Chart
sidebar_label: Bubble Chart
copyright: (C) 2007-2018 GoodData Corporation
id: bubble_chart_component
---

A **bubble chart** shows data as bubbles using Cartesian coordinates.
Bubble charts typically have three measures, one for the X-axis, one for the Y-axis, and one that determines the size of each bubble.
The data is sliced by an attribute, with each bubble (an attribute item) noted with a different color.

{{< embedded-image alt="Bubble Chart" src="/gd-ui/bubble_chart.png" >}}
## Structure

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { BubbleChart } from "@gooddata/sdk-ui-charts";

<BubbleChart
    xAxisMeasure={<measure>}
    yAxisMeasure={<measure>}
    size={<measure>}
    viewBy={<attribute>}
    config={<chart-config>}
    …
/>
```

## Example

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { BubbleChart } from "@gooddata/sdk-ui-charts";

import * as Md from "./md/full";

const style = { height: 300 };

<div style={style}>
    <BubbleChart
        xAxisMeasure={Md.$FranchiseFees}
        yAxisMeasure={Md.$FranchisedSales}
        size={Md.$AvgDailyTotalSalesByServer}
        viewBy={Md.LocationResort}
    />
</div>
```

## Properties

| Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| xAxisMeasure | false | IMeasure | The measure definition (at least one of `xAxisMeasure` or `yAxisMeasure` must be provided for the bubble chart to render properly) |
| yAxisMeasure | false | IMeasure | The measure definition (at least one of `xAxisMeasure` or `yAxisMeasure` must be provided for the bubble chart to render properly) |
| size | false | IMeasure | The measure definition that determines the size of the bubbles |
| viewBy | false | IAttribute | The attribute definition |
| filters | false | IFilter[] | An array of filter definitions |
| sortBy | false | ISortItem[] | An array of sort definitions |
| config | false | IChartConfig | The chart configuration object |
| backend | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace | false | string | The workspace ID |
| locale | false | string | The localization of the chart. Defaults to `en-US`.  |
| drillableItems | false | IDrillableItem[] | An array of points and attribute values to be drillable |
| ErrorComponent | false | Component | A component to be rendered if this component is in error state |
| LoadingComponent | false | Component | A component to be rendered if this component is in loading state |
| onError | false | Function | A callback when the component updates its error state |
| onExportReady | false | Function | A callback when the component is ready for exporting its data |
| onLoadingChanged | false | Function | A callback when the component updates its loading state |
| onDrill | false | Function | A callback when a drill is triggered on the component |


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
            return headerItem.measureHeaderItem && (headerItem.measureHeaderItem.localIdentifier === "m1_localIdentifier")
        },
        color: {
            type: "guid",
            value: "02"
        }
    }],
    xaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto",
        min: "20",
        max: "30"
    },
    yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto",
        min: "20",
        max: "30"
    },
    legend: {
        enabled: true,
        position: "right",
    },
    dataLabels: {
        visible: "auto"
    },
    grid: {
        enabled: true
    }
    separators: {
        thousand: ",",
        decimal: "."
    }
}
```

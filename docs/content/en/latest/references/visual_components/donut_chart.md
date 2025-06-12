---
title: Donut Chart
sidebar_label: Donut Chart
copyright: (C) 2007-2018 GoodData Corporation
id: donut_chart_component
---

A **donut chart** shows data as proportional segments of a disc and has a hollowed out center. Donut charts can be segmented by either multiple measures or an attribute, and allow viewers to visualize component parts of a whole.

{{< embedded-image alt="Donut Chart" src="/gd-ui/donut_chart.png" >}}

## Structure

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { DonutChart } from "@gooddata/sdk-ui-charts";

<DonutChart
    measures={<measures>}
    config={<chart-config>}
    …
/>
```

## Example

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { DonutChart } from "@gooddata/sdk-ui-charts";

const style = { height: 300 };

<div style={style}>
    <DonutChart
        measures={[
            Md.$FranchiseFeesAdRoyalty,
            Md.$FranchiseFeesInitialFranchiseFee,
            Md.$FranchiseFeesOngoingRoyalty
        ]}
    />
</div>
```

## Properties

| Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| measures | true | IMeasure[] | An array of measure definitions |
| viewBy | false | IAttribute | The attribute definition |
| filters | false | IFilter[] | An array of filter definitions |
| sortBy | false | ISortItem[] | An array of sort definitions |
| config | false | IChartConfig | The chart configuration object |
| backend | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace | false | string | The workspace ID |
| locale | false | string | The localization of the chart. Defaults to `en-US`.|
| drillableItems | false | IDrillableItem[] | An array of points and attribute values to be drillable |
| ErrorComponent | false | Component | A component to be rendered if this component is in error state  |
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

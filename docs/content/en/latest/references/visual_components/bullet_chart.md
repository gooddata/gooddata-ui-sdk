---
title: Bullet Chart
sidebar_label: Bullet Chart
copyright: (C) 2020 GoodData Corporation
id: bullet_chart_component
---

A **bullet chart** is a variation of a bar chart that displays performance of a measure (primary measure) and its progress towards a goal (target measure). Optionally, the primary measure can also be compared to another measure (comparative measure).

{{< embedded-image alt="Bullet Chart" src="/gd-ui/bullet_chart.png" >}}

## Structure

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { BulletChart } from "@gooddata/sdk-ui-charts";

<BulletChart
    primaryMeasure={<primaryMeasure>}
    targetMeasure={<targetMeasure>}
    comparativeMeasure={<comparativeMeasure>}
    config={<chart-config>}
    …
/>
```

## Example

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { BulletChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./md/full";

const style = { height: 300 };

<div style={style}>
    <BulletChart
        primaryMeasure={Md.$FranchiseFeesAdRoyalty}
        targetMeasure={Md.$FranchiseFees}
        comparativeMeasure={Md.$FranchiseFeesOngoingRoyalty}
        viewBy={Md.LocationResort}
    />
</div>
```

## Colors

To appropriately visualize the displayed data, bullet charts use colors provided by a color array or a palette in the [config](../chart_config/#configure-colors) in the following way:
* For the **primary** measure, the first color from the color array/palette is used.
* For the **target** measure, a darker shade of the first color is used.
* For the **comparative** measure, gray is used.

To override the default coloring scheme and set a custom color for each measure, use [color mapping](../chart_config/#color-mapping).

## Properties

| Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| primaryMeasure | false | IMeasure | The measure displayed as the primary measure |
| targetMeasure | false | IMeasure | The measure displayed as the target measure |
| comparativeMeasure | false | IMeasure | The measure displayed as the comparative measure |
| viewBy | false | IAttribute &#124; Attribute[] | The attribute definition or an array of two attribute definitions. If set to a two-attribute array, the first attribute wraps up the second one. |
| filters | false | IFilter[] | An array of filter definitions |
| sortBy | false | ISortItem[] | An array of sort definitions |
| config | false | IChartConfig | The chart configuration object |
| backend | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace | false | string | The workspace ID |
| locale | false | string | The localization of the chart. Defaults to `en-US`.  |
| drillableItems | false | IDrillableItem[] | An array of points and attribute values to be drillable |
| ErrorComponent | false | Component | A component to be rendered if this component is in error state |
| LoadingComponent | false | Component | A component to be rendered if this component is in loading state  |
| onError | false | Function | A callback when the component updates its error state |
| onExportReady | false | Function | A callback when the component is ready for exporting its data |
| onLoadingChanged | false | Function | A callback when the component updates its loading state |
| onDrill | false | Function | A callback when a drill is triggered on the component |


The following example shows the supported `config` structure with sample values. For the descriptions of the individual options, see [Chart Config](../chart_config/).

```javascript
{
    colors: ["rgb(195, 49, 73)"],
    colorPalette: [{
        guid: "01",
        fill: {
            r: 195,
            g: 49,
            b: 73
        }
    }],
    colorMapping: [{
        predicate: (headerItem) => {
            return headerItem.measureHeaderItem && (headerItem.measureHeaderItem.localIdentifier === "m1_localIdentifier")
        },
        color: {
            type: "guid",
            value: "01"
        }
    }],
    xaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto"
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
        position: "top",
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

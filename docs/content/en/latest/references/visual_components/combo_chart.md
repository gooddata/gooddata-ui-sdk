---
title: Combo Chart
sidebar_label: Combo Chart
copyright: (C) 2019 GoodData Corporation
id: combo_chart_component
---

A **combo chart** combines two types of visualizations, for example, a column chart and a line chart.

A combo chart can have one or two axes. If a combo chart has two axes, it is often referred to as a dual axis chart.

By default, a combo chart is displayed as a combination of a column chart and a line chart, with the secondary axis enabled (you can [disable it](#disable-the-secondary-axis)).

{{< embedded-image alt="Combo Chart" src="/gd-ui/combochart.png" >}}

## Structure

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ComboChart } from "@gooddata/sdk-ui-charts";

<ComboChart
    primaryMeasures={<primaryMeasures>}
    secondaryMeasures={<secondaryMeasures>}
    config={<chart-config>}
    …
/>
```

## Example

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ComboChart } from "@gooddata/sdk-ui-charts";
import * as Md from "./md/full";

const style = { height: 300 };

<div style={style}>
    <ComboChart
        primaryMeasures={Md.$FranchiseFeesInitialFranchiseFee}
        secondaryMeasures={Md.$FranchiseFeesAdRoyalty}
        viewBy={Md.LocationResort}
    />
</div>
```

## Customize the type of a combo chart

A combo chart combines any two of the following chart types:
* Column chart
* Line chart
* Area chart

To change the chart type for primary measures, set the `config.primaryChartType` property.

To change the chart type for secondary measures, set the `config.secondaryChartType` property.

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ComboChart } from "@gooddata/sdk-ui-charts";

<ComboChart
    primaryMeasures={<primaryMeasures>}
    secondaryMeasures={<secondaryMeasures>}
    config={{
        primaryChartType: "column", // string
        secondaryChartType: "area" // string
    }}
    viewBy={<attribute>}
/>
```

## Disable the secondary axis

To disable the secondary axis, set the `config.dualAxis` property to `false`.

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { ComboChart } from "@gooddata/sdk-ui-charts";

<ComboChart
    primaryMeasures={<primaryMeasures>}
    secondaryMeasures={<secondaryMeasures>}
    config={{
        dualAxis: false // boolean
    }}
    viewBy={<attribute>}
/>
```

## Properties

| Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| primaryMeasures | false | IMeasure[] | An array of primary measure definitions |
| secondaryMeasures | false | IMeasure[] | An array of secondary measure definitions |
| viewBy | false | IAttribute &#124; Attribute[] | The attribute definition or an array of two attribute definitions. If set to a two-attribute array, the first attribute wraps up the second one. |
| filters | false | IFilter[] | An array of filter definitions |
| sortBy | false | ISortItem[] | An array of sort definitions |
| config | false | IChartConfig | The chart configuration object |
| backend | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace | false | string | The workspace ID |
| locale | false | string | The localization of the chart. Defaults to `en-US`.  |
| drillableItems | false | IDrillableItem[] | An array of points and attribute values to be drillable |
| ErrorComponent | false | Component | A component to be rendered if this component is in error state  |
| LoadingComponent | false | Component | A component to be rendered if this component is in loading state |
| onError | false | Function | A callback when the component updates its error state |
| onExportReady | false | Function | A callback when the component is ready for exporting its data |
| onLoadingChanged | false | Function | A callback when the component updates its loading state |
| onDrill | false | Function | A callback when a drill is triggered on the component |


The following example shows the supported `config` structure with sample values. For the descriptions of the individual options, see [Chart Config](../chart_config/).

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

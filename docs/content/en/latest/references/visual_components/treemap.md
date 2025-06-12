---
title: Treemap
sidebar_label: Treemap
copyright: (C) 2007-2018 GoodData Corporation
id: treemap_component
---
A **treemap** presents data hierarchically as nested rectangles. Treemaps are useful for comparing proportions within the hierarchy.

{{< embedded-image alt="Treemap" src="/gd-ui/treemap.png" >}}

## Structure

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Treemap } from "@gooddata/sdk-ui-charts";

<Treemap
    measures={<measures>}
    viewBy={<attribute>}
    segmentBy={<attribute>}
    config={<chart-config>}
    …
/>
```

## Example

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Treemap } from "@gooddata/sdk-ui-charts";
import * as Md from "./md/full";

const style = { height: 300 };

<div style={style}>
    <Treemap
        measures={[Md.NrChecks]}
        viewBy={Md.LocationState}
        segmentBy={Md.LocationCity}
        onLoadingChanged={this.onLoadingChanged}
        onError={this.onError}
    />
</div>
```

## Properties

| Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| measures | true | Measure[] | An array of measure definitions|
| viewBy | false | Attribute | The attribute definition |
| segmentBy | false | Attribute | The attribute definition |
| filters | false | Filter[] | An array of filter definitions |
| config | false | ChartConfig | The chart configuration object |
| backend | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace | false | string | The workspace ID |
| locale | false | string | The localization of the chart. Defaults to `en-US`. |
| drillableItems | false | DrillableItem[]  | An array of points and attribute values to be drillable |
| ErrorComponent | false | Component | A component to be rendered if this component is in error state  |
| LoadingComponent | false | Component | A component to be rendered if this component is in loading state  |
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
        position: "right",
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

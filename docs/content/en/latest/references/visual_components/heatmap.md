---
title: Heatmap
sidebar_label: Heatmap
copyright: (C) 2007-2018 GoodData Corporation
id: heatmap_component
---
A **heatmap** represents data as a matrix where individual values are represented as colors. Heatmaps can help you discover trends and understand complex datasets.

{{< embedded-image alt="Heatmap" src="/gd-ui/heatmap.png" >}}

## Structure

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Heatmap } from "@gooddata/sdk-ui-charts";

<Heatmap
    measure={<measure>}
    rows={<attribute>}
    columns={<attribute>}
    config={<chart-config>}
    …
/>
```
The following example shows the supported `config` structure with sample values. For the descriptions of the individual options, see [ChartConfig](../chart_config/).

```javascript
{
    xaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto"
    },
    yaxis: {
        visible: true,
        labelsEnabled: true,
        rotation: "auto"
    },
    legend: {
        enabled: true,
        position: "top"
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

## Example

```jsx
import "@gooddata/sdk-ui-charts/styles/css/main.css";
import { Heatmap } from "@gooddata/sdk-ui-charts";

import * as Md from "./md/full";

<div style={{ height: 300 }} className="s-heat-map">
    <Heatmap
        measure={Md.$TotalSales}
        rows={Md.LocationState}
        columns={Md.MenuCategory}
        onLoadingChanged={this.onLoadingChanged}
        onError={this.onError}
    />
</div>
```

## Properties

| Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| measure | true | IMeasure | The measure definition |
| rows | false | IAttribute | The attribute definition |
| columns | false | IAttribute | The attribute definition |
| filters | false | IFilter[] | An array of filter definitions |
| config | false | IChartConfig | The chart configuration object |
| backend | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace | false | string | The workspace ID |
| locale | false | string | The localization of the chart. Defaults to `en-US`. |
| drillableItems | false | IDrillableItem[]  | An array of points and attribute values to be drillable |
| ErrorComponent | false | Component | A component to be rendered if this component is in error state  |
| LoadingComponent | false | Component | A component to be rendered if this component is in loading state  |
| onError | false | Function | A callback when the component updates its error state |
| onExportReady | false | Function | A callback when the component is ready for exporting its data |
| onLoadingChanged | false | Function | A callback when the component updates its loading state |
| onDrill | false | Function | A callback when a drill is triggered on the component |

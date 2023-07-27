---
title: Headline
sidebar_label: Headline
copyright: (C) 2007-2018 GoodData Corporation
id: headline_component
---

A **headline** shows a single number or compares two numbers.

Headlines have two sections: Measure (primary) and Measure (secondary). You can add one item to each section. If you add two items, the headline also displays the change in percent.

{{< embedded-image alt="Headline" src="/gd-ui/headline.png" >}}

## Structure

```jsx
import { Headline } from "@gooddata/sdk-ui-charts";

<Headline
    primaryMeasure={<measure>}
/>
```

## Example

### Headline with a single measure (primary measure)

```jsx
import { Headline } from "@gooddata/sdk-ui-charts";
import * as Md from "./md/full";

<Headline
    primaryMeasure={Md.$FranchiseFees}
/>
```

### Headline with two measures (primary and secondary measures)

```jsx
import { Headline } from "@gooddata/sdk-ui-charts";
import * as Md from "./md/full";

<Headline
    primaryMeasure={Md.$FranchiseFees}
    secondaryMeasure={Md.$FranchiseFeesAdRoyalty}
/>
```

## Properties

| Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| primaryMeasure | true | IMeasure | The definition of the primary measure |
| secondaryMeasure | false | IMeasure | The definition of the secondary measure |
| filters | false | IFilter[] | An array of filter definitions |
| backend | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace | false | string | The workspace ID |
| locale | false | string | The localization of the chart. Defaults to `en-US`.  |
| drillableItems | false | IDrillableItem[] | An array of points and attribute values to be drillable |
| ErrorComponent | false | Component | A component to be rendered if this component is in error state  |
| LoadingComponent | false | Component | A component to be rendered if this component is in loading state  |
| onError | false | Function | A callback when the component updates its error state |
| onExportReady | false | Function | A callback when the component is ready for exporting its data |
| onLoadingChanged | false | Function | A callback when the component updates its loading state |
| onDrill | false | Function | A callback when a drill is triggered on the component |



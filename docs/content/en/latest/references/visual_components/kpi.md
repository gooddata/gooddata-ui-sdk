---
title: KPI
sidebar_label: KPI
copyright: (C) 2007-2018 GoodData Corporation
id: kpi_component
---

A **KPI** \(Key Performance Indicator\) renders a measure calculated by the GoodData platform.

## Structure

```jsx
import { Kpi } from "@gooddata/sdk-ui";
import { newMeasure } from "@gooddata/sdk-model";

const measure = newMeasure("<measure-identifier>");

<Kpi
    measure={measure}
    filters={<filters>}
    separators={<separators>}
/>
```

## Example

The following sample KPI calculates the total sales in California:

```jsx
import { Kpi } from "@gooddata/sdk-ui";
import { newPositiveAttributeFilter } from "@gooddata/sdk-model";
import * as Md from "./md/full";

<Kpi
    measure={Md.$TotalSales}
    filters={[
        newPositiveAttributeFilter(Md.StateName, ["California"])
    ]}
/>
```

## Properties

| Name | Required? | Type | Description |
| :--- | :--- | :--- | :--- |
| measure | true | string | The measure URI |
| filters | false | FilterItem[] | An array of filter definitions |
| format | false | string | The measure format. If specified, overrides the format stored with the measure. |
| backend | false | IAnalyticalBackend | The object with the configuration related to communication with the backend and access to analytical workspaces |
| workspace | false | string | The workspace ID |
| separators | false | object | The format of the thousands separator and decimal separator used in measures. The default is `{ thousand: ",", decimal: "." }`. For more information about setting the regional number format in a GoodData account, |
| onError | false | function | Custom error handler. Called with the argument containing the state and original error message, for example, `{ status:ErrorStates.BAD_REQUEST,error: {...} }`.|
| onLoadingChanged | false | function | Custom loading handler. Called when a KPI changes to/from the loading state. Called with the argument denoting a valid state, for example, `{ isLoading:false}`. |

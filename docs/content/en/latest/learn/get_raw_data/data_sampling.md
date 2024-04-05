---
title: Data Sampling
sidebar_label: Data Sampling
copyright: (C) 2020 GoodData Corporation
id: data_sampling
---

Use data sampling to quickly determine the viability of a particular visualization by processing only a percentage of the total available rows in the associated datasets instead of processing all of the data. [Read more...](https://www.gooddata.com/docs/cloud/create-visualizations/visualization-properties/#data-sampling)

> Data Sampling is available only for GoodData Cloud and GoodData.CN installations that use a Vertica Data Source.

## Example

```jsx
import { InsightView } from "@gooddata/sdk-ui-ext";

<InsightView
    insight="<visualization-identifier>"
    config={<chart-config>}
    execConfig={{ dataSamplingPercentage: 5 }} // represents 5%
/>
```
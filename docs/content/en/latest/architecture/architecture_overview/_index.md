---
title: "Architecture Overview"
linkTitle: "Architecture Overview"
weight: 1
no_list: true
---

GoodData.UI follows principles of the layered architecture and draws a clean line between the different UI components and the backend server that calculates the data to render. The UI components integrate with a backend server through an interface that we call **Analytical Backend**.

The **Analytical Backend** is designed as a Service Provider Interface (SPI) with clearly defined contracts that you can implement to work even with your own arbitrary backend. For now, the full documentation of the SPI is provided only at the code level. For more information, see the @gooddata/sdk-backend-spi package.

GoodData.UI comes with a full implementation of the Analytical Backend SPI for [GoodData Cloud](https://www.gooddata.com/docs/cloud/) and [GoodData.CN](https://www.gooddata.com/docs/cloud-native/latest/). GoodData.UI uses the **tiger** codename, for these two GoodData products, in all developer-facing artifacts and APIs. We find that it can better withstand the test of time.

> GoodData Platform uses the **bear** codename in all developer-facing artifacts and APIs. This codename can only be found in GoodData.UI versions 9.x and lower. GoodData Platform is no longer supported by GoodData.UI version 10 or newer.

The **Analytical Backend** abstraction ultimately allows you to develop applications that can be backend-agnostic.

| Package | Contents |
| :--- | :--- |
| @gooddata/api-client-tiger | The REST API client for GoodData Cloud and GoodData.CN |
| @gooddata/sdk-backend-tiger | The analytical backend implementation for GoodData Cloud and GoodData.CN |
| @gooddata/sdk-model | The APIs and models used to construct inputs to executions and charts |
| @gooddata/sdk-ui | The React infrastructure and headless components such as the Execute component |
| @gooddata/sdk-ui-charts | The React components for all charts |
| @gooddata/sdk-ui-geo | The React components for the Geo Pushpin Chart component |
| @gooddata/sdk-ui-pivot | The React component for the Pivot Table component |
| @gooddata/sdk-ui-filters | The filtering components |
| @gooddata/sdk-ui-ext | The components for embedding visualizations created in Analytical Designer |
| @gooddata/sdk-ui-all | An umbrella package that depends on all `sdk-ui-` packages and re-exports their public API |
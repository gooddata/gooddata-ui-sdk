<p align="center">
  <img src="assets/gooddata-logo.svg" alt="GoodData Logo" width="120px" height="120px"/>
</p>
<h1 align="center">GoodData.UI</h1>

<p align="center">
  <a href="https://sdk.gooddata.com/gooddata-ui"><strong>sdk.gooddata.com/gooddata-ui</strong></a>
  <br>
</p>

<p align="center">
    <a href="https://www.npmjs.com/@gooddata/sdk-model"><img src="https://img.shields.io/npm/v/@gooddata/sdk-model.svg?logo=npm" alt="GoodData.UI on npm"></a>&nbsp;
    <a href="https://npmcharts.com/compare/@gooddata/sdk-model?minimal=true"><img src="https://img.shields.io/npm/dm/@gooddata/sdk-model.svg" alt="GoodData.UI on npmcharts"></a>&nbsp;
    <img src="https://img.shields.io/badge/typescript-first-blue?logo=typescript" alt="GoodData TypeScript support badge">&nbsp;
    <a href="https://www.gooddata.com/slack"><img src="https://img.shields.io/badge/slack-community-green?logo=slack" alt="GoodData Community Slack"></a>&nbsp;
</p>

[GoodData.UI](https://gooddata.com/docs/gooddata-ui) is a TypeScript framework for building analytical applications on top of the [GoodData platform](https://help.gooddata.com/doc/enterprise/en), [GoodData Cloud or GoodData.CN](https://www.gooddata.com/docs/cloud/).

GoodData.UI consists of multiple libraries with clear-cut responsibilities ranging from low-level REST API clients up to visualization libraries that deliver React-based components to render different types of charts and tables.

## Documentation and examples

Learn about GoodData.UI:

-   [📚 Official documentation](https://gooddata.com/docs/gooddata-ui)
-   [🚀 Quick start](https://www.gooddata.com/docs/gooddata-ui/latest/quick_start/)
-   [📊 Examples Gallery](https://gdui-examples.herokuapp.com)
-   [⚙️ API reference](https://sdk.gooddata.com/gooddata-ui-apidocs/docs/index.html)

## Package overview

The most notable packages in this monorepo

| package                                                           | description                                                                                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`@gooddata/sdk-model`](./libs/sdk-model)                         | Domain models for GoodData.UI                                                                      |
| [`@gooddata/sdk-backend-spi`](./libs/sdk-backend-spi)             | Definitions of the Service Provider Interface (SPI) for the Analytical Backend                     |
| [`@gooddata/sdk-backend-tiger`](./libs/sdk-backend-tiger)         | Analytical Backend implementation for GoodData Cloud and GoodData.CN                               |
| [`@gooddata/sdk-ui-charts`](./libs/sdk-ui-charts)                 | React-based chart visualizations that you can use to visualize your data                           |
| [`@gooddata/sdk-ui-pivot`](./libs/sdk-ui-pivot)                   | React-based PivotTable component that you can use to visualize your data in a table-based manner   |
| [`@gooddata/sdk-ui-geo`](./libs/sdk-ui-geo)                       | React components that you can use to visualize your location-based data                            |
| [`@gooddata/sdk-ui-dashboard`](./libs/sdk-ui-dashboard)           | Dashboard component that can be used to embed dashboards into your application as React components |
| [`@gooddata/sdk-ui-ext`](./libs/sdk-ui-ext)                       | Various extensions to the base React-based components, see the package README for more             |
| [`@gooddata/sdk-ui-filters`](./libs/sdk-ui-filters)               | Set of classes and React components for creating filter-related UI                                 |
| [`@gooddata/sdk-ui-theme-provider`](./libs/sdk-ui-theme-provider) | Tools to make your application support themes                                                      |

## Contributing

To learn how to contribute, check out the [Contribution Guide](./dev_docs/contributing.md).

## License

(c) 2017-2023 GoodData Corporation

This repository is under a GoodData commercial license available in the [LICENSE](LICENSE) file because it contains a commercial package, HighCharts. Subdirectories containing the MIT license are not subject to the GoodData commercial license and do not contain any commercial code. Please see the NOTICE file for additional licensing information related to this project's third-party open source components.

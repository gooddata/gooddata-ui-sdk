# GoodData Cloud and GoodData.CN REST API Client

[![npm version](https://img.shields.io/npm/v/@gooddata/api-client-tiger)](https://www.npmjs.com/@gooddata/api-client-tiger)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/api-client-tiger)](https://npmcharts.com/compare/@gooddata/api-client-tiger?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

## Introduction

This package provides a thin REST API Client for [GoodData Cloud](https://sdk.gooddata.com/gooddata-ui/docs/cloud_introduction.html) and [GoodData.CN](https://sdk.gooddata.com/gooddata-ui/docs/cloudnative_introduction.html) (joint codename `tiger`). The API client is useful for specific,
low-level tasks targeting the platform. It can be used to develop small applications for either browser or the node.js
environment. The responsibilities of the API client are mostly about exposing REST API endpoints as asynchronous function calls.

However, we believe and recommend that the API client should be used as a last resort in situations where the higher-level
components and abstractions are insufficient: please check out the [`@gooddata/sdk-backend-spi`](https://www.npmjs.com/package/@gooddata/sdk-backend-spi) and
[`@gooddata/sdk-backend-tiger`](https://www.npmjs.com/package/@gooddata/sdk-backend-tiger) to learn about a more convenient API to work with analytical backends.

## Usage

```js
import sdk from "@gooddata/api-client-tiger";

// Authorize your requests
sdk.setApiToken(YOUR_GOODDATA_CN_TOKEN);

// Call the REST API
sdk.declarativeLayout.getWorkspacesLayout();
```

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/api-client-tiger/LICENSE).

# GoodData.CN REST API Client

## Introduction

This package provides a thin REST API Client for [GoodData.CN](https://sdk.gooddata.com/gooddata-ui/docs/cloudnative_introduction.html) (codename `tiger`). The API client is useful for specific,
low-level tasks targeting the platform. It can be used to develop small applications for either browser or the node.js
environment. The responsibilities of the API client are mostly about exposing REST API endpoints as asynchronous function calls.

However, we believe and recommend that the API client should be used as a last resort in situations where the higher-level
components and abstractions are insufficient: please check out the [`@gooddata/sdk-backend-spi`](https://www.npmjs.com/package/@gooddata/sdk-backend-spi) and
[`@gooddata/sdk-backend-tiger`](https://www.npmjs.com/package/@gooddata/sdk-backend-tiger) to learn about a more convenient API to work with analytical backends.

> Note: if you are using the API client to drive custom executions on GoodData platform then there is no reason to
> use the API client directly.

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

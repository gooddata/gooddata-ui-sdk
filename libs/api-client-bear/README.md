# GoodData Platform REST API Client

## Important

The contents of this package were previously available under `@gooddata/gooddata-js`. We have consolidated, renamed
and re-versioned all the JavaScript assets in GoodData UI.SDK v8.

## Introduction

This package provides a thin REST API Client for the [GoodData Platform](https://sdk.gooddata.com/gooddata-ui/docs/platform_intro.html) (codename `bear`). The API client is useful for specific,
low-level tasks targeting the platform. It can be used to develop small applications for either browser or the node.js
environment. The responsibilities of the API client are mostly about exposing REST API endpoints as asynchronous
function calls - with degrees of convenience varying from API to API.

However, we believe and recommend that the API client should be used as a last resort in situations where the higher-level
components and abstractions are insufficient: please check out the [`@gooddata/sdk-backend-spi`](https://www.npmjs.com/package/@gooddata/sdk-backend-spi) and
[`@gooddata/sdk-backend-bear`](https://www.npmjs.com/package/@gooddata/sdk-backend-bear) to learn about a more convenient API to work with analytical backends.

> Note: if you are using the API client to drive custom executions on GoodData platform then you should consider
> using the [Analytical Backend implementation](https://www.npmjs.com/package/@gooddata/sdk-backend-bear) for GoodData platform. The execution services
> located therein offer more [convenient APIs](https://sdk.gooddata.com/gooddata-ui/docs/custom_execution.html).

## Supported REST API versions

This table shows which version of the gooddata-js introduced support for a particular API version.

The REST API versions in the table are just for your information as the values are set internally and cannot be overridden.

| api-client-bear version | REST API version |
| :---------------------: | :--------------: |
|        \>= 8.0.0        |        4         |

### Usage

```js
import sdk from "@gooddata/api-client-bear";

sdk.user
    .login("john.doe@example.com", "your-secret-password")
    .then((response) => console.log("Login OK", response))
    .catch((apiError) => console.error("Login failed", apiError, "\n\n", apiError.responseBody));
```

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/api-client-bear/LICENSE).

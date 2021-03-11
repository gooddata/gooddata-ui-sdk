# GoodData Platform REST API Client

## Important

The contents of this package were previously available under @gooddata/gooddata-js. We have consolidated, renamed
and re-versioned all the JavaScript assets in GoodData UI.SDK v8.

## Introduction

This package provides a thin REST API Client for the GoodData Platform. The API client is useful for specific,
low-level tasks targeting the platform. It can be used to develop small applications for either browser or the node.js
environment. The responsibilities of the API client are mostly about exposing REST API endpoints as asynchronous
function calls - with degrees of convenience varying from API to API.

However, we believe and recommend that the API client should be used as a last resort in situations where the higher-level
components and abstractions are insufficient: please check out the @gooddata/sdk-backend-spi and
@gooddata/sdk-backend-bear to learn about a more convenient API to work with analytical backends.

> Note: if you are using the API client to drive custom executions on GoodData platform then you should consider
> using the [Analytical Backend implementation](../sdk-backend-bear) for GoodData platform. The execution services
> located therein offer more convenient APIs.

## Supported REST API versions

This table shows which version of the gooddata-js introduced support for a particular API version.

The REST API versions in the table are just for your information as the values are set internally and cannot be overridden.

| api-client-bear version | REST API version |
| :---------------------: | :--------------: |
|        \>= 8.0.0        |        4         |

## Usage

### Using as a npm package

1. go to your project directory and add the package: \
   → with [yarn](https://yarnpkg.com): `yarn add @gooddata/api-client-bear` \
   → with [npm](npmjs.com): `npm install --save @gooddata/api-client-bear`

    :heavy_exclamation_mark: **WARNING: npm package renamed from `gooddata` to `@gooddata/api-client-bear`** :heavy_exclamation_mark:

2. import the package's default export: \
   → in transpiled browser app with ES6 modules syntax: `import { factory } from '@gooddata/api-client-bear';` \
   → in node.js with CommonJS syntax: `const factory = require('@gooddata/api-client-bear').factory;`

3. call the API:

    ```js
    var gooddata = factory({ domain: "secure.gooddata.com" });
    gooddata.user
        .login("john.doe@example.com", "your-secret-password")
        .then((response) => console.log("Login OK", response))
        .catch((apiError) => console.error("Login failed", apiError, "\n\n", apiError.responseBody));
    ```

4. Please note that CORS could prevent the request. Refer to [your options in GoodData.UI documentation](https://sdk.gooddata.com/gooddata-ui/docs/cors.html), ie. setup local proxy or ask the GoodData platform for allowing a specific domain.

### Using as a standalone library

You have two options:

-   [download `gooddata.js` or `gooddata.min.js`](https://unpkg.com/@gooddata/api-client-bear@latest/umd/) from the latest release
-   build on your own; see the [main README](../../README.md) for more information

Then you can import the library file and global variable `gooddata` contains all exported members:

```html
<script type="text/javascript" src="gooddata.js"></script>
<script type="text/javascript">
    var sdk = gooddata.factory({ domain: "secure.gooddata.com" });
    sdk.user.login("john.doe@example.com", "your-secret-password");
</script>
```

## License

(C) 2020-2021 GoodData Corporation

This project is under MIT License. See [LICENSE](LICENSE).

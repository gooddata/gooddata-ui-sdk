# GoodData.UI domain models

[![npm version](https://img.shields.io/npm/v/@gooddata/sdk-model)](https://www.npmjs.com/@gooddata/sdk-model)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/sdk-model)](https://npmcharts.com/compare/@gooddata/sdk-model?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This package provides domain models for GoodData.UI.

These domain models are backend-agnostic. This makes them reusable across different [Analytical Backend](https://www.npmjs.com/package/@gooddata/sdk-backend-spi) implementations.
The package includes TypeScript type definitions, factory functions, functions to get or set certain properties
of the objects in an immutable way, and more. These are used in both the `@gooddata/sdk-backend-*` and `@gooddata/sdk-ui* packages`.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-model/LICENSE).

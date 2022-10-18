# GoodData.UI SDK - All-in-one

[![npm version](https://img.shields.io/npm/v/@gooddata/sdk-ui-all)](https://www.npmjs.com/@gooddata/sdk-ui-all)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/sdk-ui-all)](https://npmcharts.com/compare/@gooddata/sdk-ui-all?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This is all-in-one package which has all SDK packages as dependencies and re-exports their public API.

The primary purpose of this package is to simplify [migration](https://sdk.gooddata.com/gooddata-ui/docs/migration_guide_8.html) from previous versions of the GoodData.UI SDK - which were
all delivered in a single `@gooddata/react-components` package.

We recommend that you only use this package temporarily and refactor your application so that it only depends on the
exact SDK.UI packages.

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-all/LICENSE).

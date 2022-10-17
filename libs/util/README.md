# GoodData Utility Functions

[![npm version](https://img.shields.io/npm/v/@gooddata/util)](https://www.npmjs.com/@gooddata/util)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/util)](https://npmcharts.com/compare/@gooddata/util?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package contains utility functions used in production or test code of multiple different GoodData.UI SDK packages.

The functions exported from here are not part of the GoodData.UI public API.

## What belongs here?

There are two main criteria for functions to land here:

1.  Code implement commonly used convenience, simplification or unification of routine tasks done across SDK
2.  The code does not depend on any other packages apart from lodash. Not even other SDK packages.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/util/LICENSE).

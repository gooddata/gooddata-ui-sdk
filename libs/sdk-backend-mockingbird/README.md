# Static / Mock implementation of Analytical Backend SPI

[![npm version](https://img.shields.io/npm/v/@gooddata/sdk-backend-mockingbird)](https://www.npmjs.com/@gooddata/sdk-backend-mockingbird)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/sdk-backend-mockingbird)](https://npmcharts.com/compare/@gooddata/sdk-backend-mockingbird?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This package is a part of the [GoodData.UI SDK](https://sdk.gooddata.com/gooddata-ui/docs/about_gooddataui.html).
To learn more, check [the source monorepo](https://github.com/gooddata/gooddata-ui-sdk).

This package contains test support and mock implementations of various concepts in the [Analytical Backend](https://www.npmjs.com/package/@gooddata/sdk-backend-spi).

## Dummy Backend

This implementation of Analytical Backend SPI focuses on the execution branch of the SPI; it creates
and sets up Prepared Execution just like any other implementation would. When the prepared execution
is started (execute()) it either (based on configuration):

-   Returns an empty result which only contains execution definition and has the result dimensions empty.
    Reading any data views from this result will return empty data views.

-   Returns an empty result which only contains execution definition and has the result dimensions empty.
    Reading any data views from this result will yield NoDataError

    (Note: this is closer to how real backend implementations behave)

Purpose:

-   use in unit tests which need to verify whether the execution is prepared correctly
    for instance functions which transform props => prepared execution

-   use in unit tests which need to verify whether code works correctly with execution definition
    stored in result / data view / data view facade

-   use in component-level 'smoke tests' (e.g. something renders or happens, we don't care about the details)

## Legacy Recorded Backend

This implementation of Analytical Backend SPI for serves results recorded on the disk. It is called
legacy, because it works with recordings that were created pre-8.0, using an unknown method and are
tightly coupled with Execute AFM types themselves.

This legacy implementation was essential during the initial refactoring of the SDK to quickly get the
existing tests green. However, it should not be used in any new tests and should not be enhanced any further.

Instead, our efforts need to be focused on enhancing the non-legacy recorded backend and having all
tests (eventually also old tests) run against the reference workspace.

## Composite Backend

This implementation of Analytical Backend SPI allows merging multiple analytical backend instances into one. Each
component declares what for what workspace it has the data and the composite delegates all requests for that
workspace into the respective component.

## License

(C) 2017-2022 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-backend-mockingbird/LICENSE).

# GoodData.UI SDK - Extensions

[![npm version](https://img.shields.io/npm/v/@gooddata/sdk-ui-ext)](https://www.npmjs.com/@gooddata/sdk-ui-ext)&nbsp;
[![npm monthly downloads](https://img.shields.io/npm/dm/@gooddata/sdk-ui-ext)](https://npmcharts.com/compare/@gooddata/sdk-ui-ext?minimal=true)&nbsp;
![typescript](https://img.shields.io/badge/typescript-first-blue?logo=typescript)

This project implements extensions on top of stable components included in the SDK. The extensions land here
instead of their own project as part of their staged development. They typically meet one or more of
the following criteria:

-   The code is production quality, however:

    -   The public API is not yet stabilized and there MAY be breaking changes

    or

    -   There MAY be breaking changes in functionality

    or

    -   It depends on another extension

-   The code itself beta quality

Read on about different extensions to learn more about its stability and quality guarantees.

## Pluggable Visualizations

This extension implements visualizations that can be plugged into GoodData platform and then used seamlessly
in Analytical Designer (AD) and KPI Dashboard (KD). The extension defined Service Provider Interface that the pluggable
visualizations must implement and then implements 'pluggables' for all visualizations in the SDK proper.

### Quality

The code here is production grade, it is used in AD and KD.

### API Stability

The SPI that the pluggable visualizations must implement is of early alpha quality. It is expected to change
radically in the future.

### Notes

While it is possible to implement new pluggable visualizations, it is currently not possible to plug them
dynamically into AD and KD. Today this is done at AD and KD build time.

## Embedding

This extension provides `InsightView` component that allows developers to embed an Insight created using
Analytical Designer (AD). This is the spiritual successor of the `Visualization` component from SDK v7.x.

The main difference between the old `Visualization` and `InsightView` is that the `InsightView` renders the
embedded insights using the exact same components that are used in AD = the pluggable visualizations.

### Quality

The code here is production grade.

### API Stability

The API is stable. No breaking changes expected.

### Notes

While we expect breaking changes on the pluggable visualizations API and larger changes in their internals, we
do not anticipate breaking changes in the `InsightView`.

The `InsightView` component is located in the extensions module purely due to dependency on the pluggable
visualizations. It is safe to use in your production code.

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-ext/LICENSE).

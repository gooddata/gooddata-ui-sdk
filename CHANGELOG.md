# Changelog

## Supported REST API versions

This table shows which version of GoodData.UI introduced support for a particular API version.

The REST API versions in the table are just for your information as the values are set internally and cannot be overridden.

|GoodData.UI Version | REST API version
|:---:|:---:
|\>= 6.1.0|3
|<= 6.0.0|2

## Unreleased/planned

- We ask developers to consider using the Headline component instead of the KPI component. The KPI component may be eventually marked as deprecated in one of the next major versions.

## 7.2.0

### Fixed

- Sticky row update in pivot table

## 7.1.0

### Added

- Adding applied filters to an exported XLSX file by using the `includeFilterContext` property

### Changed

- Updated Highcharts to version `7.1.1`
- Updated Ag-grid to community version `20.0.0`
- Added carets `^` to versions of:
    - React `^16.5.2`
    - Lodash `^4.17.11`
    - And other smaller third-party libraries
    
- The `IExportConfig` type is renamed to `IExtendedExportConfig` and moved to react-components
```
// old way

import { IExportConfig } from '@gooddata/gooddata-js';

const exportConfig: IExportConfig = {
    format: XLSX,
    mergeHeaders: true,
    title: 'Custom Title'
};

// new way

import { VisEvents } from '@gooddata/react-components';

const exportConfig: VisEvents.IExtendedExportConfig = {
    format: XLSX,
    includeFilterContext: true,
    mergeHeaders: true,
    title: 'Custom Title'
};
```

### Fixed

- The Visualization component now propagates an externally provided SDK instance to the PivotTable component

## 7.0.1

June 28, 2019

### Fixed
 
- Drill event intersection element id. Now item localIdentifier has correctly higher priority over measure/attribute id

## 7.0.0

[Migration guide](https://sdk.gooddata.com/gooddata-ui/docs/migration_guide_7.html) from version 6.3.2

### Added

- Combo chart component ([doc](https://sdk.gooddata.com/gooddata-ui/docs/combo_chart_component.html))
- Managing subtotals in pivot tables via a submenu
- Formatting and validating the source code structure by [Prettier](https://prettier.io/)

### Changed

- The library now uses Typescript 3.3.4000.
- The pivot table property `groupRows` is `true` by default, which means that grouping is now enabled by default.
- Styling updates and various fixes have been applied to subtotals in the Pivot Table component.
- The Legend icons of the line chart component and the area chart components are shown as circles instead of squares.

## 6.3.3

June 28, 2019
 
### Fixed
 
- Drill event intersection element id. Now item localIdentifier has correctly higher priority over measure/attribute id

## 6.3.2

 May 9, 2019

 ### Changed

 - Fixed drilling context types that were changed in version 6.3.0 resulting in major change. Types are now backward compatible with pre 6.3.0 versions.

## 6.3.1

April 29, 2019

### Changed

- Use the updated @gooddata/goodstrap library to fix the error that occurs when installing dependencies on MS Windows machines ([commit](https://github.com/gooddata/gooddata-react-components/pull/929/commits/a6e4ab0acf91bb4318d8ffb2c394beae14adb125))

## 6.3.0

April 8, 2019

### Added

-   Insight export into CSV or XLSX ([doc](https://sdk.gooddata.com/gooddata-ui/docs/on_export_ready.html))
-   Support for attribute cell grouping in pivot tables when a table is sorted by first attribute ([doc](https://sdk.gooddata.com/gooddata-ui/docs/pivot_table_component.html#grouping))
-   Turning on/off totals in pivot tables via the totals menu ([doc](https://sdk.gooddata.com/gooddata-ui/docs/pivot_table_component.html#totals))
-   Specifying attribute filters by an attribute element value (see `textFilter` in [filters doc](https://sdk.gooddata.com/gooddata-ui/docs/filter_visual_components.html) and [AFM doc](https://sdk.gooddata.com/gooddata-ui/docs/afm.html))
-   Optional stacking ([doc](https://sdk.gooddata.com/gooddata-ui/docs/chart_config.html#configure-stacking))

### Changed

-   The Treemap and Heatmap visual components now emit drill events with the `value` property of the `string` type instead of the `number` type to be consistent with the other visual components.
-   The Table visual component and all chart visual components now emit drill events with the correct intersection that contains a non-empty `header.identifier` property when executed using `uri`.
-   The Pivot Table visual component now emits drill events without the `value` property in `drillContext`. `value` can be obtained from the `row` property using `columnIndex`.
-   The inconsistency between pivot tables and flat tables in how row attributes are drilled (the flat tables have the property called `name` while the pivot tables had the same property called `title`) has been fixed. The property is now called `name` in the both pivot and flat tables.

## 6.2.0

January 28, 2019

### Added

-   Drilling using function predicates and Arithmetic Measure drilling ([A.M. doc](https://sdk.gooddata.com/gooddata-ui/docs/arithmetic_measure.html),  [drilling doc](https://sdk.gooddata.com/gooddata-ui/docs/drillable_item.html)  | [commit](https://github.com/gooddata/gooddata-react-components/commit/e5b55540fb8434662300dfbda95a427adf8096de),  [commit](https://github.com/gooddata/gooddata-react-components/commit/3a7b8b9b3b223fbea04052ae09ee579fd4848a12),  [commit](https://github.com/gooddata/gooddata-react-components/commit/8e7e5aca98d27aa776c8b57814bd2afaa01688e7))
-   Model helpers ([doc](https://sdk.gooddata.com/gooddata-ui/docs/model_helpers.html) | [commit](https://github.com/gooddata/gooddata-react-components/commit/f5b96cebeaa7bb886266ddc6463de831c4f24142),  [commit](https://github.com/gooddata/gooddata-react-components/commit/9f6ca5a2f78f41632724f0e7d5acb372edb42975))
-   SDK request caching in URI Visualization component ([commit](https://github.com/gooddata/gooddata-react-components/commit/387fdb05204b30531bd39193981ad872a8fab3be))

### Changed

-   Upgraded GoodStrap library with fixed import of 'custom-event' polyfill ([commit](https://github.com/gooddata/gooddata-react-components/commit/5545063f7830c043093b8bdd8a80cb1d9c1be00a))
-   Upgraded Gooddata JS library to version 11.0.0 ([changelog](https://github.com/gooddata/gooddata-js/blob/master/CHANGELOG.md))
-   Upgraded lodash and moment libraries ([commit](https://github.com/gooddata/gooddata-react-components/commit/e427005650c4aad17221741836edfe35827def6c))

## 6.1.1

December 20, 2018

### Changed

- Use updated gooddata-js library to fix live examples ([commit](https://github.com/gooddata/gooddata-react-components/commit/145400a62edb640a56c9aff88283f76db5a62f20))

## 6.1.0

December 17, 2018

### Added

- Support for a secondary axis in line charts, bar charts, and column charts ([commit](https://github.com/gooddata/gooddata-react-components/commit/0bc35208b098835d5e86fbe1372f120afa7d5e80))
- Color mapping ([commit](https://github.com/gooddata/gooddata-react-components/commit/58ad5e43b1d0f262ffd73bec8061673091409a21))

### Changed

- Added translation metadata ([commit](https://github.com/gooddata/gooddata-react-components/commit/b2f38bda72e08761bf984676c73f175c8c04b410))
- Discarded the indigo theme ([commit](https://github.com/gooddata/gooddata-react-components/commit/09e3324785e9e6fe98f3a18b5f6cd265a778625c))
- Fixed the bug where a treemap did not assign colors properly by value ([commit](https://github.com/gooddata/gooddata-react-components/commit/4e1266c7d7a98d94c9159de28e3684d466126b90))
- If an AttributeFilter component is defined by the identifier, then the onApply parameter will have this identifier as the value of the ID property. Otherwise, when the AttributeFilter is defined by the URI, the behavior does not change. ([commit](https://github.com/gooddata/gooddata-react-components/commit/cf9244719d172eb9e16385c513000ba3ee8a50e1))

## 6.0.2

November 9, 2018

### Changed

- Use the upgraded GoodStrap library, which now uses the upgraded jQuery library (security update) ([commit](https://github.com/gooddata/gooddata-react-components/commit/65d4dcab487afe8ce55e3632f211067646538056))

## 6.0.1

November 6, 2018

### Changed

- Pivot tables no longer show the "is-beta" warning ([commit](https://github.com/gooddata/gooddata-react-components/commit/37d6574d1df0091475a2055096ade7ab5a9875eb))

## 6.0.0

November 1, 2018

[Migration guide](https://sdk.gooddata.com/gooddata-ui/docs/migration_guide_6.html) from version 5.3.

### Added

- Pivot table component ([doc](https://sdk.gooddata.com/gooddata-ui/docs/pivot_table_component.html)) that can be used to create both the pivot and the flat tables. In the future, we plan to use this implementation as a base for the TableComponent
- Extended capabilities of ChartConfig ([doc](https://sdk.gooddata.com/gooddata-ui/docs/chart_config.html))
- Added new way how to define custom colors to enable color mapping in the future ([commit](https://github.com/gooddata/gooddata-react-components/commit/8e968fd2b2b5da5fee6059d35ee7d8ae17278295))
- Heatmap can use custom colors ([commit](https://github.com/gooddata/gooddata-react-components/commit/97563afa58fd01d6a18745b8d14f1a01672575ae))
- React 16 support ([commit](https://github.com/gooddata/gooddata-react-components/commit/64226babfc81c957bfb6496f69711ddbd54dd49a))

### Changed

- [breaking] Gooddata.UI license has changed. Now, Gooddata.UI is double licensed. See the license file for details: ([commit](https://github.com/gooddata/gooddata-react-components/commit/b106f79aa2cc23553cf62a0b03955be893a0edd7))
- [breaking] Heatmap props were renamed ([commit](https://github.com/gooddata/gooddata-react-components/commit/39fe84c07dc84afd607d405035054d87a5a4a2b4) | [doc](https://sdk.gooddata.com/gooddata-ui/docs/heatmap_component.html#properties) | [migration guide](https://sdk.gooddata.com/gooddata-ui/docs/migration_guide_6.html))
- [breaking] Type definitions of the Area chart "stack by"/"view by" props were changed ([commit](https://github.com/gooddata/gooddata-react-components/commit/02a84754aea64ee7c932b451f6c7463f7a9177cf) | doc | [migration guide](https://sdk.gooddata.com/gooddata-ui/docs/migration_guide_6.html))
- [breaking] Removed RGBA color definitions. Alpha channel didn’t work with derived measures or on treemap ([commit](https://github.com/gooddata/gooddata-react-components/commit/8e968fd2b2b5da5fee6059d35ee7d8ae17278295) | doc | [migration guide](https://sdk.gooddata.com/gooddata-ui/docs/migration_guide_6.html))

### Deprecated

- The following AFM components are marked as deprecated and will be removed by the end of September 2019:

  - BarChart
  - ColumnChart
  - LineChart
  - PieChart
  - DonutChart
  - Table
  - Headline
  - AreaChart
  - Treemap
  - Heatmap
  - ScatterPlot

We recommend that you begin using corresponding visual components with the same name instead. See our [migration guide to v 5.0.0](https://sdk.gooddata.com/gooddata-ui/docs/migration_guide_5.md#components-with-buckets-interface) for details.

### Removed

- React 15 support

### Fixed

- Heatmap with bucket interface had switched the meaning of each bucket prop
- Other bug fixes and internal improvements

## 5.3.3 (November 15, 2018)

- Use the upgraded GoodStrap library, which now uses the upgraded jQuery library (backport security update) ([commit](https://github.com/gooddata/gooddata-react-components/commit/49bb1ce5668cc8a778cfef17211a1a4c89944233))

## 5.3.2 (September 27, 2018)

- Added description of data used in examples ([commit](https://github.com/gooddata/gooddata-react-components/commit/a0d7c54445325aecfeb5bd898bc3615fb67c2032))

## 5.3.1 (September 4, 2018)

- Heatmap bugfix ([commit](https://github.com/gooddata/gooddata-react-components/commit/7553681f471748de999430746944573b081ec88b))

## 5.3.0 (August 23, 2018)

- Added Heatmap chart ([commit](https://github.com/gooddata/gooddata-react-components/commit/660b01d949e08623f2cc1b3e7a091ca16efaf29e))
- Improved label rendering in Treemaps ([commit](https://github.com/gooddata/gooddata-react-components/pull/440/commits/5d5d002128e15f31e2af27b2ccccec4a809db0c9))
- Extended the existing examples and added new ones
- Added miscellaneous bugfixes and minor improvements

## 5.2.0 (August 10, 2018)

- Added Bubble chart ([commit](https://github.com/gooddata/gooddata-react-components/commit/2e4031b9296275e60a4c90b171fa7c2064c0e11e))
- Added Treemap chart ([commit](https://github.com/gooddata/gooddata-react-components/commit/05a77cc4041680468290e7af8eb089698f2afd69))
- Changed the way how Area chart renders null values ([commit](https://github.com/gooddata/gooddata-react-components/commit/65e923ed9ed6d23c3c0530b2e95df5beca7f1aa9))
- Added the time over time comparison feature ([commit](https://github.com/gooddata/gooddata-react-components/pull/424/commits/a54ec123589809f71c6aa00e534f099b1bbf06e2))
- Added the option to add the second measure to headlines ([commit](https://github.com/gooddata/gooddata-react-components/commit/15aa8a17cad493c2a9b2651c7622e9df878b13e8))
- Extended the existing examples and added new ones
- Added miscellaneous bugfixes and minor improvements

## 5.1.0 (June 7, 2018)

- Added Scatter Plot chart ([commit](https://github.com/gooddata/gooddata-react-components/commit/77b748a40b620a5233a370bf8110fdba87b282f3))
- Added Donut chart ([commit](https://github.com/gooddata/gooddata-react-components/commit/a703cd78f5095c6df6c73c716c7865b17913ad73))
- Moved the code from @gooddata/indigo-visualization to @gooddata/react-components and deprecated indigo-visualizations ([commit](https://github.com/gooddata/gooddata-react-components/commit/7a5ec756f39d4d222e2eb102f94f929aae0d44fc))
- Increased the usage of TypeScript ([commit](https://github.com/gooddata/gooddata-react-components/commit/265fda101384f83fb2b530192c0d065de2970ba2))
- Extended the existing examples and added new ones
- Added miscellaneous bugfixes and minor improvements

## 5.0.0 (April 26, 2018)

 - Ability to have visualizations from different domains on the same page ([commit](https://github.com/gooddata/gooddata-react-components/commit/c73c8f272e0461bde48c202e5f630271f709e279))
 - Upgrade React to 15.6.2 ([commit](https://github.com/gooddata/gooddata-react-components/commit/bd4cac04141f50dbeb237e417377cc77a4b0f484))
 - Components with buckets interface ([commit](https://github.com/gooddata/gooddata-react-components/commit/c7ca0819651879903c1270c9db26aa46a97cf62f))
 - Headline visualization with one measure ([commit](https://github.com/gooddata/gooddata-react-components/commit/f3b9e0e33cc5a3156243714201b76af74c27a757))
 - Headline with secondary measure ([commit](https://github.com/gooddata/gooddata-react-components/commit/a025abb677ad7d250dd43063b34557bfb3120d8e))
 - Area chart ([commit](https://github.com/gooddata/gooddata-react-components/commit/fb3cbddecf45fabb9cc30fc34f2c08dca170a17f))
 - Default loadings and errors ([commit](https://github.com/gooddata/gooddata-react-components/commit/235bd3f7cd4d88613356b8e3c8b80a7ee3aaea61))
 - Remove backward compatible CatalogHelper code ([commit](https://github.com/gooddata/gooddata-react-components/commit/68796d866458be889dbc52509ee757a3bc0eb957))
 - Allow disabled gridline ([commit](https://github.com/gooddata/gooddata-react-components/commit/a3bd32e54a72aa5bf9433a46bd1331a7e66b1bba))
 - Remove ErrorState.OK from the onError callback ([commit](https://github.com/gooddata/gooddata-react-components/commit/a7d0eab65b12e576bd64b76e12f9759c2faf9487))
 - Removed execution responses wrappers ([commit](https://github.com/gooddata/gooddata-react-components/commit/c6ae42d4af2711949eecf64d68d50d2f134fb90e))

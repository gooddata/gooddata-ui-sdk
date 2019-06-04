# Changelog

## Supported REST API versions

This table shows which version of the gooddata-js introduced support for a particular API version.

The REST API versions in the table are just for your information as the values are set internally and cannot be overridden.

|gooddata-js version | REST API version
|:---:|:---:
|\>= 10.0.0|3
|<= 9.0.1|2

<a name="11.12.0"></a>
## 2019-06-04 Version [11.12.0](https://github.com/gooddata/gooddata-js/compare/v11.11.0...v11.12.0)

- show error when exporting the Restricted insight
- add showFilters to IExportConfig, this will add the applied filters to the exported file.

<a name="11.11.0"></a>
## 2019-05-21 Version [11.11.0](https://github.com/gooddata/gooddata-js/compare/v11.10.0...v11.11.0)

- exported `convertReferencesToUris` utlity

<a name="11.10.0"></a>
## 2019-05-15 Version [11.10.0](https://github.com/gooddata/gooddata-js/compare/v11.9.0...v11.10.0)

- relax of @gooddata/typings dependency specification (add a ^)

<a name="11.9.0"></a>
## 2019-04-23 Version [11.9.0](https://github.com/gooddata/gooddata-js/compare/v11.8.0...v11.9.0)

- internal upgrade to Typescript 3

<a name="11.8.0"></a>
## 2019-03-27 Version [11.8.0](https://github.com/gooddata/gooddata-js/compare/v11.7.0...v11.8.0)

- enhance AFM and execute-afm to support values instead of attribute element URIs in attribute filters used in
  simple measures

<a name="11.7.0"></a>
## 2019-03-25 Version [11.7.0](https://github.com/gooddata/gooddata-js/compare/v11.6.0...v11.7.0)

- enhance AFM and execute-afm to support values instead of attribute element URIs in positive and negative attribute filters
- deprecated misplaced type-guards in AfmUtils
- deprecated double-negative function
- upgrade GoodData typings

<a name="11.6.0"></a>
## 2019-03-07 Version [11.6.0](https://github.com/gooddata/gooddata-js/compare/v11.5.0...v11.6.0)

- upgrade GoodData typings

<a name="11.5.0"></a>
## 2019-03-06 Version [11.5.0](https://github.com/gooddata/gooddata-js/compare/v11.4.0...v11.5.0)

### Changed

- `toAfmResultSpec` now converts native subtotals to `afm.nativeTotals` correctly

<a name="11.4.0"></a>
## 2019-03-01 Version [11.4.0](https://github.com/gooddata/gooddata-js/compare/v11.3.1...v11.4.0)

### Added endpoints

- added sdk.project.getConfig
- added sdk.project.getProjectFeatureFlags


<a name="11.3.1"></a>
## 2019-02-19 Version [11.3.1](https://github.com/gooddata/gooddata-js/compare/v11.3.0...v11.3.1)

### Fixed

- Fix loginSso to use POST request method instead of deprecated GET method


<a name="11.3.0"></a>
## 2019-02-15 Version [11.3.0](https://github.com/gooddata/gooddata-js/compare/v11.2.0...v11.3.0)

### Changed

- `appendFilters` utility now doesn't normalize AFM

<a name="11.2.0"></a>
## 2019-01-25 Version [11.2.0](https://github.com/gooddata/gooddata-js/compare/v11.1.1...v11.2.0)

- Add `getVisualization`, `saveVisualization`, `updateVisualization` and `deleteVisualization` methods to `metadata` module.

<a name="11.1.1"></a>
## 2019-01-24 Version [11.1.1](https://github.com/gooddata/gooddata-js/compare/v11.1.0...v11.1.1)

- Fix polling status for Exporting

<a name="11.1.0"></a>
## 2019-01-22 Version [11.1.0](https://github.com/gooddata/gooddata-js/compare/v11.0.0...v11.1.0)

- Add 'head' request to 'xhr' module
- Add new 'report' module
- Add 'exportResult' to 'report' module: support exporting data

<a name="11.0.0"></a>
## 2019-01-17 Version [11.0.0](https://github.com/gooddata/gooddata-js/compare/v10.2.0...v11.0.0)

- Remove deprecated interfaces for old visualization object

<a name="10.2.0"></a>
## 2019-01-15 Version [10.2.0](https://github.com/gooddata/gooddata-js/compare/v10.1.0...v10.2.0)

- Add default value format for arithmetic measures with 'change' as operator type

<a name="10.1.0"></a>
## 2019-01-08 Version [10.1.0](https://github.com/gooddata/gooddata-js/compare/v10.0.0...v10.1.0)

- Upgrade lodash and momentjs dependencies

<a name="10.0.0"></a>
## 2018-11-16 Version [10.0.0](https://github.com/gooddata/gooddata-js/compare/v9.0.1...v10.0.0)

- reintroduction of the changes made in 9.0.0 and reverted in 9.0.1

<a name="9.0.1"></a>
## 2018-10-29 Version [9.0.1](https://github.com/gooddata/gooddata-js/compare/v9.0.0...v9.0.1)

- revert of the changes made in version 9.0.0 due to a backend not being ready yet

<a name="9.0.0"></a>
## 2018-10-29 Version [9.0.0](https://github.com/gooddata/gooddata-js/compare/v8.1.1...v9.0.0)

- the support of the GoodData Platform REST API versioning with the initial supported version set to 3
- the logic of the global AFM date filters merging with measure date filters was moved from gooddata-js to backend

<a name="8.1.1"></a>
## 2018-08-20 Version [8.1.1](https://github.com/gooddata/gooddata-js/compare/v8.1.0...v8.1.1)

- minor docs updates

<a name="8.1.0"></a>
## 2018-08-20 Version [8.1.0](https://github.com/gooddata/gooddata-js/compare/v8.0.0...v8.1.0)

- `user.getCurrentProfile()` gets current user's profile ([commit](https://github.com/gooddata/gooddata-js/commit/3e86de798f6c2541bf7200adcad9161dc528edc6))
- `user.isLoggedInProject(projectId)` finds out whether a specified project is available to a currently logged user ([commit](https://github.com/gooddata/gooddata-js/commit/f041263d3a50cd3eb4d99324467451248b8c3970))

<a name="8.0.0"></a>
## 2018-08-01 Version [8.0.0](https://github.com/gooddata/gooddata-js/compare/v7.1.1...v8.0.0)

- export executeAfm paging functions ([commit](https://github.com/gooddata/gooddata-js/commit/81740bb1bb28b21f4b02694c65028f4c3fcfeffe))

<a name="7.0.0"></a>
## 2018-07-19 Version [7.0.0](https://github.com/gooddata/gooddata-js/compare/v6.2.0...v7.1.0)

- added support for multiple date datasets ([commit](https://github.com/gooddata/gooddata-js/commit/1e6230b))
- added support for pageable DataSource ([commit](https://github.com/gooddata/gooddata-js/commit/77ecb41))

<a name="6.0.0"></a>
## 2018-05-11 Version [6.0.0](https://github.com/gooddata/gooddata-js/compare/v5.0.1...v6.2.0)

- rewritten in TypeScript + merged `@gooddata/data-layer` package ([commit](https://github.com/gooddata/gooddata-js/commit/c5c985e))
- added support for multiple domains, see [documentation](https://sdk.gooddata.com/gooddata-ui/docs/ht_render_visualization_from_different_domain.html) ([commit](https://github.com/gooddata/gooddata-js/commit/ebcebe5))
- internal telemetry support ([commit](https://github.com/gooddata/gooddata-js/commit/76e22f5))

**Migration guide:**

Default SDK instance is no longer returned as the only `module.export` ([see commit](https://github.com/gooddata/gooddata-js/commit/ebcebe#diff-5fdc9336695bd0fbfa5729ca90862b69L13)).

- To get default instance use \
   in CommonJS: `const gooddata = require('@gooddata/gooddata-js').default` \
   or in ES6: `import gooddata from '@gooddata/gooddata-js'`
- DataLayer was merged into gooddata-js as named export. Use: \
   in CommonJS: `const DataLayer = require('@gooddata/gooddata-js').DataLayer` \
   or in ES6: `import { DataLayer } from '@gooddata/gooddata-js'`
- See [all named exports here](https://github.com/gooddata/gooddata-js/blob/v6.0.0/src/gooddata-browser.ts#L13-L28) or in `gooddata-node.ts`

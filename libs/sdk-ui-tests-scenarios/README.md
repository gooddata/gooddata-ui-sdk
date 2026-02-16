# GoodData.UI Test Scenarios

This package contains test scenarios and API regression tests for GoodData.UI components.

## Overview

### Motivation

The primary reason of existence of this project is the notion of treating the test code as
'just another' consumer of the SDK. These tests should thus be closer in verifying that the public API
used by SDK consumer works as intended.

### What this package contains

- **Test scenarios** (`src/scenarios/`) - named lists of different valid instances of props applicable for
  each visualization. These are the shared inputs for both API regression tests in this package and visual
  regression tests in `sdk-ui-tests-storybook`.

- **Scenario framework** (`src/scenario.tsx`, `src/scenarioGroup.tsx`) - lightweight abstraction for defining
  and grouping test scenarios.

- **API regression tests** (`tests/api-regression/`) - vitest snapshot tests that verify usage of public API
  leads to expected executions on backend and expected invocations of the underlying 3rd party charting library.

- **Smoke-and-capture tests** (`tests/smoke-and-capture/`) - test suite for capturing execution definitions
  that can be fed to mock handling tools.

### Test scenarios

Test scenarios for a particular visualization are a named list of different valid instances of props
applicable for that visualization. They are defined once and reused as inputs for:

- Parameterized vitest snapshot tests (in this package)
- Storybook stories for visual regression testing (in `sdk-ui-tests-storybook`)
- Recording backend interactions for offline testing

Because the scenarios exercise various combinations of visualization input props according to prop type
defined for that visualization, they are a natural indicator of breaking API changes.

Test scenarios work with LDM defined in the 'reference-workspace'; the recordings of backend interactions
are also stored in 'reference-workspace'.

## Dev guide

### Adding a new scenario for a visualization

Locate the visualization directory under `src/scenarios/` and then:

- When adding a new scenario that covers different combinations of buckets, look at the 'base' scenarios,
  make sure you are not adding a duplicate. Then code the buckets using objects from the reference workspace.

- When adding a new scenario that covers different combinations of visualization configuration (chart config,
  callbacks etc.), that build on top of one of the 'base' scenarios: add them to a separate file and tag them
  with "vis-config-only" and "mock-no-scenario-meta" tags.

- Newly added scenarios are automatically included in existing test suites.

### Adding scenarios for a new visualization

- Scenarios for charts are in `src/scenarios/charts/` and further divided into per-chart-type subdirectories.
- Scenarios are divided into logical subgroups. The convention is that scenarios exercising different
  combinations of input buckets are stored in `base.tsx`.
- Make sure newly added scenarios are re-exported all the way to `src/index.ts`.
- Add api-regression tests under `tests/api-regression/`.

### Capturing recording definitions and recordings

Recording definitions and recordings are accumulated in the reference-workspace project.

1. Add new scenarios, make sure they are included in exports
2. Execute `rush build`
3. Execute `rushx clear-recordings` in `tools/reference-workspace`
4. Execute `rush populate-ref` (writes new execution defs)
5. Execute `rushx refresh-recordings` in `tools/reference-workspace`
6. Commit

## Review methodology

- Adding or deleting test scenarios is OK
- Modifying existing scenarios because they do not compile indicates breakage of public API
- Modifying existing vitest snapshots must be scrutinized against visual regression results

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-tests/LICENSE).

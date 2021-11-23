# GoodData.UI regression and end-to-end tests

I want to check if backstop tests works on CI on master branch

The project contains black-box regression and end-to-end tests for the GoodData.UI components.

## Overview

### Motivation

The primary reason of existence of this project is the notion of treating the test code as
'just another' consumer of the SDK. These tests should thus be closer in verifying that the public API
used by SDK consumer works as intended.

Furthermore, the install-time linkage of end-to-end test code and the code under test allows us to
extend the purpose of the test suites; we may eventually run an older version of suite of tests against
multiple versions of the SDK - as an ultimate way to verify backward compatibility of changes done in
newer versions of the SDK.

### Test types

The tests contained in this package can be divided into three distinct groups:

-   Public API Regression tests

    These tests verify that usage of public API of the different visualizations leads to expected
    executions on backend AND to expected invocations of the underlying 3rd party charting library.

    Transitively, these tests are first step in verifying that particular usage of public API always
    leads to predictable result for the end user.

    These tests are implemented using jest & enzyme and are intended to run fairly fast.

-   Visual regression tests

    These tests verify that usage of public API of the different visualizations leads to the same
    visualization actually being rendered in the browser.

    These tests are the second and final step in verifying that particular usage of public API always
    leads to predicable result for the end user.

    These tests are implemented using Storybook & backstop.js; charts are actually rendered in the
    headless browser, screenshots are captured and verified during test run.

-   End-to-end tests

    These tests verify interactions with the different components.

    These tests are implemented using Storybook & TestCafe; charts are actually rendered in the
    headless browser, manipulated and asserted in TestCafe.

### Test scenarios

Inputs to Public API Regression tests and most Visual Regression tests are coded using a lightweight
abstraction of the _test scenarios_. Test scenarios for a particular visualization are a named list of
different valid instances of props applicable for that visualization.

The test scenarios for one type of visualization are defined once and are then used as inputs for
parameterized Jest snapshot tests and creation of stories to be captured as screenshots using backstop.

Because the scenarios exercise various combinations of visualization input props according to prop type
defined for that visualization, they are a natural indicator of breaking API changes. See following
section for more information on this.

Furthermore, test scenarios are used to create recordings of backend interactions so that the tests
in this project can run offline (and as fast as possible) against recorded backend.

Test scenarios work with LDM defined in the 'reference-workspace'; the recordings of backend interactions
are also stored in 'reference-workspace' - with the intention for further reuse in component tests in
different SDK projects.

### Infrastructure

This project comes with necessary infrastructure, templates and scripts to automate and hopefully simplify
most of the mundane tasks:

-   `npm run populate-ref` inspects test scenarios and captures execution definitions
    that can be fed to mock handling tool to capture and store data from live backend

-   unified template for Public API regression tests

-   auto-creation of stories for test scenarios

-   `npm run story-extractor` does runtime inspection of stories in storybook and builds
    BackstopJS test scenarios

-   `npm run backstop-*` runs BackstopJS in docker containers

## Dev guide - how-to use this infrastructure

### Adding new scenario for a visualization

Locate directory of the visualization and then:

-   When adding a new scenario that covers different combinations of buckets look at the 'base' scenarios, make
    sure you are not adding a duplicate scenario. Then code the buckets for this new scenario using objects from
    the reference workspace.

    After this, you need to capture execution definition for this new combination and capture recording of the data.
    See the next topics on how to do this.

-   When adding a new scenario that covers different combinations of visualization configuration (chart config, callbacks
    and then like), that build on top of one of the 'base' scenarios: add them to a separate file within the vis
    directory and tag them with "vis-config-only" and "mock-no-scenario-meta" tags. These tags will ensure that
    the mock building infrastructure will not clutter recording index with extra named scenarios leading to the
    same recording.

-   Newly added scenarios are automatically included in existing api-regression and visual-regression test suites => you
    are done.

Note: visual regression tests will fail if you run them before capturing execution definition and data recordings.

### Adding scenarios and tests for a new visualization

-   Scenarios for visualization should be located in per-visualization directory. Scenarios for charts are in the
    `scenarios/charts` directory and further divided into per-chart-type subdirectories

-   Scenarios are divided into logical subgroups. The convention is that scenarios that just exercise different
    combinations of input buckets are stored in `base.tsx` file.

-   Code the scenarios, see existing ones for inspiration

-   Make sure the newly added scenarios are re-exported all the way to the main `scenarios` barrel

-   Add api-regression tests: create per-vis-type test file under `/tests/api-regression`; copy-paste an existing
    test file, make alterations so that tests run against the new scenarios. Note: these are all parameterized
    snapshot tests. All the test files are the same with the exception of chart name & type.

-   Visual regression tests for all scenarios are created automatically. There are story creators in
    `stories/visual-regression`.

Note: visual regression tests will fail if you run them before capturing execution definition and data recordings.

### Capturing recording definitions and recordings

Recording definitions and the recordings are accumulated in the reference-workspace project. This is intended to be a
single source of all recordings done on top of the UI Reference Workspace.

Execution definitions and insight definitions for test scenarios included in this project can be captured and stored
in reference-workspace using the specialized 'smoke-and-capture test suite. This test suite takes all scenarios and
renders the components using a backend instrumented to capture the definitions.

This test suite is intentionally excluded from the main test runs and has to be triggered manually:
`npm run populate-ref` or using `rush populate-ref` (this works from anywhere)

This command will execute the 'smoke-and-capture' suite that will store execution definitions in the reference-workspace
project.

After this, you can navigate to the **reference-workspace** project and execute: `npm run refresh-recordings`

### TL;DR

When creating new test scenarios, proceed as follows:

-   Open terminal in `tools/reference-workspace` project
-   Add new scenarios in sdk-ui-tests, make sure new scenarios are included in barrel exports all the way to the root
    scenarios index
-   Execute `rush populate-ref` in terminal => writes new execution defs
-   Execute `./bin/refresh-recordings.sh && npm run build` => captures execution recordings (if needed) and builds
    the recording index
-   Commit

Note: if at any point you realize that the recordings need to be completely re-done, then it is safe to delete
`tools/reference-workspace/src/recordings/uiTestScenarios`; following the above steps will then lead to a
complete refresh.

## Visual Regression with Storybook and BackstopJS

This project comes with tools and lightweight infrastructure to provide a fairly seamless integration of
Storybook and BackstopJS.

A component rendered in a story can be wrapped with `withScreenshot` or `withMultipleScreenshots`. With this
in place you can run `npm run build-storybook` and `npm run backstop-*` commands to create or verify screenshots
for the stories.

### Stories to screenshots

-   Story wrapped in `withScreenshot` will result in a single screenshot; optionally the wrapper can be customized
    with any available BackstopJS scenario parameters

-   Story wrapped in `withMultipleScreenshots` will result in N screenshots; the wrapper must be customized with
    a mapping of screenshot scenario name => BackstopJS parameters. Optionally a base BackstopJS config can be
    provided to the wrapper. The parameters in the base config will be applied to all scenarios defined in it; per
    scenario config will overwrite any parameters coming from base.

-   Finally, under both of these is a possibility to specify configuration globally and en-masse in the
    [backstop/scenarios.config.js](scenarios.config.js). There are some sane defaults for chart and
    pivot table stories. The global configuration is used as base; story or scenario specific configuration will
    overwrite any parameters coming from base.

### Building and running

BackstopJS executes in a container - thus guaranteeing same output on any workstation and on CI . You can
(and should) run BackstopJS tests locally. Make sure you have Docker installed; if on OS X also make sure your
Docker installation has RAM limit set to at least 4 GiB (Settings > Advanced).

Tests can be triggered as follows:

-   Make sure you have run `rush build -t sdk-ui-tests`.

-   Run BackstopJS in 'test' mode: `npm run backstop-test`

    This will create `dist-storybook` directory with build of Storybook & create or update `backstop/stories.json` file.
    This file contains listing of all stories available in storybook.

Additional BackstopJS modes are also available:

-   `npm run backstop-approve` - after failed test run, approve the differences and overwrite reference screenshots
-   `npm run backstop-reference` - build storybook and take reference screenshots for all stories

> Note: all backstop-\* commands run build, story extraction and then the appropriate backstop command. You can
> achieve more flexible workflows using the elementary `build-storybook` and `story-extractor` scripts combined
> with the [run-backstop.sh](backstop/run-backstop.sh) script.

It is possible to override default Backstop concurrency settings using environment variables:

-   `BACKSTOP_CAPTURE_LIMIT` - will be used to set Backstop's asyncCaptureLimit option; default is 6.
    When tweaking this, we have found that setting the value to number of (CPU threads - 1 or 2) leads to
    saturation of cores without flaky-ness.
-   `BACKSTOP_COMPARE_LIMIT` - will be used to set Backstop's asyncCompareLimit option; default is 50
    When tweaking this, we have found that setting the value to number > 50 makes backstop crash badly at
    the very end. Since the comparison is done at the end and is pretty fast anyway, tweaking this option
    is usually not needed.

## End-to-end tests with Storybook and TestCafe

To enable some more involved interaction testing that would not be possible or practical with BackstopJS, the project also comes with TestCafe support.

It uses the Storybook described in the previous sections and runs standard TestCafe tests on top os selected stories (those in the `50 Stories for e2e Tests` section).

### Building and running

To run the TestCafe tests

-   Make sure you have the Storybook running by executing `npm run storybook`
-   Run the TestCafe tests
    -   either in visual mode by `npm run testcafe-visual` (this is useful debugging as you can see what is happening)
    -   or in headless mode by `npm run testcafe` (this is much faster as tests are run in parallel)

## Technical Funny Stuff

This project has several use cases where React component test scenarios have to be processed in node.js environment:

-   Capturing execution definitions for visualizations implemented by React components
-   Building BackstopJS configuration for visual regression testing

In both of these cases code that is normally interpreted in browsers needs to run on server/workstation.

To simplify and speed up initial development, the project mis-uses jest to run code that requires simulation of
browser environment in node. A proper solution (perhaps using browser-env) is definitely possible but comes with
its own price-tag while leading to the same results as current solution.

## Review methodology

We need to stay diligent when reviewing changes to this project - that way we can reap rewards that
the current setup offers.

First, here are the safe types of changes in this area:

-   Adding new test scenarios and new tests is OK
-   Deleting test scenarios and tests is OK if we deem some scenarios are duplicates and thus
    not necessary

#### Minor and patch releases

-   Modifying existing test scenarios because they do not compile is not allowed - it indicates
    breakage of public API

-   Modifying existing jest snapshots for particular scenario must be scrutinized;
    -   IF the scenario is also tested using visual regression AND the screenshot for the
        scenario is unchanged, then the update in snapshot is LIKELY OK; evaluate impact
    -   IF the scenario is also tested using visual regression AND the screenshot for
        the scenario is also changed, then the update is LIKELY NOT OK (see below)
    -   IF the scenario is not tested using visual regression, then the impact must be
        researched and explained in the PR
-   Modifying existing screenshots
    -   The go-to answer is that this should not happen during minor or patch releases
    -   The exceptions could be related to technicalities - screenshot of a larger
        area, date changes etc

#### Major release

-   Modifying existing test scenarios because they do not compile means we have a breaking
    change and must ensure that this is captured in the migration guide.

-   Modifying existing snapshots & screenshots MAY mean we changed behavior of visualization
    and must ensure that this is captured in the migration guide.

## License

(C) 2017-2020 GoodData Corporation

This project is under commercial license. See [LICENSE](LICENSE).

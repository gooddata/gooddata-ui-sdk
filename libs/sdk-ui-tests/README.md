## GoodData.UI regression and end-to-end tests

The project contains black-box regression tests and end-to-end tests for the GoodData.UI components.

### Motivation

The primary reason of existence for this project for is the idea of treating the test code as
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

Inputs to Public API Regression tests and Visual Regression tests are captured using lightweight
abstraction of the test scenarios. Test scenarios for a particular visualization are a named list of
different valid instances of props applicable for that visualization.

The test scenarios for one type of visualization are defined once and are then used as inputs for
parameterized Jest snapshot tests and creation of stories to be captured as screenshots using backstop.

Because the scenarios exercise various combinations of visualization input props according to prop type
defined for that visualization, they are a natural indicator of breaking API changes. See following
section for more information on this.

Furthermore, test scenarios are used to create recordings of backend interactions so that the tests
in this project can run offline (and as fast as possible) against mocked backend.

Test scenarios work with LDM defined in the 'reference-workspace'; the recordings of backend interactions
are also stored in 'reference-workspace' - with their intention for further reuse in component tests in
different SDK projects.

### Review methodology

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
        scenario is unchanged, then the update in snapshot is OK
    -   IF the scenario is also tested using visual regression AND the screenshot for
        the scenario is also changed, then the update is LIKELY NOT OK (see below)
    -   IF the scenario is not tested using visual regression, then the impact must be
        researched and explained in the PR
-   Modifying existing snapshots
    -   The go-to answer is that this should not happen during minor or patch releases
    -   The exception is if the snapshots are updated for technical reasons (capturing larger
        area)

#### Major release

-   Modifying existing test scenarios because they do not compile means we have a breaking
    change and must ensure that this is captured in the migration guide.

-   Modifying existing snapshots & screenshots MAY mean we changed behavior of visualization
    and must ensure that this is captured in the migration guide.

### How-to

TBD

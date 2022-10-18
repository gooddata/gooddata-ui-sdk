# SDK End-to-end tests

This project contains End-to-End tests for GoodData.UI components.

## Overview

Tests in this library verify various go-through scenarios for GoodData.UI components. Tests are implemented using [Cypress](https://www.cypress.io/).

## DEV Guide

### Running tests locally

To run the tests against a live backend follow these steps:

-   run `rush build -t sdk-ui-tests-e2e` to have the latest changes applied to the E2E tests package
-   run `npm run start-scenarios` to run the testing application. The application will run on port 9500
-   run `npm run cypress` to start cypress local instance

The test application runs on `http://localhost:9500/gooddata-ui-sdk?scenario=<scenario-key>`, to show the Scenario you want to test, replace the `<scenario-key>` variable
with the value of respective Scenario key. You can find all available keys in the `ComponentResolver.tsx`.

To log in to the scenario app, visit `http://localhost:9500/gdc/account/login`

### Adding new test

-   In folder `cypres/integration` you can either create new folder for the tests you're writing. You can then add new `*.spec.ts` file into either this new folder or to suitable existing one.
-   In the `scenarios/src/components/Scenarios`, create new Scenario file and within the new file use the component you are about to test.
-   In the `scenarios/src/routes/ComponentResolver`, add the `ScenarioComponent` you just created with a new unique hash. Navigation component takes this hash as its parameter and navigates the application to matching component.
-   In the `.env` file, type the spec file name into `FILTER` variable, file name must be fully specified (e.g. dateFilter.spec.ts). This will keep all the recordings untouched and creates the recording for the new spec only.
-   Run command `npm run run-isolated-record` to create new recordings for tests.

### Test results

-   If tests fail, there are 3 ways how to check what happened:
    -   screenshots in `cypress/screenshots`
    -   videos in `cypress/videos`
    -   if you are running tests in record mode, then you can see all calls logged in `recording/mappings`

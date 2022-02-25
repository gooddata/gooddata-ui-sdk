# SDK End-to-end tests

This project contains End-to-End tests for GoodData.UI components.

## Overview

Tests in this library verify various go-through scenarios for GoodData.UI components. Tests are implemented using [Cypress](https://www.cypress.io/).

## DEV Guide

### Running tests locally

-   Make sure, that application in scenarios folder is built.
-   Run script `run-isolated-local`. The script prepares docker instances with needed volumes and runs the tests on the scenarios application.

-   run `rush build -t sdk-ui-tests-e2e` to have the latest changes applied to the E2E tests package
-   navigate to `libs/sdk-ui-tests-e2e` package
-   run `npm run build-scenarios` to prepare the testing application
-   run `npm run run-scenarios-local` to run the testing application. The application will run on port 9500
-   run `npm run cypress` to start cypress local instance

The test application runs on `http://localhost:9500/gooddata-ui-sdk#<resolver-hash>`, to show the Scenario you want to test, replace the `<resolver-hash>` variable
with the hash respective to you Scenario. You can find all available hashes in the `ComponentResolver.tsx`.

### Adding new test

-   In folder `cypres/integration` you can either create new folder for the tests you're writing. You can then add new `*.spec.ts` file into either this new folder or to suitable existing one.
-   In the `scenarios/src/components/Scenarios`, create new Scenario file and within the new file use the component you are about to test.
-   In the `scenarios/src/routes/ComponentResolver`, add the `ScenarioComponent` you just created with a new unique hash. Navigation component takes this hash as its parameter and navigates the application to matching component.
-   In the `.env` file, type the spec file name into `FILTER` variable. This will keep all the recordings untouched and creates the recording for the new spec only.
-   Run command `npm run run-isolated-record` to create new recordings for tests.

### Test results

-   If tests fail, there are 3 ways how to check what happened:
    -   screenshots in `cypress/screenshots`
    -   videos in `cypress/videos`
    -   if you are running tests in record mode, then you can see all calls logged in `recording/mappings`

# SDK End-to-end tests

This project contains End-to-End tests for GoodData.UI components.

## Overview

Tests in this library verify various go-through scenarios for GoodData.UI components. Tests are implemented using [Cypress](https://www.cypress.io/).
There are two categories of tests: isolated and integrated. Isolated tests run against recorded backend responses, whereas integrated tests
run against a live backend. Isolated tests run in the pre-merge phase and itegrated tests run in post-merge phase.

## DEV Guide for isolated tests

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

### Running things on Apple Silicon

Currently, our ECR images do not support ARM64 tags, so to run Docker things in this repo locally, search for
`020413372491.dkr.ecr.us-east-1.amazonaws.com/3rdparty/` in this folder and remove it.
This will make your docker use upstream images that do support ARM64 and thus your Mac will run them natively.
Do not commit this change!

### Run tests against wiremock backend with live Cypress controls (tests are importing their recorded mapping files)

Good for debugging the tooling when tests are passing with live backend but fail on CI.
Runs Cypress, Scenarios, and Wiremock separately in Docker.
Make sure you have set correct SDK_BACKEND environment variable (.env)

-   Start recorded backend `npm run local-dev-wiremock` (add `--verbose` param for debugging)
-   Start Scenarios `npm run run-scenarios-local`
-   Add FILTER env variable with test file name to run and CYPRESS_TEST_TAGS env var to specify a comma-separated list of tags to run
-   Run Cypress `npm run local-dev-test-visual-recordings`

_Note:_ this approach allows running only a single test at a time.
Mappings are imported to wiremock for this particular test only and only this test is visible in cypress live controls.

See `run_local_dev_isolated.js` for configuration options.

### Dynamic import

Dynamic import should be used in case test is written for both backends, instead of creating a scenario corresponding to each backend.

_Example:_

```
import React from "react";
import {Dashboard} from "@gooddata/sdk-ui-dashboard";

let dashboardRef: string;

if (process.env.SDK_BACKEND === 'TIGER') {
    import("../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_tiger")
        .then((module) => {
            dashboardRef = module.Dashboards.ExampleDashboard;

        });
} else if (process.env.SDK_BACKEND === 'BEAR') {
    import("../../../../../reference_workspace/workspace_objects/goodsales/current_reference_workspace_objects_bear")
        .then((module) => {
            dashboardRef = module.Dashboards.ExampleDashboard;
        });
}
export const ExampleScenario: React.FC = () => {
    return <Dashboard dashboard={dashboardRef} />;
};
```

## DEV Guide for integrated tests

Prepare env variables

```
export TEST_BACKEND=https://abc.your-domain.com
export TEST_BACKEND_NO_PREFIX=abc.your-domain.com
export HOST=$TEST_BACKEND
export IMAGE_ID=ui-sdk-scenarios

```

Provide all necessary info in the `.env` file

For Tiger

-   SDK_BACKEND=TIGER
-   FIXTURE_TYPE=goodsales
-   CYPRESS_TEST_TAGS=post-merge_integrated_tiger
-   TIGER_API_TOKEN=

For Bear

-   SDK_BACKEND=BEAR
-   FIXTURE_TYPE=goodsales
-   CYPRESS_TEST_TAGS=post-merge_integrated_tiger
-   USER_NAME=bear@gooddata.com
-   PASSWORD=
-   AUTH_TOKEN=

Create reference workspace with `yarn create-ref-workspace` or make sure you have valid TEST_WORKSPACE_ID specified in the `.env` file.

To run the tests locally, you would need to build the sdk and the scenarios against which the tests run and then run the tests, i.e.

```
rush build -t sdk-ui-tests-e2e && yarn build-scenarios && \
    docker build --file Dockerfile_local -t $IMAGE_ID . && \
    docker-compose -f docker-compose-integrated.yaml up \
        --force-recreate --always-recreate-deps --renew-anon-volumes \
        --exit-code-from integrated-tests --abort-on-container-exit
```

To debug tests in visual mode, you need to first build the scenarios and start them in docker compose

```
rush build -t sdk-ui-tests-e2e && yarn build-scenarios && \
    docker build --file Dockerfile_local -t $IMAGE_ID . && \
    docker-compose -f docker-compose-integrated.yaml up \
        --force-recreate --always-recreate-deps --renew-anon-volumes gooddata-ui-sdk-scenarios
```

and run with (by default runs in visual mode)

```
CYPRESS_HOST=http://localhost:9500 yarn run-integrated
```

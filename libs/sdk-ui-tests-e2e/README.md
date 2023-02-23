# SDK End-to-end tests

This project contains End-to-End tests for GoodData.UI components.

## Overview

Tests in this library verify various go-through scenarios for GoodData.UI components. Tests are implemented using [Cypress](https://www.cypress.io/).
There are two categories of tests: isolated and integrated. Isolated tests run against recorded backend responses, whereas integrated tests
run against a live backend. Isolated tests run in the pre-merge phase and integrated tests run in post-merge phase.

## Installation

Run all commands in this directory. Run `nvm use` to select the right version of Node.js. Install local dependencies with `rush install` and `rush build -t sdk-ui-tests-e2e`.

## Prepare env variables

```
export TEST_BACKEND=https://abc.your-domain.com
export TEST_BACKEND_NO_PREFIX=abc.your-domain.com
export HOST=$TEST_BACKEND
export IMAGE_ID=ui-sdk-scenarios

```

Provide all necessary info in the `.env` file. You can find more information in the file `.env.template`.

For Tiger

-   SDK_BACKEND=TIGER
-   FIXTURE_TYPE=goodsales
-   CYPRESS_TEST_TAGS=post-merge_integrated_tiger
-   TIGER_API_TOKEN=

For Bear

-   SDK_BACKEND=BEAR
-   FIXTURE_TYPE=goodsales
-   CYPRESS_TEST_TAGS=post-merge_integrated_bear
-   USER_NAME=bear@gooddata.com
-   PASSWORD=
-   AUTH_TOKEN=

Add FILTER env variable with test file name to run and CYPRESS_TEST_TAGS env var to specify a comma-separated list of tags to run.

### Reference workspace

The tests run against reference workspace that contains LDM, data, dashboards, insights and other metadata objects.
It's based on the fixture defined in FIXTURE_TYPE (`goodsales` if not defined) env variable and extended with metadata objects specific for KD tests.

Reference workspace can be created from fixture via `rushx create-ref-workspace`.
Update your reference workspace after each rebase with `rushx update-ref-workspace`.
Current workspace ID will be automatically added to the `.env` file as `TEST_WORKSPACE_ID`.

### Fixture export and update

The fixture is imported from the @gooddata/fixtures package.
When have a new change on dashboard, we should run `rushx export-fixture` to update metadata objects inserted into the fixture are located [here](./reference_workspace/fixtures).

## DEV Guide for isolated tests

### Running tests locally

To run the tests against a mock backend follow these steps:

-   Run `rushx prepare-recording-workspace-id` to update workspace_id in record mapping file to `.env`.
-   Run `rushx build-scenarios` to build the testing application. The application will run on port 9500.
-   Run `rushx run-isolated-local` to start isolated test with mock backend in local instance.

### Adding new test

-   In folder `cypres/integration` you can either create new folder for the tests you're writing. You can then add new `*.spec.ts` file into either this new folder or to suitable existing one.
-   In the `scenarios/src/components/Scenarios`, create new Scenario file and within the new file use the component you are about to test.
-   In the `scenarios/src/routes/ComponentResolver`, add the `ScenarioComponent` you just created with a new unique hash. Navigation component takes this hash as its parameter and navigates the application to matching component.
-   In the `.env` file, type the spec file name into `FILTER` variable, file name must be fully specified (e.g. dateFilter.spec.ts). This will keep all the recordings untouched and creates the recording for the new spec only.
-   Run command `rushx run-isolated-record` to create new recordings for tests.

### Test results

-   If tests fail, there are 3 ways how to check what happened:
    -   screenshots in `cypress/screenshots`
    -   videos in `cypress/videos`
    -   if you are running tests in record mode, then you can see all calls logged in `recording/mappings`

### Running things on Apple Silicon

test
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

### Run on docker

To run the tests locally, you would need to build the sdk and the scenarios against which the tests run and then run the tests, i.e.

```
rush build -t sdk-ui-tests-e2e && rushx build-scenarios && \
    docker build --file Dockerfile_local -t $IMAGE_ID . && \
    docker-compose -f docker-compose-integrated.yaml up \
        --force-recreate --always-recreate-deps --renew-anon-volumes \
        --exit-code-from integrated-tests --abort-on-container-exit
```

To debug tests in visual mode, you need to first build the scenarios and start them in docker compose

```
rush build -t sdk-ui-tests-e2e && rushx build-scenarios && \
    docker build --file Dockerfile_local -t $IMAGE_ID . && \
    docker-compose -f docker-compose-integrated.yaml up \
        --force-recreate --always-recreate-deps --renew-anon-volumes gooddata-ui-sdk-scenarios
```

and run with (by default runs in visual mode)

```
$ CYPRESS_HOST=http://localhost:9500 rushx run-integrated
```

### Run on live backend with Cypress visual mode

```
$ rushx create-ref-workspace
$ rushx build-scenarios
$ rushx start-scenarios
$ CYPRESS_HOST=http://localhost:9500 rushx run-integrated
```

### Parallelization

By default, cypress is running in serial mode. To enable parallelization, [Currents](https://currents.dev/readme/getting-started/you-first-cypress-run) is integrated into cypress.
To use Currents, `RUN_PARALLEL` must be set to `true` and following environemnts must be set

```
export CURRENTS_PROJECT_ID
export CYPRESS_RECORD_KEY
export CURRENTS_CI_BUILD_ID
```

-   `CURRENTS_PROJECT_ID` is unique for each UI-app respository, for development purpose is `6DJDTB`
-   `CYPRESS_RECORD_KEY` key/token to access currents project, stored in `secret/v2/data-special/cypress-parallel-record-key`
-   `CURRENTS_CI_BUILD_ID` unique ID for each currents run. All cypress executions that involve in the same currents run must have the same `CURRENTS_CI_BUILD_ID`

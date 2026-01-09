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

- FIXTURE_TYPE=goodsales
- CYPRESS_TEST_TAGS=checklist_integrated_tiger_fe
- TIGER_API_TOKEN=

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

- Run `rushx prepare-recording-workspace-id` to update workspace_id in record mapping file to `.env`.
- Run `rushx build-scenarios` to build the testing application. The application will run on port 9500.
- Run `rushx run-isolated-local` to start isolated test with mock backend in local instance.

### Adding new test

- In folder `cypres/integration` you can either create new folder for the tests you're writing. You can then add new `*.spec.ts` file into either this new folder or to suitable existing one.
- In the `scenarios/src/components/Scenarios`, create new Scenario file and within the new file use the component you are about to test.
- In the `scenarios/src/routes/ComponentResolver`, add the `ScenarioComponent` you just created with a new unique hash. Navigation component takes this hash as its parameter and navigates the application to matching component.
- In the `.env` file, type the spec file name into `FILTER` variable, file name must be fully specified (e.g. dateFilter.spec.ts). This will keep all the recordings untouched and creates the recording for the new spec only.
- Run command `rushx run-isolated-record` to create new recordings for tests.

### Test results

- If tests fail, there are 3 ways how to check what happened:
    - screenshots in `cypress/screenshots`
    - videos in `cypress/videos`
    - if you are running tests in record mode, then you can see all calls logged in `recording/mappings`

### Run tests against wiremock backend with live Cypress controls (tests are importing their recorded mapping files)

Good for debugging the tooling when tests are passing with live backend but fail on CI.
Runs Cypress, Scenarios, and Wiremock separately in Docker.

- Start recorded backend `npm run local-dev-wiremock` (add `--verbose` param for debugging)
- Start Scenarios `npm run run-scenarios-local`
- Run Cypress `npm run local-dev-test-visual-recordings`

_Note:_ this approach allows running only a single test at a time.
Mappings are imported to wiremock for this particular test only and only this test is visible in cypress live controls.

See `run_local_dev_isolated.js` for configuration options.

### Previewing scenarios locally

The `TIGER_API_TOKEN` is not bundled into the scenarios and it's provided by the cypress when it runs.
To preview the examples running locally on http://localhost:9500 you need to provide the token using one of the following methods

- Use modheader browser extension and add `Authorization` header with `Bearer <API_TOKEN>` (replace `<API_TOKEN>` with your token)
  Make sure you filter requests to http://localhost:9500 so that your token is not leaked to every site you visit.

- Comment out `process.env.TIGER_API_TOKEN=""` line in scenarios/webpack_config.cjs and build the
  scenarios with `rushx build-scenarios`. The token would get bundled there.

Finally run `rushx start-scenarios`

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

### Tips for running the scenarios app without Cypress

1. TIGER_API_TOKEN provided in `.env` file.

2. Ensure HOST is provided from the `.env` file.

3. Basic working `.env` file can look like this. Other params may cause cross issues, so beware.

```
HOST=https://staging.dev-latest.stg11.panther.intgdc.com
TIGER_API_TOKEN=<token>
FIXTURE_TYPE=goodsales
TIGER_DATASOURCES_NAME=vertica_staging-goodsales
VISUAL_MODE=true
CYPRESS_TEST_TAGS=pre-merge_isolated_tiger_fe
FILTER=
```

4. Provide the Tiger token and run the scenarios app:

    ```
    rushx start-scenarios
    ```

5. In your browser, specify the scenario you want to view as a variable:

    ```
    http://localhost:9500/gooddata-ui-sdk?scenario=dashboard/dashboard
    ```

    A list of scenarios can be found [here](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-ui-tests-e2e/scenarios/src/routes/ComponentResolver.tsx#L294).

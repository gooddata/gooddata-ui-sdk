# SDK End-to-end tests

This project contains End-to-End tests for GoodData.UI components.

The scenarios application that these tests run against lives in [`../sdk-ui-tests-app`](../sdk-ui-tests-app).

## Overview

Tests verify various go-through scenarios for GoodData.UI components using [Playwright](https://playwright.dev/).
There are two categories of tests: isolated and integrated. Isolated tests run against recorded backend responses (via GoodMock), whereas integrated tests run against a live backend. Both test types now run in the pre-merge phase.

## Running E2E tests locally

Tests are invoked via npm scripts backed by `scripts/local/run.sh`.

### Script format

```
npm run e2e:{test_type}:{environment}[:{mode}] [-- [--ui] [--headed]]
```

| Argument      | Values                      | Description                                                                                                                                                |
| ------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test_type`   | `isolated`, `integrated`    | `isolated` uses GoodMock (pre-merge tests), `integrated` hits a live backend directly (post-merge tests)                                                   |
| `environment` | `docker`, `local`           | `local` runs Playwright natively against a dev server. `docker` runs everything in Docker containers.                                                      |
| `mode`        | `replay`, `record`, `proxy` | Only for `isolated`. `replay` = GoodMock replays recorded responses, `record` = GoodMock proxies and records, `proxy` = GoodMock proxies without recording |

### Available scripts

| Script                       | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| `e2e:isolated:local:replay`  | Replay pre-recorded API responses via GoodMock       |
| `e2e:isolated:local:record`  | Proxy to live backend, record responses via GoodMock |
| `e2e:isolated:local:proxy`   | Proxy to live backend via GoodMock, no recording     |
| `e2e:isolated:docker:replay` | Run isolated replay tests in Docker                  |
| `e2e:isolated:docker:record` | Run isolated record tests in Docker                  |
| `e2e:integrated:local`       | Run integrated tests against a live app              |
| `e2e:integrated:docker`      | Run integrated tests in Docker                       |

### Flags

Pass flags after `--`:

```bash
npm run e2e:isolated:local:replay -- --ui         # Opens Playwright UI mode
npm run e2e:integrated:local -- --headed           # Runs tests in headed browser
npm run e2e:isolated:local:replay -- --ui --headed
```

### Prerequisites

#### All local modes

- The scenarios app must be running (e.g. `rushx dev` in `../sdk-ui-tests-app`)
- Build first if needed: `rush build -t sdk-ui-tests-app`

#### Isolated: replay (local)

- GoodMock binary is installed automatically
- The scenarios app's `BACKEND_URL` must point to `http://localhost:8080`
- The scenarios app's `TEST_WORKSPACE_ID` must point to the static recorded workspace id (defined in `recordings_workspace.json` in `@gooddata/sdk-ui-tests-reference-workspace`)
- Recorded mappings must exist
- `PLAYWRIGHT_GREP` is set to `@pre-merge-isolated`

#### Isolated: record (local)

- GoodMock binary is installed automatically
- The scenarios app's `BACKEND_URL` must point to `http://localhost:8080`
- The scenarios app's `TEST_WORKSPACE_ID` must point to the workspace we record from
- `HOST` must be set in `.env` (the live backend to record from)
- `TIGER_API_TOKEN` must be set in `.env`
- `TEST_WORKSPACE_ID` must be set in `.env`, matching the `TEST_WORKSPACE_ID` in the scenarios app

#### Isolated: proxy (local)

- The scenarios app's Vite proxy handles backend routing (no GoodMock)
- The scenarios app's `BACKEND_URL` (point to real backend) and `TIGER_API_TOKEN` and `TEST_WORKSPACE_ID` must be set there in `.env`
- `HOST` and `TIGER_API_TOKEN` must be set in `.env`
- `TEST_WORKSPACE_ID` must be set in `.env`, matching the `TEST_WORKSPACE_ID` in the scenarios app

#### Integrated (local)

- Scenarios app's `BACKEND_URL`, `TIGER_API_TOKEN`, and `TEST_WORKSPACE_ID` must be set there in `.env`
- `HOST` must point to locally running scenarios (e.g. `http://localhost:9500`) and `PLAYWRIGHT_GREP` must be set in `.env` (e.g. `@pre-merge-integrated`)

#### Docker modes

- Docker and Docker Compose must be installed
- `.env` file is sourced automatically if present
- `HOST` must be set correctly in .env to perform recording from, as well as `TEST_WORKSPACE_ID` and `TIGER_API_TOKEN`
- Make sure to set `PLAYWRIGHT_GREP` accordingly in `.env` (@pre-merge-isolated, @pre-merge-integrated)
- The scenarios app Docker image is built automatically unless `IMAGE_ID` is set
- In `gdc-ui` monorepo, the `-gdcui` compose variants are auto-detected; in standalone SDK, the standard compose files are used

### Example workflow (isolated replay, local)

```bash
cd sdk/libs/sdk-ui-tests-e2e

# 1. Start the scenarios app in dev mode (in another terminal)
#    Ensure BACKEND_URL=http://localhost:8080 in ../sdk-ui-tests-app/.env
cd ../sdk-ui-tests-app && rushx dev

# 2. Run tests
npm run e2e:isolated:local:replay -- --ui
```

### Example workflow (isolated replay, docker)

```bash
cd sdk/libs/sdk-ui-tests-e2e

# Builds the scenarios app image and runs tests in Docker
npm run e2e:isolated:docker:replay
```

### Example workflow (integrated, local)

```bash
cd sdk/libs/sdk-ui-tests-e2e

# 1. Ensure .env has HOST, TIGER_API_TOKEN, TEST_WORKSPACE_ID, and PLAYWRIGHT_GREP
#    Run create-ref-workspace in ../sdk-ui-tests-reference-workspace if TEST_WORKSPACE_ID is missing

# 2. Start the scenarios app in dev mode (in another terminal)

# 3. Run tests
npm run e2e:integrated:local -- --headed --ui
```

## Setup ENV variables

Copy `.env.template` to `.env` and fill in the values.

> **Important:** Do not keep comments on the same line as values, and do not use spaces around `=`.

1. Set `HOST` to your Tiger instance URL
2. Set `TIGER_API_TOKEN` for authentication
3. Set `FIXTURE_TYPE` to specify fixture used for workspace creation
4. Set `TIGER_DATASOURCES_NAME` to specify data source to provide data for workspace

Most tests use the goodsales fixture:

```
FIXTURE_TYPE=goodsales
TIGER_DATASOURCES_NAME=vertica_staging-goodsales
```

## Reference workspace

The tests run against a reference workspace that contains LDM, data, dashboards, insights and other metadata objects.
It's based on the fixture defined in `FIXTURE_TYPE` (`goodsales` if not defined) env variable and extended with metadata objects specific for tests.

Reference workspace management is handled by the `@gooddata/sdk-ui-tests-reference-workspace` package.
Create the workspace from fixture via `rushx create-ref-workspace` in that package.
Update your reference workspace after each rebase with `rushx update-ref-workspace`.
Current workspace ID will be automatically added to the `.env` file as `TEST_WORKSPACE_ID`.

### Fixture export and update

The fixture is imported from the `@gooddata/fixtures` package.
When you have a new change on dashboard, run `rushx export-fixture` in the `sdk-ui-tests-reference-workspace` package to update metadata objects.

## DEV Guide for isolated tests

### Adding new test

- In `playwright/tests/` create a new `*.spec.ts` file in an appropriate folder.
- In `../sdk-ui-tests-app/src/components/Scenarios`, create a new Scenario file using the component you are about to test.
- In `../sdk-ui-tests-app/src/routes/ComponentResolver`, add the `ScenarioComponent` with a new unique hash.
- In the `.env` file, set the `FILTER` variable to your spec file name (e.g. `dateFilter.spec.ts`). This keeps all existing recordings untouched and creates recordings for the new spec only.
- Run `npm run e2e:isolated:local:record` to create new recordings for tests.

### Previewing scenarios locally

The `TIGER_API_TOKEN` is not bundled into the scenarios and it's provided by Playwright when it runs.
To preview the examples running locally on http://localhost:9500 you need to provide the token using one of the following methods:

- Use modheader browser extension and add `Authorization` header with `Bearer <API_TOKEN>` (replace `<API_TOKEN>` with your token).
  Make sure you filter requests to http://localhost:9500 so that your token is not leaked to every site you visit.

## Tips for running the scenarios app without tests

See the [sdk-ui-tests-app README](../sdk-ui-tests-app/README.md) for instructions on running the scenarios app standalone.

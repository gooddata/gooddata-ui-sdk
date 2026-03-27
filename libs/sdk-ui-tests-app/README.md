# SDK UI Tests App

This project contains the scenarios application for GoodData.UI components.

## Installation

Run all commands in this directory. Run `nvm use` to select the right version of Node.js. Install local dependencies with `rush install` and `rush build -t sdk-ui-tests-app`.

## Running the app locally

1. Create a `.env` file with the following:

```
BACKEND_URL=https://staging.dev-latest.stg11.panther.intgdc.com
TEST_WORKSPACE_ID=<your workspace id>
TIGER_API_TOKEN=<token>
```

`BACKEND_URL` and `TEST_WORKSPACE_ID` are required in dev mode. `TIGER_API_TOKEN` is used for authentication.

2. Run the app in dev mode:

    ```
    rushx dev
    ```

3. In your browser, specify the scenario you want to view:

    ```
    http://localhost:9500/gooddata-ui-sdk?scenario=dashboard/dashboard
    ```

### Reference workspace

The app runs against a reference workspace that contains LDM, data, dashboards, insights and other metadata objects.
It's based on the fixture defined in FIXTURE_TYPE (`goodsales` if not defined) env variable and extended with metadata objects specific for tests.

Reference workspace management is handled by the `@gooddata/sdk-ui-tests-reference-workspace` package.
Create the workspace from fixture via `rushx create-ref-workspace` in that package.
Update your reference workspace after each rebase with `rushx update-ref-workspace`.
Current workspace ID will be automatically added to the `.env` file as `TEST_WORKSPACE_ID`.

### Fixture export and update

The fixture is imported from the `@gooddata/fixtures` package.
When you have a new change on dashboard, run `rushx export-fixture` in the `sdk-ui-tests-reference-workspace` package to update metadata objects.

## Production build

`rush build` produces the production bundle in `dist/`. The bundle is built without environment-specific values baked in — `WORKSPACE_ID` is injected at container runtime.

### Runtime configuration

In production builds, the HTML includes a `<script src="./config.js"></script>` tag (injected by a Vite plugin). The Docker entrypoint (`scripts/docker-entrypoint.sh`) generates `config.js` from the `WORKSPACE_ID` environment variable at container startup. This allows the same Docker image to be reused across environments without rebuilding:

```bash
npm run dist && npm run pack-build
docker build -t sdk-ui-tests-app .
docker run -e WORKSPACE_ID=<your-workspace-id> -p 9500:9500 sdk-ui-tests-app
```

### CI flow

The CI shell scripts (`run_cypress_isolated_tests.sh`, `run_cypress_integrated_tests.sh`, `run_cypress_recording.sh`) export `WORKSPACE_ID` and run `pack-build` to create `sdk.tgz` for the Docker image. The workspace ID is passed to the container via docker-compose environment variables.

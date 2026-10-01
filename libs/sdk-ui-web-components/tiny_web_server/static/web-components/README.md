# Web Components Test Files

This directory contains the HTML test file for web components tests with Playwright.

## Files

- `dashboard-test.html` - Test file for `<gd-dashboard>` component

## Usage

This HTML file is served by `tiny_web_server` (see [`../../README.md`](../../README.md)) for local testing. The Playwright suite in `e2e/sdk-ui-web-components-e2e` uses its own copy in `e2e/sdk-ui-web-components-e2e/static/web-components/`.

The configuration (host, workspace ID, dashboard ID) is injected by the Playwright test (`page.addInitScript`) before the page loads. Without it, the page falls back to `config.js`, which `tiny_web_server` generates on startup from `.env` / environment variables (`HOST`, `TEST_WORKSPACE_ID`, `TEST_DASHBOARD_ID`). Playwright-injected config takes priority.

## Configuration

The test file expects a `window.__WC_TEST_CONFIG__` object with the following properties:

```javascript
{
    host: string,           // GoodData server URL - ALWAYS from environment variables (HOST)
    workspaceId: string,   // Workspace ID - ALWAYS from environment variables (TEST_WORKSPACE_ID)
    dashboardId?: string,  // Dashboard ID - Defined in test spec (falls back to a hard-coded ID)
    auth?: string,         // Authentication method ("sso")
    locale?: string,       // Locale (e.g., "en-US", "cs-CZ")
    readonly?: boolean     // Readonly mode for dashboard
}
```

**Important:**

- `host` and `workspaceId` are **always** taken from environment variables (via `BACKEND_HOST` and `getWorkspaceId()` from `@gooddata/sdk-e2e-utils`)
- `dashboardId` is **defined in the test spec** file

## Running Tests

1. Start `tiny_web_server` (manual testing of this page):

    ```bash
    cd sdk/libs/sdk-ui-web-components/tiny_web_server
    go run .
    ```

    Then open `https://localhost:3001/web-components/dashboard-test.html`.

2. Run Playwright tests (requires `IMAGE_URL`, `E2E_IMAGE_URL`, `HOST`, `TIGER_API_TOKEN` and `TEST_WORKSPACE_ID`):
    ```bash
    cd e2e/sdk-ui-web-components-e2e
    docker compose -f docker-compose.yaml up --abort-on-container-exit --exit-code-from e2e-tests
    ```

Or run specific test file:

```bash
cd e2e/sdk-ui-web-components-e2e
FILTER=webComponentDashboard.spec.ts docker compose -f docker-compose.yaml up --abort-on-container-exit --exit-code-from e2e-tests
```

## Test Files Location

- Playwright test for dashboard rendering: `e2e/sdk-ui-web-components-e2e/playwright/tests/webComponentDashboard.spec.ts`
- Helper utilities: `e2e/sdk-ui-web-components-e2e/playwright/helpers/web-component-dashboard.ts`

## tiny_web_server Setup

**Important:** `tiny_web_server` must be running before opening this page locally. It serves the HTML file on `https://localhost:3001` and is required for ES module imports to work correctly.

The `tiny_web_server`:

- Runs on port 3001 (HTTPS, self-signed certificate)
- Serves static files from `tiny_web_server/static/` directory
- Required for web component tests because ES modules cannot be loaded from `data:` URLs or `file://` protocol

To start `tiny_web_server`:

```bash
cd sdk/libs/sdk-ui-web-components/tiny_web_server
go run .
```

In the integrated Playwright run, the harness is served by the `application` sidecar (production nginx image) on `http://application:8080` instead. When `BASE_URL` is unset or equal to `HOST` (smoke/release), Playwright starts `tiny_web_server` automatically via its `webServer` config.

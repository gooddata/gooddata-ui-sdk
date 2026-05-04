# Web Components Test Files

This directory contains HTML test files for automating web components tests with Cypress.

## Files

- `dashboard-test.html` - Test file for `<gd-dashboard>` component
- `insight-test.html` - Test file for `<gd-insight>` component

## Usage

These HTML files are served by SimpleWebserver and accessed via Cypress tests. The configuration (host, workspace ID, dashboard/insight ID) is injected dynamically by Cypress before the page loads.

## Configuration

The test files expect a `window.__WC_TEST_CONFIG__` object with the following properties:

```javascript
{
    host: string,           // GoodData server URL - ALWAYS from environment variables (getHost())
    workspaceId: string,   // Workspace ID - ALWAYS from environment variables (getWorkspaceID())
    dashboardId?: string,  // Dashboard ID - Defined in test spec (for dashboard-test.html)
    insightId?: string,    // Insight ID - Defined in test spec (for insight-test.html)
    auth?: string,         // Authentication method (default: "sso")
    locale?: string,       // Locale (e.g., "en-US", "cs-CZ")
    readonly?: boolean     // Readonly mode for dashboard
}
```

**Important:**

- `host` and `workspaceId` are **always** taken from environment variables (via `getHost()` and `getWorkspaceID()` from `gdc-e2e-utils`)
- `dashboardId` and `insightId` are **defined in the test spec** files

## Running Tests

1. Start SimpleWebserver:

    ```bash
    cd e2e/gdc-dashboards-e2e
    npm run start-simple-web-server
    ```

2. Run Cypress tests:
    ```bash
    npm run run-integrated
    ```

Or run specific test file:

```bash
cd e2e/gdc-dashboards-e2e
rushx test --spec "cypress/integration/webComponentDashboard.spec.ts"
# or
rushx test --spec "cypress/integration/webComponents.spec.ts"
```

## Test Files Location

- Cypress test for dashboard rendering: `e2e/gdc-dashboards-e2e/cypress/integration/webComponentDashboard.spec.ts`
- Cypress test (general): `e2e/gdc-dashboards-e2e/cypress/integration/webComponents.spec.ts`
- Helper utilities: `e2e/gdc-dashboards-e2e/cypress/support/utils/webComponentHelper.ts`

## SimpleWebserver Setup

**Important:** SimpleWebserver must be running before executing web component tests. It serves the HTML files on `https://localhost:3001` and is required for ES module imports to work correctly.

The SimpleWebserver:

- Runs on port 3001 (HTTPS)
- Serves static files from `SimpleWebserver/static/` directory
- Required for web component tests because ES modules cannot be loaded from `data:` URLs or `file://` protocol

To start SimpleWebserver:

```bash
cd e2e/gdc-dashboards-e2e
npm run start-simple-web-server
```

The server will start automatically when running integrated tests via `npm run run-integrated-with-plugins-server`.

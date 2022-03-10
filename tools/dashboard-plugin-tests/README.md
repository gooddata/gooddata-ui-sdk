# Dashboard plugins tests

Repository for e2e testing of the dashboard plugin APIs.

## Directory structure

-   `./plugins` - Dashboard plugins covering various parts of dashboard plugin APIs with specific dependency versions. Working with plugins is business as usual.
-   `./plugins-loader` - Minimalist dashboard-loader in adaptive mode with full module federation setup. Dashboard, linked plugin(s) and their link(s) are configured from the test.
-   `./nginx` - Nginx server configuration. It is serving the dashboard-loader application as well as the plugins.
-   `./md` - Catalog export for metadata objects that can be used in tests.
-   `./cypress` - Cypress tests.
-   `./recordings` - Wiremock recordings, so tests don't have to run agains the real backend
-   `./scripts` - Bash and node scripts for building and running the tests.

## Getting started

### 1/ Setup enviroment variables

Before running or writing tests, ensure that you set your username and password in `.env` file in the root folder. You can create it from the `.env.template` file.

### 2/ Install and build plugins and plugins-loader

`npm run build`

### 3/ Run local nginx server

`npm run run-plugins-local`

### 4/ Run cypress tests

-   For running tests with full cypress experience: `npm run cypress`
-   For running tests against wiremock recordings: `npm run run-isolated-local`

### 5/ Test results

-   If tests fail, there are 3 ways how to check what happened:
    -   screenshots in `cypress/screenshots`
    -   videos in `cypress/videos`
    -   if you are running tests in record mode, then you can see all calls logged in `recording/mappings`

## Adding a new plugin for testing

### 1/ Initialize new plugin

In `./plugins` folder, use plugin toolkit cli to create a new plugin - `npx @gooddata/plugin-toolkit dashboard-plugin init my-new-test-plugin` or `npx @gooddata/plugin-toolkit@{REPLACE_WITH_SPECIFIC_SDK_VERSION} dashboard-plugin init my-new-test-plugin` to add a new plugin with particular sdk version.

### 1/ Prepare it for the tests

Import and add `withDashboardPluginTestEventHandling(handlers)` to register function of the plugin to propagate events from the plugin to the tests.
This is important, because events incoming from the plugin are used to detect that dashboard is fully loaded and rendered, and tests can start!

## Adding a new test

### 1/ Add new spec file

In folder `./cypres/integration` you can either create new folder for the tests you're writing. You can then add new `*.spec.ts` file into either this new folder or to suitable existing one.

### 2/ Setup dashboard, plugin(s) and plugin link(s) for the test

```
beforeEach(() => {
    cy.login();

    // Modify according to your needs.
    // Don't forget to replace "my-new-test-plugin" with the target plugin name.
    const TEST_PLUGIN = newTestPlugin("my-new-test-plugin");
    withTestConfig({
        dashboardId: Md.Dashboards.DashboardWithPlugin,
        plugins: [TEST_PLUGIN],
        links: [newTestPluginLink(TEST_PLUGIN, "plugin-parameters")],
    });
});
```

### 3/ Create recordings for the new test

-   In the `.env` file, type the spec file name into `FILTER` variable. This will keep all the recordings untouched and creates the recording for the new spec only.
-   Build plugins with `npm run build-plugins`.
-   Start local nginx server with `npm run run-plugins-local`.
-   Create new recordings with `npm run run-isolated-record`.

## Refresh metadata for the tests

Don't hardcode metadata object identifier(s) in the tests - if you needed to create new metadata object(s) for the test(s), run `npm run refresh-md` and access them from there.

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/dashboard-plugin-tests/LICENSE).

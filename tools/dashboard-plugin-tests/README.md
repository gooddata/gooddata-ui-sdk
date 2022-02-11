# Dashboard plugins tests

Repository for dashboard plugins API testing.
It consists of 3 parts:

-   App with minimal setup for dashboard-loader in adaptive mode with full module federation setup.
-   Simple node.js server that serves dashboard plugins and their assets
-   Cypress tests covering different parts of the dashboard plugins API
-   Recordings - TBD

## Directory structure

-   `/plugins` - Dashboard plugins covering specific areas of dashboard plugin APIs and dependency versions
-   `/src/app` - Simple app to load local test plugins
-   `/src/server` - Server to serve the app and plugins locally
-   `/src/plugins.ts` - Configuration of linkage between dashboards and local plugins
-   `/src/cypress/intergration` - Tests

## Local plugins

Because testing with full plugin deployment would be much more complex and slower,
there is a server to host the plugins locally, and they are linked to the dashboards via backend decorator.

#### Install local plugins

`npm run install-plugins`

#### Build local plugins

`npm run build-plugins`

## Test Modes

There are 3 modes that specify context in which you want to run tests - **live**, **capturing** and **recorded**.

Note: Before running the tests, ensure that you install and build local plugins.
You can do it by running `npm run prepare-plugins` command.

### Live Mode

In this mode, tests are running against live backend.
This mode is useful mainly when you are writing or debugging tests.

#### Run tests in live mode

`npm run cypress-live`

### Capturing Mode

In this mode, tests are running against live backend and cypress is capturing all the required data to run tests in recorded mode.
Use this mode after you write a new test, so it can run in recorded mode.

#### Run tests in capturing mode

`npm run cypress-capturing`

### Recorded Mode

In this mode, tests are running against recorded backend.
This is the main and fastest mode - use it every time you don't need to use 2 previous modes.

#### Run tests in recorded mode

`npm run cypress-recorded`

## Running tests in headless mode

TBD

## Adding a new test

TBD

## Adding a new plugin for testing

TBD

## Capturing and refreshing of the recordings

TBD

## License

(C) 2017-2022 GoodData Corporation

This project is under commercial license. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/tools/dashboard-plugin-tests/LICENSE).

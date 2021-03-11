# Analytical Backend SPI implementation for the GoodData Platform

## Testing

The testing strategy for the Bear backend consists of two parts and is designed to make testing efficient - taking
into the account the nature of the code: the bear backend is essentially a mapper to and from API requests and
responses. It is tightly coupled with the backend implementation and there are many functions and methods that
either interface directly with the client or work with complex structures returned by the client.

In this context, any efforts to manually write and maintain test fixtures and mocks would mean painful effort full
of mindless repetitive tasks.

### Unit tests

Use unit tests and typical means to create test fixtures for any crucial algorithms and functions that do not require
interaction with the backend and do not require mocking of server responses. Factor the important code into such
functions.

A good example for this are the tests for the `toAfmResultSpec` code - this particular conversion logic works with
simple types that are easy to mock.

In other words, use unit tests to verify that code sends correct requests to the backend.

### Integrated Tests

Use integrated tests to where mocking responses would be impractical. The integrated tests use Wiremock standalone
server to create and serve data recorded from the live backend. With this in place, you can focus on writing just
the tests and let the infrastructure handle the rest for you.

Use the integrated tests to verify code that transforms responses into domain objects as defined by the backend SPI
and for end-to-end verification of use cases exposed via the SPI.

### On use of Jest snapshots

When asserting that the conversion results match the expectations, use Jest snapshots instead of hardcoded objects.
Let the machine generate the right side of the equation > verify the snapshot > commit. This is all about efficiency, don't
spend time writing same thing that the infrastructure can create automatically.

## Wiremock and Integrated tests

This project uses [Wiremock](http://wiremock.org/docs/getting-started/) in standalone mode to create and serve recordings
of API interactions. Wiremock runs inside a Docker container. There is scripting support in [tests/wiremock](tests/wiremock)
and several of NPM scripts in the [package.json](package.json).

The scripts in `package.json` 'orchestrate' the typical tasks end to end - you should use these most of the time:

-   `integrated-test` - runs integrated tests in watch mode, tests work only with the recordings and are completely
    offline; this is useful you are adding new tests on top of existing SPI invocations
-   `refresh-recordings` - cleans up all the recordings, then runs all the integrated tests with the Wiremock server
    set up to record all interactions. Once done, the server is stopped and recordings flushed to disk.

> The `test` script runs just the unit tests located in the `src` directory. This is by choice - the integrated tests
> require an additional setup and node environment monkey-patching.

The `test-once` and `test-ci` scripts run both unit tests and integrated tests.

### Refreshing recordings

You can do this by running the `refresh-recordings` script. This will run all tests in all the integrated test suites
sequentially while the Wiremock will be running in recording mode, proxying calls to the live backend.

To obtain authentication credentials, integrated test backend uses `dotenv` which will load `.env` file with the
credentials. You must create the env file (ideally in this directory) and specify credentials using the GD_USERNAME
and GD_PASSWORD environment variables.

The `.env` file is included in the .gitignore. Recordings of login and token resources are both deleted and also
included in the .gitignore file

> Note: you do not need the `.env` file if you are just running the tests.

### Writing tests

Writing integrated tests is Jest business as usual. However focus on blackbox testing and exercise the
different SPI methods and make assertions. You can obtain an instance of IAnalyticalBackend implemented by bear
by using the `testBackend` function.

It is important to remember, that all test suites (test files) must include explicit authentication against
the bear backend - using the `backend.authenticate(true)`. Without this, the authentication will be triggered after
the first 401 response from the backend -> and this response will be recorded -> the recordings are then harder
to reason about and debug.

Here is snippet to include in the new test suites:

```typescript
import { testBackend } from "./backend";
const backend = testBackend();

beforeAll(async () => {
    await backend.authenticate(true);
});

// your tests
```

> Note: the authenticate call is noop when integrated tests run against recordings

## License

(C) 2020-2021 GoodData Corporation

This project is under MIT License. See [LICENSE](https://github.com/gooddata/gooddata-ui-sdk/blob/master/libs/sdk-backend-bear/LICENSE).

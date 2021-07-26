#!/usr/bin/env node

const createTestCafe = require("testcafe");

const LOCAL_CONCURRENCY = 4;
const ASSERTION_TIMEOUT = 15000;
const SELECTOR_TIMEOUT = 30000;
const WINDOW_WIDTH = 1920;
const WINDOW_HEIGHT = 1080;
// For some reason testcafe has problems using globstar so we need to specify
// maximum directory depth, otherwise it just picks up tests in the deepest directory.
const TESTS_PATH = "tests/**/**/**/*.spec.ts";

const CHROME_HEADLESS_LOCAL = `chrome:headless --window-size='${WINDOW_WIDTH},${WINDOW_HEIGHT}' --no-sandbox`;
const CHROME_LOCAL = `chrome --window-size='${WINDOW_WIDTH},${WINDOW_HEIGHT}' --no-sandbox --disable-background-timer-throttling`;

let testcafe = null;

createTestCafe("localhost")
    .then((tc) => {
        testcafe = tc;
        const runner = testcafe.createRunner();
        const mode = process.env.TEST_MODE;

        const runnerBase = runner.src([TESTS_PATH]);

        if (mode === "visual") {
            console.log("Starting TestCafe in visual-local mode without concurrency.");
            return runnerBase.browsers([CHROME_LOCAL]).run({
                assertionTimeout: ASSERTION_TIMEOUT,
                selectorTimeout: SELECTOR_TIMEOUT,
                debugOnFail: true,
            });
        }

        console.log(`Starting TestCafe in local mode with concurrency ${LOCAL_CONCURRENCY}.`);
        return runnerBase.browsers([CHROME_HEADLESS_LOCAL]).concurrency(LOCAL_CONCURRENCY).run({
            assertionTimeout: ASSERTION_TIMEOUT,
            selectorTimeout: SELECTOR_TIMEOUT,
        });
    })
    .then((failedCount) => {
        testcafe.close();
        if (failedCount > 0) {
            process.exit(1);
        }
    })
    .catch((e) => {
        console.error(e.message);
        testcafe.close();
        process.exit(1);
    });

#!/usr/bin/env node
// (C) 2021-2024 GoodData Corporation

/**
 * Run Integrated tests
 * This is useful to run tests against bear/tiger when you already have a project created.
 * It is run also from other scripts on ci.
 *
 * specify the params
 * - TEST_WORKSPACE_ID (mandatory)
 * - TEST_CHILD_WORKSPACE_ID (mandatory if FIXTURE_TYPE=goodsales)
 * - TIGER_API_TOKEN (mandatory)
 * - HOST (optional, defaults to https://localhost:8443)
 * - CYPRESS_TEST_TAGS comma separated list of tags without spaces (optional, defaults to "")
 * - FILTER (optional) filter tests by filename
 * - VISUAL_MODE true | false (optional, defaults to true)
 * - EXECUTION_ENV (optional, defaults to chrome) browser to run tests
 *
 * Note that you need to make sure that the file specified with FILTER
 * contains some tests with CYPRESS_TEST_TAGS
 *
 */
import "./env.js";
import { runCypress } from "./lib/cypress.js";

async function main() {
    try {
        const {
            TEST_WORKSPACE_ID,
            TEST_CHILD_WORKSPACE_ID,
            FIXTURE_TYPE,
            TIGER_DATASOURCES_NAME,
            TIGER_DATASOURCES_PASSWORD,
            TIGER_API_TOKEN_NAME_PREFIX,
            CYPRESS_HOST,
            EXECUTION_ENV,
        } = process.env;

        if (!TEST_WORKSPACE_ID) {
            process.stderr.write("Integrated tests need TEST_WORKSPACE_ID\n");
        }

        if (FIXTURE_TYPE === "goodsales" && !TEST_CHILD_WORKSPACE_ID) {
            process.stderr.write("Integrated tests need TEST_CHILD_WORKSPACE_ID\n");
        }

        const { TIGER_API_TOKEN } = process.env;
        if (!TIGER_API_TOKEN) {
            process.stderr.write(`Integrated tests for need TIGER_API_TOKEN\n`);
            process.exit(1);
        }

        const authorization = {
            token: TIGER_API_TOKEN,
        };

        // when running locally, it is sometimes useful to override the HOST param specified in the
        // .env with something else, like http://localhost:9500, so CYPRESS_HOST can be used
        let HOST = CYPRESS_HOST || process.env.HOST || "https://localhost:8443";

        const { VISUAL_MODE = "true", CYPRESS_TEST_TAGS, FILTER } = process.env;

        if (!HOST.startsWith("http")) {
            process.stdout.write(`Prepending https:// to ${HOST}\n`);
            HOST = `https://${HOST}`;
        }

        process.stdout.write(
            `Running integrated tests locally on ${HOST} with workspace ${TEST_WORKSPACE_ID} with VISUAL_MODE=${VISUAL_MODE}\n`,
        );

        let tagsFilter = [];
        if (CYPRESS_TEST_TAGS) {
            tagsFilter = CYPRESS_TEST_TAGS.split(",");
            process.stdout.write(`Filtering tests by tags: ${CYPRESS_TEST_TAGS}\n`);
        }

        const specFilesFilter = FILTER ? { specFilesFilter: FILTER.split(",") } : {};
        const isVisualMode = VISUAL_MODE === "true";
        const visualModeFilter = FILTER && isVisualMode ? `,specPattern=cypress/**/${FILTER}` : "";

        let config = `baseUrl=${HOST},defaultCommandTimeout=40000${visualModeFilter}`;
        if (EXECUTION_ENV === "firefox") {
            config += `,video=false`;
        }
        process.stdout.write(`Running on browser ${EXECUTION_ENV}\n`);

        const cypressProcess = runCypress({
            visual: isVisualMode,
            appHost: `${HOST}`,
            authorization,
            tagsFilter,
            workspaceId: TEST_WORKSPACE_ID,
            childWorkspaceId: TEST_CHILD_WORKSPACE_ID,
            tigerPermissionDatasourceName: TIGER_DATASOURCES_NAME,
            tigerPermissionDatasourcePassword: TIGER_DATASOURCES_PASSWORD,
            tigerApiTokenNamePrefix: TIGER_API_TOKEN_NAME_PREFIX,
            browser: EXECUTION_ENV ? EXECUTION_ENV : "chrome",
            config: config,
            ...specFilesFilter,
            customCypressConfig: {
                CYPRESS_INTEGRATION_FOLDER: "cypress/integration",
            },
        });

        cypressProcess.on("exit", async (e) => {
            process.exit(e);
        });
    } catch (e) {
        process.stderr.write(`${e.toString()}\n`);
        process.exit(1);
    }
}

main();

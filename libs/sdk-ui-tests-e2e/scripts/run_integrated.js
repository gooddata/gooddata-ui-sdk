#!/usr/bin/env node
// (C) 2021-2023 GoodData Corporation

/**
 * Run Integrated tests
 * This is useful to run tests against bear/tiger when you already have a project created.
 * It is run also from other scripts on ci.
 *
 * specify the backend platform type and test workspace id
 * - SDK_BACKEND BEAR | TIGER (mandatory)
 * - TEST_WORKSPACE_ID (mandatory)
 * - TEST_CHILD_WORKSPACE_ID (mandatory if SDK_BACKEND = TIGER and FIXTURE_TYPE=goodsales)
 * - USER_NAME, PASSWORD or TIGER_API_TOKEN (mandatory)
 * - HOST (optional, defaults to https://localhost:8443)
 * - CYPRESS_TEST_TAGS comma separated list of tags without spaces (optional, defaults to "")
 * - FILTER (optional) filter tests by filename
 * - VISUAL_MODE true | false (optional, defaults to true)
 *
 * Note that you need to make sure that the tests you choose by the tags can
 * run against the SDK_BACKEND you provide and also ensure that file specified with FILTER
 * contains some tests with CYPRESS_TEST_TAGS
 *
 */
import "./env.js";
import { runCypress } from "./lib/cypress.js";

async function main() {
    try {
        const {
            TEST_WORKSPACE_ID,
            SDK_BACKEND,
            TEST_CHILD_WORKSPACE_ID,
            FIXTURE_TYPE,
            TIGER_DATASOURCES_NAME,
            TIGER_DATASOURCES_PASSWORD,
            TIGER_API_TOKEN_NAME_PREFIX,
        } = process.env;

        if (!TEST_WORKSPACE_ID) {
            process.stderr.write("Integrated tests need TEST_WORKSPACE_ID\n");
        }

        if (!SDK_BACKEND) {
            process.stderr.write("Integrated tests need SDK_BACKEND\n");
            return;
        }

        let authorization = {};
        if (SDK_BACKEND === "BEAR") {
            const { USER_NAME, PASSWORD } = process.env;
            if (!USER_NAME || !PASSWORD) {
                process.stderr.write(
                    `Integrated tests for SDK_BACKEND=${SDK_BACKEND} need USER_NAME, PASSWORD\n`,
                );
                return;
            }

            authorization = { credentials: { userName: USER_NAME, password: PASSWORD } };
        }

        if (SDK_BACKEND === "TIGER") {
            if (FIXTURE_TYPE === "goodsales" && !TEST_CHILD_WORKSPACE_ID) {
                process.stderr.write("Integrated tests need TEST_CHILD_WORKSPACE_ID\n");
            }

            const { TIGER_API_TOKEN } = process.env;
            if (!TIGER_API_TOKEN) {
                process.stderr.write(
                    `Integrated tests for SDK_BACKEND=${SDK_BACKEND} need TIGER_API_TOKEN\n`,
                );
                process.exit(1);
            }

            authorization = {
                token: TIGER_API_TOKEN,
            };
        }

        let { HOST = "https://localhost:8443" } = process.env;

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
        const visualModeFilter = FILTER && isVisualMode ? `,specPattern=**/${FILTER}` : "";

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
            browser: "chrome",
            sdkBackend: SDK_BACKEND,
            config: `baseUrl=${HOST},defaultCommandTimeout=40000${visualModeFilter}`,
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

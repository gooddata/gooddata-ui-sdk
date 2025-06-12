#!/usr/bin/env node
// (C) 2021-2025 GoodData Corporation

/**
 * Run Isolated tests with local instance of Cypress
 * By default runs against local dev server.
 *
 * Config environment variables:
 * CYPRESS_TEST_TAGS (mandatory) comma-separated list of test tags to run from a specified file
 * FILTER (optional, mandatory when --with-recordings given) filename of a single test file to run
 *
 * Parameter --with-recordings makes it run against local Wiremock server and dockerized Scenarios app
 * and in this case:
 *    * wiremock server needs to be proxied correctly to given backend
 *    * authorization has to be provided to this script (TIGER_API_TOKEN)
 */

import "./env.js";
import { runCypress } from "./lib/cypress.js";
import { getRecordingsWorkspaceId } from "./lib/recordings.js";
import { wiremockReset } from "./lib/wiremock.js";

async function main() {
    const withRecordings = process.argv.indexOf("--with-recordings") !== -1;

    const updateSnapshots = process.argv.indexOf("--update-snapshots") !== -1;

    const host = "http://localhost:9500";
    const mockServer = withRecordings ? "localhost:8080" : undefined;

    const { TEST_WORKSPACE_ID, TEST_CHILD_WORKSPACE_ID, TIGER_API_TOKEN, FILTER, CYPRESS_TEST_TAGS } =
        process.env;

    if (!CYPRESS_TEST_TAGS) {
        process.stderr.write(
            "CYPRESS_TEST_TAGS need to be provided as a comma-separated (no spaces) list of test tags to run\n",
        );
        return;
    }

    let authorization = {};

    if (!withRecordings) {
        if (!TEST_WORKSPACE_ID) {
            process.stderr.write("Cypress running in proxy mode needs TEST_WORKSPACE_ID to be provided\n");
            return;
        }

        if (!TIGER_API_TOKEN) {
            process.stderr.write(
                "Cypress running in proxy mode needs TIGER_API_TOKEN specified in the .env file\n",
            );
            return;
        }
        authorization = {
            token: TIGER_API_TOKEN,
        };
    }

    const workspaceId = withRecordings ? getRecordingsWorkspaceId() : TEST_WORKSPACE_ID;
    process.stderr.write("Running the isolated tests locally\n");

    const childWorkspaceId = TEST_CHILD_WORKSPACE_ID;

    if (withRecordings) {
        await new Promise(() => {
            runCypress({
                visual: true,
                appHost: host,
                mockServer: mockServer,
                authorization,
                workspaceId,
                childWorkspaceId,
                tagsFilter: CYPRESS_TEST_TAGS.split(","),
                workingDir: "./",
                config: `baseUrl=${host},specPattern=cypress/**/${FILTER}`,
            });
        });
        await wiremockReset(mockServer);
    } else {
        runCypress({
            visual: true,
            appHost: host,
            mockServer: mockServer,
            authorization,
            workspaceId,
            childWorkspaceId,
            updateSnapshots,
            tagsFilter: CYPRESS_TEST_TAGS.split(","),
            workingDir: "./",
            config: `baseUrl=${host}`,
        });
    }
}

main();

#!/usr/bin/env node
// (C) 2021-2025 GoodData Corporation
/* eslint-disable sonarjs/cognitive-complexity */

/**
 * This file is supposed to run within the Cypress container.
 * It controls the execution of the isolated tests in docker-compose
 */
import { execSync } from "child_process";

import "./env.js";
import { runCypress } from "./lib/cypress.js";
import { getRecordingsWorkspaceId, recordingsPresent } from "./lib/recordings.js";
import { wiremockSettings, wiremockWait } from "./lib/wiremock.js";

const wiremockHost = "backend-mock:8080";

async function main() {
    try {
        process.stderr.write("Running the isolated tests. Run only in docker-compose\n");
        const recording = process.argv.indexOf("--record") !== -1;
        const {
            TIGER_API_TOKEN,
            TEST_WORKSPACE_ID,
            HOST,
            CYPRESS_HOST,
            CYPRESS_TEST_TAGS,
            ZUUL_PIPELINE,
            FILTER,
            COMMIT_INFO_MESSAGE,
        } = process.env;

        // eslint-disable-next-line no-console
        console.log("ZUUL_PIPELINE:", ZUUL_PIPELINE, "COMMIT_INFO_MESSAGE:", COMMIT_INFO_MESSAGE);

        const specFilesFilter = FILTER
            ? { specFilesFilter: FILTER.split(",").map((x) => (x.endsWith(".spec.ts") ? x : x + ".spec.ts")) }
            : {};

        if (!CYPRESS_TEST_TAGS) {
            process.stderr.write("Isolated tests need CYPRESS_TEST_TAGS\n");
            process.exit(1);
        }

        let authorization = {};
        if (recording) {
            if (!TIGER_API_TOKEN || !TEST_WORKSPACE_ID) {
                process.stderr.write(
                    `Isolated tests recordings need TIGER_API_TOKEN and TEST_WORKSPACE_ID\n`,
                );
                process.exit(1);
            }

            authorization = {
                token: TIGER_API_TOKEN,
            };
        }

        if (!recording && !recordingsPresent()) {
            process.stderr.write("Recordings are missing. Run again with the --record parameter.\n");
            process.exit(0);
        }

        process.stdout.write("Waiting for Wiremock\n");
        await wiremockWait(wiremockHost);
        process.stdout.write("Wiremock ready\n");

        await wiremockSettings(wiremockHost);

        let testWorkspaceId = TEST_WORKSPACE_ID;
        if (!recording) {
            testWorkspaceId = getRecordingsWorkspaceId();
        }

        execSync(`rm -rf ./cypress/results`);

        const testTags = CYPRESS_TEST_TAGS.split(",");
        let cypressExitCode = 0;
        cypressExitCode += await new Promise((resolve) => {
            const cypressProcess = runCypress({
                visual: false,
                appHost: CYPRESS_HOST,
                backendHost: HOST,
                mockServer: wiremockHost,
                authorization,
                ...specFilesFilter,
                workspaceId: testWorkspaceId,
                tagsFilter: testTags,
                config: `retries=0,baseUrl=${CYPRESS_HOST}`, // override cypress.json and have no retries when recording, this breaks mappings storage,
                deleteCypressResults: false,
                recording: recording || false,
            });
            cypressProcess.on("exit", async (exitCode) => {
                resolve(exitCode);
            });
        });

        process.exit(cypressExitCode);
    } catch (e) {
        process.stderr.write(`${e.toString()}\n`);
        process.exit(e);
    }
}

main();

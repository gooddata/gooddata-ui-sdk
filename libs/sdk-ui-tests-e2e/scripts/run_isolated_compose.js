#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

/**
 * This file is supposed to run within the Cypress container.
 * It controls the execution of the isolated tests in docker-compose
 */
import { execSync } from "child_process";
import { getAllFiles } from "./getSpecFiles.js";
import fs from "fs";
import path from "path";

import "./env.js";

import {
    wiremockExportMappings,
    wiremockReset,
    wiremockImportMappings,
    wiremockStartRecording,
    wiremockStopRecording,
    wiremockSettings,
    wiremockMockLogRequests,
    wiremockWait,
} from "./lib/wiremock.js";
import {
    deleteRecordings,
    getRecordingsWorkspaceId,
    recordingsPresent,
    sanitizeCredentials,
    sanitizeWorkspaceId,
    fileContainsString,
} from "./lib/recordings.js";
import { runCypress } from "./lib/cypress.js";

const wiremockHost = "backend-mock:8080";

async function main() {
    try {
        process.stderr.write("Running the isolated tests. Run only in docker-compose\n");

        const recording = process.argv.indexOf("--record") !== -1;
        const {
            SDK_BACKEND,
            USER_NAME,
            PASSWORD,
            TIGER_API_TOKEN,
            TEST_WORKSPACE_ID,
            HOST,
            CYPRESS_HOST,
            CYPRESS_TEST_TAGS,
            ZUUL_PIPELINE,
            FILTER,
        } = process.env;
        const specFilesFilter = FILTER
            ? { specFilesFilter: FILTER.split(",").map((x) => (x.endsWith(".spec.ts") ? x : x + ".spec.ts")) }
            : {};

        if (!CYPRESS_TEST_TAGS) {
            process.stderr.write("Isolated tests need CYPRESS_TEST_TAGS\n");
            process.exit(1);
        }

        let authorization = {};
        if (SDK_BACKEND === "BEAR") {
            if (recording) {
                if (!USER_NAME || !PASSWORD || !TEST_WORKSPACE_ID || !HOST) {
                    process.stderr.write(
                        `Isolated tests recordings for ${SDK_BACKEND} need HOST, USER_NAME, PASSWORD, and TEST_WORKSPACE_ID\n`,
                    );
                    process.exit(1);
                }

                authorization = {
                    credentials: {
                        userName: USER_NAME,
                        password: PASSWORD,
                    },
                };
            }
        }

        if (SDK_BACKEND === "TIGER") {
            if (recording) {
                if (!TIGER_API_TOKEN || !TEST_WORKSPACE_ID) {
                    process.stderr.write(
                        `Isolated tests recordings for ${SDK_BACKEND} need TIGER_API_TOKEN and TEST_WORKSPACE_ID\n`,
                    );
                    process.exit(1);
                }

                authorization = {
                    token: TIGER_API_TOKEN,
                };
            }
        }

        if (recording) {
            // deleteRecordings(specFilesFilter, SDK_BACKEND, CYPRESS_TEST_TAGS.split(","));
            // The whole recording dir will be purged anyway in scripts/run-cypress-recording-*.sh
        } else if (!recordingsPresent(SDK_BACKEND)) {
            process.stderr.write("Recordings are missing. Run again with the --record parameter.\n");
            process.exit(0);
        }

        process.stdout.write("Waiting for Wiremock\n");
        await wiremockWait(wiremockHost);
        process.stdout.write("Wiremock ready\n");

        await wiremockSettings(wiremockHost);

        let testWorkspaceId = TEST_WORKSPACE_ID;
        let recordingsWorkspaceId;
        if (recording) {
            recordingsWorkspaceId = getRecordingsWorkspaceId();
        } else {
            testWorkspaceId = getRecordingsWorkspaceId();
        }

        const TESTS_DIR = "./cypress/integration";
        const files = getAllFiles(TESTS_DIR, specFilesFilter.specFilesFilter);
        execSync(`rm -rf ./cypress/results`);

        if (!fs.existsSync(`./recordings/mappings/${SDK_BACKEND}`)) {
            execSync(`mkdir -p ./recordings/mappings/${SDK_BACKEND}`);
        }

        const testTags = CYPRESS_TEST_TAGS.split(",");
        let cypressExitCode = 0;
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let fileName = path.basename(file);
            process.stdout.write(`file: ${file} (${i + 1} of ${files.length})\n`);

            // skip if we have tags and the file does not contain at least one of the gats
            if (testTags.length && !fileContainsString(`${file}`, testTags)) {
                process.stdout.write(
                    `skip: ${file} as it does not contain requested tags (${CYPRESS_TEST_TAGS})\n`,
                );
                continue;
            }

            const currentTestFileMappings = `./recordings/mappings/${SDK_BACKEND}/mapping-${fileName}.json`;

            if (recording) {
                await wiremockStartRecording(wiremockHost, HOST);
            } else {
                await wiremockImportMappings(wiremockHost, currentTestFileMappings);
            }
            await wiremockMockLogRequests(wiremockHost);

            process.stdout.write(`sdk_backend ${SDK_BACKEND}, recording: ${recording}\n`);

            cypressExitCode += await new Promise((resolve) => {
                const cypressProcess = runCypress({
                    visual: false,
                    appHost: CYPRESS_HOST,
                    mockServer: wiremockHost,
                    authorization,
                    specFilesFilter: fileName,
                    workspaceId: testWorkspaceId,
                    tagsFilter: testTags,
                    config: recording ? "retries=0,baseUrl=http://gooddata-ui-sdk-scenarios:9500" : undefined, // override cypress.json and have no retries when recording, this breaks mappings storage,
                    sdkBackend: SDK_BACKEND,
                    deleteCypressResults: false,
                });

                cypressProcess.on("exit", async (exitCode) => {
                    if (recording) {
                        process.stdout.write(`starting wiremock mappings export for: ${file}\n`);
                        const result = await wiremockStopRecording(wiremockHost);
                        await wiremockExportMappings(currentTestFileMappings, result);
                    }

                    resolve(exitCode);
                });
            });
            await wiremockReset(wiremockHost);

            // This is to terminate tests sooner, when running in the gate pipeline (i.e. ONLY during merge)
            if (ZUUL_PIPELINE === "gate" && cypressExitCode) {
                process.stdout.write(
                    `Running in gate pipeline and a spec file failed. Skipping other tests and terminating now.\n`,
                );
                break;
            }
        }

        if (recording) {
            const testFileMappings = files.map(
                (file) => `./recordings/mappings/${SDK_BACKEND}/mapping-${path.basename(file)}.json`,
            );
            process.stdout.write(`Sanitizing mappings for: ${JSON.stringify(testFileMappings)}\n`);
            sanitizeCredentials(testFileMappings);
            sanitizeWorkspaceId(testWorkspaceId, recordingsWorkspaceId, testFileMappings);
        }

        // all done, create github report
        execSync(`node ./scripts/create_github_report.js`);
        process.exit(cypressExitCode);
    } catch (e) {
        process.stderr.write(`${e.toString()}\n`);
        process.exit(e);
    }
}

main();

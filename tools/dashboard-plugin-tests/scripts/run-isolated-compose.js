#!/usr/bin/env node
// (C) 2021 GoodData Corporation

/*
This file is supposed to run within the Cypress container, controlling the execution of the isolated tests in docker-compose
 */
const dotenv = require("dotenv");
const { execSync } = require("child_process");

const {
    wiremockStartRecording,
    wiremockStopRecording,
    wiremockMockLogRequests,
    wiremockWait,
    wiremockSettings,
    wiremockExportMappings,
    wiremockImportMappings,
    wiremockReset,
} = require("./wiremock.js");

const {
    deleteRecordings,
    getRecordingsWorkspaceId,
    recordingsPresent,
    sanitizeCredentials,
} = require("./recordings.js");
const { runCypress } = require("./cypress.js");
const { getAllFiles } = require("./get-spec-files.js");

const wiremockHost = "backend-mock:8080";

async function main() {
    try {
        process.stderr.write("Running the isolated tests. Run only in docker-compose\n");

        const recording = process.argv.indexOf("--record") != -1;
        const filterArg = process.argv.find((arg) => arg.indexOf("--filter") === 0);
        const specFilesFilter = filterArg ? filterArg.slice("--filter=".length) : "";

        dotenv.config({ path: ".env" });

        const { HOST, USER_NAME, PASSWORD, TEST_WORKSPACE_ID, CYPRESS_HOST } = process.env;

        if (recording && !HOST && !USER_NAME && !PASSWORD && !TEST_WORKSPACE_ID) {
            process.stderr.write(
                "For recording HOST, USER_NAME, PASSWORD, and TEST_WORKSPACE_ID has to be specified in the .env file\n",
            );
            process.exit(e);
        }

        if (recording) {
            deleteRecordings(specFilesFilter);
        } else if (!recordingsPresent()) {
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

        const authorization = recording
            ? {
                  credentials: {
                      userName: USER_NAME,
                      password: PASSWORD,
                  },
              }
            : {};

        const TESTS_DIR = "./cypress/integration/";

        const files = getAllFiles(TESTS_DIR).filter((file) => {
            if (specFilesFilter === "") {
                return true;
            }

            return file.startsWith(specFilesFilter);
        });

        execSync(`rm -rf ./cypress/results`);

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            process.stdout.write(`file: ${file} (${i + 1} of ${files.length})\n`);

            const currentTestFileMappings = `./recordings/mappings/mapping-${file}.json`;

            if (recording) {
                await wiremockStartRecording(wiremockHost, HOST);
            } else {
                await wiremockImportMappings(wiremockHost, currentTestFileMappings);
            }
            await wiremockMockLogRequests(wiremockHost);

            await new Promise((resolve) => {
                const cypressProcess = runCypress({
                    visual: false,
                    appHost: CYPRESS_HOST,
                    mockServer: wiremockHost,
                    authorization,
                    specFilesFilter: file,
                    workspaceId: testWorkspaceId,
                    config: recording ? "retries=0" : undefined, // override cypress.json and have no retries when recording, this breaks mappings storage
                });

                cypressProcess.on("exit", async (_e) => {
                    if (recording) {
                        process.stdout.write(`starting wiremock mappings export for: ${file}\n`);
                        const result = await wiremockStopRecording(wiremockHost);
                        await wiremockExportMappings(currentTestFileMappings, result);
                    }

                    resolve();
                });
            });
            await wiremockReset(wiremockHost);
        }

        if (recording) {
            sanitizeCredentials(specFilesFilter);
        }

        // all done, create github report
        execSync(`node ./scripts/create-github-report.js`);
    } catch (e) {
        process.stderr.write(`${e.toString()}\n`);
        process.exit(e);
    }
}

main();

#!/usr/bin/env node
// (C) 2021 GoodData Corporation

/*
This file is supposed to run within the Cypress container, controlling the execution of the isolated tests in docker-compose
 */
const dotenv = require("dotenv");

const childProcess = require("child_process");

const {
    wiremockStartRecording,
    wiremockStopRecording,
    wiremockMockLogRequests,
    wiremockWait,
} = require("./wiremock.js");

const {
    deleteRecordings,
    getRecordingsWorkspaceId,
    recordingsPresent,
    sanitizeCredentials,
    saveRecordingsWorkspaceId,
} = require("./recordings.js");
const { runCypress } = require("./cypress.js");
const wiremockHost = "backend-mock:8080";

async function main() {
    try {
        process.stderr.write("Running the isolated tests. Run only in docker-compose\n");
        const recording = process.argv.indexOf("--record") != -1;
        const filterArg = process.argv.find((arg) => arg.indexOf("--filter") === 0);
        const filter = filterArg ? filterArg.slice("--filter=".length) : "";

        dotenv.config({ path: ".env" });

        const { HOST, USER_NAME, PASSWORD, CYPRESS_HOST } = process.env;
        let { TEST_WORKSPACE_ID } = process.env;
        if (recording && !HOST && !USER_NAME && !PASSWORD && !TEST_WORKSPACE_ID) {
            process.stderr.write(
                "For recording HOST, USER_NAME, PASSWORD, and TEST_WORKSPACE_ID has to be specified in the .env file\n",
            );
            process.exit(e);
        }

        if (recording) {
            deleteRecordings();
        } else if (!recordingsPresent()) {
            process.stderr.write("Recordings are missing. Run again with the --record parameter.\n");
            process.exit(0);
        }

        process.stdout.write("Waiting for Wiremock\n");
        await wiremockWait(wiremockHost);
        process.stdout.write("Wiremock ready\n");

        if (recording) {
            saveRecordingsWorkspaceId(TEST_WORKSPACE_ID);
            await wiremockStartRecording(wiremockHost, HOST);
        } else {
            TEST_WORKSPACE_ID = getRecordingsWorkspaceId();
        }

        await wiremockMockLogRequests(wiremockHost);

        const cypressProcess = runCypress(
            false,
            CYPRESS_HOST,
            wiremockHost,
            recording,
            filter,
            TEST_WORKSPACE_ID,
            USER_NAME,
            PASSWORD,
        );

        console.log("Cypress process created.");

        cypressProcess.on("exit", async (e) => {
            if (recording) {
                await wiremockStopRecording(wiremockHost);
                sanitizeCredentials();
            }

            childProcess.execSync(`node scripts/create_github_report.js`);

            process.exit(e);
        });
    } catch (e) {
        process.stderr.write(`${e.toString()}\n`);
        process.exit(e);
    }
}

main();

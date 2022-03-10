#!/usr/bin/env node
// (C) 2021 GoodData Corporation

/**
 Run local instance of Cypress
 By default runs against local dev server.
 Parameter --with-recordings makes it run against local Wiremock server and dockerized KD.
 */
const { config } = require("dotenv");

const { runCypress } = require("./cypress.js");
const { getRecordingsWorkspaceId } = require("./recordings.js");

async function main() {
    const withRecordings = process.argv.indexOf("--with-recordings") !== -1;

    let host = "http://localhost:9500";

    let mockServer = withRecordings ? "localhost:8080" : undefined;

    config({ path: ".env" });

    const { USER_NAME, PASSWORD, TEST_WORKSPACE_ID } = process.env;

    if (!withRecordings && (!USER_NAME || !PASSWORD || !TEST_WORKSPACE_ID)) {
        process.stderr.write(
            "Cypress running in proxy mode needs USER_NAME, PASSWORD, and TEST_WORKSPACE_ID specified in the .env file\n",
        );
        return;
    }

    const authorization = {
        credentials: {
            userName: USER_NAME,
            password: PASSWORD,
        },
    };

    const workspaceId = withRecordings ? getRecordingsWorkspaceId() : TEST_WORKSPACE_ID;

    process.stderr.write("Running the isolated tests locally\n");
    runCypress({
        visual: true,
        appHost: host,
        mockServer: mockServer,
        authorization: authorization,
        workspaceId,
    });
}

main();

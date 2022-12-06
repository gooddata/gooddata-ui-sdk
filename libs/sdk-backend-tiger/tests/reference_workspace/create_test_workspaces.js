#!/usr/bin/env node
// (C) 2022 GoodData Corporation

fs = require("fs");
const path = require("path");

require("dotenv").config();

const {
    createTigerWorkspaceWithPrefix,
    defaultScanPublishPDMForDatasource,
    setTigerWorkspaceLayout,
} = require("@gooddata/fixtures");
const { log } = require("@gooddata/fixtures/logger.js");

const UISDK_EMPTY_WORKSPACE_PREFIX = "Test empty UISDK reference workspace";

const goodSalesLayoutFilePath = path.resolve(`./tests/reference_workspace/fixtures/layout/layout.json`);

async function setWorkspaceFixtures(workspaceId, fixtureFile, token, host, backend) {
    const fixtureContent = fs.readFileSync(fixtureFile);
    const declarativeWorkspaceModel = JSON.parse(fixtureContent);
    await setTigerWorkspaceLayout(workspaceId, token, host, backend, declarativeWorkspaceModel);
}

async function main() {
    try {
        const { HOST, SDK_BACKEND, TIGER_API_TOKEN, WORKSPACE_ID, TIGER_DATASOURCES_NAME } = process.env;
        if (!(HOST && TIGER_API_TOKEN)) {
            log("HOST, TIGER_API_TOKEN need to be set in the .env file\n");
            process.exit(1);
        }

        if (WORKSPACE_ID) {
            log(
                "WORKSPACE_ID is present in the .env file. Delete the workspace by running delete_tiger_workspace.js or remove the the record in .env\n",
            );
            process.exit(1);
        }
        const testWorkspaceId = await createTigerWorkspaceWithPrefix(
            UISDK_EMPTY_WORKSPACE_PREFIX,
            TIGER_API_TOKEN,
            HOST,
            SDK_BACKEND,
        );

        // scan
        await defaultScanPublishPDMForDatasource(TIGER_DATASOURCES_NAME, TIGER_API_TOKEN, HOST, SDK_BACKEND);

        // set layout for workspace
        await setWorkspaceFixtures(
            testWorkspaceId,
            goodSalesLayoutFilePath,
            TIGER_API_TOKEN,
            HOST,
            SDK_BACKEND,
        );

        fs.appendFileSync(".env", `\nWORKSPACE_ID=${testWorkspaceId}`);
        process.env.WORKSPACE_ID = testWorkspaceId;
        log(`test workspace id ${testWorkspaceId} added to the .env file\n`);
    } catch (e) {
        log(e.toString());
        // eslint-disable-next-line no-console
        console.error(e);
        process.exit(1);
    }
}

main();

#!/usr/bin/env node
// (C) 2022 GoodData Corporation

const fs = require("fs");

require("dotenv").config();

const { createTigerWorkspaceWithPrefix, setTigerWorkspaceLayoutFromFixtures } = require("@gooddata/fixtures");
const { log } = require("@gooddata/fixtures/logger.js");

const UISDK_WORKSPACE_PREFIX = "Test UISDK reference workspace";

async function main() {
    try {
        const { HOST, SDK_BACKEND, TIGER_API_TOKEN, WORKSPACE_ID, FIXTURE_TYPE, TIGER_DATASOURCES_NAME } =
            process.env;
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
            UISDK_WORKSPACE_PREFIX,
            TIGER_API_TOKEN,
            HOST,
            SDK_BACKEND,
        );

        // set layout from latest declarative layout on gdc-test-fixture
        await setTigerWorkspaceLayoutFromFixtures(
            testWorkspaceId,
            FIXTURE_TYPE,
            TIGER_DATASOURCES_NAME,
            TIGER_API_TOKEN,
            HOST,
            SDK_BACKEND,
            {},
        );

        fs.appendFileSync(".env", `\nWORKSPACE_ID=${testWorkspaceId}`);
        process.env.WORKSPACE_ID = testWorkspaceId;
        log(`WORKSPACE_ID ${testWorkspaceId} added to the .env file\n`);

        // update the workspace id also in the other files that need it hardcoded
        fs.writeFileSync(
            "./scripts/refresh-md.sh",
            fs
                .readFileSync("./scripts/refresh-md.sh", "utf8")
                .replace(/PROJECTID=".*"/, `PROJECTID="${testWorkspaceId}"`),
        );
        fs.writeFileSync(
            "./tests/integrated/backend.ts",
            fs
                .readFileSync("./tests/integrated/backend.ts", "utf8")
                .replace(/return ".*"; \/\/ update-marker/, `return "${testWorkspaceId}"; // update-marker`),
        );
    } catch (e) {
        log(e.toString());
        // eslint-disable-next-line no-console
        console.error(e);
        process.exit(1);
    }
}

main();

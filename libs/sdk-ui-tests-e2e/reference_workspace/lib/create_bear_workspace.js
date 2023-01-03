#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import fs from "fs";

import "../../scripts/env.js";

import { log } from "@gooddata/fixtures/logger.js";

import { exportCatalogBear } from "../export_catalog.js";

import { createWorkspace } from "./bear_workspace.js";

async function main() {
    try {
        const { USER_NAME, PASSWORD, HOST, AUTH_TOKEN, TEST_WORKSPACE_ID, FIXTURE_TYPE } = process.env;
        if (TEST_WORKSPACE_ID) {
            log(
                `TEST_WORKSPACE_ID=${TEST_WORKSPACE_ID} present in the .env file. Delete the workspace by running delete_bear_workspace.js or remove the the record in .env\n`,
            );
            return;
        }

        if (!(USER_NAME && PASSWORD && HOST && AUTH_TOKEN)) {
            log("USER_NAME, PASSWORD, HOST, AUTH_TOKEN need to be set in the .env file\n");
            return;
        }

        const fixtureName = FIXTURE_TYPE || "goodsales";
        const newReferenceWorkspaceId = await createWorkspace(
            fixtureName,
            USER_NAME,
            PASSWORD,
            HOST,
            AUTH_TOKEN,
        );

        log("Exporting metadata objects identifiers to local TypeScript file\n");
        exportCatalogBear(HOST, newReferenceWorkspaceId, USER_NAME, PASSWORD);

        fs.appendFileSync(".env", `TEST_WORKSPACE_ID=${newReferenceWorkspaceId}\n`, () => {
            log("TEST_WORKSPACE_ID added to the .env file\n");
        });
    } catch (e) {
        log(e.toString());
        process.exit(1);
    }
}

main();

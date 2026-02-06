#!/usr/bin/env node
// (C) 2021-2026 GoodData Corporation

import fs from "fs";
import "../../scripts/env.js";

import {
    createTigerWorkspaceWithPrefix,
    log,
    logLn,
    setTigerWorkspaceLayoutFromFixtures,
} from "@gooddata/fixtures";

import { retryOperation } from "./utils.js";
import {
    E2E_SDK_CHILD_WORKSPACE_PREFIX,
    E2E_SDK_WORKSPACE_PREFIX,
    TIGER_CHILD_WORKSPACE_FIXTURE_CATALOG,
    TIGER_FIXTURE_METADATA_EXTENSIONS,
} from "../constant.js";
import { exportCatalogTiger } from "../export_catalog.js";

const childWSOutputFile = TIGER_CHILD_WORKSPACE_FIXTURE_CATALOG["goodsales"];

async function createFixture(workspacePrefix, fixtureType, dataSource, token, host) {
    const backend = "TIGER"; // needed by methods from @gooddata/fixtures
    const workspaceId = await createTigerWorkspaceWithPrefix(workspacePrefix, token, host, backend);

    const tigerMetadataExtension = TIGER_FIXTURE_METADATA_EXTENSIONS[fixtureType];
    logLn(
        `Creating fixture. Type: ${fixtureType}, datasource: ${dataSource}, additional md objects: ${tigerMetadataExtension}`,
    );
    await setTigerWorkspaceLayoutFromFixtures(
        workspaceId,
        fixtureType,
        dataSource,
        token,
        host,
        backend,
        tigerMetadataExtension,
    );
    return workspaceId;
}

async function main() {
    try {
        const {
            HOST,
            TIGER_API_TOKEN,
            TEST_WORKSPACE_ID,
            TEST_CHILD_WORKSPACE_ID,
            TIGER_DATASOURCES_NAME,
            FIXTURE_TYPE = "goodsales",
        } = process.env;

        if (TEST_WORKSPACE_ID) {
            log(
                "TEST_WORKSPACE_ID is present in the .env file. Delete the workspace by running delete_tiger_workspace.js or remove the the record in .env\n",
            );
            return;
        }

        if (!(HOST && TIGER_API_TOKEN)) {
            log("HOST, TIGER_API_TOKEN need to be set in the .env file\n");
            return;
        }

        if (!(TIGER_DATASOURCES_NAME && FIXTURE_TYPE)) {
            log("TIGER_DATASOURCES_NAME, FIXTURE_TYPE need to be set\n");
            return;
        }

        const testReferenceWorkspaceId = await createFixture(
            E2E_SDK_WORKSPACE_PREFIX,
            FIXTURE_TYPE,
            TIGER_DATASOURCES_NAME,
            TIGER_API_TOKEN,
            HOST,
        );

        log("Exporting metadata objects identifiers to local TypeScript file\n");
        // retry to give Pg some time to replicate created WS to slaves
        await retryOperation(
            () => exportCatalogTiger(HOST, testReferenceWorkspaceId, TIGER_API_TOKEN),
            10,
            1000,
        );

        fs.appendFile(".env", `\nTEST_WORKSPACE_ID=${testReferenceWorkspaceId}`, () => {
            log(`TEST_WORKSPACE_ID ${testReferenceWorkspaceId} added to the .env file\n`);
        });

        if (FIXTURE_TYPE == "goodsales") {
            log("Preparing test children workspace\n");
            if (TEST_CHILD_WORKSPACE_ID) {
                log(
                    "TEST_CHILD_WORKSPACE_ID is present in the .env file. Delete the workspace by running delete_tiger_workspace.js or remove the the record in .env\n",
                );
                return;
            }

            const testChildReferenceWorkspaceId = await createTigerWorkspaceWithPrefix(
                E2E_SDK_CHILD_WORKSPACE_PREFIX,
                TIGER_API_TOKEN,
                HOST,
                "TIGER",
                testReferenceWorkspaceId,
            );
            fs.appendFile(".env", `\nTEST_CHILD_WORKSPACE_ID=${testChildReferenceWorkspaceId}`, () => {
                log("TEST_CHILD_WORKSPACE_ID are added to the .env file\n");
            });
            log("Exporting metadata objects identifiers to local TypeScript file\n");
            // retry to give Pg some time to replicate created WS to slaves
            await retryOperation(
                () =>
                    exportCatalogTiger(
                        HOST,
                        testChildReferenceWorkspaceId,
                        TIGER_API_TOKEN,
                        childWSOutputFile,
                    ),
                10,
                1000,
            );
        }
    } catch (e) {
        log(e.toString());
        console.error(e);
        process.exit(1);
    }
}

void main();

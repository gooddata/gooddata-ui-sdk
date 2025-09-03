#!/usr/bin/env node
// (C) 2021-2025 GoodData Corporation

import "../../scripts/env.js";
import { exportTigerFixtureExtension, logLn } from "@gooddata/fixtures";

import { runPrettierOnFile } from "./prettierUtils.js";
import { TIGER_FIXTURE_METADATA_EXTENSIONS } from "../constant.js";
import { exportCatalogTiger } from "../export_catalog.js";

async function main() {
    try {
        const { HOST, TIGER_API_TOKEN, TEST_WORKSPACE_ID, FIXTURE_TYPE } = process.env;

        if (!TEST_WORKSPACE_ID) {
            logLn("TEST_WORKSPACE_ID not specified in the .env file. Skipping.");
            return;
        }

        const outputFile = TIGER_FIXTURE_METADATA_EXTENSIONS["goodsales"];
        await exportTigerFixtureExtension(
            "goodsales",
            TEST_WORKSPACE_ID,
            TIGER_API_TOKEN,
            HOST,
            "TIGER",
            outputFile,
        );
        runPrettierOnFile(outputFile);

        if (FIXTURE_TYPE === "goodsales") {
            exportCatalogTiger(HOST, TEST_WORKSPACE_ID, TIGER_API_TOKEN);
        }

        logLn("Export workspace fixtures successfully");
    } catch (e) {
        logLn(e.toString());
        console.error(e);
    }
}

main();

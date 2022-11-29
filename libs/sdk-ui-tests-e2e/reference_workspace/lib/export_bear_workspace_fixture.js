#!/usr/bin/env node
// (C) 2021-2022 GoodData Corporation

import { exportBearFixture } from "@gooddata/fixtures";

import { BEAR_FIXTURE_METADATA_EXTENSIONS } from "../constant.js";
import { exportCatalogBear } from "../export_catalog.js";

import "../../scripts/env.js";
import { runPrettierOnFile } from "./prettierUtils.js";

const logError = (e) => {
    process.stderr.write(e.toString());
    process.stderr.write("\n");
};

async function main() {
    try {
        const { USER_NAME, PASSWORD, HOST, TEST_WORKSPACE_ID, FIXTURE_TYPE, TEMPORARY_OBJECT_TYPE } =
            process.env;

        const fixtureName = FIXTURE_TYPE || "goodsales";
        const fixtureVersion = fixtureName === "goodsales" ? 3 : null;
        const outputFile = BEAR_FIXTURE_METADATA_EXTENSIONS[fixtureName];
        const sanitizedHost = HOST.startsWith("http") ? HOST : `https://${HOST}`;

        if (!(USER_NAME && PASSWORD && HOST && TEST_WORKSPACE_ID)) {
            logError("USER_NAME, PASSWORD, HOST, TEST_WORKSPACE_ID need to be set in the .env");
            return;
        }

        if (sanitizedHost.indexOf("intgdc.com") !== -1) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }

        exportBearFixture(
            fixtureName,
            fixtureVersion,
            TEST_WORKSPACE_ID,
            USER_NAME,
            PASSWORD,
            HOST,
            TEMPORARY_OBJECT_TYPE,
            outputFile,
        );
        runPrettierOnFile(outputFile);

        exportCatalogBear(sanitizedHost, TEST_WORKSPACE_ID, USER_NAME, PASSWORD);
    } catch (e) {
        if (e.response) {
            logError(e.response.url);
            logError(e.response.status);
            logError(e.response.statusText);
        } else {
            logError(e);
        }
    }
}

main();
